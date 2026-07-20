// Formattazione per la dashboard analytics (§PR31). null → "—", mai NaN.

export function fmtPct(x: number | null): string {
  return x == null ? "—" : `${Math.round(x * 100)}%`;
}

export function fmtNum(x: number | null): string {
  return x == null ? "—" : x.toLocaleString("it-IT");
}

export function fmtEuro(x: number | null): string {
  return x == null ? "—" : `€ ${Math.round(x).toLocaleString("it-IT")}`;
}

/** Durata umana da secondi (per il tempo di chiusura mediano). */
export function fmtDurata(sec: number | null): string {
  if (sec == null) return "—";
  const g = Math.floor(sec / 86400);
  if (g > 0) return `${g}g ${Math.round((sec % 86400) / 3600)}h`;
  const h = Math.floor(sec / 3600);
  if (h > 0) return `${h}h ${Math.round((sec % 3600) / 60)}m`;
  const m = Math.floor(sec / 60);
  return m > 0 ? `${m}m` : `${Math.round(sec)}s`;
}

/** Etichetta delta (freccia + %), o "—" se non calcolabile. */
export function fmtDelta(d: number | null): { testo: string; segno: "su" | "giu" | "neutro" } {
  if (d == null) return { testo: "—", segno: "neutro" };
  const pct = Math.round(d * 100);
  if (pct === 0) return { testo: "0%", segno: "neutro" };
  return { testo: `${pct > 0 ? "▲" : "▼"} ${Math.abs(pct)}%`, segno: pct > 0 ? "su" : "giu" };
}
