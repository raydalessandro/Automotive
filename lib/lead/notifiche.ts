// Notifiche lead — §6.2/6.3. Telegram istantaneo + fallback email (Resend).
// Il lead in DB non deve mai andare perso: insert prima, notifiche poi (best effort).

import { Resend } from "resend";
import {
  type DatiLead,
  labelForma,
  labelAnni,
  labelNVeicoli,
  labelKm,
} from "./schema";
import { isHot } from "../scoring.config";
import { CONTATTI } from "../contatti";
import { siteUrl } from "../site";

type Contesto = { score: number; veicoloTitolo: string | null; leadId?: string | null };

function messaggioTelegram(d: DatiLead, ctx: Contesto): string {
  const hot = isHot(ctx.score) ? " · HOT" : "";
  const fonte = d.fonte?.utm_source
    ? `${d.fonte.utm_source}/${d.fonte.utm_medium ?? "-"}`
    : "diretto";
  const righe = [
    `🔥 NUOVO LEAD (score ${ctx.score}${hot})`,
    `${d.ragione_sociale} — ${labelForma(d.forma_giuridica)}, attività da ${labelAnni(d.anni_attivita)}`,
    `Veicolo: ${ctx.veicoloTitolo ?? "non specificato"} · ${labelNVeicoli(d.n_veicoli)} veicoli · ${labelKm(d.km_anno)} km/anno`,
    `📞 ${d.telefono} · ${d.provincia}`,
    `✉️ ${d.email || "—"}`,
    `Fonte: ${fonte} · Pagina: ${d.pagina || "—"}`,
  ];
  // Deep link al dettaglio nella dashboard (§6): la dashboard è il posto di lavoro.
  if (ctx.leadId) righe.push(`🔗 ${siteUrl()}/app/lead?apri=${ctx.leadId}`);
  return righe.join("\n");
}

async function inviaTelegram(testo: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: testo, disable_web_page_preview: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

async function inviaEmailFallback(testo: string): Promise<void> {
  const resend = getResend();
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!resend || !to) return;
  try {
    await resend.emails.send({
      from: "Impero Automotive <noreply@imperoautomotive.it>",
      to,
      subject: "Nuovo lead dal sito",
      text: testo,
    });
  } catch {
    // best effort
  }
}

/** Notifica interna: Telegram, con fallback email se Telegram fallisce (§6.2). */
export async function notificaVenditore(d: DatiLead, ctx: Contesto): Promise<void> {
  const testo = messaggioTelegram(d, ctx);
  const okTg = await inviaTelegram(testo);
  if (!okTg) {
    await inviaEmailFallback(testo);
  }
}

/** Email di cortesia al lead, se ha lasciato l'email (§6.3). */
export async function emailCortesia(d: DatiLead): Promise<void> {
  const resend = getResend();
  if (!resend || !d.email) return;
  const waNumero = CONTATTI.whatsapp;
  try {
    await resend.emails.send({
      from: "Impero Automotive <noreply@imperoautomotive.it>",
      to: d.email,
      subject: "Abbiamo ricevuto la tua richiesta",
      text: [
        `Ciao ${d.referente},`,
        "",
        "grazie per averci contattato. Abbiamo ricevuto la tua richiesta e ti ricontatteremo entro poche ore lavorative con un preventivo su misura.",
        "",
        `Se vuoi anticipare i tempi, scrivici o chiamaci:`,
        `Telefono: ${CONTATTI.telefono}`,
        `WhatsApp: https://wa.me/${waNumero}`,
        "",
        "A presto,",
        "Il team di Impero Automotive",
      ].join("\n"),
    });
  } catch {
    // best effort
  }
}
