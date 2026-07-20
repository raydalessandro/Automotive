import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { MenuMobile } from "./MenuMobile";

const NAV = [
  { href: "/consulente", label: "Trova la soluzione" },
  { href: "/veicoli", label: "Veicoli" },
  { href: "/calcolatore", label: "Calcolatore" },
  { href: "/agenti", label: "Agenti" },
  { href: "/artigiani", label: "Artigiani" },
  { href: "/aziende", label: "Aziende" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-nero/10 bg-avorio/90 backdrop-blur">
      <div className="container-content flex h-16 items-center justify-between gap-4">
        <Wordmark />
        <nav className="hidden items-center gap-6 md:flex" aria-label="Navigazione principale">
          {NAV.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="text-sm font-medium text-testo-chiaro/80 transition-colors hover:text-oro"
            >
              {v.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          {/* Desktop: CTA sempre visibile. Mobile: la CTA vive dentro il menu. */}
          <Link href="/preventivo" className="btn-oro hidden md:inline-flex">
            Richiedi il preventivo
          </Link>
          <MenuMobile voci={NAV} />
        </div>
      </div>
    </header>
  );
}
