// Tipi condivisi dashboard.

import type { Configurazione } from "@/lib/servizi.config";

export const STATI_LEAD = [
  "nuovo",
  "contattato",
  "preventivo_inviato",
  "chiuso",
  "perso",
] as const;
export type StatoLead = (typeof STATI_LEAD)[number];

export const LABEL_STATO_LEAD: Record<StatoLead, string> = {
  nuovo: "Nuovo",
  contattato: "Contattato",
  preventivo_inviato: "Preventivo inviato",
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
  configurazione: Configurazione | null;
};
