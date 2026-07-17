"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { STATI_CAMPAGNA, type StatoCampagna } from "@/lib/campagne/schema";

function sb() {
  return createClient();
}

export async function creaCampagna(form: FormData): Promise<void> {
  if (!supabaseConfigurato()) return;
  const supabase = sb();
  const { data } = await supabase
    .from("campagne")
    .insert({
      nome: String(form.get("nome") ?? "Nuova campagna").trim() || "Nuova campagna",
      segmento: String(form.get("segmento") ?? "altro"),
      oggetto: String(form.get("oggetto") ?? "").trim(),
      corpo: String(form.get("corpo") ?? "").trim(),
      tetto_giornaliero: Math.max(1, Number(form.get("tetto_giornaliero") ?? 30)),
      stato: "bozza",
    })
    .select("id")
    .single();
  revalidatePath("/app/campagne");
  if (data?.id) redirect(`/app/campagne/${data.id}`);
}

export async function aggiornaCampagna(
  id: string,
  patch: { nome?: string; segmento?: string; oggetto?: string; corpo?: string; tetto_giornaliero?: number },
): Promise<{ ok?: boolean; error?: string }> {
  if (!supabaseConfigurato()) return { error: "Supabase non configurato" };
  const { error } = await sb().from("campagne").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/app/campagne/${id}`);
  return { ok: true };
}

export async function cambiaStatoCampagna(id: string, stato: StatoCampagna): Promise<{ ok?: boolean; error?: string }> {
  if (!STATI_CAMPAGNA.includes(stato)) return { error: "Stato non valido" };
  // Guard §4: nessun invio parte senza dominio d'invio configurato.
  if (stato === "attiva" && !process.env.MAIL_FROM) {
    return { error: "Dominio d'invio non configurato (MAIL_FROM): la campagna resta in bozza." };
  }
  const { error } = await sb().from("campagne").update({ stato }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/app/campagne/${id}`);
  return { ok: true };
}

// Accodamento (§3 + PR14). Primo tocco: aziende 'da_contattare' del segmento.
// Follow-up: aziende 'in_campagna' (già toccate, non ancora risposte/opt_out),
// opzionalmente solo quelle già raggiunte da una campagna d'origine.
export type OpzioniAccoda = { followUp?: boolean; origineCampagnaId?: string };

export async function accoda(
  id: string,
  opts: OpzioniAccoda = {},
): Promise<{ ok?: boolean; error?: string; accodati?: number }> {
  if (!supabaseConfigurato()) return { error: "Supabase non configurato" };
  const supabase = sb();

  const { data: campagna, error: eCamp } = await supabase.from("campagne").select("*").eq("id", id).single();
  if (eCamp || !campagna) return { error: "Campagna non trovata" };

  // Stato candidato: follow-up = in_campagna (esclude di fatto risposto/lead/non_interessata/opt_out);
  // primo tocco = da_contattare.
  const statoTarget = opts.followUp ? "in_campagna" : "da_contattare";

  const { data: aziende } = await supabase
    .from("aziende")
    .select("id, email, stato")
    .eq("segmento", campagna.segmento)
    .eq("stato", statoTarget)
    .not("email", "is", null)
    .limit(5000);

  let candidate = (aziende ?? []) as { id: string; email: string | null }[];
  if (candidate.length === 0) return { ok: true, accodati: 0 };

  // Opzione "già raggiunte dalla campagna X": intersezione con chi ha un invio in quella campagna.
  if (opts.origineCampagnaId) {
    const { data: origine } = await supabase
      .from("invii")
      .select("azienda_id")
      .eq("campagna_id", opts.origineCampagnaId);
    const raggiunte = new Set((origine ?? []).map((r: { azienda_id: string }) => r.azienda_id));
    candidate = candidate.filter((a) => raggiunte.has(a.id));
    if (candidate.length === 0) return { ok: true, accodati: 0 };
  }

  // Escludi quelle già accodate per questa campagna (vincolo unique le bloccherebbe comunque).
  const { data: giaInvii } = await supabase.from("invii").select("azienda_id").eq("campagna_id", id);
  const gia = new Set((giaInvii ?? []).map((r: { azienda_id: string }) => r.azienda_id));
  const target = candidate.filter((a) => !gia.has(a.id));
  if (target.length === 0) return { ok: true, accodati: 0 };

  const tetto = Math.max(1, campagna.tetto_giornaliero);
  const base = new Date();
  base.setHours(9, 0, 0, 0);

  const righe = target.map((a, i) => {
    const giorno = Math.floor(i / tetto);
    const quando = new Date(base);
    quando.setDate(quando.getDate() + giorno);
    return { campagna_id: id, azienda_id: a.id, esito: "in_coda", pianificato_il: quando.toISOString() };
  });

  const { error: eIns } = await supabase.from("invii").insert(righe);
  if (eIns) return { error: eIns.message };

  // Primo tocco: le aziende passano a in_campagna. Follow-up: già in_campagna, non tocchiamo lo stato.
  if (!opts.followUp) {
    await supabase.from("aziende").update({ stato: "in_campagna" }).in(
      "id",
      target.map((a) => a.id),
    );
  }

  revalidatePath(`/app/campagne/${id}`);
  return { ok: true, accodati: righe.length };
}

// §3: "segna risposta" su un'azienda → risposto (o lead).
export async function segnaRisposta(aziendaId: string, stato: "risposto" | "lead", campagnaId: string): Promise<{ ok?: boolean; error?: string }> {
  const { error } = await sb().from("aziende").update({ stato }).eq("id", aziendaId);
  if (error) return { error: error.message };
  revalidatePath(`/app/campagne/${campagnaId}`);
  return { ok: true };
}
