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

// Crea lead da azienda (§PR-3): una risposta outreach diventa un lead `nuovo` con
// azienda_id (ponte magazzino→vendita). I campi aziendali obbligatori del lead si
// riempiono dall'azienda o con default neutri (si raccolgono in chiamata), come per
// il richiamo rapido. Segna l'azienda come `lead` e apre la riga di storia.
export async function creaLeadDaAzienda(aziendaId: string): Promise<{ ok?: boolean; error?: string; leadId?: string }> {
  if (!supabaseConfigurato()) return { error: "Supabase non configurato" };
  const supabase = createClient();

  const { data: az, error: eAz } = await supabase
    .from("aziende")
    .select("id, ragione_sociale, provincia, citta, segmento, telefono, email")
    .eq("id", aziendaId)
    .maybeSingle();
  if (eAz) return { error: eAz.message };
  if (!az) return { error: "Azienda non trovata" };

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      azienda_id: az.id,
      ragione_sociale: az.ragione_sociale,
      referente: az.ragione_sociale,
      // Campi non ancora noti: default neutri, si raccolgono in chiamata.
      forma_giuridica: "altro",
      anni_attivita: "1_2",
      n_veicoli: "1",
      km_anno: "15_30",
      provincia: az.provincia ?? "—",
      telefono: az.telefono ?? "—",
      email: az.email ?? null,
      consenso_privacy: true,
      stato: "nuovo",
      note: "Lead da risposta outreach — dati da raccogliere in chiamata.",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await supabase.from("lead_stati_storia").insert({ lead_id: lead.id, stato: "nuovo" });
  await supabase.from("aziende").update({ stato: "lead" }).eq("id", az.id);

  revalidatePath("/app/aziende");
  revalidatePath("/app/lead");
  return { ok: true, leadId: lead.id };
}
