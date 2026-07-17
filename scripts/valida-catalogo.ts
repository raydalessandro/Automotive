// Validazione catalogo — §2.2. Eseguito in `npm run check:catalogo` e in build.
// Un catalogo invalido rompe il build, mai il sito in produzione.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { catalogoSchema } from "../lib/catalogo/schema";

const ROOT = process.cwd();
const CATALOGO_PATH = join(ROOT, "data", "catalogo.json");
const PUBLIC_DIR = join(ROOT, "public");

function fail(msg: string): never {
  console.error(`\n❌ Catalogo NON valido:\n${msg}\n`);
  process.exit(1);
}

let raw: unknown;
try {
  raw = JSON.parse(readFileSync(CATALOGO_PATH, "utf8"));
} catch (e) {
  fail(`impossibile leggere/parsare data/catalogo.json: ${(e as Error).message}`);
}

const parsed = catalogoSchema.safeParse(raw);
if (!parsed.success) {
  fail(
    parsed.error.issues
      .map((i) => `  • ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n"),
  );
}

const catalogo = parsed.data;
const errori: string[] = [];

// id univoci
const visti = new Set<string>();
for (const v of catalogo.veicoli) {
  if (visti.has(v.id)) errori.push(`id duplicato: ${v.id}`);
  visti.add(v.id);
}

// foto esistente su disco (i placeholder /placeholder... sono ammessi)
for (const v of catalogo.veicoli) {
  if (v.foto.startsWith("/placeholder")) continue;
  const fotoPath = join(PUBLIC_DIR, v.foto.replace(/^\//, ""));
  if (!existsSync(fotoPath)) {
    errori.push(`foto mancante per ${v.id}: public${v.foto}`);
  }
}

if (errori.length) {
  fail(errori.map((e) => `  • ${e}`).join("\n"));
}

console.log(
  `✅ Catalogo valido — ${catalogo.veicoli.length} veicoli, aggiornato il ${catalogo.aggiornato_il}`,
);
