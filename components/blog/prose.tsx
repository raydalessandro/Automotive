import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

// Mappa dei componenti per il corpo MDX (§1). Nessuna sidebar, prosa in max-w-prose,
// titoli Fraunces, link oro. Resa lato server: zero JS client.

function A({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) {
  const interno = href.startsWith("/") || href.startsWith("#");
  if (interno) {
    return (
      <Link href={href} className="text-oro underline decoration-oro/40 underline-offset-2 hover:decoration-oro">
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-oro underline decoration-oro/40 underline-offset-2 hover:decoration-oro"
      {...rest}
    >
      {children}
    </a>
  );
}

export const proseComponents = {
  a: A,
  h2: (p: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-10 font-display text-2xl font-semibold sm:text-3xl" {...p} />
  ),
  h3: (p: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-8 font-display text-xl font-semibold" {...p} />
  ),
  p: (p: ComponentPropsWithoutRef<"p">) => (
    <p className="mt-4 leading-relaxed text-testo-chiaro/85" {...p} />
  ),
  ul: (p: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-testo-chiaro/85 marker:text-oro" {...p} />
  ),
  ol: (p: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-testo-chiaro/85 marker:text-oro" {...p} />
  ),
  li: (p: ComponentPropsWithoutRef<"li">) => <li className="leading-relaxed" {...p} />,
  strong: (p: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-testo-chiaro" {...p} />
  ),
  blockquote: (p: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="mt-6 rounded-r-lg border-l-2 border-oro bg-oro/5 py-3 pl-5 pr-4 text-sm text-testo-chiaro/70"
      {...p}
    />
  ),
  h1: (p: ComponentPropsWithoutRef<"h1">) => (
    // Gli articoli hanno un solo H1 (nell'header di pagina): un eventuale # nel corpo
    // diventa H2 per non spezzare la gerarchia SEO.
    <h2 className="mt-10 font-display text-2xl font-semibold sm:text-3xl" {...p} />
  ),
  table: (p: ComponentPropsWithoutRef<"table">) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...p} />
    </div>
  ),
  th: (p: ComponentPropsWithoutRef<"th">) => (
    <th className="border-b border-nero/15 px-3 py-2 text-left font-semibold" {...p} />
  ),
  td: (p: ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-nero/10 px-3 py-2 align-top" {...p} />
  ),
  hr: () => <hr className="my-8 border-nero/10" />,
};
