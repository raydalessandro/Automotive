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
