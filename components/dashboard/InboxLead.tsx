"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { STATI_LEAD, LABEL_STATO_LEAD, type Lead, type StatoLead } from "@/lib/dashboard/tipi";
import { LeadDettaglio } from "./LeadDettaglio";

type Filtro = StatoLead | "tutti";

export function InboxLead({
  iniziali,
  statoIniziale = "tutti",
  apriIniziale,
}: {
  iniziali: Lead[];
  statoIniziale?: Filtro;
  apriIniziale?: string;
}) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(iniziali);
  const [filtro, setFiltro] = useState<Filtro>(statoIniziale);
  const [selezionato, setSelezionato] = useState<string | null>(apriIniziale ?? null);

  // Ri-seed quando il server rifornisce dati aggiornati (azioni, polling).
  useEffect(() => setLeads(iniziali), [iniziali]);

  // Realtime: nuovi lead e aggiornamenti compaiono senza refresh (§3).
  useEffect(() => {
    const supabase = createClient();
    const canale = supabase
      .channel("leads-inbox")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload) => {
        const nuovo = payload.new as Lead;
        setLeads((prev) => (prev.some((l) => l.id === nuovo.id) ? prev : [nuovo, ...prev]));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leads" }, (payload) => {
        const agg = payload.new as Lead;
        setLeads((prev) => prev.map((l) => (l.id === agg.id ? agg : l)));
      })
      .subscribe();

    // Fallback: polling 60s (rifetch server) se il realtime non riceve.
    const timer = setInterval(() => router.refresh(), 60000);

    return () => {
      supabase.removeChannel(canale);
      clearInterval(timer);
    };
  }, [router]);

  const conteggi = useMemo(() => {
    const c: Record<string, number> = { tutti: leads.length };
    for (const s of STATI_LEAD) c[s] = 0;
    for (const l of leads) c[l.stato] = (c[l.stato] ?? 0) + 1;
    return c;
  }, [leads]);

  const visibili = useMemo(
    () => (filtro === "tutti" ? leads : leads.filter((l) => l.stato === filtro)),
    [leads, filtro],
  );

  const lead = selezionato ? leads.find((l) => l.id === selezionato) ?? null : null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Inbox lead</h1>

      {/* Filtri stato */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Chip label={`Tutti (${conteggi.tutti})`} attivo={filtro === "tutti"} onClick={() => setFiltro("tutti")} />
        {STATI_LEAD.map((s) => (
          <Chip
            key={s}
            label={`${LABEL_STATO_LEAD[s]} (${conteggi[s] ?? 0})`}
            attivo={filtro === s}
            onClick={() => setFiltro(s)}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Lista */}
        <div className={selezionato ? "hidden lg:block" : ""}>
          {visibili.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-nero/15 bg-carta p-8 text-center text-sm text-testo-chiaro/55">
              Nessun lead in questa vista.
            </p>
          ) : (
            <ul className="divide-y divide-nero/10 overflow-hidden rounded-2xl border border-nero/10 bg-carta">
              {visibili.map((l) => {
                const hot = l.score != null && l.score >= 3;
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => setSelezionato(l.id)}
                      className={`flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-avorio/60 ${
                        selezionato === l.id ? "bg-avorio" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {l.ragione_sociale}
                          {hot && (
                            <span className="ml-2 rounded-full bg-oro/15 px-2 py-0.5 text-xs font-semibold text-oro">
                              HOT
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-testo-chiaro/55">
                          {l.provincia} · {l.telefono} · {LABEL_STATO_LEAD[l.stato] ?? l.stato}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-testo-chiaro/40">
                        {new Date(l.created_at).toLocaleDateString("it-IT")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Dettaglio */}
        <div className={selezionato ? "" : "hidden lg:block"}>
          {lead ? (
            <div className="rounded-2xl border border-nero/10 bg-carta lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)]">
              <LeadDettaglio lead={lead} onChiudi={() => setSelezionato(null)} />
            </div>
          ) : (
            <div className="hidden h-full items-center justify-center rounded-2xl border border-dashed border-nero/15 bg-carta p-8 text-center text-sm text-testo-chiaro/45 lg:flex">
              Seleziona un lead per vederne il dettaglio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ label, attivo, onClick }: { label: string; attivo: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
        attivo ? "bg-nero text-testo-scuro" : "bg-nero/5 text-testo-chiaro/70 hover:bg-nero/10"
      }`}
    >
      {label}
    </button>
  );
}
