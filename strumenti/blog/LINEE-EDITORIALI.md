# Linee editoriali — Blog Impero Automotive

La voce del sito, in una pagina. Vale per ogni articolo in `contenuti/blog/`.
Chi scrive (sessione agente o umano) parte da qui; Ray cura e pubblica.

## A cosa serve il blog

Non è un blog aziendale. **Ogni articolo nasce da una query di ricerca e finisce su uno
strumento** (calcolatore, configuratore) o una landing. Se un pezzo non porta il lettore a
fare qualcosa, non va pubblicato.

Un articolo = **una** query primaria, 2–4 secondarie, **una** destinazione (la `cta`).

## La voce

- **Diretto e concreto.** Seconda persona ("tu"), frasi brevi. Zero gergo finanziario:
  se una parola la capisce solo un commercialista, spiegala o toglila.
- **Sottotitoli a domanda** o a concetto netto ("Pneumatici", "La riconsegra: chilometri e
  danni"). Il lettore deve poter scorrere e capire.
- **Un esempio numerico dove possibile**, riusando i golden del calcolatore (vedi sotto).
- **Onesto.** Niente iperboli, niente "risparmi il 50%". La forza è la chiarezza, non la
  promessa.
- Lunghezza: **800–1500 parole**.

## SEO senza stuffing

- La **query primaria** compare: nel **titolo**, nei **primi 100 caratteri** del corpo, e
  nello **slug**.
- Le secondarie si usano dove cadono naturali, non a forza.
- Un solo `H1` (lo mette la pagina, dal `titolo`): nel corpo si parte da `##`.
- `descrizione` ≤ **160 caratteri**, con la query dentro: è lo snippet in SERP.

## Regole ferree (non negoziabili)

1. **Nessuna cifra inventata.** Un numero o viene dai config/golden del sito, oppure non si
   scrive: si rimanda con "dipende: calcolalo qui" + link allo strumento.
2. **Nessuna promessa** su condizioni non confermate (tempi, sconti, inclusioni specifiche).
   Si parla di come funziona il noleggio, non di offerte non deliberate.
3. **Mai nominare i fornitori** (nomi, loghi, marchi dei noleggiatori) finché non c'è
   autorizzazione scritta. `contenuti/blog/` deve restare a zero nomi fornitori.
4. **Disclaimer fiscale** ogni volta che si parla di deduzioni/IVA: la deducibilità dipende
   dal profilo, non è consulenza, verificare col commercialista. Usa un blockquote.
5. Ogni prezzo con **"IVA esclusa"**.

## I numeri "golden" (gli unici ammessi per gli esempi fiscali)

Sono i valori dei golden test del calcolatore (`lib/fiscale.test.ts`). A parità di veicolo,
canone IVA esclusa, durata 48 mesi, anticipo 0:

| Profilo | Canone | Costo pieno/mese | Costo reale/mese |
|---|---|---|---|
| Autocarro N1 strumentale | 245 € | ~298,90 € | **~176,64 €** |
| SRL ordinaria (uso promiscuo) | 245 € | ~298,90 € | **~263,67 €** |
| Agente di commercio | 460 € | ~561 € | **~301,76 €** |

Se un articolo cita numeri fiscali, usa questi (o rimanda al calcolatore). Non inventarne
altri: se cambiano i config, questi vanno riverificati contro i golden.

## Frontmatter richiesto (validato da `check:blog`)

```yaml
titolo, slug, descrizione (≤160), data (YYYY-MM-DD), aggiornato_il?, categoria, query_target,
query_secondarie[], tag[], stato ("bozza"|"pubblicato"), in_evidenza, cta
```

- `categoria` ∈ `fisco | guide | flotte | mestieri`
- `cta` ∈ `calcolatore | configuratore | preventivo | agenti | artigiani | aziende`
- `slug` = nome del file senza `.mdx` (minuscole, cifre, trattini)
- Un articolo **pubblicato** deve contenere **almeno un link interno** nel corpo verso uno
  strumento/landing (`/calcolatore`, `/configuratore`, `/preventivo`, `/agenti`, `/artigiani`,
  `/aziende`, `/veicoli`). Senza, `check:blog` rompe il build.

## Formato: guida-intervista

Accanto alla guida classica, un secondo formato per i pezzi che rispondono alle domande
vere dei clienti. Serve quando la query è una domanda ("conviene il noleggio per una
flotta?", "come leggo un'offerta di noleggio?") e la risposta guadagna dalla voce di chi
il noleggio lo fa tutti i giorni.

- **Struttura a domande.** Ogni `H2` è una domanda del cliente, posta come la porrebbe lui
  ("Quanto mi conviene davvero?", "E se cambio idea a metà?"). Sotto, la risposta.
- **Voce esperta interna.** Le risposte sono attribuite a **"il nostro responsabile noleggio"**
  (nome proprio solo quando autorizzato per iscritto — **[APERTO]** finché non arriva).
  Tono da persona competente che ti spiega le cose, non da brochure.
- **Autore e date visibili.** Il pezzo mostra autore, `data` e, se rivisto, `aggiornato_il`.
  Una guida-intervista è utile perché è firmata e datata: dà fiducia.
- **Regole ferree invariate.** Valgono tutte quelle sopra: zero cifre inventate, zero nomi
  di fornitori o concorrenti, disclaimer fiscale, "IVA esclusa". La voce è più calda, i
  fatti restano gli stessi.
- **Chiusura sullo strumento.** L'ultima domanda porta alla `cta` ("E adesso come faccio i
  conti sulla mia situazione?" → calcolatore/configuratore).

Il frontmatter è lo stesso; `categoria` più adatta di solito `guide` o `flotte`.

## Il flusso

1. Scegli la query dal piano (§2 della spec: cluster fisco / guide / flotte / mestieri).
2. Lancia `PROMPT-articolo.md` in una sessione, riempiendo i parametri.
3. L'output **è** il file `.mdx` completo, `stato: bozza` → salvalo in `contenuti/blog/`.
4. Revisione umana (Ray): verità dei numeri, tono, zero fornitori.
5. `stato: pubblicato` → `npm run check:blog` → commit → deploy.

Le bozze non escono da nulla (build, indice, sitemap, RSS): puoi lavorarci con calma.
