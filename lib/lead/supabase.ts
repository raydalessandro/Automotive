import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client Supabase server-side con service role (§6.1). Solo lato server.
// Se le env non sono configurate, ritorna null: l'API gestisce il fallback.

let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    cached = null;
    return null;
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
