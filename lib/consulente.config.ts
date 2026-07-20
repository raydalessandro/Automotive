// ============================================================================
// IL CONSULENTE — §2 della spec. Config: le 5 domande + le mappature.
// Layer di orchestrazione sopra i motori esistenti (catalogo, fiscale, servizi):
// niente motori nuovi. Le mappature vivono QUI, non nel codice del motore.
// ============================================================================

import { PROFILI, type ProfiloId } from "./fiscale.config";
import type { Segmento } from "./servizi.config";

// --- Le cinque risposte (una per schermata) ---
export type Attivita = "artigiano" | "agente" | "pmi" | "professionista";
export type KmFascia = "fino_10" | "10_20" | "20_30" | "oltre_30";
export type Trasporto = "spesso" | "a_volte" | "no";
export type Forfettario = "si" | "no" | "non_so";
export type Priorita = "rata" | "pensieri" | "fiscale";

export type Risposte = {
  attivita: Attivita;
  km: KmFascia;
  trasporto: Trasporto;
  forfettario: Forfettario;
  priorita: Priorita;
};

// --- Le domande per il wizard (UI + motore condividono le opzioni) ---
export type Opzione = { id: string; label: string; sub?: string };
export type Domanda = { chiave: keyof Risposte; testo: string; opzioni: Opzione[] };

export const DOMANDE: Domanda[] = [
  {
    chiave: "attivita",
    testo: "Che attività fai?",
    opzioni: [
      { id: "artigiano", label: "Artigiano o installatore", sub: "Lavoro con materiale e attrezzatura" },
      { id: "agente", label: "Agente o sempre in giro", sub: "Passo le giornate dai clienti" },
      { id: "pmi", label: "Azienda con dipendenti", sub: "Ho una o più persone in organico" },
      { id: "professionista", label: "Libero professionista", sub: "Freelance o studio" },
    ],
  },
  {
    chiave: "km",
    testo: "Quanti km fai in un anno?",
    opzioni: [
      { id: "fino_10", label: "Fino a 10.000" },
      { id: "10_20", label: "10.000 – 20.000" },
      { id: "20_30", label: "20.000 – 30.000" },
      { id: "oltre_30", label: "Più di 30.000" },
    ],
  },
  {
    chiave: "trasporto",
    testo: "Trasporti materiale o attrezzatura?",
    opzioni: [
      { id: "spesso", label: "Spesso", sub: "Mi serve spazio di carico" },
      { id: "a_volte", label: "A volte" },
      { id: "no", label: "No", sub: "Mi muovo con un'auto normale" },
    ],
  },
  {
    chiave: "forfettario",
    testo: "Sei in regime forfettario?",
    opzioni: [
      { id: "si", label: "Sì" },
      { id: "no", label: "No" },
      { id: "non_so", label: "Non lo so", sub: "Lo verifichiamo insieme" },
    ],
  },
  {
    chiave: "priorita",
    testo: "Cosa conta di più per te?",
    opzioni: [
      { id: "rata", label: "La rata più bassa" },
      { id: "pensieri", label: "Zero pensieri", sub: "Massima copertura, non ci penso più" },
      { id: "fiscale", label: "Il massimo risparmio fiscale" },
    ],
  },
];

// --- Mappature (§2) ---

/** Profilo fiscale dalle risposte. "non lo so" → profilo prudente + disclaimer. */
export function mappaProfilo(r: Risposte): ProfiloId {
  if (r.forfettario === "si") return "forfettario";
  if (r.forfettario === "non_so") return "ditta_individuale"; // prudente, con disclaimer visibile
  switch (r.attivita) {
    case "agente":
      return "agente_rappresentante";
    case "pmi":
      return "srl_ordinaria";
    case "professionista":
      return "ditta_individuale";
    case "artigiano":
      // Artigiano che trasporta → veicolo strumentale N1 (deduzione piena).
      return r.trasporto === "no" ? "ditta_individuale" : "n1_strumentale";
  }
}

/** Segmento servizi (per i consigli di copertura) dall'attività. */
export function mappaSegmento(a: Attivita): Segmento {
  switch (a) {
    case "artigiano":
      return "artigiani";
    case "agente":
      return "agenti";
    case "pmi":
      return "pmi";
    case "professionista":
      return "forfettari"; // registro "solo/professionista" per i consigli servizi
  }
}

/** Km annui indicativi per il link al configuratore (scaglioni catalogo). */
export function mappaKm(km: KmFascia): number {
  switch (km) {
    case "fino_10":
      return 10000;
    case "10_20":
      return 20000;
    case "20_30":
    case "oltre_30":
      return 30000;
  }
}

/** Aliquota usata per la stima del costo reale: il primo preset del profilo (come il calcolatore). */
export function aliquotaProfilo(profilo: ProfiloId): number {
  const p = PROFILI[profilo];
  if (p.tipo !== "deduzione") return 0;
  return p.aliquote_preset[0].valore;
}
