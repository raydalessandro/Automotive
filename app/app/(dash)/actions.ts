"use server";

import { redirect } from "next/navigation";
import { createClient, supabaseConfigurato } from "@/lib/supabase/server";

export async function logout() {
  if (supabaseConfigurato()) {
    const supabase = createClient();
    await supabase.auth.signOut();
  }
  redirect("/app/login");
}
