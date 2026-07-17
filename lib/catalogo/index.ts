import catalogoRaw from "@/data/catalogo.json";
import { catalogoSchema, type Veicolo } from "./schema";

// Accesso al catalogo + campi derivati (§2.1). I derivati non sono mai salvati.

const catalogo = catalogoSchema.parse(catalogoRaw);

export type Badge = { label: string; tono: "oro" | "neutro" };

/** Canone equivalente: anticipo spalmato sulla durata (stessa fiscalità del canone). */
export function canoneEquivalente(v: Pick<Veicolo, "canone_mese_iva_esclusa" | "anticipo_iva_esclusa" | "durata_mesi">): number {
  return v.canone_mese_iva_esclusa + v.anticipo_iva_esclusa / v.durata_mesi;
}

/** Km/anno derivati (§2.1). */
export function kmAnno(v: Pick<Veicolo, "km_totali" | "durata_mesi">): number {
  return Math.round(v.km_totali / (v.durata_mesi / 12));
}

/** Titolo leggibile completo. */
export function titoloVeicolo(v: Pick<Veicolo, "marca" | "modello" | "versione">): string {
  return `${v.marca} ${v.modello} ${v.versione}`.trim();
}

/** Badge derivati (§2.1). */
export function badge(v: Veicolo): Badge[] {
  const out: Badge[] = [];
  if (v.anticipo_iva_esclusa === 0) out.push({ label: "Anticipo zero", tono: "oro" });
  if (v.alimentazione === "elettrica") out.push({ label: "Elettrica", tono: "neutro" });
  if (v.n1 && v.posti != null) out.push({ label: `N1 · ${v.posti} posti`, tono: "neutro" });
  if (v.pronta_consegna) out.push({ label: "Pronta consegna", tono: "neutro" });
  if (v.anno) out.push({ label: String(v.anno), tono: "neutro" });
  return out;
}

export function tuttiVeicoli(): Veicolo[] {
  return catalogo.veicoli;
}

export function veicoliAttivi(): Veicolo[] {
  return catalogo.veicoli.filter((v) => v.attivo);
}

export function veicoliInEvidenza(): Veicolo[] {
  return veicoliAttivi().filter((v) => v.in_evidenza);
}

export function veicoloById(id: string): Veicolo | undefined {
  return catalogo.veicoli.find((v) => v.id === id);
}

export function aggiornatoIl(): string {
  return catalogo.aggiornato_il;
}

export type { Veicolo };
