import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  frontmatterSchema,
  CATEGORIE_BLOG,
  type Frontmatter,
  type CategoriaBlog,
} from "./schema";

export { CATEGORIE_BLOG };

// Accesso agli articoli del blog (§1). Sorgente: file MDX in contenuti/blog/.
// I derivati (tempo di lettura) non sono mai salvati. Le bozze restano fuori da
// tutto ciò che è pubblico: build, indice, sitemap, RSS.

export type Articolo = Frontmatter & {
  /** Nome file senza estensione. */
  file: string;
  /** Corpo MDX (frontmatter già rimosso). */
  contenuto: string;
  /** Minuti di lettura stimati (~200 parole/min). */
  minutiLettura: number;
};

const BLOG_DIR = join(process.cwd(), "contenuti", "blog");

function tempoLettura(testo: string): number {
  const parole = testo.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(parole / 200));
}

function leggiTutti(): Articolo[] {
  if (!existsSync(BLOG_DIR)) return [];
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const out: Articolo[] = [];
  for (const f of files) {
    const raw = readFileSync(join(BLOG_DIR, f), "utf8");
    const { data, content } = matter(raw);
    const fm = frontmatterSchema.parse(data);
    out.push({
      ...fm,
      file: f.replace(/\.mdx$/, ""),
      contenuto: content,
      minutiLettura: tempoLettura(content),
    });
  }
  // Più recenti in cima.
  return out.sort((a, b) => (a.data < b.data ? 1 : -1));
}

// Memoizzato: i file non cambiano durante un build.
let _cache: Articolo[] | null = null;
function tutti(): Articolo[] {
  if (_cache === null) _cache = leggiTutti();
  return _cache;
}

/** Solo articoli pubblicati — l'unico set che raggiunge il pubblico. */
export function articoliPubblicati(): Articolo[] {
  return tutti().filter((a) => a.stato === "pubblicato");
}

/** Tutti gli articoli, bozze incluse. Solo per la dashboard (dietro auth): il
 *  pubblico non passa mai di qui. */
export function articoliTutti(): Articolo[] {
  return tutti();
}

export function articoloBySlug(slug: string): Articolo | undefined {
  return articoliPubblicati().find((a) => a.slug === slug);
}

export function articoliPerCategoria(cat: CategoriaBlog): Articolo[] {
  return articoliPubblicati().filter((a) => a.categoria === cat);
}

export function articoliInEvidenza(): Articolo[] {
  return articoliPubblicati().filter((a) => a.in_evidenza);
}

/** Correlati: stessa categoria, escluso l'articolo corrente, max `n`. */
export function correlati(a: Articolo, n = 3): Articolo[] {
  return articoliPubblicati()
    .filter((x) => x.categoria === a.categoria && x.slug !== a.slug)
    .slice(0, n);
}

/** Categorie che hanno almeno un articolo pubblicato, nell'ordine editoriale. */
export function categorieConArticoli() {
  const presenti = new Set(articoliPubblicati().map((a) => a.categoria));
  return CATEGORIE_BLOG.filter((c) => presenti.has(c.id));
}
