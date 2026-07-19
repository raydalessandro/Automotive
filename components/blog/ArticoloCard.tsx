import Link from "next/link";
import { labelCategoria } from "@/lib/blog/schema";
import type { Articolo } from "@/lib/blog";

// Card articolo per l'indice e i correlati — stesso linguaggio delle card veicolo (§7).
export function ArticoloCard({ a }: { a: Articolo }) {
  return (
    <Link
      href={`/blog/${a.slug}`}
      className="group flex flex-col rounded-2xl border border-nero/10 bg-carta p-6 transition-shadow hover:shadow-lg focus-visible:shadow-lg"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-oro">
        {labelCategoria(a.categoria)}
      </p>
      <h3 className="mt-2 font-display text-xl font-semibold leading-tight group-hover:text-oro">
        {a.titolo}
      </h3>
      <p className="mt-2 flex-1 text-sm text-testo-chiaro/70">{a.descrizione}</p>
      <p className="mt-4 text-xs text-testo-chiaro/50">{a.minutiLettura} min di lettura</p>
    </Link>
  );
}
