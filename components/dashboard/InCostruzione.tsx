export function InCostruzione({ titolo, nota }: { titolo: string; nota: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">{titolo}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-nero/20 bg-carta p-8 text-center">
        <p className="font-medium">In costruzione</p>
        <p className="mt-2 text-sm text-testo-chiaro/60">{nota}</p>
      </div>
    </div>
  );
}
