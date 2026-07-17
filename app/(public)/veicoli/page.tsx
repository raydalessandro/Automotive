import type { Metadata } from "next";
import { veicoliAttivi } from "@/lib/catalogo";
import { VeicoliFiltrati } from "@/components/VeicoliFiltrati";

export const metadata: Metadata = {
  title: "Veicoli in noleggio a lungo termine",
  description:
    "Auto, SUV e veicoli commerciali in noleggio a lungo termine per partite IVA e aziende. Canoni IVA esclusa, tutti i servizi inclusi.",
};

export default function VeicoliPage() {
  const veicoli = veicoliAttivi();
  return (
    <div className="container-content py-12 sm:py-16">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-semibold">I nostri veicoli</h1>
        <p className="mt-2 max-w-2xl text-testo-chiaro/60">
          Auto, SUV e veicoli commerciali in noleggio a lungo termine. Canoni IVA esclusa, tutti i
          servizi inclusi.
        </p>
      </header>
      <VeicoliFiltrati veicoli={veicoli} />
    </div>
  );
}
