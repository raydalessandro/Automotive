# TODO — Impero Automotive

Cose che restano a te (nessuna blocca la build o il deploy; servono per attivare le
funzioni "vive"). Non urgenti finché non incontri l'agente e decidete di partire.

## 🔒 Sicurezza (priorità quando si va live)
- [ ] **Disattivare i signup** su Supabase: Authentication → Sign In / Providers → Email →
      *Allow new users to sign up* = **OFF**.
      Motivo: la anon key è pubblica (nel JS di `/app/login`); con signup ON un estraneo può
      registrarsi e — data la RLS `authenticated = accesso pieno` — leggere tutti i lead.

## 🔔 Notifiche lead (ping istantaneo)
- [ ] `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` su Vercel → il ping Telegram a ogni nuovo lead
      (con deep link al dettaglio in dashboard). Senza, il lead viene comunque salvato in DB.

## ✉️ Campagne live (email in uscita)
Dettagli operativi in `docs/mailing.md`. Servono tutte per far partire gli invii:
- [ ] **Dominio d'invio dedicato** (mai il dominio del sito) con SPF/DKIM/DMARC su Resend.
- [ ] `MAIL_FROM` (es. `Impero Automotive <info@dominio-invio.it>`).
- [ ] `RESEND_API_KEY`.
- [ ] `CRON_SECRET` (protegge l'endpoint cron; Vercel lo invia come Bearer).
- [ ] Casella **reply-to** del venditore per leggere le risposte.
- [ ] (opz.) `TETTO_GLOBALE_GIORNO` (default 50).
- [ ] Nota: cron ad alta frequenza richiede Vercel **Pro** (vedi `docs/mailing.md`).

## 👤 Account definitivi
- [ ] Le **3 email** definitive (venditore, cliente, Ray). Ora esiste solo l'account demo
      `demo@imperoautomotive.it`. Si creano dalla console Supabase o me le passi e li creo io.
      (Ricorda: creando utenti via SQL vanno valorizzate a `''` le colonne token di `auth.users`,
      vedi `docs/supabase.md`.)

## 🧹 Dati demo
- [ ] Ricordarsi di **pulire i dati demo** (lead, eventi, aziende) prima del go-live.
      Basta chiedermelo: li rimuovo in un colpo.

---
_Riferimenti: `docs/supabase.md` (progetto, migration, RLS), `docs/mailing.md` (motore invio),
`docs/import-aziende.md` (import aziende)._
