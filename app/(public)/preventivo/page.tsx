import type { Metadata } from "next";
import Image from "next/image";
import { FormPreventivo } from "@/components/FormPreventivo";
import { veicoloById, titoloVeicolo } from "@/lib/catalogo";
import { CONTATTI } from "@/lib/contatti";

export const metadata: Metadata = {
  title: "Richiedi un preventivo",
  description:
    "Raccontaci di cosa hai bisogno: ti prepariamo un preventivo di noleggio a lungo termine su misura e ti richiamiamo.",
};

export default function PreventivoPage({
  searchParams,
}: {
  searchParams: { veicolo?: string };
}) {
  const veicolo = searchParams.veicolo ? veicoloById(searchParams.veicolo) : undefined;

  return (
    <div className="container-content py-12 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="font-display text-4xl font-semibold">Richiedi il tuo preventivo</h1>
          <p className="mt-3 text-testo-chiaro/65">
            Compila il form: prepariamo un preventivo su misura per la tua attività e ti richiamiamo
            entro poche ore lavorative.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Preventivo gratuito e senza impegno",
              "Formule pensate per la tua forma giuridica",
              "Tutti i servizi inclusi nel canone",
            ].map((x) => (
              <li key={x} className="flex items-start gap-2 text-testo-chiaro/75">
                <span className="mt-0.5 text-oro">✓</span>
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-xl border border-nero/10 bg-carta p-5 text-sm">
            <p className="font-medium">Preferisci parlarne subito?</p>
            <p className="mt-2 text-testo-chiaro/70">
              <a href={`tel:${CONTATTI.telefonoHref}`} className="text-oro hover:underline">
                {CONTATTI.telefono}
              </a>
            </p>
          </div>

          {/* Il momento del possesso — aggancia il filo "le chiavi sono tue". */}
          <figure className="mt-8 hidden overflow-hidden rounded-2xl lg:block">
            <div className="relative aspect-[3/2]">
              <Image
                src="/foto/foto-chiavi.webp"
                alt="Consegna delle chiavi di un veicolo"
                fill
                sizes="40vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 font-display text-lg font-semibold text-testo-chiaro">
              Poi le chiavi sono <span className="text-oro">tue</span>.
            </figcaption>
          </figure>
        </div>

        <FormPreventivo
          veicoloId={veicolo?.id}
          veicoloTitolo={veicolo ? titoloVeicolo(veicolo) : undefined}
        />
      </div>
    </div>
  );
}
