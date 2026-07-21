# Spec — Area venditori (smistamento risposte)

> Fase successiva del flusso: ricerca → gate → import → primo contatto → **risposta → smistamento → venditore a voce**.
> Da implementare così com'è (Opus o dev): riusa pezzi già in repo, indicati punto per punto.

## Obiettivo

Separare casa base (l'attuale `/app`: magazzino, campagne, analytics) dall'area venditori.
I venditori vedono SOLO i lead che hanno risposto e che gli sono stati assegnati, con una
scheda-brief che li forma in 60 secondi prima della chiamata. Onboarding di un nuovo
venditore: si crea il profilo, installa la PWA, fa login — nessuna formazione su casa base.

## Non-obiettivi (v1)

Niente accesso venditori a magazzino, batch, campagne o analytics. Niente app native: PWA
installabile ("Aggiungi a schermata Home"). Niente smistamento automatico: assegna l'operatore.

## Modello dati — `supabase/migrations/009_venditori.sql`

- Tabella `venditori`: `id uuid` PK = `auth.users.id`, `nome`, `telefono`, `email`,
  `telegram_chat_id text null`, `attivo bool default true`, `creato_il`.
- Su `leads`: `assegnato_a uuid null references venditori(id)`, `assegnato_il timestamptz`.
- RLS: un venditore legge e aggiorna solo `leads` con `assegnato_a = auth.uid()`.
  Nessun accesso diretto a `aziende`: i campi della scheda si denormalizzano sul lead al
  momento dell'assegnazione (vedi Flusso, punto 3). Ruolo implicito: esiste riga in
  `venditori` ⇒ ruolo venditore, altrimenti casa base.

## Rotte

- `/vendita` — mobile-first, PWA (manifest + icona): lista dei propri lead per stato
  (da chiamare → in corso → esito). `/vendita/[id]` — scheda-brief.
- `middleware.ts`: estendere `matcher` a `"/vendita/:path*"`; dopo `aggiornaSessione`,
  redirect incrociato per ruolo (venditore su `/app` → `/vendita`, e viceversa).

## Scheda-brief (tutta da dati già raccolti, zero lavoro nuovo)

1. Chi sono: ragione sociale, città, settore, dimensione, sito, telefono.
2. Perché li abbiamo contattati: `segnali` + score (il gancio della ricerca).
3. Cosa gli abbiamo detto: canale e messaggio T1 (dalla lista di tiro).
4. Cosa hanno risposto: testo incollato dall'operatore allo smistamento.
5. Con che conto arrivare: link calcolatore parametrico `?forma=…&veicolo=…` precompilato
   (convenzione in `docs/primo-contatto.md`).
6. Azioni: esito chiamata → transizione di stato con `lib/lead/transizione.ts`
   (storia già tracciata dalla migration 008).

## Flusso smistamento

1. Arriva una risposta (email, WhatsApp o chiamata) → in casa base il lead va in `risposto`.
2. In `/app/lead` un pannello "Da smistare" filtra `risposto AND assegnato_a IS NULL`.
3. "Assegna a…" scrive `assegnato_a`, denormalizza la scheda sul lead e notifica il
   venditore su Telegram — nuova `notificaAssegnazione()` in `lib/lead/notifiche.ts`
   (il canale Telegram esiste già lì, riga ~111), con deep-link a `/vendita/[id]`.
4. SLA: chiamata entro 30 minuti in orario ufficio (`docs/primo-contatto.md`).

## Fasi

- **F1**: migration 009 + RLS + `/vendita` lista e scheda in lettura + assegnazione manuale.
- **F2**: notifiche Telegram per venditore, manifest PWA, esiti con transizione stati.
- **F3**: assegnazione a monte del batch (la firma del T1 diventa quella del venditore, così
  le chiamate inbound arrivano già alla persona giusta) + resa per venditore nelle metriche.

## Guardrail

Mai esporre ai venditori `fonte_ricerca`, i batch o aziende non assegnate. Test RLS sul
modello di `lib/lead/transizione.test.ts`. Due venditori oggi, N domani: nessun limite nel modello.
