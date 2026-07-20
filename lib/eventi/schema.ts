import { z } from "zod";

// Eventi analytics first-party — §2/§5 spec dashboard.

export const TIPI_EVENTO = [
  // Eventi storici (v1): restano emessi invariati per continuità.
  "pagina_vista",
  "veicolo_visto",
  "calcolatore_usato",
  "configuratore_usato",
  "preventivo_inviato",
  "telefono_click",
  "whatsapp_click",
  "condividi_click",
  "consulente_usato",
  "consulente_soluzione_click",
  // Eventi v2 (§PR29): usati dalla dashboard decisionale.
  "sezione_vista",
  "scroll_soglia",
  "cta_click",
  "faq_aperta",
  "strumento_aperto",
  "strumento_completato",
  "tempo_pagina",
  "lead_iniziato",
] as const;

export type TipoEvento = (typeof TIPI_EVENTO)[number];

export const eventoSchema = z.object({
  sessione: z.string().min(8).max(64),
  tipo: z.enum(TIPI_EVENTO),
  pagina: z.string().max(300).optional().or(z.literal("")),
  veicolo_id: z.string().max(120).optional().or(z.literal("")),
  profilo_fiscale: z.string().max(60).optional().or(z.literal("")),
  fonte: z
    .object({
      utm_source: z.string().max(120).optional(),
      utm_medium: z.string().max(120).optional(),
      utm_campaign: z.string().max(120).optional(),
      referrer: z.string().max(300).optional(),
    })
    .optional(),
  // Proprietà strutturate dei nuovi eventi (§PR29). Ogni evento porta dati.env.
  dati: z
    .object({
      env: z.string().max(20).optional(),
      sezione: z.string().max(60).optional(),
      pagina: z.string().max(300).optional(),
      soglia: z.number().int().optional(),
      cta: z.string().max(60).optional(),
      domanda: z.string().max(200).optional(),
      strumento: z.string().max(40).optional(),
      secondi: z.number().int().optional(),
      form: z.string().max(20).optional(),
    })
    .passthrough()
    .optional(),
});

export type Evento = z.infer<typeof eventoSchema>;
