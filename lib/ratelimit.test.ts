import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit, chiaveClient } from "./ratelimit";

describe("rateLimit", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("consente fino al limite, poi blocca, e resetta dopo la finestra", () => {
    vi.setSystemTime(0);
    const k = "test:consente";
    expect(rateLimit(k, 3, 1000)).toBe(true);
    expect(rateLimit(k, 3, 1000)).toBe(true);
    expect(rateLimit(k, 3, 1000)).toBe(true);
    expect(rateLimit(k, 3, 1000)).toBe(false); // oltre il limite
    vi.setSystemTime(1001); // finestra scaduta
    expect(rateLimit(k, 3, 1000)).toBe(true);
  });

  it("chiavi diverse hanno finestre indipendenti", () => {
    vi.setSystemTime(0);
    expect(rateLimit("a", 1, 1000)).toBe(true);
    expect(rateLimit("a", 1, 1000)).toBe(false);
    expect(rateLimit("b", 1, 1000)).toBe(true); // indipendente da "a"
  });
});

describe("chiaveClient", () => {
  it("usa il primo IP di x-forwarded-for", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(chiaveClient(req, "eventi")).toBe("eventi:1.2.3.4");
  });
  it("fallback a unknown senza header", () => {
    expect(chiaveClient(new Request("http://x"), "eventi")).toBe("eventi:unknown");
  });
});
