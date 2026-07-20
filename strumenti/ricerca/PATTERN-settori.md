# Pattern di ricerca per settore e segmento

> Estratto da: `PROMPT-raccolta.md`, `lib/scoring.config.ts`, `lib/aziende/schema.ts`,
> `docs/sequenze-email.md`, `strumenti/blog/LINEE-EDITORIALI.md`.
> Scopo: sostituire la griglia settore × segmento con un pattern unico parametrico.

## La scoperta

Il pattern di ricerca è **uno solo**, in tutti i segmenti:

```
QUERY     = "<mestiere_keyword> <città>"  |  directory(<categoria>)  |  pagina "lavora con noi"
FILTRO    = segnali veicolo visibili (mezzi in foto, "a domicilio", raggio servito, annunci ruoli mobili)
SCORE     = 2·usa_mezzi + 1·raggio_ampio + 1·strutturata + 1·email_trovata   (cap 2 senza segnali veicolo)
MESSAGGIO = f(regime_fiscale)        ← NON f(settore)
```

Nota il punto chiave: **il settore non compare mai nello scoring né nel messaggio.**
Nella rubrica di score conta solo l'uso del mezzo; nelle sequenze email cambia solo la leva
fiscale. Il settore serve a una cosa sola: **generare le query**. È un dizionario di keyword,
non una dimensione della griglia.

## I tre assi che sostituiscono la griglia

| Asse | Cosa misura | Cosa decide |
|---|---|---|
| **1 · Uso del mezzo** | il veicolo è strumento di lavoro? quanti mezzi, quanti km, che raggio | **se** cercare l'azienda e il suo score |
| **2 · Regime fiscale** | ordinario / ditta individuale / agente (art. 164) / forfettario | **cosa** dirle: leva, numeri, veicolo proposto |
| **3 · Trigger temporale** | flotta datata, annunci di lavoro per ruoli mobili, crescita, scadenze | **quando** contattarla e con che priorità |

La provincia non è un asse di segmentazione: è throttling operativo (dove copre il venditore).
`dimensione_stimata` è un proxy dell'Asse 1, non un asse a sé.

## Parametri per segmento

| Parametro | artigiani | agenti | pmi (10–30) | forfettari |
|---|---|---|---|---|
| **Keyword-set** | impianti elettrici, idraulico, termoidraulica, manutenzioni, assistenza tecnica a domicilio, piccola edilizia | agenzia di rappresentanze, agente di commercio plurimandatario (+ merceologia) | ruoli mobili: tecnici, commerciali, consegne, facility, distribuzione | — (no outbound) |
| **Fonte primaria** | ricerca locale + directory di categoria | elenchi associazioni di categoria, siti agenzie | siti aziendali, pagine "lavora con noi", job board | inbound: blog, calcolatore |
| **Veicolo tipo** | N1 (furgone) | berlina / SW alto km | flotta mista | auto singola |
| **Leva fiscale** | N1 deducibile 100% + IVA (245 € → ~177 €) | fiscalità agente (460 € → ~301 €) | fringe benefit + gestione flotta | nessuna deduzione → "costo certo, anticipo zero" |
| **Segnale principe** | furgoni in foto, età mezzi | km/anno, mandati, zona servita | annunci per ruoli on-the-road, più sedi | — |
| **Trigger** | "furgone datato", cantieri multipli | rinnovo mandati, zona ampliata | "cercasi tecnico/commerciale" = crescita | stagione fiscale |

**Forfettari:** il prompt di raccolta li esclude già (segmenti ammessi: artigiani | agenti | pmi),
e la rubrica lead li pesa 0 sulla forma giuridica. Coerente: score strutturalmente basso,
nessuna leva di deduzione. Restano nello schema come segmento **inbound-only**: si raccolgono
dal calcolatore, non si cercano.

## Regole di generalizzazione

