# Consegna PR-4 — /vendita: la PWA dei venditori

**Titolo PR:** /vendita: lista, scheda-brief, esiti (PWA)
**Spec:** `docs/spec-app-agenti.md` · **Migrations:** NO (usa 009/010)

## File da toccare
`app/vendita/` (nuove route: `page.tsx`, `[id]/page.tsx`, layout minimale senza nav della
dash) · `middleware.ts` (matcher + redirect per ruolo) · manifest PWA in `public/` con
icona da `app/icon.svg` · componenti nuovi SOLO in `components/vendita/`.

## Vietato
Toccare `/app` (eccetto `middleware.ts`). Esporre `fonte_ricerca`, batch, aziende non
assegnate, analytics. Usare il service role lato venditore. Librerie nuove.

## UI — testi esatti
- Schermata 1, tre sezioni: **Da prendere in carico** (con "da N ore/giorni") ·
  **In corso** · **In gestione**. Card: azienda · città · pill stato · gancio in una riga.
  Vuoto: "Nessun lead assegnato al momento."
- Schermata 2: i 6 blocchi del brief; `tel:` e link sito cliccabili; bottone
  **Condividi il conto** (link calcolatore precompilato).
  Da `assegnato`: unico bottone grande **[ Prendo in carico ]**.
  Da `preso_in_carico`: **[ Chiuso ✓ ] [ Preventivo inviato ] [ In sospeso ] [ Perso ]**
  + textarea con placeholder "Cosa è venuto fuori?" — la nota viaggia nella transizione.
- Mobile-first: bottoni ≥ 48px, colonna singola, zero menu.

## Criteri di accettazione
- [ ] `npm test` verde + test RLS (il venditore A non vede i lead di B)
- [ ] il diff non tocca `app/app/(dash)` (solo `middleware.ts`)
- [ ] `grep fonte_ricerca app/vendita components/vendita` → zero risultati
- [ ] manifest PWA valido (installabile)
- [ ] ogni esito scrive storia con nota via `pianoTransizione`
