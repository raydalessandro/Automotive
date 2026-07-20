// Gate di qualità per i batch dei worker (Kimi, ChatGPT, Grok, Claude, ...).
// Uso: npm run aziende:gate -- --file strumenti/ricerca/batch/<file>.json
// Test: (1) parser+schema, (2) dedup interno e vs batch esistenti (nome normalizzato),
//       (3) checksum P.IVA, (4) coerenza dominio email/sito. Exit 1 se qualcosa non passa.
// Vedi strumenti/ricerca/PATTERN-settori.md → "Protocollo di fiducia a campione".

import { readFileSync, readdirSync } from "fs";
import { basename } from "path";
import { parseImport, dedupBatch } from "../lib/aziende/import";
import { checksumPivaOk } from "../lib/aziende/piva";
import { isPec } from "../lib/aziende/pec";

const CASELLE_GENERICHE = /^(info|contatti|contatto|commerciale|amministrazione|preventivi|segreteria|ufficio|posta|mail|assistenza|servizioclienti|vendite|sales|office)@/i;

// La cascata di core usa nome+provincia com'è scritto: "S.r.l." != "Srl".
// Qui normalizziamo per intercettare i quasi-doppioni PRIMA dell'import.
function nomeNormalizzato(nome: string): string {
  return nome
    .toLowerCase()
    .replace(/[.,'&]/g, " ")
    .replace(/\b(s ?r ?l s?|s ?p ?a|s ?a ?s|s ?n ?c|srl|spa|sas|snc|unipersonale|societa|f ?lli|fratelli)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dominio(v: string | null | undefined): string {
  return (v ?? "").toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
}

const fileArg = process.argv.indexOf("--file");
if (fileArg === -1 || !process.argv[fileArg + 1]) {
  console.error("Uso: npm run aziende:gate -- --file <path al batch .json>");
  process.exit(1);
}
const file = process.argv[fileArg + 1];
let problemi = 0;

const { valide, scartate } = parseImport(readFileSync(file, "utf8"));
const { unici, duplicati } = dedupBatch(valide);
console.log(`\n== GATE ${basename(file)}`);
console.log(`parser: ${unici.length} valide | ${scartate.length} scartate | ${duplicati} duplicate interne`);
scartate.forEach((s) => console.log(`  SCARTATA r${s.riga} ${s.ragione_sociale ?? ""}: ${s.motivo}`));
problemi += scartate.length + duplicati;

// Quasi-doppioni contro gli altri batch (nome normalizzato + provincia).
const esistenti = new Map<string, string>();
for (const f of readdirSync("strumenti/ricerca/batch").filter((x) => x.endsWith(".json") && x !== basename(file))) {
  for (const r of parseImport(readFileSync("strumenti/ricerca/batch/" + f, "utf8")).valide) {
    esistenti.set(nomeNormalizzato(r.ragione_sociale) + "|" + (r.provincia ?? "").toLowerCase(), `${r.ragione_sociale} (${f})`);
  }
}
for (const r of unici) {
  const k = nomeNormalizzato(r.ragione_sociale) + "|" + (r.provincia ?? "").toLowerCase();
  if (esistenti.has(k)) console.log(`  QUASI-DOPPIONE: ${r.ragione_sociale} ≈ ${esistenti.get(k)} — valutare arricchimento invece di nuova riga`);
}

// P.IVA: il bugiardometro. Un'invenzione su dieci passa per caso.
for (const r of unici.filter((x) => x.piva)) {
  if (!checksumPivaOk(r.piva!)) {
    console.log(`  P.IVA KO: ${r.ragione_sociale} (${r.piva}) — probabile invenzione del worker`);
    problemi++;
  }
}

// Email: PEC (ridondante col parser, ma esplicito), caselle non generiche, domini incoerenti.
for (const r of unici.filter((x) => x.email)) {
  const de = dominio(r.email!.split("@")[1]);
  const ds = dominio(r.sito);
  if (isPec(r.email)) { console.log(`  EMAIL PEC: ${r.ragione_sociale}`); problemi++; }
  else if (!CASELLE_GENERICHE.test(r.email!)) { console.log(`  EMAIL NON GENERICA (nominale?): ${r.ragione_sociale} → ${r.email} — da azzerare`); problemi++; }
  else if (ds && de !== ds) console.log(`  EMAIL/SITO INCOERENTI: ${r.ragione_sociale} → @${de} vs ${ds} — sospetta deduzione, declassare a grezza`);
}

console.log(problemi === 0 ? "\nGATE OK — pronto per: npm run aziende:importa -- --file " + file + " --modalita raccolta" : `\nGATE: ${problemi} problemi bloccanti`);
process.exit(problemi === 0 ? 0 : 1);
