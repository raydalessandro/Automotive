import Link from "next/link";
import Image from "next/image";
import { veicoliInEvidenza } from "@/lib/catalogo";
import { VeicoloCard } from "@/components/VeicoloCard";
import { SITE } from "@/lib/site";
import { LineaVeicoli } from "@/components/design/LineaVeicoli";
import { FasciaServizi } from "@/components/design/FasciaServizi";
import { TabellaConfronto } from "@/components/design/TabellaConfronto";
import { MicroGaranzie } from "@/components/design/MicroGaranzie";
import { Filetto } from "@/components/design/RuotaGuilloche";

const SEGMENTI = [
  {
    href: "/agenti",
    titolo: "Agenti e rappresentanti",
    testo: "80% deducibile, IVA al 100%. Berline e SUV per chi vive in strada.",
  },
  {
    href: "/artigiani",
    titolo: "Artigiani e installatori",
    testo: "Veicoli commerciali N1: canone 100% deducibile, IVA piena.",
  },
  {
    href: "/aziende",
    titolo: "Aziende e flotte",
    testo: "Flotta operativa e auto in fringe benefit, con l'elettrica che conviene.",
  },
];

const PASSI = [
  { n: "1", t: "Scegli il veicolo", d: "Sfoglia il listino o dicci cosa ti serve." },
  { n: "2", t: "Ti richiamiamo", d: "Prepariamo il preventivo su misura e ti contattiamo." },
  { n: "3", t: "Guidi", d: "Firma, ricevi il veicolo e pensa solo a lavorare." },
];

// "Perché scegliere noi" — registro consulenza (icone-business). Claim veri, nessun numero inventato.
const PERCHE = [
  {
    icona: "/asset/icone-business/consulenza-dedicata.svg",
    t: "Un solo interlocutore",
    d: "Dalla scelta alla consegna parli con una persona, non con un call center.",
  },
  {
    icona: "/asset/icone-business/confronto-offerte.svg",
    t: "Confrontiamo per te",
    d: "Mettiamo a confronto i listini dei principali operatori NLT e ti portiamo la proposta più adatta.",
  },
  {
    icona: "/asset/icone-business/risparmio-fiscale.svg",
    t: "Ottimizzato sul tuo fisco",
    d: "La formula giusta per la tua forma giuridica: deduzione e IVA al massimo che ti spetta.",
  },
  {
    icona: "/asset/icone-business/gestione-flotta.svg",
    t: "Anche per le flotte",
    d: "Più veicoli, un unico canone e un unico referente per tutta la gestione.",
  },
];

