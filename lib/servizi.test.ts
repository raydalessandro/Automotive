import { describe, it, expect } from "vitest";
import { calcolaRata, classificaServizi, RISCHI } from "./servizi.config";

// Fixture con prezzi (la config reale ha tutti null in v1): verifica anche il ramo "+prezzo".
const FIX = [
  { id: "base", copertura: { incluso_base: true, prezzo_mese: null } },
  { id: "prezzo50", copertura: { incluso_base: false, prezzo_mese: 50 } },
  { id: "prezzo30", copertura: { incluso_base: false, prezzo_mese: 30 } },
  { id: "gratis", copertura: { incluso_base: false, prezzo_mese: null } },
];

describe("calcolaRata", () => {
  it("senza servizi la rata è il canone base", () => {
    expect(calcolaRata(300, [], FIX)).toBe(300);
  });
  it("un servizio a prezzo null NON cambia la rata (acceptance §8)", () => {
    expect(calcolaRata(300, ["gratis"], FIX)).toBe(300);
  });
  it("i servizi con prezzo si sommano al canone", () => {
    expect(calcolaRata(300, ["prezzo50", "prezzo30"], FIX)).toBe(380);
  });
  it("gli inclusi base non incidono anche se passati attivi", () => {
    expect(calcolaRata(300, ["base"], FIX)).toBe(300);
  });
  it("sulla config reale v1 (tutti null) la rata resta il canone", () => {
    const tuttiNonBase = RISCHI.filter((r) => !r.copertura.incluso_base).map((r) => r.id);
    expect(calcolaRata(245, tuttiNonBase)).toBe(245);
  });
});

describe("classificaServizi", () => {
  it("attivo con prezzo → scelti; attivo senza prezzo → interesse; base escluso", () => {
    const c = classificaServizi(["prezzo50", "gratis", "base"], FIX);
    expect(c.servizi_scelti).toEqual(["prezzo50"]);
    expect(c.servizi_interesse).toEqual(["gratis"]);
    // base non compare in nessuna lista; prezzo30 non attivo → accettato
    expect(c.rischi_accettati).toEqual(["prezzo30"]);
  });
  it("nessun attivo → tutti i non-base sono rischi accettati", () => {
    const c = classificaServizi([], FIX);
    expect(c.servizi_scelti).toEqual([]);
    expect(c.servizi_interesse).toEqual([]);
    expect(c.rischi_accettati.sort()).toEqual(["gratis", "prezzo30", "prezzo50"]);
  });
  it("sulla config reale gli inclusi base non sono mai 'accettabili'", () => {
    const c = classificaServizi([]);
    const baseIds = RISCHI.filter((r) => r.copertura.incluso_base).map((r) => r.id);
    for (const id of baseIds) {
      expect(c.rischi_accettati).not.toContain(id);
      expect(c.servizi_scelti).not.toContain(id);
      expect(c.servizi_interesse).not.toContain(id);
    }
  });
});
