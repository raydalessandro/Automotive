import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { ConfigMancante } from "@/components/dashboard/ConfigMancante";
import { AziendeTavola } from "@/components/dashboard/AziendeTavola";
import type { Azienda } from "@/lib/aziende/schema";

export const dynamic = "force-dynamic";

export default async function AziendePage() {
  if (!supabaseConfigurato()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Aziende</h1>
        <div className="mt-6">
          <ConfigMancante />
        </div>
      </div>
    );
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("aziende")
    .select("*")
    .order("creato_il", { ascending: false })
    .limit(1000);

  return <AziendeTavola aziende={(data ?? []) as Azienda[]} />;
}
