"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DOMANDE, type Risposte, type Attivita } from "@/lib/consulente.config";
import { consiglia, type Soluzione } from "@/lib/consulente";
import type { Veicolo } from "@/lib/catalogo";
import { PROFILI } from "@/lib/fiscale.config";
import { rischioById } from "@/lib/servizi.config";
import { VeicoloImg } from "@/components/VeicoloImg";
import { MicroGaranzie } from "@/components/design/MicroGaranzie";
import { RichiamamiModal } from "@/components/RichiamamiModal";
import { traccia, tracciaStrumentoAperto, tracciaStrumentoCompletato } from "@/lib/traccia";
import { salvaEsito, segnaScelta } from "@/lib/consulente-esito";
import { euro, numero } from "@/lib/format";

const KEY = "impero_consulente";
const CHIAVI = DOMANDE.map((d) => d.chiave);

function leggiSalvate(): Partial<Risposte> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}") as Partial<Risposte>;
  } catch {
    return {};
  }
}

function labelRisposta<K extends keyof Risposte>(chiave: K, valore: string): string {
  const d = DOMANDE.find((x) => x.chiave === chiave);
  return d?.opzioni.find((o) => o.id === valore)?.label ?? valore;
}

export function Consulente({ veicoli }: { veicoli: Veicolo[] }) {
  const searchParams = useSearchParams();
  const [risposte, setRisposte] = useState<Partial<Risposte>>({});
  const [step, setStep] = useState(0);
  const [pronto, setPronto] = useState(false);
  const [modale, setModale] = useState(false);
  const trackato = useRef(false);
  const legendaRef = useRef<HTMLLegendElement>(null);

  // Idratazione: risposte salvate (refresh non azzera) + eventuale ?attivita= da landing.
  useEffect(() => {
    const salvate = leggiSalvate();
    const attivitaParam = searchParams.get("attivita");
    const valide = new Set(DOMANDE[0].opzioni.map((o) => o.id));
    if (attivitaParam && valide.has(attivitaParam)) {
      salvate.attivita = attivitaParam as Attivita;
    }
    setRisposte(salvate);
    const primaMancante = CHIAVI.findIndex((c) => !salvate[c]);
    setStep(primaMancante === -1 ? CHIAVI.length : primaMancante);
    setPronto(true);
  }, [searchParams]);

  const tutteDate = CHIAVI.every((c) => risposte[c]);
  const consulto = useMemo(
    () => (tutteDate ? consiglia(risposte as Risposte, veicoli) : null),
    [tutteDate, risposte, veicoli],
  );

  // Strumento aperto (§PR29): al mount, dedup per strumento.
  useEffect(() => {
    tracciaStrumentoAperto("consulente");
  }, []);

  // Evento consulente_usato: una volta, al completamento (= pagina Soluzioni vista).
  useEffect(() => {
    if (consulto && !trackato.current) {
      trackato.current = true;
      traccia("consulente_usato", { profilo_fiscale: consulto.profilo });
      tracciaStrumentoCompletato("consulente");
      salvaEsito({
        risposte: risposte as unknown as Record<string, string>,
        soluzione_vista: consulto.soluzioni.map((s) => s.veicolo.id),
        soluzione_scelta: null,
      });
    }
  }, [consulto, risposte]);

  function scegli(chiave: keyof Risposte, valore: string) {
    // Solo selezione: NON avanza (l'avanzamento è coi tasti Avanti/Indietro),
    // così si può cambiare risposta senza attrito anche rientrando nel wizard.
    const nuove = { ...risposte, [chiave]: valore };
    setRisposte(nuove);
    try {
      sessionStorage.setItem(KEY, JSON.stringify(nuove));
    } catch {
      /* ignora */
    }
  }

  const avanti = () => setStep((s) => Math.min(s + 1, CHIAVI.length));
  const indietro = () => setStep((s) => Math.max(s - 1, 0));

  function modifica() {
    trackato.current = false;
    setStep(0);
    legendaRef.current?.focus();
  }

  if (!pronto) return <div className="min-h-[50vh]" />;

  // --- Vista soluzioni ---
  if (step >= CHIAVI.length && consulto) {
    return (
      <>
        <RiepilogoRisposte risposte={risposte as Risposte} onModifica={modifica} />
        {consulto.suMisura ? (
          <PannelloSuMisura onRichiamo={() => setModale(true)} />
        ) : consulto.soluzioni.length === 0 ? (
          <StatoVuoto onRichiamo={() => setModale(true)} />
        ) : (
          <SoluzioniLista consulto={consulto} onRichiamo={() => setModale(true)} />
        )}
        <RichiamamiModal aperto={modale} onClose={() => setModale(false)} config={null} />
      </>
    );
  }

  // --- Wizard ---
  const domanda = DOMANDE[step];
  return (
    <div className="mx-auto max-w-xl">
      <Pallini totale={CHIAVI.length} attivo={step} />
      <fieldset className="mt-8">
        <legend
          ref={legendaRef}
          tabIndex={-1}
          className="font-display text-2xl font-semibold outline-none sm:text-3xl"
        >
          {domanda.testo}
        </legend>
        <div className="mt-6 space-y-3">
          {domanda.opzioni.map((o) => {
            const scelto = risposte[domanda.chiave] === o.id;
            return (
              <label
                key={o.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                  scelto ? "border-oro bg-oro/5" : "border-nero/10 bg-carta hover:border-oro/40"
                }`}
              >
                <input
                  type="radio"
                  name={domanda.chiave}
                  value={o.id}
                  checked={scelto}
                  onChange={() => scegli(domanda.chiave, o.id)}
                  className="mt-1 accent-oro"
                />
                <span>
                  <span className="block font-medium">{o.label}</span>
                  {o.sub && <span className="mt-0.5 block text-sm text-testo-chiaro/55">{o.sub}</span>}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={indietro}
          disabled={step === 0}
          className="text-sm font-medium text-testo-chiaro/60 transition-colors hover:text-oro disabled:invisible"
        >
          ← Indietro
        </button>
        <button
          type="button"
          onClick={avanti}
          disabled={!risposte[domanda.chiave]}
          className="btn-oro disabled:opacity-40"
        >
          {step === CHIAVI.length - 1 ? "Vedi le soluzioni" : "Avanti"}
        </button>
      </div>
    </div>
  );
}

function Pallini({ totale, attivo }: { totale: number; attivo: number }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden="true">
      {Array.from({ length: totale }, (_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === attivo ? "w-6 bg-oro" : i < attivo ? "w-2 bg-oro/60" : "w-2 bg-nero/15"
          }`}
        />
      ))}
    </div>
  );
}