1. **`settore` = etichetta del keyword-set usato**, non testo libero. Vocabolario chiuso
   (≤ 8–10 voci per segmento). Oggi è free-text: ogni batch inventa etichette nuove ed è questo
   che fa esplodere la griglia. Convenzione: il settore di una riga è la keyword che l'ha pescata.
2. **Un batch = (1 keyword-set, 1 area, 1 messaggio).** Il `batch_id` codifica già tutto:
   `batch-<segmento>-<settore>-<prov>-<nn>`. Il confronto tra batch così definiti È
   l'ottimizzazione del pattern: si misura resa per keyword, non per cella della griglia.
3. **Ottimizzare per asse, non per cella.** Asse 1 → quali keyword-set rendono di più
   (% righe con segnali veicolo e score ≥ 3). Asse 2 → quale leva converte (risposte per
   sequenza). Asse 3 → quali trigger accorciano il ciclo. Tre curve invece di N×M celle.
4. **Nuovo settore candidato?** Entra solo se supera il filtro dell'Asse 1: mestiere svolto
   dal cliente → mezzo necessario → raggio provinciale. Se no, non è target, qualunque sia
   il settore.

## Query di verifica resa (quando ci saranno batch reali)

```sql
-- resa per keyword-set: quota righe qualificate per fonte_ricerca
select fonte_ricerca,
       count(*)                                   as raccolte,
       count(*) filter (where email is not null)  as con_email,
       count(*) filter (where score >= 3)         as qualificate,
       round(avg(score), 2)                       as score_medio
from aziende
group by fonte_ricerca
order by qualificate desc;
```

---

## v2 — Apprendimenti dal campo (test multi-worker, lug 2026)

Da 5 batch reali (worker: Claude + Kimi) su MI/MB/BG/BS.

### Il settore-star: manutenzione impianti a contratto

La scoperta migliore (merito del worker Kimi, giro 3): **"manutenzione ascensori"**. Generalizzata:
il miglior proxy dell'Asse 1 non è il mestiere ma il **contratto di manutenzione ricorrente** —
parco impianti distribuito sul territorio → tecnici itineranti obbligatori → flotta certa →
trigger naturale (scadenze contratto, normative). Vale per: **ascensori, caldaie/climatizzazione,
antincendio, cancelli e porte automatiche, scale mobili, impianti di sollevamento**.
Esempio verificato: Balzarotti Ascensori (MB) — tecnico dedicato per micro-area, raggio 60 km,
2000+ impianti, h24. Profilo perfetto.

### Query template v2

```
QUERY = "<servizio> <città> <filtro_qualità>"          filtro_qualità ∈ {manutenzione, pronto
      | "<nome_azienda> contatti"                       intervento, h24, srl, dal 19xx}
      | directory(<categoria>) — per agenti: SOLO directory di associazioni (web improduttivo)
```

Il filtro "manutenzione" sposta i risultati da e-commerce/portali ad aziende con tecnici.
La query "nome + contatti" è il passo di **arricchimento**, non di raccolta.

### Anti-pattern (blocklist orchestratrice)

- Keyword generiche senza filtro → e-commerce e shop online.
- Reti "pronto intervento h24" multi-dominio (es. elettricista24/…h24/…24.it) → probabili
  portali lead-gen, non aziende con mezzi propri. **Quarantena**: verificare sede reale prima
  dell'import.
- Marketplace e intermediari (prontopro, idraulicoin, …) → mai importare.
- **Litmus test azienda vera: P.IVA nel footer del sito** (verificabile col checksum in
  `lib/aziende/piva.ts`). I portali non ce l'hanno o ne mostrano una di terzi.

### Regole di orchestrazione multi-worker

1. I worker raccolgono, **l'orchestratrice è il gate**: nessuna email entra se non letta su una
   pagina reale del sito aziendale. Mai caselle nominali (nome@dominio), mai email dedotte per
   analogia (info@dominio "probabile") — verificarle non basta pensarle, vanno **lette**.
2. Output worker accettato solo in formato import (array JSON, schema §2). Un report leggibile
   è un vicolo cieco per la pipeline: va rinormalizzato.
