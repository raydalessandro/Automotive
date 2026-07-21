import type { NextRequest } from "next/server";
import { aggiornaSessione } from "@/lib/supabase/middleware";

// Protegge /app/* (operatore) e /vendita/* (venditori). Il sito pubblico non passa.
export async function middleware(request: NextRequest) {
  return aggiornaSessione(request);
}

export const config = {
  matcher: ["/app/:path*", "/vendita/:path*"],
};
