"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ATTIVITA } from "@/lib/nav";
import { IconaAttivita } from "./IconaAttivita";

// Dropdown "Per la tua attività" (§2). Apre al click, chiude con Esc/click-fuori/
// selezione. Frecce su/giù per scorrere le voci. position:absolute, zero layout shift.
export function DropdownAttivita({ attivo }: { attivo: boolean }) {
  const [aperto, setAperto] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<Array<HTMLAnchorElement | null>>([]);
  const menuId = useId();

  const chiudi = (tornaAlTrigger = false) => {
    setAperto(false);
    if (tornaAlTrigger) triggerRef.current?.focus();
  };

  // Click fuori.
  useEffect(() => {
    if (!aperto) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setAperto(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [aperto]);

  const focusItem = (i: number) => {
    const n = ATTIVITA.length;
    const idx = (i + n) % n;
    itemsRef.current[idx]?.focus();
  };

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setAperto(true);
      // Attende il render del pannello prima di spostare il focus.
      requestAnimationFrame(() => focusItem(0));
    }
  };

  const onMenuKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(i + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(i - 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      chiudi(true);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusItem(ATTIVITA.length - 1);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setAperto((v) => !v)}
        onKeyDown={onTriggerKey}
        aria-haspopup="menu"
        aria-expanded={aperto}
        aria-controls={menuId}
        className={`inline-flex items-center gap-1 text-[15px] font-medium transition-colors hover:text-oro-chiaro ${
          attivo ? "text-oro" : "text-testo-scuro/85"
        }`}
      >
        Per la tua attività
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3.5 w-3.5 transition-transform ${aperto ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M5 7.5 10 12.5 15 7.5" />
        </svg>
      </button>

      {aperto && (
        <div
          id={menuId}
          role="menu"
          aria-label="Per la tua attività"
          className="absolute left-1/2 top-full z-50 mt-[10px] w-80 -translate-x-1/2 rounded-[14px] border border-oro/15 bg-nero p-2 shadow-[0_12px_32px_rgb(0_0_0/0.45)]"
        >
          {ATTIVITA.map((v, i) => (
            <Link
              key={v.href}
              href={v.href}
              role="menuitem"
              ref={(el) => {
                itemsRef.current[i] = el;
              }}
              onClick={() => chiudi()}
              onKeyDown={(e) => onMenuKey(e, i)}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-grafite focus-visible:bg-grafite"
            >
              <IconaAttivita id={v.icona!} className="h-6 w-6 shrink-0 text-oro-chiaro" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-testo-scuro">{v.label}</span>
                <span className="block text-[12.5px] text-testo-scuro/55">{v.nota}</span>
              </span>
              <span
                aria-hidden="true"
                className="text-oro-chiaro opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
