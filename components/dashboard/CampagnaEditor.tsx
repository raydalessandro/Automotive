"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SEGMENTI } from "@/lib/aziende/schema";
import {
  applicaSegnaposto,
  SEGNAPOSTO_DISPONIBILI,
  LABEL_STATO_CAMPAGNA,
  STATI_CAMPAGNA,
  type Campagna,
  type StatoCampagna,
} from "@/lib/campagne/schema";
import { aggiornaCampagna, cambiaStatoCampagna, accoda } from "@/app/app/(dash)/campagne/actions";

type Sample = Record<string, string | null>;

export function CampagnaEditor({ campagna, sample }: { campagna: Campagna; sample: Sample }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [c, setC] = useState(campagna);
  const [msg, setMsg] = useState<string | null>(null);

  const set = <K extends keyof Campagna>(k: K, v: Campagna[K]) => setC((p) => ({ ...p, [k]: v }));

  const salva = () =>
    start(async () => {
      setMsg(null);
      const r = await aggiornaCampagna(c.id, {
        nome: c.nome,
        segmento: c.segmento,
        oggetto: c.oggetto,
        corpo: c.corpo,
        tetto_giornaliero: c.tetto_giornaliero,
      });
      setMsg(r.error ? `Errore: ${r.error}` : "Salvato");
      if (r.ok) router.refresh();
    });

  const setStato = (stato: StatoCampagna) =>
    start(async () => {
      setMsg(null);
      const r = await cambiaStatoCampagna(c.id, stato);
      if (r.error) setMsg(`Errore: ${r.error}`);
      else {
        set("stato", stato);
        router.refresh();
      }
    });

  const faiAccoda = () =>
    start(async () => {
      setMsg(null);
      const r = await accoda(c.id);
      if (r.error) setMsg(`Errore: ${r.error}`);
      else {
        setMsg(`Accodati ${r.accodati} invii.`);
        router.refresh();
      }
    });

  const anteprimaOggetto = applicaSegnaposto(c.oggetto, sample);
  const anteprimaCorpo = applicaSegnaposto(c.corpo, sample);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="font-medium">Nome</span>
          <input value={c.nome} onChange={(e) => set("nome", e.target.value)} className="mt-1 w-full rounded-lg border border-nero/15 px-3 py-2 focus:border-oro focus:outline-none" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="font-medium">Segmento</span>
            <select value={c.segmento} onChange={(e) => set("segmento", e.target.value)} className="mt-1 w-full rounded-lg border border-nero/15 bg-carta px-3 py-2">
              {SEGMENTI.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Tetto/giorno</span>
            <input type="number" min={1} value={c.tetto_giornaliero} onChange={(e) => set("tetto_giornaliero", Math.max(1, Number(e.target.value)))} className="mt-1 w-full rounded-lg border border-nero/15 px-3 py-2 focus:border-oro focus:outline-none" />
          </label>
        </div>

        <label className="block text-sm">
          <span className="font-medium">Oggetto</span>
          <input value={c.oggetto} onChange={(e) => set("oggetto", e.target.value)} className="mt-1 w-full rounded-lg border border-nero/15 px-3 py-2 focus:border-oro focus:outline-none" />
        </label>

        <label className="block text-sm">
          <span className="font-medium">Corpo</span>
          <textarea value={c.corpo} onChange={(e) => set("corpo", e.target.value)} rows={10} className="mt-1 w-full rounded-lg border border-nero/15 px-3 py-2 text-sm focus:border-oro focus:outline-none" />
        </label>

        <p className="text-xs text-testo-chiaro/55">
          Segnaposto: {SEGNAPOSTO_DISPONIBILI.map((s) => `{${s}}`).join(" ")}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={salva} disabled={pending} className="btn-oro px-4 py-2 text-sm disabled:opacity-50">
            Salva
          </button>
          <button onClick={faiAccoda} disabled={pending} className="btn-scuro px-4 py-2 text-sm disabled:opacity-50">
            Accoda destinatari
          </button>
          {msg && <span className="text-sm text-oro">{msg}</span>}
        </div>

        {/* Stato */}
        <div className="border-t border-nero/10 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-testo-chiaro/50">Stato campagna</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STATI_CAMPAGNA.map((s) => (
              <button
                key={s}
                disabled={pending}
                onClick={() => setStato(s)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-50 ${
                  c.stato === s ? "border-nero bg-nero text-testo-scuro" : "border-nero/15 text-testo-chiaro/70 hover:border-oro/50"
                }`}
              >
                {LABEL_STATO_CAMPAGNA[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Anteprima */}
      <div className="lg:sticky lg:top-32 lg:h-fit">
        <div className="rounded-2xl border border-nero/10 bg-carta p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-testo-chiaro/50">
            Anteprima (dati di {sample.ragione_sociale ?? "esempio"})
          </p>
          <p className="mt-3 font-medium">{anteprimaOggetto || <span className="text-testo-chiaro/40">Oggetto…</span>}</p>
          <div className="mt-2 whitespace-pre-wrap text-sm text-testo-chiaro/75">
            {anteprimaCorpo || <span className="text-testo-chiaro/40">Corpo…</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
