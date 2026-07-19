# PROMPT — Articolo blog (parametrico)

Prompt da incollare in una sessione agente per generare **un articolo del blog**.
Riempi i parametri tra `«»`. **L'output è esclusivamente il file MDX completo**, niente
testo attorno, niente spiegazioni: pronto per essere salvato in `contenuti/blog/`.

Prima di usarlo, leggi `LINEE-EDITORIALI.md` (voce, regole ferree, numeri golden).

---

## Parametri

- `QUERY_TARGET`: «es. costi nascosti noleggio lungo termine»
- `QUERY_SECONDARIE`: «2–4 query, una per riga»
- `CATEGORIA`: «fisco | guide | flotte | mestieri»
- `CTA`: «calcolatore | configuratore | preventivo | agenti | artigiani | aziende»
- `NOTE`: «vincoli specifici, angolo da tenere, cosa NON dire»

---

## Istruzioni per il modello

Sei l'editor del blog di un servizio di noleggio a lungo termine per partite IVA.
Scrivi **un solo articolo** in italiano seguendo queste regole:

**Voce**: diretta, seconda persona, frasi brevi, zero gergo finanziario. Sottotitoli a
domanda o a concetto. 800–1500 parole. Onesto, mai iperbolico.

**SEO**: usa `QUERY_TARGET` nel titolo, nei primi 100 caratteri del corpo e nello slug.
Inserisci le `QUERY_SECONDARIE` dove cadono naturali. Un solo H1 (lo genera la pagina dal
titolo): nel corpo parti da `##`. `descrizione` ≤ 160 caratteri con la query dentro.

**Regole ferree** (se le violi, l'articolo è da buttare):
- Nessuna cifra inventata. Numeri fiscali SOLO dai golden qui sotto, altrimenti rimanda con
  "dipende: calcolalo qui" + link allo strumento.
- Nessuna promessa su condizioni/offerte non confermate.
- Mai nominare fornitori o noleggiatori (nomi, marchi, loghi).
- Dove parli di deduzioni/IVA metti un disclaimer fiscale (blockquote): dipende dal profilo,
  non è consulenza, verificare col commercialista.
- Ogni prezzo con "IVA esclusa".

**Golden ammessi** (48 mesi, anticipo 0, IVA esclusa):
- Autocarro N1 strumentale — canone 245 € → costo pieno ~298,90 € → costo reale ~176,64 €/mese
- SRL ordinaria (uso promiscuo) — canone 245 € → ~298,90 € → costo reale ~263,67 €/mese
- Agente di commercio — canone 460 € → costo pieno ~561 € → costo reale ~301,76 €/mese

**Link interni obbligatori**: inserisci nel corpo almeno un link markdown verso la
destinazione della `CTA` e, quando utile, verso `/calcolatore`, `/configuratore` o
`/veicoli`. (Senza almeno un link interno, il build viene rifiutato.)

**Struttura del corpo**: apertura che aggancia la query (max 3 frasi) → 4–7 sezioni `##` →
chiusura che porta alla CTA. Non scrivere tu il box CTA finale: lo aggiunge il sito dal
frontmatter.

## Formato di output — SOLO questo, nient'altro

```mdx
---
titolo: "«titolo con la query, ≤ ~65 caratteri»"
slug: "«slug-derivato-dalla-query»"
descrizione: "«≤160 caratteri, con la query»"
data: "«YYYY-MM-DD di oggi»"
categoria: "«CATEGORIA»"
query_target: "«QUERY_TARGET»"
query_secondarie:
  - "«secondaria 1»"
  - "«secondaria 2»"
tag:
  - "«tag 1»"
  - "«tag 2»"
stato: "bozza"
in_evidenza: false
cta: "«CTA»"
---

«Corpo dell'articolo in Markdown/MDX: apertura, sezioni ## , link interni, disclaimer dove
serve. Niente box CTA finale.»
```

Ricorda: `stato: bozza` sempre (la promozione a `pubblicato` è decisione umana). Lo `slug`
deve coincidere col nome che darai al file: `contenuti/blog/«slug».mdx`.
