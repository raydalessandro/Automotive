"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { tracciaSezione, tracciaScroll, tracciaTempoPagina } from "@/lib/traccia";

// Engagement tracker globale (§PR29): sezioni in vista (IntersectionObserver 50%
// sugli elementi con data-sezione), soglie di scroll 25/50/75, tempo pagina (stima).
// La dedup vive negli helper di lib/traccia; qui solo il rilevamento.
export function TracciaEngagement() {
  const pathname = usePathname();
  const entrata = useRef<number>(0);

  // Osserva le sezioni con data-sezione presenti nel DOM della pagina corrente.
  useEffect(() => {
    const nodi = Array.from(document.querySelectorAll<HTMLElement>("[data-sezione]"));
    if (!nodi.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // 50% della sezione visibile, oppure la sezione (più alta del viewport)
          // copre metà schermo: così anche le sezioni lunghe contano una volta.
          const copreMezzoSchermo = e.intersectionRect.height >= window.innerHeight * 0.5;
          if (e.isIntersecting && (e.intersectionRatio >= 0.5 || copreMezzoSchermo)) {
            const id = (e.target as HTMLElement).dataset.sezione;
            if (id) tracciaSezione(id, pathname);
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    nodi.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [pathname]);

  // Soglie di scroll 25/50/75 della pagina.
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (max <= 0) return;
      const pct = (doc.scrollTop / max) * 100;
      // Tutte le soglie superate (la dedup evita i doppioni): anche uno scroll a
      // salti registra 25/50/75 una volta ciascuna.
      if (pct >= 25) tracciaScroll(25, pathname);
      if (pct >= 50) tracciaScroll(50, pathname);
      if (pct >= 75) tracciaScroll(75, pathname);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Tempo pagina (stima): dall'ingresso alla chiusura/uscita, via sendBeacon.
  useEffect(() => {
    const paginaCorrente = pathname;
    entrata.current = performance.now();
    const invia = () => {
      const secondi = (performance.now() - entrata.current) / 1000;
      tracciaTempoPagina(paginaCorrente, secondi);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") invia();
    };
    window.addEventListener("pagehide", invia);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      // Cambio pagina SPA: registra il tempo della pagina che si lascia.
      invia();
      window.removeEventListener("pagehide", invia);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname]);

  return null;
}
