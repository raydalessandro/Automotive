# SEQUENZE EMAIL — quattro segmenti, tre tocchi · v1

Testi pronti da incollare nell'editor campagne (`/app/campagne`). Una campagna per tocco:
nome suggerito `<segmento>-t1/-t2/-t3` + eventuale sigla del batch (es. `artigiani-t1-lombardia-01`).

## Regole d'uso

- **Segnaposto disponibili nel corpo:** `{ragione_sociale}`, `{citta}`, `{provincia}`, `{settore}`, `{segmento}`. Usare `{citta}` e `{settore}` **solo** se il batch li ha valorizzati per tutte le aziende selezionate — un segnaposto vuoto in mezzo alla frase si vede.
- **Sostituire prima di incollare:** `[DOMINIO]`, `[NOME VENDITORE]`, `[TELEFONO]`.
- Il footer con l'**opt-out lo aggiunge il motore**: non scriverlo nel corpo.
- Un solo link per email + la CTA "rispondi". Niente allegati, niente immagini, niente maiuscole urlate, mai la parola "gratis".
- I numeri usati (177 €, 299 €, percentuali fiscali) vengono dai golden test del calcolatore: se il commercialista corregge le costanti, correggere anche qui.
- Prudenza mantenuta di proposito dove mancano le risposte del fornitore: nessuna promessa su auto sostitutiva, tempi di consegna, dettagli delle formule agenti. Da arricchire dopo l'incontro.

## Calendario

T1 → **T2 dopo 3–4 giorni lavorativi** → **T3 dopo altri 4–5**. Prima di accodare un follow-up, escludere chi ha risposto o si è disiscritto.

> **Selezione follow-up (implementata, PR14):** nell'editor campagna c'è l'opzione
> **"Follow-up: aziende già in campagna"** (con eventuale filtro "già raggiunte dalla campagna X").
> T2 e T3 vanno accodati con questa opzione attiva: selezionano le aziende `in_campagna` ed
> escludono per costruzione chi è passato a `risposto`, `lead`, `non_interessata`, `opt_out`.

---

## 1 · ARTIGIANI E INSTALLATORI

### artigiani-t1 — oggetto: `Il conto vero sul furgone aziendale`
*(alternativa: `245 € che diventano 177`)*

```
Buongiorno,

vi scrivo perché {ragione_sociale} lavora con i propri mezzi, e sui veicoli
commerciali c'è un conto che quasi nessuno fa: un N1 a noleggio è deducibile
al 100%, IVA compresa.

Un esempio concreto: Ford Fiesta van, 245 € al mese + IVA, con dentro
assicurazione, bollo, manutenzione e gomme. Per una ditta in regime ordinario
il costo reale, tolte IVA e imposte, scende attorno a 177 € al mese.
Anticipo zero.

Il conto sui vostri numeri lo fate in due minuti qui:
https://[DOMINIO]/artigiani

Oppure rispondete a questa email e vi chiamo io.

[NOME VENDITORE]
Impero Automotive · [TELEFONO]

(Stima indicativa: il calcolo esatto dipende dal vostro regime fiscale.)
```

### artigiani-t2 — oggetto: `Il mezzo fermo costa più del canone`

```
Buongiorno,

torno un attimo sul tema veicoli, da un altro lato: il costo vero di un
furgone non è la rata, è il giorno in cui si ferma.

Col noleggio a lungo termine manutenzione e assistenza sono già nel canone:
il mezzo si ferma meno e, quando succede, non è un problema vostro.

Se avete mezzi che iniziano ad avere i loro anni, due conti valgono la pena:
https://[DOMINIO]/artigiani

[NOME VENDITORE] · Impero Automotive · [TELEFONO]
```

### artigiani-t3 — oggetto: `Chiudo qui`

```
Buongiorno,

ultimo messaggio, poi non disturbo più.

Se il tema veicoli oggi non è una priorità, nessun problema. Se invece c'è
un mezzo da cambiare nei prossimi mesi, tenete il riferimento: preventivo
rapido, anticipo zero sulla maggior parte dei veicoli, tutto incluso nel
canone.

https://[DOMINIO]/artigiani — o rispondete quando vi serve.

Buon lavoro,
[NOME VENDITORE] · Impero Automotive · [TELEFONO]
```

---

## 2 · AGENTI E RAPPRESENTANTI

### agenti-t1 — oggetto: `L'auto di chi vive in macchina`
*(alternativa: `Deduci l'80%, detrai tutta l'IVA`)*

```
Buongiorno,

scrivo agli agenti e rappresentanti perché siete la categoria per cui il
noleggio a lungo termine conviene di più, e spesso nessuno ve lo dice:
deducete l'80% del canone e detraete il 100% dell'IVA.

Con tutto incluso — assicurazione, manutenzione, gomme, bollo — l'auto
diventa una voce fissa che lavora per voi, non un pensiero.

Il costo reale sul vostro scaglione lo vedete qui in due minuti:
https://[DOMINIO]/agenti

Oppure rispondete e ci sentiamo al telefono.

[NOME VENDITORE]
Impero Automotive · [TELEFONO]

(Stima indicativa in base al regime fiscale.)
```

