import { z } from "zod";

// Schema catalogo — §2 della spec. Fonte di verità per validazione e tipi.

export const ALIMENTAZIONI = [
  "diesel",
  "benzina",
  "ibrida",
  "plug-in",
  "elettrica",
  "gpl",
  "metano",
] as const;

export const STATI = ["nuovo", "usato"] as const;

export const CATEGORIE = [
  "citycar",
  "berlina",
  "suv",
  "station",
  "commerciale",
] as const;

export const CAMBI = ["manuale", "automatico"] as const;

export const DURATE_AMMESSE = [12, 24, 36, 48] as const;

export const veicoloSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/, "id deve essere uno slug (minuscole, cifre, trattini)"),
  marca: z.string().min(1),
  modello: z.string().min(1),
  versione: z.string().min(1),
  alimentazione: z.enum(ALIMENTAZIONI),
  cambio: z.enum(CAMBI).nullable(),
  stato: z.enum(STATI),
  anno: z.number().int().min(1990).max(2100).nullable(),
  categoria: z.enum(CATEGORIE),
  n1: z.boolean(),
  posti: z.number().int().min(1).max(9).nullable(),
  canone_mese_iva_esclusa: z.number().positive("il canone deve essere > 0"),
  durata_mesi: z
    .number()
    .refine((v) => (DURATE_AMMESSE as readonly number[]).includes(v), {
      message: `durata_mesi deve essere una tra ${DURATE_AMMESSE.join(", ")}`,
    }),
  km_totali: z.number().positive(),
  anticipo_iva_esclusa: z.number().min(0),
  pronta_consegna: z.boolean().nullable(),
  in_evidenza: z.boolean(),
  attivo: z.boolean(),
  foto: z.string().min(1),
  note: z.string().nullable(),
});

export const catalogoSchema = z.object({
  aggiornato_il: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "aggiornato_il deve essere YYYY-MM-DD"),
  veicoli: z.array(veicoloSchema),
});

export type Veicolo = z.infer<typeof veicoloSchema>;
export type Catalogo = z.infer<typeof catalogoSchema>;
