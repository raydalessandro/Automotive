import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { importaAziendeCore, esportaAziendeCore } from "./core";

// Fake Supabase in-memory: supporta la catena usata da core.ts (select/in/eq/is/limit,
// insert, update.eq). Nessun DB reale.
function fakeSupabase() {
  const store: Record<string, unknown>[] = [];
  const client = {
    from() {
      const filters: ((r: Record<string, unknown>) => boolean)[] = [];
      const qb: Record<string, unknown> = {
        select: () => qb,
        in: (col: string, vals: unknown[]) => {
          const s = new Set(vals);
          filters.push((r) => s.has(r[col]));
          return qb;
        },
        eq: (col: string, val: unknown) => {
          filters.push((r) => r[col] === val);
          return qb;
        },
        is: (col: string, val: unknown) => {
          filters.push((r) => r[col] === val);
          return qb;
        },
        not: () => qb,
        gte: () => qb,
        lte: () => qb,
        order: () => qb,
        limit: () => qb,
        then: (resolve: (v: { data: unknown[]; error: null }) => void) =>
          resolve({ data: store.filter((r) => filters.every((f) => f(r))), error: null }),
        insert: (rows: Record<string, unknown> | Record<string, unknown>[]) => {
          const arr = Array.isArray(rows) ? rows : [rows];
          for (const r of arr) store.push({ id: randomUUID(), creato_il: "2026-01-01", arricchita_il: null, ...r });
          return { then: (resolve: (v: { error: null }) => void) => resolve({ error: null }) };
        },
        update: (patch: Record<string, unknown>) => ({
          eq: (col: string, val: unknown) => {
            for (const r of store) if (r[col] === val) Object.assign(r, patch);
            return Promise.resolve({ error: null });
          },
        }),
      };
      return qb;
    },
  };
  return { client: client as unknown as SupabaseClient, store };
}

describe("round-trip import aziende (raccolta → export → arricchimento)", () => {
  it("percorre il ciclo completo senza perdita né duplicazione", async () => {
    const { client, store } = fakeSupabase();

    // 1. Raccolta: una con email (→ da_contattare), una senza (→ grezza)
    const batch = JSON.stringify([
      { ragione_sociale: "Alfa SRL", segmento: "pmi", provincia: "MI", email: "info@alfa.it" },
      { ragione_sociale: "Beta Snc", segmento: "artigiani", provincia: "BG" },
    ]);
    const r1 = await importaAziendeCore(client, batch, "raccolta");
    expect(r1.inserite).toBe(2);
    expect(store).toHaveLength(2);
    expect(store.find((r) => r.ragione_sociale === "Beta Snc")?.stato).toBe("grezza");
    expect(store.find((r) => r.ragione_sociale === "Alfa SRL")?.stato).toBe("da_contattare");

    // 2. Re-import identico → 0 inserite, tutte duplicate
    const r2 = await importaAziendeCore(client, batch, "raccolta");
    expect(r2.inserite).toBe(0);
    expect(r2.duplicate).toBe(2);
    expect(store).toHaveLength(2);

    // 3. Export delle grezze (include id)
    const exp = await esportaAziendeCore(client, { stato: "grezza" });
    const esportate = JSON.parse(exp.json ?? "[]") as { id: string; ragione_sociale: string }[];
    expect(esportate).toHaveLength(1);
    expect(esportate[0].ragione_sociale).toBe("Beta Snc");
    expect(esportate[0].id).toBeTruthy();

    // 4. Arricchimento: aggiungo email alla grezza e re-importo con id
    const arricchito = JSON.stringify([{ ...esportate[0], email: "info@beta.it" }]);
    const r3 = await importaAziendeCore(client, arricchito, "arricchimento");
    expect(r3.arricchite).toBe(1);
    expect(r3.inserite).toBe(0);

    // 5. La grezza è stata promossa e l'email riempita, senza duplicare
    const beta = store.find((r) => r.ragione_sociale === "Beta Snc");
    expect(store).toHaveLength(2);
    expect(beta?.email).toBe("info@beta.it");
    expect(beta?.stato).toBe("da_contattare");
  });
});
