"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Menu hamburger mobile (< md). Essenziale: le scelte estetiche verranno riviste
// nella passata di design. Isolato qui per non rendere client l'intero Header.
type Voce = { href: string; label: string };

function IconaBurger() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconaX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function MenuMobile({ voci }: { voci: Voce[] }) {
  const [aperto, setAperto] = useState(false);
  const path = usePathname();

  // Chiudi al cambio pagina.
  useEffect(() => {
    setAperto(false);
  }, [path]);

  // Chiudi con Escape.
  useEffect(() => {
    if (!aperto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAperto(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aperto]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setAperto((v) => !v)}
        aria-label={aperto ? "Chiudi il menu" : "Apri il menu"}
        aria-expanded={aperto}
        aria-controls="menu-mobile"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-testo-chiaro transition-colors hover:bg-nero/5"
      >
        {aperto ? <IconaX /> : <IconaBurger />}
      </button>

      {aperto && (
        <nav
          id="menu-mobile"
          aria-label="Menu mobile"
          className="absolute inset-x-0 top-16 border-b border-nero/10 bg-avorio shadow-lg"
        >
          <ul className="container-content flex flex-col py-2">
            {voci.map((v) => {
              const attiva = v.href === "/" ? path === "/" : path.startsWith(v.href);
              return (
                <li key={v.href}>
                  <Link
                    href={v.href}
                    onClick={() => setAperto(false)}
                    className={`block rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                      attiva ? "text-oro" : "text-testo-chiaro/80 hover:bg-nero/5"
                    }`}
                  >
                    {v.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="container-content pb-3">
            <Link href="/preventivo" onClick={() => setAperto(false)} className="btn-oro w-full">
              Richiedi il preventivo
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
