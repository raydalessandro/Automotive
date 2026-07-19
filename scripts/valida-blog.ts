// Validazione blog — SPEC Blog SEO §1. Eseguito in `npm run check:blog` e in build.
// Un blog invalido rompe il build, mai il sito in produzione (come il catalogo).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { frontmatterSchema } from "../lib/blog/schema";

const BLOG_DIR = join(process.cwd(), "contenuti", "blog");

// Prefissi interni ammessi come "atterraggio" (strumenti + landing + catalogo).
const DESTINAZIONI_INTERNE = [
  "/calcolatore",
  "/configuratore",
  "/preventivo",
  "/agenti",
  "/artigiani",
  "/aziende",
  "/veicoli",
];

function fail(msg: string): never {
  console.error(`\n❌ Blog NON valido:\n${msg}\n`);
  process.exit(1);
}

/** Vero se il corpo contiene almeno un link interno a strumento o landing,
 *  sia in forma markdown `](/...)` sia in forma `href="/..."`. */
function haLinkInterno(corpo: string): boolean {
  return DESTINAZIONI_INTERNE.some((dest) => {
    const d = dest.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const markdown = new RegExp(`\\]\\(${d}(?:[/?#)]|$)`);
    const href = new RegExp(`href=["']${d}(?:[/?#"']|$)`);
    return markdown.test(corpo) || href.test(corpo);
  });
}

if (!existsSync(BLOG_DIR)) {
  console.log("✅ Blog valido — nessun articolo (contenuti/blog/ assente).");
  process.exit(0);
}

const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
const errori: string[] = [];
const slugVisti = new Map<string, string>(); // slug → file
let pubblicati = 0;
let bozze = 0;

for (const f of files) {
  const raw = readFileSync(join(BLOG_DIR, f), "utf8");
  const { data, content } = matter(raw);

  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    for (const i of parsed.error.issues) {
      errori.push(`${f} — ${i.path.join(".") || "(frontmatter)"}: ${i.message}`);
    }
    continue;
  }
  const fm = parsed.data;

  // slug unico
  const gia = slugVisti.get(fm.slug);
  if (gia) errori.push(`${f} — slug duplicato "${fm.slug}" (già in ${gia})`);
  slugVisti.set(fm.slug, f);

  // slug allineato al nome file (evita ambiguità nelle route)
  const base = f.replace(/\.mdx$/, "");
  if (fm.slug !== base) {
    errori.push(`${f} — slug "${fm.slug}" ≠ nome file "${base}"`);
  }

  if (fm.stato === "pubblicato") {
    pubblicati++;
    // regola SEO: un articolo pubblicato porta sempre a uno strumento o una landing
    if (!haLinkInterno(content)) {
      errori.push(
        `${f} — articolo pubblicato senza alcun link interno a strumento/landing ` +
          `(${DESTINAZIONI_INTERNE.join(", ")})`,
      );
    }
  } else {
    bozze++;
  }
}

if (errori.length) {
  fail(errori.map((e) => `  • ${e}`).join("\n"));
}

console.log(
  `✅ Blog valido — ${files.length} file (${pubblicati} pubblicati, ${bozze} bozze).`,
);