3. Dati di seconda mano (altro worker, aggregatori) → entrano come **grezze** con nota
   "(da verificare)" nei segnali; score conservativo finché l'arricchimento non conferma.
4. Resa misurata per keyword-set su `fonte_ricerca` (query SQL sopra): è il KPI dei worker.

### v2.1 — Giro 6 (densità e calibrazione worker)

- **Matrice densità**: servizi diffusi (caldaie) rendono solo su metropoli (MI); servizi di
  nicchia (cancelli automatici, antincendio) rendono sui capoluoghi piccoli (MB, VA, CO) e
  falliscono sulla metropoli. La query resta `manutenzione <servizio> <città> azienda`,
  cambia la taglia della città in base alla diffusione del servizio.
- **Batch id = keyword-set × area**; il segmento è un campo della riga (una keyword può
  pescare segmenti diversi: es. Ferport è pmi dentro un batch nato artigiano).
- **Calibrazione worker (Kimi, 2 giri osservati)**: eccellente a *trovare* (10/10 aziende
  reali, insight densità), debole a *estrarre* — 2 volte caselle nominali nonostante il brief,
  footer non letti (la P.IVA di Sicam c'era, con tanto di ragione sociale completa e REA),
  formato non rispettato (segnali come array → 10/10 scartate dal parser). Ruolo naturale:
  **scout**; estrazione e verifica restano al gate o a un worker di arricchimento dedicato.
- **Proposta repo**: oggi il codice blocca solo le PEC (`lib/aziende/pec.ts`). Aggiungere un
  guardrail gemello con whitelist di caselle generiche (info@, contatti@, commerciale@,
  amministrazione@, preventivi@, segreteria@): le nominali passano lo schema zod perché
  formalmente valide, e la regola oggi vive solo nel gate.

### v2.2 — Secondo worker (ChatGPT free) e protocollo di fiducia

- **Calibrazione ChatGPT free**: l'opposto di Kimi. Formato perfetto (31/31 righe passano il
  parser al primo colpo), P.IVA vere 8/8 al checksum, spot-check Guidetti pieno (email, P.IVA e
  perfino "13 furgoni attrezzati" dichiarati sul sito). Debolezze: 4 email con dominio diverso
  dal sito (firma della deduzione), un batch con info@ uniformi e zero telefoni (stesso odore),
  3 righe fantasma senza alcun appiglio verificabile, segmento gonfiato a pmi, score generosi.
- **Protocollo di fiducia a campione** (per ogni consegna worker): (1) parser + dedup,
  (2) checksum su tutte le P.IVA — 1 invenzione su 10 passa per caso, quindi più KO = worker che
  inventa, (3) dominio email = dominio sito, altrimenti → grezza, (4) 1 fetch di verifica sulla
  riga migliore. Se tutti e 4 passano: le email generiche a dominio coincidente entrano; le
  anomale restano grezze; le righe senza sito né telefono né P.IVA vanno in **quarantena**, non
  nel magazzino.
- **Convergenza tra worker = verifica gratis**: 2 aziende trovate indipendentemente da Kimi e
  ChatGPT (CaldoAmbiente, AB Service). Un'azienda confermata da 2 worker è reale per costruzione:
  la cascata di dedup le conta, e il contatore diventa un segnale di qualità.
- **Fonte directory per il verticale ascensori**: nel footer di Guidetti compaiono AssoAscensori
  (ANIE), ANACAM e Consorzio Imprese Ascensori — gli elenchi soci di queste associazioni sono la
  directory perfetta per saturare il settore-star senza passare dalle query.
- **Pagina "i nostri numeri"**: molte aziende strutturate dichiarano flotta e tecnici lì
  (Guidetti: 13 furgoni, 23 tecnici, 1036 impianti). Istruire i worker a cercarla sempre: è il
  segnale Asse 1 in forma pura, con il trigger età-flotta incluso.
