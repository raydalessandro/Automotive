"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Monogramma } from "@/components/Monogramma";
import { logout } from "@/app/app/(dash)/actions";

const VOCI = [
  { href: "/app", label: "Oggi", exact: true },
  { href: "/app/lead", label: "Lead" },
  { href: "/app/analytics", label: "Analytics" },
  { href: "/app/aziende", label: "Aziende" },
  { href: "/app/campagne", label: "Campagne" },
  { href: "/app/blog", label: "Blog" },
];

export function DashNav({ email }: { email: string | null }) {
  const path = usePathname();
  const attiva = (v: (typeof VOCI)[number]) => (v.exact ? path === v.href : path.startsWith(v.href));

  return (
    <header className="sticky top-0 z-40 border-b border-nero/10 bg-avorio/95 backdrop-blur">
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-3">
        <Link href="/app" className="flex items-center gap-2">
          <Monogramma className="h-7 w-7 text-oro" />
          <span className="font-display text-sm font-semibold tracking-widest">CASA BASE</span>
        </Link>
        <div className="flex items-center gap-3">
          {email && <span className="hidden text-xs text-testo-chiaro/50 sm:inline">{email}</span>}
          <form action={logout}>
            <button type="submit" className="text-xs font-medium text-testo-chiaro/60 hover:text-oro">
              Esci
            </button>
          </form>
        </div>
      </div>
      {/* Nav scrollabile orizzontale, mobile-first (§7) */}
      <nav className="mx-auto max-w-[90rem] overflow-x-auto px-4">
        <ul className="flex gap-1 pb-2">
          {VOCI.map((v) => (
            <li key={v.href}>
              <Link
                href={v.href}
                className={`inline-block whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
                  attiva(v)
                    ? "bg-nero text-testo-scuro"
                    : "text-testo-chiaro/70 hover:bg-nero/5"
                }`}
              >
                {v.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
