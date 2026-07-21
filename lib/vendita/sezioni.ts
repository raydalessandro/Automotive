// Logica pura della PWA venditori (§PR-4 / spec-app-agenti). Le tre sezioni per
// urgenza e il tempo trascorso. Testata a parte. Nessun accesso a DB o UI qui.

import type { StatoLead } from "@/lib/dashboard/tipi";

export type SezioneVenditore = "da_prendere" | "in_corso" | "in_gestione";

// Ordine di urgenza (spec Schermata 1). nuovo/chiuso/perso NON compaiono nella PWA.
export function sezioneVenditore(stato: StatoLead): SezioneVenditore | null {
  if (stato === "assegnato") return "da_prendere";
  if (stato === "preso_in_carico" || stato === "contattato") return "in_corso";
  if (stato === "preventivo_inviato" || stato === "in_sospeso") return "in_gestione";
  return null;
}

export type LeadSezione = { stato: StatoLead };

/** Raggruppa i lead nelle tre sezioni (i non pertinenti vengono scartati). */
export function raggruppaVenditore<T extends LeadSezione>(
  leads: T[],
): Record<SezioneVenditore, T[]> {
  const g: Record<SezioneVenditore, T[]> = { da_prendere: [], in_corso: [], in_gestione: [] };
  for (const l of leads) {
    const s = sezioneVenditore(l.stato);
    if (s) g[s].push(l);
  }
  return g;
}

/** Tempo trascorso leggibile ("meno di un'ora" · "3 ore" · "2 giorni") da un ISO. */
export function tempoTrascorso(daIso: string | null, nowMs: number): string {
  if (!daIso) return "—";
  const ms = nowMs - new Date(daIso).getTime();
  if (ms < 0) return "poco fa";
  const ore = Math.floor(ms / 3_600_000);
  if (ore < 1) return "meno di un'ora";
  if (ore < 24) return `${ore} ${ore === 1 ? "ora" : "ore"}`;
  const giorni = Math.floor(ore / 24);
  return `${giorni} ${giorni === 1 ? "giorno" : "giorni"}`;
}
