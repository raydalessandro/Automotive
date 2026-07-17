// Campagne mailing — §2/§3 spec dashboard.

export const STATI_CAMPAGNA = ["bozza", "attiva", "in_pausa", "completata"] as const;
export type StatoCampagna = (typeof STATI_CAMPAGNA)[number];

export const LABEL_STATO_CAMPAGNA: Record<StatoCampagna, string> = {
  bozza: "Bozza",
  attiva: "Attiva",
  in_pausa: "In pausa",
  completata: "Completata",
};

export type Campagna = {
  id: string;
  creato_il: string;
  nome: string;
  segmento: string;
  oggetto: string;
  corpo: string;
  tetto_giornaliero: number;
  stato: StatoCampagna;
};

export const ESITI_INVIO = ["in_coda", "inviata", "errore", "bounce"] as const;
export type EsitoInvio = (typeof ESITI_INVIO)[number];

// Sostituzione segnaposto {campo} con i dati dell'azienda.
export function applicaSegnaposto(template: string, dati: Record<string, string | null | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (_m, k: string) => {
    const v = dati[k];
    return v == null ? "" : String(v);
  });
}

export const SEGNAPOSTO_DISPONIBILI = [
  "ragione_sociale",
  "citta",
  "provincia",
  "settore",
  "segmento",
] as const;
