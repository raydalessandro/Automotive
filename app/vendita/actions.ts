"use server";

import { revalidatePath } from "next/cache";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { pianoTransizione } from "@/lib/lead/transizione";
import type { StatoLead } from "@/lib/dashboard/tipi";

export type Risultato = { ok?: boolean; error?: string };

// Transizione del venditore: stessa macchina di casa base (pianoTransizione + storia
// con nota). La RLS (§011) garantisce che il venditore tocchi SOLO i propri lead:
// niente service role qui, si passa dal client autenticato.
async function transizione(id: string, stato: StatoLead, nota: string | null): Promise<Risultato> {
  if (!supabaseConfigurato()) return { error: "Supabase non configurato" };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const piano = pianoTransizione(id, stato, user.id, new Date().toISOString());
  const { error } = await supabase.from("leads").update(piano.patch).eq("id", id);
  if (error) return { error: error.message };
  await supabase.from("lead_stati_storia").insert({ ...piano.storia, nota: nota?.trim() || null });

  revalidatePath("/vendita");
  revalidatePath(`/vendita/${id}`);
  return { ok: true };
}

/** Da `assegnato` → `preso_in_carico`. */
export async function prendoInCarico(id: string): Promise<Risultato> {
  return transizione(id, "preso_in_carico", null);
}

const ESITI: StatoLead[] = ["chiuso", "preventivo_inviato", "in_sospeso", "perso"];

/** Registra un esito con la nota "cosa è venuto fuori". */
export async function registraEsito(id: string, stato: StatoLead, nota?: string): Promise<Risultato> {
  if (!ESITI.includes(stato)) return { error: "Esito non valido" };
  return transizione(id, stato, nota ?? null);
}

// Azienda del lead per il brief — solo i campi utili alla vendita, mai la provenienza
// della ricerca né altri dati del magazzino (guardrail §PR-4).
export type AziendaVendita = {
  ragione_sociale: string;
  citta: string | null;
  provincia: string | null;
  settore: string | null;
  dimensione_stimata: string | null;
  sito: string | null;
  telefono: string | null;
  segnali: string | null;
  score: number | null;
};

export async function caricaAziendaVendita(aziendaId: string): Promise<AziendaVendita | null> {
  if (!supabaseConfigurato() || !aziendaId) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("aziende")
    .select("ragione_sociale, citta, provincia, settore, dimensione_stimata, sito, telefono, segnali, score")
    .eq("id", aziendaId)
    .maybeSingle();
  if (error) return null;
  return (data as AziendaVendita) ?? null;
}

// Timeline del brief = storia degli stati con note (NON gli eventi analytics).
export type TappaStoria = { stato: string; nota: string | null; ts: string };

export async function caricaStoriaVendita(leadId: string): Promise<TappaStoria[]> {
  if (!supabaseConfigurato() || !leadId) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lead_stati_storia")
    .select("stato, nota, ts")
    .eq("lead_id", leadId)
    .order("ts", { ascending: true })
    .limit(50);
  if (error) return [];
  return (data ?? []) as TappaStoria[];
}
