"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { prendoInCarico, registraEsito } from "@/app/vendita/actions";
import type { StatoLead } from "@/lib/dashboard/tipi";

const ESITI: { stato: StatoLead; label: string; classe: string }[] = [
  { stato: "chiuso", label: "Chiuso ✓", classe: "btn-oro" },
  { stato: "preventivo_inviato", label: "Preventivo inviato", classe: "btn-scuro" },
  { stato: "in_sospeso", label: "In sospeso", classe: "btn-ghost" },
  { stato: "perso", label: "Perso", classe: "btn-ghost" },
];

// Azioni della scheda (§PR-4): da `assegnato` un solo bottone grande; dagli stati in
// lavorazione i quattro esiti con la nota "cosa è venuto fuori". Bottoni ≥ 48px.
export function AzioniScheda({ leadId, stato }: { leadId: string; stato: StatoLead }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [nota, setNota] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const esegui = (fn: () => Promise<{ ok?: boolean; error?: string }>) =>
    start(async () => {
      setMsg(null);
      const r = await fn();
      if (r.error) setMsg(`Errore: ${r.error}`);
      else router.refresh();
    });

  if (stato === "assegnato") {
    return (
      <button
        disabled={pending}
        onClick={() => esegui(() => prendoInCarico(leadId))}
        className="btn-oro min-h-[52px] w-full text-base disabled:opacity-50"
      >
        {pending ? "…" : "Prendo in carico"}
      </button>
    );
  }

  // Già concluso: nessuna azione.
  if (stato === "chiuso" || stato === "perso") return null;

  // preso_in_carico · contattato · preventivo_inviato · in_sospeso → esiti.
  return (
    <div className="rounded-2xl border border-nero/10 bg-carta p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-testo-chiaro/45">Esito</p>
      <textarea
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        rows={2}
        placeholder="Cosa è venuto fuori?"
        className="mt-2 w-full rounded-lg border border-nero/15 px-3 py-2 text-sm focus:border-oro focus:outline-none"
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        {ESITI.map((e) => (
          <button
            key={e.stato}
            disabled={pending}
            onClick={() => esegui(() => registraEsito(leadId, e.stato, nota || undefined))}
            className={`${e.classe} min-h-[48px] disabled:opacity-50`}
          >
            {e.label}
          </button>
        ))}
      </div>
      {msg && <p className="mt-2 text-sm text-oro">{msg}</p>}
    </div>
  );
}
