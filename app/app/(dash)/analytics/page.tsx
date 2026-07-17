import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { ConfigMancante } from "@/components/dashboard/ConfigMancante";
import { StatCard } from "@/components/dashboard/StatCard";
import { veicoloById, titoloVeicolo } from "@/lib/catalogo";
import { PROFILI } from "@/lib/fiscale.config";
import type { TipoEvento } from "@/lib/eventi/schema";
import Link from "next/link";

export const dynamic = "force-dynamic";

type EventoRow = {
  tipo: TipoEvento;
  sessione: string;
  pagina: string | null;
  veicolo_id: string | null;
  profilo_fiscale: string | null;
  fonte: { utm_source?: string } | null;
};

const PERIODI = [7, 30, 90] as const;
const LIMITE = 20000;

function classifica(map: Map<string, number>, n = 6): [string, number][] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function conta<T>(rows: T[], key: (r: T) => string | null | undefined): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    if (!k) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

export default async function AnalyticsPage({ searchParams }: { searchParams: { g?: string } }) {
  if (!supabaseConfigurato()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <div className="mt-6">
          <ConfigMancante />
        </div>
      </div>
    );
  }

  const giorni = PERIODI.includes(Number(searchParams.g) as (typeof PERIODI)[number])
    ? Number(searchParams.g)
    : 30;
  const da = new Date(Date.now() - giorni * 86400000).toISOString();

  const supabase = createClient();
  const [eventiRes, leadRes] = await Promise.all([
    supabase
      .from("eventi")
      .select("tipo, sessione, pagina, veicolo_id, profilo_fiscale, fonte")
      .gte("ts", da)
      .limit(LIMITE),
    supabase.from("leads").select("fonte, created_at").gte("created_at", da),
  ]);

  const eventi = (eventiRes.data ?? []) as EventoRow[];
  const leads = (leadRes.data ?? []) as { fonte: { utm_source?: string } | null }[];

  const sessioni = new Set(eventi.map((e) => e.sessione));
  const sessCalc = new Set(eventi.filter((e) => e.tipo === "calcolatore_usato").map((e) => e.sessione));
  const sessPrev = new Set(eventi.filter((e) => e.tipo === "preventivo_inviato").map((e) => e.sessione));

  const pagineTop = classifica(conta(eventi.filter((e) => e.tipo === "pagina_vista"), (e) => e.pagina));
  const veicoliTop = classifica(conta(eventi.filter((e) => e.tipo === "veicolo_visto"), (e) => e.veicolo_id));
  const profili = classifica(conta(eventi.filter((e) => e.tipo === "calcolatore_usato"), (e) => e.profilo_fiscale));

  const clickTel = eventi.filter((e) => e.tipo === "telefono_click").length;
  const clickWa = eventi.filter((e) => e.tipo === "whatsapp_click").length;
  const clickShare = eventi.filter((e) => e.tipo === "condividi_click").length;

  // Fonti: sessioni per utm_source (dal primo evento con fonte) + lead per fonte.
  const sessPerFonte = new Map<string, Set<string>>();
  for (const e of eventi) {
    const src = e.fonte?.utm_source ?? "diretto";
    if (!sessPerFonte.has(src)) sessPerFonte.set(src, new Set());
    sessPerFonte.get(src)!.add(e.sessione);
  }
  const leadPerFonte = conta(leads, (l) => l.fonte?.utm_source ?? "diretto");
  const fonti = [...sessPerFonte.entries()]
    .map(([src, set]) => ({ src, sessioni: set.size, lead: leadPerFonte.get(src) ?? 0 }))
    .sort((a, b) => b.sessioni - a.sessioni)
    .slice(0, 8);

  const capped = eventi.length >= LIMITE;
  const tasso = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

  return (
    <div>
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

      {capped && (
        <p className="mt-3 rounded-lg bg-oro/10 px-3 py-2 text-xs text-testo-chiaro/60">
          Mostrati i primi {LIMITE.toLocaleString("it-IT")} eventi del periodo.
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Sessioni" valore={sessioni.size} accento />
        <StatCard label="Hanno usato il calcolatore" valore={sessCalc.size} />
        <StatCard label="Preventivi inviati" valore={sessPrev.size} />
        <StatCard label="Click telefono/WhatsApp" valore={clickTel + clickWa} />
      </div>

      {/* Funnel */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Funnel</h2>
        <div className="mt-3 space-y-2">
          <Barra label="Sessioni" valore={sessioni.size} max={sessioni.size} nota="100%" />
          <Barra
            label="→ Calcolatore"
            valore={sessCalc.size}
            max={sessioni.size}
            nota={`${tasso(sessCalc.size, sessioni.size)}%`}
          />
          <Barra
            label="→ Preventivo"
            valore={sessPrev.size}
            max={sessioni.size}
            nota={`${tasso(sessPrev.size, sessioni.size)}%`}
          />
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Elenco titolo="Veicoli più visti" voci={veicoliTop.map(([id, n]) => {
          const v = veicoloById(id);
          return [v ? titoloVeicolo(v) : id, n];
        })} />
        <Elenco titolo="Pagine più viste" voci={pagineTop} />
        <Elenco
          titolo="Profili nel calcolatore"
          voci={profili.map(([p, n]) => {
            const prof = PROFILI[p as keyof typeof PROFILI];
            return [prof?.label ?? p, n];
          })}
        />
        <div className="rounded-2xl border border-nero/10 bg-carta p-5">
          <h3 className="font-display text-base font-semibold">Fonti (sessioni · lead)</h3>
          {fonti.length === 0 ? (
            <p className="mt-3 text-sm text-testo-chiaro/50">Ancora nessun dato.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {fonti.map((f) => (
                <li key={f.src} className="flex items-center justify-between gap-3">
                  <span className="truncate capitalize">{f.src}</span>
                  <span className="tabular shrink-0 text-testo-chiaro/60">
                    {f.sessioni} · <span className="font-medium text-oro">{f.lead} lead</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-testo-chiaro/45">
        Click: telefono {clickTel} · WhatsApp {clickWa} · condividi {clickShare}. Analytics
        first-party, senza cookie né IP.
      </p>
    </div>
  );
}

function Barra({ label, valore, max, nota }: { label: string; valore: number; max: number; nota: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((valore / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-sm text-testo-chiaro/70">{label}</span>
      <div className="h-6 flex-1 overflow-hidden rounded-full bg-nero/5">
        <div className="flex h-full items-center justify-end rounded-full bg-oro px-2 text-xs font-medium text-nero" style={{ width: `${pct}%` }}>
          {valore}
        </div>
      </div>
      <span className="w-12 shrink-0 text-right text-xs text-testo-chiaro/50">{nota}</span>
    </div>
  );
}

function Elenco({ titolo, voci }: { titolo: string; voci: [string, number][] }) {
  return (
    <div className="rounded-2xl border border-nero/10 bg-carta p-5">
      <h3 className="font-display text-base font-semibold">{titolo}</h3>
      {voci.length === 0 ? (
        <p className="mt-3 text-sm text-testo-chiaro/50">Ancora nessun dato.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {voci.map(([label, n]) => (
            <li key={label} className="flex items-center justify-between gap-3">
              <span className="truncate">{label}</span>
              <span className="tabular shrink-0 font-medium text-testo-chiaro/60">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
