// ============================================================================
// CONFIGURATORE "NESSUNA SORPRESA" — §1 della spec configuratore.
// Tutto il contenuto (testi, prezzi, flag) vive QUI, come fiscale.config.ts.
// Nessun prezzo inventato: dove non abbiamo il numero, prezzo_mese: null →
// la UI mostra "su preventivo". I prezzi arrivano dalla piattaforma del fornitore.
//
// TODO piattaforma: valorizzare i prezzi reali dei servizi.
// ============================================================================

export type Segmento = "artigiani" | "agenti" | "pmi" | "forfettari";

export type Rischio = {
  id: string;
  titolo: string;
  icona: string | null; // id di IconaServizio, o null
  scoperto: {
    racconto: string; // scenario concreto in 2ª persona, tono onesto
    costo_tipico: string; // testo, MAI numeri finti
    fermo_attivita: string | null; // impatto sulla continuità
  };
  copertura: {
    nome: string;
    prezzo_mese: number | null; // null → "su preventivo"
    incluso_base: boolean; // già nel canone: coperto, non deselezionabile
    nota: string | null;
  };
  segmenti_consigliati: Segmento[];
  default_on: boolean;
};

// Km: slider a scaglioni. Il canone varia con i km ma NON lo pubblichiamo finché
// non arriva scritto: mostrato come "confermato nel preventivo".
export const KM_SCAGLIONI = [10000, 20000, 30000] as const;
export const KM_DEFAULT = 20000;

// Durata configurabile (allineata al catalogo, §5: rimosso il 60).
export const DURATE_CONFIG = [12, 24, 36, 48] as const;
export const DURATA_DEFAULT = 48;

