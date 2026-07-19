import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articoliPerCategoria } from "@/lib/blog";
import { CATEGORIE_BLOG, labelCategoria, type CategoriaBlog } from "@/lib/blog/schema";
import { ArticoloCard } from "@/components/blog/ArticoloCard";
import { Filetto } from "@/components/blog/Filetto";
import { siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return CATEGORIE_BLOG.map((c) => ({ cat: c.id }));
}

function valida(cat: string): CategoriaBlog | null {
  return CATEGORIE_BLOG.some((c) => c.id === cat) ? (cat as CategoriaBlog) : null;
}

export function generateMetadata({ params }: { params: { cat: string } }): Metadata {
  const cat = valida(params.cat);
  if (!cat) return {};
  const label = labelCategoria(cat);
  return {
    title: `${label} — Blog`,
    description: `Articoli e guide su ${label.toLowerCase()} nel noleggio a lungo termine per partite IVA.`,
    alternates: { canonical: `${siteUrl()}/blog/categoria/${cat}` },
  };
}

export default function CategoriaPage({ params }: { params: { cat: string } }) {
  const cat = valida(params.cat);
  if (!cat) notFound();

  const articoli = articoliPerCategoria(cat);

  return (
    <div className="container-content py-10 sm:py-14">
      <nav className="mb-6 text-sm text-testo-chiaro/50">
        <Link href="/blog" className="hover:text-oro">
          Blog
        </Link>{" "}
        / <span className="text-testo-chiaro/70">{labelCategoria(cat)}</span>
      </nav>

      <header className="max-w-prose">
        <p className="text-xs font-semibold uppercase tracking-widest text-oro">Categoria</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          {labelCategoria(cat)}
        </h1>
        <Filetto />
      </header>

      {articoli.length === 0 ? (
        <p className="mt-12 text-testo-chiaro/60">
          Nessun articolo in questa categoria, per ora.{" "}
          <Link href="/blog" className="text-oro hover:underline">
            Torna al blog
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articoli.map((a) => (
            <ArticoloCard key={a.slug} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}
