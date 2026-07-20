import Link from "next/link";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { ConfigMancante } from "@/components/dashboard/ConfigMancante";
import { SEZIONI_HOME } from "@/lib/sezioni";
import { fmtPct, fmtNum, fmtEuro, fmtDurata, fmtDelta } from "@/lib/dashboard/formato";
import {
  type EvtRow,
  type LeadRow,
  type StoriaRow,
  sessioni,
  sessioniConTipo,
  ctrHero,
  letturaSezioni,
  distribuzioneScroll,
  strumenti,
  conteggioLead,
  qualificati,
  raggiuntoStadio,
  idLeadProd,
  funnelLead,
  tempoChiusuraSecondi,
  business,
  fonti,
  blog,
  tasso,
  delta,
} from "@/lib/metriche";

export const dynamic = "force-dynamic";

const PERIODI = [7, 30, 90] as const;
const LIMITE = 50000;

type Vista = {
  giorni: number;
  da: string;
  a: string;
  evCur: EvtRow[];
  evPrev: EvtRow[];
  leads: LeadRow[];
  storia: StoriaRow[];
  daPrec: string;
};

async function carica(giorni: number): Promise<Vista | null> {
  const supabase = createClient();
  const now = Date.now();
  const a = new Date(now).toISOString();
  const da = new Date(now - giorni * 86400000).toISOString();
  const daPrec = new Date(now - 2 * giorni * 86400000).toISOString();

  const [evRes, leadRes, storiaRes] = await Promise.all([
    supabase
      .from("eventi")
      .select("sessione, tipo, pagina, ts, fonte, dati")
      .gte("ts", daPrec)
      .lt("ts", a)
      .filter("dati->>env", "eq", "prod")
      .limit(LIMITE),
    supabase.from("leads").select("id, stato, created_at, score, valore_commissione, fonte").limit(5000),
    supabase.from("lead_stati_storia").select("lead_id, stato, ts").gte("ts", daPrec).lt("ts", a).limit(LIMITE),
  ]);

  if (evRes.error || leadRes.error || storiaRes.error) return null;
  const eventi = (evRes.data ?? []) as EvtRow[];
  return {
    giorni,
    da,
    a,
    daPrec,
    evCur: eventi.filter((e) => e.ts && e.ts >= da && e.ts < a),
    evPrev: eventi.filter((e) => e.ts && e.ts >= daPrec && e.ts < da),
    leads: (leadRes.data ?? []) as LeadRow[],
    storia: (storiaRes.data ?? []) as StoriaRow[],
  };
}

