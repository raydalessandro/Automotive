// Renderer del brief per-target (§PR-10). Puro: dai `dati` jsonb di un lead (e/o dal
// core) produce una lista ordinata { label, valore } usando le `labels` del registro.
// Label mancante → chiave umanizzata (snake_case → spazi, iniziale maiuscola).
// Booleani → Sì/No. Valori vuoti/null → omessi. Nessun accesso a DB/rete.

export type CampoRender = { label: string; valore: string };

// "patente_da_anni" → "Patente da anni"
export function umanizza(chiave: string): string {
  const s = chiave.replace(/_/g, " ").trim();
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function formatta(v: unknown): string {
  if (typeof v === "boolean") return v ? "Sì" : "No";
  if (Array.isArray(v)) return v.map(formatta).join(", ");
  return String(v);
}

function vuoto(v: unknown): boolean {
  return v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
}

/**
 * Coppie label/valore ordinate: prima i campi `core` (se passati), poi i campi `dati`,
 * ciascuno nell'ordine di inserimento dell'oggetto. Le label vengono dal registro;
 * assenti → chiave umanizzata. I campi vuoti si omettono.
 */
export function campiDaLabels(
  labels: Record<string, string> | null | undefined,
  core: Record<string, unknown> | null | undefined,
  dati: Record<string, unknown> | null | undefined,
): CampoRender[] {
  const L = labels ?? {};
  const out: CampoRender[] = [];
  const aggiungi = (obj?: Record<string, unknown> | null) => {
    if (!obj) return;
    for (const [k, v] of Object.entries(obj)) {
      if (vuoto(v)) continue;
      out.push({ label: L[k] ?? umanizza(k), valore: formatta(v) });
    }
  };
  aggiungi(core);
  aggiungi(dati);
  return out;
}
