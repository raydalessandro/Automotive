// Tracking first-party client-side — §5/§PR29 spec Analytics.
// Privacy-first: sessione anonima non persistente tra visite, niente cookie,
// rispetta Do Not Track. UTM/referrer solo sul primo evento della sessione.
// Ogni evento porta dati.env (prod/preview/dev): la dashboard conta solo prod.

import type { TipoEvento } from "./eventi/schema";
import { unaVolta } from "./traccia/dedup";
import type { CtaId } from "./traccia/cta";

const KEY_SESSIONE = "impero_sess";
const KEY_FONTE_INVIATA = "impero_fonte_inviata";
const KEY_CAP = "impero_evt_count";
const KEY_UTM = "impero_utm"; // condiviso con UtmCapture
const CAP_CLIENT = 200;

/** Ambiente da Vercel (prod/preview/dev). Fallback "dev". */
export function env(): string {
  return process.env.NEXT_PUBLIC_VERCEL_ENV ?? "dev";
}

function dnt(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.doNotTrack === "1" || (window as unknown as { doNotTrack?: string }).doNotTrack === "1";
}

function idSessione(): string {
  let id = sessionStorage.getItem(KEY_SESSIONE);
  if (!id) {
    const rnd =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    id = rnd.replace(/-/g, "");
    sessionStorage.setItem(KEY_SESSIONE, id);
  }
  return id;
}

function leggiFonte(): Record<string, string> | undefined {
  try {
    const raw = sessionStorage.getItem(KEY_UTM);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

type DatiEvento = Record<string, string | number>;

type TracciaOpts = {
  pagina?: string;
  veicolo_id?: string;
  profilo_fiscale?: string;
  /** Proprietà strutturate del nuovo evento; env viene aggiunto in automatico. */
  dati?: DatiEvento;
};

export function traccia(tipo: TipoEvento, opts: TracciaOpts = {}): void {
  if (typeof window === "undefined" || dnt()) return;

  try {
    // Cap client anti-flood.
    const n = Number(sessionStorage.getItem(KEY_CAP) ?? "0");
    if (n >= CAP_CLIENT) return;
    sessionStorage.setItem(KEY_CAP, String(n + 1));

    const sessione = idSessione();

    // Fonte solo sul primo evento della sessione.
    let fonte: Record<string, string> | undefined;
    if (!sessionStorage.getItem(KEY_FONTE_INVIATA)) {
      fonte = leggiFonte();
      sessionStorage.setItem(KEY_FONTE_INVIATA, "1");
    }

    const payload = {
      sessione,
      tipo,
      pagina: opts.pagina ?? window.location.pathname,
      veicolo_id: opts.veicolo_id,
      profilo_fiscale: opts.profilo_fiscale,
      fonte,
      // Tag ambiente su OGNI evento (§0.2).
      dati: { env: env(), ...(opts.dati ?? {}) },
    };

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/eventi", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/eventi", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
    }
  } catch {
    // il tracking non deve mai rompere il sito
  }
}

// ————————————————————————————————————————————————————————————————
// Helper tipizzati per gli eventi v2 (§PR29). La dedup è esplicita per ognuno.
// ————————————————————————————————————————————————————————————————

function pathname(pagina?: string): string {
  return pagina ?? (typeof window !== "undefined" ? window.location.pathname : "");
}

/** Sezione entrata in vista. Dedup: una volta per sezione per pagina. */
export function tracciaSezione(sezione: string, pagina?: string): void {
  const p = pathname(pagina);
  if (!unaVolta("sezione_vista", `${p}:${sezione}`)) return;
  traccia("sezione_vista", { pagina: p, dati: { sezione, pagina: p } });
}

/** Soglia di scroll superata. Dedup: una volta per soglia per pagina. */
export function tracciaScroll(soglia: 25 | 50 | 75, pagina?: string): void {
  const p = pathname(pagina);
  if (!unaVolta("scroll_soglia", `${p}:${soglia}`)) return;
  traccia("scroll_soglia", { pagina: p, dati: { soglia, pagina: p } });
}

/** Click su una CTA registrata. Nessuna dedup: ogni click conta. */
export function tracciaCta(cta: CtaId): void {
  traccia("cta_click", { dati: { cta } });
}

/** Apertura di una FAQ. Dedup: una volta per domanda. */
export function tracciaFaq(domanda: string): void {
  if (!unaVolta("faq_aperta", domanda)) return;
  traccia("faq_aperta", { dati: { domanda } });
}

/** Id sessione corrente (per allegare al lead e ricostruire la timeline della visita). */
export function sessioneCorrente(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(KEY_SESSIONE);
  } catch {
    return null;
  }
}

export type FormLead = "preventivo" | "richiamo";

/** Form iniziato (primo focus/input). Dedup: una volta per form per sessione. */
export function tracciaLeadIniziato(form: FormLead): void {
  if (!unaVolta("lead_iniziato", form)) return;
  traccia("lead_iniziato", { dati: { form } });
}

export type Strumento = "calcolatore" | "configuratore" | "consulente";

/** Strumento aperto. Dedup: una volta per strumento. */
export function tracciaStrumentoAperto(strumento: Strumento): void {
  if (!unaVolta("strumento_aperto", strumento)) return;
  traccia("strumento_aperto", { dati: { strumento } });
}

/** Strumento completato (definizioni §PR29). Dedup: una volta per strumento. */
export function tracciaStrumentoCompletato(strumento: Strumento): void {
  if (!unaVolta("strumento_completato", strumento)) return;
  traccia("strumento_completato", { dati: { strumento } });
}

/**
 * Permanenza sulla pagina (stima). Dedup: una per pagina. Conta solo ≥3s, cap 1800.
 * Inviata con sendBeacon su pagehide/visibilitychange (dentro traccia).
 */
export function tracciaTempoPagina(pagina: string, secondi: number): void {
  if (secondi < 3) return;
  const sec = Math.min(Math.round(secondi), 1800);
  if (!unaVolta("tempo_pagina", pagina)) return;
  traccia("tempo_pagina", { pagina, dati: { pagina, secondi: sec } });
}
