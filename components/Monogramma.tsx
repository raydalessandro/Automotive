// Monogramma "IV" ridisegnato come SVG semplice (§8) — sostituisce la bozza watermarkata.
// [APERTO: logo definitivo]

import { SITE } from "@/lib/site";

export function Monogramma({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={SITE.nome}
      fill="none"
    >
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="6"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {/* I */}
      <path d="M13 14h6v20h-6z" fill="currentColor" />
      {/* V */}
      <path d="M25 14h6l3.5 13L38 14h-3l-3 11-3-11h-4z" fill="currentColor" />
    </svg>
  );
}
