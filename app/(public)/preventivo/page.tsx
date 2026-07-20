import type { Metadata } from "next";
import Image from "next/image";
import { FormPreventivo } from "@/components/FormPreventivo";
import { CanaliPreventivo } from "@/components/CanaliPreventivo";
import { CardRichiamo } from "@/components/CardRichiamo";
import { veicoloById, titoloVeicolo } from "@/lib/catalogo";
import { CONTATTI } from "@/lib/contatti";
import { Filetto } from "@/components/design/RuotaGuilloche";

export const metadata: Metadata = {
  title: "Richiedi un preventivo",
  description:
    "Raccontaci di cosa hai bisogno: ti prepariamo un preventivo di noleggio a lungo termine su misura e ti richiamiamo.",
};

const PASSI = [
  {
    icona: "/asset/icone-business/risposta-24h.svg",
    t: "Ti rispondiamo entro 24h",
    d: "Prepariamo la proposta su misura per la tua attività e ti ricontattiamo noi.",
  },
  {
    icona: "/asset/icone-business/consulenza-dedicata.svg",
    t: "Un solo interlocutore",
    d: "Una persona ti segue dalla scelta alla consegna, non un call center.",
  },
  {
    icona: "/asset/icone-business/risparmio-fiscale.svg",
    t: "Ottimizzata sul tuo fisco",
    d: "La formula giusta per la tua forma giuridica, deduzione e IVA al massimo.",
  },
];

export default function PreventivoPage({
  searchParams,
}: {
  searchParams: { veicolo?: string };
}) {
  const veicolo = searchParams.veicolo ? veicoloById(searchParams.veicolo) : undefined;
  const veicoloTitolo = veicolo ? titoloVeicolo(veicolo) : undefined;

  return (
    <div className="container-content py-12 sm:py-16">
      {/* Header */}
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-oro">Preventivo</p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Richiedi il tuo preventivo</h1>
        <p className="mx-auto mt-4 max-w-xl text-testo-chiaro/65">
          Gratuito e senza impegno. Scegli come preferisci: ti prepariamo una proposta su misura per
          la tua attività.
        </p>
        <Filetto className="mx-auto mt-5 h-4 w-52 text-oro" />
        <CardRichiamo className="mx-auto mt-6 max-w-md text-left" />
      </header>

      {/* Canali di invio */}
      <div className="mx-auto mt-10 max-w-4xl">
        <CanaliPreventivo veicoloTitolo={veicoloTitolo} veicoloId={veicolo?.id} />
      </div>

      {/* Form + sidebar */}
      <div
        id="form"
        className="mx-auto mt-16 grid max-w-5xl scroll-mt-24 gap-10 lg:grid-cols-[1.15fr_0.85fr]"
      >
        <div>
          <h2 className="font-display text-2xl font-semibold">Oppure lasciaci i dati</h2>
          <p className="mt-2 text-sm text-testo-chiaro/60">
            Compila il form: la richiesta arriva al nostro team e ti ricontattiamo noi.
          </p>
          <div className="mt-6">
            <FormPreventivo veicoloId={veicolo?.id} veicoloTitolo={veicoloTitolo} />
          </div>
        </div>

        <aside className="lg:pt-14">
          <div className="rounded-2xl border border-nero/10 bg-carta p-6">
            <h3 className="font-display text-lg font-semibold">Cosa succede dopo</h3>
            <ul className="mt-5 space-y-5">
              {PASSI.map((p) => (
                <li key={p.t} className="flex gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.icona} alt="" aria-hidden="true" className="mt-0.5 h-9 w-9 shrink-0" />
                  <div>
                    <p className="font-medium text-testo-chiaro">{p.t}</p>
                    <p className="mt-0.5 text-sm text-testo-chiaro/60">{p.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 rounded-2xl border border-oro/25 bg-nero p-6 text-testo-scuro">
            <p className="text-sm font-medium">Preferisci parlarne subito?</p>
            <a
              href={`tel:${CONTATTI.telefonoHref}`}
              className="mt-1 block font-display text-xl font-semibold text-oro hover:text-oro-chiaro"
            >
              {CONTATTI.telefono}
            </a>
            <p className="mt-1 text-xs text-testo-scuro/55">{CONTATTI.orari}</p>
          </div>

          {/* Il momento del possesso — aggancia il filo "le chiavi sono tue". */}
          <figure className="mt-5 hidden overflow-hidden rounded-2xl lg:block">
            <div className="relative aspect-[3/2]">
              <Image
                src="/foto/foto-chiavi.webp"
                alt="Consegna delle chiavi di un veicolo"
                fill
                sizes="35vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 font-display text-lg font-semibold text-testo-chiaro">
              Poi le chiavi sono <span className="text-oro">tue</span>.
            </figcaption>
          </figure>
        </aside>
      </div>
    </div>
  );
}
