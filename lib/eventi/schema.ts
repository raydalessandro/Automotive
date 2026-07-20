import { z } from "zod";

// Eventi analytics first-party — §2/§5 spec dashboard.

export const TIPI_EVENTO = [
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
});

export type Evento = z.infer<typeof eventoSchema>;
