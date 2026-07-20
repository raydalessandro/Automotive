import { describe, it, expect, beforeEach } from "vitest";
import { unaVolta, chiaveDedup } from "./dedup";

// sessionStorage non esiste in ambiente node: fake minimale per testare la dedup.
class FakeStorage {
  private m = new Map<string, string>();
  getItem(k: string): string | null {
    return this.m.has(k) ? (this.m.get(k) as string) : null;
  }
  setItem(k: string, v: string): void {
    this.m.set(k, v);
  }
}

beforeEach(() => {
  (globalThis as unknown as { sessionStorage: unknown }).sessionStorage = new FakeStorage();
});

describe("dedup (§PR29)", () => {
  it("chiaveDedup compone evt:<tipo>:<chiave>", () => {
    expect(chiaveDedup("sezione_vista", "/:metodo")).toBe("evt:sezione_vista:/:metodo");
  });

  it("prima volta true, poi false (blinda il doppio conteggio)", () => {
    expect(unaVolta("sezione_vista", "metodo")).toBe(true);
    expect(unaVolta("sezione_vista", "metodo")).toBe(false);
    expect(unaVolta("sezione_vista", "metodo")).toBe(false);
  });

  it("chiavi diverse sono indipendenti", () => {
    expect(unaVolta("scroll_soglia", "/:25")).toBe(true);
    expect(unaVolta("scroll_soglia", "/:50")).toBe(true);
    expect(unaVolta("scroll_soglia", "/:25")).toBe(false);
  });

  it("tipi diversi con stessa chiave sono indipendenti", () => {
    expect(unaVolta("strumento_aperto", "calcolatore")).toBe(true);
    expect(unaVolta("strumento_completato", "calcolatore")).toBe(true);
  });

  it("senza sessionStorage non rompe (fail-open: ritorna true)", () => {
    delete (globalThis as unknown as { sessionStorage?: unknown }).sessionStorage;
    expect(unaVolta("tempo_pagina", "/")).toBe(true);
  });
});
