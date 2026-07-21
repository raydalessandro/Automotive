import { describe, it, expect } from "vitest";
import { STATI_LEAD, type Lead, type StatoLead } from "./tipi";
import {
  vistaDi,
  raggruppaViste,
  giorniNelloStato,
  alertGestione,
  sorgenteDi,
  type Vista,
} from "./viste-lead";

// ————— Riferimento temporale fisso (mai Date.now()) —————
const NOW = Date.parse("2026-07-21T12:00:00Z");

// Giorni prima di NOW, come ISO. giorno(3) = 3 giorni interi fa.
function giorniFa(n: number): string {
  return new Date(NOW - n * 86400000).toISOString();
}

// Lead minimale: solo i campi che le viste leggono. Cast as Lead perché i
// signature usano Pick, ma restiamo su un oggetto piccolo e leggibile.
function lead(over: Partial<Lead> = {}): Lead {
  return {
    id: over.id ?? "L",
    stato: over.stato ?? "nuovo",
    created_at: over.created_at ?? giorniFa(0),
    aggiornato_il: over.aggiornato_il ?? null,
    azienda_id: over.azienda_id ?? null,
    ...over,
  } as Lead;
}

describe("vistaDi: classificazione stato → vista (§PR-3)", () => {
  it("nuovo → da_smistare", () => {
    expect(vistaDi("nuovo")).toBe("da_smistare");
  });

  it("chiuso e perso → chiusi", () => {
    expect(vistaDi("chiuso")).toBe("chiusi");
    expect(vistaDi("perso")).toBe("chiusi");
  });

  it("stati della pipeline viva → in_gestione", () => {
    for (const s of ["contattato", "assegnato", "preso_in_carico", "preventivo_inviato", "in_sospeso"] as StatoLead[]) {
      expect(vistaDi(s)).toBe("in_gestione");
    }
  });

  it("copre OGNI StatoLead di STATI_LEAD (nessun nuovo stato può sfuggire)", () => {
    // Se un domani si aggiunge uno stato a STATI_LEAD, o cade in una vista nota
    // o questo test lo scopre subito.
    const atteso: Record<StatoLead, Vista> = {
      nuovo: "da_smistare",
      contattato: "in_gestione",
      assegnato: "in_gestione",
      preso_in_carico: "in_gestione",
      preventivo_inviato: "in_gestione",
      in_sospeso: "in_gestione",
      chiuso: "chiusi",
      perso: "chiusi",
    };
    for (const s of STATI_LEAD) {
      expect(vistaDi(s)).toBe(atteso[s]);
    }
  });
});

describe("raggruppaViste: bucket per vista con conteggi coerenti", () => {
  const leads: Lead[] = [
    lead({ id: "n1", stato: "nuovo" }),
    lead({ id: "n2", stato: "nuovo" }),
    lead({ id: "g1", stato: "assegnato" }),
    lead({ id: "g2", stato: "preso_in_carico" }),
    lead({ id: "g3", stato: "contattato" }),
    lead({ id: "g4", stato: "preventivo_inviato" }),
    lead({ id: "g5", stato: "in_sospeso" }),
    lead({ id: "c1", stato: "chiuso" }),
    lead({ id: "c2", stato: "perso" }),
  ];

  it("lunghezze dei bucket corrette", () => {
    const g = raggruppaViste(leads);
    expect(g.da_smistare).toHaveLength(2);
    expect(g.in_gestione).toHaveLength(5);
    expect(g.chiusi).toHaveLength(2);
  });

  it("la somma dei bucket copre tutti i lead", () => {
    const g = raggruppaViste(leads);
    expect(g.da_smistare.length + g.in_gestione.length + g.chiusi.length).toBe(leads.length);
  });

  it("appartenenza: ogni lead nel bucket giusto", () => {
    const g = raggruppaViste(leads);
    expect(g.da_smistare.map((l) => l.id).sort()).toEqual(["n1", "n2"]);
    expect(g.in_gestione.map((l) => l.id).sort()).toEqual(["g1", "g2", "g3", "g4", "g5"]);
    expect(g.chiusi.map((l) => l.id).sort()).toEqual(["c1", "c2"]);
  });

  it("lista vuota → tre bucket vuoti", () => {
    expect(raggruppaViste([])).toEqual({ da_smistare: [], in_gestione: [], chiusi: [] });
  });
});

describe("giorniNelloStato: giorni interi da aggiornato_il (fallback created_at)", () => {
  it("aggiornato oggi → 0", () => {
    expect(giorniNelloStato(lead({ aggiornato_il: giorniFa(0) }), NOW)).toBe(0);
  });

  it("aggiornato 3 giorni fa → 3", () => {
    expect(giorniNelloStato(lead({ aggiornato_il: giorniFa(3) }), NOW)).toBe(3);
  });

  it("aggiornato_il null → usa created_at", () => {
    expect(giorniNelloStato(lead({ aggiornato_il: null, created_at: giorniFa(5) }), NOW)).toBe(5);
  });

  it("data futura → mai negativo (0)", () => {
    expect(giorniNelloStato(lead({ aggiornato_il: giorniFa(-2) }), NOW)).toBe(0);
  });
});

describe("alertGestione: soglie per stato (§spec)", () => {
  it("assegnato: falso a esattamente 1 giorno, vero a 2 (>1)", () => {
    expect(alertGestione(lead({ stato: "assegnato", aggiornato_il: giorniFa(1) }), NOW)).toBe(false);
    expect(alertGestione(lead({ stato: "assegnato", aggiornato_il: giorniFa(2) }), NOW)).toBe(true);
  });

  it("preventivo_inviato: falso a esattamente 7 giorni, vero a 8 (>7)", () => {
    expect(alertGestione(lead({ stato: "preventivo_inviato", aggiornato_il: giorniFa(7) }), NOW)).toBe(false);
    expect(alertGestione(lead({ stato: "preventivo_inviato", aggiornato_il: giorniFa(8) }), NOW)).toBe(true);
  });

  it("in_sospeso: falso a esattamente 7 giorni, vero a 8 (>7)", () => {
    expect(alertGestione(lead({ stato: "in_sospeso", aggiornato_il: giorniFa(7) }), NOW)).toBe(false);
    expect(alertGestione(lead({ stato: "in_sospeso", aggiornato_il: giorniFa(8) }), NOW)).toBe(true);
  });

  it("altri stati: sempre falso anche se fermi da tanto", () => {
    expect(alertGestione(lead({ stato: "preso_in_carico", aggiornato_il: giorniFa(30) }), NOW)).toBe(false);
    expect(alertGestione(lead({ stato: "contattato", aggiornato_il: giorniFa(30) }), NOW)).toBe(false);
  });
});

describe("sorgenteDi: risposta vs form", () => {
  it("azienda_id valorizzato → risposta", () => {
    expect(sorgenteDi(lead({ azienda_id: "az-1" }))).toBe("risposta");
  });

  it("azienda_id null → form", () => {
    expect(sorgenteDi(lead({ azienda_id: null }))).toBe("form");
  });
});
