import type { FaqItem } from "@/components/Faq";

// FAQ "canoni onesti" (§Anticipo zero). Solo matematica, mai nomi di concorrenti.
export const FAQ_ANTICIPO: FaqItem[] = [
  {
    d: "Perché altrove i canoni sembrano più bassi?",
    r: "Di solito per quattro leve: un anticipo alto spalmato nel tempo, meno chilometri inclusi, servizi lasciati fuori dal canone (kasko, gomme, auto sostitutiva) e durate diverse difficili da paragonare. Il metro onesto è il canone equivalente: (canone × mesi + anticipo) ÷ mesi. Riportando tutto a quel numero, i conti tornano.",
    cta: { href: "/calcolatore", label: "Verifica qualsiasi offerta col calcolatore" },
  },
  {
    d: "Cos'è il canone equivalente?",
    r: "È il canone più l'anticipo spalmato sulla durata: (canone × mesi + anticipo) ÷ mesi. Serve a confrontare offerte con anticipi diversi su un solo numero. Lo mostriamo anche sui nostri veicoli con anticipo (es. un 460 € con 2.459 € su 48 mesi diventa ~511 €): applichiamo a noi stessi il criterio che chiediamo di usare.",
    cta: { href: "/calcolatore", label: "Fai i conti col calcolatore" },
  },
];

// FAQ comuni con dati veri (§5 spec configuratore). Appese alle landing di segmento.
export const FAQ_COMUNI: FaqItem[] = [
  {
    d: "Quanto dura il contratto?",
    r: "Da 1 a 4 anni (12–48 mesi). Scegli la durata in base a come usi il veicolo; il canone si adatta di conseguenza.",
  },
  {
    d: "In quanto tempo arriva il veicolo?",
    r: "Per un usato in pronta consegna, in genere 15–30 giorni. Per un veicolo nuovo, da 1,5 a 4 mesi a seconda di modello e allestimento.",
  },
  {
    d: "Che documenti servono?",
    r: "Per le persone: carta d'identità, codice fiscale, patente e ultimi redditi con relativa ricevuta. Per le aziende, in più la visura camerale.",
  },
  {
    d: "La kasko è obbligatoria?",
    r: "No, è opzionale. Senza kasko, in caso di danno le franchigie a tuo carico possono essere alte: nel configuratore vedi il rischio e scegli se coprirti.",
  },
  {
    d: "Le gomme sono incluse?",
    r: "Il primo treno di gomme è incluso nel canone. Per chi macina tanti chilometri, i treni aggiuntivi si definiscono nel preventivo.",
  },
];
