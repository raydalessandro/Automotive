import Link from "next/link";
import { Monogramma } from "./Monogramma";

// Wordmark tipografico "IMPERO AUTOMOTIVE" in Fraunces + monogramma IV (§8).
export function Wordmark({
  scuro = false,
  className = "",
}: {
  scuro?: boolean;
  className?: string;
}) {
  const testo = scuro ? "text-testo-scuro" : "text-testo-chiaro";
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 ${className}`}
      aria-label="Impero Automotive — home"
    >
      <Monogramma className="h-9 w-9 text-oro transition-colors group-hover:text-oro-chiaro" />
      <span className={`font-display text-lg font-semibold tracking-[0.18em] ${testo}`}>
        IMPERO <span className="text-oro">AUTOMOTIVE</span>
      </span>
    </Link>
  );
}
