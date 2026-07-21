"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { prendoInCarico, registraEsito } from "@/app/vendita/actions";
import type { StatoLead } from "@/lib/dashboard/tipi";
import { MOTIVI_PERSO, MOTIVO_RICONTATTO, validaDettagliPerso } from "@/lib/lead/esiti";

// Esiti "diretti" (un click, con la nota opzionale). Il "perso" apre invece il form a
// crocette (§PR-6): serve almeno un motivo, quindi non può essere un bottone secco.
const ESITI_DIRETTI: { stato: StatoLead; label: string; classe: string }[] = [
  { stato: "chiuso", label: "Chiuso ✓", classe: "btn-oro" },
  { stato: "preventivo_inviato", label: "Preventivo inviato", classe: "btn-scuro" },
  { stato: "in_sospeso", label: "In sospeso", classe: "btn-ghost" },
];

// Azioni della scheda (§PR-4/§PR-6): da `assegnato` un solo bottone grande; dagli stati
// in lavorazione i quattro esiti con la nota "cosa è venuto fuori", e sul "perso" le
// crocette dei motivi. Bottoni ≥ 48px.
export function AzioniScheda({ leadId, stato }: { leadId: string; stato: StatoLead }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [nota, setNota] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  // Stato del form "perso".
  const [persoAperto, setPersoAperto] = useState(false);
  const [motivi, setMotivi] = useState<string[]>([]);
  const [ricontattareIl, setRicontattareIl] = useState("");
  const [notaAltro, setNotaAltro] = useState("");

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

  const toggleMotivo = (id: string) =>
    setMotivi((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));

  const haRicontatto = motivi.includes(MOTIVO_RICONTATTO);
  const haAltro = motivi.includes("altro");

  const registraPerso = () => {
    // Stessa validazione della action (lib pura): feedback immediato, zero sorprese lato server.
    const v = validaDettagliPerso({
      motivi,
      ricontattare_il: haRicontatto ? ricontattareIl : undefined,
      nota_altro: haAltro ? notaAltro : undefined,
    });
    if (!v.ok) {
      setMsg(`Errore: ${v.error}`);
      return;
    }
    esegui(() => registraEsito(leadId, "perso", nota || undefined, v.dettagli));
  };

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
        {ESITI_DIRETTI.map((e) => (
          <button
            key={e.stato}
            disabled={pending}
            onClick={() => esegui(() => registraEsito(leadId, e.stato, nota || undefined))}
            className={`${e.classe} min-h-[48px] disabled:opacity-50`}
          >
            {e.label}
          </button>
        ))}
        <button
          disabled={pending}
          onClick={() => setPersoAperto((v) => !v)}
          aria-expanded={persoAperto}
          className={`btn-ghost min-h-[48px] disabled:opacity-50 ${persoAperto ? "ring-1 ring-oro/60" : ""}`}
        >
          Perso
        </button>
      </div>

      {/* Form a crocette del "perso" (§PR-6). */}
      {persoAperto && (
        <div className="mt-3 rounded-xl border border-nero/10 bg-avorio/40 p-3">
          <p className="font-display text-sm font-semibold">Perché si è perso?</p>
          <p className="mt-0.5 text-xs text-testo-chiaro/55">10 secondi: seleziona tutto ciò che vale</p>

          <div className="mt-3 space-y-0.5">
            {MOTIVI_PERSO.map((m) => (
              <label
                key={m.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm hover:bg-avorio/70"
              >
                <input
                  type="checkbox"
                  checked={motivi.includes(m.id)}
                  onChange={() => toggleMotivo(m.id)}
                  className="h-4 w-4 accent-oro"
                />
                {m.label}
              </label>
            ))}
          </div>

          {/* "Ricontattare il" solo con non_e_il_momento. */}
          {haRicontatto && (
            <div className="mt-3">
              <label className="text-xs font-medium uppercase tracking-wide text-testo-chiaro/50">
                Ricontattare il
              </label>
              <input
                type="date"
                value={ricontattareIl}
                onChange={(e) => setRicontattareIl(e.target.value)}
                className="mt-1 block rounded-lg border border-nero/15 px-3 py-2 text-sm focus:border-oro focus:outline-none"
              />
            </div>
          )}

          {/* Nota breve solo con "altro". */}
          {haAltro && (
            <div className="mt-3">
              <input
                value={notaAltro}
                onChange={(e) => setNotaAltro(e.target.value)}
                maxLength={280}
                placeholder="Altro: due parole"
                className="w-full rounded-lg border border-nero/15 px-3 py-2 text-sm focus:border-oro focus:outline-none"
              />
            </div>
          )}

          <button
            disabled={pending || motivi.length === 0}
            onClick={registraPerso}
            className="btn-scuro mt-3 min-h-[48px] w-full disabled:opacity-50"
          >
            Registra
          </button>
        </div>
      )}

      {msg && <p className="mt-2 text-sm text-oro">{msg}</p>}
    </div>
  );
}
