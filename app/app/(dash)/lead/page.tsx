import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { InboxLead } from "@/components/dashboard/InboxLead";
import { ConfigMancante } from "@/components/dashboard/ConfigMancante";
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

export default async function LeadPage({
  searchParams,
}: {
  searchParams: { stato?: string; apri?: string };
}) {
  const leads = await caricaLeads();

  if (!leads) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Inbox lead</h1>
        <div className="mt-6">
          <ConfigMancante />
        </div>
      </div>
    );
  }

  const statoIniziale =
    searchParams.stato && STATI_LEAD.includes(searchParams.stato as StatoLead)
      ? (searchParams.stato as StatoLead)
      : "tutti";

  return <InboxLead iniziali={leads} statoIniziale={statoIniziale} apriIniziale={searchParams.apri} />;
}
