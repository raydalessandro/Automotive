import { describe, it, expect } from "vitest";
import {
  tasso,
  delta,
  mediana,
  sessioni,
  sessioniHome,
  sessioniConTipo,
  ctrHero,
  letturaSezioni,
  distribuzioneScroll,
  strumenti,
  conteggioLead,
  qualificati,
  raggiuntoStadio,
  idLeadProd,
  funnelLead,
  tempoChiusuraSecondi,
  business,
  classificaFonte,
  fonti,
  blog,
  type EvtRow,
  type LeadRow,
  type StoriaRow,
} from "./metriche";

const DA = "2026-07-01T00:00:00Z";
const A = "2026-08-01T00:00:00Z";

// Helper: evento prod di default; env='preview' per testare il filtro ambiente.
function ev(sessione: string, tipo: string, extra: Partial<EvtRow> = {}, env = "prod"): EvtRow {
  return {
    sessione,
    tipo,
    pagina: extra.pagina ?? null,
    fonte: extra.fonte ?? null,
    dati: { env, ...(extra.dati ?? {}) },
  };
}

// ————— Fixture eventi golden —————
const EVENTI: EvtRow[] = [
  // s1 (prod): home + click hero + 2 sezioni (metodo duplicato!) + scroll 25/50/75 + calcolatore aperto+completato
  ev("s1", "pagina_vista", { pagina: "/", fonte: { utm_source: "google" } }),
  ev("s1", "cta_click", { dati: { cta: "hero_consulente" } }),
  ev("s1", "sezione_vista", { dati: { sezione: "metodo" } }),
  ev("s1", "sezione_vista", { dati: { sezione: "metodo" } }), // DUPLICATO in DB → deve contare 1
  ev("s1", "sezione_vista", { dati: { sezione: "faq" } }),
  ev("s1", "scroll_soglia", { dati: { soglia: 25 } }),
  ev("s1", "scroll_soglia", { dati: { soglia: 50 } }),
  ev("s1", "scroll_soglia", { dati: { soglia: 75 } }),
  ev("s1", "strumento_aperto", { dati: { strumento: "calcolatore" } }),
  ev("s1", "strumento_completato", { dati: { strumento: "calcolatore" } }),
  // s2 (prod): home + metodo + scroll fino a 50 + calcolatore aperto (non completato)
  ev("s2", "pagina_vista", { pagina: "/", fonte: { referrer: "https://facebook.com/x" } }),
  ev("s2", "sezione_vista", { dati: { sezione: "metodo" } }),
  ev("s2", "scroll_soglia", { dati: { soglia: 25 } }),
  ev("s2", "scroll_soglia", { dati: { soglia: 50 } }),
  ev("s2", "strumento_aperto", { dati: { strumento: "calcolatore" } }),
  // s3 (prod): solo /veicoli (NON è una sessione-home)
  ev("s3", "pagina_vista", { pagina: "/veicoli" }),
  // sX (PREVIEW): tutto, deve essere ignorato
  ev("sX", "pagina_vista", { pagina: "/" }, "preview"),
  ev("sX", "cta_click", { dati: { cta: "hero_consulente" } }, "preview"),
  ev("sX", "sezione_vista", { dati: { sezione: "metodo" } }, "preview"),
  ev("sX", "scroll_soglia", { dati: { soglia: 75 } }, "preview"),
  ev("sX", "strumento_aperto", { dati: { strumento: "calcolatore" } }, "preview"),
  ev("sX", "strumento_completato", { dati: { strumento: "calcolatore" } }, "preview"),
];

// ————— Fixture lead + storia golden —————
const LEADS: LeadRow[] = [
  { id: "L1", created_at: "2026-07-10T00:00:00Z", score: 5, stato: "chiuso", valore_commissione: 500, fonte: { utm_source: "google", env: "prod" } },
  { id: "L2", created_at: "2026-07-12T00:00:00Z", score: 2, stato: "preventivo_inviato", fonte: { referrer: "https://facebook.com", env: "prod" } },
  { id: "L3", created_at: "2026-07-15T00:00:00Z", score: 4, stato: "contattato", fonte: { env: "prod" } },
  { id: "LX", created_at: "2026-07-11T00:00:00Z", score: 5, stato: "chiuso", valore_commissione: 999, fonte: { env: "preview" } }, // preview → ignorato
  { id: "L4", created_at: A, score: 5, stato: "nuovo", fonte: { env: "prod" } }, // creato al confine → escluso
];

