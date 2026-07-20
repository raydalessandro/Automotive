import Link from "next/link";
import Image from "next/image";
import { veicoliInEvidenza } from "@/lib/catalogo";
import { VeicoloCard } from "@/components/VeicoloCard";
import { SITE } from "@/lib/site";
import { LineaVeicoli } from "@/components/design/LineaVeicoli";
import { FasciaServizi } from "@/components/design/FasciaServizi";
import { FasciaAnticipo } from "@/components/FasciaAnticipo";
import { TabellaConfronto } from "@/components/design/TabellaConfronto";
import { MicroGaranzie } from "@/components/design/MicroGaranzie";
import { Filetto } from "@/components/design/RuotaGuilloche";
import { CardRichiamo } from "@/components/CardRichiamo";
import { ProvaSociale } from "@/components/ProvaSociale";
import { Faq } from "@/components/Faq";
import { FAQ_ANTICIPO } from "@/lib/faq";

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

// Il metodo in 60 secondi (§2.2). I primi due passi con link agli strumenti; il
// terzo è la CardRichiamo compatta (i volti). Filetto sotto il titolo.
const METODO = [
  {
    t: "Prima i conti",
    d: "Cinque domande sulla tua attività, il costo reale sul tuo regime fiscale. Gratis, senza lasciare contatti.",
    href: "/consulente",
    cta: "Fai i conti",
  },
  {
    t: "Nessuna sorpresa",
    d: "Ogni rischio del noleggio, a viso aperto: lo copri o lo accetti, decidi tu.",
    href: "/configuratore",
    cta: "Configura la rata",
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
              Consulenti del noleggio a lungo termine · Partite IVA e aziende
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
              {SITE.claim}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-testo-scuro/75">{SITE.descrizione}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/consulente" className="btn-oro">
                Fai i conti con noi · 60 secondi
              </Link>
              <Link href="/calcolatore" className="btn-ghost">
                Scopri quanto risparmi davvero
              </Link>
            </div>
            {/* Micro-garanzie vicino alla CTA (trust nel punto di decisione). */}
            <MicroGaranzie scuro className="mt-6" />
          </div>
          {/* Visual: il protagonista è la persona al lavoro (§3). La CTA resta l'unico oro pieno. */}
          <div className="relative">
            <div className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-testo-scuro/10">
              <Image
                src="/foto/foto-hero.webp"
                alt="Il titolare di un'attività inizia la sua giornata di lavoro"
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

      {/* Come lavoriamo con te (§2.2) — sostituisce "Come funziona" e assorbe "Perché scegliere noi". */}
      <section className="bg-avorio">
        <div className="container-content py-16 sm:py-20">
          <h2 className="text-center font-display text-3xl font-semibold">Come lavoriamo con te</h2>
          <Filetto className="mx-auto mt-4 h-4 w-52 text-oro" />
          <div className="mx-auto mt-10 grid max-w-5xl gap-8 sm:grid-cols-3">
            {METODO.map((p, i) => (
              <div key={p.t} className="flex flex-col text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-oro font-display text-xl font-semibold text-nero">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">{p.t}</h3>
                <p className="mt-2 text-sm text-testo-chiaro/65">{p.d}</p>
                <Link
                  href={p.href}
                  className="mt-3 inline-block text-sm font-medium text-oro hover:underline"
                >
                  {p.cta} →
                </Link>
              </div>
            ))}
            {/* Passo 3: i volti, con la CardRichiamo compatta. */}
            <div className="flex flex-col text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-oro font-display text-xl font-semibold text-nero">
                3
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold">Una persona, in giornata</h3>
              <CardRichiamo compatta className="mt-3" />
            </div>
          </div>
          {/* Riga assorbita da "Perché scegliere noi": il posizionamento da consulenti. */}
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-testo-chiaro/70">
            Confrontiamo per te i listini dei principali operatori di noleggio e ti portiamo la
            proposta giusta: siamo consulenti del noleggio, non ti vendiamo un&apos;auto.
          </p>
        </div>
      </section>

      {/* Per la tua attività — i segmenti (§2.3), parlano del lavoro. */}
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

      {/* I conti già fatti (§2.4) — i veicoli, col canone chiaro. */}
      <section className="bg-avorio">
        <div className="container-content py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold">I conti già fatti</h2>
              <p className="mt-1 text-testo-chiaro/60">
                Ogni veicolo col suo canone chiaro, IVA esclusa dichiarata e costo reale a un click.
              </p>
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
        </div>
      </section>

      {/* Tutto nel canone (§2.5) */}
      <FasciaServizi />

      {/* Confronto noleggio vs acquisto (§2.6) — l'argomento di decisione (CRO). */}
      <TabellaConfronto />

      {/* Anticipo zero. Davvero. (§2.7) */}
      <FasciaAnticipo cta="consulente" />

      {/* Non ci pensi più (§2.8) — la corda emotiva: non compri un'auto, compri il non doverci pensare */}
      <section className="bg-avorio">
        <div className="container-content grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2">
          <div className="relative order-last aspect-[16/11] overflow-hidden rounded-2xl lg:order-first">
            <Image
              src="/foto/foto-tranquillita.webp"
              alt="Un'imprenditrice al lavoro nel proprio studio"
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

      {/* Prova sociale (§2.9 / §4) — slot onesto: renderizza solo con clienti veri. */}
      <ProvaSociale />

      {/* Domande frequenti (§2.10) — gestione obiezioni. Linkano il calcolatore. */}
      <section className="bg-avorio">
        <div className="container-content py-16 sm:py-20">
          <h2 className="font-display text-3xl font-semibold">Domande frequenti</h2>
          <p className="mt-1 text-testo-chiaro/60">I conti in chiaro, prima ancora di sentirci.</p>
          <div className="mt-8 max-w-3xl">
            <Faq items={FAQ_ANTICIPO} />
          </div>
        </div>
      </section>

      {/* CTA finale (§2.11) — sfondo materico scuro con riflessi d'oro, testo in overlay */}
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