export default function Home() {
  const evidenza = veicoliInEvidenza().slice(0, 6);

  return (
    <>
      {/* Hero scuro */}
      <section className="overflow-hidden bg-nero text-testo-scuro">
        <div className="container-content grid gap-10 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-oro">
              Noleggio a lungo termine · Partite IVA e aziende
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
              {SITE.claim}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-testo-scuro/75">{SITE.descrizione}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/preventivo" className="btn-oro">
                Richiedi il preventivo
              </Link>
              <Link href="/calcolatore" className="btn-ghost">
                Calcola il tuo costo reale
              </Link>
            </div>
            {/* Micro-garanzie vicino alla CTA (trust nel punto di decisione). */}
            <MicroGaranzie scuro className="mt-6" />
          </div>
          {/* Visual: l'imprenditore e il suo mezzo. La CTA resta l'unico oro pieno. */}
          <div className="relative">
            <div className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-testo-scuro/10">
              <Image
                src="/foto/foto-hero.webp"
                alt="Imprenditore accanto al suo veicolo commerciale"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              {/* velo per far respirare il bordo scuro dell'hero */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-nero/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
        {/* Una sola linea: la firma del brand attraversa l'hero */}
        <div className="container-content pb-10 pt-8 lg:pt-10">
          <LineaVeicoli className="w-full" />
        </div>
      </section>

      {/* Veicoli in evidenza */}
      <section className="container-content py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">In evidenza</h2>
            <p className="mt-1 text-testo-chiaro/60">Le offerte del momento, canoni IVA esclusa.</p>
          </div>
          <Link href="/veicoli" className="hidden shrink-0 text-sm font-medium text-oro hover:underline sm:block">
            Tutti i veicoli →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {evidenza.map((v, i) => (
            <VeicoloCard key={v.id} v={v} priority={i < 3} />
          ))}
        </div>
        <div className="mt-8 sm:hidden">
          <Link href="/veicoli" className="text-sm font-medium text-oro hover:underline">
            Tutti i veicoli →
          </Link>
        </div>
      </section>

      {/* Tutto nel canone */}
      <FasciaServizi />

      {/* Come funziona */}
      <section className="bg-avorio">
        <div className="container-content py-16 sm:py-20">
          <h2 className="text-center font-display text-3xl font-semibold">Come funziona</h2>
          <Filetto className="mx-auto mt-4 h-4 w-52 text-oro" />
          <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-3">
            {PASSI.map((p) => (
              <div key={p.n} className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-oro font-display text-xl font-semibold text-nero">
                  {p.n}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">{p.t}</h3>
                <p className="mt-2 text-sm text-testo-chiaro/65">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Confronto noleggio vs acquisto — sezione decisione (CRO). */}
      <TabellaConfronto />

      {/* Perché scegliere noi — tono consulenza su fondo nero. Nessuna CTA: l'oro qui non compete con la conversione. */}
      <section className="bg-nero text-testo-scuro">
        <div className="container-content py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-oro">Perché {SITE.nomeBreve}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              Un noleggio seguito da persone, non da un portale
            </h2>
            <p className="mt-4 text-testo-scuro/70">
              Non vendiamo un&apos;auto e spariamo: costruiamo la formula giusta per la tua attività e
              restiamo il tuo riferimento, prima e dopo la firma.
            </p>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {PERCHE.map((p) => (
              <div key={p.t}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.icona} alt="" aria-hidden="true" className="h-12 w-12" />
                <h3 className="mt-4 font-display text-lg font-semibold">{p.t}</h3>
                <p className="mt-2 text-sm text-testo-scuro/65">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segmenti */}
      <section className="container-content py-16 sm:py-20">
        <h2 className="font-display text-3xl font-semibold">Su misura per la tua attività</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {SEGMENTI.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-2xl border border-nero/10 bg-carta p-6 transition-shadow hover:shadow-lg"
            >
              <h3 className="font-display text-xl font-semibold">{s.titolo}</h3>
              <p className="mt-2 text-sm text-testo-chiaro/65">{s.testo}</p>
              <span className="mt-4 inline-block text-sm font-medium text-oro group-hover:underline">
                Scopri →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Non ci pensi più — la corda emotiva: non compri un'auto, compri il non doverci pensare */}
      <section className="bg-avorio">
        <div className="container-content grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2">
          <div className="relative order-last aspect-[16/11] overflow-hidden rounded-2xl lg:order-first">
            <Image
              src="/foto/foto-tranquillita.webp"
              alt="Imprenditrice serena nel proprio studio"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-oro">Perché il noleggio</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Non compri un&apos;auto.
              <br />
              Compri il non doverci <span className="italic text-oro">più pensare.</span>
            </h2>
            <p className="mt-5 max-w-lg text-testo-chiaro/70">
              Assicurazione, bollo, manutenzione, imprevisti: tutto in un unico canone fisso. Tu pensi a lavorare,
              del resto ci occupiamo noi.
            </p>
            <Link href="/calcolatore" className="mt-6 inline-block text-sm font-medium text-oro hover:underline">
              Scopri quanto risparmi davvero →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA finale — sfondo materico scuro con riflessi d'oro, testo in overlay */}
      <section className="relative overflow-hidden bg-nero text-testo-scuro">
        <Image
          src="/foto/foto-sfondo.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="pointer-events-none absolute inset-0 bg-nero/60" />
        <div className="container-content relative flex flex-col items-center gap-6 py-16 text-center sm:py-20">
          <h2 className="max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            Pronto a metterti al volante senza pensieri?
          </h2>
          <p className="max-w-xl text-testo-scuro/70">
            Raccontaci di cosa hai bisogno: ti prepariamo un preventivo su misura e ti richiamiamo.
          </p>
          <Link href="/preventivo" className="btn-oro">
            Richiedi il preventivo
          </Link>
        </div>
      </section>
    </>
  );
}
