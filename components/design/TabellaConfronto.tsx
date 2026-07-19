import Link from "next/link";
import { SITE } from "@/lib/site";

// Tabella confronto noleggio vs acquisto (roadmap design #3). Pezzo CRO forte,
// confronto qualitativo veritiero (nessun numero inventato). Riferimento:
// componenti/tabella-confronto del catalogo.
const RIGHE = [
  { voce: "Anticipo iniziale", acquisto: "Elevato", impero: "Da zero" },
  { voce: "Assicurazione e bollo", acquisto: "A tuo carico", impero: "Inclusi" },
  { voce: "Manutenzione", acquisto: "Imprevista", impero: "Inclusa" },
  { voce: "Costo mensile", acquisto: "Variabile", impero: "Fisso" },
  { voce: "Deducibilità fiscale", acquisto: "Limitata", impero: "Ottimizzata" },
  { voce: "Capitale immobilizzato", acquisto: "Sì", impero: "No" },
];

export function TabellaConfronto() {
  return (
    <section className="bg-avorio">
      <div className="container-content py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Noleggio o acquisto?</h2>
          <p className="mt-3 text-testo-chiaro/65">
            Cosa cambia davvero per la tua attività, voce per voce.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-nero/10 bg-carta">
          {/* Intestazione */}
          <div className="grid grid-cols-[1.3fr_1fr_1fr] items-stretch">
            <div className="p-4" />
            <div className="p-4 text-center text-xs font-semibold uppercase tracking-widest text-testo-chiaro/50">
              Acquisto
            </div>
            <div className="bg-nero p-4 text-center text-xs font-semibold uppercase tracking-widest text-oro">
              Noleggio {SITE.nomeBreve}
            </div>
          </div>
          {/* Righe */}
          {RIGHE.map((r, i) => (
            <div
              key={r.voce}
              className={`grid grid-cols-[1.3fr_1fr_1fr] items-center ${i % 2 ? "bg-avorio/40" : ""}`}
            >
              <div className="p-4 text-sm font-medium text-testo-chiaro">{r.voce}</div>
              <div className="p-4 text-center text-sm text-testo-chiaro/55">{r.acquisto}</div>
              <div className="bg-nero/[0.03] p-4 text-center text-sm font-semibold text-testo-chiaro">
                {r.impero}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/calcolatore" className="text-sm font-medium text-oro hover:underline">
            Metti a confronto i numeri sul tuo profilo →
          </Link>
        </div>
      </div>
    </section>
  );
}
