# Spec — App venditori (/vendita, PWA)

> v2 — allineata al flusso dell'operatore. Stati e migrations in `spec-flusso-lead.md`,
> UX di casa base in `spec-casa-base-lead.md`, sequenza PR in `piano-implementazione.md`.

## Principio

Il venditore non vede il sistema: vede solo i **suoi** contatti da sentire, con più
informazioni possibili per chiudere la vendita. Due schermate, bottoni grandi, zero menu.
PWA installabile ("Aggiungi a schermata Home"), nessuno store. Onboarding di un nuovo
venditore: riga in `venditori`, login, fine — niente formazione su casa base.

## Schermata 1 — I miei lead

Tre sezioni, nell'ordine di urgenza:
**Da prendere in carico** (`assegnato`, con il tempo trascorso in evidenza) ·
**In corso** (`preso_in_carico`, `contattato`) ·
**In gestione** (`preventivo_inviato`, `in_sospeso`).
Card minima: azienda · città · pill stato · gancio in una riga. Tap → scheda.

## Schermata 2 — Scheda (il brief che forma il venditore)

I sei blocchi del brief (`spec-flusso-lead.md` §Brief): chi sono, perché li abbiamo
contattati, cosa gli abbiamo detto, cosa hanno risposto, con che conto arrivare, timeline.
Telefono e sito cliccabili; link calcolatore precompilato pronto da condividere.

Azioni:
- da `assegnato`: un solo bottone grande **[ Prendo in carico ]**;
- da `preso_in_carico`: quattro bottoni esito **[ Chiuso ✓ ] [ Preventivo inviato ]
  [ In sospeso ] [ Perso ]**, ognuno con campo nota "cosa è venuto fuori";
- su `perso`, in Fase 2, al posto della sola nota si apre il form a crocette (10 secondi).

## Tecnica

- Rotta `/vendita` protetta: `middleware.ts` con matcher esteso e redirect per ruolo
  (riga in `venditori` ⇒ `/vendita`; operatore ⇒ `/app`).
- Dati via RLS (`assegnato_a = auth.uid()`): la PWA parla direttamente col DB.
- Transizioni con `pianoTransizione` (patch + storia + nota): stessa macchina di casa base.
- Notifica Telegram all'assegnazione con deep-link alla scheda (`lib/lead/notifiche.ts`).

## Guardrail

Mai esporre: `fonte_ricerca`, batch, aziende non assegnate, analytics. Test RLS sul
modello di `transizione.test.ts`. Due venditori oggi, N domani senza cambiare nulla.
