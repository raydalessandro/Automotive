import { describe, it, expect } from "vitest";
import { parseIntake, targetDaBody, coreLeadInsert, type Intake } from "./intake";

/** Body core valido riutilizzabile; sovrascrivi i campi con lo spread. */
function bodyValido(over: Record<string, unknown> = {}) {
  return {
    target: "nlt_giovani",
    ragione_sociale: "Mario Rossi",
    telefono: "3331234567",
    consenso_privacy: true,
    ...over,
  };
}

/** Costruisce un Intake valido per i test di coreLeadInsert. */
function intakeValido(over: Record<string, unknown> = {}): Intake {
  const r = parseIntake(bodyValido(over));
  if (!r.ok) throw new Error("bodyValido dovrebbe essere valido: " + r.errore);
  return r.data;
}

describe("parseIntake — body valido (§PR-9)", () => {
  it("target nlt_giovani con dati preservati → ok:true", () => {
    const r = parseIntake(bodyValido({ dati: { eta: 22 } }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.target).toBe("nlt_giovani");
      expect(r.data.ragione_sociale).toBe("Mario Rossi");
      expect(r.data.telefono).toBe("3331234567");
      expect(r.data.dati).toEqual({ eta: 22 });
    }
  });
});

describe("parseIntake — consenso_privacy deve essere true", () => {
  it.each([
    ["false", false],
    ["assente", undefined],
  ])("consenso_privacy=%s → ok:false", (_label, valore) => {
    const over: Record<string, unknown> = {};
    if (valore !== undefined) over.consenso_privacy = valore;
    const body = bodyValido(over);
    if (valore === undefined) delete (body as Record<string, unknown>).consenso_privacy;
    expect(parseIntake(body).ok).toBe(false);
  });
});

describe("parseIntake — telefono", () => {
  it.each([
    ["non numerico", "abc"],
    ["troppo corto", "12"],
  ])("telefono %s → ok:false", (_label, tel) => {
    expect(parseIntake(bodyValido({ telefono: tel })).ok).toBe(false);
  });

  it.each([
    ["con prefisso +", "+39 333 1234567"],
    ["con spazi", "333 123 4567"],
    ["con parentesi e trattini", "(333) 123-4567"],
  ])("telefono %s → ok:true", (_label, tel) => {
    expect(parseIntake(bodyValido({ telefono: tel })).ok).toBe(true);
  });
});

describe("parseIntake — ragione_sociale obbligatoria", () => {
  it.each([
    ["vuota", ""],
    ["solo spazi", "   "],
  ])("ragione_sociale %s → ok:false", (_label, rs) => {
    expect(parseIntake(bodyValido({ ragione_sociale: rs })).ok).toBe(false);
  });

  it("mancante → ok:false", () => {
    const body = bodyValido();
    delete (body as Record<string, unknown>).ragione_sociale;
    expect(parseIntake(body).ok).toBe(false);
  });
});

describe("parseIntake — email", () => {
  it("assente → ok:true", () => {
    const body = bodyValido();
    delete (body as Record<string, unknown>).email;
    expect(parseIntake(body).ok).toBe(true);
  });

  it("stringa vuota accettata → ok:true", () => {
    expect(parseIntake(bodyValido({ email: "" })).ok).toBe(true);
  });

  it("email malformata → ok:false", () => {
    expect(parseIntake(bodyValido({ email: "x@" })).ok).toBe(false);
  });
});

describe("parseIntake — fonte accetta stringa oppure oggetto", () => {
  it.each([
    ["stringa", "prova"],
    ["oggetto tracciamento", { utm_source: "x" }],
  ])("fonte %s → ok:true", (_label, fonte) => {
    const r = parseIntake(bodyValido({ fonte }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.fonte).toEqual(fonte);
  });
});

describe("parseIntake — dati opzionale, passa com'è", () => {
  it("oggetto arbitrario preservato in data.dati", () => {
    const dati = { eta: 22, patente_da_anni: 3 };
    const r = parseIntake(bodyValido({ dati }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.dati).toEqual(dati);
  });

  it("assente → ok:true con data.dati undefined", () => {
    const r = parseIntake(bodyValido());
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.dati).toBeUndefined();
  });
});

describe("targetDaBody — instradamento, fallback nlt_b2b", () => {
  it("target valido → torna il target", () => {
    expect(targetDaBody({ target: "nlt_giovani" })).toBe("nlt_giovani");
  });

  it("target con spazi → trimmed", () => {
    expect(targetDaBody({ target: "  x  " })).toBe("x");
  });

  it.each([
    ["oggetto vuoto", {}],
    ["target stringa vuota", { target: "" }],
    ["target solo spazi", { target: "   " }],
    ["target numero", { target: 123 }],
    ["null", null],
    ["stringa", "str"],
    ["undefined", undefined],
  ])("%s → nlt_b2b", (_label, body) => {
    expect(targetDaBody(body)).toBe("nlt_b2b");
  });
});

describe("coreLeadInsert — normalizzazione stringhe vuote → null", () => {
  it("email/provincia/pagina vuote → null; consenso_marketing default false", () => {
    const d = intakeValido({ email: "", provincia: "", pagina: "" });
    const row = coreLeadInsert(d);
    expect(row.email).toBeNull();
    expect(row.provincia).toBeNull();
    expect(row.pagina).toBeNull();
    expect(row.consenso_marketing).toBe(false);
    expect(row.ragione_sociale).toBe("Mario Rossi");
    expect(row.telefono).toBe("3331234567");
    expect(row.consenso_privacy).toBe(true);
  });

  it("valori presenti → preservati e trimmed", () => {
    const d = intakeValido({ email: "a@b.com", provincia: "MI" });
    const row = coreLeadInsert(d);
    expect(row.email).toBe("a@b.com");
    expect(row.provincia).toBe("MI");
  });
});
