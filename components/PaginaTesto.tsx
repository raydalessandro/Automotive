export function PaginaTesto({
  titolo,
  aggiornato,
  children,
}: {
  titolo: string;
  aggiornato?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-content py-12 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-semibold">{titolo}</h1>
        {aggiornato && (
          <p className="mt-2 text-sm text-testo-chiaro/50">Ultimo aggiornamento: {aggiornato}</p>
        )}
        <div className="mt-6 space-y-4 text-testo-chiaro/75 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-testo-chiaro">
          {children}
        </div>
      </article>
    </div>
  );
}
