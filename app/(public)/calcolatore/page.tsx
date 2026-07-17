import type { Metadata } from "next";
import { Calcolatore } from "@/components/Calcolatore";

export const metadata: Metadata = {
  title: "Calcolatore costo reale noleggio",
  description:
    "Scopri quanto ti costa davvero al mese un'auto in noleggio a lungo termine, in base al tuo profilo fiscale. IVA recuperata e imposte risparmiate incluse.",
};

export default function CalcolatorePage() {
  return (
    <div className="container-content py-12 sm:py-16">
      <header className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold">Quanto costa davvero?</h1>
        <p className="mt-3 text-testo-chiaro/60">
          Il canone di listino è solo il punto di partenza. In base al tuo profilo fiscale recuperi
          IVA e deduci parte del costo: ecco cosa paghi realmente al mese.
        </p>
      </header>
      <div className="mx-auto max-w-2xl">
        <Calcolatore canoneModificabile />
      </div>
    </div>
  );
}
