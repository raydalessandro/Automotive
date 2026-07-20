import { describe, it, expect } from "vitest";
import { consiglia } from "./consulente";
import type { Risposte } from "./consulente.config";
import type { Veicolo } from "./catalogo";

// Fixture veicoli deterministici (iniettati: il motore è puro).
function veh(p: Partial<Veicolo> & Pick<Veicolo, "id">): Veicolo {
  return {
    id: p.id,
    marca: p.marca ?? "Marca",
    modello: p.modello ?? "Modello",
    versione: p.versione ?? "1.0",
    alimentazione: p.alimentazione ?? "diesel",
    cambio: p.cambio ?? "manuale",
    stato: p.stato ?? "nuovo",
    anno: p.anno ?? 2024,
    categoria: p.categoria ?? "berlina",
    n1: p.n1 ?? false,
    posti: p.posti ?? 5,
    canone_mese_iva_esclusa: p.canone_mese_iva_esclusa ?? 300,
    durata_mesi: p.durata_mesi ?? 48,
    km_totali: p.km_totali ?? 80000,
    anticipo_iva_esclusa: p.anticipo_iva_esclusa ?? 0,
    pronta_consegna: p.pronta_consegna ?? true,
    in_evidenza: p.in_evidenza ?? false,
    attivo: p.attivo ?? true,
    foto: p.foto ?? "/placeholder-veicolo.svg",
    note: p.note ?? null,
  };
}

const CATALOGO: Veicolo[] = [
  veh({ id: "ford-fiesta-15-tdci-n1", n1: true, categoria: "commerciale", canone_mese_iva_esclusa: 245, durata_mesi: 48, anticipo_iva_esclusa: 0 }),
  veh({ id: "vw-t-roc", n1: false, categoria: "suv", canone_mese_iva_esclusa: 460, durata_mesi: 48 }),
  veh({ id: "opel-frontera-ev", n1: false, categoria: "suv", alimentazione: "elettrica", canone_mese_iva_esclusa: 380, durata_mesi: 48 }),
  veh({ id: "spento", n1: true, categoria: "commerciale", canone_mese_iva_esclusa: 100, attivo: false }),
];

const BASE: Risposte = { attivita: "artigiano", km: "20_30", trasporto: "spesso", forfettario: "no", priorita: "fiscale" };

describe("consulente — golden e onestà (§9)", () => {
  it("artigiano · 20-30k · trasporto sì · ordinario · priorità fisco → Fiesta N1, costo reale ≈ 177", () => {
    const c = consiglia(BASE, CATALOGO);
    expect(c.profilo).toBe("n1_strumentale");
    expect(c.suMisura).toBe(false);
    expect(c.soluzioni[0]?.veicolo.id).toBe("ford-fiesta-15-tdci-n1");
    expect(c.soluzioni[0]?.consigliata).toBe(true);
    expect(Math.abs((c.soluzioni[0]?.costoRealeMese ?? 0) - 176.64)).toBeLessThanOrEqual(0.5);
  });

  it("è deterministico: stessi input → stesse soluzioni", () => {
    const a = consiglia(BASE, CATALOGO);
    const b = consiglia(BASE, CATALOGO);
    expect(a.soluzioni.map((s) => s.veicolo.id)).toEqual(b.soluzioni.map((s) => s.veicolo.id));
  });

  it("mai un veicolo attivo:false", () => {
    const c = consiglia({ ...BASE, trasporto: "a_volte" }, CATALOGO);
    expect(c.soluzioni.some((s) => s.veicolo.id === "spento")).toBe(false);
  });

  it("trasporto 'spesso' filtra ai soli N1 (niente fuori profilo)", () => {
    const c = consiglia(BASE, CATALOGO);
    expect(c.soluzioni.every((s) => s.veicolo.n1)).toBe(true);
    expect(c.pochePerProfilo).toBe(true); // solo la Fiesta è N1
  });

  it("trasporto 'no' esclude gli N1", () => {
    const c = consiglia({ ...BASE, trasporto: "no", attivita: "agente" }, CATALOGO);
    expect(c.soluzioni.every((s) => !s.veicolo.n1)).toBe(true);
  });

  it(">30.000 km → pannello su misura, niente card", () => {
    const c = consiglia({ ...BASE, km: "oltre_30" }, CATALOGO);
    expect(c.suMisura).toBe(true);
    expect(c.soluzioni).toHaveLength(0);
  });

  it("priorità 'rata' ordina per canone crescente", () => {
    const c = consiglia({ ...BASE, trasporto: "a_volte", priorita: "rata" }, CATALOGO);
    const canoni = c.soluzioni.map((s) => s.canoneMese);
    expect(canoni).toEqual([...canoni].sort((a, b) => a - b));
  });

  it("forfettario → costo reale null, prezzo pieno IVA inclusa valorizzato", () => {
    const c = consiglia({ ...BASE, forfettario: "si", trasporto: "a_volte" }, CATALOGO);
    expect(c.profilo).toBe("forfettario");
    expect(c.soluzioni[0]?.costoRealeMese).toBeNull();
    expect(c.soluzioni[0]?.prezzoPienoMese).toBeGreaterThan(0);
  });

  it("'non lo so' → profilo prudente + disclaimer", () => {
    const c = consiglia({ ...BASE, forfettario: "non_so", trasporto: "a_volte" }, CATALOGO);
    expect(c.profilo).toBe("ditta_individuale");
    expect(c.disclaimerFiscale).toBe(true);
  });

  it("il link al configuratore preimposta veicolo, profilo e servizi", () => {
    const c = consiglia(BASE, CATALOGO);
    const link = c.soluzioni[0]?.linkConfiguratore ?? "";
    expect(link).toContain("veicolo=ford-fiesta-15-tdci-n1");
    expect(link).toContain("profilo=n1_strumentale");
  });
});
