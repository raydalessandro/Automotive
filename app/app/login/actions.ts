"use server";

import { redirect } from "next/navigation";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";

export type StatoLogin = { error?: string };

export async function login(_prev: StatoLogin, formData: FormData): Promise<StatoLogin> {
  if (!supabaseConfigurato()) {
    return { error: "Supabase non è ancora configurato su questo ambiente." };
  }
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/app");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Email o password non corretti." };
  }
  redirect(next.startsWith("/app") ? next : "/app");
}
