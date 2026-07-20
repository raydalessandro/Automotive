// Primo contatto — genera la "lista di tiro" dai batch: per ogni azienda sceglie il canale,
// estrae il gancio dai segnali e scrive il messaggio pronto (email / WhatsApp / telefonata).
// Uso: npm run aziende:contatti  →  strumenti/ricerca/contatti/lista-tiro.md
// Regole ereditate da docs/sequenze-email.md: un solo link, CTA "rispondi", niente "gratis",
// numeri dai golden test. Il gancio viene dai segnali raccolti: è la parte che i competitor
// online non hanno. Alla risposta si passa a voce (vedi docs/primo-contatto.md).

import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "fs";
import { parseImport } from "../lib/aziende/import";
import type { ImportRow } from "../lib/aziende/schema";

const DIR = "strumenti/ricerca/batch";
const OUT = "strumenti/ricerca/contatti";

function norm(n: string): string {
  return n.toLowerCase().replace(/[.,'&]/g, " ").replace(/\b(srl|s ?r ?l|spa|sas|snc|unipersonale|societa|f ?lli|fratelli)\b/g, " ").replace(/\s+/g, " ").trim();
}

// Carica tutto il magazzino dai file, tenendo per ogni azienda la riga più ricca.
const righe = new Map<string, ImportRow>();
for (const f of readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  for (const r of parseImport(readFileSync(`${DIR}/${f}`, "utf8")).valide) {
    const k = norm(r.ragione_sociale) + "|" + (r.provincia ?? "");
    const prev = righe.get(k);
    const pieni = (x: ImportRow) => Object.values(x).filter((v) => v !== null && v !== undefined && v !== "").length;
    if (!prev || pieni(r) > pieni(prev)) righe.set(k, r);
  }
}

type Gancio = { tipo: string; frase: string; oggetto: string };

function gancio(r: ImportRow): Gancio {
  const s = (r.segnali ?? "").toLowerCase();
  const nFurgoni = s.match(/(\d+)\s*furgon/)?.[1];
  const nImpianti = s.match(/(\d[\d.]*)\+?\s*impianti/)?.[1];
  if (nFurgoni || /parco automezzi|flotta/.test(s))
    return {
      tipo: "flotta",
      frase: nFurgoni
        ? `ho visto che dichiarate ${nFurgoni} furgoni attrezzati sul vostro sito`
        : `ho visto che lavorate con una flotta di mezzi propri`,
      oggetto: nFurgoni ? `I ${nFurgoni} furgoni di {nome} e un conto che quasi nessuno fa` : `La vostra flotta e un conto che quasi nessuno fa`,
    };
  if (/cercano tecnic|patente b|lavora.con.noi|assunzion/.test(s))
    return { tipo: "crescita", frase: `ho visto che state cercando tecnici da mettere su strada`, oggetto: `Nuovo tecnico in arrivo: il mezzo conviene comprarlo o no?` };
  if (nImpianti || /migliaia di impianti/.test(s))
    return {
      tipo: "parco",
      frase: `seguite ${nImpianti ?? "migliaia di"} impianti sul territorio: sono mezzi e chilometri ogni giorno`,
      oggetto: `${nImpianti ?? "Migliaia di"} impianti da seguire: il conto sui mezzi che li girano`,
    };
  if (/h ?24|pronto intervento|notturno|24 ore/.test(s))
    return { tipo: "fermo", frase: `il vostro pronto intervento vive sui mezzi: quando uno si ferma, salta il servizio`, oggetto: `Il mezzo fermo costa più del canone` };
  if (/raggio|tutta italia|lombard|province|capillare|60 km/.test(s))
    return { tipo: "km", frase: `coprite un'area ampia: i vostri mezzi macinano chilometri veri`, oggetto: `Quanti km fa davvero un vostro mezzo l'anno` };
  return { tipo: "base", frase: `lavorate con i vostri mezzi`, oggetto: `Il conto vero sul mezzo aziendale` };
}

function leva(r: ImportRow): string {
  if (r.segmento === "agenti")
    return `per un agente di commercio, 460 € di canone auto diventano circa 301 € di costo reale grazie alla fiscalità dedicata. Assicurazione, bollo, manutenzione e gomme incluse, anticipo zero.`;
  return `un N1 a noleggio è deducibile al 100%, IVA compresa: 245 € al mese diventano circa 177 € reali per una società in regime ordinario, con dentro assicurazione, bollo, manutenzione e gomme. Anticipo zero.`;
}

const LANDING: Record<string, string> = { artigiani: "/artigiani", agenti: "/agenti", pmi: "/aziende" };

function email(r: ImportRow, g: Gancio): string {
  return `**Oggetto:** ${g.oggetto.replace("{nome}", r.ragione_sociale)}

Buongiorno,
le scrivo perché ${g.frase}. Su mezzi usati così c'è un conto che quasi nessuno fa: ${leva(r)}
Il conto sui vostri numeri si fa in due minuti qui: https://[DOMINIO]${LANDING[r.segmento] ?? "/calcolatore"}
Oppure risponda a questa email e la chiamo io.

[NOME VENDITORE]
Impero Automotive · [TELEFONO]

(Se il tema non è di interesse, me lo dica con una riga e non la disturbo più.)`;
}

function telefonata(r: ImportRow, g: Gancio): string {
  return `"Buongiorno, sono [NOME] di Impero Automotive. La chiamo perché ${g.frase}. Facciamo il conto del costo reale di un mezzo a noleggio col vostro regime fiscale: due minuti, glielo lascio fatto sui vostri numeri. Ha due minuti adesso o preferisce che la richiami?"`;
}

const conEmail = [...righe.values()].filter((r) => r.email).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
const soloTel = [...righe.values()].filter((r) => !r.email && r.telefono).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
const daArricchire = [...righe.values()].filter((r) => !r.email && !r.telefono);

let md = `# Lista di tiro — primo contatto\n\nGenerata da ${righe.size} aziende in magazzino. Canali: **${conEmail.length} email** · **${soloTel.length} chiamate** · ${daArricchire.length} da arricchire prima del contatto.\nRegola d'ingaggio: alla risposta si passa **a voce** (richiamo entro 30 minuti in orario ufficio).\n`;

md += `\n---\n\n## Canale email (${conEmail.length})\n`;
for (const r of conEmail) {
  const g = gancio(r);
  md += `\n### ${r.ragione_sociale} — ${r.citta ?? r.provincia ?? ""} · score ${r.score} · gancio: ${g.tipo}\n→ ${r.email}\n\n${email(r, g)}\n`;
}
md += `\n---\n\n## Canale telefono (${soloTel.length}) — per il venditore\n`;
for (const r of soloTel) {
  const g = gancio(r);
  md += `\n### ${r.ragione_sociale} — ${r.citta ?? r.provincia ?? ""} · score ${r.score} · ${r.telefono}\n${telefonata(r, g)}\n`;
}
md += `\n---\n\n## Da arricchire prima del contatto (${daArricchire.length})\n\n${daArricchire.map((r) => `- ${r.ragione_sociale} (${r.provincia ?? "?"})`).join("\n")}\n`;

mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/lista-tiro.md`, md);
console.log(`Lista di tiro: ${conEmail.length} email, ${soloTel.length} chiamate, ${daArricchire.length} da arricchire → ${OUT}/lista-tiro.md`);
