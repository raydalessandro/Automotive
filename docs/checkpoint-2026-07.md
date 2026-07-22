# Checkpoint — 22 luglio 2026

> Fotografia per la ripresa del lavoro (operatore, regia o altro agente). Da qui in
> avanti i moduli si costruiscono in parallelo fuori dal repo: questo è lo stato certo.

## Su main (tutte le PR mergiate, main mai rotto)

PR-1 ricerca+spec+consegne · PR-2 schema vendita (009/010) · PR-3 casa base smistamento ·
PR-4 /vendita PWA + RLS (011) · PR-5 notifiche+calcolatore parametrico · PR-6 crocette
perso (012) · PR-7 hardening RLS append-only (013) · PR-8 multi-target (014) ·
PR-9 API per-target + chiavi (015) · PR-10 dashboard multi-target. Più fix visivi shell.

## Sul DB (verificato dalla regia, 22/7)

Migrations **009→015 applicate e certificate** (impersonificazione ruoli + trigger che
mordono il ruolo admin). Magazzino: **65 aziende** reali da 16 batch (import diretto SQL:
il prossimo passa dalla CLI per il dedup). Venditori: Ahmed e Shery (senza
`telegram_chat_id`). Registro: `nlt_b2b` attivo + 5 target seminati spenti. Lead di
prova `nlt_giovani` "Mario Rossi (prova)" inserito per la certificazione visiva
(purge: `DELETE FROM leads WHERE fonte = to_jsonb('prova'::text)`).

## In corso / in attesa

- **Certificazione visiva PR-10** (operatore): pill, filtro, "Dati modulo" in casa base.
- **Batteria curl** su `/api/lead` produzione (regia): 200/400/401/429 — serve il
  dominio; nlt_giovani va attivato temporaneamente + chiave con `target:chiave`.
- **Landing giovani + landing d'appoggio** (operatore, fuori repo, contratto congelato:
  `dati` almeno `{}`, campi vuoti omessi mai null, `fonte:"prova"` sui finti).
- **Ancoraggi** (quando servono): migration stati Lavorazione · migration comunicazioni.
- **Rito di reset pre-lancio** (regia, comando pronto su richiesta): purge prove +
  stati vergini + re-import batch via CLI.

## Le regole che non cambiano

Consegne una alla volta · storico prima di modificare · migration additive ·
il tronco non impara mai i target · collega presto, rifinisci fuori.
