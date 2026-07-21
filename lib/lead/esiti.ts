// Esiti strutturati del "perso" (§PR-6). Il venditore, quando marca un lead come perso,
// seleziona uno o più motivi a crocette (+ eventuale data di ricontatto o nota). Qui:
// la lista canonica dei motivi e la validazione PURA dei dettagli — stessa rete di
// protezione sia lato app (form) sia lato action (server). Nessuno stato nuovo: i
// dettagli vivono in lead_stati_storia.dettagli, la macchina stati non cambia.

export const MOTIVI_PERSO = [
  { id: "canone_alto", label: "Canone troppo alto" },
  { id: "fornitore_attivo", label: "Ha già un fornitore di noleggio" },
  { id: "preferisce_acquisto", label: "Preferisce acquisto o leasing" },
  { id: "non_e_il_momento", label: "Non è il momento" },
  { id: "decisore_non_raggiunto", label: "Non ho raggiunto il decisore" },
  { id: "veicolo_non_adatto", label: "Veicolo o allestimento non adatto" },
  { id: "diffidenza", label: "Diffidenza verso il noleggio" },
  { id: "altro", label: "Altro" },
] as const;

export type MotivoPersoId = (typeof MOTIVI_PERSO)[number]["id"];

// Il motivo che sblocca il campo data "Ricontattare il".
export const MOTIVO_RICONTATTO: MotivoPersoId = "non_e_il_momento";

export type DettagliPerso = {
  motivi: MotivoPersoId[];
  ricontattare_il?: string; // YYYY-MM-DD, solo con MOTIVO_RICONTATTO
  nota_altro?: string; // breve, solo con "altro"
};

const IDS: readonly string[] = MOTIVI_PERSO.map((m) => m.id);

/** Label leggibile di un id motivo (fallback all'id se sconosciuto). */
export function labelMotivo(id: string): string {
  return MOTIVI_PERSO.find((m) => m.id === id)?.label ?? id;
}

export type EsitoValidazione =
  | { ok: true; dettagli: DettagliPerso }
  | { ok: false; error: string };

// Data ISO breve reale (YYYY-MM-DD): scarta sia il formato sbagliato sia i giorni
// inesistenti (es. 2026-02-30) via round-trip su Date.
function isDataValida(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/**
 * Valida i dettagli di un esito `perso`. Pura: nessun accesso a DB/rete.
 * Regole: almeno 1 motivo, tutti gli id noti; `ricontattare_il` ammesso SOLO se è
 * selezionato `non_e_il_momento` e con formato data valido; `nota_altro` tenuta solo
 * con `altro` (altrimenti scartata, non è un errore). L'output è normalizzato:
 * motivi deduplicati nell'ordine canonico di MOTIVI_PERSO.
 */
export function validaDettagliPerso(raw: unknown): EsitoValidazione {
  if (typeof raw !== "object" || raw === null) return { ok: false, error: "Dettagli mancanti" };
  const r = raw as Record<string, unknown>;

  if (!Array.isArray(r.motivi)) return { ok: false, error: "Seleziona almeno un motivo" };
  for (const m of r.motivi) {
    if (typeof m !== "string" || !IDS.includes(m)) {
      return { ok: false, error: `Motivo non valido: ${String(m)}` };
    }
  }
  // Dedup mantenendo l'ordine canonico dei motivi.
  const motivi = MOTIVI_PERSO.map((m) => m.id).filter((id) => (r.motivi as string[]).includes(id));
  if (motivi.length === 0) return { ok: false, error: "Seleziona almeno un motivo" };

  const dettagli: DettagliPerso = { motivi };

  const rc = r.ricontattare_il;
  if (rc != null && rc !== "") {
    if (!motivi.includes(MOTIVO_RICONTATTO)) {
      return { ok: false, error: "La data di ricontatto vale solo con «Non è il momento»" };
    }
    if (typeof rc !== "string" || !isDataValida(rc)) {
      return { ok: false, error: "Data di ricontatto non valida" };
    }
    dettagli.ricontattare_il = rc;
  }

  const na = r.nota_altro;
  if (typeof na === "string" && na.trim() && motivi.includes("altro")) {
    dettagli.nota_altro = na.trim().slice(0, 280);
  }

  return { ok: true, dettagli };
}