const STORIA: StoriaRow[] = [
  { lead_id: "L1", stato: "nuovo", ts: "2026-07-10T00:00:00Z" },
  { lead_id: "L1", stato: "contattato", ts: "2026-07-10T10:00:00Z" },
  { lead_id: "L1", stato: "preventivo_inviato", ts: "2026-07-11T10:00:00Z" },
  { lead_id: "L1", stato: "chiuso", ts: "2026-07-13T10:00:00Z" },
  { lead_id: "L2", stato: "nuovo", ts: "2026-07-12T00:00:00Z" },
  { lead_id: "L2", stato: "contattato", ts: "2026-07-12T12:00:00Z" },
  { lead_id: "L2", stato: "preventivo_inviato", ts: "2026-07-14T10:00:00Z" },
  { lead_id: "L3", stato: "nuovo", ts: "2026-07-15T00:00:00Z" },
  { lead_id: "L3", stato: "contattato", ts: "2026-07-15T11:00:00Z" },
  { lead_id: "LX", stato: "chiuso", ts: "2026-07-12T00:00:00Z" }, // lead preview → ignorato
];

describe("primitive sicure (§0.4)", () => {
  it("tasso: denominatore zero → null (mai NaN/Infinity)", () => {
    expect(tasso(1, 0)).toBeNull();
    expect(tasso(1, 2)).toBe(0.5);
    expect(tasso(0, 5)).toBe(0);
  });
  it("delta: periodo precedente vuoto/zero → null", () => {
    expect(delta(10, 5)).toBe(1);
    expect(delta(10, 0)).toBeNull();
    expect(delta(10, null)).toBeNull();
    expect(delta(3, 4)).toBeCloseTo(-0.25);
  });
  it("mediana: vuota → null; gli outlier non la spostano", () => {
    expect(mediana([])).toBeNull();
    expect(mediana([2])).toBe(2);
    expect(mediana([1, 2, 3])).toBe(2);
    expect(mediana([1, 2, 3, 4])).toBe(2.5);
    expect(mediana([1, 2, 3, 1000])).toBe(2.5); // outlier ignorato
  });
});

describe("coinvolgimento (§PR31)", () => {
  it("sessioni: distinte, solo prod (sX preview escluso)", () => {
    expect(sessioni(EVENTI)).toBe(3); // s1, s2, s3
    expect(sessioniHome(EVENTI).size).toBe(2); // s1, s2
    expect(sessioniConTipo(EVENTI, "strumento_aperto")).toBe(2); // s1, s2
  });

  it("CTR hero: click sessioni ÷ sessioni-home; id assente → 0; denom 0 → null", () => {
    expect(ctrHero(EVENTI, "hero_consulente")).toBe(0.5); // {s1} / 2
    expect(ctrHero(EVENTI, "hero_calcolatore")).toBe(0); // 0 / 2
    expect(ctrHero([], "hero_consulente")).toBeNull(); // niente home → null
  });

  it("lettura sezioni: % sessioni-home; duplicato in DB conta una volta", () => {
    const r = letturaSezioni(EVENTI, [
      { id: "metodo", label: "Metodo" },
      { id: "faq", label: "FAQ" },
    ]);
    expect(r[0]).toMatchObject({ id: "metodo", sessioni: 2, pct: 1 }); // s1(dup),s2
    expect(r[1]).toMatchObject({ id: "faq", sessioni: 1, pct: 0.5 }); // s1
  });

  it("distribuzione scroll: soglia massima per sessione-home", () => {
    const d = distribuzioneScroll(EVENTI);
    expect(d).toEqual([
      { soglia: 0, sessioni: 0 },
      { soglia: 25, sessioni: 0 },
      { soglia: 50, sessioni: 1 }, // s2
      { soglia: 75, sessioni: 1 }, // s1
    ]);
  });

  it("strumenti: aperture/completamenti/tasso; abbandono derivato", () => {
    const [calc] = strumenti(EVENTI, ["calcolatore"]);
    expect(calc).toEqual({
      strumento: "calcolatore",
      aperture: 2, // s1, s2
      completamenti: 1, // s1
      tasso: 0.5,
      abbandono: 0.5,
    });
  });
});

