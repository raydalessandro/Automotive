// Mostrato quando Supabase non è ancora configurato/attivo su questo ambiente.
export function ConfigMancante() {
  return (
    <div className="rounded-2xl border border-oro/30 bg-oro/10 p-6">
      <h2 className="font-display text-lg font-semibold">Supabase non ancora collegato</h2>
      <p className="mt-2 text-sm text-testo-chiaro/70">
        La dashboard è pronta ma manca la connessione al database. Imposta su Vercel le variabili{" "}
        <code className="rounded bg-nero/5 px-1">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
        <code className="rounded bg-nero/5 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,{" "}
        <code className="rounded bg-nero/5 px-1">SUPABASE_SERVICE_ROLE_KEY</code> e applica le
        migration in <code className="rounded bg-nero/5 px-1">supabase/migrations</code>.
      </p>
    </div>
  );
}
