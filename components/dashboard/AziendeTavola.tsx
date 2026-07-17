"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  SEGMENTI,
  STATI_AZIENDA,
  labelSegmento,
  labelStatoAzienda,
  type Azienda,
} from "@/lib/aziende/schema";
import { importaAziende, aggiornaAzienda, type EsitoImport } from "@/app/app/(dash)/aziende/actions";

export function AziendeTavola({ aziende }: { aziende: Azienda[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [fSeg, setFSeg] = useState("");
  const [fStato, setFStato] = useState("");
  const [fProv, setFProv] = useState("");
  const [mostraImport, setMostraImport] = useState(false);
  const [testo, setTesto] = useState("");
  const [esito, setEsito] = useState<EsitoImport | null>(null);
  const [espanso, setEspanso] = useState<string | null>(null);

  const filtrate = useMemo(
    () =>
      aziende
        .filter((a) => (fSeg ? a.segmento === fSeg : true))
        .filter((a) => (fStato ? a.stato === fStato : true))
        .filter((a) => (fProv ? (a.provincia ?? "").toLowerCase().includes(fProv.toLowerCase()) : true)),
    [aziende, fSeg, fStato, fProv],
  );

  const esegui = (fn: () => Promise<{ ok?: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (r.ok) router.refresh();
    });

  const doImport = () =>
    start(async () => {
      setEsito(null);
      const r = await importaAziende(testo);
      setEsito(r);
      if (r.ok) {
        setTesto("");
        router.refresh();
      }
    });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Aziende</h1>
        <button onClick={() => setMostraImport((v) => !v)} className="btn-scuro px-4 py-2 text-sm">
          {mostraImport ? "Chiudi import" : "Importa CSV/JSON"}
        </button>
      </div>

      {mostraImport && (
        <div className="mt-4 rounded-2xl border border-nero/10 bg-carta p-5">
          <p className="text-sm text-testo-chiaro/70">
            Incolla JSON (array) o CSV con intestazioni. Colonne: ragione_sociale, segmento, settore,
            provincia, citta, sito, email, telefono, dimensione_stimata, segnali, score, fonte_ricerca.
            Le email PEC vengono rifiutate; i duplicati (email già presente) saltati.
          </p>
          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            rows={6}
            placeholder='[{"ragione_sociale":"Rossi Impianti","segmento":"artigiani","provincia":"MI","email":"info@rossi.it"}]'
            className="mt-3 w-full rounded-lg border border-nero/15 px-3 py-2 font-mono text-xs focus:border-oro focus:outline-none"
          />
          <button onClick={doImport} disabled={pending} className="btn-oro mt-3 px-4 py-2 text-sm disabled:opacity-50">
            {pending ? "Import…" : "Importa"}
          </button>

          {esito && (
            <div className="mt-3 text-sm">
              {esito.error ? (
                <p className="text-red-600">Errore: {esito.error}</p>
              ) : (
                <p className="text-testo-chiaro/75">
                  Inserite <strong className="text-oro">{esito.inseriti}</strong> · duplicati saltati{" "}
                  {esito.duplicati} · scartate {esito.scartate?.length ?? 0}
                </p>
              )}
              {esito.scartate && esito.scartate.length > 0 && (
                <ul className="mt-2 max-h-32 overflow-y-auto rounded-lg bg-avorio p-2 text-xs text-testo-chiaro/60">
                  {esito.scartate.map((s, i) => (
                    <li key={i}>
                      riga {s.riga}
                      {s.ragione_sociale ? ` (${s.ragione_sociale})` : ""}: {s.motivo}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filtri */}
      <div className="mt-5 flex flex-wrap gap-2">
        <select value={fSeg} onChange={(e) => setFSeg(e.target.value)} className="rounded-lg border border-nero/15 bg-carta px-3 py-2 text-sm">
          <option value="">Tutti i segmenti</option>
          {SEGMENTI.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select value={fStato} onChange={(e) => setFStato(e.target.value)} className="rounded-lg border border-nero/15 bg-carta px-3 py-2 text-sm">
          <option value="">Tutti gli stati</option>
          {STATI_AZIENDA.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          value={fProv}
          onChange={(e) => setFProv(e.target.value)}
          placeholder="Provincia"
          className="w-32 rounded-lg border border-nero/15 px-3 py-2 text-sm focus:border-oro focus:outline-none"
        />
        <span className="self-center text-sm text-testo-chiaro/50">{filtrate.length} aziende</span>
      </div>

      {/* Tabella */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-nero/10 bg-carta">
        <table className="w-full text-sm">
          <thead className="border-b border-nero/10 text-left text-xs uppercase tracking-wide text-testo-chiaro/50">
            <tr>
              <th className="p-3">Ragione sociale</th>
              <th className="p-3">Segmento</th>
              <th className="p-3">Prov.</th>
              <th className="p-3">Email</th>
              <th className="p-3">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nero/5">
            {filtrate.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-testo-chiaro/50">
                  Nessuna azienda. Importa un elenco per iniziare.
                </td>
              </tr>
            ) : (
              filtrate.map((a) => (
                <Fragment key={a.id}>
                  <tr className="align-top">
                    <td className="p-3">
                      <button onClick={() => setEspanso(espanso === a.id ? null : a.id)} className="text-left font-medium hover:text-oro">
                        {a.ragione_sociale}
                      </button>
                      {a.citta && <div className="text-xs text-testo-chiaro/45">{a.citta}</div>}
                    </td>
                    <td className="p-3 text-testo-chiaro/70">{labelSegmento(a.segmento)}</td>
                    <td className="p-3 text-testo-chiaro/70">{a.provincia ?? "—"}</td>
                    <td className="p-3 text-testo-chiaro/70">{a.email ?? "—"}</td>
                    <td className="p-3">
                      <select
                        value={a.stato}
                        disabled={pending}
                        onChange={(e) => esegui(() => aggiornaAzienda(a.id, { stato: e.target.value }))}
                        className="rounded-lg border border-nero/15 bg-carta px-2 py-1 text-xs"
                      >
                        {STATI_AZIENDA.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {espanso === a.id && (
                    <tr>
                      <td colSpan={5} className="bg-avorio/60 p-3">
                        <SegnaliEditor azienda={a} onSalva={(s) => esegui(() => aggiornaAzienda(a.id, { segnali: s }))} pending={pending} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SegnaliEditor({
  azienda,
  onSalva,
  pending,
}: {
  azienda: Azienda;
  onSalva: (s: string) => void;
  pending: boolean;
}) {
  const [val, setVal] = useState(azienda.segnali ?? "");
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-testo-chiaro/50">
        Note / segnali
      </label>
      <div className="mt-1 flex flex-wrap gap-2 text-xs text-testo-chiaro/60">
        {azienda.settore && <span>Settore: {azienda.settore}</span>}
        {azienda.dimensione_stimata && <span>· Dimensione: {azienda.dimensione_stimata}</span>}
        {azienda.sito && <span>· {azienda.sito}</span>}
        {azienda.telefono && <span>· {azienda.telefono}</span>}
      </div>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rows={2}
        className="mt-2 w-full rounded-lg border border-nero/15 px-3 py-2 text-sm focus:border-oro focus:outline-none"
      />
      <button onClick={() => onSalva(val)} disabled={pending} className="btn-oro mt-2 px-4 py-1.5 text-xs disabled:opacity-50">
        Salva note
      </button>
    </div>
  );
}
