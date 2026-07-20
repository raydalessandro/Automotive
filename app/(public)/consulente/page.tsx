import type { Metadata } from "next";
import { Suspense } from "react";
import { veicoliAttivi } from "@/lib/catalogo";
import { Consulente } from "@/components/Consulente";

export const metadata: Metadata = {
  title: "Trova la soluzione — 5 domande, 60 secondi",
  description:
    "Rispondi a 5 domande sulla tua attività e ti mostriamo fino a tre soluzioni oneste, ognuna col suo costo reale. Prima facciamo i conti, poi scegliamo la macchina.",
};

export default function ConsulentePage() {
  // I veicoli (dato server) vengono passati al motore puro lato client: risultati
  // immediati, senza gate e senza lasciare contatti. Suspense: il wizard usa useSearchParams.
  return (
    <div className="container-content py-10 sm:py-14">
      <Suspense fallback={<div className="min-h-[50vh]" />}>
        <Consulente veicoli={veicoliAttivi()} />
      </Suspense>
    </div>
  );
}
