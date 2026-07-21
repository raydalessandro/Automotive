# Spec — Pipeline operativa completa (v4)

> Consolida la visione dell'operatore. **Sostituisce e assorbe la v3** (che non serve
> più consegnare): questo è l'unico file. Per la PR-6: committarlo come
> `docs/spec-pipeline-operativa-v4.md` al posto della v3 — **SOLO committare, NON
> implementare**: le consegne si scrivono dopo il merge della PR-6 e dopo l'accensione
> (pulizia demo → import batch → migration 012 al deploy).

## Le tre aree

**1. Lavorazione** (operatore + agenti AI) — dalla ricerca all'invio.
**2. Gestione** (venditori + operatore come area manager) — dalla risposta all'esito.
**3. Archivio** (minimo per scelta) — chiusi con commissione, storico cliente.

## Area 1 — Lavorazione: tre colonne, tre mestieri

| Colonna | Contenuto | Chi lavora | Stato azienda |
|---|---|---|---|
| **Ricercate** | elenco con score, dal gate | worker di raccolta | `da_contattare` / `grezza` |
| **Brief pronto** | ricerca approfondita + brief | worker di ricerca | `qualificata` *(nuovo, additivo)* |
| **Messaggio pronto** | comunicazione personalizzata | worker di comunicazione | `messaggio_pronto` *(nuovo, additivo)* |

L'invio chiude la Lavorazione: stato → `contattata` + riga nel **registro
comunicazioni**. Da lì si aspetta la risposta (o il lead dal sito) → Area 2.

Principi:
- Le colonne sono **viste sugli stati** (stesso pattern delle viste lead): due stati
  additivi su `aziende`, zero tabelle di pipeline, zero strutture parallele.
- **Divisione dei mestieri AI**: chi ricerca non scrive, chi scrive non ricerca.
  Due worker, due prompt, un solo gate (protocollo in `PATTERN-settori.md`).
- **Pull, non push**: comanda la colonna "Messaggio pronto". Si ricerca solo quanto
  si riesce a inviare (30–50/giorno): le colonne a monte non crescono all'infinito.

## Registro comunicazioni (il buco da chiudere)

Oggi il T1 inviato vive nella lista di tiro (file), non nel DB: il brief del
venditore non può mostrarlo e la resa non si misura. Tabella `comunicazioni`
(migration additiva): `id, azienda_id, canale (email|whatsapp|telefono|linkedin),
gancio, oggetto, testo, inviato_il, inviato_da`. Da qui:
- il blocco "cosa gli abbiamo detto" del brief letto dal DB, non dai file;
- la **resa per gancio** (risposte/inviati per apertura): la gemella della resa
  per keyword su `fonte_ricerca`, lato messaggio.

## Area 2 — Gestione

**Smistamento** (già vivo): risposta → "Crea lead" con `azienda_id` → venditore.

### La web app venditori (assorbe la v3)

Principio: scaricare completamente i venditori dal sistema — un'app solo loro,
finalizzata alla vendita. È già possibile: la RLS della 011 è verificata dal vivo
e vale anche per **Supabase Realtime** — l'assegnazione compare sul telefono in
tempo reale, senza refresh. Stessa auth, stesse policy, zero backend nuovo.

Moduli, in ordine di arrivo:
1. **Pratiche** — il flusso attuale (`prendo in carico` → esiti + nota) col brief
   completo: ricerca + messaggi inviati (dal registro) + direzione di vendita.
2. **Filo diretto** — commenti per-pratica tra operatore e venditore quando la
   pratica passa di mano. Tabella `lead_commenti` (lead_id, autore, testo, ts),
   RLS come la storia, Realtime. Niente chat generica: il contesto è la pratica.
3. **Formazione** — Ahmed e Shery hanno sempre venduto, mai macchine: moduli su
   prodotto e formula (la NOSTRA formula), tracciamento letto/completato,
   aggiornabile dall'operatore senza deploy.
4. **Offerte** — quando ci saranno i dettagli del fornitore: le sue formule
   rielaborate in offerte nostre (vincoli rispettati, packaging e vendita a modo
   nostro). Il calcolatore parametrico è il motore; qui diventa argomentario.

Nessuna decisione tecnica vincolante ora (app separata vs evoluzione PWA): si
decide quando i moduli 1–2 hanno requisiti maturati dall'uso.

### Form per OGNI esito (estensione naturale della PR-6)

`lead_stati_storia.dettagli jsonb` è già generica → **zero migration nuove**:
si disegnano solo i set di domande (5–10 crocette, 10 secondi, nota opzionale):
- `preventivo_inviato`: veicolo proposto · canone offerto · durata · scadenza preventivo
- `in_sospeso`: motivo attesa (decisore | budget | tempi | documenti | altro) ·
  "risentire il" (data)
- `chiuso`: veicolo · canone · durata · anticipo · **commissione** · **data inizio**
- `perso`: le crocette della PR-6 (in lavorazione)
I set si raffinano guardando i dati. *(F-futura: nota vocale → trascrizione → nota.)*

### Pagina Area Manager (nuova, per l'operatore)

I lead assegnati raggruppati per venditore, con aging per stato (gli alert della
PR-3 promossi a pagina), i dettagli degli esiti in chiaro, e il filo diretto
per-pratica: il sollecito "preventivo fermo da due settimane, come va?" è un
commento sulla pratica — il contesto resta attaccato al lead.

## Area 3 — Archivio (minimo per scelta)

`chiuso` + i dettagli del suo form **sono** lo storico cliente: una pagina che
filtra i chiusi con commissione e dati contratto. Niente CRM ora. Ma
`data_inizio + durata` valgono oro da subito: **la scadenza contratto è il
trigger di rinnovo** — il primo magazzino caldo, fra tre anni, nasce da qui.

## Sequenza di attuazione (dopo la PR-6)

1. **Accensione**: pulizia demo → import dei 16 batch → migration 012 al deploy →
   partenza lista di tiro.
2. **Schema**: una PR piccola con i 2 stati aziende + tabella `comunicazioni`.
3. **UI Lavorazione** (le 3 colonne) in parallelo alla web app venditori:
   condividono brief, registro e realtime.
4. **Form esiti restanti** (solo contenuti, zero schema) + **Area Manager** +
   **Archivio**.

Consegne una alla volta, review in regia, main mai rotto: il metodo non cambia.
