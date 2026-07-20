import { z } from "zod";

// Schema form preventivo — §5 della spec.

export const FORME_GIURIDICHE = [
  { id: "forfettario", label: "Forfettario" },
  { id: "ditta_individuale", label: "Ditta individuale / professionista" },
  { id: "agente", label: "Agente o rappresentante" },
  { id: "snc_sas", label: "SNC / SAS" },
  { id: "srl_spa", label: "SRL / SPA" },
  { id: "altro", label: "Altro" },
] as const;

export const ANNI_ATTIVITA = [
  { id: "meno_1", label: "Meno di 1 anno" },
  { id: "1_2", label: "1–2 anni" },
  { id: "3_5", label: "3–5 anni" },
  { id: "oltre_5", label: "Oltre 5 anni" },
] as const;

export const SETTORI = [
  { id: "edilizia", label: "Edilizia / impianti" },
  { id: "commercio", label: "Commercio / agenzia" },
  { id: "servizi", label: "Servizi" },
  { id: "trasporti", label: "Trasporti" },
  { id: "altro", label: "Altro" },
] as const;

export const N_VEICOLI = [
  { id: "1", label: "1" },
  { id: "2_5", label: "2–5" },
  { id: "6_piu", label: "6 o più" },
] as const;

export const KM_ANNO = [
  { id: "fino_15", label: "Fino a 15.000" },
  { id: "15_30", label: "15.000–30.000" },
  { id: "oltre_30", label: "Oltre 30.000" },
] as const;

const ids = <T extends readonly { id: string }[]>(arr: T) =>
  arr.map((x) => x.id) as [T[number]["id"], ...T[number]["id"][]];

export const leadSchema = z.object({
  ragione_sociale: z.string().trim().min(1, "Campo obbligatorio").max(200),
  referente: z.string().trim().min(1, "Campo obbligatorio").max(200),
  forma_giuridica: z.enum(ids(FORME_GIURIDICHE)),
  anni_attivita: z.enum(ids(ANNI_ATTIVITA)),
  settore: z.enum(ids(SETTORI)).optional().or(z.literal("")),
  n_veicoli: z.enum(ids(N_VEICOLI)),
  km_anno: z.enum(ids(KM_ANNO)),
  veicolo_id: z.string().max(120).optional().or(z.literal("")),
  telefono: z
    .string()
    .trim()
    .min(6, "Telefono non valido")
    .max(30)
    .regex(/^[+0-9\s().-]+$/, "Telefono non valido"),
  email: z.string().trim().email("Email non valida").max(200).optional().or(z.literal("")),
  provincia: z.string().trim().min(1, "Campo obbligatorio").max(60),
  consenso_privacy: z.literal(true, {
    errorMap: () => ({ message: "Il consenso privacy è obbligatorio" }),
  }),
  consenso_marketing: z.boolean().optional().default(false),
  // Nota interna opzionale (es. "Richiamo rapido" dal modal minimale). Non mostrata all'utente.
  note: z.string().max(2000).optional().or(z.literal("")),
  // Antispam (§5): honeypot vuoto + tempo minimo di compilazione.
  hp: z.string().max(0).optional().or(z.literal("")),
  ts_apertura: z.number().optional(),
  // Tracciamento
  fonte: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      referrer: z.string().optional(),
      // Tag ambiente (§0.2): la dashboard conta solo i lead prod.
      env: z.string().max(20).optional(),
    })
    .optional(),
  pagina: z.string().max(300).optional().or(z.literal("")),
  // Configurazione dal configuratore (§3), allegata al lead.
  configurazione: z
    .object({
      veicolo_id: z.string().max(120).nullable().optional(),
      durata: z.number().int().optional(),
      km_anno: z.number().int().optional(),
      servizi_scelti: z.array(z.string().max(60)).max(50).optional(),
      servizi_interesse: z.array(z.string().max(60)).max(50).optional(),
      rischi_accettati: z.array(z.string().max(60)).max(50).optional(),
      rata_configurata: z.number().optional(),
      // Esito del Consulente (§PR23): risposte + soluzioni viste/scelta.
      consulente: z
        .object({
          risposte: z.record(z.string().max(60)).optional(),
          soluzione_vista: z.array(z.string().max(120)).max(10).optional(),
          soluzione_scelta: z.string().max(120).nullable().optional(),
        })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
});

export type DatiLead = z.infer<typeof leadSchema>;

export function labelForma(id: string): string {
  return FORME_GIURIDICHE.find((f) => f.id === id)?.label ?? id;
}
export function labelAnni(id: string): string {
  return ANNI_ATTIVITA.find((f) => f.id === id)?.label ?? id;
}
export function labelNVeicoli(id: string): string {
  return N_VEICOLI.find((f) => f.id === id)?.label ?? id;
}
export function labelKm(id: string): string {
  return KM_ANNO.find((f) => f.id === id)?.label ?? id;
}
