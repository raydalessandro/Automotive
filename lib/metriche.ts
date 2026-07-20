// Metriche decisionali (§PR31). TUTTE le definizioni vivono qui, in funzioni pure
// testate con fixture golden. Le query della dashboard sono adapter sottili sopra
// queste funzioni. La spec blinda i quattro bug classici:
//  1. Doppio conteggio → dedup esplicita per sessione dove serve
//  2. Inquinamento d'ambiente → si conta SOLO env='prod' (soloProd*)
//  3. Stato attuale vs storia → i tassi si calcolano sul RAGGIUNGIMENTO di uno stadio
//  4. Divisioni fragili → tasso()/media() ritornano null (mai NaN/Infinity) → "—" in UI

// ————————————————————————————————— Tipi input —————————————————————————————————

export type EvtRow = {
  sessione: string;
  tipo: string;
  pagina?: string | null;
  ts?: string | null;
  fonte?: { utm_source?: string; referrer?: string } | null;
  dati?: Record<string, unknown> | null;
};

export type LeadRow = {
  id: string;
  stato: string;
  created_at: string;
  score?: number | null;
  valore_commissione?: number | null;
  fonte?: { utm_source?: string; referrer?: string; env?: string } | null;
};

export type StoriaRow = { lead_id: string; stato: string; ts: string };

// ————————————————————————————————— Primitive sicure —————————————————————————————————

/** Tasso n/d in [0..1]; null se denominatore ≤ 0 (mai NaN/Infinity). */
export function tasso(n: number, d: number): number | null {
  return d > 0 ? n / d : null;
}

/** Variazione percentuale (cur−prev)/prev; null se prev è 0/negativo/assente. */
export function delta(cur: number, prev: number | null | undefined): number | null {
  if (prev == null || prev <= 0) return null;
  return (cur - prev) / prev;
}

