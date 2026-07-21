import { describe, it, expect } from "vitest";
import { STATI_LEAD, type StatoLead } from "@/lib/dashboard/tipi";
import {
  sezioneVenditore,
  raggruppaVenditore,
  tempoTrascorso,
  type SezioneVenditore,
} from "./sezioni";

// ————— Riferimento temporale fisso (mai Date.now()) —————
const NOW = Date.parse("2026-07-21T12:00:00Z");

// Costruisce un ISO spostato di `ms` millisecondi rispetto a NOW.
// oreFa(5) = 5 ore prima di NOW; oreFa(-1) = 1 ora nel futuro.
function oreFa(n: number): string {
  return new Date(NOW - n * 3_600_000).toISOString();
}

function minutiFa(n: number): string {
  return new Date(NOW - n * 60_000).toISOString();
}

function giorniFa(n: number): string {
  return new Date(NOW - n * 86_400_000).toISOString();
}

describe("sezioneVenditore: stato → sezione PWA venditore (§PR-4)", () => {
  it("assegnato → da_prendere", () => {
    expect(sezioneVenditore("assegnato")).toBe("da_prendere");
  });

  it("preso_in_carico e contattato → in_corso", () => {
    expect(sezioneVenditore("preso_in_carico")).toBe("in_corso");
    expect(sezioneVenditore("contattato")).toBe("in_corso");
  });

  it("preventivo_inviato e in_sospeso → in_gestione", () => {
    expect(sezioneVenditore("preventivo_inviato")).toBe("in_gestione");
    expect(sezioneVenditore("in_sospeso")).toBe("in_gestione");
  });

  it("nuovo, chiuso, perso → null (non compaiono nella PWA del venditore)", () => {
    expect(sezioneVenditore("nuovo")).toBeNull();
    expect(sezioneVenditore("chiuso")).toBeNull();
    expect(sezioneVenditore("perso")).toBeNull();
  });

  it("copre OGNI StatoLead di STATI_LEAD (nessuno stato sfugge in silenzio)", () => {
    // Se un domani si aggiunge uno stato a STATI_LEAD, o ha una sezione nota
    // o cade esplicitamente su null: questo test lo verifica subito.
    const atteso: Record<StatoLead, SezioneVenditore | null> = {
      nuovo: null,
      contattato: "in_corso",
      assegnato: "da_prendere",
      preso_in_carico: "in_corso",
      preventivo_inviato: "in_gestione",
      in_sospeso: "in_gestione",
      chiuso: null,
      perso: null,
    };
    for (const s of STATI_LEAD) {
      expect(sezioneVenditore(s)).toBe(atteso[s]);
    }
  });
});

describe("raggruppaVenditore: bucket per sezione, stati non pertinenti scartati", () => {
  // Fixture che copre TUTTI gli stati di STATI_LEAD.
  const leads = [
    { id: "a1", stato: "assegnato" as StatoLead },
    { id: "c1", stato: "contattato" as StatoLead },
    { id: "p1", stato: "preso_in_carico" as StatoLead },
    { id: "q1", stato: "preventivo_inviato" as StatoLead },
    { id: "s1", stato: "in_sospeso" as StatoLead },
    // Non pertinenti: devono sparire da tutti i bucket.
    { id: "n1", stato: "nuovo" as StatoLead },
    { id: "x1", stato: "chiuso" as StatoLead },
    { id: "z1", stato: "perso" as StatoLead },
  ];

  it("lunghezze dei bucket corrette", () => {
    const g = raggruppaVenditore(leads);
    expect(g.da_prendere).toHaveLength(1);
    expect(g.in_corso).toHaveLength(2);
    expect(g.in_gestione).toHaveLength(2);
  });

  it("appartenenza: ogni lead nel bucket giusto", () => {
    const g = raggruppaVenditore(leads);
    expect(g.da_prendere.map((l) => l.id)).toEqual(["a1"]);
    expect(g.in_corso.map((l) => l.id).sort()).toEqual(["c1", "p1"]);
    expect(g.in_gestione.map((l) => l.id).sort()).toEqual(["q1", "s1"]);
  });

  it("gli stati non pertinenti (nuovo/chiuso/perso) sono assenti da ogni bucket", () => {
    const g = raggruppaVenditore(leads);
    const presenti = [...g.da_prendere, ...g.in_corso, ...g.in_gestione].map((l) => l.id);
    expect(presenti).not.toContain("n1");
    expect(presenti).not.toContain("x1");
    expect(presenti).not.toContain("z1");
    // La somma dei bucket ignora i 3 scartati.
    expect(presenti).toHaveLength(leads.length - 3);
  });

  it("lista vuota → tre bucket vuoti", () => {
    expect(raggruppaVenditore([])).toEqual({ da_prendere: [], in_corso: [], in_gestione: [] });
  });
});

describe("tempoTrascorso: etichetta leggibile con nowMs fisso", () => {
  it("null → trattino", () => {
    expect(tempoTrascorso(null, NOW)).toBe("—");
  });

  it("30 minuti fa → «meno di un'ora»", () => {
    expect(tempoTrascorso(minutiFa(30), NOW)).toBe("meno di un'ora");
  });

  it("esattamente 1 ora fa → «1 ora» (singolare)", () => {
    expect(tempoTrascorso(oreFa(1), NOW)).toBe("1 ora");
  });

  it("5 ore fa → «5 ore» (plurale)", () => {
    expect(tempoTrascorso(oreFa(5), NOW)).toBe("5 ore");
  });

  it("esattamente 24 ore fa → «1 giorno» (singolare)", () => {
    expect(tempoTrascorso(giorniFa(1), NOW)).toBe("1 giorno");
  });

  it("3 giorni fa → «3 giorni» (plurale)", () => {
    expect(tempoTrascorso(giorniFa(3), NOW)).toBe("3 giorni");
  });

  it("timestamp nel futuro → «poco fa» (mai negativo)", () => {
    expect(tempoTrascorso(oreFa(-2), NOW)).toBe("poco fa");
  });
});
