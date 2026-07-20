import type { IconaAttivitaId } from "@/lib/nav";

// Icone a linea 24px per il dropdown "Per la tua attività" (§2). Custom, in tinta
// (currentColor): valigetta → agenti, chiave → artigiani, palazzo → aziende.
export function IconaAttivita({ id, className = "" }: { id: IconaAttivitaId; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  if (id === "valigetta") {
    return (
      <svg {...common}>
        <rect x="3" y="7.5" width="18" height="12" rx="2" />
        <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
        <path d="M3 12.5h18" />
      </svg>
    );
  }
  if (id === "chiave") {
    return (
      <svg {...common}>
        <circle cx="7.5" cy="8" r="3.5" />
        <path d="M10 10.5 20 20.5" />
        <path d="M16.5 17l2-2M18.5 19l2-2" />
      </svg>
    );
  }
  // palazzo
  return (
    <svg {...common}>
      <path d="M5 20.5V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15.5" />
      <path d="M15 9h3a1 1 0 0 1 1 1v10.5" />
      <path d="M3.5 20.5h17" />
      <path d="M8 8h1.5M11 8h1.5M8 12h1.5M11 12h1.5M8 16h1.5M11 16h1.5" />
    </svg>
  );
}
