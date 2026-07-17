import { applicaSegnaposto, type Campagna } from "./schema";
import { creaTokenOptOut } from "./optout";
import { siteUrl } from "../site";
import { CONTATTI } from "../contatti";

type AziendaInvio = {
  id: string;
  ragione_sociale: string;
  citta: string | null;
  provincia: string | null;
  settore: string | null;
  segmento: string;
  email: string;
};

export type Contenuto = { subject: string; text: string; html: string; unsubscribe: string };

// Costruisce l'email per una azienda: segnaposto + link UTM + firma + footer opt-out (§4).
export function costruisciEmail(campagna: Campagna, a: AziendaInvio): Contenuto {
  const dati = {
    ragione_sociale: a.ragione_sociale,
    citta: a.citta,
    provincia: a.provincia,
    settore: a.settore,
    segmento: a.segmento,
  };

  const subject = applicaSegnaposto(campagna.oggetto, dati);
  const corpo = applicaSegnaposto(campagna.corpo, dati);

  const utm = `utm_source=email&utm_medium=campagna&utm_campaign=${encodeURIComponent(campagna.nome)}`;
  const linkSito = `${siteUrl()}/?${utm}`;
  const optout = `${siteUrl()}/api/opt-out?token=${creaTokenOptOut(a.id)}`;

  const firma = `\n\n—\n${CONTATTI.ragioneSociale}\n${CONTATTI.telefono} · ${CONTATTI.email}\n${linkSito}`;
  const footer = `\n\nSe non vuoi più ricevere queste email: ${optout}`;
  const text = `${corpo}${firma}${footer}`;

  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#2B2925;line-height:1.5">
${corpo.replace(/\n/g, "<br>")}
<br><br>—<br>
<strong>${CONTATTI.ragioneSociale}</strong><br>
${CONTATTI.telefono} · ${CONTATTI.email}<br>
<a href="${linkSito}">${siteUrl().replace(/^https?:\/\//, "")}</a>
<br><br>
<span style="font-size:12px;color:#999">Se non vuoi più ricevere queste email <a href="${optout}">annulla l'iscrizione</a>.</span>
</div>`;

  return { subject, text, html, unsubscribe: optout };
}
