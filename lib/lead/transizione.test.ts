import { describe, it, expect } from "vitest";
import { pianoTransizione } from "./transizione";
import { STATI_LEAD, LABEL_STATO_LEAD } from "@/lib/dashboard/tipi";

describe("pianoTransizione (§PR30)", () => {
  const now = "2026-07-20T10:00:00.000Z";
  const piano = pianoTransizione("lead-1", "contattato", "user-9", now);

  it("patch: stato + audit (chi/quando)", () => {
    expect(piano.patch).toEqual({
      stato: "contattato",
      aggiornato_il: now,
      aggiornato_da: "user-9",
    });
  });

  it("storia: riga con lead_id, stato e autore", () => {
    expect(piano.storia).toEqual({
      lead_id: "lead-1",
      stato: "contattato",
      autore: "user-9",
    });
  });

  it("stato e autore coincidono tra patch e storia (nessuna divergenza)", () => {
    const p = pianoTransizione("L", "chiuso", "U", now);
    expect(p.storia.stato).toBe(p.patch.stato);
    expect(p.storia.autore).toBe(p.patch.aggiornato_da);
  });
});

describe("STATI_LEAD — compatibilità stati esistenti (§PR-2)", () => {
  // I 5 stati storici NON devono sparire: la pipeline è additiva.
  const statiEsistenti = [
    "nuovo",
    "contattato",
    "preventivo_inviato",
    "chiuso",
    "perso",
  ] as const;

  for (const stato of statiEsistenti) {
    it(`contiene ancora lo stato esistente "${stato}"`, () => {
      expect(STATI_LEAD).toContain(stato);
    });
  }
});

describe("STATI_LEAD — nuovi stati additivi (§PR-2)", () => {
  // I 3 stati introdotti dalla PR-2: assegnazione, presa in carico, sospensione.
  const statiNuovi = ["assegnato", "preso_in_carico", "in_sospeso"] as const;

  for (const stato of statiNuovi) {
    it(`contiene il nuovo stato "${stato}"`, () => {
      expect(STATI_LEAD).toContain(stato);
    });
  }
});

describe("STATI_LEAD — ordine esatto della pipeline (§PR-2)", () => {
  it("è esattamente l'array a 8 elementi nell'ordine di pipeline", () => {
    // Blocca sia il set che l'ordine: gli stati esistenti non vengono riordinati.
    expect([...STATI_LEAD]).toEqual([
      "nuovo",
      "contattato",
      "assegnato",
      "preso_in_carico",
      "preventivo_inviato",
      "in_sospeso",
      "chiuso",
      "perso",
    ]);
  });
});

describe("LABEL_STATO_LEAD — etichetta per ogni stato (§PR-2)", () => {
  it("ha una label non vuota per OGNI stato in STATI_LEAD", () => {
    // Nessuno stato deve restare senza etichetta leggibile in UI.
    for (const stato of STATI_LEAD) {
      const label = LABEL_STATO_LEAD[stato];
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe("pianoTransizione — generica anche sui nuovi stati (§PR-2)", () => {
  const now = "2026-07-21T09:00:00.000Z";

  it('produce patch e storia corretti per "assegnato"', () => {
    const p = pianoTransizione("lead-42", "assegnato", "venditore-7", now);
    expect(p.patch.stato).toBe("assegnato");
    expect(p.patch.aggiornato_il).toBe(now);
    expect(p.patch.aggiornato_da).toBe("venditore-7");
    expect(p.storia.lead_id).toBe("lead-42");
    expect(p.storia.stato).toBe("assegnato");
    expect(p.storia.autore).toBe("venditore-7");
  });

  it('produce patch e storia corretti per "in_sospeso"', () => {
    const p = pianoTransizione("lead-99", "in_sospeso", "operatore-3", now);
    expect(p.patch.stato).toBe("in_sospeso");
    expect(p.patch.aggiornato_il).toBe(now);
    expect(p.patch.aggiornato_da).toBe("operatore-3");
    expect(p.storia.lead_id).toBe("lead-99");
    expect(p.storia.stato).toBe("in_sospeso");
    expect(p.storia.autore).toBe("operatore-3");
  });
});
