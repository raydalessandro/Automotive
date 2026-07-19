import Link from "next/link";
import { CTA_STRUMENTI, type CtaStrumento } from "@/lib/blog/schema";

// Fine articolo (§1). La CTA è pilotata dal frontmatter: ogni articolo atterra su
// UNO strumento o UNA landing. Link server (nessun JS client).
export function CTAStrumento({ cta }: { cta: CtaStrumento }) {
  const c = CTA_STRUMENTI[cta];
  return (
    <aside className="mt-12 rounded-2xl border border-oro/30 bg-nero p-7 text-testo-scuro sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-widest text-oro">{c.occhiello}</p>
      <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{c.titolo}</h2>
      <p className="mt-2 max-w-xl text-testo-scuro/75">{c.testo}</p>
      <Link href={c.href} className="btn-oro mt-5">
        {c.azione}
      </Link>
    </aside>
  );
}
