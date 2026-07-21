import { describe, it, expect } from "vitest";
import { PROFILI, type ProfiloId } from "@/lib/fiscale.config";
import { profiloDaParametri } from "./parametri";

describe("profiloDaParametri: ?forma → profilo fiscale (§PR-5)", () => {
  it.each([
    ["forfettario", "forfettario"],
    ["ditta_individuale", "ditta_individuale"],
    ["agente", "agente_rappresentante"],
    ["snc_sas", "srl_ordinaria"],
    ["srl_spa", "srl_ordinaria"],
  ] as const)("forma=%s → %s", (forma, atteso) => {
    expect(profiloDaParametri(forma)).toBe(atteso);
  });
});

describe("profiloDaParametri: ?veicolo prevale su forma", () => {
  it("veicolo=n1 → n1_strumentale a prescindere dalla forma", () => {
    expect(profiloDaParametri("forfettario", "n1")).toBe("n1_strumentale");
    expect(profiloDaParametri("srl_spa", "n1")).toBe("n1_strumentale");
    expect(profiloDaParametri("altro", "n1")).toBe("n1_strumentale");
  });

  it("veicolo=n1 senza forma → n1_strumentale", () => {
    expect(profiloDaParametri(undefined, "n1")).toBe("n1_strumentale");
    expect(profiloDaParametri(null, "n1")).toBe("n1_strumentale");
  });

  it("veicolo=auto non prevale: si ricade sulla forma", () => {
    expect(profiloDaParametri("forfettario", "auto")).toBe("forfettario");
    expect(profiloDaParametri("srl_spa", "auto")).toBe("srl_ordinaria");
  });

  it("veicolo=auto senza forma valida → undefined", () => {
    expect(profiloDaParametri(undefined, "auto")).toBeUndefined();
    expect(profiloDaParametri("altro", "auto")).toBeUndefined();
  });
});

describe("profiloDaParametri: input non validi/assenti → undefined", () => {
  it.each([
    ["forma=altro", "altro"],
    ["stringa sconosciuta", "pinco"],
    ["stringa vuota", ""],
    ["forma undefined", undefined],
    ["forma null", null],
  ] as const)("%s → undefined", (_label, forma) => {
    expect(profiloDaParametri(forma)).toBeUndefined();
  });

  it("entrambi gli argomenti assenti → undefined", () => {
    expect(profiloDaParametri()).toBeUndefined();
    expect(profiloDaParametri(undefined, undefined)).toBeUndefined();
    expect(profiloDaParametri(null, null)).toBeUndefined();
  });
});

describe("profiloDaParametri: ogni risultato è una chiave reale di PROFILI", () => {
  it.each([
    ["forfettario", undefined],
    ["ditta_individuale", undefined],
    ["agente", undefined],
    ["snc_sas", undefined],
    ["srl_spa", undefined],
    ["forfettario", "n1"],
    [undefined, "n1"],
    ["srl_spa", "auto"],
  ] as const)("profiloDaParametri(%s, %s) è in PROFILI", (forma, veicolo) => {
    const id = profiloDaParametri(forma, veicolo);
    expect(id).toBeDefined();
    expect(id as ProfiloId).toBeTruthy();
    expect(id! in PROFILI).toBe(true);
  });
});
