import { z } from "zod";

// Aziende (mailing) — §2/§3 spec dashboard.

export const SEGMENTI = [
  { id: "artigiani", label: "Artigiani" },
  { id: "agenti", label: "Agenti" },
  { id: "pmi", label: "PMI" },
  { id: "forfettari", label: "Forfettari" },
  { id: "altro", label: "Altro" },
] as const;

export const STATI_AZIENDA = [
  { id: "grezza", label: "Grezza" },
  { id: "da_contattare", label: "Da contattare" },
  { id: "in_campagna", label: "In campagna" },
  { id: "risposto", label: "Risposto" },
  { id: "lead", label: "Lead" },
  { id: "non_interessata", label: "Non interessata" },
  { id: "scartata", label: "Scartata" },
  { id: "opt_out", label: "Opt-out" },
] as const;

const idsSeg = SEGMENTI.map((s) => s.id) as [string, ...string[]];

export type Azienda = {
  id: string;
  creato_il: string;
  ragione_sociale: string;
  segmento: string;
  settore: string | null;
  provincia: string | null;
  citta: string | null;
  sito: string | null;
  email: string | null;
  telefono: string | null;
  dimensione_stimata: string | null;
  segnali: string | null;
  score: number | null;
  stato: string;
  fonte_ricerca: string | null;
  piva: string | null;
  arricchita_il: string | null;
};

// Riga di import (formato = output ricerca AI, vedi docs/import-aziende.md).
export const importRowSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  piva: z
    .union([z.string(), z.number()])
    .transform((v) => String(v).replace(/\D/g, ""))
    .refine((v) => v === "" || /^\d{11}$/.test(v), "piva deve avere 11 cifre")
    .transform((v) => (v === "" ? null : v))
    .optional()
    .nullable(),
  ragione_sociale: z.string().trim().min(1),
  segmento: z.enum(idsSeg).optional().default("altro"),
  settore: z.string().trim().optional().nullable(),
  provincia: z.string().trim().max(60).optional().nullable(),
  citta: z.string().trim().max(120).optional().nullable(),
  sito: z.string().trim().max(300).optional().nullable(),
  email: z.string().trim().toLowerCase().email().optional().nullable(),
  telefono: z.string().trim().max(40).optional().nullable(),
  dimensione_stimata: z.string().trim().max(20).optional().nullable(),
  segnali: z.string().trim().optional().nullable(),
  score: z.coerce.number().int().optional().nullable(),
  fonte_ricerca: z.string().trim().max(120).optional().nullable(),
});

export type ImportRow = z.infer<typeof importRowSchema>;

export function labelSegmento(id: string): string {
  return SEGMENTI.find((s) => s.id === id)?.label ?? id;
}
export function labelStatoAzienda(id: string): string {
  return STATI_AZIENDA.find((s) => s.id === id)?.label ?? id;
}
