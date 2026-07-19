import { z } from "zod";

// Schema blog — SPEC Blog SEO §1. Il repo è il CMS: un articolo = un file MDX in
// contenuti/blog/*.mdx. Questo schema è la fonte di verità per validazione e tipi.

// Cluster editoriali (§2). Lo slug è quello nella URL /blog/categoria/[cat].
export const CATEGORIE_BLOG = [
  { id: "fisco", label: "Fisco e deducibilità" },
  { id: "guide", label: "Guide al noleggio" },
  { id: "flotte", label: "Flotte e PMI" },
  { id: "mestieri", label: "Per mestiere" },
] as const;

export type CategoriaBlog = (typeof CATEGORIE_BLOG)[number]["id"];

// Tuple letterale per lo zod enum (mantiene l'unione tipizzata).
const idsCategoria = CATEGORIE_BLOG.map((c) => c.id) as [CategoriaBlog, ...CategoriaBlog[]];

// Destinazioni ammesse per la CTA di fine articolo (§1). Ogni articolo finisce su
// UNO strumento o UNA landing: la CTA è il punto d'atterraggio della query.
export const CTA_STRUMENTI = {
  calcolatore: {
    href: "/calcolatore",
    occhiello: "Strumento",
    titolo: "Calcola il tuo costo reale",
    testo: "Scopri quanto scarichi davvero con la tua partita IVA, numeri alla mano.",
    azione: "Apri il calcolatore",
  },
  configuratore: {
    href: "/configuratore",
    occhiello: "Strumento",
    titolo: "Configura la tua rata",
    testo: "Vedi la rata e cosa è incluso, senza sorprese in coda.",
    azione: "Apri il configuratore",
  },
  preventivo: {
    href: "/preventivo",
    occhiello: "Un passo",
    titolo: "Richiedi il tuo preventivo",
    testo: "Ti ricontattiamo con una proposta cucita sulla tua attività.",
    azione: "Richiedi il preventivo",
  },
  agenti: {
    href: "/agenti",
    occhiello: "Per te",
    titolo: "Noleggio per agenti di commercio",
    testo: "L'auto da lavoro pensata per chi vive sulla strada.",
    azione: "Scopri la soluzione agenti",
  },
  artigiani: {
    href: "/artigiani",
    occhiello: "Per te",
    titolo: "Noleggio per artigiani",
    testo: "Il furgone giusto, rata fissa e tutto incluso.",
    azione: "Scopri la soluzione artigiani",
  },
  aziende: {
    href: "/aziende",
    occhiello: "Per te",
    titolo: "Flotte e aziende",
    testo: "Gestisci la flotta senza pensieri, con un unico interlocutore.",
    azione: "Scopri la soluzione aziende",
  },
} as const;

export type CtaStrumento = keyof typeof CTA_STRUMENTI;

const idsCta = Object.keys(CTA_STRUMENTI) as [CtaStrumento, ...CtaStrumento[]];

// Frontmatter dell'articolo (§1). Validato ad ogni build da check:blog.
export const frontmatterSchema = z.object({
  titolo: z.string().trim().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug deve essere minuscole, cifre e trattini"),
  descrizione: z.string().trim().min(1).max(160, "descrizione: massimo 160 caratteri"),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve essere YYYY-MM-DD"),
  aggiornato_il: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "aggiornato_il deve essere YYYY-MM-DD")
    .optional(),
  categoria: z.enum(idsCategoria),
  query_target: z.string().trim().min(1, "query_target è obbligatoria"),
  query_secondarie: z.array(z.string().trim().min(1)).default([]),
  tag: z.array(z.string().trim().min(1)).default([]),
  stato: z.enum(["bozza", "pubblicato"]),
  in_evidenza: z.boolean().default(false),
  cta: z.enum(idsCta),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export function labelCategoria(id: string): string {
  return CATEGORIE_BLOG.find((c) => c.id === id)?.label ?? id;
}
