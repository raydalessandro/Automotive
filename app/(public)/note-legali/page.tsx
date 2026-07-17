import type { Metadata } from "next";
import { PaginaTesto } from "@/components/PaginaTesto";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Note legali",
  robots: { index: false, follow: true },
};

// [APERTO §11: dicitura legale sul ruolo di Impero (intermediario/agente di chi) da confermare.]
export default function NoteLegaliPage() {
  return (
    <PaginaTesto titolo="Note legali">
      <p className="rounded-lg bg-oro/10 px-4 py-3 text-sm">
        Bozza da completare. Il ruolo di Impero Automotive rispetto al fornitore del servizio di
        noleggio (intermediazione / mandato) è da definire con precisione prima del go-live.
      </p>

      <h2>Natura delle offerte</h2>
      <p>{SITE.footerLegale}</p>

      <h2>Canoni e condizioni</h2>
      <p>
        Tutti i canoni indicati sul sito sono espressi IVA esclusa, salvo diversa indicazione. Le
        offerte sono soggette a disponibilità dei veicoli e ad approvazione del credito da parte
        della società di noleggio. Le immagini dei veicoli sono indicative.
      </p>

      <h2>Simulazioni fiscali</h2>
      <p>
        Il calcolatore presente sul sito fornisce stime puramente indicative, basate su ipotesi
        semplificate, e non costituisce consulenza fiscale. Verifica sempre la tua situazione con il
        tuo commercialista.
      </p>
    </PaginaTesto>
  );
}
