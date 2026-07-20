// Prova sociale (§4 spec Home v2). Alimenta il componente ProvaSociale.
//
// REGOLA FERREA: mai testimonianze inventate, mai contatori gonfiati ("500+ clienti").
// Si accende SOLO con clienti veri: nome, attività, frase autorizzata PER ISCRITTO.
// Lista vuota => la sezione non renderizza nulla.
//
// Processo (fuori codice): dopo ogni consegna si chiede al cliente una frase +
// autorizzazione scritta. Le prime tre alimentano questa sezione.

export type Prova = {
  /** Frase autorizzata per iscritto dal cliente. */
  frase: string;
  nome: string;
  attivita: string;
};

export const PROVE: Prova[] = [
  // Vuota fino ai primi clienti veri. Nessuna testimonianza inventata.
];
