import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresh sessione + protezione route /app/*. Chiamato dal middleware root.
export async function aggiornaSessione(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Senza env Supabase la dashboard non è operativa: lasciamo passare
  // (le pagine /app mostrano lo stato "config mancante"). Il sito pubblico non è coinvolto.
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLogin = path === "/app/login";
  const isVendita = path.startsWith("/vendita");

  // Login condiviso in /app/login (anche per i venditori): il non autenticato ci va.
  if (!user && !isLogin) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/app/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  const vaiA = (pathname: string) => {
    const redirect = request.nextUrl.clone();
    redirect.pathname = pathname;
    redirect.search = "";
    return NextResponse.redirect(redirect);
  };

  if (user) {
    // Ruolo: una riga in `venditori` ⇒ venditore (→ /vendita); altrimenti operatore (→ /app).
    const { data: v } = await supabase.from("venditori").select("id").eq("id", user.id).maybeSingle();
    const isVenditore = Boolean(v);

    if (isLogin) return vaiA(isVenditore ? "/vendita" : "/app");
    // Il venditore non entra in casa base; l'operatore non entra nella PWA venditori.
    if (isVenditore && !isVendita) return vaiA("/vendita");
    if (!isVenditore && isVendita) return vaiA("/app");
  }

  return response;
}
