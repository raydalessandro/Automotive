// Registry tipizzato degli id CTA (§PR29). Un id non registrato è un errore di
// compilazione: mai stringhe sparse, così la dashboard conta CTA che esistono davvero.
export const CTA_IDS = [
  "hero_consulente", // CTA primaria hero home → /consulente
  "hero_calcolatore", // CTA secondaria hero home → /calcolatore
  "metodo_consulente", // passo 1 del metodo
  "metodo_configuratore", // passo 2 del metodo
  "blog_consulente", // CTA articolo blog → consulente
  "blog_calcolatore", // CTA articolo blog → calcolatore
] as const;

export type CtaId = (typeof CTA_IDS)[number];
