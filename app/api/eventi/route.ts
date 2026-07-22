import { NextResponse } from "next/server";
import { eventoSchema } from "@/lib/eventi/schema";
import { getAdmin } from "@/lib/supabase/admin";
import { rateLimit, chiaveClient } from "@/lib/ratelimit";

export const runtime = "nodejs";

// Insert eventi via service role (§5). Privacy-first: nessun IP salvato, nessun cookie.
// Cap per sessione anti-flood: oltre soglia in finestra breve, si scarta silenziosamente.
const CAP_SESSIONE = 300;
const FINESTRA_MIN = 30;

// Rate limit per IP (§7): l'IP è usato solo in memoria per il throttling, mai salvato.
const RL_LIMITE = 40;
const RL_FINESTRA_MS = 10_000;

export async function POST(req: Request) {
  // Throttle burst per IP prima di toccare il DB (best effort, silenzioso).
  if (!rateLimit(chiaveClient(req, "eventi"), RL_LIMITE, RL_FINESTRA_MS)) {
    return NextResponse.json({ ok: true, throttled: true }, { status: 200 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = eventoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const e = parsed.data;

  const supabase = getAdmin();
  if (!supabase) {
    // Senza DB non tracciamo, ma non rompiamo il sito.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Anti-flood: conta gli eventi recenti della sessione.
  const da = new Date(Date.now() - FINESTRA_MIN * 60000).toISOString();
  const { count } = await supabase
    .from("eventi")
    .select("id", { count: "exact", head: true })
    .eq("sessione", e.sessione)
    .gte("ts", da);

  if ((count ?? 0) >= CAP_SESSIONE) {
    return NextResponse.json({ ok: true, capped: true }, { status: 200 });
  }

  await supabase.from("eventi").insert({
    sessione: e.sessione,
    tipo: e.tipo,
    pagina: e.pagina || null,
    veicolo_id: e.veicolo_id || null,
    profilo_fiscale: e.profilo_fiscale || null,
    fonte: e.fonte ?? null,
    dati: e.dati ?? null,
    target: e.target || "nlt_b2b",
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
