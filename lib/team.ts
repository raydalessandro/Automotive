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
  /** Path in public/. Assente => segnaposto a iniziali. */
  foto?: string;
};

export const TEAM: Consulente[] = [
  {
    nome: "Shery",
    ruolo: "Consulente clienti",
    bio: "Segue la tua pratica dal primo preventivo alla consegna.",
    foto: "/team/shery.webp",
  },
  {
    nome: "Ahmed",
    ruolo: "Consulente clienti",
    bio: "Ti aiuta a scegliere la copertura giusta, senza venderti quello che non serve.",
    foto: "/team/ahmed.webp",
  },
  {
    nome: "Alessio",
    ruolo: "Ricerca e strumenti",
    bio: "Costruisce i calcolatori che vedi sul sito e tiene i conti onesti: se un numero è qui, è verificabile.",
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
