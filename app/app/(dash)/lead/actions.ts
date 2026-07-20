"use server";

import { revalidatePath } from "next/cache";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { STATI_LEAD, type StatoLead } from "@/lib/dashboard/tipi";
import { pianoTransizione } from "@/lib/lead/transizione";

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

// Cambio stato con storia (§PR30): unico punto di scrittura. Aggiorna il lead
// (stato + audit) e registra la riga in lead_stati_storia con l'autore.
export async function cambiaStato(id: string, stato: StatoLead): Promise<RisultatoAzione> {
  if (!STATI_LEAD.includes(stato)) return { error: "Stato non valido" };
  if (!supabaseConfigurato()) return { error: "Supabase non configurato" };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const piano = pianoTransizione(id, stato, user.id, new Date().toISOString());
  const { error } = await supabase.from("leads").update(piano.patch).eq("id", id);
  if (error) return { error: error.message };

  // Storia dello stadio raggiunto: base per i tassi del funnel (§PR31).
  await supabase.from("lead_stati_storia").insert(piano.storia);

  revalidatePath("/app/lead");
  revalidatePath("/app");
  return { ok: true };
}

export async function salvaNote(id: string, note: string): Promise<RisultatoAzione> {
  return aggiorna(id, { note: note.trim() || null });
}

// Valore commissione (§PR30): opzionale, sollecitato alla chiusura, modificabile dopo.
export async function salvaCommissione(id: string, valore: number | null): Promise<RisultatoAzione> {
  const pulito = valore != null && Number.isFinite(valore) && valore >= 0 ? valore : null;
  return aggiorna(id, { valore_commissione: pulito });
}

// Timeline della visita pre-lead (§PR32): gli eventi della sessione che ha generato
// il lead, in ordine cronologico, max 50.
export type EventoTimeline = {
  tipo: string;
  pagina: string | null;
  ts: string;
  dati: Record<string, unknown> | null;
};

export async function caricaTimeline(sessione: string): Promise<EventoTimeline[]> {
  if (!supabaseConfigurato() || !sessione) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("eventi")
    .select("tipo, pagina, ts, dati")
    .eq("sessione", sessione)
    .order("ts", { ascending: true })
    .limit(50);
  if (error) return [];
  return (data ?? []) as EventoTimeline[];
}

export async function impostaRichiamo(id: string, quando: string | null): Promise<RisultatoAzione> {
  // quando: datetime-local (ISO senza timezone) oppure null per rimuovere.
  const valore = quando ? new Date(quando).toISOString() : null;
  return aggiorna(id, { richiamare_il: valore });
}
