import type { Metadata } from "next";
import { PaginaTesto } from "@/components/PaginaTesto";
import { CONTATTI } from "@/lib/contatti";

export const metadata: Metadata = {
  title: "Informativa privacy",
  robots: { index: false, follow: true },
};

// [APERTO §11: testo definitivo e dati del titolare da confermare col cliente/legale.]
export default function PrivacyPage() {
  return (
    <PaginaTesto titolo="Informativa privacy">
      <p className="rounded-lg bg-oro/10 px-4 py-3 text-sm">
        Bozza da validare. I dati identificativi del titolare del trattamento sono da confermare
        prima del go-live.
      </p>

      <h2>Titolare del trattamento</h2>
      <p>
        {CONTATTI.ragioneSociale}. Per esercitare i tuoi diritti puoi scrivere a{" "}
        <a href={`mailto:${CONTATTI.email}`} className="text-oro underline">
          {CONTATTI.email}
        </a>
        . {/* TODO: ragione sociale completa, sede legale, P.IVA */}
      </p>

      <h2>Dati raccolti e finalità</h2>
      <p>
        Tramite il form di richiesta preventivo raccogliamo i dati che ci fornisci (dati
        dell'attività, recapiti, informazioni sull'esigenza di noleggio) al solo fine di
        ricontattarti e prepararti una proposta. Il conferimento dei dati contrassegnati come
        obbligatori è necessario per dar seguito alla tua richiesta.
      </p>

      <h2>Base giuridica e conservazione</h2>
      <p>
        Il trattamento si basa sul riscontro alla tua richiesta e, per le comunicazioni commerciali,
        sul consenso facoltativo che puoi revocare in qualsiasi momento. Conserviamo i dati per il
        tempo necessario a gestire la relazione e adempiere agli obblighi di legge.
      </p>

      <h2>I tuoi diritti</h2>
      <p>
        Puoi chiedere accesso, rettifica, cancellazione, limitazione e portabilità dei tuoi dati, e
        opporti al trattamento, scrivendo ai recapiti sopra indicati.
      </p>
    </PaginaTesto>
  );
}
