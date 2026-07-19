// Le sei icone del "tutto incluso" nello stesso alfabeto a linea singola dei veicoli.
// La chiave chiude con lo stesso ricciolo delle ruote; il sigillo richiama la direzione incisione.

import Link from "next/link";
import type { ReactNode } from "react";

const SERVIZI: { id: string; label: string; disegno: ReactNode }[] = [
  {
    id: "assicurazione",
    label: "Assicurazione",
    disegno: (
      <>
        <path d="M0 -52 C22 -46 40 -42 48 -36 L48 2 C48 34 26 54 0 64 C-26 54 -48 34 -48 2 L-48 -36 C-40 -42 -22 -46 0 -52 Z" />
        <path d="M-18 4 L-4 18 L22 -14" />
      </>
    ),
  },
  {
    id: "manutenzione",
    label: "Manutenzione",
    disegno: <path d="M-16 -48 A18 18 0 1 0 -8 -26 L30 16 a13 13 0 1 1 0.5 0.5" />,
  },
  {
    id: "pneumatici",
    label: "Pneumatici",
    disegno: (
      <>
        <circle r="34" />
        <circle r="6" fill="currentColor" stroke="none" />
        <line x1="0" y1="-13" x2="0" y2="-26" />
        <line x1="13" y1="0" x2="26" y2="0" />
        <line x1="0" y1="13" x2="0" y2="26" />
        <line x1="-13" y1="0" x2="-26" y2="0" />
      </>
    ),
  },
  {
    id: "bollo",
    label: "Bollo e tasse",
    disegno: (
      <>
        <g strokeWidth="1.6">
          <ellipse rx="30" ry="11" />
          <ellipse rx="30" ry="11" transform="rotate(60)" />
          <ellipse rx="30" ry="11" transform="rotate(120)" />
        </g>
        <circle r="3.5" fill="currentColor" stroke="none" />
        <path d="M-7 26 L-15 56 L-3 47" strokeWidth="2.4" />
        <path d="M7 26 L15 56 L3 47" strokeWidth="2.4" />
      </>
    ),
  },
  {
    id: "assistenza",
    label: "Assistenza",
    disegno: (
      <>
        <circle cx="-30" cy="14" r="10" />
        <circle cx="30" cy="14" r="10" />
        <path d="M-24 6 C-12 -26 12 -26 24 6" />
      </>
    ),
  },
  {
    id: "km",
    label: "Km inclusi",
    disegno: (
      <>
        <path d="M-27 52 L-7 -46" />
        <path d="M27 52 L7 -46" />
        <path d="M0 44 V30 M0 14 V0 M0 -16 V-30" strokeWidth="3.2" />
      </>
    ),
  },
  // Icone aggiuntive per il configuratore (§2): stesso alfabeto a linea singola.
  {
    id: "cristallo",
    label: "Cristalli",
    disegno: (
      <>
        <path d="M -40 34 L -30 -26 Q -28 -36 -14 -36 L 14 -36 Q 28 -36 30 -26 L 40 34 Z" />
        <path d="M 4 -36 L -6 -8 L 10 2 L 2 34" strokeWidth="2" />
      </>
    ),
  },
  {
    id: "sostitutiva",
    label: "Auto sostitutiva",
    disegno: (
      <>
        <path d="M 40 2 A 40 40 0 1 1 6 -39" />
        <path d="M 6 -39 l 18 3 M 6 -39 l -3 18" strokeWidth="2.4" />
      </>
    ),
  },
];

// Le sei icone mostrate nella fascia "Tutto nel canone" (le altre sono per il configuratore).
const FASCIA_IDS = ["assicurazione", "manutenzione", "pneumatici", "bollo", "assistenza", "km"] as const;

export function IconaServizio({
  servizio,
  className = "",
}: {
  servizio: string;
  className?: string;
}) {
  const s = SERVIZI.find((x) => x.id === servizio);
  if (!s) return null;
  return (
    <svg
      viewBox="-64 -66 128 134"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {s.disegno}
    </svg>
  );
}

export function FasciaServizi() {
  const items = FASCIA_IDS.map((id) => SERVIZI.find((s) => s.id === id)!);
  return (
    <section className="bg-nero text-testo-scuro">
      {/* Cliccabile → configuratore (§2). */}
      <Link href="/configuratore" className="block transition-colors hover:bg-grafite/30">
        <div className="container-content py-14 sm:py-16">
          <h2 className="text-center font-display text-3xl font-semibold">Tutto nel canone</h2>
          <p className="mt-1 text-center text-sm text-testo-scuro/60">
            Sei cose in meno a cui pensare. E tu decidi cos'altro coprire.
          </p>
          <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-3 gap-x-4 gap-y-10 sm:grid-cols-6">
            {items.map((s) => (
              <li key={s.id} className="flex flex-col items-center gap-3 text-center">
                <IconaServizio servizio={s.id} className="h-14 w-14 text-oro" />
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-testo-scuro/70">
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-sm font-medium text-oro">Configura la tua rata →</p>
        </div>
      </Link>
    </section>
  );
}
