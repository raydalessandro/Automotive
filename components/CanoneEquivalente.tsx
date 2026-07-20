import { canoneEquivalenteMostrato } from "@/lib/catalogo";
import { euro } from "@/lib/format";

// "≈ N €/mese effettivi (anticipo incluso)" — §Anticipo zero. Mostrato solo con
// anticipo > 0. Applichiamo a noi il criterio: il numero giusto per confrontare.
export function CanoneEquivalente({
  canone,
  anticipo,
  durata,
  className = "",
}: {
  canone: number;
  anticipo: number;
  durata: number;
  className?: string;
}) {
  const eq = canoneEquivalenteMostrato({
    canone_mese_iva_esclusa: canone,
    anticipo_iva_esclusa: anticipo,
    durata_mesi: durata,
  });
  if (eq == null) return null;
  return (
    <p
      className={`text-sm text-testo-chiaro/60 ${className}`}
      title="Canone più anticipo spalmato sulla durata: il numero giusto per confrontare offerte diverse."
    >
      ≈ <span className="font-semibold text-testo-chiaro">{euro(eq)}</span>/mese effettivi{" "}
      <span className="text-testo-chiaro/45">(anticipo incluso)</span>
    </p>
  );
}
