import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  tuttiVeicoli,
  veicoloById,
  titoloVeicolo,
  badge,
  kmAnno,
  type Veicolo,
} from "@/lib/catalogo";
import { VeicoloImg } from "@/components/VeicoloImg";
import { MicroGaranzie } from "@/components/design/MicroGaranzie";
import { CanoneEquivalente } from "@/components/CanoneEquivalente";
import { FasciaAnticipo } from "@/components/FasciaAnticipo";
import { Calcolatore } from "@/components/Calcolatore";
import { TracciaVeicolo } from "@/components/traccia/TracciaVeicolo";
import { LinkTracciato } from "@/components/traccia/LinkTracciato";
import { euro, numero } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { whatsappLink } from "@/lib/contatti";

const COME_LAVORIAMO = [
  { icona: "/asset/icone-business/consulenza-dedicata.svg", t: "Un interlocutore" },
  { icona: "/asset/icone-business/risposta-24h.svg", t: "Risposta rapida" },
  { icona: "/asset/icone-business/consegna-nazionale.svg", t: "In tutta Italia" },
];

export function generateStaticParams() {
  return tuttiVeicoli().map((v) => ({ id: v.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const v = veicoloById(params.id);
  if (!v) return {};
  const titolo = titoloVeicolo(v);
  return {
    title: titolo,
    description: `${titolo} in noleggio a lungo termine da ${euro(v.canone_mese_iva_esclusa)}/mese + IVA. Durata ${v.durata_mesi} mesi, ${numero(kmAnno(v))} km/anno, tutti i servizi inclusi.`,
    openGraph: {
      title: titolo,
      images: [`/api/og/veicolo/${v.id}`],
    },
  };
}

function jsonLd(v: Veicolo) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: titoloVeicolo(v),
    brand: { "@type": "Brand", name: v.marca },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: v.canone_mese_iva_esclusa,
      // Prezzo IVA esclusa dichiarato (§9).
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: v.canone_mese_iva_esclusa,
        priceCurrency: "EUR",
        valueAddedTaxIncluded: false,
        unitText: "MES",
      },
      availability: "https://schema.org/InStock",
    },
  };
}

