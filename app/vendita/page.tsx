import Link from "next/link";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { raggruppaVenditore, tempoTrascorso } from "@/lib/vendita/sezioni";
import { PillStato } from "@/components/dashboard/PillStato";
import type { Lead } from "@/lib/dashboard/tipi";

export const dynamic = "force-dynamic";

type AziendaMini = { ragione_sociale: string; citta: string | null; segnali: string | null };

async function carica(): Promise<{ leads: Lead[]; aziende: Record<string, AziendaMini> }> {
  if (!supabaseConfigurato()) return { leads: [], aziende: {} };
  const supabase = createClient();
  // RLS (§011): il venditore riceve SOLO i lead a lui assegnati e le sole aziende collegate.
  const [leadRes, azRes] = await Promise.all([
    supabase.from("leads").select("*").order("assegnato_il", { ascending: true }),
    supabase.from("aziende").select("id, ragione_sociale, citta, segnali").limit(500),
  ]);
  const aziende: Record<string, AziendaMini> = {};
  for (const a of (azRes.data ?? []) as (AziendaMini & { id: string })[]) aziende[a.id] = a;
  return { leads: (leadRes.data ?? []) as Lead[], aziende };
}

export default async function VenditaPage() {
  if (!supabaseConfigurato()) {
    return <p className="text-sm text-testo-chiaro/55">Servizio non configurato.</p>;
  }
  const { leads, aziende } = await carica();
  const g = raggruppaVenditore(leads);
  const now = Date.now();
  const totale = g.da_prendere.length + g.in_corso.length + g.in_gestione.length;

  if (totale === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-nero/15 bg-carta p-8 text-center text-sm text-testo-chiaro/55">
        Nessun lead assegnato al momento.
      </p>
    );
  }

  return (
    <div className="space-y-7">
      <Sezione titolo="Da prendere in carico" leads={g.da_prendere} aziende={aziende} now={now} conTempo />
      <Sezione titolo="In corso" leads={g.in_corso} aziende={aziende} now={now} />
      <Sezione titolo="In gestione" leads={g.in_gestione} aziende={aziende} now={now} />
    </div>
  );
}

function Sezione({
  titolo,
  leads,
  aziende,
  now,
  conTempo,
}: {
  titolo: string;
  leads: Lead[];
  aziende: Record<string, AziendaMini>;
  now: number;
  conTempo?: boolean;
}) {
  if (leads.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-oro">{titolo}</h2>
      <div className="space-y-3">
        {leads.map((l) => {
          const az = l.azienda_id ? aziende[l.azienda_id] : undefined;
          const nome = az?.ragione_sociale ?? l.ragione_sociale;
          const citta = az?.citta ?? l.provincia;
          const gancio = az?.segnali;
          return (
            <Link
              key={l.id}
              href={`/vendita/${l.id}`}
              className="block rounded-2xl border border-nero/10 bg-carta p-4 active:bg-avorio"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">
                  {nome} <span className="text-testo-chiaro/50">· {citta ?? "—"}</span>
                </p>
                <PillStato stato={l.stato} />
              </div>
              {gancio && <p className="mt-1 truncate text-sm text-testo-chiaro/65">{gancio}</p>}
              {conTempo && (
                <p className="mt-1 text-xs font-medium text-oro">
                  assegnato da {tempoTrascorso(l.assegnato_il, now)}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
