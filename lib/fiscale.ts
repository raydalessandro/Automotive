// Formula fiscale — §3.2 della spec. Pure functions, testate dai golden test (§3.3).

import {
  IVA,
  SPLIT_QUOTA_NOLEGGIO,
  PROFILI,
  type ProfiloId,
  type ProfiloDeduzione,
} from "./fiscale.config";

export type InputCalcolo = {
  /** Canone mensile IVA esclusa. */
  canone: number;
  /** Anticipo IVA esclusa (default 0). */
  anticipo?: number;
  /** Durata in mesi. */
  durata: number;
  /** Aliquota marginale scelta dall'utente. */
  aliquota: number;
};

export type RisultatoDeduzione = {
  canoneEquivalente: number;
  costoPienoMese: number;
  ivaRecuperataMese: number;
  risparmioImposteMese: number;
  costoRealeMese: number;
};

/**
 * Calcolo per profili con deduzione (§3.2).
 * costo_reale = costo_pieno − IVA recuperata − imposte risparmiate.
 */
export function calcolaDeduzione(
  profilo: ProfiloDeduzione,
  input: InputCalcolo,
): RisultatoDeduzione {
  const { canone, durata, aliquota } = input;
  const anticipo = input.anticipo ?? 0;

  const canoneEquivalente = canone + anticipo / durata;
  const costoPienoMese = canoneEquivalente * (1 + IVA);
  const ivaRecuperataMese = canoneEquivalente * IVA * profilo.iva_detraibile;

  const quotaNoleggioAnnua = canoneEquivalente * 12 * SPLIT_QUOTA_NOLEGGIO;
  const quotaServiziAnnua = canoneEquivalente * 12 * (1 - SPLIT_QUOTA_NOLEGGIO);

  const tetto = profilo.tetto_quota_noleggio_annuo;
  const noleggioDeducibile = tetto == null ? quotaNoleggioAnnua : Math.min(quotaNoleggioAnnua, tetto);
  const baseDeducibileAnnua = profilo.deducibilita * (noleggioDeducibile + quotaServiziAnnua);
  const risparmioImposteMese = (baseDeducibileAnnua * aliquota) / 12;

  const costoRealeMese = costoPienoMese - ivaRecuperataMese - risparmioImposteMese;

  return {
    canoneEquivalente,
    costoPienoMese,
    ivaRecuperataMese,
    risparmioImposteMese,
    costoRealeMese,
  };
}

/** Prezzo IVA inclusa — usato in modalità forfettario (§3.4). */
export function prezzoIvaInclusa(canone: number, anticipo = 0, durata = 1): number {
  const canoneEquivalente = canone + (durata > 1 ? anticipo / durata : 0);
  return canoneEquivalente * (1 + IVA);
}

/** Helper: calcola dato un profiloId con deduzione. Lancia se il profilo è "confronto". */
export function calcolaPerProfilo(profiloId: ProfiloId, input: InputCalcolo): RisultatoDeduzione {
  const profilo = PROFILI[profiloId];
  if (profilo.tipo !== "deduzione") {
    throw new Error(`Il profilo ${profiloId} non usa il calcolo a deduzione.`);
  }
  return calcolaDeduzione(profilo, input);
}
