import Link from "next/link";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { ConfigMancante } from "@/components/dashboard/ConfigMancante";
import { SEGMENTI } from "@/lib/aziende/schema";
import { LABEL_STATO_CAMPAGNA, type Campagna, type StatoCampagna } from "@/lib/campagne/schema";
import { creaCampagna } from "./actions";

export const dynamic = "force-dynamic";

export default async function CampagnePage() {
  if (!supabaseConfigurato()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Campagne</h1>
        <div className="mt-6">
          <ConfigMancante />
        </div>
      </div>
    );
  }

  const supabase = createClient();
  const { data } = await supabase.from("campagne").select("*").order("creato_il", { ascending: false });
  const campagne = (data ?? []) as Campagna[];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Campagne</h1>

      {!process.env.MAIL_FROM && (
        <p className="mt-3 rounded-lg bg-oro/10 px-4 py-2 text-sm text-testo-chiaro/70">
          Dominio d'invio non configurato: puoi creare campagne e accodare invii, ma le campagne
          restano in bozza finché non imposti <code className="rounded bg-nero/5 px-1">MAIL_FROM</code>.
        </p>
      )}

      {/* Nuova campagna */}
      <form action={creaCampagna} className="mt-5 rounded-2xl border border-nero/10 bg-carta p-5">
        <p className="font-medium">Nuova campagna</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input name="nome" required placeholder="Nome campagna" className="rounded-lg border border-nero/15 px-3 py-2 text-sm focus:border-oro focus:outline-none" />
          <select name="segmento" className="rounded-lg border border-nero/15 bg-carta px-3 py-2 text-sm">
            {SEGMENTI.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-oro mt-3 px-4 py-2 text-sm">
          Crea e modifica
        </button>
      </form>

      {/* Lista */}
      <div className="mt-6">
        {campagne.length === 0 ? (
          <p className="text-sm text-testo-chiaro/55">Ancora nessuna campagna.</p>
        ) : (
          <ul className="divide-y divide-nero/10 overflow-hidden rounded-2xl border border-nero/10 bg-carta">
            {campagne.map((c) => (
              <li key={c.id}>
                <Link href={`/app/campagne/${c.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-avorio/60">
                  <div>
                    <p className="font-medium">{c.nome}</p>
                    <p className="text-xs text-testo-chiaro/55">
                      {c.segmento} · tetto {c.tetto_giornaliero}/gg
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statoClasse(c.stato)}`}>
                    {LABEL_STATO_CAMPAGNA[c.stato]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function statoClasse(s: StatoCampagna): string {
  if (s === "attiva") return "bg-oro/15 text-oro";
  if (s === "completata") return "bg-nero/10 text-testo-chiaro/60";
  return "bg-nero/5 text-testo-chiaro/60";
}
