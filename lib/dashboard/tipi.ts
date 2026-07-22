// Tipi condivisi dashboard.

import type { Configurazione } from "@/lib/servizi.config";

// Stati lead (§PR-2). I 5 esistenti restano nell'ordine originale; i 3 nuovi
// (assegnato, preso_in_carico, in_sospeso) sono inseriti seguendo la pipeline:
// nuovo → contattato → assegnato → preso_in_carico → esiti (preventivo/in_sospeso/chiuso/perso).
export const STATI_LEAD = [
  "nuovo",
  "contattato",
  "assegnato",
  "preso_in_carico",
  "preventivo_inviato",
  "in_sospeso",
  "chiuso",
  "perso",
] as const;
export type StatoLead = (typeof STATI_LEAD)[number];

export const LABEL_STATO_LEAD: Record<StatoLead, string> = {
  nuovo: "Nuovo",
  contattato: "Contattato",
  assegnato: "Assegnato",
  preso_in_carico: "Preso in carico",
  preventivo_inviato: "Preventivo inviato",
  in_sospeso: "In sospeso",
  chiuso: "Chiuso",
  perso: "Perso",
};

export type Lead = {
  id: string;
  created_at: string;
  fonte: Record<string, string> | null;
  pagina: string | null;
  veicolo_id: string | null;
  ragione_sociale: string;
  referente: string;
  forma_giuridica: string;
  anni_attivita: string;
  settore: string | null;
  n_veicoli: string;
  km_anno: string;
  telefono: string;
  email: string | null;
  provincia: string;
  consenso_privacy: boolean;
  consenso_marketing: boolean;
  score: number | null;
  stato: StatoLead;
  note: string | null;
  richiamare_il: string | null;
  aggiornato_il: string | null;
  aggiornato_da: string | null;
  valore_commissione: number | null;
  // §PR-2: assegnazione al venditore e ponte con il magazzino aziende.
  assegnato_a: string | null;
  assegnato_il: string | null;
  azienda_id: string | null;
  configurazione: Configurazione | null;
  // §PR-8 multi-target: provenienza del lead + payload per-target validato dal DB.
  // Solo tipi (la logica di validazione è nel DB / arriva in PR-9). I lead attuali
  // sono 'nlt_b2b' con dati null.
  target: string;
  dati: Record<string, unknown> | null;
  schema_v: number | null;
};
