/**
 * Pipeline foto team (§3 spec chi-siamo). Riusa sharp come per le editoriali.
 * Normalizza gli scatti in ritratti quadrati 800×800 webp ≤ 80 KB, crop uniforme
 * (mezzo busto, testa in alto → occhi verso il terzo superiore), fondo avorio.
 *
 * Uso:
 *   tsx scripts/foto-team.ts <input> <nome>     # un singolo scatto
 *   tsx scripts/foto-team.ts                     # tutti i file in scripts/_assets-src/team/
 *
 * Gli originali stanno in scripts/_assets-src/team/ (gitignorata): il repo tiene
 * solo i .webp ottimizzati in public/team/. Il build non dipende da questi file:
 * finché manca la foto, la card mostra il segnaposto a iniziali (components/Avatar).
 */
import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";

const AVORIO = { r: 246, g: 243, b: 236, alpha: 1 };
const LATO = 800;
const OUT_DIR = "public/team";
const SRC_DIR = "scripts/_assets-src/team";
const MAX_KB = 80;

async function processa(input: string, nome: string) {
  const out = join(OUT_DIR, `${nome}.webp`);
  // Cover quadrato ancorato in alto: testa in cima, taglio a mezzo busto.
  const base = sharp(input)
    .trim()
    .flatten({ background: AVORIO })
    .resize(LATO, LATO, { fit: "cover", position: "top" });

  // Scala la qualità finché non si sta sotto la soglia (di norma basta il primo giro).
  let qualita = 82;
  let buf = await base.clone().webp({ quality: qualita }).toBuffer();
  while (buf.byteLength > MAX_KB * 1024 && qualita > 40) {
    qualita -= 8;
    buf = await base.clone().webp({ quality: qualita }).toBuffer();
  }
  await sharp(buf).toFile(out);
  console.log(`✓ ${out} — ${LATO}×${LATO}, q${qualita}, ${(buf.byteLength / 1024).toFixed(1)} KB`);
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const [, , input, nome] = process.argv;

  if (input && nome) {
    await processa(input, nome);
    return;
  }

  if (!existsSync(SRC_DIR)) {
    console.log(`Nessun input. Metti gli scatti in ${SRC_DIR}/ (es. shery.png) e rilancia.`);
    return;
  }
  const files = readdirSync(SRC_DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  if (!files.length) {
    console.log(`Nessuno scatto in ${SRC_DIR}/.`);
    return;
  }
  for (const f of files) {
    await processa(join(SRC_DIR, f), basename(f, extname(f)).toLowerCase());
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
