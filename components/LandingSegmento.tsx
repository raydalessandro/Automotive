import Link from "next/link";
import Image from "next/image";
import { Calcolatore } from "./Calcolatore";
import { VeicoloCard } from "./VeicoloCard";
import { Faq, type FaqItem } from "./Faq";
import type { ProfiloId } from "@/lib/fiscale.config";
import type { Segmento } from "@/lib/servizi.config";
import type { Veicolo } from "@/lib/catalogo";

type Props = {
  occhiello: string;
  titolo: string;
  sottotitolo: string;
  puntiChiave: string[];
  profilo: ProfiloId;
  segmento: Segmento;
  canoneEsempio?: number;
  anticipoEsempio?: number;
  durataEsempio?: number;
  veicoli: Veicolo[];
  titoloVeicoli: string;
  faq: FaqItem[];
  ctaTesto: string;
  children?: React.ReactNode;
  /** Foto editoriale del segmento: se presente, mostra una fascia visual sotto l'hero. */
  foto?: { src: string; alt: string };
};

export function LandingSegmento({
  occhiello,
  titolo,
  sottotitolo,
  puntiChiave,
  profilo,
  segmento,
  canoneEsempio = 300,
  anticipoEsempio = 0,
  durataEsempio = 48,
  veicoli,
  titoloVeicoli,
  faq,
  ctaTesto,
  children,
  foto,
}: Props) {
  return (
    <>
      <section className="bg-nero text-testo-scuro">
        <div className="container-content grid gap-10 py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-oro">{occhiello}</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              {titolo}
            </h1>
            <p className="mt-4 max-w-lg text-lg text-testo-scuro/75">{sottotitolo}</p>
            <ul className="mt-6 space-y-2">
              {puntiChiave.map((p) => (
                <li key={p} className="flex items-start gap-2 text-testo-scuro/85">
                  <span className="mt-0.5 text-oro">✓</span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/preventivo" className="btn-oro">
                {ctaTesto}
              </Link>
              <Link href={`/configuratore?segmento=${segmento}`} className="btn-ghost">
                Configura la tua rata
              </Link>
            </div>
          </div>
          <div className="text-testo-chiaro">
            <Calcolatore
              profiloIniziale={profilo}
              canoneIniziale={canoneEsempio}
              anticipoIniziale={anticipoEsempio}
              durataIniziale={durataEsempio}
              canoneModificabile
            />
          </div>
        </div>
      </section>

      {foto && (
        <section className="bg-nero">
          <div className="container-content pb-16 lg:pb-20">
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-testo-scuro/10">
              <Image
                src={foto.src}
                alt={foto.alt}
                fill
                sizes="(min-width: 1024px) 68rem, 100vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-nero/30 to-transparent" />
            </div>
          </div>
        </section>
      )}

      {children}

      {veicoli.length > 0 && (
        <section className="container-content py-16">
          <h2 className="font-display text-3xl font-semibold">{titoloVeicoli}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {veicoli.slice(0, 6).map((v) => (
              <VeicoloCard key={v.id} v={v} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-avorio">
        <div className="container-content py-16">
          <h2 className="font-display text-3xl font-semibold">Domande frequenti</h2>
          <div className="mt-8 max-w-3xl">
            <Faq items={faq} />
          </div>
        </div>
      </section>

      <section className="bg-nero text-testo-scuro">
        <div className="container-content flex flex-col items-center gap-5 py-16 text-center">
          <h2 className="max-w-2xl font-display text-3xl font-semibold">
            Facciamo due conti sul tuo prossimo veicolo?
          </h2>
          <Link href="/preventivo" className="btn-oro">
            {ctaTesto}
          </Link>
        </div>
      </section>
    </>
  );
}
