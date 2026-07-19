// Filetto col diamante sotto l'H1 (§1) — stessa grammatica visiva delle card OG.
export function Filetto() {
  return (
    <div className="mt-5 flex items-center gap-3" aria-hidden="true">
      <span className="h-1.5 w-1.5 rotate-45 bg-oro" />
      <span className="h-px w-16 bg-oro/50" />
    </div>
  );
}
