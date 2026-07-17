import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-content flex min-h-[50vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-6xl font-semibold text-oro">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">Pagina non trovata</h1>
      <p className="mt-2 text-testo-chiaro/60">
        La pagina che cerchi non esiste o è stata spostata.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-scuro">
          Torna alla home
        </Link>
        <Link href="/veicoli" className="btn-ghost">
          Vedi i veicoli
        </Link>
      </div>
    </div>
  );
}
