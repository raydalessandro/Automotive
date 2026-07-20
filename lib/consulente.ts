// ============================================================================
// IL CONSULENTE — motore puro (§2). consiglia(risposte, veicoli) → Consulto.
// Zero I/O, deterministico, unit-testabile. Orchestrazione sopra catalogo,
// fiscale e servizi: nessun motore nuovo, nessun punteggio di matching inventato.
// ============================================================================

import { canoneEquivalente, kmAnno, titoloVeicolo, type Veicolo } from "./catalogo";
import { calcolaPerProfilo, prezzoIvaInclusa } from "./fiscale";
import type { ProfiloId } from "./fiscale.config";
import { RISCHI, DURATA_DEFAULT, type Segmento } from "./servizi.config";
import {
  mappaProfilo,
  mappaSegmento,
  mappaKm,
  aliquotaProfilo,
  type Risposte,
} from "./consulente.config";

export type Soluzione = {
  veicolo: Veicolo;
  titolo: string;
  consigliata: boolean;
  forfettario: boolean;
  /** Canone di listino IVA esclusa. */
  canoneMese: number;
  /** Costo reale mensile per il profilo (null in forfettario). */
  costoRealeMese: number | null;
  /** Prezzo pieno IVA inclusa (solo forfettario). */
  prezzoPienoMese: number | null;
  perche: string;
  serviziConsigliati: string[];
  linkConfiguratore: string;
};

export type Consulto = {
  /** >30.000 km: nessuna card, pannello su misura (§4). */
  suMisura: boolean;
  profilo: ProfiloId;
  segmento: Segmento;
  aliquotaUsata: number;
  /** "Non lo so" al forfettario: profilo prudente + disclaimer visibile. */
  disclaimerFiscale: boolean;
  /** Meno di 3 veicoli in profilo: copy onesto, mai riempire fuori profilo. */
  pochePerProfilo: boolean;
  soluzioni: Soluzione[];
  note: string[];
};

/** Coperture non-base consigliate: da segmento + regole dalle risposte. */
function serviziConsigliati(segmento: Segmento, r: Risposte): string[] {
  const scelti = new Set(
    RISCHI.filter((x) => !x.copertura.incluso_base && x.segmenti_consigliati.includes(segmento)).map((x) => x.id),
  );
  if (r.km === "20_30" || r.km === "oltre_30") scelti.add("gomme_extra");
  if (r.priorita === "pensieri") {
    scelti.add("danni");
    scelti.add("auto_sostitutiva");
  }
  // Solo id validi e non-base, nell'ordine del catalogo servizi.
  return RISCHI.filter((x) => !x.copertura.incluso_base && scelti.has(x.id)).map((x) => x.id);
}

/** "Perché per te": una riga da regole esplicite sul profilo (+ veicolo), mai aggettivi vuoti. */
function perche(profilo: ProfiloId, v: Veicolo): string {
  switch (profilo) {
    case "n1_strumentale":
      return "È un veicolo commerciale N1 a uso strumentale: il canone è deducibile al 100% e recuperi tutta l'IVA.";
    case "agente_rappresentante":
      return "Da agente deduci l'80% del canone e recuperi il 100% dell'IVA: il profilo più favorevole dopo l'N1.";
    case "srl_ordinaria":
      return v.alimentazione === "elettrica"
        ? "Per la tua società abbatte l'imponibile; da elettrica, se assegnata a un dipendente, il fringe benefit è tassato pochissimo in busta."
        : "Per la tua società il canone abbatte l'imponibile, con IVA detraibile al 40% e zero capitale immobilizzato.";
    case "ditta_individuale":
      return "Deducibile al 20% con IVA al 40%, senza immobilizzare capitale: rata fissa e conti chiari.";
    case "forfettario":
      return "In forfettario non deduci i costi: qui il vantaggio è la rata fissa con tutto incluso e zero gestione.";
    case "fringe_benefit":
      return "Auto a uso promiscuo assegnata a un dipendente: deducibile al 70% per l'azienda.";
  }
}

