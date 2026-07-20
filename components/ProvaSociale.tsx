import { PROVE } from "@/lib/prove.config";
import { Filetto } from "@/components/design/RuotaGuilloche";

// Prova sociale (§4). Slot onesto: con lista vuota NON renderizza nulla. Si accende
// solo con clienti veri. Design con virgoletta oro (testimonianza.svg del catalogo
// non è nel repo: virgoletta inline, stesso spirito).
export function ProvaSociale() {
  if (PROVE.length === 0) return null;
  return (
    <section className="bg-avorio">
      <div className="container-content py-16 sm:py-20">
        <h2 className="text-center font-display text-3xl font-semibold">Chi ci ha già scelto</h2>
        <Filetto className="mx-auto mt-4 h-4 w-52 text-oro" />
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROVE.map((p, i) => (
            <figure key={i} className="rounded-2xl border border-nero/10 bg-carta p-6">
              <span aria-hidden="true" className="font-display text-4xl leading-none text-oro">
                &ldquo;
              </span>
              <blockquote className="mt-2 text-testo-chiaro/80">{p.frase}</blockquote>
              <figcaption className="mt-4 text-sm font-medium text-testo-chiaro">
                {p.nome} <span className="font-normal text-testo-chiaro/55">· {p.attivita}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
