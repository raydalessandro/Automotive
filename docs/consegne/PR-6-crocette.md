# Consegna PR-6 — Esiti strutturati: le crocette del "perso"

**Titolo PR:** Esiti strutturati: motivi del perso, data ricontatto, filtro in Chiusi
**Branch:** `feat/pr6-crocette` · **Spec:** `docs/spec-flusso-lead.md` §Note e dati di ritorno
**Contiene migrations:** SÌ (012 — additiva)

## In questa PR committare anche

- questo file, come `docs/consegne/PR-6-crocette.md`;
- `docs/spec-app-venditori-v3-visione.md` (spec-seme allegata dalla regia:
  **SOLO committare, NON implementare** — è la visione dell'app venditori futura,
  si lavorerà dopo, su decisione dell'operatore).

## File da toccare

- `supabase/migrations/012_esiti.sql` (nuova): `lead_stati_storia.dettagli jsonb null`.
  Additiva, idempotente. Nessuna policy da toccare: quelle esistenti sulla storia
  coprono già la colonna.
- `lib/lead/esiti.ts` (+ test): costante `MOTIVI_PERSO` (id + label, sotto) e
  validazione pura dei dettagli `{ motivi: string[], ricontattare_il?: string,
  nota_altro?: string }`.
- `app/vendita/actions.ts`: `registraEsito` accetta i dettagli SOLO per stato `perso`
  (validati con la lib); finiscono in `lead_stati_storia.dettagli` insieme alla nota.
- `components/vendita/AzioniScheda.tsx`: su "Perso" si apre il form a crocette.
- Casa base: `components/dashboard/LeadDettaglio.tsx` (la timeline mostra i motivi
  quando presenti) e vista **Chiusi** in `InboxLead.tsx` (chip motivi + filtro per motivo).

## Vietato

Stati nuovi o modifiche alla macchina stati e a `transizione.ts`. Migrations non
additive o modifiche alle policy. Toccare `/app` oltre ai due componenti dashboard
citati. Librerie nuove. Motivi obbligatori per esiti diversi da `perso`.

## Motivi (id → label, in quest'ordine)

`canone_alto` → "Canone troppo alto" · `fornitore_attivo` → "Ha già un fornitore di
noleggio" · `preferisce_acquisto` → "Preferisce acquisto o leasing" ·
`non_e_il_momento` → "Non è il momento" (se selezionato: campo data "Ricontattare il") ·
`decisore_non_raggiunto` → "Non ho raggiunto il decisore" · `veicolo_non_adatto` →
"Veicolo o allestimento non adatto" · `diffidenza` → "Diffidenza verso il noleggio" ·
`altro` → "Altro" (se selezionato: campo nota breve).

## UI — testi esatti (form nel flusso venditore)

Titolo "Perché si è perso?" · hint "10 secondi: seleziona tutto ciò che vale" ·
multi-selezione a crocette · bottone "Registra" · **minimo 1 motivo obbligatorio**
("altro" è la valvola) · "Ricontattare il" visibile solo con `non_e_il_momento` ·
la textarea "Cosa è venuto fuori?" resta, opzionale.

## Criteri di accettazione

- [ ] `npm test` verde + test della lib (id sconosciuti rifiutati, minimo 1 motivo,
      data ammessa solo con `non_e_il_momento`)
- [ ] migration 012 additiva e idempotente, zero policy toccate
- [ ] `perso` senza almeno 1 motivo → bloccato lato app E lato action
- [ ] dettagli visibili in casa base: timeline del drawer + chip nella vista Chiusi
- [ ] filtro per motivo in Chiusi funzionante
- [ ] esiti diversi da `perso`: flusso identico a oggi

## Al termine

Apri la PR verso main col titolo indicato, checklist spuntata nella descrizione,
e fermati: si prosegue dopo la review della regia.