/** Filtro categoria dal trasporto (§2): mai riempire fuori profilo. */
function inProfilo(veicoli: Veicolo[], r: Risposte): Veicolo[] {
  const attivi = veicoli.filter((v) => v.attivo);
  if (r.trasporto === "spesso") return attivi.filter((v) => v.n1); // serve carico → N1
  if (r.trasporto === "no") return attivi.filter((v) => !v.n1); // auto normale
  return attivi; // "a volte": vanno bene entrambi
}

export function consiglia(risposte: Risposte, veicoli: Veicolo[]): Consulto {
  const profilo = mappaProfilo(risposte);
  const segmento = mappaSegmento(risposte.attivita);
  const aliquota = aliquotaProfilo(profilo);
  const forfettario = profilo === "forfettario";
  const disclaimerFiscale = risposte.forfettario === "non_so";
  const servizi = serviziConsigliati(segmento, risposte);

  const note: string[] = [];
  if (disclaimerFiscale) {
    note.push(
      "Non sapendo il regime, usiamo un profilo prudente. Verifica col commercialista: se sei in forfettario il conto cambia.",
    );
  }
  if (forfettario) {
    note.push("In forfettario mostriamo il prezzo pieno IVA inclusa: non c'è deduzione da calcolare.");
  }

  // >30.000 km: niente card finte, pannello su misura (§4).
  if (risposte.km === "oltre_30") {
    return { suMisura: true, profilo, segmento, aliquotaUsata: aliquota, disclaimerFiscale, pochePerProfilo: false, soluzioni: [], note };
  }

  const kmVal = mappaKm(risposte.km);
  const candidati = inProfilo(veicoli, risposte);

  // Metrica per l'ordinamento (§2): rata/pensieri → canone equivalente; fiscale → costo reale;
  // forfettario → prezzo pieno.
  const metrica = (v: Veicolo): number => {
    if (forfettario) return prezzoIvaInclusa(v.canone_mese_iva_esclusa, v.anticipo_iva_esclusa, v.durata_mesi);
    if (risposte.priorita === "fiscale") {
      return calcolaPerProfilo(profilo, {
        canone: v.canone_mese_iva_esclusa,
        anticipo: v.anticipo_iva_esclusa,
        durata: v.durata_mesi,
        aliquota,
      }).costoRealeMese;
    }
    return canoneEquivalente(v);
  };

  const ordinati = [...candidati].sort((a, b) => metrica(a) - metrica(b));
  const scelti = ordinati.slice(0, 3);

  const soluzioni: Soluzione[] = scelti.map((v, i) => {
    const costoRealeMese = forfettario
      ? null
      : calcolaPerProfilo(profilo, {
          canone: v.canone_mese_iva_esclusa,
          anticipo: v.anticipo_iva_esclusa,
          durata: v.durata_mesi,
          aliquota,
        }).costoRealeMese;
    const prezzoPienoMese = forfettario
      ? prezzoIvaInclusa(v.canone_mese_iva_esclusa, v.anticipo_iva_esclusa, v.durata_mesi)
      : null;
    const query = `veicolo=${v.id}&profilo=${profilo}&km=${kmVal}&durata=${DURATA_DEFAULT}` +
      (servizi.length ? `&servizi=${servizi.join(",")}` : "");
    return {
      veicolo: v,
      titolo: titoloVeicolo(v),
      consigliata: i === 0,
      forfettario,
      canoneMese: v.canone_mese_iva_esclusa,
      costoRealeMese,
      prezzoPienoMese,
      perche: perche(profilo, v),
      serviziConsigliati: servizi,
      linkConfiguratore: `/configuratore?${query}`,
    };
  });

  return {
    suMisura: false,
    profilo,
    segmento,
    aliquotaUsata: aliquota,
    disclaimerFiscale,
    pochePerProfilo: soluzioni.length < 3,
    soluzioni,
    note,
  };
}
