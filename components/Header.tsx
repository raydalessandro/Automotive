"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./Wordmark";
import { MenuMobile } from "./MenuMobile";
import { DropdownAttivita } from "./nav/DropdownAttivita";
import { NAV_PRINCIPALE, HREF_ATTIVITA, isDropdown } from "@/lib/nav";

export function Header() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const attivoAttivita = HREF_ATTIVITA.some((h) => path.startsWith(h));
  const isAttiva = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 border-b border-oro/10 bg-nero transition-shadow ${
        scrolled ? "shadow-[0_1px_12px_rgb(0_0_0/0.35)]" : ""
      }`}
    >
      <div className="container-content flex h-16 items-center justify-between gap-4">
        <Wordmark scuro />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Navigazione principale">
          {NAV_PRINCIPALE.map((v) =>
            isDropdown(v) ? (
              <DropdownAttivita key="attivita" attivo={attivoAttivita} />
            ) : (
              <Link
                key={v.href}
                href={v.href}
                aria-current={isAttiva(v.href) ? "page" : undefined}
                className={`relative text-[15px] font-medium transition-colors hover:text-oro-chiaro ${
                  isAttiva(v.href)
                    ? "text-oro after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-px after:bg-oro"
                    : "text-testo-scuro/85"
                }`}
              >
                {v.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/preventivo" className="btn-oro hidden md:inline-flex">
            Richiedi il preventivo
          </Link>
          <MenuMobile />
        </div>
      </div>
    </header>
  );
}
