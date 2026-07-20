"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./Wordmark";
import { Filetto } from "./design/RuotaGuilloche";
import { HERO_MOBILE, MAPPA_MOBILE } from "@/lib/nav";
import { CONTATTI } from "@/lib/contatti";

// Burger custom (§4): tre tratti oro-chiaro 2px (22/16/22), morph in X a 200ms.
function IconaBurger({ aperto }: { aperto: boolean }) {
  const base =
    "absolute left-1/2 top-1/2 h-0.5 rounded-full bg-oro-chiaro transition-all duration-200 ease-out";
  return (
    <span className="relative block h-6 w-6" aria-hidden="true">
      <span
        className={`${base} w-[22px]`}
        style={{ transform: aperto ? "translate(-50%,-50%) rotate(45deg)" : "translate(-50%,-50%) translateY(-7px)" }}
      />
      <span
        className={`${base} w-4`}
        style={{
          transform: aperto ? "translate(-50%,-50%) scaleX(0)" : "translate(-50%,-50%)",
          opacity: aperto ? 0 : 1,
        }}
      />
      <span
        className={`${base} w-[22px]`}
        style={{ transform: aperto ? "translate(-50%,-50%) rotate(-45deg)" : "translate(-50%,-50%) translateY(7px)" }}
      />
    </span>
  );
}

export function MenuMobile() {
  const [aperto, setAperto] = useState(false);
  const path = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  const chiudi = () => setAperto(false);

  // Chiudi al cambio pagina.
  useEffect(() => {
    setAperto(false);
  }, [path]);

  // Scroll-lock del body + focus trap + Esc, mentre il pannello è aperto.
  useEffect(() => {
    if (!aperto) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const root = rootRef.current;
    const focusable = () =>
      root
        ? Array.from(
            root.querySelectorAll<HTMLElement>(
              'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];

    // Focus alla prima voce del pannello.
    requestAnimationFrame(() => focusable()[1]?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setAperto(false);
        return;
      }
      if (e.key !== "Tab") return;
      const f = focusable();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [aperto]);

  // Alla chiusura (solo transizione aperto→chiuso) il focus torna al burger.
  const eraAperto = useRef(false);
  useEffect(() => {
    if (eraAperto.current && !aperto) burgerRef.current?.focus();
    eraAperto.current = aperto;
  }, [aperto]);

  // Indice progressivo per lo stagger d'ingresso (hero + tutte le voci).
  let i = 0;

  return (
    <div ref={rootRef} className="md:hidden">
      <button
        ref={burgerRef}
        type="button"
        onClick={() => setAperto((v) => !v)}
        aria-label={aperto ? "Chiudi il menu" : "Apri il menu"}
        aria-expanded={aperto}
        aria-controls="menu-mobile"
        className="relative z-[70] inline-flex h-12 w-12 items-center justify-center"
      >
        <IconaBurger aperto={aperto} />
      </button>

      {aperto && (
        <div
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="menu-panel-in fixed inset-0 z-[60] flex flex-col bg-nero"
        >
          {/* Testata pannello */}
          <div className="container-content flex h-16 shrink-0 items-center">
            <Wordmark scuro />
          </div>

          {/* Contenuto scrollabile — mappa piatta */}
          <div className="container-content flex-1 overflow-y-auto pb-6">
            {/* Voce hero: il consulente */}
            <Link
              href={HERO_MOBILE.href}
              onClick={chiudi}
              style={{ animationDelay: `${i++ * 25}ms` }}
              className="menu-voce-in block rounded-xl py-3 focus-visible:outline-2 focus-visible:outline-oro/70"
            >
              <span className="block font-display text-[26px] font-semibold text-avorio">
                {HERO_MOBILE.label}
              </span>
              <span className="mt-1 block text-[13px] text-testo-scuro/60">{HERO_MOBILE.nota}</span>
            </Link>
            <Filetto className="mt-1 h-4 w-[120px] text-oro/60" />

            {MAPPA_MOBILE.map((gruppo) => (
              <div key={gruppo.etichetta} className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-oro">
                  {gruppo.etichetta}
                </p>
                <ul className="mt-2">
                  {gruppo.voci.map((v) => (
                    <li key={v.href}>
                      <Link
                        href={v.href}
                        onClick={chiudi}
                        style={{ animationDelay: `${i++ * 25}ms` }}
                        className="menu-voce-in flex min-h-[52px] flex-col justify-center rounded-xl py-2 focus-visible:outline-2 focus-visible:outline-oro/70"
                      >
                        <span className="text-[19px] font-medium text-testo-scuro/90">{v.label}</span>
                        {v.nota && (
                          <span className="text-[12.5px] text-testo-scuro/50">{v.nota}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Piede sticky: CTA + contatti diretti */}
          <div className="shrink-0 border-t border-oro/10 bg-grafite p-[14px]">
            <Link href="/preventivo" onClick={chiudi} className="btn-oro w-full">
              Richiedi il preventivo
            </Link>
            <p className="mt-3 text-center text-sm text-oro-chiaro">
              <a href={`tel:${CONTATTI.telefonoHref}`} className="hover:underline">
                📞 Chiamaci
              </a>
              <span className="mx-2 text-testo-scuro/40">·</span>
              <a
                href={`https://wa.me/${CONTATTI.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                WhatsApp
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
