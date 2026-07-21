// Calcolatore parametrico (§PR-5): mappa i parametri del deep-link condiviso dal
// venditore (?forma = FORME_GIURIDICHE · ?veicolo = n1|auto) sul profilo fiscale.
// Pura e testata. Parametro assente o non valido → undefined = fallback identico a
// oggi (il Calcolatore usa il suo profilo di default).

import type { ProfiloId } from "@/lib/fiscale.config";

export function profiloDaParametri(
  forma?: string | null,
  veicolo?: string | null,
): ProfiloId | undefined {
  // Un veicolo commerciale N1 strumentale ha il suo regime, a prescindere dalla forma.
  if (veicolo === "n1") return "n1_strumentale";

  switch (forma) {
    case "forfettario":
      return "forfettario";
    case "ditta_individuale":
      return "ditta_individuale";
    case "agente":
      return "agente_rappresentante";
    case "snc_sas":
    case "srl_spa":
      return "srl_ordinaria";
    default:
      // "altro", valore non valido o assente → nessun override.
      return undefined;
  }
}
