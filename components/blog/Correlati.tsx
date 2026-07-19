import { ArticoloCard } from "./ArticoloCard";
import type { Articolo } from "@/lib/blog";

// Box "correlati" a fine articolo (§1): stessa categoria, max 3.
export function Correlati({ articoli }: { articoli: Articolo[] }) {
  if (articoli.length === 0) return null;
  return (
    <section className="mt-14 border-t border-nero/10 pt-10">
      <h2 className="font-display text-xl font-semibold">Continua a leggere</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articoli.map((a) => (
          <ArticoloCard key={a.slug} a={a} />
        ))}
      </div>
    </section>
  );
}
