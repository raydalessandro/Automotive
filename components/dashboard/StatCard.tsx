import Link from "next/link";

// Tile numerica. Fraunces sui numeri grandi della pagina "Oggi" (§7).
export function StatCard({
  label,
  valore,
  href,
  accento = false,
}: {
  label: string;
  valore: number | string;
  href?: string;
  accento?: boolean;
}) {
  const inner = (
    <div className="rounded-2xl border border-nero/10 bg-carta p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-testo-chiaro/50">{label}</p>
      <p
        className={`mt-2 font-display text-4xl font-semibold tabular ${
          accento ? "text-oro" : "text-nero"
        }`}
      >
        {valore}
      </p>
    </div>
  );
  return href ? (
    <Link href={href} className="block transition-shadow hover:shadow-md">
      {inner}
    </Link>
  ) : (
    inner
  );
}
