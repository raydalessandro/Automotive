// Tracking first-party client-side — §5 spec dashboard.
// Privacy-first: sessione anonima non persistente tra visite, niente cookie,
// rispetta Do Not Track. UTM/referrer solo sul primo evento della sessione.

import type { TipoEvento } from "./eventi/schema";

const KEY_SESSIONE = "impero_sess";
const KEY_FONTE_INVIATA = "impero_fonte_inviata";
const KEY_CAP = "impero_evt_count";
const KEY_UTM = "impero_utm"; // condiviso con UtmCapture
const CAP_CLIENT = 200;

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

export function traccia(
  tipo: TipoEvento,
  dati: { pagina?: string; veicolo_id?: string; profilo_fiscale?: string } = {},
): void {
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
      pagina: dati.pagina ?? window.location.pathname,
      veicolo_id: dati.veicolo_id,
      profilo_fiscale: dati.profilo_fiscale,
      fonte,
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
