"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { segnaRisposta } from "@/app/app/(dash)/campagne/actions";

export type RigaInvio = {
  id: string;
  azienda_id: string;
  ragione_sociale: string;
  esito: string;
  inviato_il: string | null;
  errore: string | null;
};

export function AndamentoInvii({
  campagnaId,
  conteggi,
  righe,
}: {
  campagnaId: string;
  conteggi: Record<string, number>;
  righe: RigaInvio[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const segna = (aziendaId: string, stato: "risposto" | "lead") =>
    start(async () => {
      await segnaRisposta(aziendaId, stato, campagnaId);
      router.refresh();
    });

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["in_coda", "inviata", "errore", "bounce"] as const).map((e) => (
          <div key={e} className="rounded-xl border border-nero/10 bg-carta p-4">
            <p className="text-xs uppercase tracking-wide text-testo-chiaro/50">{e.replace("_", " ")}</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular">{conteggi[e] ?? 0}</p>
          </div>
        ))}
      </div>

      {righe.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-nero/10 bg-carta">
          <table className="w-full text-sm">
            <thead className="border-b border-nero/10 text-left text-xs uppercase tracking-wide text-testo-chiaro/50">
              <tr>
                <th className="p-3">Azienda</th>
                <th className="p-3">Esito</th>
                <th className="p-3">Inviato</th>
                <th className="p-3">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nero/5">
              {righe.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-medium">{r.ragione_sociale}</td>
                  <td className="p-3 text-testo-chiaro/70">
                    {r.esito}
                    {r.errore && <span className="ml-1 text-xs text-red-600">({r.errore})</span>}
                  </td>
                  <td className="p-3 text-xs text-testo-chiaro/50">
                    {r.inviato_il ? new Date(r.inviato_il).toLocaleString("it-IT") : "—"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => segna(r.azienda_id, "risposto")} disabled={pending} className="rounded-full border border-nero/15 px-2.5 py-1 text-xs hover:border-oro/50 disabled:opacity-50">
                        Risposto
                      </button>
                      <button onClick={() => segna(r.azienda_id, "lead")} disabled={pending} className="rounded-full border border-oro/40 px-2.5 py-1 text-xs text-oro hover:bg-oro/10 disabled:opacity-50">
                        Lead
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
