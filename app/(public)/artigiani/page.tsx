import type { Metadata } from "next";
import { LandingSegmento } from "@/components/LandingSegmento";
import { veicoliAttivi } from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Noleggio furgoni e veicoli commerciali N1 per partita IVA",
  description:
    "Noleggio a lungo termine di veicoli commerciali N1 per artigiani e installatori: canone 100% deducibile, IVA piena, tutti i servizi inclusi. Anticipo zero disponibile.",
};

const FAQ = [
  {
    d: "Perché un veicolo N1 conviene fiscalmente?",
    r: "I veicoli commerciali N1 usati come beni strumentali sono deducibili al 100% del canone, senza tetto, con IVA detraibile al 100%. È il regime più vantaggioso per chi usa il mezzo per lavoro.",
  },
  {
    d: "Cos'è un veicolo N1?",
    r: "È un veicolo omologato per il trasporto merci (autocarro), tipicamente con 2 posti e vano di carico. Molte versioni commerciali di auto comuni sono omologate N1.",
  },
  {
    d: "Cosa include il canone?",
    r: "Assicurazione, bollo, manutenzione ordinaria e straordinaria, gomme e assistenza stradale. Una sola rata fissa, così pianifichi i costi senza sorprese.",
  },
  {
    d: "Posso allestire il vano di carico?",
    r: "Indicaci le tue esigenze nel preventivo: valutiamo insieme la configurazione più adatta al tuo lavoro.",
  },
  {
    d: "Serve un anticipo?",
    r: "Molti mezzi sono disponibili con anticipo zero. Dove previsto, l'anticipo è sempre indicato in chiaro, IVA esclusa.",
  },
  {
    d: "Quanto costa davvero al mese?",
    r: "Dipende dalla tua aliquota. Usa il calcolatore qui sopra impostato sul profilo N1: vedrai il costo reale al netto di IVA recuperata e imposte risparmiate.",
  },
];

export default function ArtigianiPage() {
  const veicoli = veicoliAttivi().filter((v) => v.n1);
  return (
    <LandingSegmento
      occhiello="Artigiani e installatori"
      titolo="Il tuo furgone da lavoro, 100% deducibile"
      sottotitolo="I veicoli commerciali N1 usati come strumento di lavoro sono deducibili al 100%, senza tetto, con IVA piena. Il modo più efficiente di mettere un mezzo su strada."
      puntiChiave={[
        "Canone 100% deducibile, nessun tetto",
        "IVA detraibile al 100%",
        "Manutenzione, gomme e assistenza incluse",
        "Anticipo zero disponibile",
      ]}
      profilo="n1_strumentale"
      canoneEsempio={245}
      durataEsempio={48}
      veicoli={veicoli}
      titoloVeicoli="Veicoli commerciali N1"
      faq={FAQ}
      ctaTesto="Richiedi il preventivo N1"
    />
  );
}
