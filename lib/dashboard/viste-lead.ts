// Logica pura delle 3 viste di Casa base (§PR-3 / spec-casa-base-lead). Le viste
// sono scorciatoie sopra gli stessi stati: qui vive la classificazione, i giorni
// nello stato e gli alert. Testata a parte.

import type { Lead, StatoLead } from "./tipi";

export type Vista = "da_smistare" | "in_gestione" | "chiusi";

// In gestione: la pipeline viva. contattato resta come ponte di compatibilità.
export const STATI_GESTIONE: StatoLead[] = [
  "assegnato",
  "preso_in_carico",
  "contattato",
  "preventivo_inviato",
  "in_sospeso",
];
export const STATI_CHIUSI: StatoLead[] = ["chiuso", "perso"];

export function vistaDi(stato: StatoLead): Vista {
  if (stato === "nuovo") return "da_smistare";
  if (STATI_CHIUSI.includes(stato)) return "chiusi";
  return "in_gestione";
}

export function raggruppaViste(leads: Lead[]): Record<Vista, Lead[]> {
  const g: Record<Vista, Lead[]> = { da_smistare: [], in_gestione: [], chiusi: [] };
  for (const l of leads) g[vistaDi(l.stato)].push(l);
  return g;
}

/** Giorni interi trascorsi nello stato attuale (da aggiornato_il, fallback created_at). */
export function giorniNelloStato(lead: Pick<Lead, "aggiornato_il" | "created_at">, nowMs: number): number {
  const rif = lead.aggiornato_il ?? lead.created_at;
  const ms = nowMs - new Date(rif).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

/**
 * Alert visivo in gestione (§spec): `assegnato` fermo da più di 1 giorno senza presa
 * in carico; `preventivo_inviato` o `in_sospeso` fermi da più di 7 giorni.
 */
export function alertGestione(
  lead: Pick<Lead, "stato" | "aggiornato_il" | "created_at">,
  nowMs: number,
): boolean {
  const g = giorniNelloStato(lead, nowMs);
  if (lead.stato === "assegnato") return g > 1;
  if (lead.stato === "preventivo_inviato" || lead.stato === "in_sospeso") return g > 7;
  return false;
}

export type Sorgente = "form" | "risposta";

/** Sorgente del lead: `risposta` se nato da un'azienda del magazzino, altrimenti `form`. */
export function sorgenteDi(lead: Pick<Lead, "azienda_id">): Sorgente {
  return lead.azienda_id ? "risposta" : "form";
}
