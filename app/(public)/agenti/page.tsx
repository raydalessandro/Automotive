import type { Metadata } from "next";
import { LandingSegmento } from "@/components/LandingSegmento";
import { veicoliAttivi } from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Noleggio a lungo termine per agenti di commercio",
  description:
    "Noleggio a lungo termine per agenti e rappresentanti: canone deducibile all'80% con tetto maggiorato e IVA detraibile al 100%. Berline e SUV, tutti i servizi inclusi.",
};

const FAQ = [
  {
    d: "Perché per un agente il noleggio conviene di più?",
    r: "Gli agenti e rappresentanti di commercio hanno una deducibilità dell'80% del canone (con tetto maggiorato) e IVA detraibile al 100%: il costo reale mensile scende sensibilmente rispetto ad altre partite IVA.",
  },
  {
    d: "Che tipo di veicoli sono più adatti?",
    r: "Berline, SUV e station wagon comode per chi passa molte ore in strada e macina chilometri. Nel preventivo troviamo la formula chilometrica più adatta al tuo utilizzo.",
  },
  {
    d: "Cosa è incluso nel canone?",
    r: "Assicurazione, bollo, manutenzione ordinaria e straordinaria, gomme e assistenza. Un'unica rata fissa mensile, senza imprevisti.",
  },
  {
    d: "Posso avere formule con più chilometri?",
    r: "Sì, prevediamo formule chilometriche dedicate a chi viaggia molto. Indicaci i km annui stimati nel preventivo e le calibriamo su di te.",
  },
  {
    d: "Serve un anticipo?",
    r: "Molti veicoli sono disponibili con anticipo zero. Dove è previsto un anticipo, te lo indichiamo sempre in chiaro, IVA esclusa.",
  },
  {
    d: "Il preventivo è impegnativo?",
    r: "No, è gratuito e senza impegno. Ti prepariamo una proposta su misura e ti richiamiamo per spiegartela.",
  },
];

export default function AgentiPage() {
  const veicoli = veicoliAttivi().filter((v) =>
    ["berlina", "suv", "station"].includes(v.categoria),
  );
  return (
    <LandingSegmento
      occhiello="Agenti e rappresentanti di commercio"
      titolo="La tua auto da lavoro, deducibile all'80%"
      sottotitolo="Per agenti e rappresentanti il noleggio a lungo termine è deducibile all'80% con tetto maggiorato e IVA al 100%. Più comfort in strada, meno costo reale."
      puntiChiave={[
        "Canone deducibile all'80% (tetto maggiorato)",
        "IVA detraibile al 100%",
        "Formule chilometriche dedicate a chi viaggia molto",
        "Tutti i servizi inclusi, rata fissa",
      ]}
      profilo="agente_rappresentante"
      segmento="agenti"
      canoneEsempio={460}
      durataEsempio={48}
      veicoli={veicoli}
      titoloVeicoli="Veicoli pensati per la strada"
      faq={FAQ}
      ctaTesto="Richiedi il preventivo agente"
    />
  );
}
