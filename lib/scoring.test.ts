import { describe, it, expect } from "vitest";
import { calcolaScore, isHot } from "./scoring.config";

// §5: forma (srl/snc +2, agente/ditta +1, forfettario 0) · anni (oltre5 +2, 3-5 +1, meno1 -1) ·
// veicoli (6+ +2, 2-5 +1, 1 0). hot = score >= 3.

describe("calcolaScore", () => {
  it("SRL, oltre 5 anni, 6+ veicoli → 6 (HOT)", () => {
    const s = calcolaScore({ forma_giuridica: "srl_spa", anni_attivita: "oltre_5", n_veicoli: "6_piu" });
    expect(s).toBe(6);
    expect(isHot(s)).toBe(true);
  });
  it("agente, 3-5 anni, 2-5 veicoli → 3 (HOT, soglia)", () => {
    const s = calcolaScore({ forma_giuridica: "agente", anni_attivita: "3_5", n_veicoli: "2_5" });
    expect(s).toBe(3);
    expect(isHot(s)).toBe(true);
  });
  it("forfettario, meno di 1 anno, 1 veicolo → -1 (non HOT)", () => {
    const s = calcolaScore({ forma_giuridica: "forfettario", anni_attivita: "meno_1", n_veicoli: "1" });
    expect(s).toBe(-1);
    expect(isHot(s)).toBe(false);
  });
  it("ditta individuale, 1-2 anni, 1 veicolo → 1 (non HOT)", () => {
    const s = calcolaScore({ forma_giuridica: "ditta_individuale", anni_attivita: "1_2", n_veicoli: "1" });
    expect(s).toBe(1);
    expect(isHot(s)).toBe(false);
  });
  it("SNC, oltre 5 anni, 1 veicolo → 4 (HOT)", () => {
    const s = calcolaScore({ forma_giuridica: "snc_sas", anni_attivita: "oltre_5", n_veicoli: "1" });
    expect(s).toBe(4);
  });
});