export default function VeicoloPage({ params }: { params: { id: string } }) {
  const v = veicoloById(params.id);
  if (!v || !v.attivo) notFound();

  const titolo = titoloVeicolo(v);
  const badges = badge(v);
  const urlScheda = `${siteUrl()}/veicoli/${v.id}`;
  const testoWa = `Ciao, sono interessato a ${titolo} (${euro(v.canone_mese_iva_esclusa)}/mese + IVA): ${urlScheda}`;

  const specifiche: { label: string; valore: string }[] = [
    { label: "Alimentazione", valore: v.alimentazione },
    { label: "Cambio", valore: v.cambio ?? "—" },
    { label: "Stato", valore: v.stato },
    { label: "Categoria", valore: v.categoria },
    { label: "Posti", valore: v.posti != null ? String(v.posti) : "—" },
    { label: "Anno", valore: v.anno != null ? String(v.anno) : "—" },
  ];

  return (
    <div className="container-content py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(v)) }}
      />
      <TracciaVeicolo id={v.id} />

      <nav className="mb-6 text-sm text-testo-chiaro/50">
        <Link href="/veicoli" className="hover:text-oro">
          Veicoli
        </Link>{" "}
        / <span className="text-testo-chiaro/70">{titolo}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-nero/10 bg-avorio">
            <VeicoloImg
              src={v.foto}
              alt={titolo}
              priority
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-oro">{v.marca}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
              {v.modello} <span className="font-sans text-lg font-normal text-testo-chiaro/60">{v.versione}</span>
            </h1>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <span
                  key={b.label}
                  className={
                    b.tono === "oro"
                      ? "rounded-full bg-oro/15 px-3 py-1 text-xs font-medium text-oro"
                      : "rounded-full bg-nero/5 px-3 py-1 text-xs font-medium text-testo-chiaro/70"
                  }
                >
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-nero/10 bg-nero/10 sm:grid-cols-3">
            {specifiche.map((s) => (
              <div key={s.label} className="bg-carta p-4">
                <dt className="text-xs uppercase tracking-wide text-testo-chiaro/50">{s.label}</dt>
                <dd className="mt-1 font-medium capitalize">{s.valore}</dd>
              </div>
            ))}
          </dl>

          {/* Come lavoriamo — registro consulenza (icone-business). */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {COME_LAVORIAMO.map((c) => (
              <div key={c.t} className="flex flex-col items-center gap-2 rounded-xl border border-nero/10 bg-carta p-3 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.icona} alt="" aria-hidden="true" className="h-8 w-8" />
                <span className="text-xs font-medium text-testo-chiaro/70">{c.t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-20 lg:h-fit">
          {/* Box offerta */}
          <div className="rounded-2xl border border-nero/10 bg-carta p-6">
            <p className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold tabular text-nero">
                {euro(v.canone_mese_iva_esclusa)}
              </span>
              <span className="text-testo-chiaro/60">/mese + IVA</span>
            </p>
            <CanoneEquivalente
              canone={v.canone_mese_iva_esclusa}
              anticipo={v.anticipo_iva_esclusa}
              durata={v.durata_mesi}
              className="mt-1"
            />
            <p className="mt-1 text-sm text-oro">Tutti i servizi inclusi</p>

            <dl className="mt-5 space-y-2 text-sm">
              <Voce label="Durata" valore={`${v.durata_mesi} mesi`} />
              <Voce label="Km totali" valore={`${numero(v.km_totali)} km`} />
              <Voce label="Km/anno" valore={`${numero(kmAnno(v))} km`} />
              <Voce
                label="Anticipo"
                valore={v.anticipo_iva_esclusa === 0 ? "Zero" : `${euro(v.anticipo_iva_esclusa)} + IVA`}
              />
            </dl>

            <div className="mt-6 flex flex-col gap-2">
              <Link href={`/configuratore?veicolo=${v.id}`} className="btn-oro w-full">
                Configura la tua rata
              </Link>
              <Link href={`/preventivo?veicolo=${v.id}`} className="btn-ghost w-full">
                Richiedi il preventivo
              </Link>
              <LinkTracciato
                tipo="condividi_click"
                veicoloId={v.id}
                href={whatsappLink(testoWa)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full"
              >
                Condividi su WhatsApp
              </LinkTracciato>
            </div>
            <MicroGaranzie className="mt-4 justify-center" />
          </div>

          {/* Anticipo zero (§2): fascia compatta sulle schede senza anticipo. */}
          {v.anticipo_iva_esclusa === 0 && (
            <div className="mt-6">
              <FasciaAnticipo compatta />
            </div>
          )}

          {/* Calcolatore inline preimpostato sul canone */}
          <div className="mt-6">
            <Calcolatore
              canoneIniziale={v.canone_mese_iva_esclusa}
              anticipoIniziale={v.anticipo_iva_esclusa}
              durataIniziale={v.durata_mesi}
              profiloIniziale={v.n1 ? "n1_strumentale" : "srl_ordinaria"}
            />
          </div>
        </div>
      </div>

      {/* Il momento del possesso — "le chiavi sono tue". */}
      <div className="mt-14 grid overflow-hidden rounded-2xl border border-nero/10 bg-carta sm:grid-cols-2 sm:items-center">
        <div className="relative aspect-[3/2]">
          <Image
            src="/foto/foto-chiavi.webp"
            alt="Consegna delle chiavi di un veicolo"
            fill
            sizes="(min-width: 640px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Poi le chiavi sono <span className="text-oro">tue</span>.
          </h2>
          <p className="mt-3 max-w-md text-testo-chiaro/65">
            Scegli, firma e parti. Ad assicurazione, bollo, manutenzione e imprevisti pensiamo noi:
            tu pensa solo a lavorare.
          </p>
        </div>
      </div>
    </div>
  );
}

function Voce({ label, valore }: { label: string; valore: string }) {
  return (
    <div className="flex items-center justify-between border-b border-nero/5 pb-2">
      <dt className="text-testo-chiaro/60">{label}</dt>
      <dd className="tabular font-medium">{valore}</dd>
    </div>
  );
}
