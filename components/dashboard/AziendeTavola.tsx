"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SEGMENTI, STATI_AZIENDA, labelSegmento, type Azienda } from "@/lib/aziende/schema";
import {
  importaAziende,
  aggiornaAzienda,
  esportaSelezione,
  creaLeadDaAzienda,
  type EsitoImport,
  type ModoImport,
} from "@/app/app/(dash)/aziende/actions";

export function AziendeTavola({ aziende }: { aziende: Azienda[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [fSeg, setFSeg] = useState("");
  const [fStato, setFStato] = useState("");
  const [fProv, setFProv] = useState("");
  const [fFonte, setFFonte] = useState("");
  const [mostraImport, setMostraImport] = useState(false);
  const [modo, setModo] = useState<ModoImport>("raccolta");
  const [testo, setTesto] = useState("");
  const [esito, setEsito] = useState<EsitoImport | null>(null);
  const [espanso, setEspanso] = useState<string | null>(null);

  const fonti = useMemo(
    () => [...new Set(aziende.map((a) => a.fonte_ricerca).filter(Boolean))] as string[],
    [aziende],
  );

  const contatori = useMemo(() => {
    const c = { totale: aziende.length, grezza: 0, da_contattare: 0, in_campagna: 0, lead: 0 } as Record<string, number>;
    for (const a of aziende) if (a.stato in c) c[a.stato]++;
    return c;
  }, [aziende]);

  const filtrate = useMemo(
    () =>
      aziende
        .filter((a) => (fSeg ? a.segmento === fSeg : true))
        .filter((a) => (fStato ? a.stato === fStato : true))
        .filter((a) => (fProv ? (a.provincia ?? "").toLowerCase().includes(fProv.toLowerCase()) : true))
        .filter((a) => (fFonte ? a.fonte_ricerca === fFonte : true)),
    [aziende, fSeg, fStato, fProv, fFonte],
  );

  const esegui = (fn: () => Promise<{ ok?: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (r.ok) router.refresh();
    });

  const doImport = () =>
    start(async () => {
      setEsito(null);
      const r = await importaAziende(testo, modo);
      setEsito(r);
      if (r.ok) {
        setTesto("");
        router.refresh();
      }
    });

  const doExport = () =>
    start(async () => {
      const r = await esportaSelezione({
        stato: fStato || undefined,
        segmento: fSeg || undefined,
        provincia: fProv || undefined,
        fonte_ricerca: fFonte || undefined,
      });
      if (r.json) {
        const blob = new Blob([r.json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `aziende-export-${r.n ?? 0}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Aziende</h1>
        <div className="flex gap-2">
          <button onClick={doExport} disabled={pending} className="btn-ghost px-4 py-2 text-sm disabled:opacity-50">
            Esporta selezione (JSON)
          </button>
          <button onClick={() => setMostraImport((v) => !v)} className="btn-scuro px-4 py-2 text-sm">
            {mostraImport ? "Chiudi import" : "Importa CSV/JSON"}
          </button>
        </div>
      </div>

      {/* Contatori */}
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Contatore label="Totale" n={contatori.totale} />
        <Contatore label="Grezze" n={contatori.grezza} oro />
        <Contatore label="Da contattare" n={contatori.da_contattare} />
        <Contatore label="In campagna" n={contatori.in_campagna} />
        <Contatore label="Lead" n={contatori.lead} />
      </div>

      {mostraImport && (
        <div className="mt-4 rounded-2xl border border-nero/10 bg-carta p-5">
          <div className="mb-3 flex gap-1.5">
            {(["raccolta", "arricchimento"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setModo(m)}
                className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                  modo === m ? "border-nero bg-nero text-testo-scuro" : "border-nero/15 text-testo-chiaro/70 hover:border-oro/50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="text-sm text-testo-chiaro/70">
            {modo === "raccolta"
              ? "Raccolta: inserisce nuove aziende. Senza email valida entrano come grezze; i duplicati (cascata id→piva→email→nome+prov) sono saltati."
              : "Arricchimento: fa match con l'esistente (id→piva→email→nome+prov) e riempie solo i campi vuoti. Un'email valida su una grezza la promuove a da contattare."}
          </p>
          <p className="mt-1 text-xs text-testo-chiaro/50">
            Colonne: id, piva, ragione_sociale, segmento, settore, provincia, citta, sito, email,
            telefono, dimensione_stimata, segnali, score, fonte_ricerca. Email PEC rifiutate.
          </p>
          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            rows={6}
            placeholder='[{"ragione_sociale":"Rossi Impianti","segmento":"artigiani","provincia":"MI"}]'
            className="mt-3 w-full rounded-lg border border-nero/15 px-3 py-2 font-mono text-xs focus:border-oro focus:outline-none"
          />
          <button onClick={doImport} disabled={pending} className="btn-oro mt-3 px-4 py-2 text-sm disabled:opacity-50">
            {pending ? "Import…" : `Importa (${modo})`}
          </button>

          {esito && (
            <div className="mt-3 text-sm">
              {esito.error ? (
                <p className="text-red-600">Errore: {esito.error}</p>
              ) : (
                <p className="text-testo-chiaro/75">
                  Inserite <strong className="text-oro">{esito.inserite}</strong> · arricchite{" "}
                  <strong className="text-oro">{esito.arricchite}</strong> · duplicate {esito.duplicate} ·
                  scartate {esito.scartate?.length ?? 0}
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
        {fonti.length > 0 && (
          <select value={fFonte} onChange={(e) => setFFonte(e.target.value)} className="rounded-lg border border-nero/15 bg-carta px-3 py-2 text-sm">
            <option value="">Tutte le fonti</option>
            {fonti.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        )}
        <input
          value={fProv}
          onChange={(e) => setFProv(e.target.value)}
          placeholder="Provincia"
          className="w-28 rounded-lg border border-nero/15 px-3 py-2 text-sm focus:border-oro focus:outline-none"
        />
        <span className="self-center text-sm text-testo-chiaro/50">{filtrate.length} aziende</span>
      </div>

      {/* Tabella */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-nero/10 bg-carta">
        <table className="w-full text-sm">
          <thead className="border-b border-nero/10 text-left text-xs uppercase tracking-wide text-testo-chiaro/50">
            <tr>
              <th className="p-3">Ragione sociale</th>
              <th className="p-3">P.IVA</th>
              <th className="p-3">Segmento</th>
              <th className="p-3">Prov.</th>
              <th className="p-3">Email</th>
              <th className="p-3">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nero/5">
            {filtrate.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-testo-chiaro/50">
                  Nessuna azienda. Importa un elenco per iniziare.
                </td>
              </tr>
            ) : (
              filtrate.map((a) => (
                <Fragment key={a.id}>
                  <tr className="align-top">
                    <td className="p-3">
                      <button onClick={() => setEspanso(espanso === a.id ? null : a.id)} className="flex items-center gap-2 text-left font-medium hover:text-oro">
                        {a.stato === "grezza" && (
                          <span className="rounded-full bg-oro/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-oro">grezza</span>
                        )}
                        {a.ragione_sociale}
                      </button>
                      {a.citta && <div className="text-xs text-testo-chiaro/45">{a.citta}</div>}
                    </td>
                    <td className="p-3 tabular text-testo-chiaro/70">{a.piva ?? "—"}</td>
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
                      <td colSpan={6} className="bg-avorio/60 p-3">
                        <SegnaliEditor azienda={a} onSalva={(s) => esegui(() => aggiornaAzienda(a.id, { segnali: s }))} pending={pending} />
                        {/* Crea lead (§PR-3): la risposta outreach entra nella pipeline vendita. */}
                        <div className="mt-3 flex items-center gap-3 border-t border-nero/10 pt-3">
                          <button
                            disabled={pending}
                            onClick={() =>
                              esegui(async () => {
                                const r = await creaLeadDaAzienda(a.id);
                                if (r.ok && r.leadId) router.push(`/app/lead?apri=${r.leadId}`);
                                return r;
                              })
                            }
                            className="btn-oro px-4 py-2 text-sm disabled:opacity-50"
                          >
                            Crea lead
                          </button>
                          <span className="text-xs text-testo-chiaro/50">
                            Ha risposto: crea il lead e vai allo smistamento.
                          </span>
                        </div>
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

function Contatore({ label, n, oro = false }: { label: string; n: number; oro?: boolean }) {
  return (
    <span className="rounded-full border border-nero/10 bg-carta px-3 py-1.5">
      {label}: <strong className={oro ? "text-oro" : ""}>{n}</strong>
    </span>
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
      <label className="text-xs font-medium uppercase tracking-wide text-testo-chiaro/50">Note / segnali</label>
      <div className="mt-1 flex flex-wrap gap-2 text-xs text-testo-chiaro/60">
        {azienda.settore && <span>Settore: {azienda.settore}</span>}
        {azienda.dimensione_stimata && <span>· Dimensione: {azienda.dimensione_stimata}</span>}
        {azienda.sito && <span>· {azienda.sito}</span>}
        {azienda.telefono && <span>· {azienda.telefono}</span>}
        {azienda.arricchita_il && <span>· Arricchita: {new Date(azienda.arricchita_il).toLocaleDateString("it-IT")}</span>}
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
