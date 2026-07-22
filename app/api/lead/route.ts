import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { leadSchema } from "@/lib/lead/schema";
import { calcolaScore } from "@/lib/scoring.config";
import { getAdmin } from "@/lib/supabase/admin";
import { notificaVenditore, notificaTarget, emailCortesia } from "@/lib/lead/notifiche";
import { veicoloById, titoloVeicolo } from "@/lib/catalogo";
import { parseIntake, targetDaBody, coreLeadInsert } from "@/lib/lead/intake";
import { rateLimit, chiaveClient } from "@/lib/ratelimit";

export const runtime = "nodejs";

// Tempo minimo di compilazione (§5): antispam. Vale su entrambe le corsie.
const TEMPO_MIN_MS = 3000;
// Rate limit della corsia target (per IP e per chiave).
const RL_LIMITE = 20;
const RL_FINESTRA_MS = 60_000;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errore: "Payload non valido" }, { status: 400 });
  }

  // Due corsie (§PR-9): nlt_b2b = percorso storico invariato; altri target = contratto v2.
  const target = targetDaBody(body);
  if (target === "nlt_b2b") return corsiaB2B(body);
  return corsiaTarget(req, body, target);
}

// ————— Corsia nlt_b2b: identica a oggi + fix §6 + target esplicito —————
async function corsiaB2B(body: unknown) {
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errore: "Dati non validi", dettagli: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Antispam: honeypot + tempo minimo → silenzio verso i bot (unico caso di "ok" muto).
  if (d.hp) return NextResponse.json({ ok: true }, { status: 200 });
  if (d.ts_apertura && Date.now() - d.ts_apertura < TEMPO_MIN_MS) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const score = calcolaScore(d);
  const veicolo = d.veicolo_id ? veicoloById(d.veicolo_id) : undefined;
  const veicoloTitolo = veicolo ? titoloVeicolo(veicolo) : null;

  // 1) Insert PRIMA (il lead non deve mai andare perso) — §6.
  let leadId: string | null = null;
  let insertOk = false;
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
        note: d.note || null,
        score,
        configurazione: d.configurazione ?? null,
        target: "nlt_b2b",
      })
      .select("id")
      .single();
    if (error) {
      console.error("[lead] insert Supabase fallito:", error.message);
    } else {
      leadId = data?.id ?? null;
      insertOk = true;
    }
  } else {
    console.warn("[lead] Supabase non configurato: il lead viene solo notificato.");
  }

  // 2) Notifiche DOPO (best effort): Telegram + fallback email, poi email di cortesia.
  const [notifica] = await Promise.allSettled([
    notificaVenditore(d, { score, veicoloTitolo, leadId, configurazione: d.configurazione ?? null }),
    emailCortesia(d),
  ]);
  const notifyOk = notifica.status === "fulfilled" && notifica.value === true;

  // Fix §6: se l'insert fallisce E nessuna notifica parte, il lead è perso → 500 cortese.
  // Mai più "ok" con lead perso in silenzio (il silenzio resta solo per honeypot/bot).
  if (!insertOk && !notifyOk) {
    return NextResponse.json(
      { ok: false, errore: "Non siamo riusciti a registrare la richiesta. Riprova o chiamaci." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}

// ————— Corsia target esterni: contratto v2, chiave, validazione dal DB —————
async function corsiaTarget(req: Request, body: unknown, target: string) {
  // Rate limit per IP sempre.
  if (!rateLimit(chiaveClient(req, "lead"), RL_LIMITE, RL_FINESTRA_MS)) {
    return NextResponse.json({ ok: false, errore: "Troppe richieste, riprova tra poco." }, { status: 429 });
  }

  const parsed = parseIntake(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, errore: parsed.errore, dettagli: parsed.dettagli }, { status: 400 });
  }
  const d = parsed.data;

  // Antispam su entrambe le corsie.
  if (d.hp) return NextResponse.json({ ok: true }, { status: 200 });
  if (d.ts_apertura && Date.now() - d.ts_apertura < TEMPO_MIN_MS) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const supabase = getAdmin();
  if (!supabase) return NextResponse.json({ ok: false, errore: "Servizio non disponibile" }, { status: 503 });

  // Registro del target via service role. Inesistente o spento → 400.
  const { data: reg, error: regErr } = await supabase
    .from("registro_target")
    .select("target, brand, labels, notifiche, chiave_hash, attivo")
    .eq("target", target)
    .maybeSingle();
  if (regErr || !reg || !reg.attivo) {
    return NextResponse.json({ ok: false, errore: "Target non valido o non attivo" }, { status: 400 });
  }

  // Chiave sito (se il target la richiede): confronto constant-time su sha256 → 401.
  if (reg.chiave_hash) {
    if (!d.chiave_sito || !confrontoCostante(sha256hex(d.chiave_sito), reg.chiave_hash)) {
      return NextResponse.json({ ok: false, errore: "Chiave non valida" }, { status: 401 });
    }
    // Rate limit anche per chiave, quando presente.
    if (!rateLimit("lead:chiave:" + reg.chiave_hash, RL_LIMITE, RL_FINESTRA_MS)) {
      return NextResponse.json({ ok: false, errore: "Troppe richieste, riprova tra poco." }, { status: 429 });
    }
  }

  const core = coreLeadInsert(d);
  const dati = d.dati ?? null;

  // Insert: `dati` lo valida il TRIGGER 014. Errore del trigger → 400 pulito, mai 500.
  const { data: ins, error } = await supabase
    .from("leads")
    .insert({ ...core, target, dati })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json(
      { ok: false, errore: "Dati non conformi al modulo", dettaglio: error.message },
      { status: 400 },
    );
  }
  const leadId = ins?.id ?? null;

  // Notifica per-target (best effort): corpo dalle labels, titolo [brand].
  await notificaTarget(
    { target: reg.target, brand: reg.brand, labels: reg.labels, notifiche: reg.notifiche },
    { ragione_sociale: core.ragione_sociale, telefono: core.telefono, email: core.email, provincia: core.provincia },
    dati,
    leadId,
  );

  return NextResponse.json({ ok: true }, { status: 200 });
}

function sha256hex(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
function confrontoCostante(aHex: string, bHex: string): boolean {
  const a = Buffer.from(aHex);
  const b = Buffer.from(bHex);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
