// Pill della provenienza multi-target (§PR-10). Testo = brand dal registro (fallback slug).
// Mostrata SOLO per i target ≠ nlt_b2b, così le viste nlt_b2b restano identiche a oggi.
export function PillTarget({ brand }: { brand: string }) {
  return (
    <span className="shrink-0 rounded-full bg-oro/15 px-2 py-0.5 text-xs font-medium text-oro">
      {brand}
    </span>
  );
}
