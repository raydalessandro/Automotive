"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { traccia } from "@/lib/traccia";

const KEY_UTM = "impero_utm";

// Cattura UTM al primo atterraggio + pageview a ogni cambio route (solo sito pubblico).
export function TracciaPageview() {
  const path = usePathname();

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(KEY_UTM)) {
        const p = new URLSearchParams(window.location.search);
        const fonte: Record<string, string> = {};
        const s = p.get("utm_source");
        const m = p.get("utm_medium");
        const c = p.get("utm_campaign");
        if (s) fonte.utm_source = s;
        if (m) fonte.utm_medium = m;
        if (c) fonte.utm_campaign = c;
        if (document.referrer) fonte.referrer = document.referrer;
        if (Object.keys(fonte).length) sessionStorage.setItem(KEY_UTM, JSON.stringify(fonte));
      }
    } catch {
      // ignora
    }
    traccia("pagina_vista", { pagina: path });
  }, [path]);

  return null;
}
