// Il team di consulenti. Dà un volto alla "voce del responsabile noleggio"
// (blog guida-intervista, consulente). Foto in public/foto/team/.
//
// [DA CONFERMARE] ruoli, cognomi e bio: testi provvisori finché non arrivano
// quelli definitivi dal cliente. Le foto di Ahmed e Shery sono un segnaposto
// (template "consulente") da sostituire con gli scatti veri.

export type Consulente = {
  nome: string;
  ruolo: string;
  bio: string;
  foto: string;
  /** true finché la foto è il segnaposto template. */
  fotoProvvisoria?: boolean;
};

export const TEAM: Consulente[] = [
  {
    nome: "Alessio",
    ruolo: "Responsabile noleggio", // [DA CONFERMARE]
    bio: "Segue i clienti dalla prima domanda alla consegna: capisce l'attività, confronta le proposte e costruisce la formula giusta.",
    foto: "/foto/team/alessio.webp",
  },
  {
    nome: "Ahmed",
    ruolo: "Consulente noleggio", // [DA CONFERMARE]
    bio: "Affianca partite IVA e aziende nella scelta del veicolo e nella gestione del contratto, con un solo interlocutore di riferimento.",
    foto: "/foto/team/placeholder-consulente.webp",
    fotoProvvisoria: true,
  },
  {
    nome: "Shery",
    ruolo: "Consulente noleggio", // [DA CONFERMARE]
    bio: "Affianca partite IVA e aziende nella scelta del veicolo e nella gestione del contratto, con un solo interlocutore di riferimento.",
    foto: "/foto/team/placeholder-consulente.webp",
    fotoProvvisoria: true,
  },
];
