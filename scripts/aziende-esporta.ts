// CLI export aziende — PR15. Riusa lib/aziende/core.ts.
// Uso: npm run aziende:esporta -- --stato grezza --segmento artigiani --provincia MI --out auto

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { clientCli, parseArgs } from "./_cli";
import { esportaAziendeCore } from "../lib/aziende/core";

function oggiISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const filtri = {
    stato: args.stato,
    segmento: args.segmento,
    provincia: args.provincia,
    fonte_ricerca: args.fonte,
  };

  const supabase = clientCli();
  const r = await esportaAziendeCore(supabase, filtri);
  if (r.error) {
    console.error(`❌ ${r.error}`);
    process.exit(1);
  }

  const json = r.json ?? "[]";
  const out = args.out;

  if (!out) {
    // Nessun --out: stampa su stdout.
    process.stdout.write(json + "\n");
    console.error(`(${r.n} aziende)`);
    return;
  }

  let destinazione: string;
  if (out === "auto" || out === "true") {
    const parti = [filtri.stato, filtri.segmento, filtri.provincia, filtri.fonte_ricerca].filter(Boolean).join("-");
    const nome = `export-${oggiISO()}${parti ? "-" + parti : ""}.json`;
    const dir = join(process.cwd(), "strumenti", "ricerca", "batch");
    mkdirSync(dir, { recursive: true });
    destinazione = join(dir, nome);
  } else {
    destinazione = out;
  }

  writeFileSync(destinazione, json);
  console.log(`✅ ${r.n} aziende → ${destinazione}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
