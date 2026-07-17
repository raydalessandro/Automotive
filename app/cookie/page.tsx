import type { Metadata } from "next";
import { PaginaTesto } from "@/components/PaginaTesto";

export const metadata: Metadata = {
  title: "Cookie policy",
  robots: { index: false, follow: true },
};

// [APERTO §11: testo definitivo da validare.]
export default function CookiePage() {
  return (
    <PaginaTesto titolo="Cookie policy">
      <p className="rounded-lg bg-oro/10 px-4 py-3 text-sm">Bozza da validare prima del go-live.</p>

      <h2>Cookie tecnici</h2>
      <p>
        Il sito utilizza i cookie strettamente necessari al suo funzionamento. Non richiedono
        consenso.
      </p>

      <h2>Analytics</h2>
      <p>
        Utilizziamo strumenti di analisi del traffico in modalità aggregata e senza cookie di
        profilazione, per capire come viene usato il sito e migliorarlo.
      </p>

      <h2>Gestione delle preferenze</h2>
      <p>
        Puoi in ogni momento gestire o eliminare i cookie dalle impostazioni del tuo browser.
      </p>
    </PaginaTesto>
  );
}
