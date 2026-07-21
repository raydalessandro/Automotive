"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type Lead } from "@/lib/dashboard/tipi";
import {
  labelForma,
  labelAnni,
  labelNVeicoli,
  labelKm,
} from "@/lib/lead/schema";
import {
  salvaNote,
  impostaRichiamo,
  salvaCommissione,
  caricaTimeline,
  caricaAzienda,
  riapriLead,
  chiudiLead,
  scartaLead,
  type EventoTimeline,
  type AziendaBrief,
} from "@/app/app/(dash)/lead/actions";
import { PillStato } from "./PillStato";
import { SmistaMenu, type VenditoreOpt } from "./SmistaMenu";
import { whatsappLink } from "@/lib/contatti";
import { titoliRischi } from "@/lib/servizi.config";
import { DOMANDE } from "@/lib/consulente.config";
import { numero } from "@/lib/format";
import { SITE } from "@/lib/site";

// Etichette leggibili delle risposte del Consulente (§PR23).
function etichetteConsulente(r: Record<string, string>): string {
  return DOMANDE.map((d) => {
    const v = r[d.chiave];
    if (!v) return null;
    return d.opzioni.find((o) => o.id === v)?.label ?? v;
  })
    .filter(Boolean)
    .join(" · ");
}

function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const locale = new Date(d.getTime() - off * 60000);
  return locale.toISOString().slice(0, 16);
}

function fmt(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" }) : "—";
}

