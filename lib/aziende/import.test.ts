import { describe, it, expect } from "vitest";
import { parseImport } from "./import";
import { isPec } from "./pec";

describe("guardrail PEC", () => {
  it("riconosce i domini PEC", () => {
    expect(isPec("mario@pec.it")).toBe(true);
    expect(isPec("info@arubapec.it")).toBe(true);
    expect(isPec("x@postacert.qualcosa.it")).toBe(true);
    expect(isPec("info@azienda.it")).toBe(false);
    expect(isPec(null)).toBe(false);
  });
});

describe("parseImport", () => {
  it("importa JSON valido e scarta le PEC", () => {
    const testo = JSON.stringify([
      { ragione_sociale: "Alfa SRL", segmento: "pmi", email: "info@alfa.it" },
      { ragione_sociale: "Beta SNC", segmento: "artigiani", email: "b@pec.it" },
      { ragione_sociale: "", email: "vuoto@x.it" },
    ]);
    const r = parseImport(testo);
    expect(r.valide).toHaveLength(1);
    expect(r.valide[0].ragione_sociale).toBe("Alfa SRL");
    expect(r.scartate.length).toBe(2); // PEC + ragione sociale mancante
    expect(r.scartate.some((s) => s.motivo.includes("PEC"))).toBe(true);
  });

  it("importa CSV con intestazioni", () => {
    const csv = "ragione_sociale,segmento,provincia,email\nGamma SRL,agenti,MI,g@gamma.it";
    const r = parseImport(csv);
    expect(r.valide).toHaveLength(1);
    expect(r.valide[0].provincia).toBe("MI");
    expect(r.valide[0].email).toBe("g@gamma.it");
  });

  it("normalizza il segmento mancante a 'altro'", () => {
    const r = parseImport(JSON.stringify([{ ragione_sociale: "Delta" }]));
    expect(r.valide[0].segmento).toBe("altro");
  });
});
