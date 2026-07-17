# Come funziona il magazzino aziende

> Questi **non** sono funzioni del sito né azioni della dashboard. Sono strumenti che vivono nel
> repo e che un agente (Claude Code, una sessione di ricerca, qualunque modello con web) usa per
> produrre e spingere materiale nel database. La dashboard è dove gli umani guardano e lanciano;
> il repo è dove gli agenti lavorano.

Il ciclo completo, chi lo fa e con cosa:

1. **Raccolta** — una sessione AI con accesso web usa `PROMPT-raccolta.md` (parametri in testa:
   segmento, area, obiettivo, batch id) e produce un array JSON.
   Il file si salva in `batch/<batch_id>.json`.
2. **Import** — un agente lancia
   `npm run aziende:importa -- --file strumenti/ricerca/batch/<file>.json --modalita raccolta`
   (oppure un umano carica il file da `/app/aziende`). Le righe con email valida entrano come
   `da_contattare`, le altre come `grezza`.
3. **Export per arricchimento** —
   `npm run aziende:esporta -- --stato grezza --segmento artigiani --provincia MI --out auto`
   produce il file con gli `id` in `batch/`.
4. **Arricchimento** — una sessione AI usa `PROMPT-arricchimento.md` su quel file e restituisce
   lo stesso array completato (solo campi vuoti).
5. **Re-import** — `--modalita arricchimento`: riempie i vuoti, promuove le grezze che hanno
   ricevuto un'email.
6. **Dashboard** — il venditore vede contatori e liste in `/app/aziende`, seleziona i destinatari
   e lancia le campagne (testi in `docs/sequenze-email.md`).

I file in `batch/` sono **committati**: sono l'audit trail delle sessioni di ricerca.

Regole non negoziabili, ovunque nel ciclo: **mai PEC, mai email personali, mai dati inventati.**
Un campo vuoto si arricchisce domani; un'email sbagliata brucia il dominio d'invio oggi.

## CLI

Stessa logica della UI (`lib/aziende/core.ts`): validazione, cascata di dedup, guardrail PEC,
promozione `grezza → da_contattare`.

| Comando | Cosa fa |
|---|---|
| `npm run aziende:importa -- --file <path> --modalita raccolta\|arricchimento` | Importa un batch |
| `npm run aziende:esporta -- --stato --segmento --provincia --fonte --out auto` | Esporta selezione (con `id`) |

Env richieste in `.env.local` (mai committata): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
Senza, i CLI escono con un errore chiaro e istruzioni.
