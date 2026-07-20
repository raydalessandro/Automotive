// Registry degli id sezione (§PR29): niente stringhe sparse. L'ordine è quello
// in pagina — la dashboard lo usa per il grafico drop-off di lettura.

export type Sezione = { id: string; label: string };

// Home v2 (§spec Home). Ordine = ordine di scorrimento (hero escluso: sempre visto).
export const SEZIONI_HOME: Sezione[] = [
  { id: "metodo", label: "Come lavoriamo con te" },
  { id: "segmenti", label: "Per la tua attività" },
  { id: "veicoli", label: "I conti già fatti" },
  { id: "servizi", label: "Tutto nel canone" },
  { id: "confronto", label: "Noleggio o acquisto" },
  { id: "anticipo", label: "Anticipo zero" },
  { id: "non_ci_pensi", label: "Non ci pensi più" },
  { id: "faq", label: "Domande frequenti" },
  { id: "cta_finale", label: "CTA finale" },
];

// Landing di segmento.
export const SEZIONI_LANDING: Sezione[] = [
  { id: "hero", label: "Hero" },
  { id: "veicoli", label: "Veicoli" },
  { id: "anticipo", label: "Anticipo zero" },
  { id: "faq", label: "Domande frequenti" },
  { id: "cta_finale", label: "CTA finale" },
];
