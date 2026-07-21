import { describe, it, expect } from "vitest";
import {
  MOTIVI_PERSO,
  MOTIVO_RICONTATTO,
  labelMotivo,
  validaDettagliPerso,
} from "./esiti";

describe("MOTIVI_PERSO — lista canonica (§PR-6)", () => {
  it("ha gli 8 motivi nell'ordine della consegna", () => {
    expect(MOTIVI_PERSO.map((m) => m.id)).toEqual([
      "canone_alto",
      "fornitore_attivo",
      "preferisce_acquisto",
      "non_e_il_momento",
      "decisore_non_raggiunto",
      "veicolo_non_adatto",
      "diffidenza",
      "altro",
    ]);
  });

  it("MOTIVO_RICONTATTO è non_e_il_momento", () => {
    expect(MOTIVO_RICONTATTO).toBe("non_e_il_momento");
  });
});

describe("labelMotivo", () => {
  it("id noto → label", () => {
    expect(labelMotivo("canone_alto")).toBe("Canone troppo alto");
    expect(labelMotivo("altro")).toBe("Altro");
  });
  it("id sconosciuto → torna l'id", () => {
    expect(labelMotivo("pinco")).toBe("pinco");
  });
});

describe("validaDettagliPerso — input non validi → ok:false", () => {
  it.each([
    ["null", null],
    ["undefined", undefined],
    ["stringa", "perso"],
    ["numero", 3],
    ["oggetto senza motivi", {}],
    ["motivi non array", { motivi: "canone_alto" }],
    ["motivi vuoto (minimo 1)", { motivi: [] }],
  ])("%s", (_label, raw) => {
    expect(validaDettagliPerso(raw).ok).toBe(false);
  });

  it("id sconosciuto rifiutato", () => {
    expect(validaDettagliPerso({ motivi: ["pinco"] }).ok).toBe(false);
    expect(validaDettagliPerso({ motivi: ["canone_alto", "pinco"] }).ok).toBe(false);
    expect(validaDettagliPerso({ motivi: [123] }).ok).toBe(false);
  });
});

describe("validaDettagliPerso — motivi validi, normalizzazione", () => {
  it("singolo motivo → ok", () => {
    const r = validaDettagliPerso({ motivi: ["canone_alto"] });
    expect(r).toEqual({ ok: true, dettagli: { motivi: ["canone_alto"] } });
  });

  it("dedup e riordino nell'ordine canonico", () => {
    const r = validaDettagliPerso({ motivi: ["altro", "canone_alto", "canone_alto"] });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.dettagli.motivi).toEqual(["canone_alto", "altro"]);
  });
});

describe("validaDettagliPerso — ricontattare_il ammesso solo con non_e_il_momento", () => {
  it("data senza non_e_il_momento → ok:false", () => {
    const r = validaDettagliPerso({ motivi: ["canone_alto"], ricontattare_il: "2026-09-01" });
    expect(r.ok).toBe(false);
  });

  it("data con non_e_il_momento e formato valido → ok e data preservata", () => {
    const r = validaDettagliPerso({ motivi: ["non_e_il_momento"], ricontattare_il: "2026-09-01" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.dettagli.ricontattare_il).toBe("2026-09-01");
  });

  it.each(["2026-13-40", "non-una-data", "2026-02-30", "01/09/2026"])(
    "data impossibile/malformata (%s) → ok:false",
    (data) => {
      const r = validaDettagliPerso({ motivi: ["non_e_il_momento"], ricontattare_il: data });
      expect(r.ok).toBe(false);
    },
  );

  it("data assente/vuota con non_e_il_momento → ok, campo omesso", () => {
    const vuota = validaDettagliPerso({ motivi: ["non_e_il_momento"], ricontattare_il: "" });
    expect(vuota.ok).toBe(true);
    if (vuota.ok) expect(vuota.dettagli.ricontattare_il).toBeUndefined();

    const assente = validaDettagliPerso({ motivi: ["non_e_il_momento"] });
    expect(assente.ok).toBe(true);
    if (assente.ok) expect(assente.dettagli.ricontattare_il).toBeUndefined();
  });
});

describe("validaDettagliPerso — nota_altro solo con 'altro'", () => {
  it("nota tenuta (trim) quando 'altro' è selezionato", () => {
    const r = validaDettagliPerso({ motivi: ["altro"], nota_altro: "  vuole comprare usato  " });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.dettagli.nota_altro).toBe("vuole comprare usato");
  });

  it("nota scartata (non è errore) quando 'altro' NON è selezionato", () => {
    const r = validaDettagliPerso({ motivi: ["canone_alto"], nota_altro: "ignorami" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.dettagli.nota_altro).toBeUndefined();
  });
});
