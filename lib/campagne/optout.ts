import crypto from "node:crypto";

// Token opt-out firmato (HMAC) — §4. Nessuno stato lato server: il token porta l'azienda_id.

function secret(): string {
  return process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "impero-dev-secret";
}

export function creaTokenOptOut(aziendaId: string): string {
  const firma = crypto.createHmac("sha256", secret()).update(aziendaId).digest("base64url");
  const id = Buffer.from(aziendaId).toString("base64url");
  return `${id}.${firma}`;
}

export function verificaTokenOptOut(token: string): string | null {
  const [id64, firma] = token.split(".");
  if (!id64 || !firma) return null;
  let aziendaId: string;
  try {
    aziendaId = Buffer.from(id64, "base64url").toString();
  } catch {
    return null;
  }
  const atteso = crypto.createHmac("sha256", secret()).update(aziendaId).digest("base64url");
  if (firma.length !== atteso.length) return null;
  try {
    if (!crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(atteso))) return null;
  } catch {
    return null;
  }
  return aziendaId;
}
