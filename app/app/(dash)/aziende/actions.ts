"use server";

import { revalidatePath } from "next/cache";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { parseImport, type Scarto } from "@/lib/aziende/import";

export type EsitoImport = {
  ok?: boolean;
  error?: string;
  inseriti?: number;
  duplicati?: number;
  scartate?: Scarto[];
};

export async function importaAziende(testo: string): Promise<EsitoImport> {
  if (!supabaseConfigurato()) return { error: "Supabase non configurato" };
  if (!testo.trim()) return { error: "Nessun dato da importare" };

  const { valide, scartate } = parseImport(testo);
  if (valide.length === 0) return { ok: true, inseriti: 0, duplicati: 0, scartate };

  const supabase = createClient();

  // Dedup nel batch (prima occorrenza vince per email).
  const vistiBatch = new Set<string>();
  const unici = valide.filter((v) => {
    if (!v.email) return true;
    if (vistiBatch.has(v.email)) return false;
    vistiBatch.add(v.email);
    return true;
  });

  // Dedup contro il DB (email già presenti).
  const emails = unici.map((v) => v.email).filter((e): e is string => Boolean(e));
  let esistenti = new Set<string>();
  if (emails.length) {
    const { data } = await supabase.from("aziende").select("email").in("email", emails);
    esistenti = new Set((data ?? []).map((r: { email: string | null }) => r.email ?? ""));
  }

  const daInserire = unici.filter((v) => !v.email || !esistenti.has(v.email));
  const duplicati = valide.length - daInserire.length;

  if (daInserire.length) {
    const { error } = await supabase.from("aziende").insert(
      daInserire.map((v) => ({
        ragione_sociale: v.ragione_sociale,
        segmento: v.segmento,
        settore: v.settore ?? null,
        provincia: v.provincia ?? null,
        citta: v.citta ?? null,
        sito: v.sito ?? null,
        email: v.email ?? null,
        telefono: v.telefono ?? null,
        dimensione_stimata: v.dimensione_stimata ?? null,
        segnali: v.segnali ?? null,
        score: v.score ?? null,
        fonte_ricerca: v.fonte_ricerca ?? "import",
      })),
    );
    if (error) return { error: error.message };
  }

  revalidatePath("/app/aziende");
  return { ok: true, inseriti: daInserire.length, duplicati, scartate };
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
