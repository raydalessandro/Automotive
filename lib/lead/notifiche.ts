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
import { siteUrl, SITE } from "../site";
import { titoliRischi, type Configurazione } from "../servizi.config";

type Contesto = {
  score: number;
  veicoloTitolo: string | null;
  leadId?: string | null;
  configurazione?: Configurazione | null;
};

// Riga configurazione per Telegram (§3): dove spingere in chiamata.
function rigaConfig(c: Configurazione): string | null {
  const parti: string[] = [];
  if (c.servizi_scelti?.length) parti.push(`Config: ${titoliRischi(c.servizi_scelti).join(", ")}`);
  if (c.servizi_interesse?.length) parti.push(`Interessi: ${titoliRischi(c.servizi_interesse).join(", ")}`);
  if (c.rischi_accettati?.length) parti.push(`Rischi accettati: ${titoliRischi(c.rischi_accettati).join(", ")}`);
  if (c.rata_configurata) parti.push(`Rata ~€${c.rata_configurata}`);
  return parti.length ? "🧩 " + parti.join(" · ") : null;
}

function messaggioTelegram(d: DatiLead, ctx: Contesto): string {
  // Richiamo rapido (modal minimale): è il lead più caldo, ma i default sentinella
  // gli danno score basso. Va marcato prioritario a prescindere dallo score, e senza
  // mostrare i campi aziendali fittizi (verranno raccolti in chiamata).
  if (d.note && d.note.includes("Richiamo rapido")) {
    const righe = [
      "⚡ RICHIAMO RAPIDO — chiamare subito",
      `${d.referente}`,
      `📞 ${d.telefono}`,
    ];
    if (ctx.veicoloTitolo) righe.push(`Veicolo: ${ctx.veicoloTitolo}`);
    if (ctx.configurazione) {
      const rc = rigaConfig(ctx.configurazione);
      if (rc) righe.push(rc);
    }
    righe.push("ℹ️ Dati aziendali da raccogliere in chiamata.");
    if (ctx.leadId) righe.push(`🔗 ${siteUrl()}/app/lead?apri=${ctx.leadId}`);
    return righe.join("\n");
  }

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
  // Configurazione dal configuratore: dove spingere.
  if (ctx.configurazione) {
    const rc = rigaConfig(ctx.configurazione);
    if (rc) righe.push(rc);
  }
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
      from: `${SITE.nome} <noreply@imperoautomotive.it>`,
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
      from: `${SITE.nome} <noreply@imperoautomotive.it>`,
      to: d.email,
      subject: "Abbiamo ricevuto la tua richiesta",
      text: [
        `Ciao ${d.referente},`,
        "",
        "grazie per averci contattato. Abbiamo ricevuto la tua richiesta e ti ricontatteremo entro 24 ore lavorative con un preventivo su misura.",
        "",
        `Se vuoi anticipare i tempi, scrivici o chiamaci:`,
        `Telefono: ${CONTATTI.telefono}`,
        `WhatsApp: https://wa.me/${waNumero}`,
        "",
        "A presto,",
        `Il team di ${SITE.nome}`,
      ].join("\n"),
    });
  } catch {
    // best effort
  }
}
