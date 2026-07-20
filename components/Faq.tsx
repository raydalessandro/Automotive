import Link from "next/link";

export type FaqItem = { d: string; r: string; cta?: { href: string; label: string } };

// FAQ con <details> nativo (accessibile, nessun JS). Genera anche JSON-LD FAQPage.
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((i) => ({
              "@type": "Question",
              name: i.d,
              acceptedAnswer: { "@type": "Answer", text: i.r },
            })),
          }),
        }}
      />
      <div className="divide-y divide-nero/10 rounded-2xl border border-nero/10 bg-carta">
        {items.map((i) => (
          <details key={i.d} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {i.d}
              <span className="text-oro transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-testo-chiaro/70">{i.r}</p>
            {i.cta && (
              <Link href={i.cta.href} className="mt-3 inline-block text-sm font-medium text-oro hover:underline">
                {i.cta.label} →
              </Link>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}
