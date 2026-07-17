import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { ConfigMancante } from "@/components/dashboard/ConfigMancante";
import { CampagnaEditor } from "@/components/dashboard/CampagnaEditor";
import { AndamentoInvii, type RigaInvio } from "@/components/dashboard/AndamentoInvii";
import type { Campagna } from "@/lib/campagne/schema";

export const dynamic = "force-dynamic";

export default async function CampagnaPage({ params }: { params: { id: string } }) {
  if (!supabaseConfigurato()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Campagna</h1>
        <div className="mt-6">
          <ConfigMancante />
        </div>
      </div>
    );
  }

  const supabase = createClient();
  const { data: campagna } = await supabase.from("campagne").select("*").eq("id", params.id).single();
  if (!campagna) notFound();
  const c = campagna as Campagna;

  // Azienda campione del segmento per l'anteprima.
  const { data: sampleData } = await supabase
    .from("aziende")
    .select("ragione_sociale, citta, provincia, settore, segmento")
    .eq("segmento", c.segmento)
    .limit(1)
    .maybeSingle();
  const sample = sampleData ?? {
    ragione_sociale: "Azienda Esempio SRL",
    citta: "Milano",
    provincia: "MI",
    settore: "edilizia",
    segmento: c.segmento,
  };

  // Invii + conteggi.
  const { data: inviiData } = await supabase
    .from("invii")
    .select("id, azienda_id, esito, inviato_il, errore, aziende(ragione_sociale)")
    .eq("campagna_id", params.id)
    .order("pianificato_il", { ascending: true })
    .limit(500);

  const invii = (inviiData ?? []) as unknown as {
    id: string;
    azienda_id: string;
    esito: string;
    inviato_il: string | null;
    errore: string | null;
    aziende: { ragione_sociale: string } | null;
  }[];

  const conteggi: Record<string, number> = {};
  for (const i of invii) conteggi[i.esito] = (conteggi[i.esito] ?? 0) + 1;

  const righe: RigaInvio[] = invii.slice(0, 100).map((i) => ({
    id: i.id,
    azienda_id: i.azienda_id,
    ragione_sociale: i.aziende?.ragione_sociale ?? "—",
    esito: i.esito,
    inviato_il: i.inviato_il,
    errore: i.errore,
  }));

  return (
    <div>
      <nav className="mb-4 text-sm text-testo-chiaro/50">
        <Link href="/app/campagne" className="hover:text-oro">
          Campagne
        </Link>{" "}
        / <span className="text-testo-chiaro/70">{c.nome}</span>
      </nav>

      <CampagnaEditor campagna={c} sample={sample} />

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Andamento invii</h2>
        <div className="mt-4">
          <AndamentoInvii campagnaId={c.id} conteggi={conteggi} righe={righe} />
        </div>
      </section>
    </div>
  );
}
