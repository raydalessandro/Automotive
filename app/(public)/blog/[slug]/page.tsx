import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  articoliPubblicati,
  articoloBySlug,
  correlati,
  type Articolo,
} from "@/lib/blog";
import { labelCategoria } from "@/lib/blog/schema";
import { proseComponents } from "@/components/blog/prose";
import { CTAStrumento } from "@/components/blog/CTAStrumento";
import { Correlati } from "@/components/blog/Correlati";
import { Filetto } from "@/components/blog/Filetto";
import { dataIt } from "@/lib/format";
import { SITE, siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return articoliPubblicati().map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = articoloBySlug(params.slug);
  if (!a) return {};
  const url = `${siteUrl()}/blog/${a.slug}`;
  return {
    title: a.titolo,
    description: a.descrizione,
    keywords: [a.query_target, ...a.query_secondarie],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: a.titolo,
      description: a.descrizione,
      url,
      images: [`/api/og/blog/${a.slug}`],
    },
  };
}

function jsonLd(a: Articolo) {
  const base = siteUrl();
  const url = `${base}/blog/${a.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.titolo,
      description: a.descrizione,
      datePublished: a.data,
      dateModified: a.aggiornato_il ?? a.data,
      author: { "@type": "Organization", name: SITE.nome },
      publisher: { "@type": "Organization", name: SITE.nome },
      mainEntityOfPage: url,
      image: `${base}/api/og/blog/${a.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Blog", item: `${base}/blog` },
        {
          "@type": "ListItem",
          position: 2,
          name: labelCategoria(a.categoria),
          item: `${base}/blog/categoria/${a.categoria}`,
        },
        { "@type": "ListItem", position: 3, name: a.titolo, item: url },
      ],
    },
  ];
}

export default function ArticoloPage({ params }: { params: { slug: string } }) {
  const a = articoloBySlug(params.slug);
  if (!a) notFound();

  const aggiornato = a.aggiornato_il && a.aggiornato_il !== a.data;

  return (
    <article className="container-content py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(a)) }}
      />

      <nav className="mb-6 text-sm text-testo-chiaro/50">
        <Link href="/blog" className="hover:text-oro">
          Blog
        </Link>{" "}
        /{" "}
        <Link href={`/blog/categoria/${a.categoria}`} className="hover:text-oro">
          {labelCategoria(a.categoria)}
        </Link>
      </nav>

      <header className="max-w-prose">
        <p className="text-xs font-semibold uppercase tracking-widest text-oro">
          {labelCategoria(a.categoria)}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          {a.titolo}
        </h1>
        <Filetto />
        <p className="mt-5 text-sm text-testo-chiaro/55">
          {a.minutiLettura} min di lettura
          {aggiornato ? ` · Aggiornato il ${dataIt(a.aggiornato_il!)}` : ` · ${dataIt(a.data)}`}
        </p>
      </header>

      <div className="mt-8 max-w-prose">
        <MDXRemote source={a.contenuto} components={proseComponents} />
      </div>

      <div className="max-w-prose">
        <CTAStrumento cta={a.cta} />
      </div>

      <Correlati articoli={correlati(a)} />
    </article>
  );
}
