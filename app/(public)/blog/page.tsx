import type { Metadata } from "next";
import Link from "next/link";
import {
  articoliPubblicati,
  articoliInEvidenza,
  categorieConArticoli,
  articoliPerCategoria,
} from "@/lib/blog";
import { labelCategoria } from "@/lib/blog/schema";
import { ArticoloCard } from "@/components/blog/ArticoloCard";
import { Filetto } from "@/components/blog/Filetto";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog — noleggio a lungo termine per partite IVA",
  description:
    "Guide chiare su noleggio a lungo termine, fisco e deducibilità per partite IVA, PMI e professionisti. Ogni articolo con lo strumento per fare i conti da te.",
  alternates: { canonical: `${siteUrl()}/blog` },
};

export default function BlogIndex() {
  const evidenza = articoliInEvidenza();
  const categorie = categorieConArticoli();
  const totale = articoliPubblicati().length;

  return (
    <div className="container-content py-10 sm:py-14">
      <header className="max-w-prose">
        <p className="text-xs font-semibold uppercase tracking-widest text-oro">Il blog</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Noleggio, fisco e flotte, spiegati semplice
        </h1>
        <Filetto />
        <p className="mt-5 text-testo-chiaro/75">
          Zero gergo. Ogni articolo nasce da una domanda concreta e finisce sullo strumento
          per farti i conti da solo.
        </p>
      </header>

      {totale === 0 && (
        <p className="mt-12 text-testo-chiaro/60">Presto i primi articoli. Torna a trovarci.</p>
      )}

      {evidenza.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">In evidenza</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {evidenza.map((a) => (
              <ArticoloCard key={a.slug} a={a} />
            ))}
          </div>
        </section>
      )}

      {categorie.map((c) => (
        <section key={c.id} className="mt-14">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-semibold">{labelCategoria(c.id)}</h2>
            <Link
              href={`/blog/categoria/${c.id}`}
              className="text-sm font-medium text-oro hover:underline"
            >
              Vedi tutti
            </Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articoliPerCategoria(c.id).slice(0, 3).map((a) => (
              <ArticoloCard key={a.slug} a={a} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
