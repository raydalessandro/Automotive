import { describe, it, expect } from "vitest";
import { parseImport, chiaveCascata, dedupBatch } from "./import";
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

  it("accetta righe SENZA email (raccolta grezze)", () => {
    const r = parseImport(JSON.stringify([{ ragione_sociale: "Grezza SRL", provincia: "MI" }]));
    expect(r.valide).toHaveLength(1);
    expect(r.scartate).toHaveLength(0);
    expect(r.valide[0].email ?? null).toBeNull();
  });

  it("scarta una piva malformata", () => {
    const r = parseImport(JSON.stringify([{ ragione_sociale: "X SRL", piva: "123" }]));
    expect(r.valide).toHaveLength(0);
    expect(r.scartate[0].motivo).toContain("piva");
  });
});

describe("chiaveCascata", () => {
  it("segue la priorità id → piva → email → nome+provincia", () => {
    expect(chiaveCascata({ id: "abc", piva: "1", email: "a@b.it", ragione_sociale: "X" })).toBe("id:abc");
    expect(chiaveCascata({ piva: "12345678903", email: "a@b.it", ragione_sociale: "X" })).toBe("piva:12345678903");
    expect(chiaveCascata({ email: "A@B.it", ragione_sociale: "X" })).toBe("email:a@b.it");
    expect(chiaveCascata({ ragione_sociale: "Rossi SRL", provincia: "MI" })).toBe("np:rossi srl|mi");
  });
});

describe("dedupBatch", () => {
  it("scarta i duplicati interni al batch (cascata), prima occorrenza vince", () => {
    const rows = [
      { ragione_sociale: "Alfa", email: "info@alfa.it" },
      { ragione_sociale: "Alfa (dup email)", email: "INFO@alfa.it" }, // stessa email → dup
      { ragione_sociale: "Beta", provincia: "MI" },
      { ragione_sociale: "beta", provincia: "mi" }, // stesso nome+prov → dup
      { ragione_sociale: "Gamma", piva: "12345678903" },
    ];
    const { unici, duplicati } = dedupBatch(rows);
    expect(duplicati).toBe(2);
    expect(unici.map((r) => r.ragione_sociale)).toEqual(["Alfa", "Beta", "Gamma"]);
  });
  it("righe senza chiave forte deduplicano su nome+provincia vuota", () => {
    const { unici, duplicati } = dedupBatch([
      { ragione_sociale: "Solo Nome" },
      { ragione_sociale: "Solo Nome" },
    ]);
    expect(unici).toHaveLength(1);
    expect(duplicati).toBe(1);
  });
});
