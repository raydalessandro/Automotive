"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { VeicoloCard } from "./VeicoloCard";
import { ALIMENTAZIONI, CATEGORIE, STATI } from "@/lib/catalogo/schema";
import type { Veicolo } from "@/lib/catalogo";
import { euro } from "@/lib/format";

type Filtri = {
  alimentazione: string;
  stato: string;
  categoria: string;
  soloN1: boolean;
  soloProntaConsegna: boolean;
  canoneMax: number;
};

export function VeicoliFiltrati({ veicoli }: { veicoli: Veicolo[] }) {
  const canoneMassimo = useMemo(
    () => Math.max(...veicoli.map((v) => v.canone_mese_iva_esclusa), 1000),
    [veicoli],
  );
  const [f, setF] = useState<Filtri>({
    alimentazione: "",
    stato: "",
    categoria: "",
    soloN1: false,
    soloProntaConsegna: false,
    canoneMax: canoneMassimo,
  });

  const risultati = useMemo(() => {
    return veicoli
      .filter((v) => (f.alimentazione ? v.alimentazione === f.alimentazione : true))
      .filter((v) => (f.stato ? v.stato === f.stato : true))
      .filter((v) => (f.categoria ? v.categoria === f.categoria : true))
      .filter((v) => (f.soloN1 ? v.n1 : true))
      .filter((v) => (f.soloProntaConsegna ? v.pronta_consegna === true : true))
      .filter((v) => v.canone_mese_iva_esclusa <= f.canoneMax)
      .sort((a, b) => a.canone_mese_iva_esclusa - b.canone_mese_iva_esclusa);
  }, [veicoli, f]);

  const set = <K extends keyof Filtri>(k: K, v: Filtri[K]) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <div className="rounded-2xl border border-nero/10 bg-carta p-5">
          <h2 className="font-display text-lg font-semibold">Filtra</h2>

          <Select
            label="Alimentazione"
            value={f.alimentazione}
            onChange={(v) => set("alimentazione", v)}
            opzioni={ALIMENTAZIONI}
          />
          <Select label="Stato" value={f.stato} onChange={(v) => set("stato", v)} opzioni={STATI} />
          <Select
            label="Categoria"
            value={f.categoria}
            onChange={(v) => set("categoria", v)}
            opzioni={CATEGORIE}
          />

          <label className="mt-4 block text-sm font-medium">
            Canone max: <span className="tabular text-oro">{euro(f.canoneMax)}</span>/mese
            <input
              type="range"
              min={100}
              max={canoneMassimo}
              step={5}
              value={f.canoneMax}
              onChange={(e) => set("canoneMax", Number(e.target.value))}
              className="mt-2 w-full cursor-pointer accent-oro"
            />
          </label>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={f.soloN1}
              onChange={(e) => set("soloN1", e.target.checked)}
              className="accent-oro"
            />
            Solo veicoli commerciali (N1)
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={f.soloProntaConsegna}
              onChange={(e) => set("soloProntaConsegna", e.target.checked)}
              className="accent-oro"
            />
            Solo pronta consegna
          </label>

          <button
            type="button"
            onClick={() =>
              setF({
                alimentazione: "",
                stato: "",
                categoria: "",
                soloN1: false,
                soloProntaConsegna: false,
                canoneMax: canoneMassimo,
              })
            }
            className="mt-5 text-sm text-testo-chiaro/60 hover:text-oro"
          >
            Azzera filtri
          </button>
        </div>
      </aside>

      <div>
        <p className="mb-4 text-sm text-testo-chiaro/60">
          {risultati.length} {risultati.length === 1 ? "veicolo" : "veicoli"} · ordine per canone
          crescente
        </p>
        {risultati.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {risultati.map((v) => (
              <VeicoloCard key={v.id} v={v} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-nero/15 bg-carta p-10 text-center">
            <h3 className="font-display text-xl font-semibold">Nessun veicolo con questi filtri</h3>
            <p className="mt-2 text-sm text-testo-chiaro/60">
              Dicci cosa cerchi: troviamo il veicolo giusto per te.
            </p>
            <Link href="/preventivo" className="btn-oro mt-5">
              Dimmi cosa cerchi
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  opzioni,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  opzioni: readonly string[];
}) {
  return (
    <label className="mt-4 block text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-nero/15 bg-carta px-3 py-2 text-sm capitalize focus:border-oro focus:outline-none"
      >
        <option value="">Tutte</option>
        {opzioni.map((o) => (
          <option key={o} value={o} className="capitalize">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
