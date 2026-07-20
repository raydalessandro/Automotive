import { describe, it, expect } from "vitest";
import { canoneEquivalente, canoneEquivalenteMostrato } from "./index";

// §Anticipo zero: il canone equivalente si mostra solo con anticipo > 0.
const conAnticipo = { canone_mese_iva_esclusa: 460, anticipo_iva_esclusa: 2459, durata_mesi: 48 };
const senzaAnticipo = { canone_mese_iva_esclusa: 245, anticipo_iva_esclusa: 0, durata_mesi: 48 };

describe("canone equivalente (§Anticipo zero)", () => {
  it("T-Roc (460 + 2.459 su 48 mesi) → ~511 €", () => {
    expect(Math.abs(canoneEquivalente(conAnticipo) - 511.23)).toBeLessThanOrEqual(0.5);
    expect(canoneEquivalenteMostrato(conAnticipo)).toBe(511);
  });

  it("anticipo 0 → nessun equivalente da mostrare (null)", () => {
    expect(canoneEquivalenteMostrato(senzaAnticipo)).toBeNull();
  });
});
