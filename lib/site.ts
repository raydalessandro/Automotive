// Configurazione globale del sito.

export const SITE = {
  nome: "Impero Automotive",
  // Forma breve del brand (usata nel copy discorsivo). Rebrand = cambio qui.
  nomeBreve: "Impero",
  claim: "L'auto della tua attività. Rata fissa, tutto incluso, anticipo zero.",
  descrizione:
    "Noleggio a lungo termine per partite IVA e aziende. Assicurazione, bollo, manutenzione e assistenza in un unico canone mensile.",
  // Micro-copy fisso ovunque compaia un prezzo (§10).
  microPrezzo: "al mese + IVA · tutti i servizi inclusi",
  footerLegale:
    "Canoni IVA esclusa. Offerte soggette a disponibilità dei veicoli e ad approvazione del credito. Immagini indicative.",
} as const;

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}
