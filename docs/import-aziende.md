# Import aziende — formato e mapping

L'import di `/app/aziende` accetta **JSON (array di oggetti)** o **CSV con intestazioni**.
È pensato per ricevere l'output della ricerca AI di aziende target.

## Colonne / campi

| Campo | Obbligatorio | Note |
|---|---|---|
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

## Regole di import

- **Dedup su `email`**: le aziende la cui email è già presente in DB vengono saltate
  (conteggiate come "duplicati"). Anche i duplicati interni al batch vengono ridotti alla prima occorrenza.
- **Guardrail PEC**: le email su domini PEC noti (`pec.it`, `legalmail.it`, `arubapec.it`,
  `postacert.*`, …) sono rifiutate con motivo visibile. La garanzia vera resta a monte,
  nel prompt di ricerca che esclude le PEC.
- Le righe non valide (senza ragione sociale, email malformata, ecc.) sono scartate con motivo.
- Stato iniziale: `da_contattare`.

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
