# Impero — motore lead multi-target

Nato come sito vetrina + lead generation per il **noleggio a lungo termine B2B**, oggi è
il **motore di generazione e gestione lead multi-target**: un tronco unico (ricerca →
qualificazione → contatto → smistamento → vendita → esito che torna come dato) su cui si
innestano verticali diversi — noleggio B2B e giovani, energia, telefonia, fotovoltaico,
POS — ognuno col suo sito, i suoi campi, il suo scoring, gli stessi venditori.

La visione a livelli: **1** motore di ricerca e qualificazione · **2** CRM unico e
smistamento (→ costruiti e in produzione) · **3** siti verticali (→ in corso) ·
**4** rete venditori · **5** portale aggregatore (→ conseguenze, non progetti).

Stack: **Next.js 14** (App Router, TypeScript), **Tailwind**, **Supabase** (DB, RLS,
trigger di validazione), notifiche **Telegram** + fallback **Resend**. Deploy: Vercel.

## Architettura in una frase

**Il tronco non impara mai i target.** Le tabelle core (leads, stati, storia, venditori)
ragionano solo su stato, assegnazione e tempo; i campi per-verticale vivono in
`leads.dati` (jsonb) validati **dal DB stesso** (`registro_target` + trigger
`pg_jsonschema`, migration 014) — i guardrail mordono chiunque scriva, service role e
agenti AI compresi. La storia è **append-only** per chi la genera (013). Le viste sono
proiezioni sugli stati, mai strutture parallele.

## Moduli e prese di corrente

I pezzi si costruiscono in sessioni dedicate, anche fuori dal repo, e si attaccano a
contratti — regola: **collega presto (dati `fonte:"prova"`), rifinisci fuori**.

| Modulo | Dove vive | Presa |
|---|---|---|
| Siti e landing verticali | fuori / route group | `POST /api/lead` (target + chiave + `dati`) · `/api/eventi` |
| Flussi agentici di ricerca/messaggio | fuori | formato batch + `aziende:gate` + `aziende:importa` |
| Motore di contatto + prima risposta | fuori | stati magazzino + registro comunicazioni *(ancoraggio da fare)* |
| PWA venditori | fuori, in parallelo | DB diretto: RLS certificata + Realtime + `pianoTransizione` |
| UI casa base / CRM per fasi | nel repo | consegne piccole in `docs/consegne/` |

Ancoraggi rimasti (2 migration piccole, si fanno quando il modulo che le usa entra in
sessione): stati Lavorazione su `aziende` (`qualificata`, `messaggio_pronto`) · tabella
`comunicazioni`.

## Regole di ingaggio (per chiunque riprenda il lavoro)

1. **Prima la spec, poi la consegna, poi il codice.** Le consegne (`docs/consegne/`)
   sono ordini di lavoro autosufficienti: una alla volta, PR piccola, review in regia,
   main mai rotto.
2. **Prima di modificare, leggi lo storico**: `git log --oneline -- <file>` e la PR che
   l'ha toccato. I "perché" vivono accanto ai "cosa" (consegne, spec, commenti nelle
   migration): se un recinto sembra strano, qualcuno l'ha piantato per un motivo.
3. **Migration solo additive e idempotenti**; si applicano al deploy su decisione
   dell'operatore. Mai colonne per-target sulle tabelle core, mai stati per-target.
4. **DB = validità, codice = significato**: la matematica (fiscale, scoring) resta in
   funzioni pure con golden test; la forma dei dati la difende il DB.
5. **Email e contatti**: mai PEC, mai caselle nominali, mai dati dedotti — un campo
   vuoto si arricchisce domani, un dato inventato costa oggi.

## Sviluppo

```bash
npm install
cp .env.example .env.local   # compila le variabili quando disponibili
npm run dev                  # http://localhost:3000
```

Il sito **builda e gira anche senza variabili d'ambiente**: il form non salva/notifica
ma non va in errore. Le integrazioni si attivano popolando `.env.local`
(`SUPABASE_SERVICE_ROLE_KEY` inclusa: senza, i lead del form non vengono salvati).

## Comandi

| Comando | Cosa fa |
|---|---|
| `npm run dev` / `build` / `typecheck` | Sviluppo, build (con `check:catalogo`), tipi |
| `npm test` | Suite completa (golden fiscali, transizioni, viste, intake, esiti) |
| `npm run aziende:gate -- --file <batch>` | Gate qualità sui batch dei worker |
| `npm run aziende:importa` / `aziende:esporta` | Ciclo magazzino aziende (con dedup) |
| `npm run aziende:contatti` | Lista di tiro del primo contatto |
| `npm run target:chiave -- --target <slug>` | Genera/revoca la chiave di sito di un target |

## Orientarsi nei documenti

`docs/piano-implementazione.md` (metodo e PR) · `docs/spec-multi-target.md` (v1.1, il
frattale) · `docs/spec-flusso-lead.md` + `spec-casa-base-lead.md` + `spec-app-agenti.md`
(flusso e UI) · `docs/spec-pipeline-operativa-v4.md` (le tre aree) ·
`docs/primo-contatto.md` (playbook outreach) · `strumenti/ricerca/PATTERN-settori.md`
(pattern di ricerca e protocollo worker AI) · `docs/checkpoint-2026-07.md` (**stato
esatto e ripresa del lavoro**).

## Punti aperti prima del go-live

- Validare le costanti fiscali con il commercialista (`lib/fiscale.config.ts` —
  componente modulare, non bloccante per lo sviluppo).
- Batteria curl di certificazione su `/api/lead` in produzione (regia).
- Rito di reset pre-lancio: purge dati di prova + re-import batch **via CLI**.
- `telegram_chat_id` dei venditori · contatti definitivi · foto veicoli · testi legali.

## Foto veicoli

Convenzione e regole in `public/img/veicoli/README.md`. Finché mancano le foto reali,
i veicoli usano il placeholder brandizzato e il validatore lo accetta.
