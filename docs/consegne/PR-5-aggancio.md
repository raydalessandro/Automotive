# Consegna PR-5 — Aggancio: notifica Telegram + calcolatore parametrico

**Titolo PR:** Notifica assegnazione + calcolatore ?forma&veicolo
**Spec:** `docs/spec-flusso-lead.md` §Flusso + `docs/primo-contatto.md` §Calcolatore ·
**Migrations:** NO

## File da toccare
`lib/lead/notifiche.ts`: nuova `notificaAssegnazione(venditore, lead)` sul canale Telegram
già presente (riga ~111), `chat_id` dalla tabella `venditori`, testo:
`Nuovo lead: {azienda} — {città}. Apri: {url}/vendita/{id}` — fallback silenzioso se
`telegram_chat_id` è null. · `app/app/(dash)/actions.ts`: chiamata fire-and-forget dopo lo
smistamento. · `components/Calcolatore.tsx`: lettura di `?forma=` (valori =
`FORME_GIURIDICHE` di `lib/lead/schema.ts`) e `?veicolo=` (`n1|auto`) come stato iniziale.

## Vietato
Cambiare i numeri fiscali del calcolatore (verifica fiscale in corso: i golden test sono
la rete di protezione). Toccare le sequenze email.

## Criteri di accettazione
- [ ] `npm test` verde, golden test intatti
- [ ] `/calcolatore` senza parametri = comportamento identico a oggi
- [ ] `?forma=agente&veicolo=auto` precompila; parametro invalido ignorato senza errori
- [ ] notifica con deep-link corretto; nessun crash con `telegram_chat_id` null
