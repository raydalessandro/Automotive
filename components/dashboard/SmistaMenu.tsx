"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { smistaLead } from "@/app/app/(dash)/lead/actions";

export type VenditoreOpt = { id: string; nome: string | null };

// "Smista a ▾" (§PR-3): elenca i venditori attivi → transizione a `assegnato`.
export function SmistaMenu({
  leadId,
  venditori,
  label = "Smista a ▾",
}: {
  leadId: string;
  venditori: VenditoreOpt[];
  label?: string;
}) {
  const router = useRouter();
  const [aperto, setAperto] = useState(false);
  const [pending, start] = useTransition();
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aperto) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setAperto(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [aperto]);

  const smista = (venditoreId: string) =>
    start(async () => {
      const r = await smistaLead(leadId, venditoreId);
      setAperto(false);
      if (!r.error) router.refresh();
    });

  return (
    <div ref={wrap} className="relative inline-block">
      <button
        type="button"
        disabled={pending}
        onClick={() => setAperto((v) => !v)}
        className="btn-oro px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {pending ? "Smisto…" : label}
      </button>
      {aperto && (
        <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-nero/10 bg-carta p-1 shadow-lg">
          {venditori.length === 0 ? (
            <p className="px-3 py-2 text-sm text-testo-chiaro/50">Nessun venditore attivo.</p>
          ) : (
            venditori.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => smista(v.id)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-avorio"
              >
                {v.nome ?? "Senza nome"}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
