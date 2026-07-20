// Configurazione globale del sito.

export const SITE = {
  nome: "Impero Automotive",
  // Forma breve del brand (usata nel copy discorsivo). Rebrand = cambio qui.
  nomeBreve: "Impero",
  claim: "Prima facciamo i conti. Poi scegliamo la macchina.",
  descrizione:
    "Ti aiutiamo a prendere la decisione economicamente giusta sull'auto della tua attività: conti fatti davanti a te, costo reale sul tuo regime fiscale, una persona vera che ti richiama in giornata.",
  // Micro-copy fisso ovunque compaia un prezzo (§10).
  microPrezzo: "al mese + IVA · tutti i servizi inclusi",
  footerLegale:
    "Canoni IVA esclusa. Offerte soggette a disponibilità dei veicoli e ad approvazione del credito. Immagini indicative.",
} as const;

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}
