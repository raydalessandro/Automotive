// CLI chiavi di sito per target (§PR-9). Genera la chiave, la stampa UNA volta in chiaro,
// salva SOLO lo sha256 nel registro (la chiave in chiaro non viene mai persistita).
// `--revoca` azzera l'hash. Env service da .env.local, come le altre CLI.
// Uso: npm run target:chiave -- --target <slug> [--revoca]

import { createHash, randomBytes } from "node:crypto";
import { clientCli, parseArgs } from "./_cli";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = args.target;
  if (!target) {
    console.error("Uso: npm run target:chiave -- --target <slug> [--revoca]");
    process.exit(1);
  }
  const supabase = clientCli();

  // Il target deve esistere in ogni caso.
  const { data: reg, error: regErr } = await supabase
    .from("registro_target")
    .select("target")
    .eq("target", target)
    .maybeSingle();
  if (regErr) {
    console.error(`❌ ${regErr.message}`);
    process.exit(1);
  }
  if (!reg) {
    console.error(`❌ target inesistente: ${target}`);
    process.exit(1);
  }

  if (args.revoca) {
    const { error } = await supabase.from("registro_target").update({ chiave_hash: null }).eq("target", target);
    if (error) {
      console.error(`❌ ${error.message}`);
      process.exit(1);
    }
    console.log(`✅ chiave revocata per ${target}`);
    return;
  }

  const chiave = randomBytes(24).toString("base64url");
  const hash = createHash("sha256").update(chiave).digest("hex");
  const { error } = await supabase.from("registro_target").update({ chiave_hash: hash }).eq("target", target);
  if (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }

  console.log(`\n✅ Chiave generata per "${target}". Copiala ORA — non sarà più mostrata:\n`);
  console.log(`   ${chiave}\n`);
  console.log(`   Salvato solo lo sha256 nel registro. Usala come "chiave_sito" nel POST /api/lead.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
