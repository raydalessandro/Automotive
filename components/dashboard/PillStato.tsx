import { LABEL_STATO_LEAD, type StatoLead } from "@/lib/dashboard/tipi";

// Pill di stato (§PR-3): palette esistente della dashboard, nessun colore nuovo.
// Stati "vivi" (preventivo/in sospeso) in oro; chiuso pieno; perso spento; resto neutro.
const TONO: Record<StatoLead, string> = {
  nuovo: "bg-nero/5 text-testo-chiaro/70",
  contattato: "bg-nero/5 text-testo-chiaro/70",
  assegnato: "bg-nero/5 text-testo-chiaro/70",
  preso_in_carico: "bg-nero/10 text-testo-chiaro/80",
  preventivo_inviato: "bg-oro/15 text-oro",
  in_sospeso: "bg-oro/15 text-oro",
  chiuso: "bg-nero text-testo-scuro",
  perso: "bg-nero/10 text-testo-chiaro/45",
};

export function PillStato({ stato }: { stato: StatoLead }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${TONO[stato]}`}>
      {LABEL_STATO_LEAD[stato]}
    </span>
  );
}
