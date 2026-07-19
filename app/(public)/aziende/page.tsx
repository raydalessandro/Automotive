import type { Metadata } from "next";
import { LandingSegmento } from "@/components/LandingSegmento";
import { veicoliAttivi } from "@/lib/catalogo";
import { FAQ_COMUNI } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Noleggio a lungo termine per aziende e flotte",
  description:
    "Noleggio a lungo termine per PMI: flotta operativa e auto in fringe benefit. Dal 2025 l'elettrica in benefit pesa in busta solo il 10%. Canoni IVA esclusa, tutto incluso.",
};

const FAQ = [
  {
    d: "Conviene gestire la flotta in noleggio invece che con auto di proprietà?",
    r: "Sì: nessun capitale immobilizzato, costi certi e pianificabili, nessun rischio sul valore residuo e nessuna gestione di manutenzione, assicurazioni e bolli. Una sola rata mensile per veicolo.",
  },
  {
    d: "Come funziona il fringe benefit per le auto assegnate ai dipendenti?",
    r: "L'auto a uso promiscuo è deducibile al 70% per l'azienda. Dal 2025 il valore tassato in busta paga al dipendente è il 10% del costo ACI per le elettriche, il 20% per le plug-in e il 50% per le termiche: assegnare un'elettrica riduce molto l'imponibile in busta.",
  },
  {
    d: "Perché puntare sull'elettrica per il benefit?",
    r: "Perché a parità di auto, l'elettrica in fringe benefit pesa in busta paga il 10% contro il 50% di un'equivalente termica: un vantaggio concreto per azienda e dipendente.",
  },
  {
    d: "Potete gestire più veicoli con esigenze diverse?",
    r: "Sì. Componiamo la flotta mescolando veicoli commerciali, auto per la rete vendita e auto in benefit, ciascuno con la formula fiscale più adatta.",
  },
  {
    d: "Cosa è incluso nei canoni?",
    r: "Assicurazione, bollo, manutenzione ordinaria e straordinaria, gomme e assistenza per ogni veicolo della flotta.",
  },
  {
    d: "Come iniziamo?",
    r: "Raccontaci quanti veicoli ti servono e per quale uso: prepariamo una proposta di flotta su misura e ti richiamiamo.",
  },
];

export default function AziendePage() {
  // Mix con EV in testa.
  const veicoli = veicoliAttivi().sort((a, b) => {
    const ea = a.alimentazione === "elettrica" ? 0 : 1;
    const eb = b.alimentazione === "elettrica" ? 0 : 1;
    return ea - eb || a.canone_mese_iva_esclusa - b.canone_mese_iva_esclusa;
  });

  return (
    <LandingSegmento
      occhiello="Aziende e flotte"
      titolo="La flotta della tua azienda, senza pensieri"
      sottotitolo="Flotta operativa e auto in fringe benefit in un'unica regia. Costi certi, zero capitale immobilizzato e, dal 2025, l'elettrica in benefit che pesa in busta solo il 10%."
      puntiChiave={[
        "Flotta operativa: costi certi e pianificabili",
        "Auto in fringe benefit deducibili al 70%",
        "Elettrica in benefit: 10% in busta vs 50% termica (dal 2025)",
        "Una regia unica per tutti i veicoli",
      ]}
      profilo="srl_ordinaria"
      segmento="pmi"
      canoneEsempio={344}
      durataEsempio={36}
      veicoli={veicoli}
      titoloVeicoli="Per la tua flotta"
      faq={[...FAQ, ...FAQ_COMUNI]}
      ctaTesto="Parliamo della tua flotta"
    >
      <section className="container-content py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-nero/10 bg-carta p-6">
            <h2 className="font-display text-xl font-semibold">Flotta operativa</h2>
            <p className="mt-2 text-sm text-testo-chiaro/70">
              Veicoli commerciali e auto per la rete vendita, con la formula fiscale più efficiente
              per ciascun mezzo. Manutenzione, assicurazione e assistenza sempre incluse.
            </p>
          </div>
          <div className="rounded-2xl border border-nero/10 bg-carta p-6">
            <h2 className="font-display text-xl font-semibold">Auto in fringe benefit</h2>
            <p className="mt-2 text-sm text-testo-chiaro/70">
              Assegna auto ai collaboratori ottimizzando il carico fiscale. Dal 2025 l'elettrica
              pesa in busta paga il 10% del costo ACI, contro il 50% di una termica equivalente.
            </p>
          </div>
        </div>
      </section>
    </LandingSegmento>
  );
}
