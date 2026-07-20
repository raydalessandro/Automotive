import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { TEAM } from "@/lib/team";
import { Avatar } from "@/components/Avatar";
import { MicroGaranzie } from "@/components/design/MicroGaranzie";
import { Filetto } from "@/components/design/RuotaGuilloche";

export const metadata: Metadata = {
  title: "Chi risponde quando chiedi un preventivo",
  description:
    "Niente call center, niente ticket. Tre persone e un metodo: prima facciamo i conti, poi scegliamo la macchina. Ti richiama Shery o Ahmed, in giornata.",
};

// Il metodo — riusa il pattern PASSI della home, con link agli strumenti.
const METODO = [
  {
    n: "1",
    t: "Prima i conti",
    d: "Cinque domande sulla tua attività, il costo reale sul tuo regime fiscale. Gratis, senza lasciare nessun contatto.",
    href: "/consulente",
    cta: "Fai i conti",
  },
  {
    n: "2",
    t: "Nessuna sorpresa",
    d: "Ogni rischio del noleggio, a viso aperto: lo copri o lo accetti, decidi tu.",
    href: "/configuratore",
    cta: "Configura la rata",
  },
  {
    n: "3",
    t: "Una persona, in giornata",
    d: "Quando chiedi il preventivo ti richiama Shery o Ahmed. Persone vere, che seguono la tua pratica dalla prima chiamata alla consegna.",
    href: "/preventivo",
    cta: "Richiedi il preventivo",
  },
];

export default function ChiSiamoPage() {
  return (
    <>
      <div className="container-content py-12 sm:py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            Chi risponde quando chiedi un preventivo
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-testo-chiaro/70">
            Niente call center, niente ticket. Tre persone, un metodo, una promessa: prima facciamo
            i conti, poi scegliamo la macchina.
          </p>
          <Filetto className="mx-auto mt-6 h-4 w-52 text-oro" />
        </header>
      </div>

      {/* Il metodo — tre passi con link agli strumenti */}
      <section className="bg-avorio">
        <div className="container-content py-16 sm:py-20">
          <h2 className="text-center font-display text-3xl font-semibold">Il metodo</h2>
          <div className="mx-auto mt-10 grid max-w-5xl gap-8 sm:grid-cols-3">
            {METODO.map((p) => (
              <div key={p.n} className="flex flex-col text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-oro font-display text-xl font-semibold text-nero">
                  {p.n}
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
          </div>
        </div>
      </section>

      {/* Le persone — tre card identiche */}
      <section className="container-content py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold">Le persone</h2>
          <p className="mt-2 text-testo-chiaro/70">
            Un nome e un volto: con noi parli sempre con una persona, non con un portale.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-3">
          {TEAM.map((c) => (
            <div
              key={c.nome}
              className="rounded-2xl border border-nero/10 bg-carta p-6 text-center"
            >
              <Avatar nome={c.nome} foto={c.foto} size={128} className="mx-auto" />
              <h3 className="mt-4 font-display text-xl font-semibold leading-tight">{c.nome}</h3>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-oro">
                {c.ruolo}
              </p>
              <p className="mt-3 text-sm text-testo-chiaro/70">{c.bio}</p>
              {c.notaPersonale && (
                <p className="mt-2 text-sm italic text-testo-chiaro/55">{c.notaPersonale}</p>
              )}
            </div>
          ))}
        </div>

        <MicroGaranzie className="mt-10 justify-center" />

        {/* Trasparenza sul modello a provvigione: disinnesca il dubbio "come guadagnano". */}
        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-nero/10 bg-avorio p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-oro">Trasparenza</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            Come guadagniamo (e perché puoi fidarti dei conti)
          </h3>
          <p className="mt-3 text-testo-chiaro/75">
            La consulenza per te è gratis. Guadagniamo dall&apos;operatore di noleggio che scegli, con una
            provvigione riconosciuta a contratto firmato:{" "}
            <strong className="text-testo-chiaro">il prezzo che paghi è identico a quello di listino</strong>,
            con o senza di noi. Per questo non abbiamo motivo di spingerti su un&apos;offerta invece che su
            quella giusta per te — ci conviene che tu resti cliente, non che tu firmi in fretta.
          </p>
        </div>
      </section>

      {/* CTA finale */}
      <section className="bg-nero text-testo-scuro">
        <div className="container-content flex flex-col items-center gap-5 py-16 text-center sm:py-20">
          <h2 className="max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            Facciamo due conti sul tuo prossimo veicolo?
          </h2>
          <p className="max-w-xl text-testo-scuro/70">
            {SITE.nome}: prima i conti, poi la macchina. In giornata ti richiama una persona vera.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/consulente" className="btn-oro">
              Fai i conti con noi
            </Link>
            <Link href="/preventivo" className="btn-ghost">
              Richiedi il preventivo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
