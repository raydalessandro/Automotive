import { describe, it, expect } from "vitest";
import { CTA_IDS, type CtaId } from "./cta";
import { tracciaCta } from "../traccia";

// Type test (§PR29): un id non registrato è un ERRORE DI COMPILAZIONE, verificato da
// `tsc --noEmit`. Questa funzione non viene mai eseguita: serve solo al type-checker.
// Se la riga @ts-expect-error smettesse di essere un errore, tsc fallirebbe.
export function _typeCheckCta(): CtaId {
  tracciaCta("hero_consulente");
  tracciaCta("metodo_configuratore");
  // @ts-expect-error id non registrato → errore di compilazione
  tracciaCta("id_non_registrato");
  const valido: CtaId = "hero_calcolatore";
  return valido;
}

describe("registry CTA (§PR29)", () => {
  it("contiene gli id hero e metodo", () => {
    expect(CTA_IDS).toContain("hero_consulente");
    expect(CTA_IDS).toContain("hero_calcolatore");
    expect(CTA_IDS).toContain("metodo_consulente");
    expect(CTA_IDS).toContain("metodo_configuratore");
  });

  it("gli id sono unici", () => {
    expect(new Set(CTA_IDS).size).toBe(CTA_IDS.length);
  });
});
