import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chi siamo",
  description: "Impero Automotive: noleggio, vendita e acquisto di auto, moto e veicoli commerciali per partite IVA e aziende.",
};

export default function ChiSiamoPage() {
  return (
    <div className="container-content py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-semibold">Chi siamo</h1>

        {/* TODO §11: testi definitivi dal cliente (storia, affidabilità). */}
        <div className="mt-6 space-y-4 text-testo-chiaro/75">
          <p>
            Impero Automotive accompagna partite IVA e aziende nella scelta del veicolo giusto in
            noleggio a lungo termine: un'unica rata mensile con tutti i servizi inclusi, senza
            capitale immobilizzato e senza pensieri di gestione.
          </p>
          <p>
            Ci occupiamo di noleggio, vendita e acquisto di auto, moto e veicoli commerciali,
            costruendo per ogni cliente la formula più efficiente in base alla sua forma giuridica e
            al suo utilizzo.
          </p>
          <p className="text-sm text-testo-chiaro/50">
            {/* Placeholder onesto finché non arrivano i testi definitivi. */}
            Contenuti in aggiornamento.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/preventivo" className="btn-oro">
            Richiedi il preventivo
          </Link>
        </div>
      </div>
    </div>
  );
}
