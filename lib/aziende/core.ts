import type { SupabaseClient } from "@supabase/supabase-js";
import { parseImport, chiaveCascata, dedupBatch, type Scarto } from "./import";
import type { ImportRow, Azienda } from "./schema";

// Logica import/export aziende, indipendente dal framework — "una logica, due porte"
// (UI dashboard via server action, CLI via service role). Vedi strumenti/ricerca.

export type ModoImport = "raccolta" | "arricchimento";

export type EsitoImport = {
  ok?: boolean;
  error?: string;
  inserite?: number;
  arricchite?: number;
  duplicate?: number;
  scartate?: Scarto[];
};

const COLS =
  "id, piva, ragione_sociale, segmento, settore, provincia, citta, sito, email, telefono, dimensione_stimata, segnali, score, fonte_ricerca, stato, arricchita_il";

const CAMPI_FILL: (keyof ImportRow)[] = [
  "piva",
  "settore",
  "provincia",
  "citta",
  "sito",
  "email",
  "telefono",
  "dimensione_stimata",
  "segnali",
  "score",
  "fonte_ricerca",
];

function vuoto(v: unknown): boolean {
  return v === null || v === undefined || v === "";
}

function statoIniziale(email: string | null | undefined): string {
  return email ? "da_contattare" : "grezza";
}

function rigaInsert(r: ImportRow) {
  return {
    piva: r.piva ?? null,
    ragione_sociale: r.ragione_sociale,
    segmento: r.segmento,
    settore: r.settore ?? null,
    provincia: r.provincia ?? null,
    citta: r.citta ?? null,
    sito: r.sito ?? null,
    email: r.email ?? null,
    telefono: r.telefono ?? null,
    dimensione_stimata: r.dimensione_stimata ?? null,
    segnali: r.segnali ?? null,
    score: r.score ?? null,
    fonte_ricerca: r.fonte_ricerca ?? "import",
    stato: statoIniziale(r.email),
  };
}

async function caricaEsistenti(supabase: SupabaseClient, batch: ImportRow[]) {
  const ids = [...new Set(batch.map((r) => r.id).filter(Boolean))] as string[];
  const pive = [...new Set(batch.map((r) => r.piva).filter(Boolean))] as string[];
  const emails = [...new Set(batch.map((r) => r.email).filter(Boolean))] as string[];
  const provNonNull = [...new Set(batch.map((r) => r.provincia).filter(Boolean))] as string[];
  const haProvNull = batch.some((r) => vuoto(r.provincia));

  const trovati = new Map<string, Azienda>();
  const add = (rows: Azienda[] | null) => rows?.forEach((a) => trovati.set(a.id, a));

  if (ids.length) add((await supabase.from("aziende").select(COLS).in("id", ids)).data as Azienda[]);
  if (pive.length) add((await supabase.from("aziende").select(COLS).in("piva", pive)).data as Azienda[]);
  if (emails.length) add((await supabase.from("aziende").select(COLS).in("email", emails)).data as Azienda[]);
  if (provNonNull.length)
    add((await supabase.from("aziende").select(COLS).in("provincia", provNonNull).limit(20000)).data as Azienda[]);
  if (haProvNull)
    add((await supabase.from("aziende").select(COLS).is("provincia", null).limit(20000)).data as Azienda[]);

  const byId = new Map<string, Azienda>();
  const byPiva = new Map<string, Azienda>();
  const byEmail = new Map<string, Azienda>();
  const byNomeProv = new Map<string, Azienda>();
  for (const a of trovati.values()) {
    byId.set(a.id, a);
    if (a.piva) byPiva.set(a.piva, a);
    if (a.email) byEmail.set(a.email.toLowerCase(), a);
    byNomeProv.set(chiaveCascata({ ragione_sociale: a.ragione_sociale, provincia: a.provincia }), a);
  }
  return { byId, byPiva, byEmail, byNomeProv };
}

