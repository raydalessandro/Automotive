import { InCostruzione } from "@/components/dashboard/InCostruzione";

export const dynamic = "force-dynamic";

export default function CampagnePage() {
  return (
    <InCostruzione
      titolo="Campagne"
      nota="Editor con segnaposto e anteprima, accodamento con tetti, motore d'invio cron — PR10/PR11."
    />
  );
}
