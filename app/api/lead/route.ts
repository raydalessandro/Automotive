import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/lead/schema";
import { calcolaScore } from "@/lib/scoring.config";
import { getAdmin } from "@/lib/supabase/admin";
import { notificaVenditore, emailCortesia } from "@/lib/lead/notifiche";
import { veicoloById, titoloVeicolo } from "@/lib/catalogo";

export const runtime = "nodejs";

// Tempo minimo di compilazione (§5): antispam.
const TEMPO_MIN_MS = 3000;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errore: "Payload non valido" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errore: "Dati non validi", dettagli: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Antispam: honeypot deve essere vuoto (già validato) + tempo minimo.
  if (d.hp) {
    return NextResponse.json({ ok: true }, { status: 200 }); // silenzioso verso i bot
  }
  if (d.ts_apertura && Date.now() - d.ts_apertura < TEMPO_MIN_MS) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const score = calcolaScore(d);
  const veicolo = d.veicolo_id ? veicoloById(d.veicolo_id) : undefined;
  const veicoloTitolo = veicolo ? titoloVeicolo(veicolo) : null;

  // 1) Insert PRIMA (il lead non deve mai andare perso) — §6.
  let leadId: string | null = null;
  const supabase = getAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("leads")
      .insert({
        fonte: d.fonte ?? null,
        pagina: d.pagina || null,
        veicolo_id: d.veicolo_id || null,
        ragione_sociale: d.ragione_sociale,
        referente: d.referente,
        forma_giuridica: d.forma_giuridica,
        anni_attivita: d.anni_attivita,
        settore: d.settore || null,
        n_veicoli: d.n_veicoli,
        km_anno: d.km_anno,
        telefono: d.telefono,
        email: d.email || null,
        provincia: d.provincia,
        consenso_privacy: d.consenso_privacy,
        consenso_marketing: d.consenso_marketing ?? false,
        score,
        configurazione: d.configurazione ?? null,
      })
      .select("id")
      .single();
    if (error) {
      console.error("[lead] insert Supabase fallito:", error.message);
      // Non blocchiamo: proviamo comunque a notificare così il lead arriva al venditore.
    } else {
      leadId = data?.id ?? null;
    }
  } else {
    console.warn("[lead] Supabase non configurato: il lead viene solo notificato.");
  }

  // 2) Notifiche DOPO (best effort): Telegram + fallback email, poi email di cortesia.
  await Promise.allSettled([
    notificaVenditore(d, { score, veicoloTitolo, leadId, configurazione: d.configurazione ?? null }),
    emailCortesia(d),
  ]);

  return NextResponse.json({ ok: true }, { status: 200 });
}
