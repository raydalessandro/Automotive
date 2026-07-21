# Consegna PR-2 — Schema: venditori, ponte, stati additivi

**Titolo PR:** Schema vendita: venditori, ponte azienda→lead, stati additivi
**Spec:** `docs/spec-flusso-lead.md` · **Contiene migrations:** SÌ (009, 010 — additive)

## File da toccare
`supabase/migrations/009_venditori.sql` (nuovo) · `supabase/migrations/010_ponte_e_note.sql`
(nuovo) · `lib/dashboard/tipi.ts` (STATI_LEAD + `assegnato`, `preso_in_carico`,
`in_sospeso`) · `lib/lead/transizione.test.ts` (estensione) · eventuali tipi che elencano gli stati.

## Vietato
Toccare UI, componenti, route. Rimuovere o rinominare stati e colonne esistenti.
Qualsiasi scrittura sul DB: le migration restano file.

## Lavoro
1. **009**: tabella `venditori` (`id uuid` PK ref `auth.users`, `nome`, `telefono`, `email`,
   `telegram_chat_id text null`, `attivo bool default true`, `creato_il timestamptz default now()`);
   su `leads`: `assegnato_a uuid null references venditori(id)`, `assegnato_il timestamptz`;
   RLS: select/update del venditore solo su `assegnato_a = auth.uid()`; casa base
   (service role) invariata.
2. **010**: `leads.azienda_id uuid null references aziende(id)`;
   `lead_stati_storia.nota text null`; se esiste un CHECK sugli stati, estenderlo.
3. `tipi.ts`: i 3 stati nuovi inseriti mantenendo l'ordine di pipeline.
4. Test: stati vecchi ancora validi; nuovi accettati; `pianoTransizione` invariata.

## Criteri di accettazione
- [ ] `npm test` verde
- [ ] migration idempotenti (`IF NOT EXISTS` dove possibile), solo additive
- [ ] nessun file UI nel diff
- [ ] stati esistenti non riordinati né rinominati