### agenti-t2 — oggetto: `Quanto vale una mattina dal gommista?`

```
Buongiorno,

una considerazione veloce: il vostro fatturato viaggia con voi. Ogni mezza
giornata persa tra officina, gomme e scadenze è lavoro che non si fa.

Nel canone del noleggio c'è già tutto: manutenzione programmata, assistenza,
cambio gomme. Voi guidate, al resto pensa il contratto.

https://[DOMINIO]/agenti — due minuti, senza impegno.

[NOME VENDITORE] · Impero Automotive · [TELEFONO]
```

### agenti-t3 — oggetto: `Chiudo qui`

```
Buongiorno,

ultimo messaggio. Se l'auto attuale va ancora bene, ottimo così.

Quando sarà il momento di cambiarla, ricordatevi solo questo: 80% deducibile,
IVA tutta detraibile, tutto incluso. Il preventivo è rapido.

https://[DOMINIO]/agenti — o rispondete quando vi serve.

Buona strada,
[NOME VENDITORE] · Impero Automotive · [TELEFONO]
```

---

## 3 · PMI (10–30 dipendenti)

### pmi-t1 — oggetto: `Il benefit che costa meno di un aumento`

```
Buongiorno,

una nota per chi in {ragione_sociale} gestisce persone e auto: dal 2025
l'auto elettrica assegnata in uso promiscuo pesa in busta paga al dipendente
il 10% del valore convenzionale, contro il 50% delle auto termiche.

Tradotto: l'auto elettrica in benefit è tornata a essere uno dei modi più
efficienti di premiare un collaboratore. E per l'azienda il canone è un costo
deducibile, tutto incluso, senza capitale immobilizzato.

Se avete auto da rinnovare o benefit da assegnare, bastano 15 minuti di
chiamata per capirci: rispondete a questa email, oppure
https://[DOMINIO]/aziende

[NOME VENDITORE]
Impero Automotive · [TELEFONO]
```

### pmi-t2 — oggetto: `Flotta: un canone, zero gestione`

```
Buongiorno,

secondo tema, più operativo: i mezzi di tecnici e commerciali.

Con il noleggio ogni veicolo è un contratto a canone fisso: assicurazioni,
manutenzioni, scadenze e bolli spariscono dalla vostra amministrazione e
diventano un'unica voce. E la flotta si allarga o si riduce seguendo
l'organico, senza asset da rivendere.

Se vi torna utile, preparo un confronto sui vostri numeri:
https://[DOMINIO]/aziende — o rispondete qui.

[NOME VENDITORE] · Impero Automotive · [TELEFONO]
```

### pmi-t3 — oggetto: `Chiudo qui`

```
Buongiorno,

ultimo messaggio sul tema auto, poi mi metto da parte.

Se nei prossimi mesi entrerà in azienda una persona nuova, o un'auto della
flotta arriverà a fine corsa, un'analisi rapida ve la preparo volentieri:
costi attuali contro noleggio, numeri alla mano, senza impegno.

Basta rispondere a questa email quando sarà il momento.

Buon lavoro,
[NOME VENDITORE] · Impero Automotive · [TELEFONO]
```

---

## 4 · FORFETTARI E FREELANCE — *fase 2, dopo i primi tre segmenti*

### forfettari-t1 — oggetto: `Auto nuova, rata fissa, zero pensieri`

```
Buongiorno,

per chi lavora in proprio l'auto è spesso il secondo costo dopo la casa,
e il più imprevedibile: assicurazione, bollo, tagliandi, gomme, svalutazione.

Col noleggio a lungo termine diventa un'unica rata fissa: Ford Fiesta da
299 € al mese IVA inclusa, tutto dentro, anticipo zero. Nessun capitale
fermo, nessuna sorpresa.

Confrontatela con quello che spendete oggi:
https://[DOMINIO]/calcolatore

O rispondete qui e vi richiamo.

[NOME VENDITORE]
Impero Automotive · [TELEFONO]
```

### forfettari-t2 — oggetto: `Quanto vi costa davvero la vostra auto?`

```
Buongiorno,

domanda semplice, risposta quasi mai semplice: sommando assicurazione,
bollo, manutenzione, gomme e la svalutazione, quanto vi costa al mese
l'auto che avete adesso?

Sul nostro sito c'è un confronto che si fa in un minuto, col vostro numero:
https://[DOMINIO]/calcolatore

Spesso la sorpresa è che la rata fissa costa meno del "già pagato".

[NOME VENDITORE] · Impero Automotive · [TELEFONO]
```

### forfettari-t3 — oggetto: `Chiudo qui`

```
Buongiorno,

ultimo messaggio, promesso.

Se l'auto attuale vi accompagna ancora bene, godetevela. Quando arriverà il
momento di cambiarla, ricordate che esiste l'alternativa senza anticipo,
senza svalutazione e senza pensieri: una rata fissa con dentro tutto.

https://[DOMINIO]/calcolatore — o rispondete quando vi serve.

Buona giornata,
[NOME VENDITORE] · Impero Automotive · [TELEFONO]
```
