// Funzione di transizione di stato lead (§PR30). Pura e testata: dato un cambio
// di stato produce le DUE scritture da eseguire — patch sul lead (con audit) e riga
// di storia (con autore). La server action è un adapter sottile sopra questa.

export type PianoTransizione = {
  /** Update sul lead: stato + audit (chi/quando). */
  patch: { stato: string; aggiornato_il: string; aggiornato_da: string };
  /** Riga da inserire in lead_stati_storia. */
  storia: { lead_id: string; stato: string; autore: string };
};

export function pianoTransizione(
  leadId: string,
  stato: string,
  autore: string,
  nowIso: string,
): PianoTransizione {
  return {
    patch: { stato, aggiornato_il: nowIso, aggiornato_da: autore },
    storia: { lead_id: leadId, stato, autore },
  };
}
