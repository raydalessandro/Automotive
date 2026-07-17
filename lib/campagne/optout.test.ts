import { describe, it, expect } from "vitest";
import { creaTokenOptOut, verificaTokenOptOut } from "./optout";

describe("token opt-out", () => {
  it("round-trip: il token verifica e restituisce l'azienda_id", () => {
    const id = "11111111-2222-3333-4444-555555555555";
    const token = creaTokenOptOut(id);
    expect(verificaTokenOptOut(token)).toBe(id);
  });

  it("rifiuta un token manomesso", () => {
    const token = creaTokenOptOut("abc") + "x";
    expect(verificaTokenOptOut(token)).toBeNull();
  });

  it("rifiuta spazzatura", () => {
    expect(verificaTokenOptOut("non-un-token")).toBeNull();
    expect(verificaTokenOptOut("")).toBeNull();
  });
});
