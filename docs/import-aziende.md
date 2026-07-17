# Import aziende — formato e mapping

L'import di `/app/aziende` accetta **JSON (array di oggetti)** o **CSV con intestazioni**.
È pensato per ricevere l'output della ricerca AI di aziende target.

La tabella `aziende` funziona da **magazzino di prospezione a due fasi** (Addendum): raccolta
grezza in massa (anche senza email) → arricchimento successivo → `da_contattare` → campagna.

## Colonne / campi

| Campo | Obbligatorio | Note |
|---|---|---|
| `id` | no | uuid dell'azienda. Presente negli **export**; permette il match diretto al re-import |
| `piva` | no | **11 cifre** (chiave naturale, unica). Malformata → riga scartata |
| `ragione_sociale` | sì | Nome dell'azienda |
| `segmento` | no (default `altro`) | `artigiani` \| `agenti` \| `pmi` \| `forfettari` \| `altro` |
| `settore` | no | Testo libero (es. "impianti elettrici") |
| `provincia` | no | Sigla (es. `MI`) |
| `citta` | no | |
| `sito` | no | |
| `email` | no | **Solo email ordinarie**: le PEC vengono rifiutate all'import |
| `telefono` | no | |
| `dimensione_stimata` | no | `1` \| `2-9` \| `10-30` \| `31+` |
| `segnali` | no | Indizi utili (flotta, tecnici on the road, ecc.) |
| `score` | no | Intero |
| `fonte_ricerca` | no | Batch/prompt di provenienza (default `import`) |

## Le due modalità

### Raccolta (default)
Inserisce nuove aziende in massa. **L'email è davvero facoltativa**: le righe senza email
NON vengono scartate.
- Stato iniziale: `da_contattare` se c'è un'email valida, altrimenti **`grezza`**.
- I duplicati (vedi cascata) sono saltati e contati.

### Arricchimento
Fa **match con l'esistente** e completa i dati:
- **Aggiorna solo i campi vuoti** — mai sovrascrivere un valore già presente — e setta `arricchita_il`.
- Se arriva un'email valida su una **`grezza`**, promuove lo stato a `da_contattare`.
- Righe senza match: inserite come in raccolta.

## Cascata di match / dedup

Sia il dedup interno al batch sia il match col DB seguono la stessa priorità:

`id` → `piva` → `email` → (`lower(ragione_sociale)` + `provincia`)

## Regole comuni

- **Guardrail PEC**: email su domini PEC noti (`pec.it`, `legalmail.it`, `arubapec.it`,
  `postacert.*`, …) rifiutate con motivo. La garanzia vera resta a monte, nel prompt di ricerca.
- Righe non valide (senza ragione sociale, email/piva malformata) scartate con motivo riga per riga.
- Report a fine import: **inserite / arricchite / duplicate / scartate**.
- Le **`grezza`** non entrano mai nella selezione destinatari di una campagna (per costruzione:
  la selezione filtra su `da_contattare`).

## Export per arricchimento

In `/app/aziende`, i filtri attivi (stato, segmento, provincia, fonte) definiscono la selezione;
il bottone **"Esporta selezione (JSON)"** scarica un array nel formato di import **incluso `id`**.
Il ciclo completo:

`ricerca AI → import "raccolta" → export selezione → sessione AI di arricchimento → re-import "arricchimento" → da_contattare → campagna`

## Esempio JSON

```json
[
  {
    "ragione_sociale": "Cocci Impianti",
    "segmento": "artigiani",
    "settore": "impianti elettrici",
    "provincia": "BG",
    "citta": "Treviglio",
    "email": "info@coccimpianti.it",
    "telefono": "0363111222",
    "dimensione_stimata": "2-9",
    "segnali": "tecnici on the road, furgone datato",
    "score": 4,
    "fonte_ricerca": "batch-artigiani-lombardia-01"
  }
]
```

## Esempio CSV

```csv
ragione_sociale,segmento,provincia,email,segnali
Cocci Impianti,artigiani,BG,info@coccimpianti.it,furgone datato
Marini Rappresentanze,agenti,BS,marini@marinirapp.it,alto chilometraggio
```
