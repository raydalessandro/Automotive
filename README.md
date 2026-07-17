# Impero Automotive

Sito vetrina + lead generation per il **noleggio a lungo termine B2B** di Impero Automotive.
Obiettivo unico: generare richieste di preventivo qualificate → notifica istantanea al venditore.

Stack: **Next.js 14** (App Router, TypeScript), **Tailwind**, **Supabase** (lead),
notifiche **Telegram** + fallback **Resend**. Deploy target: Vercel.

## Sviluppo

```bash
npm install
cp .env.example .env.local   # compila le variabili quando disponibili
npm run dev                  # http://localhost:3000
```

Il sito **builda e gira anche senza variabili d'ambiente**: il form non salva/notifica ma
non va in errore. Le integrazioni si attivano popolando `.env.local`.

## Comandi

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Server di sviluppo |
| `npm run build` | Build di produzione (esegue prima `check:catalogo`) |
| `npm run check:catalogo` | Valida `data/catalogo.json` (§2.2): un catalogo invalido rompe il build |
| `npm test` | Golden test fiscali (§3.3) |
| `npm run typecheck` | Controllo tipi |

## Struttura

- `data/catalogo.json` — catalogo veicoli (fonte di verità, no CMS). Aggiornamento = commit → deploy.
- `lib/catalogo/` — schema zod, tipi, campi derivati.
- `lib/fiscale.config.ts` — **tutte** le costanti fiscali (§3). Un check col commercialista aggiorna solo questo file.
- `lib/fiscale.ts` — formula del costo reale, coperta dai golden test.
- `lib/lead/` — schema form, client Supabase, notifiche.
- `lib/scoring.config.ts` — scoring lead (visibile solo nella notifica).
- `components/Calcolatore.tsx` — calcolatore con cascata e modalità forfettario.
- `app/api/lead/` — endpoint ricezione lead (insert prima, notifiche poi).
- `app/api/og/veicolo/[id]/` — generatore OG card ("locandine Impero", §7).
- `supabase/migrations/` — DDL tabella `leads` con RLS.

## Punti aperti prima del go-live (§11)

- **Validare le costanti fiscali con il commercialista** (`lib/fiscale.config.ts`).
- Numeri di telefono/WhatsApp/email definitivi (`lib/contatti.ts`).
- Foto reali dei veicoli (vedi `public/img/veicoli/README.md`).
- Testi legali (ruolo di Impero) e chi-siamo.
- Logo definitivo (ora wordmark tipografico + monogramma SVG).

## Foto veicoli

Convenzione e regole in `public/img/veicoli/README.md`. Finché mancano le foto reali,
i veicoli usano il placeholder brandizzato e il validatore lo accetta.
