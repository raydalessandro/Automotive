import type { Metadata } from "next";
import { veicoliAttivi } from "@/lib/catalogo";
import { VeicoliFiltrati } from "@/components/VeicoliFiltrati";
import { BannerFiscale } from "@/components/design/BannerFiscale";
import { IconaServizio } from "@/components/design/FasciaServizi";
import { Filetto } from "@/components/design/RuotaGuilloche";

const SERVIZI_STRIP = [
  { id: "assicurazione", l: "Assicurazione" },
  { id: "manutenzione", l: "Manutenzione" },
  { id: "pneumatici", l: "Pneumatici" },
  { id: "bollo", l: "Bollo" },
  { id: "assistenza", l: "Assistenza" },
  { id: "km", l: "Km inclusi" },
];

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
        <Filetto className="mt-4 h-4 w-44 text-oro" />
        <p className="mt-4 max-w-2xl text-testo-chiaro/60">
          Auto, SUV e veicoli commerciali in noleggio a lungo termine. Canoni IVA esclusa, tutti i
          servizi inclusi.
        </p>
      </header>

      {/* Fascia servizi inclusi — alfabeto single-line del sito, in tono soft. */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl border border-nero/10 bg-carta px-6 py-5">
        {SERVIZI_STRIP.map((s) => (
          <div key={s.id} className="flex items-center gap-2 text-testo-chiaro/70">
            <IconaServizio servizio={s.id} className="h-6 w-6 text-oro/75" />
            <span className="text-xs font-medium uppercase tracking-wide">{s.l}</span>
          </div>
        ))}
      </div>

      <VeicoliFiltrati veicoli={veicoli} />
      <div className="mt-14">
        <BannerFiscale conCta />
      </div>
    </div>
  );
}
