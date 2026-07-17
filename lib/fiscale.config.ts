// ============================================================================
// MODELLO FISCALE — §3 della spec.
// Tutta la matematica fiscale vive QUI. Un check col commercialista aggiorna
// questo file, non il sito. Ogni costante ha commento con fonte/data.
//
// TODO: validare tutte le costanti con il commercialista prima del go-live.
// ============================================================================

/** IVA ordinaria. Fonte: aliquota ordinaria IT. */
export const IVA = 0.22;

/**
 * Stima quota locazione vs servizi nel canone full-service.
 * Il tetto di deducibilità si applica alla sola quota noleggio.
 * TODO: chiedere lo split reale al fornitore NLT.
 */
export const SPLIT_QUOTA_NOLEGGIO = 0.7;

export type AliquotaPreset = { label: string; valore: number };

// Preset aliquote riutilizzati (scaglioni IRPEF marginali indicativi 2025).
const IRPEF_SCAGLIONI: AliquotaPreset[] = [
  { label: "IRPEF 23%", valore: 0.23 },
  { label: "IRPEF 35%", valore: 0.35 },
  { label: "IRPEF 43%", valore: 0.43 },
];

const IRES_IRAP: AliquotaPreset = { label: "IRES + IRAP", valore: 0.279 };

export type ProfiloDeduzione = {
  tipo: "deduzione";
  label: string;
  descrizione: string;
  deducibilita: number;
  /** Tetto annuo sulla sola quota noleggio; null = nessun tetto. */
  tetto_quota_noleggio_annuo: number | null;
  iva_detraibile: number;
  aliquote_preset: AliquotaPreset[];
  /** Nota qualitativa opzionale mostrata sotto il risultato. */
  nota?: string;
};

export type ProfiloConfronto = {
  tipo: "confronto";
  label: string;
  descrizione: string;
};

export type Profilo = ProfiloDeduzione | ProfiloConfronto;

export const PROFILI = {
  srl_ordinaria: {
    tipo: "deduzione",
    label: "Società (SRL, SPA, SNC, SAS) — uso aziendale",
    descrizione: "Auto aziendale a uso non esclusivamente strumentale.",
    deducibilita: 0.2,
    tetto_quota_noleggio_annuo: 3615.2, // tetto autovetture uso aziendale
    iva_detraibile: 0.4,
    aliquote_preset: [IRES_IRAP],
  },
  ditta_individuale: {
    tipo: "deduzione",
    label: "Ditta individuale / professionista (regime ordinario)",
    descrizione: "Deduzione al 20% con tetto, IVA detraibile al 40%.",
    deducibilita: 0.2,
    tetto_quota_noleggio_annuo: 3615.2,
    iva_detraibile: 0.4,
    aliquote_preset: IRPEF_SCAGLIONI,
  },
  agente_rappresentante: {
    tipo: "deduzione",
    label: "Agente / rappresentante di commercio",
    descrizione: "Deduzione all'80% con tetto maggiorato, IVA detraibile al 100%.",
    deducibilita: 0.8,
    tetto_quota_noleggio_annuo: 5164.57, // tetto maggiorato agenti
    iva_detraibile: 1.0,
    aliquote_preset: IRPEF_SCAGLIONI,
  },
  n1_strumentale: {
    tipo: "deduzione",
    label: "Veicolo commerciale N1 (uso strumentale)",
    descrizione: "Bene strumentale: deduzione 100%, nessun tetto, IVA 100%.",
    deducibilita: 1.0,
    tetto_quota_noleggio_annuo: null,
    iva_detraibile: 1.0,
    aliquote_preset: [IRES_IRAP, ...IRPEF_SCAGLIONI],
  },
  fringe_benefit: {
    tipo: "deduzione",
    label: "Auto assegnata a dipendente (uso promiscuo)",
    descrizione: "Deduzione al 70% per l'azienda; benefit tassato in busta al dipendente.",
    deducibilita: 0.7,
    tetto_quota_noleggio_annuo: null,
    iva_detraibile: 0.4,
    aliquote_preset: [IRES_IRAP],
    // Lato dipendente SOLO messaggio qualitativo (il costo ACI per modello non è nei nostri dati):
    nota:
      "Dal 2025 il valore tassato in busta paga è il 10% (elettrica), 20% (plug-in) o 50% (termica) del costo ACI convenzionale.",
  },
  forfettario: {
    tipo: "confronto",
    label: "Regime forfettario",
    descrizione: "Nessuna deduzione analitica e IVA indetraibile: confronto sul costo reale.",
  },
} as const satisfies Record<string, Profilo>;

export type ProfiloId = keyof typeof PROFILI;

export const PROFILO_DEFAULT: ProfiloId = "srl_ordinaria";
