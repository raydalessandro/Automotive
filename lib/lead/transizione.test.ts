import { describe, it, expect } from "vitest";
import { pianoTransizione } from "./transizione";

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