export function LeadDettaglio({
  lead,
  venditori = [],
  onChiudi,
}: {
  lead: Lead;
  venditori?: VenditoreOpt[];
  onChiudi: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState(lead.note ?? "");
  const [notaAzione, setNotaAzione] = useState("");
  const [richiamo, setRichiamo] = useState(isoToLocalInput(lead.richiamare_il));
  const [commissione, setCommissione] = useState(
    lead.valore_commissione != null ? String(lead.valore_commissione) : "",
  );
  const [msg, setMsg] = useState<string | null>(null);

  // Brief azienda (§PR-3): dati dal magazzino via azienda_id, caricati all'apertura.
  const aziendaId = lead.azienda_id;
  const [azienda, setAzienda] = useState<AziendaBrief | null>(null);
  useEffect(() => {
    let vivo = true;
    if (aziendaId) caricaAzienda(aziendaId).then((a) => vivo && setAzienda(a));
    else setAzienda(null);
    return () => {
      vivo = false;
    };
  }, [aziendaId]);

  // Timeline della visita pre-lead (§PR32): caricata all'apertura, se c'è la sessione.
  const sessione = lead.fonte?.sessione;
  const [timeline, setTimeline] = useState<EventoTimeline[]>([]);
  useEffect(() => {
    let vivo = true;
    if (sessione) caricaTimeline(sessione).then((t) => vivo && setTimeline(t));
    else setTimeline([]);
    return () => {
      vivo = false;
    };
  }, [sessione]);

  const hot = lead.score != null && lead.score >= 3;
  const esegui = (fn: () => Promise<{ ok?: boolean; error?: string }>, ok: string) =>
    start(async () => {
      setMsg(null);
      const r = await fn();
      if (r.error) setMsg(`Errore: ${r.error}`);
      else {
        setMsg(ok);
        router.refresh();
      }
    });

  const testoWa = `Ciao ${lead.referente}, la contatto da ${SITE.nome} riguardo alla sua richiesta di noleggio.`;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-nero/10 p-4">
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl font-semibold">
            {lead.ragione_sociale}
            {hot && (
              <span className="ml-2 rounded-full bg-oro/15 px-2 py-0.5 align-middle text-xs font-semibold text-oro">
                HOT
              </span>
            )}
          </h2>
          <p className="text-sm text-testo-chiaro/55">
            {lead.referente} · score {lead.score ?? "—"}
          </p>
        </div>
        <button onClick={onChiudi} className="shrink-0 text-testo-chiaro/50 hover:text-oro" aria-label="Chiudi">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Contatto rapido */}
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${lead.telefono}`} className="btn-scuro px-4 py-2 text-sm">
            Chiama {lead.telefono}
          </a>
          <a
            href={whatsappLink(testoWa)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost px-4 py-2 text-sm"
          >
            WhatsApp
          </a>
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="btn-ghost px-4 py-2 text-sm">
              Email
            </a>
          )}
        </div>

        {/* Brief azienda (§PR-3, blocchi 1-2) — solo per i lead da risposta outreach. */}
        {lead.azienda_id && (
          <div className="mt-5 rounded-xl border border-nero/10 bg-avorio/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-testo-chiaro/50">
              Dal magazzino
            </p>
            {azienda ? (
              <>
                <p className="mt-2 text-sm">
                  <strong>{azienda.ragione_sociale}</strong>
                  {azienda.citta ? ` · ${azienda.citta}` : ""}
                  {azienda.provincia ? ` (${azienda.provincia})` : ""}
                </p>
                <p className="mt-0.5 text-sm text-testo-chiaro/70">
                  {azienda.settore ?? "—"} · {azienda.dimensione_stimata ?? "—"} · score{" "}
                  {azienda.score ?? "—"}
                  {azienda.sito ? (
                    <>
                      {" · "}
                      <a href={azienda.sito} target="_blank" rel="noopener noreferrer" className="text-oro underline">
                        sito
                      </a>
                    </>
                  ) : null}
                </p>
                {azienda.segnali && (
                  <p className="mt-2 text-sm text-testo-chiaro/75">
                    <span className="text-testo-chiaro/45">Perché li abbiamo contattati: </span>
                    {azienda.segnali}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-testo-chiaro/45">Caricamento…</p>
            )}
          </div>
        )}

        {/* Azioni operatore (§PR-3): stato attuale + Riassegna · Riapri · Chiudi · Scarta. */}
        <div className="mt-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-testo-chiaro/50">Azioni</p>
            <PillStato stato={lead.stato} />
          </div>
          <input
            value={notaAzione}
            onChange={(e) => setNotaAzione(e.target.value)}
            placeholder="Nota per questa azione (opzionale)"
            className="mt-2 w-full rounded-lg border border-nero/15 px-3 py-2 text-sm focus:border-oro focus:outline-none"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SmistaMenu leadId={lead.id} venditori={venditori} label="Riassegna a ▾" />
            <button
              disabled={pending}
              onClick={() => esegui(() => riapriLead(lead.id, notaAzione || undefined), "Riaperto")}
              className="rounded-full border border-nero/15 px-3 py-1.5 text-sm hover:border-oro/50 disabled:opacity-50"
            >
              Riapri
            </button>
            <button
              disabled={pending}
              onClick={() => esegui(() => chiudiLead(lead.id, notaAzione || undefined), "Chiuso")}
              className="btn-scuro px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Chiudi
            </button>
            <button
              disabled={pending}
              onClick={() => esegui(() => scartaLead(lead.id, notaAzione || undefined), "Scartato")}
              className="rounded-full border border-nero/15 px-3 py-1.5 text-sm text-testo-chiaro/60 hover:border-oro/50 disabled:opacity-50"
            >
              Scarta
            </button>
          </div>
        </div>

        {/* Valore commissione — solo a contratto chiuso (§PR30). Opzionale ma sollecitato. */}
        {lead.stato === "chiuso" && (
          <div className="mt-5 rounded-xl border border-oro/30 bg-oro/5 p-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-oro">
              Valore commissione (€)
            </label>
            <p className="mt-1 text-xs text-testo-chiaro/55">
              Quanto ci ha riconosciuto l&apos;operatore. Anche dopo: serve al valore medio a contratto.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={commissione}
                onChange={(e) => setCommissione(e.target.value)}
                placeholder="es. 450"
                className="w-32 rounded-lg border border-nero/15 px-3 py-2 text-sm focus:border-oro focus:outline-none"
              />
              <button
                disabled={pending}
                onClick={() =>
                  esegui(
                    () => salvaCommissione(lead.id, commissione === "" ? null : Number(commissione)),
                    "Commissione salvata",
                  )
                }
                className="btn-oro px-4 py-2 text-sm disabled:opacity-50"
              >
                Salva
              </button>
            </div>
          </div>
        )}

        {/* Dati */}
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Dato label="Forma giuridica" valore={labelForma(lead.forma_giuridica)} />
          <Dato label="Anni attività" valore={labelAnni(lead.anni_attivita)} />
          <Dato label="Veicoli" valore={labelNVeicoli(lead.n_veicoli)} />
          <Dato label="Km/anno" valore={labelKm(lead.km_anno)} />
          <Dato label="Provincia" valore={lead.provincia} />
          <Dato label="Settore" valore={lead.settore ?? "—"} />
          <Dato label="Veicolo" valore={lead.veicolo_id ?? "non specificato"} />
          <Dato label="Marketing" valore={lead.consenso_marketing ? "sì" : "no"} />
          <Dato label="Pagina" valore={lead.pagina ?? "—"} />
          <Dato label="Fonte" valore={lead.fonte?.utm_source ?? "diretto"} />
          <Dato label="Ricevuto" valore={fmt(lead.created_at)} />
          <Dato label="Aggiornato" valore={fmt(lead.aggiornato_il)} />
        </dl>

        {/* Configurazione dal configuratore (§3) */}
        {lead.configurazione && (
          <div className="mt-5 rounded-xl border border-oro/30 bg-oro/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-oro">Configurazione</p>
            {lead.configurazione.rata_configurata ? (
              <p className="mt-2 text-sm">
                Rata configurata:{" "}
                <strong className="tabular">€{numero(lead.configurazione.rata_configurata)}</strong>/mese + IVA
                {lead.configurazione.durata ? ` · ${lead.configurazione.durata} mesi` : ""}
                {lead.configurazione.km_anno ? ` · ${numero(lead.configurazione.km_anno)} km/anno` : ""}
              </p>
            ) : null}
            {lead.configurazione.servizi_scelti?.length ? (
              <p className="mt-1 text-sm text-testo-chiaro/75">
                Coperture: {titoliRischi(lead.configurazione.servizi_scelti).join(", ")}
              </p>
            ) : null}
            {lead.configurazione.servizi_interesse?.length ? (
              <p className="mt-1 text-sm text-testo-chiaro/75">
                Interessi (su preventivo): {titoliRischi(lead.configurazione.servizi_interesse).join(", ")}
              </p>
            ) : null}
            {lead.configurazione.rischi_accettati?.length ? (
              <p className="mt-1 text-sm text-testo-chiaro/55">
                Rischi accettati: {titoliRischi(lead.configurazione.rischi_accettati).join(", ")}
              </p>
            ) : null}
            {lead.configurazione.consulente?.risposte ? (
              <p className="mt-2 border-t border-oro/20 pt-2 text-sm text-testo-chiaro/75">
                🧭 <span className="font-medium">Consulente:</span>{" "}
                {etichetteConsulente(lead.configurazione.consulente.risposte)}
                {lead.configurazione.consulente.soluzione_scelta ? (
                  <>
                    {" "}
                    → scelta: <strong>{lead.configurazione.consulente.soluzione_scelta}</strong>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
        )}

        {/* Richiamo */}
        <div className="mt-5">
          <label className="text-xs font-medium uppercase tracking-wide text-testo-chiaro/50">
            Richiamare il
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              value={richiamo}
              onChange={(e) => setRichiamo(e.target.value)}
              className="rounded-lg border border-nero/15 px-3 py-2 text-sm focus:border-oro focus:outline-none"
            />
            <button
              disabled={pending}
              onClick={() => esegui(() => impostaRichiamo(lead.id, richiamo || null), "Richiamo salvato")}
              className="btn-oro px-4 py-2 text-sm disabled:opacity-50"
            >
              Salva
            </button>
            {lead.richiamare_il && (
              <button
                disabled={pending}
                onClick={() => {
                  setRichiamo("");
                  esegui(() => impostaRichiamo(lead.id, null), "Richiamo rimosso");
                }}
                className="text-xs text-testo-chiaro/50 hover:text-oro"
              >
                Rimuovi
              </button>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="mt-5">
          <label className="text-xs font-medium uppercase tracking-wide text-testo-chiaro/50">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-nero/15 px-3 py-2 text-sm focus:border-oro focus:outline-none"
            placeholder="Appunti sulla trattativa…"
          />
          <button
            disabled={pending}
            onClick={() => esegui(() => salvaNote(lead.id, note), "Note salvate")}
            className="btn-oro mt-2 px-4 py-2 text-sm disabled:opacity-50"
          >
            Salva note
          </button>
        </div>

        {/* Timeline della visita pre-lead (§PR32) */}
        {sessione && (
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-testo-chiaro/50">
              Percorso prima del contatto
            </p>
            {timeline.length === 0 ? (
              <p className="mt-2 text-sm text-testo-chiaro/45">Nessun evento registrato per questa visita.</p>
            ) : (
              <ol className="mt-2 space-y-1.5 border-l border-nero/10 pl-4">
                {timeline.map((e, i) => (
                  <li key={i} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-oro/60" />
                    <span className="text-testo-chiaro/80">{descriviEvento(e)}</span>
                    <span className="ml-2 text-xs text-testo-chiaro/40">
                      {new Date(e.ts).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {msg && <p className="mt-4 text-sm text-oro">{msg}</p>}
      </div>
    </div>
  );
}

// Descrizione leggibile di un evento della timeline (§PR32).
function descriviEvento(e: EventoTimeline): string {
  const d = e.dati ?? {};
  const s = (k: string) => (d[k] != null ? String(d[k]) : "");
  switch (e.tipo) {
    case "pagina_vista":
      return `Ha visto ${e.pagina ?? "una pagina"}`;
    case "veicolo_visto":
      return "Ha aperto la scheda di un veicolo";
    case "sezione_vista":
      return `Ha letto la sezione «${s("sezione")}»`;
    case "scroll_soglia":
      return `Ha scrollato al ${s("soglia")}%`;
    case "cta_click":
      return `Ha cliccato la CTA «${s("cta")}»`;
    case "faq_aperta":
      return "Ha aperto una FAQ";
    case "strumento_aperto":
      return `Ha aperto ${s("strumento")}`;
    case "strumento_completato":
      return `Ha completato ${s("strumento")}`;
    case "calcolatore_usato":
      return "Ha usato il calcolatore";
    case "configuratore_usato":
      return "Ha usato il configuratore";
    case "consulente_usato":
      return "Ha completato il consulente";
    case "consulente_soluzione_click":
      return "Ha scelto una soluzione del consulente";
    case "lead_iniziato":
      return `Ha iniziato il form ${s("form")}`;
    case "preventivo_inviato":
      return "Ha inviato la richiesta";
    case "telefono_click":
      return "Ha cliccato il telefono";
    case "whatsapp_click":
      return "Ha cliccato WhatsApp";
    case "condividi_click":
      return "Ha condiviso un veicolo";
    case "tempo_pagina":
      return `È rimasto ${s("secondi")}s su ${e.pagina ?? "una pagina"}`;
    default:
      return e.tipo;
  }
}

function Dato({ label, valore }: { label: string; valore: string }) {
  return (
    <div>
      <dt className="text-xs text-testo-chiaro/45">{label}</dt>
      <dd className="mt-0.5 font-medium capitalize">{valore}</dd>
    </div>
  );
}
