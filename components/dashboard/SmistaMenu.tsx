"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { smistaLead } from "@/app/app/(dash)/lead/actions";

export type VenditoreOpt = { id: string; nome: string | null };

// Smista/riassegna a un venditore (§PR-3). Usa un <select> nativo: la tendina la
// disegna e posiziona il browser, quindi non viene mai tagliata dai contenitori che
// scrollano (drawer con overflow) e funziona bene anche su mobile.
export function SmistaMenu({
  leadId,
  venditori,
  label = "Smista a",
}: {
  leadId: string;
  venditori: VenditoreOpt[];
  label?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const smista = (venditoreId: string) => {
    if (!venditoreId) return;
    start(async () => {
      const r = await smistaLead(leadId, venditoreId);
      if (!r.error) router.refresh();
    });
  };

  const disabilitato = pending || venditori.length === 0;

  return (
    <label className="relative inline-flex">
      <span className="sr-only">{label}</span>
      <select
        value=""
        disabled={disabilitato}
        onChange={(e) => smista(e.target.value)}
        className="btn-oro appearance-none rounded-full py-1.5 pl-3 pr-8 text-sm disabled:opacity-50"
      >
        <option value="" disabled>
          {pending ? "Smisto…" : venditori.length === 0 ? "Nessun venditore" : `${label} ▾`}
        </option>
        {venditori.map((v) => (
          <option key={v.id} value={v.id}>
            {v.nome ?? "Senza nome"}
          </option>
        ))}
      </select>
      {/* Freccia (il select nativo la nasconde con appearance-none) */}
      <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-nero">
        ▾
      </span>
    </label>
  );
}
