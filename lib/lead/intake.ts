import { z } from "zod";

// Contratto /api/lead v2 per i target esterni (§PR-9). È il CORE comune a tutti i target:
// nominativo (ragione_sociale), telefono, consenso. I campi specifici del target vivono
// in `dati` e li valida il DB (trigger 014) — qui `dati` passa com'è. Tutto puro e
// testabile: nessun accesso a DB/rete. Regola del contratto: campi vuoti si OMETTONO
// (mai null nel payload); qui li normalizziamo a null solo al momento dell'insert.

const telefono = z
  .string()
  .trim()
  .min(6, "Telefono non valido")
  .max(30)
  .regex(/^[+0-9\s().-]+$/, "Telefono non valido");

export const intakeSchema = z.object({
  target: z.string().trim().min(1).max(60),
  chiave_sito: z.string().trim().max(200).optional(),
  // Core: per i privati ragione_sociale è il nominativo (label dal registro).
  ragione_sociale: z.string().trim().min(1, "Campo obbligatorio").max(200),
  telefono,
  email: z.string().trim().email("Email non valida").max(200).optional().or(z.literal("")),
  provincia: z.string().trim().max(60).optional().or(z.literal("")),
  consenso_privacy: z.literal(true, {
    errorMap: () => ({ message: "Il consenso privacy è obbligatorio" }),
  }),
  consenso_marketing: z.boolean().optional().default(false),
  // fonte: stringa (es. "prova" per i form finti) oppure oggetto tracciamento.
  fonte: z.union([z.string().max(120), z.record(z.unknown())]).optional(),
  pagina: z.string().trim().max(300).optional().or(z.literal("")),
  // Antispam (§5): honeypot vuoto + tempo minimo, come nel form storico.
  hp: z.string().max(0).optional().or(z.literal("")),
  ts_apertura: z.number().optional(),
  // Campi del target: validati dal DB (trigger 014), non qui.
  dati: z.record(z.unknown()).optional(),
});

export type Intake = z.infer<typeof intakeSchema>;

export type EsitoIntake =
  | { ok: true; data: Intake }
  | { ok: false; errore: string; dettagli?: Record<string, string[]> };

/** Valida il contratto core (pura). I campi del target restano in `dati`, non validati qui. */
export function parseIntake(body: unknown): EsitoIntake {
  const r = intakeSchema.safeParse(body);
  if (!r.success) {
    return { ok: false, errore: "Dati non validi", dettagli: r.error.flatten().fieldErrors };
  }
  return { ok: true, data: r.data };
}

/**
 * Target dal body, prima di validare tutto: sceglie la corsia. Assente/non-stringa/vuoto
 * → 'nlt_b2b' (il percorso storico). Non fidarsi: solo per instradare.
 */
export function targetDaBody(body: unknown): string {
  if (body && typeof body === "object" && "target" in body) {
    const t = (body as Record<string, unknown>).target;
    if (typeof t === "string" && t.trim()) return t.trim();
  }
  return "nlt_b2b";
}

/** Colonne core del lead per l'insert: i campi vuoti diventano null (mai stringa vuota). */
export function coreLeadInsert(d: Intake): {
  ragione_sociale: string;
  telefono: string;
  email: string | null;
  provincia: string | null;
  consenso_privacy: boolean;
  consenso_marketing: boolean;
  fonte: unknown;
  pagina: string | null;
} {
  const pulito = (s?: string) => (s && s.trim() ? s.trim() : null);
  return {
    ragione_sociale: d.ragione_sociale,
    telefono: d.telefono,
    email: pulito(d.email),
    provincia: pulito(d.provincia),
    consenso_privacy: d.consenso_privacy,
    consenso_marketing: d.consenso_marketing ?? false,
    fonte: d.fonte ?? null,
    pagina: pulito(d.pagina),
  };
}
