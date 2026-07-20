// Micro-garanzie di fiducia (§NOTE-STRATEGICHE: trust vicino alla decisione, Baymard).
// Riusabile accanto a ogni CTA. `scuro` per fondo nero, altrimenti fondo chiaro.
const GARANZIE = [
  {
    t: "Preventivo gratuito",
    d: <path d="M4 8l3 3 5-6" />,
  },
  {
    t: "Dati protetti",
    d: (
      <>
        <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
        <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
      </>
    ),
  },
  {
    t: "Risposta in 24h",
    d: (
      <>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 5v3l2 2" />
      </>
    ),
  },
];

export function MicroGaranzie({ scuro = false, className = "" }: { scuro?: boolean; className?: string }) {
  const testo = scuro ? "text-testo-scuro/55" : "text-testo-chiaro/55";
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-xs ${testo} ${className}`}>
      {GARANZIE.map((g) => (
        <li key={g.t} className="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-oro" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {g.d}
          </svg>
          {g.t}
        </li>
      ))}
    </ul>
  );
}