function trovaMatch(r: ImportRow, maps: Awaited<ReturnType<typeof caricaEsistenti>>): Azienda | undefined {
  if (r.id && maps.byId.has(r.id)) return maps.byId.get(r.id);
  if (r.piva && maps.byPiva.has(r.piva)) return maps.byPiva.get(r.piva);
  if (r.email && maps.byEmail.has(r.email.toLowerCase())) return maps.byEmail.get(r.email.toLowerCase());
  return maps.byNomeProv.get(chiaveCascata({ ragione_sociale: r.ragione_sociale, provincia: r.provincia }));
}

/** Import aziende (raccolta/arricchimento). Framework-agnostico. */
export async function importaAziendeCore(
  supabase: SupabaseClient,
  testo: string,
  modo: ModoImport = "raccolta",
): Promise<EsitoImport> {
  if (!testo.trim()) return { error: "Nessun dato da importare" };

  const { valide, scartate } = parseImport(testo);
  if (valide.length === 0) return { ok: true, inserite: 0, arricchite: 0, duplicate: 0, scartate };

  // Dedup interno al batch con la cascata (prima occorrenza vince).
  const { unici, duplicati: dupBatch } = dedupBatch(valide);

  const maps = await caricaEsistenti(supabase, unici);

  const daInserire: ReturnType<typeof rigaInsert>[] = [];
  let arricchite = 0;
  let duplicate = dupBatch;

  for (const r of unici) {
    const match = trovaMatch(r, maps);
    if (!match) {
      daInserire.push(rigaInsert(r));
      continue;
    }
    if (modo === "raccolta") {
      duplicate++;
      continue;
    }
    const patch: Record<string, unknown> = {};
    for (const campo of CAMPI_FILL) {
      const nuovo = (r as Record<string, unknown>)[campo];
      if (!vuoto(nuovo) && vuoto((match as Record<string, unknown>)[campo])) patch[campo] = nuovo;
    }
    if (match.stato === "grezza" && r.email && vuoto(match.email)) patch.stato = "da_contattare";

    if (Object.keys(patch).length === 0) {
      duplicate++;
      continue;
    }
    patch.arricchita_il = new Date().toISOString();
    const { error } = await supabase.from("aziende").update(patch).eq("id", match.id);
    if (!error) arricchite++;
  }

  if (daInserire.length) {
    const { error } = await supabase.from("aziende").insert(daInserire);
    if (error) return { error: error.message };
  }

  return { ok: true, inserite: daInserire.length, arricchite, duplicate, scartate };
}

export type FiltriExport = { stato?: string; segmento?: string; provincia?: string; fonte_ricerca?: string };

/** Export selezione in formato import (incluso id). Framework-agnostico. */
export async function esportaAziendeCore(
  supabase: SupabaseClient,
  filtri: FiltriExport,
): Promise<{ ok?: boolean; error?: string; json?: string; n?: number }> {
  let q = supabase.from("aziende").select(COLS).limit(50000);
  if (filtri.stato) q = q.eq("stato", filtri.stato);
  if (filtri.segmento) q = q.eq("segmento", filtri.segmento);
  if (filtri.provincia) q = q.eq("provincia", filtri.provincia);
  if (filtri.fonte_ricerca) q = q.eq("fonte_ricerca", filtri.fonte_ricerca);

  const { data, error } = await q;
  if (error) return { error: error.message };

  const righe = (data ?? []).map((a) => ({
    id: a.id,
    piva: a.piva,
    ragione_sociale: a.ragione_sociale,
    segmento: a.segmento,
    settore: a.settore,
    provincia: a.provincia,
    citta: a.citta,
    sito: a.sito,
    email: a.email,
    telefono: a.telefono,
    dimensione_stimata: a.dimensione_stimata,
    segnali: a.segnali,
    score: a.score,
    fonte_ricerca: a.fonte_ricerca,
  }));
  return { ok: true, json: JSON.stringify(righe, null, 2), n: righe.length };
}
