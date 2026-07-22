import { describe, it, expect } from "vitest";
import { campiDaLabels, umanizza } from "./render-dati";

describe("umanizza", () => {
  it.each([
    ["patente_da_anni", "Patente da anni"],
    ["eta", "Eta"],
    ["fornitore_attuale", "Fornitore attuale"],
    ["ha_pos", "Ha pos"],
  ])("%s → %s", (chiave, atteso) => {
    expect(umanizza(chiave)).toBe(atteso);
  });
});

describe("campiDaLabels — §PR-10", () => {
  it("usa le labels quando presenti, umanizza il resto", () => {
    const out = campiDaLabels(
      { eta: "Età" },
      null,
      { eta: 22, patente_da_anni: 3 },
    );
    expect(out).toEqual([
      { label: "Età", valore: "22" },
      { label: "Patente da anni", valore: "3" },
    ]);
  });

  it("acceptance nlt_giovani: Eta + Patente da anni", () => {
    const out = campiDaLabels(null, null, { eta: 22, patente_da_anni: 3 });
    expect(out).toEqual([
      { label: "Eta", valore: "22" },
      { label: "Patente da anni", valore: "3" },
    ]);
  });

  it("booleani → Sì/No", () => {
    const out = campiDaLabels(null, null, { ha_pos: true, attivo: false });
    expect(out).toEqual([
      { label: "Ha pos", valore: "Sì" },
      { label: "Attivo", valore: "No" },
    ]);
  });

  it("valori vuoti/null/array vuoto → omessi", () => {
    const out = campiDaLabels(null, null, { a: "", b: null, c: undefined, d: [], e: "ok" });
    expect(out).toEqual([{ label: "E", valore: "ok" }]);
  });

  it("dati null/undefined → lista vuota", () => {
    expect(campiDaLabels(null, null, null)).toEqual([]);
    expect(campiDaLabels({ x: "X" }, null, undefined)).toEqual([]);
  });

  it("core prima di dati, nell'ordine di inserimento", () => {
    const out = campiDaLabels(
      { ragione_sociale: "Nome e cognome" },
      { ragione_sociale: "Mario Rossi", provincia: "MI" },
      { eta: 22 },
    );
    expect(out).toEqual([
      { label: "Nome e cognome", valore: "Mario Rossi" },
      { label: "Provincia", valore: "MI" },
      { label: "Eta", valore: "22" },
    ]);
  });

  it("array → valori uniti", () => {
    const out = campiDaLabels(null, null, { motivi: ["a", "b"] });
    expect(out).toEqual([{ label: "Motivi", valore: "a, b" }]);
  });
});
