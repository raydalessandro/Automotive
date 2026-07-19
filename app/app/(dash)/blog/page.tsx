import Link from "next/link";
import { articoliTutti, type Articolo } from "@/lib/blog";
import { labelCategoria } from "@/lib/blog/schema";
import { StatCard } from "@/components/dashboard/StatCard";
import { dataIt } from "@/lib/format";

// Cruscotto blog (sola lettura). Il blog è "repo come CMS": qui si vede lo stato,
// si pubblica sempre da codice (stato: bozza → pubblicato nel file .mdx). Dietro auth.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog · Casa Base",
  robots: { index: false, follow: false },
};

function Riga({ a }: { a: Articolo }) {
  const bozza = a.stato === "bozza";
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium text-testo-chiaro">{a.titolo}</p>
        <p className="mt-0.5 text-xs text-testo-chiaro/50">
          {labelCategoria(a.categoria)} · {dataIt(a.data)} · {a.minutiLettura} min
          {bozza && <> · <code className="text-testo-chiaro/60">contenuti/blog/{a.file}.mdx</code></>}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            bozza ? "bg-nero/5 text-testo-chiaro/60" : "bg-oro/15 text-oro"
          }`}
        >
          {bozza ? "Bozza" : "Pubblicato"}
        </span>
        {!bozza && (
          <Link href={`/blog/${a.slug}`} className="text-xs font-medium text-oro hover:underline">
            Vedi →
          </Link>
        )}
      </div>
    </li>
  );
}

export default function BlogDashPage() {
  const tutti = articoliTutti();
  const bozze = tutti.filter((a) => a.stato === "bozza");
  const pubblicati = tutti.filter((a) => a.stato === "pubblicato");

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold">Blog</h1>
        <Link href="/blog" className="text-sm text-oro hover:underline">
          Vedi il blog →
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Bozze pronte" valore={bozze.length} accento />
        <StatCard label="Pubblicati" valore={pubblicati.length} />
      </div>

      <p className="mt-5 rounded-xl border border-nero/10 bg-carta px-4 py-3 text-sm text-testo-chiaro/60">
        Sola lettura. Gli articoli vivono nel repo (<code>contenuti/blog/</code>): per
        pubblicare una bozza si cambia <code>stato: bozza</code> in <code>pubblicato</code> nel
        file e si fa il deploy. Nuovi articoli con la fabbrica in <code>strumenti/blog/</code>.
      </p>

      {tutti.length === 0 && (
        <p className="mt-6 text-sm text-testo-chiaro/55">
          Ancora nessun articolo. Preparane qualcuno con <code>strumenti/blog/PROMPT-articolo.md</code>.
        </p>
      )}

      <Sezione titolo="Bozze" vuoto="Nessuna bozza pronta — è il momento di prepararne." articoli={bozze} />
      <Sezione titolo="Pubblicati" vuoto="Ancora nessun articolo pubblicato." articoli={pubblicati} />
    </div>
  );
}

function Sezione({
  titolo,
  vuoto,
  articoli,
}: {
  titolo: string;
  vuoto: string;
  articoli: Articolo[];
}) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold">
        {titolo} <span className="text-testo-chiaro/40">({articoli.length})</span>
      </h2>
      {articoli.length === 0 ? (
        <p className="mt-3 text-sm text-testo-chiaro/55">{vuoto}</p>
      ) : (
        <ul className="mt-3 divide-y divide-nero/10 rounded-2xl border border-nero/10 bg-carta">
          {articoli.map((a) => (
            <Riga key={a.slug} a={a} />
          ))}
        </ul>
      )}
    </section>
  );
}
