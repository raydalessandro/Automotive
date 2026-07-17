import { describe, it, expect } from "vitest";
import { calcolaPerProfilo } from "./fiscale";

// Golden test — §3.3 della spec. Tolleranza ±0,50 €.
// Cambiare una costante in fiscale.config.ts DEVE far fallire questi test.
const TOLL = 0.5;

function vicino(a: number, atteso: number) {
  expect(Math.abs(a - atteso)).toBeLessThanOrEqual(TOLL);
}

describe("golden test fiscali (§3.3)", () => {
  it("Agente su T-Roc — costo reale ≈ 301,76 €/mese", () => {
    const r = calcolaPerProfilo("agente_rappresentante", {
      canone: 460,
      anticipo: 0,
      durata: 48,
      aliquota: 0.43,
    });
    vicino(r.costoPienoMese, 561.2);
    vicino(r.ivaRecuperataMese, 101.2);
    vicino(r.risparmioImposteMese, 158.24);
    vicino(r.costoRealeMese, 301.76);
  });

  it("SRL su Fiesta — costo reale ≈ 263,67 €/mese", () => {
    const r = calcolaPerProfilo("srl_ordinaria", {
      canone: 245,
      anticipo: 0,
      durata: 48,
      aliquota: 0.279,
    });
    vicino(r.costoPienoMese, 298.9);
    vicino(r.ivaRecuperataMese, 21.56);
    vicino(r.risparmioImposteMese, 13.67);
    vicino(r.costoRealeMese, 263.67);
  });

  it("N1 su Fiesta — costo reale ≈ 176,64 €/mese", () => {
    const r = calcolaPerProfilo("n1_strumentale", {
      canone: 245,
      anticipo: 0,
      durata: 48,
      aliquota: 0.279,
    });
    vicino(r.costoPienoMese, 298.9);
    vicino(r.ivaRecuperataMese, 53.9);
    vicino(r.risparmioImposteMese, 68.36);
    vicino(r.costoRealeMese, 176.64);
  });
});

describe("anticipo spalmato", () => {
  it("l'anticipo aumenta il canone equivalente (T-Roc reale con anticipo 2.459)", () => {
    const senza = calcolaPerProfilo("agente_rappresentante", {
      canone: 460,
      anticipo: 0,
      durata: 48,
      aliquota: 0.43,
    });
    const con = calcolaPerProfilo("agente_rappresentante", {
      canone: 460,
      anticipo: 2459,
      durata: 48,
      aliquota: 0.43,
    });
    expect(con.canoneEquivalente).toBeGreaterThan(senza.canoneEquivalente);
    // 460 + 2459/48 ≈ 511,23
    vicino(con.canoneEquivalente, 511.23);
  });
});
