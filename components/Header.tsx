import Link from "next/link";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/veicoli", label: "Veicoli" },
  { href: "/calcolatore", label: "Calcolatore" },
  { href: "/agenti", label: "Agenti" },
  { href: "/artigiani", label: "Artigiani" },
  { href: "/aziende", label: "Aziende" },
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
        <Link href="/preventivo" className="btn-oro hidden sm:inline-flex">
          Richiedi il preventivo
        </Link>
        <Link
          href="/preventivo"
          className="btn-oro sm:hidden"
          aria-label="Richiedi il preventivo"
        >
          Preventivo
        </Link>
      </div>
    </header>
  );
}
