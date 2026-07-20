import Link from "next/link";
import { Filetto } from "@/components/design/RuotaGuilloche";

// Fascia "Anticipo zero. Davvero." — §2. Copy definitivo, non riscrivere.
// L'esempio 199×36 + 5.900 = 13.064 → ~363 €/mese è verificato: non alterarlo.
export function FasciaAnticipo({
  compatta = false,
  cta = "calcolatore",
}: {
  compatta?: boolean;
  cta?: "calcolatore" | "consulente";
}) {
  // Versione compatta (scheda con anticipo zero, vicino al box canone).
  if (compatta) {
    return (
      <div className="rounded-2xl border border-oro/30 bg-oro/5 p-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rotate-45 bg-oro" aria-hidden="true" />
          <p className="font-display text-lg font-semibold">Anticipo zero. Davvero.</p>
        </div>
        <p className="mt-1 text-sm text-testo-chiaro/70">
          Il canone che vedi è il canone che paghi: nessun anticipo nascosto.
        </p>
      </div>
    );
  }

  const ctaHref = cta === "consulente" ? "/consulente" : "/calcolatore";
  return (
    <section className="bg-avorio">
      <div className="container-content py-14 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-oro">Nessun trucco</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Anticipo zero. Davvero.</h2>
          <Filetto className="mt-4 h-4 w-40 text-oro" />
          <p className="mt-5 text-testo-chiaro/75">
            Molte offerte pubblicizzano canoni bassi che nascondono anticipi di migliaia di euro:
            un canone da 199 € al mese con 5.900 € di anticipo su 36 mesi costa in realtà circa
            363 € al mese. Da noi il canone che vedi è il canone che paghi — e quando un veicolo
            ha un anticipo, te lo mostriamo subito anche come canone equivalente.
          </p>
          <p className="mt-3 text-sm italic text-testo-chiaro/60">
            Confronta sempre così: (canone × mesi + anticipo) ÷ mesi.
          </p>
          <Link href={ctaHref} className="btn-oro mt-6">
            Fai i conti sulla tua offerta
          </Link>
        </div>
      </div>
    </section>
  );
}
