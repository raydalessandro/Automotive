// Dedup client (§PR29): un evento "una volta per <chiave>" per sessione, via
// sessionStorage con chiave `evt:<tipo>:<chiave>`. Testato: il doppio conteggio è
// uno dei quattro bug che la spec blinda.

export function chiaveDedup(tipo: string, chiave: string): string {
  return `evt:${tipo}:${chiave}`;
}

/**
 * Ritorna true la PRIMA volta che si vede (tipo, chiave) nella sessione e la
 * registra; false le volte successive. Se sessionStorage non è disponibile,
 * ritorna sempre true (meglio un evento in più che perdere il tracking).
 */
export function unaVolta(tipo: string, chiave: string): boolean {
  try {
    const k = chiaveDedup(tipo, chiave);
    if (sessionStorage.getItem(k)) return false;
    sessionStorage.setItem(k, "1");
    return true;
  } catch {
    return true;
  }
}
