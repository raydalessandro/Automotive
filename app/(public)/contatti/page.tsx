import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CONTATTI, whatsappLink } from "@/lib/contatti";
import { LinkTracciato } from "@/components/traccia/LinkTracciato";
import { MicroGaranzie } from "@/components/design/MicroGaranzie";
import { Filetto } from "@/components/design/RuotaGuilloche";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contatti",
  description: `Contatta ${SITE.nome}: telefono, WhatsApp ed email per il tuo preventivo di noleggio a lungo termine.`,
};

const LAVORO = [
  {
    icona: "/asset/icone-business/consulenza-dedicata.svg",
    t: "Un solo interlocutore",
    d: "Una persona ti segue dalla scelta alla consegna.",
  },
  {
    icona: "/asset/icone-business/risposta-24h.svg",
    t: "Risposta rapida",
    d: "Ti ricontattiamo in poche ore lavorative.",
  },
  {
    icona: "/asset/icone-business/consegna-nazionale.svg",
    t: "In tutta Italia",
    d: "Consegniamo il veicolo dove lavori tu.",
  },
  {
    icona: "/asset/icone-business/supporto-aziende.svg",
    t: "Anche dopo la firma",
    d: "Restiamo il tuo riferimento per tutta la durata.",
  },
];

export default function ContattiPage() {
  return (
    <div className="container-content py-12 sm:py-16">
      {/* Header + immagine "studio di consulenza" */}
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-oro">Contatti</p>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Parliamone</h1>
          <Filetto className="mt-5 h-4 w-52 text-oro" />
          <p className="mt-5 max-w-lg text-testo-chiaro/70">
            Non un call center: un consulente che costruisce la formula giusta per la tua attività.
            Scrivici o chiamaci, oppure richiedi un preventivo su misura.
          </p>
          <Link href="/preventivo" className="btn-oro mt-6">
            Richiedi il preventivo
          </Link>
          <MicroGaranzie className="mt-6" />
        </div>
        <figure className="relative aspect-[3/2] overflow-hidden rounded-2xl">
          <Image
            src="/foto/foto-consulenza.webp"
            alt="Consulente e cliente esaminano una proposta di noleggio"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </figure>
      </div>

      {/* Canali diretti */}
      {/* [APERTO §11: numeri e orari definitivi] */}
      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        <LinkTracciato
          tipo="telefono_click"
          href={`tel:${CONTATTI.telefonoHref}`}
          className="rounded-2xl border border-nero/10 bg-carta p-6 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-oro">Telefono</p>
          <p className="mt-2 font-display text-xl font-semibold">{CONTATTI.telefono}</p>
          <p className="mt-1 text-sm text-testo-chiaro/55">{CONTATTI.orari}</p>
        </LinkTracciato>
        <LinkTracciato
          tipo="whatsapp_click"
          href={whatsappLink("Ciao, vorrei informazioni sul noleggio a lungo termine.")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-nero/10 bg-carta p-6 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-oro">WhatsApp</p>
          <p className="mt-2 font-display text-xl font-semibold">Scrivici su WhatsApp</p>
          <p className="mt-1 text-sm text-testo-chiaro/55">Ti rispondiamo in giornata.</p>
        </LinkTracciato>
        <a
          href={`mailto:${CONTATTI.email}`}
          className="rounded-2xl border border-nero/10 bg-carta p-6 transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-oro">Email</p>
          <p className="mt-2 font-display text-xl font-semibold break-all">{CONTATTI.email}</p>
          <p className="mt-1 text-sm text-testo-chiaro/55">Per richieste dettagliate.</p>
        </a>
      </div>

      {/* Come lavoriamo — registro consulenza */}
      <div className="mt-14">
        <h2 className="font-display text-2xl font-semibold">Come lavoriamo con te</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LAVORO.map((l) => (
            <div key={l.t} className="rounded-2xl border border-nero/10 bg-carta p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.icona} alt="" aria-hidden="true" className="h-10 w-10" />
              <p className="mt-3 font-display text-base font-semibold">{l.t}</p>
              <p className="mt-1 text-sm text-testo-chiaro/60">{l.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
