// CLI import aziende — PR15. Riusa la STESSA logica della UI (lib/aziende/core.ts).
// Uso: npm run aziende:importa -- --file <path> --modalita raccolta|arricchimento

import { readFileSync, existsSync } from "node:fs";
import { clientCli, parseArgs } from "./_cli";
import { importaAziendeCore, type ModoImport } from "../lib/aziende/core";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = args.file;
  const modalita = (args.modalita ?? "raccolta") as ModoImport;

  if (!file) {
    console.error("Uso: npm run aziende:importa -- --file <path> --modalita raccolta|arricchimento");
    process.exit(1);
  }
  if (modalita !== "raccolta" && modalita !== "arricchimento") {
    console.error(`Modalità non valida: ${modalita} (usa 'raccolta' o 'arricchimento')`);
    process.exit(1);
  }
  if (!existsSync(file)) {
    console.error(`File non trovato: ${file}`);
    process.exit(1);
  }

  const testo = readFileSync(file, "utf8");
  const supabase = clientCli();

  console.log(`Import (${modalita}) da ${file}…`);
  const r = await importaAziendeCore(supabase, testo, modalita);

  if (r.error) {
    console.error(`❌ ${r.error}`);
    process.exit(1);
  }

  console.log(
    `✅ inserite ${r.inserite} · arricchite ${r.arricchite} · duplicate ${r.duplicate} · scartate ${r.scartate?.length ?? 0}`,
  );
  if (r.scartate?.length) {
    for (const s of r.scartate) {
      console.log(`   ⚠ riga ${s.riga}${s.ragione_sociale ? ` (${s.ragione_sociale})` : ""}: ${s.motivo}`);
    }
  }

  // File non valido (formato) → exit ≠ 0.
  if (r.scartate?.some((s) => s.riga === 0)) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
