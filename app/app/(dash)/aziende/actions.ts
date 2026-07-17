"use server";

import { revalidatePath } from "next/cache";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import {
  importaAziendeCore,
  esportaAziendeCore,
  type EsitoImport,
  type ModoImport,
  type FiltriExport,
} from "@/lib/aziende/core";

export type { EsitoImport, ModoImport };

export async function importaAziende(testo: string, modo: ModoImport = "raccolta"): Promise<EsitoImport> {
  if (!supabaseConfigurato()) return { error: "Supabase non configurato" };
  const r = await importaAziendeCore(createClient(), testo, modo);
  if (r.ok) revalidatePath("/app/aziende");
  return r;
}

export async function aggiornaAzienda(
  id: string,
  patch: { stato?: string; segnali?: string },
): Promise<{ ok?: boolean; error?: string }> {
  if (!supabaseConfigurato()) return { error: "Supabase non configurato" };
  const supabase = createClient();
  const { error } = await supabase.from("aziende").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/app/aziende");
  return { ok: true };
}

export async function esportaSelezione(
  filtri: FiltriExport,
): Promise<{ ok?: boolean; error?: string; json?: string; n?: number }> {
  if (!supabaseConfigurato()) return { error: "Supabase non configurato" };
  return esportaAziendeCore(createClient(), filtri);
}