/** Mediana di una lista di numeri; null se vuota (gli outlier non la distruggono). */
export function mediana(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ————————————————————————————————— Filtri ambiente —————————————————————————————————

export function soloProdEventi(eventi: EvtRow[]): EvtRow[] {
  return eventi.filter((e) => (e.dati?.env ?? "") === "prod");
}

export function soloProdLead(leads: LeadRow[]): LeadRow[] {
  return leads.filter((l) => (l.fonte?.env ?? "") === "prod");
}

// ————————————————————————————————— Helper sessioni —————————————————————————————————

const HOME = "/";

/** Sessioni distinte con ≥1 evento. */
export function sessioni(eventi: EvtRow[]): number {
  return new Set(soloProdEventi(eventi).map((e) => e.sessione)).size;
}

/** Insieme delle sessioni che soddisfano un predicato (dedup implicita via Set). */
function sessioniDove(eventi: EvtRow[], pred: (e: EvtRow) => boolean): Set<string> {
  const s = new Set<string>();
  for (const e of soloProdEventi(eventi)) if (pred(e)) s.add(e.sessione);
  return s;
}

/** Sessioni che hanno visto la home (pagina_vista con pagina '/'). */
export function sessioniHome(eventi: EvtRow[]): Set<string> {
  return sessioniDove(eventi, (e) => e.tipo === "pagina_vista" && e.pagina === HOME);
}

/** Numero di sessioni distinte con almeno un evento di un dato tipo. */
export function sessioniConTipo(eventi: EvtRow[], tipo: string): number {
  return sessioniDove(eventi, (e) => e.tipo === tipo).size;
}

// ————————————————————————————————— Coinvolgimento —————————————————————————————————

/** CTR di una CTA hero = sessioni col cta_click di quell'id ÷ sessioni-home. */
export function ctrHero(eventi: EvtRow[], ctaId: string): number | null {
  const home = sessioniHome(eventi).size;
  const click = sessioniDove(
    eventi,
    (e) => e.tipo === "cta_click" && e.dati?.cta === ctaId,
  ).size;
  return tasso(click, home);
}

export type LetturaSezione = { id: string; label: string; sessioni: number; pct: number | null };

/** Lettura per sezione: % di sessioni-home che hanno sezione_vista per ciascuna. */
export function letturaSezioni(
  eventi: EvtRow[],
  sezioni: { id: string; label: string }[],
): LetturaSezione[] {
  const home = sessioniHome(eventi);
  const homeSet = home; // solo sessioni-home contano
  const perSezione = new Map<string, Set<string>>();
  for (const e of soloProdEventi(eventi)) {
    if (e.tipo !== "sezione_vista") continue;
    if (!homeSet.has(e.sessione)) continue;
    const id = String(e.dati?.sezione ?? "");
    if (!id) continue;
    if (!perSezione.has(id)) perSezione.set(id, new Set());
    perSezione.get(id)!.add(e.sessione);
  }
  return sezioni.map((s) => {
    const n = perSezione.get(s.id)?.size ?? 0;
    return { id: s.id, label: s.label, sessioni: n, pct: tasso(n, home.size) };
  });
}

export type DistribuzioneScroll = { soglia: 0 | 25 | 50 | 75; sessioni: number }[];

/** Distribuzione della soglia MASSIMA di scroll raggiunta per sessione-home. */
export function distribuzioneScroll(eventi: EvtRow[]): DistribuzioneScroll {
  const home = sessioniHome(eventi);
  const maxPerSessione = new Map<string, number>();
  for (const s of home) maxPerSessione.set(s, 0);
  for (const e of soloProdEventi(eventi)) {
    if (e.tipo !== "scroll_soglia" || !home.has(e.sessione)) continue;
    const soglia = Number(e.dati?.soglia ?? 0);
    maxPerSessione.set(e.sessione, Math.max(maxPerSessione.get(e.sessione) ?? 0, soglia));
  }
  const bucket: Record<number, number> = { 0: 0, 25: 0, 50: 0, 75: 0 };
  for (const v of maxPerSessione.values()) {
    const b = v >= 75 ? 75 : v >= 50 ? 50 : v >= 25 ? 25 : 0;
    bucket[b]++;
  }
  return [0, 25, 50, 75].map((s) => ({ soglia: s as 0 | 25 | 50 | 75, sessioni: bucket[s] }));
}

export type Strumento = "calcolatore" | "configuratore" | "consulente";
export type StrumentoMetrica = {
  strumento: Strumento;
  aperture: number;
  completamenti: number;
  tasso: number | null; // completati ÷ aperture
  abbandono: number | null; // 1 − tasso (derivato, mai un evento)
};

export function strumenti(eventi: EvtRow[], quali: Strumento[]): StrumentoMetrica[] {
  return quali.map((s) => {
    const aperture = sessioniDove(
      eventi,
      (e) => e.tipo === "strumento_aperto" && e.dati?.strumento === s,
    ).size;
    const completamenti = sessioniDove(
      eventi,
      (e) => e.tipo === "strumento_completato" && e.dati?.strumento === s,
    ).size;
    const t = tasso(completamenti, aperture);
    return { strumento: s, aperture, completamenti, tasso: t, abbandono: t == null ? null : 1 - t };
  });
}

// ————————————————————————————————— Lead & funnel —————————————————————————————————

function inPeriodo(iso: string | null | undefined, da: string, a: string): boolean {
  if (!iso) return false;
  return iso >= da && iso < a;
}

/** Lead creati nel periodo (prod). */
export function conteggioLead(leads: LeadRow[], da: string, a: string): number {
  return soloProdLead(leads).filter((l) => inPeriodo(l.created_at, da, a)).length;
}

/** Lead qualificati = score ≥ 3, creati nel periodo (prod). */
export function qualificati(leads: LeadRow[], da: string, a: string): number {
  return soloProdLead(leads).filter(
    (l) => inPeriodo(l.created_at, da, a) && (l.score ?? 0) >= 3,
  ).length;
}

/**
 * Lead che hanno RAGGIUNTO uno stadio nel periodo (dalla storia, non dallo stato
 * attuale). Conta lead_id distinti con una riga stato===target e ts nel periodo,
 * limitato ai lead prod.
 */
export function raggiuntoStadio(
  storia: StoriaRow[],
  leadsProdIds: Set<string>,
  stato: string,
  da: string,
  a: string,
): number {
  const ids = new Set<string>();
  for (const r of storia) {
    if (r.stato === stato && leadsProdIds.has(r.lead_id) && inPeriodo(r.ts, da, a)) {
      ids.add(r.lead_id);
    }
  }
  return ids.size;
}

/** Insieme degli id dei lead prod (per filtrare la storia, che non ha env). */
export function idLeadProd(leads: LeadRow[]): Set<string> {
  return new Set(soloProdLead(leads).map((l) => l.id));
}

export type StadioFunnel = { stato: string; label: string; raggiunti: number; tassoDaPrec: number | null };

/**
 * Tassi del funnel lead tra stadi CONSECUTIVI, dalla storia. Ogni stadio conta i
 * lead che l'hanno raggiunto nel periodo; il tasso è raggiunti[i] ÷ raggiunti[i-1].
 */
export function funnelLead(
  storia: StoriaRow[],
  leads: LeadRow[],
  stadi: { stato: string; label: string }[],
  da: string,
  a: string,
): StadioFunnel[] {
  const prodIds = idLeadProd(leads);
  const raggiunti = stadi.map((s) => raggiuntoStadio(storia, prodIds, s.stato, da, a));
  return stadi.map((s, i) => ({
    stato: s.stato,
    label: s.label,
    raggiunti: raggiunti[i],
    tassoDaPrec: i === 0 ? null : tasso(raggiunti[i], raggiunti[i - 1]),
  }));
}

/**
 * Tempo di chiusura in secondi = mediana di ts(chiuso) − created_at per i lead
 * chiusi (stadio 'chiuso' raggiunto) nel periodo. Mediana: gli outlier non contano.
 */
export function tempoChiusuraSecondi(
  storia: StoriaRow[],
  leads: LeadRow[],
  da: string,
  a: string,
): number | null {
  const prodIds = idLeadProd(leads);
  const creato = new Map(soloProdLead(leads).map((l) => [l.id, l.created_at]));
  const durate: number[] = [];
  for (const r of storia) {
    if (r.stato !== "chiuso" || !prodIds.has(r.lead_id) || !inPeriodo(r.ts, da, a)) continue;
    const c = creato.get(r.lead_id);
    if (!c) continue;
    const sec = (new Date(r.ts).getTime() - new Date(c).getTime()) / 1000;
    if (sec >= 0) durate.push(sec);
  }
  return mediana(durate);
}

// ————————————————————————————————— Business —————————————————————————————————

export type Business = { contratti: number; commissioni: number; valoreMedio: number | null };

/**
 * Contratti = lead che hanno raggiunto 'chiuso' nel periodo. Commissioni = somma
 * valore_commissione dei chiusi nel periodo. Valore medio = commissioni ÷ contratti.
 */
export function business(storia: StoriaRow[], leads: LeadRow[], da: string, a: string): Business {
  const prodIds = idLeadProd(leads);
  const commissione = new Map(soloProdLead(leads).map((l) => [l.id, l.valore_commissione ?? 0]));
  const chiusi = new Set<string>();
  for (const r of storia) {
    if (r.stato === "chiuso" && prodIds.has(r.lead_id) && inPeriodo(r.ts, da, a)) chiusi.add(r.lead_id);
  }
  let commissioni = 0;
  for (const id of chiusi) commissioni += Number(commissione.get(id) ?? 0);
  return { contratti: chiusi.size, commissioni, valoreMedio: tasso(commissioni, chiusi.size) };
}

// ————————————————————————————————— Acquisizione (fonti) —————————————————————————————————

export type Canale = "organico" | "diretto" | "email" | "social";

/** Classifica una fonte in un canale (utm_source, altrimenti referrer). */
export function classificaFonte(fonte: { utm_source?: string; referrer?: string } | null | undefined): Canale {
  const utm = (fonte?.utm_source ?? "").toLowerCase();
  if (utm) {
    if (["email", "newsletter", "mail"].some((k) => utm.includes(k))) return "email";
    if (["facebook", "instagram", "linkedin", "social", "tiktok", "fb", "ig"].some((k) => utm.includes(k)))
      return "social";
    if (["google", "bing", "organic", "seo"].some((k) => utm.includes(k))) return "organico";
    return "social"; // utm generico da campagna → social/ads
  }
  const ref = (fonte?.referrer ?? "").toLowerCase();
  if (!ref) return "diretto";
  if (["google", "bing", "duckduckgo", "yahoo", "ecosia"].some((k) => ref.includes(k))) return "organico";
  if (["facebook", "instagram", "linkedin", "twitter", "t.co", "tiktok"].some((k) => ref.includes(k)))
    return "social";
  if (["mail", "outlook", "gmail"].some((k) => ref.includes(k))) return "email";
  return "diretto";
}

export type FonteMetrica = { canale: Canale; sessioni: number; lead: number };

/** Sessioni e lead per canale (fonte classificata). */
export function fonti(eventi: EvtRow[], leads: LeadRow[], da: string, a: string): FonteMetrica[] {
  const canali: Canale[] = ["organico", "diretto", "email", "social"];
  // Sessioni per canale: dalla fonte del primo evento con fonte, per sessione.
  const fontePerSessione = new Map<string, { utm_source?: string; referrer?: string } | null>();
  for (const e of soloProdEventi(eventi)) {
    if (!fontePerSessione.has(e.sessione)) fontePerSessione.set(e.sessione, e.fonte ?? null);
    else if (!fontePerSessione.get(e.sessione) && e.fonte) fontePerSessione.set(e.sessione, e.fonte);
  }
  const sessPerCanale = new Map<Canale, number>();
  for (const f of fontePerSessione.values()) {
    const c = classificaFonte(f);
    sessPerCanale.set(c, (sessPerCanale.get(c) ?? 0) + 1);
  }
  const leadPerCanale = new Map<Canale, number>();
  for (const l of soloProdLead(leads)) {
    if (!inPeriodo(l.created_at, da, a)) continue;
    const c = classificaFonte(l.fonte);
    leadPerCanale.set(c, (leadPerCanale.get(c) ?? 0) + 1);
  }
  return canali.map((c) => ({
    canale: c,
    sessioni: sessPerCanale.get(c) ?? 0,
    lead: leadPerCanale.get(c) ?? 0,
  }));
}

// ————————————————————————————————— Blog —————————————————————————————————

export type BlogRiga = {
  pagina: string;
  visite: number;
  permanenzaMediana: number | null; // secondi (stima)
  clickStrumenti: number;
};

/** Metriche per articolo del blog (pagina che inizia con /blog/). */
export function blog(eventi: EvtRow[]): BlogRiga[] {
  const prod = soloProdEventi(eventi);
  const articoli = new Set<string>();
  for (const e of prod) {
    if (e.pagina && e.pagina.startsWith("/blog/") && e.pagina !== "/blog") articoli.add(e.pagina);
  }
  return [...articoli]
    .map((pagina) => {
      const visite = sessioniDove(prod, (e) => e.tipo === "pagina_vista" && e.pagina === pagina).size;
      const tempi: number[] = [];
      for (const e of prod) {
        if (e.tipo === "tempo_pagina" && e.pagina === pagina) {
          const s = Number(e.dati?.secondi ?? 0);
          if (s > 0) tempi.push(s);
        }
      }
      const clickStrumenti = prod.filter(
        (e) => e.tipo === "cta_click" && e.pagina === pagina,
      ).length;
      return { pagina, visite, permanenzaMediana: mediana(tempi), clickStrumenti };
    })
    .sort((a, b) => b.visite - a.visite);
}
