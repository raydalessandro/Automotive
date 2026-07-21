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
import { veicoloById, titoloVeicolo } from "../catalogo";
import { DOMANDE } from "../consulente.config";
import { RICHIAMO, iniziali, type Consulente } from "../team";

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

// Riga Consulente per Telegram (§5): il percorso a domande + la soluzione scelta.
function etichettaConsulente(chiave: string, valore: string): string {
  const dom = DOMANDE.find((x) => x.chiave === chiave);
  return dom?.opzioni.find((o) => o.id === valore)?.label ?? valore;
}
function rigaConsulente(c: Configurazione): string | null {
  const k = c.consulente;
  if (!k?.risposte) return null;
  const r = k.risposte;
  const parti = [
    r.attivita ? etichettaConsulente("attivita", r.attivita) : null,
    r.km ? etichettaConsulente("km", r.km) : null,
    r.trasporto ? `trasporto ${r.trasporto === "no" ? "no" : "sì"}` : null,
    r.priorita ? etichettaConsulente("priorita", r.priorita) : null,
  ].filter(Boolean);
  let riga = `🧭 Consulente: ${parti.join(" · ")}`;
  if (k.soluzione_scelta) {
    const v = veicoloById(k.soluzione_scelta);
    riga += ` → ${v ? titoloVeicolo(v) : k.soluzione_scelta}`;
  }
  return riga;
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
      const rk = rigaConsulente(ctx.configurazione);
      if (rk) righe.push(rk);
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
    const rk = rigaConsulente(ctx.configurazione);
    if (rk) righe.push(rk);
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

// Invio Telegram a una chat specifica (§PR-5): il canale è lo stesso, cambia solo il
// destinatario (il venditore assegnatario). Timeout duro via AbortController perché il
// chiamante è fire-and-forget: non deve mai restare appeso in attesa di Telegram.
async function inviaTelegramA(chatId: string, testo: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return false;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: testo, disable_web_page_preview: true }),
      signal: ctrl.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Notifica al venditore l'assegnazione di un lead (§PR-5), sul canale Telegram già
 * esistente. Deep-link al brief in /vendita. Fallback silenzioso se il venditore non
 * ha `telegram_chat_id`: lo smistamento non deve mai dipendere da Telegram.
 */
export async function notificaAssegnazione(
  venditore: { telegram_chat_id: string | null },
  lead: { id: string; azienda: string | null; citta: string | null },
): Promise<void> {
  const chatId = venditore.telegram_chat_id;
  if (!chatId) return;
  const azienda = lead.azienda ?? "Nuovo contatto";
  const citta = lead.citta ?? "—";
  const testo = `Nuovo lead: ${azienda} — ${citta}. Apri: ${siteUrl()}/vendita/${lead.id}`;
  await inviaTelegramA(chatId, testo);
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

// Avatar 48px per la firma email (§2): foto via URL assoluto, altrimenti segnaposto
// a iniziali (cerchio grafite, iniziali oro) — resta identico anche senza foto.
function avatarEmail(c: Consulente, base: string): string {
  if (c.foto) {
    return `<img src="${base}${c.foto}" width="48" height="48" alt="${c.nome}" style="border-radius:24px;display:block;border:1px solid #B08D4F;" />`;
  }
  return `<span style="display:inline-block;width:48px;height:48px;line-height:48px;border-radius:24px;background-color:#26231E;color:#B08D4F;font-family:Georgia,'Times New Roman',serif;font-weight:bold;font-size:18px;text-align:center;">${iniziali(c.nome)}</span>`;
}

// Firma "CardRichiamo" per l'email: avatar affiancati + testo fisso.
function firmaRichiamoHtml(base: string): string {
  const avatars = RICHIAMO.map((c) => `<td style="padding-right:6px;">${avatarEmail(c, base)}</td>`).join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px;padding-top:16px;border-top:1px solid #E7E1D6;"><tr>${avatars}<td style="padding-left:8px;font-size:14px;color:#2B2925;">Ti richiama <strong>Shery</strong> o <strong>Ahmed</strong><br/>persone vere, in giornata.</td></tr></table>`;
}

/** Email di cortesia al lead, se ha lasciato l'email (§6.3). */
export async function emailCortesia(d: DatiLead): Promise<void> {
  const resend = getResend();
  if (!resend || !d.email) return;
  const waNumero = CONTATTI.whatsapp;
  const base = siteUrl();
  const text = [
    `Ciao ${d.referente},`,
    "",
    "grazie per averci contattato. Abbiamo ricevuto la tua richiesta e ti ricontatteremo entro 24 ore lavorative con un preventivo su misura.",
    "",
    `Se vuoi anticipare i tempi, scrivici o chiamaci:`,
    `Telefono: ${CONTATTI.telefono}`,
    `WhatsApp: https://wa.me/${waNumero}`,
    "",
    "Ti richiama Shery o Ahmed — persone vere, in giornata.",
    `Il team di ${SITE.nome}`,
  ].join("\n");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#2B2925;max-width:520px;line-height:1.5;">
    <p>Ciao ${d.referente},</p>
    <p>grazie per averci contattato. Abbiamo ricevuto la tua richiesta e ti ricontatteremo entro 24 ore lavorative con un preventivo su misura.</p>
    <p>Se vuoi anticipare i tempi, scrivici o chiamaci:<br/>Telefono: ${CONTATTI.telefono}<br/>WhatsApp: <a href="https://wa.me/${waNumero}" style="color:#B08D4F;">wa.me/${waNumero}</a></p>
    ${firmaRichiamoHtml(base)}
    <p style="margin-top:12px;color:#8a8378;font-size:13px;">Il team di ${SITE.nome}</p>
  </div>`;
  try {
    await resend.emails.send({
      from: `${SITE.nome} <noreply@imperoautomotive.it>`,
      to: d.email,
      subject: "Abbiamo ricevuto la tua richiesta",
      text,
      html,
    });
  } catch {
    // best effort
  }
}
