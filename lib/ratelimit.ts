// Rate limiter in-memory a finestra fissa (§7 sicurezza).
// Per-istanza serverless: difesa best-effort contro flood/burst, in aggiunta
// al cap per-sessione lato DB. Non è un limite distribuito.

type Finestra = { count: number; resetAt: number };

const bucket = new Map<string, Finestra>();

/** true = consentito, false = oltre il limite nella finestra. */
export function rateLimit(chiave: string, limite: number, finestraMs: number): boolean {
  const ora = Date.now();
  const f = bucket.get(chiave);

  if (!f || ora > f.resetAt) {
    bucket.set(chiave, { count: 1, resetAt: ora + finestraMs });
    // Prune occasionale delle finestre scadute (evita crescita illimitata).
    if (bucket.size > 5000) {
      for (const [k, v] of bucket) if (ora > v.resetAt) bucket.delete(k);
    }
    return true;
  }

  if (f.count >= limite) return false;
  f.count++;
  return true;
}

/** Estrae un identificatore client dagli header (IP dietro proxy Vercel). */
export function chiaveClient(req: Request, prefisso: string): string {
  const xff = req.headers.get("x-forwarded-for");
  const ip = xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `${prefisso}:${ip}`;
}
