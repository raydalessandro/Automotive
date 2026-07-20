// Il team di consulenti (§spec chi-siamo). Dà un volto alla consulenza nel funnel.
// Nessuna gerarchia: card identiche, mai "responsabile/titolare/fondatore".
//
// Le foto vivono in public/team/<nome>.webp (800×800, pipeline scripts/foto-team.ts).
// Il campo `foto` si valorizza SOLO quando il file esiste davvero: finché manca,
// la UI mostra il segnaposto a iniziali (components/Avatar). Il build non dipende
// dai file foto.
//
// TODO: aggiungere una riga personale per ciascuno (cosa piace del lavoro coi
// clienti) quando la manda Ray.

export type Consulente = {
  nome: string;
  ruolo: string;
  bio: string;
  /** Riga umana, in prima persona. [DA CONFERMARE]: sono parole loro, non nostre. */
  notaPersonale?: string;
  /** Path in public/. Assente => segnaposto a iniziali. */
  foto?: string;
};

// [DA CONFERMARE] le notaPersonale sono bozze da far correggere a Shery e Ahmed
// (Alessio la sua); sostituire con le frasi vere quando arrivano.
export const TEAM: Consulente[] = [
  {
    nome: "Shery",
    ruolo: "Consulente clienti",
    bio: "Segue la tua pratica dal primo preventivo alla consegna.",
    notaPersonale: "Quello che mi piace? Togliere l'ansia dei conti a chi ha già mille pensieri di lavoro.",
    foto: "/team/shery.webp",
  },
  {
    nome: "Ahmed",
    ruolo: "Consulente clienti",
    bio: "Ti aiuta a scegliere la copertura giusta, senza venderti quello che non serve.",
    notaPersonale: "Preferisco dirti cosa non ti serve: un cliente che si fida vale più di un extra venduto.",
    foto: "/team/ahmed.webp",
  },
  {
    nome: "Alessio",
    ruolo: "Ricerca e strumenti",
    bio: "Costruisce i calcolatori che vedi sul sito e tiene i conti onesti: se un numero è qui, è verificabile.",
    notaPersonale: "Se un numero è sul sito, l'ho verificato. Odio le sorprese in fondo al contratto.",
    foto: "/team/alessio.webp",
  },
];

/** I due che richiamano il cliente (§2 CardRichiamo): Shery e Ahmed. */
export const RICHIAMO: Consulente[] = TEAM.slice(0, 2);

// Iniziali per il segnaposto avatar: prime due lettere (o iniziali di nome+cognome).
export function iniziali(nome: string): string {
  const parti = nome.trim().split(/\s+/).filter(Boolean);
  if (parti.length >= 2) return (parti[0][0] + parti[1][0]).toUpperCase();
  return nome.trim().slice(0, 2).toUpperCase();
}
