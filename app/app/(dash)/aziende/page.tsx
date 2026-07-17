import { InCostruzione } from "@/components/dashboard/InCostruzione";

export const dynamic = "force-dynamic";

export default function AziendePage() {
  return (
    <InCostruzione
      titolo="Aziende"
      nota="Tabella con filtri, import CSV/JSON con dedup e guardrail PEC, edit inline — PR10."
    />
  );
}