function RiepilogoRisposte({ risposte, onModifica }: { risposte: Risposte; onModifica: () => void }) {
  const chips = [
    labelRisposta("attivita", risposte.attivita),
    labelRisposta("km", risposte.km),
    `Trasporto ${risposte.trasporto === "no" ? "no" : "sì"}`,
    labelRisposta("priorita", risposte.priorita),
  ];
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-nero/10 bg-carta px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-oro">Le tue risposte</span>
          {chips.map((c) => (
            <span key={c} className="rounded-full bg-nero/5 px-3 py-1 text-xs font-medium text-testo-chiaro/75">
              {c}
            </span>
          ))}
        </div>
        <button type="button" onClick={onModifica} className="btn-ghost shrink-0 px-4 py-2 text-sm">
          Modifica le risposte
        </button>
      </div>
    </div>
  );
}

function SoluzioniLista({ consulto, onRichiamo }: { consulto: ReturnType<typeof consiglia>; onRichiamo: () => void }) {
  const profiloLabel = PROFILI[consulto.profilo].label;
  return (
    <div className="mx-auto mt-4 max-w-5xl">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Le tue soluzioni</h1>
      <p className="mt-2 text-testo-chiaro/65">
        Calcolate sul tuo profilo: <span className="font-medium text-testo-chiaro">{profiloLabel}</span>.
      </p>

      {consulto.note.map((n) => (
        <p key={n} className="mt-3 rounded-xl border border-oro/25 bg-oro/5 px-4 py-3 text-sm text-testo-chiaro/70">
          {n}
        </p>
      ))}

      {consulto.pochePerProfilo && (
        <p className="mt-4 text-sm text-testo-chiaro/60">
          Oggi a catalogo per il tuo profilo c'è questo. Il listino si aggiorna ogni 2-3 settimane:{" "}
          <Link href="/preventivo" className="text-oro hover:underline">
            dicci cosa ti serve
          </Link>{" "}
          e ti troviamo il mezzo giusto.
        </p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {consulto.soluzioni.map((s) => (
          <CardSoluzione key={s.veicolo.id} s={s} profilo={consulto.profilo} />
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-nero/10 bg-carta p-6 text-center sm:p-8">
        <p className="font-display text-xl font-semibold">Preferisci parlarne?</p>
        <p className="mt-1 text-testo-chiaro/65">Ti richiamiamo noi in giornata, con i conti già fatti.</p>
        <button type="button" onClick={onRichiamo} className="btn-oro mt-4">
          Fatti richiamare
        </button>
        <MicroGaranzie className="mt-5 justify-center" />
      </div>
    </div>
  );
}

function CardSoluzione({ s, profilo }: { s: Soluzione; profilo: string }) {
  const chips = s.serviziConsigliati.map((id) => rischioById(id)?.titolo ?? id).slice(0, 4);
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border bg-carta ${
        s.consigliata ? "border-oro shadow-lg" : "border-nero/10"
      }`}
    >
      <div className="relative aspect-[4/3] bg-avorio">
        <VeicoloImg src={s.veicolo.foto} alt={s.titolo} className="h-full w-full object-cover" sizes="(min-width:768px) 30vw, 100vw" />
        {s.consigliata && (
          <span className="absolute left-3 top-3 rounded-full bg-oro px-3 py-1 text-xs font-semibold text-nero">
            La nostra proposta
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-oro">{s.veicolo.marca}</p>
        <h3 className="mt-1 font-display text-xl font-semibold leading-tight">
          {s.veicolo.modello}{" "}
          <span className="font-sans text-sm font-normal text-testo-chiaro/60">{s.veicolo.versione}</span>
        </h3>
        <p className="mt-3 text-sm text-testo-chiaro/60">
          da <span className="font-semibold text-testo-chiaro">{euro(s.canoneMese)}</span>/mese + IVA
        </p>
        {s.forfettario ? (
          <p className="mt-2">
            <span className="text-xs text-testo-chiaro/55">Prezzo pieno IVA inclusa</span>
            <span className="block font-display text-3xl font-semibold tabular text-oro">
              {euro(s.prezzoPienoMese ?? 0)}
              <span className="ml-1 text-sm font-normal text-testo-chiaro/50">/mese</span>
            </span>
          </p>
        ) : (
          <p className="mt-2">
            <span className="text-xs text-testo-chiaro/55">Costo reale per il tuo profilo</span>
            <span className="block font-display text-3xl font-semibold tabular text-oro">
              {euro(s.costoRealeMese ?? 0)}
              <span className="ml-1 text-sm font-normal text-testo-chiaro/50">/mese</span>
            </span>
          </p>
        )}
        <p className="mt-3 text-sm text-testo-chiaro/70">{s.perche}</p>
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span key={c} className="rounded-full bg-nero/5 px-2.5 py-0.5 text-xs text-testo-chiaro/70">
                {c}
              </span>
            ))}
          </div>
        )}
        <div className="mt-5 flex-1" />
        <Link
          href={s.linkConfiguratore}
          onClick={() => {
            segnaScelta(s.veicolo.id);
            traccia("consulente_soluzione_click", { veicolo_id: s.veicolo.id, profilo_fiscale: profilo });
          }}
          className="btn-oro w-full"
        >
          Configura questa
        </Link>
        <p className="mt-2 text-center text-xs text-testo-chiaro/45">
          Stesse assunzioni del calcolatore. Verifica col commercialista.
        </p>
      </div>
    </div>
  );
}

function PannelloSuMisura({ onRichiamo }: { onRichiamo: () => void }) {
  return (
    <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-oro/25 bg-nero p-8 text-center text-testo-scuro sm:p-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Oltre i 30.000 km, l'offerta si costruisce su misura</h1>
      <p className="mx-auto mt-3 max-w-lg text-testo-scuro/75">
        Con questi chilometri un configuratore standard direbbe cifre finte. Due minuti al telefono
        valgono di più: ti facciamo una proposta cucita sul tuo uso reale.
      </p>
      <button type="button" onClick={onRichiamo} className="btn-oro mt-6">
        Fatti richiamare
      </button>
      <MicroGaranzie scuro className="mt-6 justify-center" />
    </div>
  );
}

function StatoVuoto({ onRichiamo }: { onRichiamo: () => void }) {
  return (
    <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-nero/10 bg-carta p-8 text-center sm:p-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Per il tuo profilo, oggi, meglio parlarne</h1>
      <p className="mx-auto mt-3 max-w-lg text-testo-chiaro/65">
        A catalogo in questo momento non c'è il mezzo giusto per come lavori. Il listino si aggiorna
        di continuo: dicci cosa ti serve e te lo troviamo.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/preventivo" className="btn-oro">
          Dimmi cosa ti serve
        </Link>
        <button type="button" onClick={onRichiamo} className="btn-ghost">
          Fatti richiamare
        </button>
      </div>
    </div>
  );
}
