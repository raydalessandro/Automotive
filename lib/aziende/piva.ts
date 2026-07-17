// Validazione P.IVA italiana — Addendum §1.
// Formato: 11 cifre. In più, checksum standard (Luhn-like sui primi 10, controllo sull'11ª).

export function formatoPivaOk(piva: string | null | undefined): boolean {
  return !!piva && /^\d{11}$/.test(piva);
}

export function checksumPivaOk(piva: string): boolean {
  if (!/^\d{11}$/.test(piva)) return false;
  let somma = 0;
  for (let i = 0; i < 10; i++) {
    let n = piva.charCodeAt(i) - 48;
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    somma += n;
  }
  const controllo = (10 - (somma % 10)) % 10;
  return controllo === piva.charCodeAt(10) - 48;
}

/** Normalizza a sole cifre; ritorna null se non 11 cifre. */
export function normalizzaPiva(v: unknown): string | null {
  if (v == null) return null;
  const cifre = String(v).replace(/\D/g, "");
  return /^\d{11}$/.test(cifre) ? cifre : null;
}
