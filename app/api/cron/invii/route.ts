import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdmin } from "@/lib/supabase/admin";
import { costruisciEmail } from "@/lib/campagne/invio";
import type { Campagna } from "@/lib/campagne/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PER_RUN = 10; // piccoli batch: niente burst, spread sui run da 30 min
const TETTO_GLOBALE_DEFAULT = 50;

function tettoGlobale(): number {
  const n = Number(process.env.TETTO_GLOBALE_GIORNO);
  return Number.isFinite(n) && n > 0 ? n : TETTO_GLOBALE_DEFAULT;
}

// Finestra 8:30–18:00 lun–ven, ora italiana (§4).
function inFinestra(now: Date): boolean {
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const wd = p.find((x) => x.type === "weekday")?.value ?? "";
  const h = Number(p.find((x) => x.type === "hour")?.value ?? "0");
  const m = Number(p.find((x) => x.type === "minute")?.value ?? "0");
  if (["Sat", "Sun"].includes(wd)) return false;
  const min = h * 60 + m;
  return min >= 510 && min <= 1080; // 8:30–18:00
}

function autorizzato(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // senza secret il cron è disabilitato
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET(req: Request) {
  if (!autorizzato(req)) {
    return NextResponse.json({ ok: false, error: "non autorizzato" }, { status: 401 });
  }

  const from = process.env.MAIL_FROM;
  const resendKey = process.env.RESEND_API_KEY;
  const supabase = getAdmin();
  if (!from || !resendKey || !supabase) {
    return NextResponse.json({ ok: true, skipped: "config invii incompleta (MAIL_FROM/RESEND/DB)" });
  }

  const now = new Date();
  if (!inFinestra(now)) {
    return NextResponse.json({ ok: true, skipped: "fuori finestra oraria" });
  }

  // Conteggi giornalieri per i tetti.
  const inizioGiorno = new Date(now);
  inizioGiorno.setUTCHours(0, 0, 0, 0);
  const { count: inviatiOggi } = await supabase
    .from("invii")
    .select("id", { count: "exact", head: true })
    .eq("esito", "inviata")
    .gte("inviato_il", inizioGiorno.toISOString());

  const globaleRimasto = tettoGlobale() - (inviatiOggi ?? 0);
  if (globaleRimasto <= 0) {
    return NextResponse.json({ ok: true, inviati: 0, motivo: "tetto globale raggiunto" });
  }

  // Candidati: in coda, schedulati, campagna attiva, azienda con email e non opt-out.
  const { data: righe } = await supabase
    .from("invii")
    .select(
      "id, azienda_id, campagna_id, campagne(id,nome,oggetto,corpo,tetto_giornaliero,stato,segmento,creato_il), aziende(id,ragione_sociale,citta,provincia,settore,segmento,email,stato)",
    )
    .eq("esito", "in_coda")
    .lte("pianificato_il", now.toISOString())
    .order("pianificato_il", { ascending: true })
    .limit(200);

  type Riga = {
    id: string;
    azienda_id: string;
    campagna_id: string;
    campagne: Campagna | null;
    aziende: {
      id: string;
      ragione_sociale: string;
      citta: string | null;
      provincia: string | null;
      settore: string | null;
      segmento: string;
      email: string | null;
      stato: string;
    } | null;
  };

  const candidati = ((righe ?? []) as unknown as Riga[]).filter(
    (r) =>
      r.campagne?.stato === "attiva" &&
      r.aziende?.email &&
      r.aziende.stato !== "opt_out",
  );

  // Tetto per campagna: quante inviate oggi per ciascuna campagna coinvolta.
  const campagneCoinvolte = [...new Set(candidati.map((r) => r.campagna_id))];
  const inviatiPerCampagna = new Map<string, number>();
  for (const cid of campagneCoinvolte) {
    const { count } = await supabase
      .from("invii")
      .select("id", { count: "exact", head: true })
      .eq("campagna_id", cid)
      .eq("esito", "inviata")
      .gte("inviato_il", inizioGiorno.toISOString());
    inviatiPerCampagna.set(cid, count ?? 0);
  }

  const resend = new Resend(resendKey);
  let inviati = 0;
  const errori: string[] = [];

  for (const r of candidati) {
    if (inviati >= MAX_PER_RUN) break;
    if (inviati >= globaleRimasto) break;

    const camp = r.campagne!;
    const usati = inviatiPerCampagna.get(r.campagna_id) ?? 0;
    if (usati >= camp.tetto_giornaliero) continue; // tetto campagna raggiunto oggi

    const az = r.aziende!;
    const email = costruisciEmail(camp, {
      id: az.id,
      ragione_sociale: az.ragione_sociale,
      citta: az.citta,
      provincia: az.provincia,
      settore: az.settore,
      segmento: az.segmento,
      email: az.email!,
    });

    try {
      const { error } = await resend.emails.send({
        from,
        to: az.email!,
        subject: email.subject,
        text: email.text,
        html: email.html,
        headers: { "List-Unsubscribe": `<${email.unsubscribe}>` },
      });
      if (error) throw new Error(error.message);
      await supabase
        .from("invii")
        .update({ esito: "inviata", inviato_il: new Date().toISOString(), errore: null })
        .eq("id", r.id);
      inviatiPerCampagna.set(r.campagna_id, usati + 1);
      inviati++;
    } catch (e) {
      const msg = (e as Error).message.slice(0, 300);
      errori.push(`${az.email}: ${msg}`);
      await supabase.from("invii").update({ esito: "errore", errore: msg }).eq("id", r.id);
    }

    // Jitter anti-burst tra invii.
    await sleep(200 + Math.floor(Math.random() * 600));
  }

  return NextResponse.json({ ok: true, inviati, errori: errori.length, dettaglioErrori: errori });
}
