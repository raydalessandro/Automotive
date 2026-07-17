import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client service-role: bypassa RLS. SOLO lato server (API route, cron).
// Usato per gli insert pubblici (form preventivo, eventi) e per il motore d'invio.
let cached: SupabaseClient | null | undefined;

export function getAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
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
