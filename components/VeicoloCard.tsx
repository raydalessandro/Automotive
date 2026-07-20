import Link from "next/link";
import { VeicoloImg } from "./VeicoloImg";
import { CanoneEquivalente } from "./CanoneEquivalente";
import { badge, kmAnno, titoloVeicolo, type Veicolo } from "@/lib/catalogo";
import { euro, numero } from "@/lib/format";

// Card veicolo — stesso linguaggio della OG card (§7): un solo sistema di card, ovunque.
export function VeicoloCard({ v, priority = false }: { v: Veicolo; priority?: boolean }) {
  const badges = badge(v);
  return (
    <Link
      href={`/veicoli/${v.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-nero/10 bg-carta transition-shadow hover:shadow-lg focus-visible:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-avorio">
        <VeicoloImg
          src={v.foto}
          alt={titoloVeicolo(v)}
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {v.stato === "nuovo" && (
          <span className="absolute left-3 top-3 rounded-full bg-nero/85 px-3 py-1 text-xs font-semibold text-testo-scuro">
            Nuovo
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-oro">{v.marca}</p>
        <h3 className="mt-1 font-display text-xl font-semibold leading-tight">
          {v.modello}{" "}
          <span className="font-sans text-sm font-normal text-testo-chiaro/60">{v.versione}</span>
        </h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span
              key={b.label}
              className={
                b.tono === "oro"
                  ? "rounded-full bg-oro/15 px-2.5 py-0.5 text-xs font-medium text-oro"
                  : "rounded-full bg-nero/5 px-2.5 py-0.5 text-xs font-medium text-testo-chiaro/70"
              }
            >
              {b.label}
            </span>
          ))}
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2 text-xs text-testo-chiaro/60">
          <div>
            <dt className="sr-only">Durata</dt>
            <dd className="tabular font-medium text-testo-chiaro">{v.durata_mesi} mesi</dd>
          </div>
          <div>
            <dt className="sr-only">Km/anno</dt>
            <dd className="tabular font-medium text-testo-chiaro">{numero(kmAnno(v))} km/anno</dd>
          </div>
          <div>
            <dt className="sr-only">Anticipo</dt>
            <dd className="tabular font-medium text-testo-chiaro">
              {v.anticipo_iva_esclusa === 0 ? "Anticipo 0" : `${euro(v.anticipo_iva_esclusa)} ant.`}
            </dd>
          </div>
        </dl>

        <div className="mt-auto pt-4">
          <p className="flex items-baseline gap-1">
            <span className="font-display text-3xl font-semibold tabular text-nero">
              {euro(v.canone_mese_iva_esclusa)}
            </span>
            <span className="text-sm text-testo-chiaro/60">/mese + IVA</span>
          </p>
          <CanoneEquivalente
            canone={v.canone_mese_iva_esclusa}
            anticipo={v.anticipo_iva_esclusa}
            durata={v.durata_mesi}
            className="mt-0.5"
          />
          <p className="mt-0.5 text-xs text-testo-chiaro/50">Tutti i servizi inclusi</p>
        </div>
      </div>
    </Link>
  );
}
