import { describe, it, expect } from "vitest";
import { formatoPivaOk, checksumPivaOk, normalizzaPiva } from "./piva";

describe("piva", () => {
  it("valida il formato a 11 cifre", () => {
    expect(formatoPivaOk("12345678903")).toBe(true);
    expect(formatoPivaOk("123")).toBe(false);
    expect(formatoPivaOk(null)).toBe(false);
  });

  it("normalizza rimuovendo i non-cifra", () => {
    expect(normalizzaPiva("IT 123 456 789 03")).toBe("12345678903");
    expect(normalizzaPiva("123")).toBeNull();
    expect(normalizzaPiva(12345678903)).toBe("12345678903");
  });

  it("verifica il checksum (P.IVA valida vs manomessa)", () => {
    // 00743110157 è una P.IVA con checksum valido (Fiat/nota di test).
    expect(checksumPivaOk("00743110157")).toBe(true);
    expect(checksumPivaOk("00743110158")).toBe(false);
  });
});
