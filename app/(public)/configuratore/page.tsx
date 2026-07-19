import type { Metadata } from "next";
import { Configuratore } from "@/components/Configuratore";
import { veicoloById, titoloVeicolo } from "@/lib/catalogo";
import type { Segmento } from "@/lib/servizi.config";

export const metadata: Metadata = {
  title: "Configura la tua rata — Nessuna sorpresa",
  description:
    "Per ogni rischio del noleggio vedi cosa può succedere se sei scoperto e quanto costa coprirti. Scegli tu cosa coprire: nessun upsell subìto, l'attività non si ferma.",
};

const SEGMENTI_VALIDI: Segmento[] = ["artigiani", "agenti", "pmi", "forfettari"];

export default function ConfiguratorePage({
  searchParams,
}: {
  searchParams: { veicolo?: string; segmento?: string };
}) {
  const veicolo = searchParams.veicolo ? veicoloById(searchParams.veicolo) : undefined;
  const segmento =
    searchParams.segmento && SEGMENTI_VALIDI.includes(searchParams.segmento as Segmento)
      ? (searchParams.segmento as Segmento)
      : undefined;

  return (
    <div className="container-content py-12 sm:py-16">
      <header className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold">Nessuna sorpresa.</h1>
        <p className="mt-2 font-display text-2xl text-oro">Scegli tu cosa coprire.</p>
        <p className="mt-4 text-testo-chiaro/65">
          Per ogni rischio ti mostriamo cosa succede se sei scoperto e quanto costa la copertura.
          Decidi tu: o ti copri, o accetti il rischio con i conti in chiaro.
        </p>
      </header>

      <div className="mx-auto max-w-3xl">
        <Configuratore
          canoneIniziale={veicolo?.canone_mese_iva_esclusa}
          veicoloId={veicolo?.id}
          veicoloTitolo={veicolo ? titoloVeicolo(veicolo) : undefined}
          durataIniziale={veicolo?.durata_mesi}
          segmentoEvidenza={segmento}
          canoneModificabile={!veicolo}
        />
      </div>
    </div>
  );
}
