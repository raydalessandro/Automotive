// Esito del Consulente salvato per il lead (§5). Client-side (sessionStorage):
// lo scrive il wizard, lo legge il form/modal preventivo per allegarlo alla richiesta.

export type EsitoConsulente = {
  risposte: Record<string, string>;
  soluzione_vista: string[];
  soluzione_scelta: string | null;
};

const KEY = "impero_consulente_esito";

export function salvaEsito(e: EsitoConsulente): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(e));
  } catch {
    /* ignora */
  }
}

/** Segna quale soluzione l'utente ha scelto ("Configura questa"). */
export function segnaScelta(veicoloId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return;
    const e = JSON.parse(raw) as EsitoConsulente;
    e.soluzione_scelta = veicoloId;
    sessionStorage.setItem(KEY, JSON.stringify(e));
  } catch {
    /* ignora */
  }
}

export function leggiEsito(): EsitoConsulente | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EsitoConsulente) : null;
  } catch {
    return null;
  }
}
