import { createClient, supabaseConfigurato } from "@/lib/supabase/server";
import { DashNav } from "@/components/dashboard/DashNav";

export const metadata = {
  title: "Casa Base",
  robots: { index: false, follow: false },
};

// Shell autenticata. Il middleware garantisce già la sessione; qui leggiamo l'email per la nav.
export default async function DashLayout({ children }: { children: React.ReactNode }) {
  let email: string | null = null;
  if (supabaseConfigurato()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  }

  return (
    <div className="min-h-screen bg-avorio">
      <DashNav email={email} />
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
