"use client";

import { useMemo, useState } from "react";
import {
  PROFILI,
  PROFILO_DEFAULT,
  type ProfiloId,
  type ProfiloDeduzione,
} from "@/lib/fiscale.config";
import { calcolaDeduzione, prezzoIvaInclusa } from "@/lib/fiscale";
import { euro } from "@/lib/format";

const ORDINE_PROFILI: ProfiloId[] = [
  "srl_ordinaria",
  "ditta_individuale",
  "agente_rappresentante",
  "n1_strumentale",
  "fringe_benefit",
  "forfettario",
];

type Props = {
  /** Canone di partenza (IVA esclusa). */
  canoneIniziale?: number;
  anticipoIniziale?: number;
  durataIniziale?: number;
  profiloIniziale?: ProfiloId;
  /** Se true, il canone è modificabile dall'utente (calcolatore standalone). */
  canoneModificabile?: boolean;
};

export function Calcolatore({
  canoneIniziale = 300,
  anticipoIniziale = 0,
  durataIniziale = 48,
  profiloIniziale = PROFILO_DEFAULT,
  canoneModificabile = false,
}: Props) {
  const [profiloId, setProfiloId] = useState<ProfiloId>(profiloIniziale);
  const [canone, setCanone] = useState(canoneIniziale);
  const [aliquotaIdx, setAliquotaIdx] = useState(0);
  const [spesaAttuale, setSpesaAttuale] = useState<number | "">("");

  const profilo = PROFILI[profiloId];

  return (
    <div className="rounded-2xl border border-nero/10 bg-carta p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold">Calcola il tuo costo reale</h2>
        <p className="mt-1 text-sm text-testo-chiaro/60">
          Scegli il tuo profilo fiscale e scopri quanto ti costa davvero al mese.
        </p>
      </div>

      {canoneModificabile && (
        <label className="mb-6 block">
          <span className="text-sm font-medium">Canone di listino (IVA esclusa)</span>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="range"
              min={100}
              max={1200}
              step={5}
              value={canone}
              onChange={(e) => setCanone(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer accent-oro"
              aria-label="Canone di listino"
            />
            <span className="w-24 shrink-0 text-right font-display text-xl font-semibold tabular">
              {euro(canone)}
            </span>
          </div>
        </label>
      )}

      {/* Selettore profilo — radio card con label parlanti (§3.5). */}
      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-medium">Il tuo profilo</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ORDINE_PROFILI.map((id) => {
            const p = PROFILI[id];
            const attivo = id === profiloId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setProfiloId(id);
                  setAliquotaIdx(0);
                }}
                aria-pressed={attivo}
                className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                  attivo
                    ? "border-oro bg-oro/10"
                    : "border-nero/10 hover:border-oro/40 hover:bg-oro/5"
                }`}
              >
                <span className="block font-medium">{p.label}</span>
                <span className="mt-0.5 block text-xs text-testo-chiaro/55">{p.descrizione}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {profilo.tipo === "deduzione" ? (
        <RisultatoDeduzione
          profilo={profilo}
          canone={canone}
          anticipo={anticipoIniziale}
          durata={durataIniziale}
          aliquotaIdx={aliquotaIdx}
          setAliquotaIdx={setAliquotaIdx}
        />
      ) : (
        <RisultatoForfettario
          canone={canone}
          anticipo={anticipoIniziale}
          durata={durataIniziale}
          spesaAttuale={spesaAttuale}
          setSpesaAttuale={setSpesaAttuale}
        />
      )}

      <p className="mt-6 border-t border-nero/10 pt-4 text-xs text-testo-chiaro/50">
        Simulazione indicativa, non costituisce consulenza fiscale. Verifica sempre con il tuo
        commercialista. Assunzioni: quota noleggio/servizi 70/30, tetto sulla sola quota noleggio,
        IVA 22%.
      </p>
    </div>
  );
}

function Riga({
  label,
  valore,
  segno,
  forte,
}: {
  label: string;
  valore: string;
  segno?: "+" | "−";
  forte?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className={`text-sm ${forte ? "font-medium" : "text-testo-chiaro/65"}`}>{label}</span>
      <span className={`tabular ${forte ? "text-base font-semibold" : "text-sm text-testo-chiaro/80"}`}>
        {segno && <span className="mr-0.5 text-testo-chiaro/50">{segno}</span>}
        {valore}
      </span>
    </div>
  );
}

function RisultatoDeduzione({
  profilo,
  canone,
  anticipo,
  durata,
  aliquotaIdx,
  setAliquotaIdx,
}: {
  profilo: ProfiloDeduzione;
  canone: number;
  anticipo: number;
  durata: number;
  aliquotaIdx: number;
  setAliquotaIdx: (n: number) => void;
}) {
  const aliquota = profilo.aliquote_preset[aliquotaIdx] ?? profilo.aliquote_preset[0];
  const r = useMemo(
    () => calcolaDeduzione(profilo, { canone, anticipo, durata, aliquota: aliquota.valore }),
    [profilo, canone, anticipo, durata, aliquota.valore],
  );

  return (
    <div>
      {profilo.aliquote_preset.length > 1 && (
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-medium">La tua aliquota</legend>
          <div className="flex flex-wrap gap-2">
            {profilo.aliquote_preset.map((a, i) => (
              <button
                key={a.label}
                type="button"
                onClick={() => setAliquotaIdx(i)}
                aria-pressed={i === aliquotaIdx}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  i === aliquotaIdx
                    ? "border-oro bg-oro/10 font-medium text-oro"
                    : "border-nero/15 text-testo-chiaro/70 hover:border-oro/40"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Cascata §3.5: canone → +IVA → prezzo pieno → −IVA rec. → −imposte → costo reale */}
      <div className="rounded-xl bg-avorio p-5">
        <Riga label="Canone listino (IVA escl.)" valore={euro(r.canoneEquivalente, 2)} />
        <Riga label="IVA 22%" valore={euro(r.costoPienoMese - r.canoneEquivalente, 2)} segno="+" />
        <Riga label="Prezzo pieno" valore={euro(r.costoPienoMese, 2)} forte />
        <div className="my-2 border-t border-nero/10" />
        <Riga label="IVA che recuperi" valore={euro(r.ivaRecuperataMese, 2)} segno="−" />
        <Riga label="Imposte che risparmi" valore={euro(r.risparmioImposteMese, 2)} segno="−" />
      </div>

      <div className="mt-4 flex items-baseline justify-between rounded-xl bg-nero px-5 py-4 text-testo-scuro">
        <span className="text-sm">Il tuo costo reale</span>
        <span className="font-display text-3xl font-semibold tabular text-oro-chiaro transition-all">
          {euro(r.costoRealeMese, 0)}
          <span className="ml-1 text-sm font-normal text-testo-scuro/60">/mese</span>
        </span>
      </div>

      {profilo.nota && (
        <p className="mt-3 rounded-lg bg-oro/10 px-4 py-3 text-xs text-testo-chiaro/70">
          {profilo.nota}
        </p>
      )}
    </div>
  );
}

function RisultatoForfettario({
  canone,
  anticipo,
  durata,
  spesaAttuale,
  setSpesaAttuale,
}: {
  canone: number;
  anticipo: number;
  durata: number;
  spesaAttuale: number | "";
  setSpesaAttuale: (v: number | "") => void;
}) {
  const ivaInclusa = prezzoIvaInclusa(canone, anticipo, durata);
  const diff = typeof spesaAttuale === "number" ? spesaAttuale - ivaInclusa : null;

  return (
    <div>
      {/* Per il forfettario l'IVA è costo pieno: prezzo IVA inclusa in evidenza (§3.4). */}
      <div className="rounded-xl bg-nero px-5 py-4 text-testo-scuro">
        <span className="text-sm">La tua rata, tutto incluso</span>
        <p className="mt-1 font-display text-3xl font-semibold tabular text-oro-chiaro">
          {euro(ivaInclusa, 0)}
          <span className="ml-1 text-sm font-normal text-testo-scuro/60">/mese (IVA inclusa)</span>
        </p>
      </div>

      <div className="mt-4 rounded-xl bg-avorio p-5">
        <p className="text-sm font-medium">Cosa include la rata</p>
        <ul className="mt-2 grid gap-1 text-sm text-testo-chiaro/70 sm:grid-cols-2">
          {[
            "Assicurazione RCA + kasko",
            "Bollo auto",
            "Manutenzione ordinaria e straordinaria",
            "Gomme",
            "Assistenza stradale",
            "Nessun capitale immobilizzato",
          ].map((x) => (
            <li key={x} className="flex items-start gap-2">
              <span className="mt-1 text-oro">•</span>
              {x}
            </li>
          ))}
        </ul>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium">
          Quanto ti costa oggi la tua auto al mese? (tutto compreso)
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={spesaAttuale}
          onChange={(e) => setSpesaAttuale(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="es. 550"
          className="mt-1 w-full rounded-lg border border-nero/15 px-4 py-2.5 text-sm focus:border-oro focus:outline-none"
        />
      </label>

      {diff !== null && (
        <div className="mt-3 rounded-lg bg-oro/10 px-4 py-3 text-sm">
          {diff > 0 ? (
            <>
              Con Impero risparmi circa{" "}
              <strong className="tabular text-oro">{euro(diff, 0)}/mese</strong>, a fronte di rata
              fissa e zero imprevisti.
            </>
          ) : (
            <>
              La rata Impero è {euro(-diff, 0)}/mese in più della tua spesa attuale dichiarata, ma
              con tutto incluso, rata fissa e zero capitale immobilizzato.
            </>
          )}
        </div>
      )}

      <p className="mt-3 text-xs text-testo-chiaro/50">
        Per il regime forfettario non c'è deduzione analitica né IVA detraibile: il confronto usa
        solo il dato che inserisci tu.
      </p>
    </div>
  );
}
