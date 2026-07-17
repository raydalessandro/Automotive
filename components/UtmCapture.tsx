"use client";

import { useEffect } from "react";

// Cattura UTM al primo atterraggio e li conserva in sessionStorage (§6.1).
const UTM_KEY = "impero_utm";

export function UtmCapture() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(UTM_KEY)) return; // già catturato in questa sessione
      const p = new URLSearchParams(window.location.search);
      const fonte = {
        utm_source: p.get("utm_source") ?? undefined,
        utm_medium: p.get("utm_medium") ?? undefined,
        utm_campaign: p.get("utm_campaign") ?? undefined,
        referrer: document.referrer || undefined,
      };
      const haQualcosa = fonte.utm_source || fonte.utm_medium || fonte.utm_campaign || fonte.referrer;
      if (haQualcosa) {
        sessionStorage.setItem(UTM_KEY, JSON.stringify(fonte));
      }
    } catch {
      // sessionStorage non disponibile: ignora
    }
  }, []);

  return null;
}
