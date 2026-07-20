# TODO — Impero Automotive

Cose che restano a te (nessuna blocca la build o il deploy; servono per attivare le
funzioni "vive"). Non urgenti finché non incontri l'agente e decidete di partire.

---

## 🎨 Design — prossimo giro (rimandati)
- [ ] **Ribbon "offerta"** sui badge veicolo (nastro angolare): richiede portare
      `componenti/badge-etichette.svg` dal catalogo. Basso impatto, solo estetica.
- [ ] **Asset "copertura Italia"** (mappa stilizzata single-line, oro, viewBox quadrato,
      tratto 1.8) accanto a `consegna-nazionale` sulla pagina contatti. Da **creare** coerente
      col sistema. L'icona `consegna-nazionale` già copre il concetto: nice-to-have.
- [ ] Riguardare il menù hamburger mobile (estetica) nel giro di design.

---

## 🛠️ Giornata di manutenzione e robustezza — 2026-07-19

Giornata di sola manutenzione (nessuna feature nuova, contratti intoccabili invariati:
test fiscali golden, schema catalogo, formato import aziende, RLS, copy, design).
PR piccole, una per tema. Da qui si riparte domani con spec e avanzamento.

### Cosa è stato fatto (per tema)
- **Lint** — configurato ESLint (`next/core-web-vitals`), zero warning su tutto il repo.
- **Test unità sulle parti pure** (17 → 32) + refactor *a output invariato* per renderle testabili:
  `calcolaRata`/`classificaServizi` (rata configuratore), `calcolaScore`/`isHot` (scoring),
  `dedupBatch` (cascata dedup import id→piva→email→nome+prov), opt-out.
- **Sicurezza (§7)** — audit: la *service role key* non raggiunge mai il client (solo file server:
  API routes, `admin.ts`, CLI; nessun `'use client'` la importa; Next non inietta env non-`NEXT_PUBLIC`
  nel bundle client). Aggiunto **rate limit** su `/api/eventi` (40 req/10s per IP, fixed-window in-memory).
- **E2E Playwright** (mock totale: zero scritture DB, zero notifiche reali) — 3 test:
  funnel `home → scheda → configuratore → calcolatore → form inviato`; landing di segmento con H1;
  404. Più round-trip import aziende (raccolta → export → arricchimento) con Supabase fake in-memory.
- **Accessibilità + pulizia (§6)** — `aria-label`/`aria-valuetext` sugli slider del configuratore
  (canone, km) così lo screen reader annuncia il valore; rimosso codice morto (`InCostruzione.tsx`)
  e import/const inutilizzati. Nessun cambiamento di copy o design.

### Cosa è stato trovato
- **Nessun bug reale nell'app.** L'unico "fallimento" E2E era un artefatto di test: un `next start`
  vecchio rimasto vivo tra due build serviva HTML con hash di chunk non più esistenti
  (`ChunkLoadError` → schermata "Application error"). Con server fresco: **3/3 verdi**. Nessuna
  correzione di codice necessaria (in CI il server è sempre fresco, il caso non si presenta).
- **Immagini**: tutte le `foto` del catalogo puntano a `/placeholder-veicolo.svg`. `next/image`
  non ottimizza gli SVG (richiederebbe `dangerouslyAllowSVG`) → convertire ora non darebbe alcun
  vantaggio. Il `<img>` attuale è già corretto: wrapper con `aspect-[4/3]` (niente CLS),
  `loading` eager/lazy, fallback al placeholder. Da rivedere *quando* ci saranno foto raster reali.
- **Middleware** già limitato a `/app/*` (il sito pubblico non ci passa) — nessuna latenza inutile.
- **Font** già ottimali via `next/font` (self-hosted, preload automatico, `display: swap`).

### Metriche prima → dopo
| | Prima | Dopo |
|---|---|---|
| Test unità | 17 | **37** (8 file) |
| Test E2E | 0 | **3** (+ round-trip import) |
| Lint | non configurato | **0 warning** |
| Typecheck / no-unused | ok | ok (invariato) |
| Lighthouse mobile — home | — | **94** (FCP 0.8s · LCP 3.1s · TBT 50ms · CLS 0) |
| Lighthouse mobile — scheda | — | **96** (FCP 0.8s · LCP 2.8s · TBT 20ms · CLS 0) |
| Lighthouse mobile — configuratore | — | **96** (FCP 0.8s · LCP 2.7s · TBT 60ms · CLS 0) |

Obiettivo performance (≥90 mobile su home/scheda/configuratore) **raggiunto**; CLS 0 ovunque.
L'unica voce Lighthouse segnalata è il CSS render-blocking del framework (Tailwind globale, comportamento
di Next App Router): renderlo non bloccante rischierebbe FOUC/rottura del design → lasciato com'è.
Bundle First Load JS: home 94kB, scheda 98kB, configuratore 104kB — tutti contenuti.

_Nota metodo: build/notifiche live non testabili dal sandbox (il proxy blocca Supabase/Resend/Telegram);
verificato via build, typecheck, logica pura e migration già applicate. Lighthouse eseguito in locale
sul build di produzione con Chromium headless._

---

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
- [ ] _(priorità bassissima)_ **Se/quando si passa a Vercel Pro**: in `vercel.json` rialzare il cron
      da `0 8 * * *` (giornaliero, richiesto da Hobby) a `*/30 * * * *` (ogni 30 min) — spread
      d'invio migliore. Su Hobby un cron sub-giornaliero fa **rifiutare il deployment**.

## 👤 Account definitivi
- [ ] Le **3 email** definitive (venditore, cliente, Ray). Ora esiste solo l'account demo
      `demo@imperoautomotive.it`. Si creano dalla console Supabase o me le passi e li creo io.
      (Ricorda: creando utenti via SQL vanno valorizzate a `''` le colonne token di `auth.users`,
      vedi `docs/supabase.md`.)

## 🧹 Dati demo
- [ ] Ricordarsi di **pulire i dati demo** (lead, eventi, aziende) prima del go-live.
      Basta chiedermelo: li rimuovo in un colpo.

## 📈 Analytics fase 4 — Google Search Console (POST-LANCIO)
- [ ] Proprietà verificata sul dominio definitivo → service account → cron che scarica
      impression/CTR/query per pagina in tabella `gsc_metriche` → completa il blocco SEO
      della dashboard (oggi il blog è misurato solo lato nostro).

---
_Riferimenti: `docs/supabase.md` (progetto, migration, RLS), `docs/mailing.md` (motore invio),
`docs/import-aziende.md` (import aziende)._
