"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Lead, type StatoLead } from "@/lib/dashboard/tipi";
import {
  raggruppaViste,
  vistaDi,
  giorniNelloStato,
  alertGestione,
  sorgenteDi,
  type Vista,
} from "@/lib/dashboard/viste-lead";
import { LeadDettaglio } from "./LeadDettaglio";
import { PillStato } from "./PillStato";
import { SmistaMenu, type VenditoreOpt } from "./SmistaMenu";
import { scartaLead } from "@/app/app/(dash)/lead/actions";
import { MOTIVI_PERSO, labelMotivo, type DettagliPerso } from "@/lib/lead/esiti";

// Arricchimento card dal magazzino aziende (§PR-3): risposta outreach.
export type AziendaCard = {
  ragione_sociale: string;
  segmento: string | null;
  settore: string | null;
  score: number | null;
  segnali: string | null;
  citta: string | null;
};

const TAB: { id: Vista; label: string }[] = [
  { id: "da_smistare", label: "Da smistare" },
  { id: "in_gestione", label: "In gestione" },
  { id: "chiusi", label: "Chiusi" },
];

export function InboxLead({
  iniziali,
  venditori,
  aziende,
  statoIniziale,
  apriIniziale,
}: {
  iniziali: Lead[];
  venditori: VenditoreOpt[];
  aziende: Record<string, AziendaCard>;
  statoIniziale?: StatoLead;
  apriIniziale?: string;
}) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(iniziali);
  // ?stato= resta funzionante: apre la vista che contiene quello stato.
  const [tab, setTab] = useState<Vista>(statoIniziale ? vistaDi(statoIniziale) : "da_smistare");
  const [selezionato, setSelezionato] = useState<string | null>(apriIniziale ?? null);
  // Dettagli del "perso" (§PR-6) per lead, letti via client (RLS operatore: vede tutto).
  const [motiviPerso, setMotiviPerso] = useState<Record<string, DettagliPerso>>({});

  useEffect(() => setLeads(iniziali), [iniziali]);

  // Motivi del perso: ultima riga di storia con dettagli per ogni lead. Degrada a vuoto
  // se la colonna (§012) non è ancora applicata — la UI resta identica a prima.
  useEffect(() => {
    const supabase = createClient();
    let vivo = true;
    supabase
      .from("lead_stati_storia")
      .select("lead_id, dettagli, ts")
      .not("dettagli", "is", null)
      .order("ts", { ascending: false })
      .then(({ data, error }) => {
        if (!vivo || error || !data) return;
        const m: Record<string, DettagliPerso> = {};
        for (const r of data as { lead_id: string; dettagli: DettagliPerso }[]) {
          if (r.dettagli && !m[r.lead_id]) m[r.lead_id] = r.dettagli; // primo = più recente
        }
        setMotiviPerso(m);
      });
    return () => {
      vivo = false;
    };
  }, [leads]);

  // Realtime: nuovi lead e aggiornamenti compaiono senza refresh.
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
    const timer = setInterval(() => router.refresh(), 60000);
    return () => {
      supabase.removeChannel(canale);
      clearInterval(timer);
    };
  }, [router]);

  const viste = useMemo(() => raggruppaViste(leads), [leads]);
  const nomeVenditore = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of venditori) m.set(v.id, v.nome ?? "Senza nome");
    return m;
  }, [venditori]);

  const lead = selezionato ? leads.find((l) => l.id === selezionato) ?? null : null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Lead</h1>

      {/* Tab delle tre viste, con contatore su Da smistare */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {TAB.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
              tab === t.id ? "bg-nero text-testo-scuro" : "bg-nero/5 text-testo-chiaro/70 hover:bg-nero/10"
            }`}
          >
            {t.label}
            {t.id === "da_smistare" && ` (${viste.da_smistare.length})`}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className={selezionato ? "hidden lg:block" : ""}>
          {tab === "da_smistare" && (
            <ListaDaSmistare
              leads={viste.da_smistare}
              aziende={aziende}
              venditori={venditori}
              onApri={setSelezionato}
              onScarta={(id) => scartaLead(id).then(() => router.refresh())}
            />
          )}
          {tab === "in_gestione" && (
            <ListaGestione leads={viste.in_gestione} nomeVenditore={nomeVenditore} onApri={setSelezionato} />
          )}
          {tab === "chiusi" && (
            <ListaChiusi leads={viste.chiusi} motiviPerso={motiviPerso} onApri={setSelezionato} />
          )}
        </div>

        <div className={selezionato ? "" : "hidden lg:block"}>
          {lead ? (
            <div className="rounded-2xl border border-nero/10 bg-carta lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)]">
              <LeadDettaglio
                lead={lead}
                venditori={venditori}
                dettagliPerso={motiviPerso[lead.id] ?? null}
                onChiudi={() => setSelezionato(null)}
              />
            </div>
          ) : (
            <div className="hidden h-full items-center justify-center rounded-2xl border border-dashed border-nero/15 bg-carta p-8 text-center text-sm text-testo-chiaro/45 lg:flex">
              Seleziona un lead per vederne il brief.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ————————————————————————————————— Vista 1: Da smistare —————————————————————————————————

function ListaDaSmistare({
  leads,
  aziende,
  venditori,
  onApri,
  onScarta,
}: {
  leads: Lead[];
  aziende: Record<string, AziendaCard>;
  venditori: VenditoreOpt[];
  onApri: (id: string) => void;
  onScarta: (id: string) => void;
}) {
  if (leads.length === 0) return <Vuoto testo="Nessun lead da smistare." />;
  return (
    <div className="space-y-3">
      {leads.map((l) => {
        const az = l.azienda_id ? aziende[l.azienda_id] : undefined;
        const sorgente = sorgenteDi(l);
        const citta = az?.citta ?? l.provincia;
        const segmento = az?.segmento ?? "—";
        const settore = az?.settore ?? l.settore ?? "—";
        const score = az?.score ?? l.score;
        const segnali = az?.segnali;
        return (
          <div key={l.id} className="rounded-2xl border border-nero/10 bg-carta p-4">
            <button onClick={() => onApri(l.id)} className="block w-full text-left">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">
                  {l.ragione_sociale} <span className="text-testo-chiaro/50">· {citta}</span>
                </p>
                <span className="shrink-0 rounded-full bg-nero/5 px-2 py-0.5 text-xs text-testo-chiaro/60">
                  {sorgente === "risposta" ? "risposta ✉" : "form sito"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-testo-chiaro/55">
                {segmento} · {settore} · score {score ?? "—"}
              </p>
              {segnali && <p className="mt-1 truncate text-sm text-testo-chiaro/70">{segnali}</p>}
              {sorgente === "risposta" && l.note && (
                <p className="mt-1 truncate text-sm text-testo-chiaro/80">
                  Ha risposto: &laquo;{l.note}&raquo;
                </p>
              )}
            </button>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => onScarta(l.id)}
                className="rounded-full border border-nero/15 px-3 py-1.5 text-sm text-testo-chiaro/60 hover:border-oro/50"
              >
                Scarta
              </button>
              <SmistaMenu leadId={l.id} venditori={venditori} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ————————————————————————————————— Vista 2: In gestione —————————————————————————————————

function ListaGestione({
  leads,
  nomeVenditore,
  onApri,
}: {
  leads: Lead[];
  nomeVenditore: Map<string, string>;
  onApri: (id: string) => void;
}) {
  if (leads.length === 0) return <Vuoto testo="Nessun lead in gestione." />;
  const now = Date.now();
  // Raggruppa per venditore assegnato.
  const gruppi = new Map<string, Lead[]>();
  for (const l of leads) {
    const k = l.assegnato_a ?? "—";
    if (!gruppi.has(k)) gruppi.set(k, []);
    gruppi.get(k)!.push(l);
  }
  return (
    <div className="space-y-5">
      {[...gruppi.entries()].map(([k, ls]) => (
        <div key={k}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-testo-chiaro/50">
            {k === "—" ? "Non assegnati" : nomeVenditore.get(k) ?? "Venditore"}
          </p>
          <ul className="divide-y divide-nero/10 overflow-hidden rounded-2xl border border-nero/10 bg-carta">
            {ls.map((l) => {
              const g = giorniNelloStato(l, now);
              const alert = alertGestione(l, now);
              return (
                <li key={l.id}>
                  <button
                    onClick={() => onApri(l.id)}
                    className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-avorio/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {alert && <span className="mr-1 text-oro">●</span>}
                        {l.ragione_sociale}
                      </p>
                      <p className="truncate text-xs text-testo-chiaro/50">{l.note ?? "—"}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <PillStato stato={l.stato} />
                      <span className="w-12 text-right text-xs tabular text-testo-chiaro/45">{g} gg</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ————————————————————————————————— Vista 3: Chiusi —————————————————————————————————

function ListaChiusi({
  leads,
  motiviPerso,
  onApri,
}: {
  leads: Lead[];
  motiviPerso: Record<string, DettagliPerso>;
  onApri: (id: string) => void;
}) {
  const [filtro, setFiltro] = useState<string>("tutti");

  // Solo i motivi effettivamente presenti tra i chiusi diventano chip di filtro.
  const motiviPresenti = useMemo(() => {
    const set = new Set<string>();
    for (const l of leads) motiviPerso[l.id]?.motivi.forEach((m) => set.add(m));
    return MOTIVI_PERSO.filter((m) => set.has(m.id));
  }, [leads, motiviPerso]);

  const visibili = useMemo(
    () =>
      filtro === "tutti"
        ? leads
        : leads.filter((l) => motiviPerso[l.id]?.motivi.some((m) => m === filtro)),
    [leads, motiviPerso, filtro],
  );

  if (leads.length === 0) return <Vuoto testo="Nessun lead chiuso in questo periodo." />;

  return (
    <div>
      {motiviPresenti.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <FiltroChip attivo={filtro === "tutti"} onClick={() => setFiltro("tutti")}>
            Tutti
          </FiltroChip>
          {motiviPresenti.map((m) => (
            <FiltroChip key={m.id} attivo={filtro === m.id} onClick={() => setFiltro(m.id)}>
              {m.label}
            </FiltroChip>
          ))}
        </div>
      )}

      {visibili.length === 0 ? (
        <Vuoto testo="Nessun lead con questo motivo." />
      ) : (
        <ul className="divide-y divide-nero/10 overflow-hidden rounded-2xl border border-nero/10 bg-carta">
          {visibili.map((l) => {
            const d = motiviPerso[l.id];
            return (
              <li key={l.id}>
                <button
                  onClick={() => onApri(l.id)}
                  className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-avorio/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{l.ragione_sociale}</p>
                    {d && d.motivi.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {d.motivi.map((m) => (
                          <span
                            key={m}
                            className="rounded-full bg-nero/5 px-2 py-0.5 text-[11px] text-testo-chiaro/70"
                          >
                            {labelMotivo(m)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="truncate text-xs text-testo-chiaro/50">{l.note ?? "—"}</p>
                    )}
                  </div>
                  <PillStato stato={l.stato} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FiltroChip({
  attivo,
  onClick,
  children,
}: {
  attivo: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors ${
        attivo ? "bg-nero text-testo-scuro" : "bg-nero/5 text-testo-chiaro/70 hover:bg-nero/10"
      }`}
    >
      {children}
    </button>
  );
}

function Vuoto({ testo }: { testo: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-nero/15 bg-carta p-8 text-center text-sm text-testo-chiaro/55">
      {testo}
    </p>
  );
}
