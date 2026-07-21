"use server";

import { revalidatePath } from "next/cache";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { STATI_LEAD, type StatoLead } from "@/lib/dashboard/tipi";
import { pianoTransizione } from "@/lib/lead/transizione";
import { notificaAssegnazione } from "@/lib/lead/notifiche";

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

// Transizione con nota + patch extra (§PR-3): unico punto di scrittura per le azioni
// operatore (smista, scarta, riassegna, riapri, chiudi). Aggiorna stato + audit, e
// registra la riga di storia con l'autore e la nota libera.
async function transisci(
  id: string,
  stato: StatoLead,
  nota: string | null = null,
  extraPatch: Record<string, unknown> = {},
): Promise<RisultatoAzione> {
  if (!STATI_LEAD.includes(stato)) return { error: "Stato non valido" };
  if (!supabaseConfigurato()) return { error: "Supabase non configurato" };
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta" };

  const piano = pianoTransizione(id, stato, user.id, new Date().toISOString());
  const { error } = await supabase.from("leads").update({ ...piano.patch, ...extraPatch }).eq("id", id);
  if (error) return { error: error.message };
  await supabase.from("lead_stati_storia").insert({ ...piano.storia, nota: nota?.trim() || null });

  revalidatePath("/app/lead");
  revalidatePath("/app");
  return { ok: true };
}

// Notifica di assegnazione al venditore (§PR-5). Blindata: qualsiasi errore (rete,
// Telegram giù, chat_id null, RLS) resta qui dentro e non tocca mai l'esito dello
// smistamento. Recupera chat_id + azienda/città per comporre il deep-link a /vendita.
async function notificaSmistamento(leadId: string, venditoreId: string): Promise<void> {
  try {
    const supabase = createClient();
    const { data: v } = await supabase
      .from("venditori")
      .select("telegram_chat_id")
      .eq("id", venditoreId)
      .maybeSingle();
    if (!v?.telegram_chat_id) return;

    const { data: l } = await supabase
      .from("leads")
      .select("ragione_sociale, provincia, azienda_id")
      .eq("id", leadId)
      .maybeSingle();
    if (!l) return;

    // Città dal magazzino azienda se il lead ne ha una collegata, altrimenti provincia.
    let citta: string | null = l.provincia ?? null;
    if (l.azienda_id) {
      const { data: a } = await supabase
        .from("aziende")
        .select("citta")
        .eq("id", l.azienda_id)
        .maybeSingle();
      if (a?.citta) citta = a.citta;
    }

    await notificaAssegnazione(
      { telegram_chat_id: v.telegram_chat_id },
      { id: leadId, azienda: l.ragione_sociale ?? null, citta },
    );
  } catch {
    // fire-and-forget: mai propagare (lo smistamento è già andato a buon fine).
  }
}

/** Smista un lead a un venditore → stato `assegnato` + assegnato_a/il (§PR-3). */
export async function smistaLead(id: string, venditoreId: string, nota?: string): Promise<RisultatoAzione> {
  if (!venditoreId) return { error: "Nessun venditore selezionato" };
  const r = await transisci(id, "assegnato", nota ?? null, {
    assegnato_a: venditoreId,
    assegnato_il: new Date().toISOString(),
  });
  // Aggancio Telegram (§PR-5): solo a smistamento riuscito, e mai bloccante/fallace.
  if (r.ok) await notificaSmistamento(id, venditoreId);
  return r;
}

/** Riassegna a un altro venditore (resta `assegnato`, aggiorna assegnato_a/il). */
export async function riassegnaLead(id: string, venditoreId: string, nota?: string): Promise<RisultatoAzione> {
  return smistaLead(id, venditoreId, nota);
}

/** Scarta un lead → `perso` con nota (default "Scartato in smistamento"). */
export async function scartaLead(id: string, nota?: string): Promise<RisultatoAzione> {
  return transisci(id, "perso", nota ?? "Scartato in smistamento");
}

/** Riapre una trattativa chiusa/persa → torna `preso_in_carico`. */
export async function riapriLead(id: string, nota?: string): Promise<RisultatoAzione> {
  return transisci(id, "preso_in_carico", nota ?? "Riaperta dall'operatore");
}

/** Chiude un lead → `chiuso` con nota di esito. */
export async function chiudiLead(id: string, nota?: string): Promise<RisultatoAzione> {
  return transisci(id, "chiuso", nota ?? null);
}

// Brief azienda del lead (§PR-3 blocchi 1-2): dati dal magazzino via azienda_id.
export type AziendaBrief = {
  ragione_sociale: string;
  citta: string | null;
  provincia: string | null;
  settore: string | null;
  dimensione_stimata: string | null;
  sito: string | null;
  telefono: string | null;
  segnali: string | null;
  score: number | null;
  fonte_ricerca: string | null;
};

export async function caricaAzienda(aziendaId: string): Promise<AziendaBrief | null> {
  if (!supabaseConfigurato() || !aziendaId) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("aziende")
    .select("ragione_sociale, citta, provincia, settore, dimensione_stimata, sito, telefono, segnali, score, fonte_ricerca")
    .eq("id", aziendaId)
    .maybeSingle();
  if (error) return null;
  return (data as AziendaBrief) ?? null;
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
