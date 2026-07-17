import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Utility condivise per i CLI degli strumenti (strumenti/ricerca).

/** Carica le variabili da .env.local (i CLI non passano da Next). */
export function caricaEnvLocal(): void {
  const p = join(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}

/** Client service role da .env.local. Errore chiaro (no crash muto) se manca la config. */
export function clientCli(): SupabaseClient {
  caricaEnvLocal();
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "\n❌ Config mancante. Servono SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local:\n" +
        "   SUPABASE_URL=https://<ref>.supabase.co\n" +
        "   SUPABASE_SERVICE_ROLE_KEY=<service_role key dalla dashboard Supabase>\n",
    );
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Parser minimale di --chiave valore. */
export function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const chiave = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      out[chiave] = val;
    }
  }
  return out;
}