export default async function AnalyticsPage({ searchParams }: { searchParams: { g?: string } }) {
  if (!supabaseConfigurato()) {
    return (
      <div>
        <Intestazione giorni={30} />
        <div className="mt-6">
          <ConfigMancante />
        </div>
      </div>
    );
  }

  const giorni = PERIODI.includes(Number(searchParams.g) as (typeof PERIODI)[number])
    ? Number(searchParams.g)
    : 30;
  const v = await carica(giorni);

  if (!v) {
    return (
      <div>
        <Intestazione giorni={giorni} />
        <p className="mt-6 rounded-2xl border border-dashed border-nero/15 bg-carta p-8 text-center text-sm text-testo-chiaro/55">
          Impossibile caricare i dati in questo momento.
        </p>
      </div>
    );
  }

  const { da, a, daPrec, evCur, evPrev, leads, storia } = v;
  const prodIds = idLeadProd(leads);

  // — Acquisizione —
  const sess = sessioni(evCur);
  const sessPrev = sessioni(evPrev);
  const canali = fonti(evCur, leads, da, a);

  // — Coinvolgimento —
  const ctrPrim = ctrHero(evCur, "hero_consulente");
  const ctrSec = ctrHero(evCur, "hero_calcolatore");
  const dropoff = letturaSezioni(evCur, SEZIONI_HOME);
  const scroll = distribuzioneScroll(evCur);
  const strum = strumenti(evCur, ["calcolatore", "configuratore", "consulente"]);

  // — Conversione — funnel sessioni → strumento → lead → contattato → preventivo → chiuso
  const lead = conteggioLead(leads, da, a);
  const leadPrev = conteggioLead(leads, daPrec, da);
  const qual = qualificati(leads, da, a);
  const funnelStages = [
    { label: "Sessioni", n: sess },
    { label: "Strumento aperto", n: sessioniConTipo(evCur, "strumento_aperto") },
    { label: "Lead", n: lead },
    { label: "Contattati", n: raggiuntoStadio(storia, prodIds, "contattato", da, a) },
    { label: "Preventivi", n: raggiuntoStadio(storia, prodIds, "preventivo_inviato", da, a) },
    { label: "Chiusi", n: raggiuntoStadio(storia, prodIds, "chiuso", da, a) },
  ];

  // — Business —
  const biz = business(storia, leads, da, a);
  const bizPrev = business(storia, leads, daPrec, da);
  const tChiusura = tempoChiusuraSecondi(storia, leads, da, a);

  const righeBlog = blog(evCur);
  const nessunEvento = evCur.length === 0;
  const nessunLead = leads.filter((l) => (l.fonte?.env ?? "") === "prod").length === 0;

  return (
    <div>
      <Intestazione giorni={giorni} />

      {/* 1 · Acquisizione */}
      <Blocco titolo="Acquisizione">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metrica label="Sessioni" valore={fmtNum(sess)} delta={delta(sess, sessPrev)} accento />
          <Metrica label="Lead" valore={fmtNum(lead)} delta={delta(lead, leadPrev)} />
        </div>
        <Tabella
          intestazioni={["Canale", "Sessioni", "Lead", "Costo/lead"]}
          vuota={nessunEvento}
          righe={canali.map((c) => [
            cap(c.canale),
            fmtNum(c.sessioni),
            fmtNum(c.lead),
            "—", // [APERTO] si attiva con le campagne a pagamento
          ])}
        />
        <p className="mt-2 text-xs text-testo-chiaro/45">
          Costo/lead: si attiva con le campagne a pagamento.
        </p>
      </Blocco>

      {/* 2 · Coinvolgimento */}
      <Blocco titolo="Coinvolgimento">
        {nessunEvento ? (
          <Vuoto />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metrica label="CTR hero primaria" valore={fmtPct(ctrPrim)} />
              <Metrica label="CTR hero secondaria" valore={fmtPct(ctrSec)} />
            </div>

            <h3 className="mt-6 font-display text-base font-semibold">Dove muore la lettura (home)</h3>
            <p className="text-xs text-testo-chiaro/50">% di sessioni-home che raggiungono ogni sezione.</p>
            <Dropoff righe={dropoff} />

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="font-display text-base font-semibold">Profondità di scroll (home)</h3>
                <div className="mt-3 space-y-2">
                  {scroll.map((s) => {
                    const tot = scroll.reduce((n, x) => n + x.sessioni, 0);
                    return (
                      <BarraSemplice
                        key={s.soglia}
                        label={s.soglia === 0 ? "< 25%" : `${s.soglia}%`}
                        valore={s.sessioni}
                        pct={tasso(s.sessioni, tot)}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-display text-base font-semibold">Strumenti</h3>
                <Tabella
                  intestazioni={["Strumento", "Aperti", "Completati", "Tasso"]}
                  righe={strum.map((s) => [cap(s.strumento), fmtNum(s.aperture), fmtNum(s.completamenti), fmtPct(s.tasso)])}
                />
              </div>
            </div>
          </>
        )}
      </Blocco>

      {/* 3 · Conversione */}
      <Blocco titolo="Conversione">
        {nessunEvento && nessunLead ? (
          <Vuoto />
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metrica label="Qualificati (score ≥ 3)" valore={fmtNum(qual)} />
            </div>
            <Funnel stages={funnelStages} />
          </>
        )}
      </Blocco>

      {/* 4 · Business */}
      <Blocco titolo="Business">
        {nessunLead ? (
          <Vuoto />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metrica label="Contratti" valore={fmtNum(biz.contratti)} delta={delta(biz.contratti, bizPrev.contratti)} accento />
            <Metrica label="Commissioni" valore={fmtEuro(biz.commissioni)} delta={delta(biz.commissioni, bizPrev.commissioni)} />
            <Metrica label="Valore medio" valore={fmtEuro(biz.valoreMedio)} />
            <Metrica label="Chiusura (mediana)" valore={fmtDurata(tChiusura)} />
          </div>
        )}
      </Blocco>

      {/* Blog */}
      {righeBlog.length > 0 && (
        <Blocco titolo="Blog">
          <Tabella
            intestazioni={["Articolo", "Visite", "Permanenza (stima)", "Click strumenti"]}
            righe={righeBlog.slice(0, 20).map((r) => [
              r.pagina.replace("/blog/", ""),
              fmtNum(r.visite),
              fmtDurata(r.permanenzaMediana),
              fmtNum(r.clickStrumenti),
            ])}
          />
        </Blocco>
      )}

      <p className="mt-8 text-xs text-testo-chiaro/45">
        Confronto col periodo precedente di pari durata · conta solo traffico prod · misurazioni
        first-party senza cookie né IP.
      </p>
    </div>
  );
}

// ————————————————————————————————— Presentazione —————————————————————————————————

function Intestazione({ giorni }: { giorni: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-2xl font-semibold">Analytics</h1>
      <div className="flex gap-1.5">
        {PERIODI.map((g) => (
          <Link
            key={g}
            href={`/app/analytics?g=${g}`}
            className={`rounded-full px-3 py-1.5 text-sm ${
              g === giorni ? "bg-nero text-testo-scuro" : "bg-nero/5 text-testo-chiaro/70 hover:bg-nero/10"
            }`}
          >
            {g} gg
          </Link>
        ))}
      </div>
    </div>
  );
}

function Blocco({ titolo, children }: { titolo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold">{titolo}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Vuoto() {
  return (
    <p className="rounded-2xl border border-dashed border-nero/15 bg-carta p-8 text-center text-sm text-testo-chiaro/50">
      Ancora nessun dato in questo periodo.
    </p>
  );
}

function Metrica({
  label,
  valore,
  delta: d,
  accento,
}: {
  label: string;
  valore: string;
  delta?: number | null;
  accento?: boolean;
}) {
  const dl = fmtDelta(d ?? null);
  const colore = dl.segno === "su" ? "text-emerald-600" : dl.segno === "giu" ? "text-red-500" : "text-testo-chiaro/40";
  return (
    <div className={`rounded-2xl border p-4 ${accento ? "border-oro/30 bg-oro/5" : "border-nero/10 bg-carta"}`}>
      <p className="text-xs text-testo-chiaro/50">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular">{valore}</p>
      {d !== undefined && <p className={`mt-0.5 text-xs ${colore}`}>{dl.testo}</p>}
    </div>
  );
}

function Dropoff({ righe }: { righe: { id: string; label: string; sessioni: number; pct: number | null }[] }) {
  return (
    <div className="mt-3 space-y-1.5">
      {righe.map((r) => {
        const pct = r.pct == null ? 0 : Math.round(r.pct * 100);
        return (
          <div key={r.id} className="flex items-center gap-3">
            <span className="w-40 shrink-0 truncate text-sm text-testo-chiaro/70">{r.label}</span>
            <div className="h-5 flex-1 overflow-hidden rounded-full bg-nero/5">
              <div
                className="h-full rounded-full bg-oro"
                style={{ width: `${Math.max(pct, r.sessioni > 0 ? 3 : 0)}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-xs tabular text-testo-chiaro/60">{fmtPct(r.pct)}</span>
          </div>
        );
      })}
    </div>
  );
}

function BarraSemplice({ label, valore, pct }: { label: string; valore: number; pct: number | null }) {
  const p = pct == null ? 0 : Math.round(pct * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-sm text-testo-chiaro/70">{label}</span>
      <div className="h-5 flex-1 overflow-hidden rounded-full bg-nero/5">
        <div className="h-full rounded-full bg-oro/70" style={{ width: `${Math.max(p, valore > 0 ? 3 : 0)}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right text-xs tabular text-testo-chiaro/60">{fmtNum(valore)}</span>
    </div>
  );
}

function Funnel({ stages }: { stages: { label: string; n: number }[] }) {
  const max = stages[0]?.n || 1;
  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const pct = max > 0 ? Math.max(4, Math.round((s.n / max) * 100)) : 0;
        const tassoPrec = i === 0 ? null : tasso(s.n, stages[i - 1].n);
        return (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-sm text-testo-chiaro/70">{s.label}</span>
            <div className="h-7 flex-1 overflow-hidden rounded-lg bg-nero/5">
              <div
                className="flex h-full items-center justify-end rounded-lg bg-nero px-2 text-xs font-medium text-testo-scuro"
                style={{ width: `${pct}%` }}
              >
                {fmtNum(s.n)}
              </div>
            </div>
            <span className="w-14 shrink-0 text-right text-xs tabular text-testo-chiaro/50">
              {i === 0 ? "100%" : fmtPct(tassoPrec)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Tabella({
  intestazioni,
  righe,
  vuota,
}: {
  intestazioni: string[];
  righe: (string | number)[][];
  vuota?: boolean;
}) {
  if (vuota || righe.length === 0) {
    return (
      <p className="mt-3 rounded-xl border border-dashed border-nero/15 bg-carta p-5 text-center text-sm text-testo-chiaro/50">
        Ancora nessun dato in questo periodo.
      </p>
    );
  }
  return (
    <div className="mt-3 overflow-x-auto rounded-2xl border border-nero/10 bg-carta">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-nero/10 text-left text-xs uppercase tracking-wide text-testo-chiaro/45">
            {intestazioni.map((h, i) => (
              <th key={h} className={`p-3 font-medium ${i > 0 ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {righe.map((r, i) => (
            <tr key={i} className="border-b border-nero/5 last:border-0">
              {r.map((c, j) => (
                <td key={j} className={`p-3 ${j > 0 ? "tabular text-right text-testo-chiaro/70" : "font-medium"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
