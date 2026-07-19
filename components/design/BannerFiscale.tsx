import Link from "next/link";

// Banner "vantaggio fiscale" (roadmap design #2). Gancio PMI più forte.
// Veritiero: "fino al 100%" (dipende dal profilo) + disclaimer. Riferimento:
// blocchi/banner-fiscale del catalogo, ricostruito coi font e la palette reali.
export function BannerFiscale({ conCta = false }: { conCta?: boolean }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-oro/25 bg-nero text-testo-scuro">
      <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:gap-10 sm:p-10">
        <div className="shrink-0 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-testo-scuro/55">fino al</p>
          <p className="font-display text-6xl font-semibold leading-none text-oro sm:text-7xl">100%</p>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-testo-scuro/55">deducibile</p>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-oro">Il vantaggio fiscale</p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            Ogni euro di canone lavora per te
          </h2>
          <p className="mt-2 max-w-xl text-testo-scuro/70">
            Canone deducibile e IVA detraibile in base alla tua attività: il noleggio ottimizza i
            costi meglio dell&apos;acquisto.
          </p>
          {conCta && (
            <Link href="/calcolatore" className="btn-oro mt-5">
              Calcola il tuo risparmio
            </Link>
          )}
          <p className="mt-4 text-xs text-testo-scuro/45">
            La deducibilità varia in base al regime fiscale e all&apos;uso del veicolo. Verifica sempre
            col tuo commercialista.
          </p>
        </div>
      </div>
    </section>
  );
}
