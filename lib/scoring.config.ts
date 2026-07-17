// Scoring lead — §5 della spec. Mostrato SOLO nella notifica, mai all'utente.
// Modificabile senza toccare la logica.

import type { DatiLead } from "./lead/schema";

export const SCORE_HOT_SOGLIA = 3;

export function calcolaScore(d: Pick<DatiLead, "forma_giuridica" | "anni_attivita" | "n_veicoli">): number {
  let s = 0;

  // Forma giuridica
  switch (d.forma_giuridica) {
    case "srl_spa":
    case "snc_sas":
      s += 2;
      break;
    case "agente":
    case "ditta_individuale":
      s += 1;
      break;
    case "forfettario":
    default:
      s += 0;
  }

  // Anni di attività
  switch (d.anni_attivita) {
    case "oltre_5":
      s += 2;
      break;
    case "3_5":
      s += 1;
      break;
    case "meno_1":
      s -= 1;
      break;
    // 1_2 → 0
  }

  // Numero veicoli
  switch (d.n_veicoli) {
    case "6_piu":
      s += 2;
      break;
    case "2_5":
      s += 1;
      break;
    // 1 → 0
  }

  return s;
}

export function isHot(score: number): boolean {
  return score >= SCORE_HOT_SOGLIA;
}
