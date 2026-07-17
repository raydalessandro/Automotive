# Supabase — stato e handoff

Progetto dedicato per Impero Automotive (sito lead + dashboard Casa Base).

## Progetto

| Campo | Valore |
|---|---|
| Nome | `impero-automotive` |
| Ref / project_id | `lxfwzqqwilryabekpfzx` |
| Region | `eu-west-3` (Parigi) |
| URL API | `https://lxfwzqqwilryabekpfzx.supabase.co` |

> Nota: per liberare lo slot del piano free (max 2 progetti attivi) è stato messo
> **in pausa** il progetto `la-famiglia`. È reversibile (Restore dalla console).

## Migration applicate

`supabase/migrations/` — applicate tutte e 4 sul progetto:

- `001_leads` — tabella leads (base + workflow: note, richiamare_il, aggiornato_il/da)
- `002_eventi` — analytics first-party
- `003_mailing` — aziende, campagne, invii
- `004_rls` — RLS su tutte e 5 le tabelle, policy `auth_full` per `authenticated`, nessuna per `anon`

Verificato in DB:
- Lettura come `anon` → 0 righe (RLS nega). Lettura come `authenticated` → visibile. ✅
- Gli advisor segnalano `rls_policy_always_true` sulle 5 tabelle: **atteso e voluto** dalla spec
  (§2: authenticated = accesso pieno, 3 account identici, nessun ruolo). La garanzia reale
  (anon non accede) regge.

## Account

- `demo@imperoautomotive.it` — creato a mano (auth.users + auth.identities), email confermata,
  password verificata in DB. Password condivisa fuori dal repo (mai committata).
- Gli account definitivi (venditore, cliente, Ray) si creano dalla console o via lo stesso metodo.

## ⚠️ Da fare in console prima della produzione

- **Disabilitare i signup**: Authentication → Sign In / Providers → Email → *Allow new users to
  sign up* = OFF. Critico: la anon key è pubblica; con signup ON un estraneo potrebbe registrarsi
  e — data la RLS `authenticated = full` — leggere tutti i lead.

## Env (Vercel + `.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL` = URL API sopra
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key (Settings → API)
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key (Settings → API) — **segreta, solo server**
- (opzionali motore invio) `RESEND_API_KEY`, `MAIL_FROM`, `CRON_SECRET`, `TETTO_GLOBALE_GIORNO`

I valori delle chiavi non sono nel repo. Copiali dalla dashboard Supabase.
