import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client Supabase server-side legato ai cookie della richiesta (RSC + route handler).
// Usa la anon key: l'accesso ai dati passa dalla sessione utente (RLS authenticated).
export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // chiamato da un Server Component: ignorabile, il refresh avviene nel middleware
        }
      },
    },
  });
}

/** True se le env pubbliche Supabase sono configurate. */
export function supabaseConfigurato(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
