import Link from "next/link";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { ConfigMancante } from "@/components/dashboard/ConfigMancante";
import { LABEL_STATO_LEAD, type Lead } from "@/lib/dashboard/tipi";

export const dynamic = "force-dynamic";

type Dati = {
  nuovi: number;
  daRichiamare: number;
  inviiOggi: number;
  ultimi: Lead[];
};

async function caricaOggi(): Promise<Dati | null> {
  if (!supabaseConfigurato()) return null;
  const supabase = createClient();

  const oggiInizio = new Date();
  oggiInizio.setHours(0, 0, 0, 0);
  const domaniInizio = new Date(oggiInizio);
  domaniInizio.setDate(domaniInizio.getDate() + 1);

  try {
    const [nuovi, daRichiamare, inviiOggi, ultimi] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("stato", "nuovo"),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .lt("richiamare_il", domaniInizio.toISOString())
        .not("richiamare_il", "is", null)
        .not("stato", "in", "(chiuso,perso)"),
      supabase
        .from("invii")
        .select("id", { count: "exact", head: true })
        .gte("inviato_il", oggiInizio.toISOString())
        .eq("esito", "inviata"),
      supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (nuovi.error || ultimi.error) return null;

    return {
      nuovi: nuovi.count ?? 0,
      daRichiamare: daRichiamare.count ?? 0,
      inviiOggi: inviiOggi.count ?? 0,
      ultimi: (ultimi.data ?? []) as Lead[],
    };
  } catch {
    return null;
  }
}

export default async function OggiPage() {
  const dati = await caricaOggi();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Oggi</h1>

      {!dati ? (
        <div className="mt-6">
          <ConfigMancante />
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Lead nuovi" valore={dati.nuovi} href="/app/lead?stato=nuovo" accento />
            <StatCard label="Da richiamare" valore={dati.daRichiamare} href="/app/lead" />
            <StatCard label="Invii oggi" valore={dati.inviiOggi} href="/app/campagne" />
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Ultimi lead</h2>
              <Link href="/app/lead" className="text-sm text-oro hover:underline">
                Tutti →
              </Link>
            </div>
            {dati.ultimi.length === 0 ? (
              <p className="mt-3 text-sm text-testo-chiaro/55">Ancora nessun lead.</p>
            ) : (
              <ul className="mt-3 divide-y divide-nero/10 rounded-2xl border border-nero/10 bg-carta">
                {dati.ultimi.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/app/lead?apri=${l.id}`}
                      className="flex items-center justify-between gap-3 p-4 hover:bg-avorio/60"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {l.ragione_sociale}
                          {l.score != null && l.score >= 3 && (
                            <span className="ml-2 rounded-full bg-oro/15 px-2 py-0.5 text-xs font-semibold text-oro">
                              HOT
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-testo-chiaro/55">
                          {l.provincia} · {l.telefono} · {LABEL_STATO_LEAD[l.stato] ?? l.stato}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-testo-chiaro/45">
                        {new Date(l.created_at).toLocaleDateString("it-IT")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/app/lead" className="btn-scuro">
              Vai all'inbox lead
            </Link>
            <Link href="/app/aziende" className="btn-ghost">
              Aziende
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
