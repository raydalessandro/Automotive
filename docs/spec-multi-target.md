# Spec — Multi-target (v1.1)

> Redatta dalla consegna PR-8 (dalla regia). Descrive il modello dati che rende il
> sistema **multibrand/multi-target**: una sola Casa Base, molte provenienze di lead
> (NLT B2B, NLT giovani, energia, telefonia, fotovoltaico, POS…), ciascuna col proprio
> schema di dati e di esiti. Implementazione DB in PR-8 (migration 014); contratto API
> in PR-9; UI (badge, filtro, renderer) in PR-10.

## Principio

Il **target** è la **provenienza** di un lead: da quale brand/landing/form è nato.
Non è uno stato né una categoria modificabile — è immutabile per costruzione (cambiare
provenienza = creare un nuovo lead e scartare questo).

Il sistema non hardcoda i target: li tiene in un **registro** (`registro_target`) che
descrive, per ogni target, com'è fatto un suo lead (`schema_dati`), come si etichetta
(`labels`), come si valida un esito (`schemi_esiti`), come si scoraggia/notifica, e se è
attivo. **Il registro valida se stesso**: schemi malformati sono rifiutati dal DB.

La validazione dei dati vive nel **DB** (trigger), non solo nell'app: morde chiunque
scriva, **service role inclusa**. Così una landing esterna che posta dati non conformi
viene fermata a livello di database, non solo dal frontend.

## Modello — `registro_target`

| Campo | Tipo | Note |
|---|---|---|
| `target` | text PK | slug (`nlt_b2b`, `nlt_giovani`, `energia_b2b`, …) |
| `brand` | text | nome commerciale |
| `tipo_cliente` | text | `b2b` \| `privato` |
| `host` | text null | dominio della landing (per i frontend esterni) |
| `schema_dati` | jsonb null | JSON Schema del payload `dati`. **null → il lead resta a colonne** (caso `nlt_b2b`) |
| `schema_v` | int, default 1 | versione dello schema, timbrata sul lead all'insert |
| `labels` | jsonb | etichette per il rendering (es. `ragione_sociale` = "Nome e cognome" per i privati) |
| `scoring` | jsonb null | regole di scoring per-target (uso in PR successive) |
| `notifiche` | jsonb null | config notifiche per-target |
| `schemi_esiti` | jsonb null | `{ stato: <JSON Schema dei dettagli> }` — es. `perso` = crocette `MOTIVI_PERSO` |
| `chiave_hash` | text null | hash della chiave sito per i form esterni (verifica in PR-9) |
| `attivo` | bool, default false | un target spento non accetta lead (enforced in PR-9) |

**Auto-validazione**: due CHECK sul registro — `schema_dati` è un JSON Schema valido, e
ogni voce di `schemi_esiti` è un JSON Schema valido (funzione `schemi_esiti_validi`).

**RLS**: `operatore_full` (pattern §013: `not is_venditore()`), più `select` aperta agli
autenticati (il rendering dei label/target serve a tutti, venditori inclusi).

### Semina iniziale
- `nlt_b2b` — **attivo**, `schema_dati` null (resta a colonne: zero regressioni sui lead di oggi).
- `nlt_giovani`, `energia_b2b`, `telefonia_b2b`, `fotovoltaico_b2b`, `pos` — **spenti**,
  con schemi bozza minimi e labels base.
- In **tutti**: `schemi_esiti.perso` = lo schema delle crocette del "perso"
  (`MOTIVI_PERSO` della PR-6), così il trigger di validazione dettagli non rompe la PR-6.

## Modello — `leads` e `eventi`

- `leads.target` — FK a `registro_target`, **not null default `nlt_b2b`**: i lead attuali
  diventano `nlt_b2b` senza migrazione dati.
- `leads.dati` — jsonb null: payload per-target, validato dal DB contro `schema_dati`.
- `leads.schema_v` — int null: versione schema con cui il lead è nato (timbrata dal trigger).
- Le sei colonne B2B (`forma_giuridica`, `anni_attivita`, `n_veicoli`, `km_anno`,
  `referente`, `provincia`) perdono il `NOT NULL` di tabella: la rigidità si sposta nel
  trigger, **solo per `nlt_b2b`** (i target privati possono ometterle).
- `eventi.target` — default `nlt_b2b` (per l'analytics per-provenienza).

## Validazione nel DB — i trigger (§PR-8)

Nessuno è `security definer`: girano nel DB e mordono ogni scrittura, service role inclusa.

1. **`valida_dati`** (leads, INSERT sempre; UPDATE solo se `dati` cambia): se
   `schema_dati` è null → `dati` deve essere null; altrimenti `dati` deve essere conforme
   allo schema. Timbra `schema_v` dal registro.
2. **`notnull_nlt_b2b`** (leads): per `target='nlt_b2b'` le sei colonne restano
   obbligatorie — stessa rigidità di oggi, spostata nel trigger.
3. **`target_immutabile`** (leads, UPDATE): cambiare `target` → eccezione
   ("il target è provenienza: creare un nuovo lead e scartare questo").
4. **`valida_dettagli`** (`lead_stati_storia`, quando `dettagli` non è null): valida
   `dettagli` contro `schemi_esiti[stato]` del target del lead; **permissivo** se lo
   schema per quello stato manca.

## Ciclo di attuazione

- **PR-8** (questa): registro + colonne + trigger. Nessuna UI, nessuna route, nessuna RLS
  oltre a `registro_target`, nessun dato riscritto.
- **PR-9**: contratto `/api/lead` v2 (sotto), verifica chiave sito, target attivo, rate limit.
- **PR-10**: UI — badge target, filtro, renderer dei `dati`/`labels` per-target.

## Appendice — Contratto `/api/lead` v2 (fissato ora, implementato in PR-9)

Il contratto è congelato qui perché i form delle landing si scrivano in parallelo.

```
POST /api/lead   Content-Type: application/json
{
  "target": "nlt_giovani",              // slug del registro, obbligatorio
  "chiave_sito": "...",                 // per i frontend esterni (hash nel registro)
  "ragione_sociale": "Mario Rossi",     // per i privati: il nominativo (label dal registro)
  "telefono": "3xx...", "email": "...", "provincia": "MI",
  "consenso_privacy": true, "consenso_marketing": false,
  "fonte": "prova",                     // i form finti usano SEMPRE "prova": purge = 1 DELETE
  "pagina": "/giovani",
  "hp": "", "ts_apertura": 1234567890,  // antispam come oggi
  "dati": { "eta": 22, "patente_da_anni": 3 }   // campi del target, validati dal DB
}
```

Risposte: `200 {ok:true}` · `400` dati non validi (inclusi errori schema dal DB) ·
`401` chiave errata · `429` rate limit (per chiave e per IP). `target` assente o non
attivo → `400`. Il sito principale continua senza chiave (stessa origin).