export const RISCHI: Rischio[] = [
  {
    id: "rca_bollo",
    titolo: "RCA e bollo",
    icona: "bollo",
    scoperto: {
      racconto:
        "In proprietà l'assicurazione la rinnovi ogni anno e il bollo lo paghi tu, con scadenze da ricordare.",
      costo_tipico: "premio RCA annuo + bollo, a tuo carico",
      fermo_attivita: null,
    },
    copertura: {
      nome: "RCA e bollo inclusi",
      prezzo_mese: null,
      incluso_base: true,
      nota: "Già nel canone: nessuna scadenza da gestire.",
    },
    segmenti_consigliati: ["artigiani", "agenti", "pmi", "forfettari"],
    default_on: true,
  },
  {
    id: "manutenzione",
    titolo: "Manutenzione",
    icona: "manutenzione",
    scoperto: {
      racconto:
        "Tagliandi, guasti e usura: in proprietà è tutto a sorpresa, quando capita e quanto costa.",
      costo_tipico: "tagliandi e riparazioni a preventivo, imprevedibili",
      fermo_attivita: "un guasto non gestito può fermarti per giorni",
    },
    copertura: {
      nome: "Manutenzione ordinaria e straordinaria inclusa",
      prezzo_mese: null,
      incluso_base: true,
      nota: "Già nel canone: officina convenzionata, zero preventivi.",
    },
    segmenti_consigliati: ["artigiani", "agenti", "pmi", "forfettari"],
    default_on: true,
  },
  {
    id: "soccorso",
    titolo: "Soccorso stradale",
    icona: "assistenza",
    scoperto: {
      racconto:
        "Ti fermi in strada lontano da casa: senza assistenza chiami tu, paghi tu il carroattrezzi e aspetti.",
      costo_tipico: "traino e intervento a tuo carico, ovunque ti trovi",
      fermo_attivita: "ore perse sul ciglio della strada",
    },
    copertura: {
      nome: "Soccorso stradale incluso",
      prezzo_mese: null,
      incluso_base: true,
      nota: "Già nel canone: assistenza attiva ovunque.",
    },
    segmenti_consigliati: ["artigiani", "agenti", "pmi", "forfettari"],
    default_on: true,
  },
  {
    id: "danni",
    titolo: "Danni al veicolo",
    icona: "assicurazione",
    scoperto: {
      racconto:
        "Una manovra sbagliata, una grandinata, un urto in parcheggio: senza kasko i danni li paghi tu, per intero.",
      costo_tipico: "riparazioni e franchigie anche di migliaia di euro a tuo carico",
      fermo_attivita: "il mezzo può restare in carrozzeria mentre il lavoro aspetta",
    },
    copertura: {
      nome: "Kasko completa",
      prezzo_mese: null,
      incluso_base: false,
      nota: "Copre i danni al veicolo, anche in colpa.",
    },
    segmenti_consigliati: ["artigiani", "agenti", "pmi"],
    default_on: false,
  },
  {
    id: "cristalli",
    titolo: "Cristalli",
    icona: "cristallo",
    scoperto: {
      racconto:
        "Un sasso in autostrada e il parabrezza si scheggia: va sostituito, e non è economico.",
      costo_tipico: "sostituzione parabrezza a tuo carico",
      fermo_attivita: "mezzo fermo il tempo della sostituzione",
    },
    copertura: {
      nome: "Copertura cristalli",
      prezzo_mese: null,
      incluso_base: false,
      nota: "Riparazione o sostituzione di parabrezza e cristalli.",
    },
    segmenti_consigliati: ["artigiani", "agenti", "pmi", "forfettari"],
    default_on: false,
  },
  {
    id: "furto_incendio",
    titolo: "Furto e incendio",
    icona: null,
    scoperto: {
      racconto:
        "Il veicolo viene rubato o va a fuoco: senza copertura resti senza mezzo e senza rimborso.",
      costo_tipico: "perdita del veicolo a tuo carico",
      fermo_attivita: "attività ferma finché non trovi un'alternativa",
    },
    copertura: {
      nome: "Furto e incendio",
      prezzo_mese: null,
      incluso_base: false,
      // [APERTO §6]: se incluso o no. v1 come voce con nota prudente.
      nota: "Verifichiamo nel preventivo se è già inclusa o attivabile a parte.",
    },
    segmenti_consigliati: ["artigiani", "agenti", "pmi"],
    default_on: false,
  },
  {
    id: "gomme_extra",
    titolo: "Gomme",
    icona: "pneumatici",
    scoperto: {
      racconto:
        "Chi macina chilometri consuma più di un treno di gomme: oltre il primo, in proprietà li paghi tu.",
      costo_tipico: "treni di gomme aggiuntivi a tuo carico",
      fermo_attivita: null,
    },
    copertura: {
      nome: "Treni gomme aggiuntivi",
      prezzo_mese: null,
      incluso_base: false,
      nota: "Il primo treno è già incluso. Gli extra per chi fa tanti km.",
    },
    segmenti_consigliati: ["agenti", "pmi"],
    default_on: false,
  },
  {
    id: "auto_sostitutiva",
    titolo: "Auto sostitutiva",
    icona: "sostitutiva",
    scoperto: {
      racconto:
        "Il mezzo è in officina per giorni: senza sostitutiva, quei giorni la tua attività si ferma.",
      costo_tipico: "noleggio di un'auto in emergenza, ai prezzi del momento",
      fermo_attivita: "ogni giorno di fermo è lavoro e fatturato che non recuperi",
    },
    copertura: {
      nome: "Auto sostitutiva",
      prezzo_mese: null,
      incluso_base: false,
      nota: "Un mezzo pronto quando il tuo è fermo: l'attività non si ferma.",
    },
    segmenti_consigliati: ["artigiani", "agenti", "pmi"],
    default_on: false,
  },
  {
    id: "altri_servizi",
    titolo: "Altri servizi",
    icona: null,
    scoperto: {
      racconto:
        "Gestione multe, conducenti aggiuntivi, esigenze particolari: dettagli che senza un referente diventano tempo perso.",
      costo_tipico: "gestione a tuo carico, caso per caso",
      fermo_attivita: null,
    },
    copertura: {
      nome: "Gestione multe, conducenti aggiuntivi e altro",
      prezzo_mese: null,
      incluso_base: false,
      nota: "Dicci cosa ti serve nel form: lo valutiamo nel preventivo.",
    },
    segmenti_consigliati: ["pmi", "agenti"],
    default_on: false,
  },
];

export function rischioById(id: string): Rischio | undefined {
  return RISCHI.find((r) => r.id === id);
}

// Configurazione allegata al lead (§3). Campi opzionali: arriva da zod/jsonb.
export type Configurazione = {
  veicolo_id?: string | null;
  durata?: number;
  km_anno?: number;
  servizi_scelti?: string[];
  servizi_interesse?: string[];
  rischi_accettati?: string[];
  rata_configurata?: number;
};

/** Mappa una lista di id-rischio nei loro titoli leggibili. */
export function titoliRischi(ids: string[]): string[] {
  return ids.map((id) => rischioById(id)?.titolo ?? id);
}
