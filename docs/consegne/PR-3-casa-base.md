# Consegna PR-3 — Casa base: pagina Lead dell'operatore

**Titolo PR:** Casa base: smistamento e pipeline lead (solo operatore)
**Spec:** `docs/spec-casa-base-lead.md` + `docs/spec-flusso-lead.md` · **Migrations:** NO

## File da toccare
`components/dashboard/InboxLead.tsx` (ridisegno) e nuovi sotto-componenti solo in
`components/dashboard/` · `app/app/(dash)/lead/page.tsx` · `app/app/(dash)/actions.ts`
(azioni smista / crea lead) · scheda azienda in `app/app/(dash)/aziende` (solo il bottone
"Crea lead").

## Vietato
Toccare `/vendita` (non esiste ancora), migrations, `lib/lead/transizione.ts`, il sito
pubblico. Librerie UI nuove.

## UI — testi esatti
- Tab: **Da smistare** (default, con contatore) · **In gestione** · **Chiusi**.
- Card Da smistare: riga 1 ragione sociale + città + badge sorgente (`form sito` | `risposta`);
  riga 2 segmento · settore · score; riga 3 gancio/segnali in una riga (troncati);
  riga 4, se presente, `Ha risposto: "…"`. Azioni: **[Smista a ▾]** (venditori attivi) ·
  **[Scarta]**. Vuoto: "Nessun lead da smistare."
- In gestione: gruppi per venditore; riga: azienda · pill stato · "N gg" nello stato ·
  ultima nota troncata. Alert visivo: `assegnato` > 1 giorno; `preventivo_inviato` o
  `in_sospeso` > 7 giorni.
- Drawer dettaglio: i 6 blocchi del brief (fallback "—" sui campi vuoti) + timeline con
  note + azioni: Riassegna · Riapri · Chiudi · Scarta.
- Pill stato: palette esistente della dashboard, nessun colore nuovo.

## Lavoro
1. Smista: server action con `pianoTransizione(stato: "assegnato")` + `assegnato_a/il`.
2. "Crea lead" sulla scheda azienda → lead `nuovo` con `azienda_id` (ponte outreach→vendita).
3. Il filtro `?stato=` esistente resta funzionante.

## Criteri di accettazione
- [ ] `npm test` verde
- [ ] tre viste con i testi esatti sopra; contatore Da smistare corretto
- [ ] smistamento scrive transizione + riga di storia
- [ ] `?stato=` retro-compatibile
- [ ] nessun residuo di viste "per gli agenti" in `/app`
