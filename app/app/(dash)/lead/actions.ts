"use server";

import { revalidatePath } from "next/cache";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { STATI_LEAD, type StatoLead } from "@/lib/dashboard/tipi";

export type RisultatoAzione = { ok?: boolean; error?: string };

// Aggiornamento con audit (§2): ogni azione valorizza aggiornato_il e aggiornato_da.
async function aggiorna(id: string, patch: Record<string, unknown>): Promise<RisultatoAzione> {
  if (!supabaseConfigurato()) return { error: "Supabase non configurato" };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const { error } = await supabase
    .from("leads")
    .update({ ...patch, aggiornato_il: new Date().toISOString(), aggiornato_da: user.id })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/app/lead");
  revalidatePath("/app");
  return { ok: true };
}

export async function cambiaStato(id: string, stato: StatoLead): Promise<RisultatoAzione> {
  if (!STATI_LEAD.includes(stato)) return { error: "Stato non valido" };
  return aggiorna(id, { stato });
}

export async function salvaNote(id: string, note: string): Promise<RisultatoAzione> {
  return aggiorna(id, { note: note.trim() || null });
}

export async function impostaRichiamo(id: string, quando: string | null): Promise<RisultatoAzione> {
  // quando: datetime-local (ISO senza timezone) oppure null per rimuovere.
  const valore = quando ? new Date(quando).toISOString() : null;
  return aggiorna(id, { richiamare_il: valore });
}
