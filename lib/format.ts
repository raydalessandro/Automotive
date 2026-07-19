// Utility di formattazione — cifre in stile italiano.

export function euro(valore: number, decimali = 0): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimali,
    maximumFractionDigits: decimali,
  }).format(valore);
}

export function numero(valore: number): string {
  return new Intl.NumberFormat("it-IT").format(valore);
}

// Data ISO (YYYY-MM-DD) → "19 luglio 2026". Mezzogiorno UTC per evitare slittamenti di fuso.
export function dataIt(iso: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}
