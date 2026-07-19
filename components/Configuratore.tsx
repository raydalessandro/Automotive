"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { traccia } from "@/lib/traccia";
import {
  RISCHI,
  KM_SCAGLIONI,
  KM_DEFAULT,
  DURATE_CONFIG,
  DURATA_DEFAULT,
  calcolaRata,
  classificaServizi,
  rischioById,
  type Rischio,
  type Segmento,
} from "@/lib/servizi.config";
import { IconaServizio } from "@/components/design/FasciaServizi";
import { Filetto } from "@/components/design/RuotaGuilloche";
import { MicroGaranzie } from "@/components/design/MicroGaranzie";
import { Calcolatore } from "@/components/Calcolatore";
import { euro, numero } from "@/lib/format";

const KEY_CONFIG = "impero_config";

type Props = {
  canoneIniziale?: number;
  veicoloId?: string;
  veicoloTitolo?: string;
  durataIniziale?: number;
  segmentoEvidenza?: Segmento;
  canoneModificabile?: boolean;
};

export function Configuratore({
  canoneIniziale = 300,
  veicoloId,
  veicoloTitolo,
  durataIniziale = DURATA_DEFAULT,
  segmentoEvidenza,
  canoneModificabile = false,
}: Props) {
  const [canone, setCanone] = useState(canoneIniziale);
  const [durata, setDurata] = useState<number>(
    (DURATE_CONFIG as readonly number[]).includes(durataIniziale) ? durataIniziale : DURATA_DEFAULT,
  );
  const [kmIdx, setKmIdx] = useState(() => {
    const i = KM_SCAGLIONI.indexOf(KM_DEFAULT as (typeof KM_SCAGLIONI)[number]);
    return i >= 0 ? i : 1;
  });
  const kmAnno = KM_SCAGLIONI[kmIdx];

  // Stato iniziale dei toggle: inclusi base sempre on; default_on; consigliati del segmento.
  const [attivi, setAttivi] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const r of RISCHI) {
      if (r.copertura.incluso_base) s.add(r.id);
      else if (r.default_on) s.add(r.id);
      else if (segmentoEvidenza && r.segmenti_consigliati.includes(segmentoEvidenza)) s.add(r.id);
    }
    return s;
  });

  const [mostraCalcolatore, setMostraCalcolatore] = useState(false);

  // Traccia l'uso del configuratore (§3): il dettaglio vive nel lead, non nell'evento.
  const tracciato = useRef(false);
  useEffect(() => {
    if (tracciato.current) return;
    tracciato.current = true;
    traccia("configuratore_usato", { veicolo_id: veicoloId });
  }, [veicoloId]);

  const toggle = (r: Rischio) => {
    if (r.copertura.incluso_base) return; // non deselezionabile
    setAttivi((prev) => {
      const next = new Set(prev);
      if (next.has(r.id)) next.delete(r.id);
      else next.add(r.id);
      return next;
    });
  };

  // Classificazione + rata via funzioni pure (§2), testate a parte.
  const attiviIds = useMemo(() => [...attivi], [attivi]);
  const classi = useMemo(() => classificaServizi(attiviIds), [attiviIds]);
  const serviziInteresse = classi.servizi_interesse.map((id) => rischioById(id)!);
  const rischiAccettati = classi.rischi_accettati.map((id) => rischioById(id)!);
  const rataConfigurata = useMemo(() => calcolaRata(canone, attiviIds), [canone, attiviIds]);

  // Salva la configurazione per il form preventivo (letta in PR17).
  const salvaConfig = () => {
    try {
      const config = {
        veicolo_id: veicoloId ?? null,
        durata,
        km_anno: kmAnno,
        servizi_scelti: classi.servizi_scelti,
        servizi_interesse: classi.servizi_interesse,
        rischi_accettati: classi.rischi_accettati,
        rata_configurata: Math.round(rataConfigurata),
      };
      sessionStorage.setItem(KEY_CONFIG, JSON.stringify(config));
    } catch {
      // sessionStorage non disponibile: il form userà comunque i valori di base
    }
  };

  const linkPreventivo = veicoloId
    ? `/preventivo?veicolo=${veicoloId}&config=1`
    : `/preventivo?config=1`;

  return (
    <div>
      {/* Base */}
      <div className="rounded-2xl border border-nero/10 bg-carta p-5 sm:p-6">
        {veicoloTitolo && (
          <p className="mb-4 text-sm">
            Configurazione per <strong>{veicoloTitolo}</strong>
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          {canoneModificabile ? (
            <label className="block text-sm">
              <span className="font-medium">Canone base (IVA esclusa)</span>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="range"
                  min={100}
                  max={1200}
                  step={5}
                  value={canone}
                  onChange={(e) => setCanone(Number(e.target.value))}
                  aria-label="Canone base"
                  aria-valuetext={`${euro(canone)} al mese`}
                  className="h-2 flex-1 cursor-pointer accent-oro"
                />
                <span className="w-20 shrink-0 text-right font-display text-lg font-semibold tabular">
                  {euro(canone)}
                </span>
              </div>
            </label>
          ) : (
            <div className="text-sm">
              <span className="font-medium">Canone base</span>
              <p className="mt-1 font-display text-lg font-semibold tabular">
                {euro(canone)} <span className="text-xs font-normal text-testo-chiaro/50">/mese + IVA</span>
              </p>
            </div>
          )}

          <label className="block text-sm">
            <span className="font-medium">Durata</span>
            <select
              value={durata}
              onChange={(e) => setDurata(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-nero/15 bg-carta px-3 py-2 focus:border-oro focus:outline-none"
            >
              {DURATE_CONFIG.map((d) => (
                <option key={d} value={d}>
                  {d} mesi
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Km all'anno</span>
            <span className="tabular font-semibold text-oro">{numero(kmAnno)} km</span>
          </div>
          <input
            type="range"
            min={0}
            max={KM_SCAGLIONI.length - 1}
            step={1}
            value={kmIdx}
            onChange={(e) => setKmIdx(Number(e.target.value))}
            aria-label="Km all'anno"
            aria-valuetext={`${numero(kmAnno)} km`}
            className="mt-2 w-full cursor-pointer accent-oro"
          />
          <p className="mt-1 text-xs text-testo-chiaro/50">
            Il canone varia con i km: confermato nel preventivo.
          </p>
        </div>
      </div>

      {/* Tabella rischi */}
      <div className="mt-6 space-y-3">
        {RISCHI.map((r) => (
          <CardRischio
            key={r.id}
            r={r}
            attivo={attivi.has(r.id)}
            consigliato={
              !r.copertura.incluso_base &&
              !!segmentoEvidenza &&
              r.segmenti_consigliati.includes(segmentoEvidenza)
            }
            onToggle={() => toggle(r)}
          />
        ))}
      </div>

      {/* L'attività non si ferma */}
      <div className="mt-6 rounded-2xl bg-nero p-6 text-testo-scuro">
        <h3 className="font-display text-xl font-semibold">L'attività non si ferma</h3>
        <p className="mt-2 text-sm text-testo-scuro/75">
          Ogni copertura serve a una cosa sola: che un imprevisto non diventi un giorno di lavoro
          perso. Tu scegli cosa coprire e cosa no — con i conti in chiaro, non subìti.
        </p>
      </div>

      {/* Riepilogo sticky */}
      <div className="sticky bottom-4 z-30 mt-6 rounded-2xl border border-oro/30 bg-carta p-5 shadow-lg sm:p-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm font-medium">Rata configurata (indicativa)</span>
          <span className="font-display text-3xl font-semibold tabular text-nero">
            {euro(rataConfigurata)}
            <span className="ml-1 text-sm font-normal text-testo-chiaro/50">/mese + IVA</span>
          </span>
        </div>

        <Filetto className="my-3 h-3 w-full text-oro/60" />

        {rischiAccettati.length > 0 ? (
          <div className="text-sm">
            <p className="font-medium text-testo-chiaro/80">Rischi che accetti:</p>
            <p className="mt-1 text-testo-chiaro/60">
              {rischiAccettati.map((r) => r.titolo).join(" · ")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-oro">Hai scelto di coprire tutto.</p>
        )}

        {serviziInteresse.length > 0 && (
          <p className="mt-2 text-xs text-testo-chiaro/50">
            Su preventivo: {serviziInteresse.map((r) => r.copertura.nome).join(", ")}.
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setMostraCalcolatore((v) => !v)}
            className="btn-ghost flex-1"
          >
            {mostraCalcolatore ? "Nascondi costo reale fiscale" : "Vedi il costo reale fiscale"}
          </button>
          <Link href={linkPreventivo} onClick={salvaConfig} className="btn-oro flex-1">
            Richiedi il preventivo con questa configurazione
          </Link>
        </div>
        <MicroGaranzie className="mt-3 justify-center" />
        <p className="mt-3 text-center text-xs text-testo-chiaro/45">
          Prezzi dei servizi indicativi, confermati nel preventivo.
        </p>
      </div>

      {/* Calcolatore fiscale in coda */}
      {mostraCalcolatore && (
        <div className="mt-6">
          <Calcolatore
            canoneIniziale={Math.round(rataConfigurata)}
            durataIniziale={durata}
            profiloIniziale={segmentoEvidenza === "agenti" ? "agente_rappresentante" : undefined}
          />
        </div>
      )}
    </div>
  );
}

function CardRischio({
  r,
  attivo,
  consigliato,
  onToggle,
}: {
  r: Rischio;
  attivo: boolean;
  consigliato: boolean;
  onToggle: () => void;
}) {
  const base = r.copertura.incluso_base;
  return (
    <div
      className={`rounded-2xl border bg-carta p-5 transition-colors ${
        attivo ? "border-oro/40" : "border-nero/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {r.icona && <IconaServizio servizio={r.icona} className="h-8 w-8 shrink-0 text-oro" />}
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight">{r.titolo}</h3>
            {consigliato && (
              <span className="mt-0.5 inline-block rounded-full bg-oro/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-oro">
                Consigliato per te
              </span>
            )}
          </div>
        </div>
        {base ? (
          <span className="shrink-0 rounded-full bg-oro/15 px-3 py-1 text-xs font-semibold text-oro">
            Già nel canone
          </span>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={attivo}
            aria-label={`${attivo ? "Rimuovi" : "Aggiungi"} ${r.copertura.nome}`}
            onClick={onToggle}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              attivo ? "bg-oro" : "bg-nero/15"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                attivo ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Scoperto */}
        <div className={`rounded-xl p-4 ${attivo || base ? "bg-avorio/50 opacity-60" : "bg-avorio"}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-testo-chiaro/50">
            Se sei scoperto
          </p>
          <p className="mt-2 text-sm text-testo-chiaro/80">{r.scoperto.racconto}</p>
          <p className="mt-2 text-sm font-medium">{r.scoperto.costo_tipico}</p>
          {r.scoperto.fermo_attivita && (
            <p className="mt-1 text-xs text-testo-chiaro/55">↳ {r.scoperto.fermo_attivita}</p>
          )}
        </div>
        {/* Coperto */}
        <div className={`rounded-xl border p-4 ${attivo || base ? "border-oro/40 bg-oro/5" : "border-nero/10"}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-oro">La copertura</p>
          <p className="mt-2 text-sm font-medium">{r.copertura.nome}</p>
          {r.copertura.nota && <p className="mt-1 text-xs text-testo-chiaro/60">{r.copertura.nota}</p>}
          <p className="mt-2 text-sm font-semibold">
            {base
              ? "Inclusa"
              : r.copertura.prezzo_mese != null
                ? `+ ${euro(r.copertura.prezzo_mese)}/mese`
                : "Su preventivo"}
          </p>
        </div>
      </div>
    </div>
  );
}