describe("lead & funnel (§PR31, storia non stato-attuale)", () => {
  it("lead e qualificati nel periodo (prod, confine escluso)", () => {
    expect(conteggioLead(LEADS, DA, A)).toBe(3); // L1,L2,L3; L4 al confine escluso; LX preview escluso
    expect(qualificati(LEADS, DA, A)).toBe(2); // L1(5), L3(4); L2(2) no
  });

  it("raggiungimento stadio dalla storia, lead preview esclusi", () => {
    const prod = idLeadProd(LEADS);
    expect(raggiuntoStadio(STORIA, prod, "preventivo_inviato", DA, A)).toBe(2); // L1,L2
    expect(raggiuntoStadio(STORIA, prod, "chiuso", DA, A)).toBe(1); // L1 (LX preview escluso)
  });

  it("funnel: tassi tra stadi consecutivi", () => {
    const f = funnelLead(
      STORIA,
      LEADS,
      [
        { stato: "contattato", label: "Contattati" },
        { stato: "preventivo_inviato", label: "Preventivi" },
        { stato: "chiuso", label: "Chiusi" },
      ],
      DA,
      A,
    );
    expect(f[0]).toMatchObject({ raggiunti: 3, tassoDaPrec: null }); // L1,L2,L3
    expect(f[1].raggiunti).toBe(2);
    expect(f[1].tassoDaPrec).toBeCloseTo(2 / 3);
    expect(f[2].raggiunti).toBe(1);
    expect(f[2].tassoDaPrec).toBe(0.5);
  });

  it("tempo di chiusura: mediana ts(chiuso) − created_at", () => {
    // L1: 2026-07-13T10:00 − 2026-07-10T00:00 = 3g 10h = 295200s. Unico chiuso prod.
    expect(tempoChiusuraSecondi(STORIA, LEADS, DA, A)).toBe(295200);
  });
});

describe("business (§PR31)", () => {
  it("contratti, commissioni, valore medio (preview escluso)", () => {
    const b = business(STORIA, LEADS, DA, A);
    expect(b).toEqual({ contratti: 1, commissioni: 500, valoreMedio: 500 }); // LX 999 escluso
  });
  it("nessun contratto → valore medio null (mai divisione fragile)", () => {
    const b = business([], LEADS, DA, A);
    expect(b).toEqual({ contratti: 0, commissioni: 0, valoreMedio: null });
  });
});

describe("acquisizione: fonti (§PR31)", () => {
  it("classificaFonte: utm e referrer", () => {
    expect(classificaFonte({ utm_source: "google" })).toBe("organico");
    expect(classificaFonte({ utm_source: "newsletter_luglio" })).toBe("email");
    expect(classificaFonte({ utm_source: "facebook_ads" })).toBe("social");
    expect(classificaFonte({ referrer: "https://www.google.com" })).toBe("organico");
    expect(classificaFonte({ referrer: "https://facebook.com" })).toBe("social");
    expect(classificaFonte(null)).toBe("diretto");
    expect(classificaFonte({})).toBe("diretto");
  });

  it("sessioni e lead per canale", () => {
    const f = fonti(EVENTI, LEADS, DA, A);
    const byCanale = Object.fromEntries(f.map((x) => [x.canale, x]));
    expect(byCanale.organico).toMatchObject({ sessioni: 1, lead: 1 }); // s1 google / L1
    expect(byCanale.social).toMatchObject({ sessioni: 1, lead: 1 }); // s2 fb / L2
    expect(byCanale.diretto).toMatchObject({ sessioni: 1, lead: 1 }); // s3 / L3
    expect(byCanale.email).toMatchObject({ sessioni: 0, lead: 0 });
  });
});

describe("blog (§PR31)", () => {
  const evBlog: EvtRow[] = [
    ev("b1", "pagina_vista", { pagina: "/blog/guida-uno" }),
    ev("b2", "pagina_vista", { pagina: "/blog/guida-uno" }),
    ev("b1", "tempo_pagina", { pagina: "/blog/guida-uno", dati: { secondi: 30 } }),
    ev("b2", "tempo_pagina", { pagina: "/blog/guida-uno", dati: { secondi: 90 } }),
    ev("b1", "cta_click", { pagina: "/blog/guida-uno", dati: { cta: "blog_calcolatore" } }),
    ev("bp", "pagina_vista", { pagina: "/blog/guida-uno" }, "preview"), // escluso
  ];
  it("per articolo: visite, permanenza mediana, click strumenti", () => {
    const [r] = blog(evBlog);
    expect(r).toMatchObject({
      pagina: "/blog/guida-uno",
      visite: 2, // b1, b2 (preview escluso)
      permanenzaMediana: 60, // mediana(30,90)
      clickStrumenti: 1,
    });
  });
  it("indice blog senza articoli → vuoto", () => {
    expect(blog([ev("x", "pagina_vista", { pagina: "/blog" })])).toEqual([]);
  });
});
