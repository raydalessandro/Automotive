# Spec — Flusso lead e stati

## Stati: 5 esistenti + 3 additivi

Esistenti (`lib/dashboard/tipi.ts`): `nuovo, contattato, preventivo_inviato, chiuso, perso`.
Nuovi: **`assegnato`**, **`preso_in_carico`**, **`in_sospeso`**.

```
nuovo ──(operatore smista)──▶ assegnato ──(venditore)──▶ preso_in_carico ──▶ esito:
                                                          chiuso │ perso │ preventivo_inviato │ in_sospeso
```

`contattato` resta valido come ponte ("ho chiamato, esito da definire") per compatibilità,
ma la UI venditore propone direttamente i quattro esiti. `preventivo_inviato` e `in_sospeso`
sono stati **vivi**: restano nella pipeline dell'operatore e possono transire ancora
(→ chiuso/perso, o → preso_in_carico se la trattativa si riapre). La funzione
`pianoTransizione` è già generica sullo stato: si estendono solo la costante e i test.

## Due sorgenti, una pipeline

1. **Form sito** → lead nativo, stato `nuovo` (flusso già esistente).
2. **Risposta outreach** → un'azienda del magazzino risponde (email/WhatsApp/chiamata):
   l'operatore preme "Crea lead" sulla scheda azienda → nasce un lead `nuovo` con
   `azienda_id` valorizzato. Da lì in poi il flusso è identico per entrambe le sorgenti.

## Migrations (additive)

- **009_venditori.sql** — tabella `venditori` (`id uuid` PK = `auth.users.id`, `nome`,
  `telefono`, `email`, `telegram_chat_id text null`, `attivo bool default true`);
  su `leads`: `assegnato_a uuid null references venditori(id)`, `assegnato_il timestamptz`.
  RLS: il venditore legge/aggiorna solo i lead con `assegnato_a = auth.uid()`.
- **010_ponte_e_note.sql** — `leads.azienda_id uuid null references aziende(id)`;
  `lead_stati_storia.nota text null`; estensione del vincolo sugli stati se presente.

## Note e dati di ritorno

Ogni transizione può portare una `nota` → finisce in `lead_stati_storia` e compone la
timeline. **V1**: testo libero del venditore ("cosa è venuto fuori"), qualunque sia l'esito.
**Fase 2, solo su `perso`**: form a crocette (multi-selezione, 10 secondi, pensato perché
venga compilato davvero):

- canone troppo alto
- ha già un fornitore di noleggio
- preferisce acquisto o leasing
- non è il momento → campo "ricontattare il" (data)
- non ho raggiunto il decisore
- veicolo o allestimento non adatto
- diffidenza verso il noleggio
- altro → nota

Le crocette si salvano come dato strutturato (jsonb sulla riga di storia o tabella
`lead_esiti`) e chiudono il cerchio con la ricerca: perché si perde, per segmento, per
keyword di provenienza (`aziende.fonte_ricerca` via `azienda_id`).

## Brief per la vendita (composizione)

Nessun contenuto nuovo da produrre — è un assemblaggio di ciò che il flusso ha già:

1. Chi sono: ragione sociale, città, settore, dimensione, sito, telefono (da `aziende`).
2. Perché li abbiamo contattati: `segnali` + score (il gancio della ricerca).
3. Cosa gli abbiamo detto: T1 della lista di tiro (gancio usato, canale, leva fiscale).
4. Cosa hanno risposto: la nota della transizione `nuovo`/`assegnato`.
5. Con che conto arrivare: link calcolatore `?forma=…&veicolo=…` precompilato sul regime.
6. Timeline completa degli stati con note.
