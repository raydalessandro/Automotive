import { importRowSchema, type ImportRow } from "./schema";
import { isPec } from "./pec";

export type Scarto = { riga: number; ragione_sociale?: string; motivo: string };
export type RisultatoParsing = { valide: ImportRow[]; scartate: Scarto[] };

// Parser CSV minimale con supporto ai campi tra virgolette.
function parseCsv(testo: string): Record<string, string>[] {
  const righe = testo.replace(/\r\n/g, "\n").split("\n").filter((r) => r.trim() !== "");
  if (righe.length < 2) return [];
  const parseRiga = (r: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < r.length; i++) {
      const c = r[i];
      if (inQuote) {
        if (c === '"' && r[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') inQuote = false;
        else cur += c;
      } else if (c === '"') inQuote = true;
      else if (c === ",") {
        out.push(cur);
        cur = "";
      } else cur += c;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const header = parseRiga(righe[0]).map((h) => h.toLowerCase());
  return righe.slice(1).map((r) => {
    const celle = parseRiga(r);
    const obj: Record<string, string> = {};
    header.forEach((h, i) => (obj[h] = celle[i] ?? ""));
    return obj;
  });
}

/** Interpreta il testo (JSON array o CSV) in righe grezze. */
function grezze(testo: string): Record<string, unknown>[] {
  const t = testo.trim();
  if (t.startsWith("[") || t.startsWith("{")) {
    const parsed = JSON.parse(t);
    return Array.isArray(parsed) ? parsed : [parsed];
  }
  return parseCsv(t);
}

// Ripulisce le stringhe vuote in null prima della validazione.
function normalizza(r: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(r)) out[k] = v === "" ? null : v;
  return out;
}

type ChiaveCascata = {
  id?: string | null;
  piva?: string | null;
  email?: string | null;
  ragione_sociale: string;
  provincia?: string | null;
};

// Chiave di dedup a cascata (id → piva → email → nome+provincia) — Addendum §2.
export function chiaveCascata(r: ChiaveCascata): string {
  if (r.id) return "id:" + r.id;
  if (r.piva) return "piva:" + r.piva;
  if (r.email) return "email:" + r.email.toLowerCase();
  return "np:" + r.ragione_sociale.toLowerCase().trim() + "|" + (r.provincia ?? "").toLowerCase().trim();
}

/** Dedup interno al batch con la cascata: la prima occorrenza vince. */
export function dedupBatch<T extends ChiaveCascata>(rows: T[]): { unici: T[]; duplicati: number } {
  const visti = new Set<string>();
  const unici: T[] = [];
  let duplicati = 0;
  for (const r of rows) {
    const k = chiaveCascata(r);
    if (visti.has(k)) {
      duplicati++;
      continue;
    }
    visti.add(k);
    unici.push(r);
  }
  return { unici, duplicati };
}

export function parseImport(testo: string): RisultatoParsing {
  let rows: Record<string, unknown>[];
  try {
    rows = grezze(testo);
  } catch {
    return { valide: [], scartate: [{ riga: 0, motivo: "Formato non valido (atteso JSON o CSV)" }] };
  }

  const valide: ImportRow[] = [];
  const scartate: Scarto[] = [];

  rows.forEach((raw, i) => {
    const parsed = importRowSchema.safeParse(normalizza(raw));
    const nome = (raw?.ragione_sociale as string) ?? undefined;
    if (!parsed.success) {
      scartate.push({
        riga: i + 1,
        ragione_sociale: nome,
        motivo: parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; "),
      });
      return;
    }
    if (isPec(parsed.data.email)) {
      scartate.push({ riga: i + 1, ragione_sociale: nome, motivo: `email PEC rifiutata (${parsed.data.email})` });
      return;
    }
    valide.push(parsed.data);
  });

  return { valide, scartate };
}
