import type { NextRequest } from "next/server";
import { aggiornaSessione } from "@/lib/supabase/middleware";

// Protegge solo /app/*. Il sito pubblico non passa dal middleware.
export async function middleware(request: NextRequest) {
  return aggiornaSessione(request);
}

export const config = {
  matcher: ["/app/:path*"],
};
