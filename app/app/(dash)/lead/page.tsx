import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { InboxLead, type AziendaCard } from "@/components/dashboard/InboxLead";
import { ConfigMancante } from "@/components/dashboard/ConfigMancante";
import type { VenditoreOpt } from "@/components/dashboard/SmistaMenu";
import { STATI_LEAD, type Lead, type StatoLead } from "@/lib/dashboard/tipi";

export const dynamic = "force-dynamic";

async function caricaLeads(): Promise<Lead[] | null> {
  if (!supabaseConfigurato()) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return null;
  return (data ?? []) as Lead[];
}

// Venditori attivi per lo smistamento. Se la tabella non è ancora applicata (migration
// 009 al deploy), la query fallisce silenziosamente → lista vuota, UI resiliente.
async function caricaVenditori(): Promise<VenditoreOpt[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("venditori")
    .select("id, nome")
    .eq("attivo", true)
    .order("nome");
  if (error) return [];
  return (data ?? []) as VenditoreOpt[];
}

// Registro target (§PR-10): brand + labels per pill, filtro e renderer. Select MIRATA:
// mai `*`, perché la colonna della chiave è revocata agli authenticated (§015) e la
// romperebbe.
export type TargetInfo = { brand: string | null; labels: Record<string, string> | null };
async function caricaTargets(): Promise<Record<string, TargetInfo>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("registro_target").select("target, brand, labels");
  if (error) return {};
  const map: Record<string, TargetInfo> = {};
  for (const r of (data ?? []) as ({ target: string } & TargetInfo)[]) {
    map[r.target] = { brand: r.brand, labels: r.labels };
  }
  return map;
}

// Mappa aziende (arricchimento card: segmento/settore/score/segnali/città).
async function caricaAziende(): Promise<Record<string, AziendaCard>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("aziende")
    .select("id, ragione_sociale, segmento, settore, score, segnali, citta")
    .limit(2000);
  if (error) return {};
  const map: Record<string, AziendaCard> = {};
  for (const a of (data ?? []) as (AziendaCard & { id: string })[]) map[a.id] = a;
  return map;
}

export default async function LeadPage({
  searchParams,
}: {
  searchParams: { stato?: string; apri?: string; target?: string };
}) {
  const leads = await caricaLeads();

  if (!leads) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Lead</h1>
        <div className="mt-6">
          <ConfigMancante />
        </div>
      </div>
    );
  }

  const [venditori, aziende, targets] = await Promise.all([
    caricaVenditori(),
    caricaAziende(),
    caricaTargets(),
  ]);

  const statoIniziale =
    searchParams.stato && STATI_LEAD.includes(searchParams.stato as StatoLead)
      ? (searchParams.stato as StatoLead)
      : undefined;

  return (
    <InboxLead
      iniziali={leads}
      venditori={venditori}
      aziende={aziende}
      targets={targets}
      statoIniziale={statoIniziale}
      targetIniziale={searchParams.target}
      apriIniziale={searchParams.apri}
    />
  );
}
