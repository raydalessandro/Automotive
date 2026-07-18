import Link from "next/link";
import { veicoliInEvidenza } from "@/lib/catalogo";
import { VeicoloCard } from "@/components/VeicoloCard";
import { SITE } from "@/lib/site";
import { LineaVeicoli } from "@/components/design/LineaVeicoli";
import { FasciaServizi } from "@/components/design/FasciaServizi";
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

export default function Home() {
  const evidenza = veicoliInEvidenza().slice(0, 6);

  return (
    <>
      {/* Hero scuro */}
      <section className="overflow-hidden bg-nero text-testo-scuro">
        <div className="container-content grid gap-10 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-28">
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
          </div>
          <ul className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
            {[
              "Tutti i servizi inclusi in un unico canone",
              "Anticipo zero disponibile su molti veicoli",
              "Formule dedicate per flotte aziendali",
              "Rata fissa, zero imprevisti",
            ].map((x) => (
              <li
                key={x}
                className="flex items-start gap-3 rounded-xl border border-testo-scuro/10 bg-grafite/40 p-4"
              >
                <svg
                  viewBox="0 0 12 12"
                  className="mt-1 h-3 w-3 shrink-0 text-oro"
                  aria-hidden="true"
                >
                  <path
                    d="M6 1 l5 5 -5 5 -5 -5 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
                <span className="text-testo-scuro/85">{x}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Una sola linea: la firma del brand attraversa l'hero */}
        <div className="container-content pb-10 pt-4 lg:pt-6">
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

      {/* CTA finale */}
      <section className="bg-nero text-testo-scuro">
        <div className="container-content flex flex-col items-center gap-6 py-16 text-center sm:py-20">
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
