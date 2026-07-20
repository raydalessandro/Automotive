// Unica fonte della navigazione (§6 spec Header). Alimenta header desktop,
// dropdown "Per la tua attività" e mappa mobile. Nessuna voce duplicata a mano.

export type IconaAttivitaId = "valigetta" | "chiave" | "palazzo";

export type NavVoce = {
  href: string;
  label: string;
  nota?: string;
  icona?: IconaAttivitaId;
};

// Le tre landing di segmento. One-liner condivisi tra dropdown desktop e mappa mobile.
export const ATTIVITA: NavVoce[] = [
  { href: "/agenti", label: "Agenti e rappresentanti", nota: "Deduci l'80%, IVA al 100%", icona: "valigetta" },
  { href: "/artigiani", label: "Artigiani e installatori", nota: "Veicoli N1: deducibile al 100%", icona: "chiave" },
  { href: "/aziende", label: "Aziende e flotte", nota: "Flotte operative e fringe benefit", icona: "palazzo" },
];

/** Href su cui il trigger "Per la tua attività" risulta attivo. */
export const HREF_ATTIVITA: string[] = ATTIVITA.map((v) => v.href);

// Nav principale desktop (§1). Il Calcolatore NON sta nell'header.
export type VoceLink = { href: string; label: string };
export type VoceDropdown = { label: string; dropdown: "attivita" };
export type NavPrincipaleVoce = VoceLink | VoceDropdown;

export const NAV_PRINCIPALE: NavPrincipaleVoce[] = [
  { href: "/consulente", label: "Trova la soluzione" },
  { href: "/veicoli", label: "Veicoli" },
  { label: "Per la tua attività", dropdown: "attivita" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/blog", label: "Blog" },
];

export function isDropdown(v: NavPrincipaleVoce): v is VoceDropdown {
  return "dropdown" in v;
}

// Voce hero della mappa mobile (§3.1): il consulente in testa.
export const HERO_MOBILE: NavVoce = {
  href: "/consulente",
  label: "Trova la soluzione",
  nota: "5 domande, 60 secondi, senza lasciare contatti.",
};

// Gruppi della mappa mobile (§3), nell'ordine esatto. La mappa è piatta: tutto visibile.
export type GruppoNav = { etichetta: string; voci: NavVoce[] };

export const MAPPA_MOBILE: GruppoNav[] = [
  { etichetta: "Per la tua attività", voci: ATTIVITA },
  {
    etichetta: "Strumenti",
    voci: [
      { href: "/veicoli", label: "Veicoli", nota: "Il listino, con i canoni chiari" },
      { href: "/calcolatore", label: "Calcolatore", nota: "Il costo reale sul tuo regime fiscale" },
      { href: "/configuratore", label: "Configuratore", nota: "Coperture e rischi: decidi tu" },
    ],
  },
  {
    etichetta: "Conoscerci",
    voci: [
      { href: "/chi-siamo", label: "Chi siamo", nota: "Le persone che ti richiamano" },
      { href: "/blog", label: "Blog", nota: "Guide pratiche, numeri veri" },
      { href: "/contatti", label: "Contatti", nota: "Telefono, WhatsApp, email" },
    ],
  },
];
