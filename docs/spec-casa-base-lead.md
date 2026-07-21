# Spec — Casa base, pagina Lead (solo operatore)

La pagina era pensata perché la vedessero tutti gli agenti; ora è **personale
dell'operatore**. I venditori non entrano più in `/app`: hanno `/vendita`. Le voci cambiano
di conseguenza: tre viste, una pipeline sola.

## Vista 1 — Da smistare (default)

Lead in stato `nuovo`, dalle due sorgenti. Card:

```
┌──────────────────────────────────────────────────┐
│ R. Guidetti Srl · Milano          [risposta ✉]   │
│ pmi · ascensori · score 5                        │
│ "13 furgoni attrezzati dichiarati sul sito…"     │
│ Ha risposto: "sì, mi interessa il conto…"        │
│                [ Smista a ▾ ]      [ Scarta ]    │
└──────────────────────────────────────────────────┘
```

Badge sorgente: `form sito` oppure `risposta ✉/💬/📞`. "Smista a ▾" elenca i venditori
attivi → transizione a `assegnato` + `assegnato_a` + notifica (PR 5). Contatore in
testata: "3 da smistare". Questa è la coda di lavoro quotidiana dell'operatore.

## Vista 2 — In gestione (la pipeline viva)

Stati `assegnato · preso_in_carico · contattato · preventivo_inviato · in_sospeso`,
raggruppati per venditore. Riga compatta: azienda · stato (pill colorata) · **giorni nello
stato** · ultima nota. Alert visivi: `assegnato` da più di 1 giorno senza presa in carico;
`in_sospeso` o `preventivo_inviato` fermi da più di 7. È qui che l'operatore vede che
preventivi e sospesi sono ancora vivi e vanno spinti — nessun lead sparisce nel nulla.

## Vista 3 — Chiusi

`chiuso` e `perso` con la nota di esito. In Fase 2: i motivi a crocette come filtri
(per motivo, per segmento, per keyword di provenienza) — la pagina diventa lo specchio
di dove e perché si vince o si perde.

## Dettaglio lead (drawer, si apre dalla card)

Brief completo (vedi `spec-flusso-lead.md` §Brief) + timeline `lead_stati_storia` con le
note + azioni dell'operatore: riassegna, riapri, chiudi, scarta.

## Cosa si toglie

Ogni elemento pensato "per gli agenti" dentro `/app`. Il filtro `?stato=` esistente resta
(le tre viste sono scorciatoie sopra gli stessi stati). Nessun componente nuovo di
libreria: card, pill e drawer riusano lo stile della dashboard attuale.
