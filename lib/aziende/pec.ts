// Guardrail PEC — §4 spec: l'import rifiuta email su domini PEC noti.
// La garanzia vera resta a monte (prompt di ricerca che esclude le PEC); questo è il fallback.

const DOMINI_PEC = [
  "pec.it",
  "legalmail.it",
  "arubapec.it",
  "pec.libero.it",
  "postecert.it",
  "sicurezzapostale.it",
  "cert.legalmail.it",
  "pec.aruba.it",
  "ingpec.eu",
  "pec.cgn.it",
];

export function isPec(email: string | null | undefined): boolean {
  if (!email) return false;
  const dominio = email.split("@")[1]?.toLowerCase() ?? "";
  if (!dominio) return false;
  // match esatto o sottodominio, + euristica "postacert.*"
  if (dominio.startsWith("postacert.")) return true;
  return DOMINI_PEC.some((d) => dominio === d || dominio.endsWith("." + d));
}
