import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { caricaAziendaVendita, caricaStoriaVendita } from "../actions";
import { AzioniScheda } from "@/components/vendita/AzioniScheda";
import { PillStato } from "@/components/dashboard/PillStato";
import { LABEL_STATO_LEAD, type Lead } from "@/lib/dashboard/tipi";

export const dynamic = "force-dynamic";

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
}

export default async function SchedaVendita({ params }: { params: { id: string } }) {
  if (!supabaseConfigurato()) notFound();
  const supabase = createClient();
  // RLS (§011): se il lead non è assegnato a questo venditore, non torna nulla → 404.
  const { data } = await supabase.from("leads").select("*").eq("id", params.id).maybeSingle();
  const lead = data as Lead | null;
  if (!lead) notFound();

  const [azienda, storia] = await Promise.all([
    lead.azienda_id ? caricaAziendaVendita(lead.azienda_id) : Promise.resolve(null),
    caricaStoriaVendita(lead.id),
  ]);

  const nome = azienda?.ragione_sociale ?? lead.ragione_sociale;
  const telefono = azienda?.telefono ?? lead.telefono;
  const rispostaIniziale = storia.find((t) => t.nota)?.nota ?? lead.note ?? null;
  const linkConto = `/calcolatore?forma=${encodeURIComponent(lead.forma_giuridica)}${
    lead.veicolo_id ? `&veicolo=${encodeURIComponent(lead.veicolo_id)}` : ""
  }`;

  return (
    <div className="space-y-5">
      <Link href="/vendita" className="text-sm text-testo-chiaro/50">
        ← I miei lead
      </Link>

      {/* Testata */}
      <div className="flex items-start justify-between gap-2">
        <h1 className="font-display text-2xl font-semibold">{nome}</h1>
        <PillStato stato={lead.stato} />
      </div>

      {/* 1 · Chi sono */}
      <Blocco titolo="Chi sono">
        <p>
          {azienda?.citta ?? lead.provincia ?? "—"}
          {azienda?.provincia ? ` (${azienda.provincia})` : ""} · {azienda?.settore ?? lead.settore ?? "—"} ·{" "}
          {azienda?.dimensione_stimata ?? "—"}
        </p>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          {telefono && telefono !== "—" && (
            <a href={`tel:${telefono}`} className="font-medium text-oro underline">
              {telefono}
            </a>
          )}
          {azienda?.sito && (
            <a href={azienda.sito} target="_blank" rel="noopener noreferrer" className="text-oro underline">
              sito
            </a>
          )}
        </p>
      </Blocco>

      {/* 2 · Perché li abbiamo contattati */}
      <Blocco titolo="Perché li abbiamo contattati">
        <p>{azienda?.segnali ?? "—"}</p>
        <p className="mt-1 text-testo-chiaro/55">score {azienda?.score ?? lead.score ?? "—"}</p>
      </Blocco>

      {/* 3 · Cosa gli abbiamo detto */}
      <Blocco titolo="Cosa gli abbiamo detto">
        <p className="text-testo-chiaro/55">
          Il gancio usato nel primo contatto. — (dal playbook di primo contatto)
        </p>
      </Blocco>

      {/* 4 · Cosa hanno risposto */}
      <Blocco titolo="Cosa hanno risposto">
        <p>{rispostaIniziale ? `«${rispostaIniziale}»` : "—"}</p>
      </Blocco>

      {/* 5 · Con che conto arrivare */}
      <Blocco titolo="Con che conto arrivare">
        <Link href={linkConto} className="btn-oro inline-flex min-h-[48px] items-center px-5">
          Condividi il conto
        </Link>
      </Blocco>

      {/* Azioni (dipendono dallo stato) */}
      <AzioniScheda leadId={lead.id} stato={lead.stato} />

      {/* 6 · Timeline */}
      <Blocco titolo="Timeline">
        {storia.length === 0 ? (
          <p className="text-testo-chiaro/45">—</p>
        ) : (
          <ol className="space-y-2 border-l border-nero/10 pl-4">
            {storia.map((t, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-oro/60" />
                <span className="font-medium">{LABEL_STATO_LEAD[t.stato as Lead["stato"]] ?? t.stato}</span>
                <span className="ml-2 text-xs text-testo-chiaro/40">{fmt(t.ts)}</span>
                {t.nota && <p className="text-sm text-testo-chiaro/70">{t.nota}</p>}
              </li>
            ))}
          </ol>
        )}
      </Blocco>
    </div>
  );
}

function Blocco({ titolo, children }: { titolo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-nero/10 bg-carta p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-testo-chiaro/45">{titolo}</p>
      <div className="mt-1.5 text-sm text-testo-chiaro/85">{children}</div>
    </section>
  );
}
