// Contatti — §11 punti aperti: valori definitivi da confermare.
// TODO: sostituire con numeri/email reali prima del go-live.

import { SITE } from "./site";

export const CONTATTI = {
  telefono: "+39 000 0000000", // TODO: numero definitivo
  telefonoHref: "+390000000000", // formato E.164 per click-to-call
  whatsapp: "390000000000", // TODO: numero WhatsApp definitivo (solo cifre, con prefisso)
  email: "info@imperoautomotive.it", // TODO: email definitiva
  orari: "Lun–Ven 9:00–18:00", // TODO: orari definitivi
  ragioneSociale: SITE.nome,
} as const;

/** Link WhatsApp con testo precompilato. */
export function whatsappLink(testo: string): string {
  return `https://wa.me/${CONTATTI.whatsapp}?text=${encodeURIComponent(testo)}`;
}
