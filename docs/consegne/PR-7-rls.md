# Consegna PR-7 — Hardening RLS (migration 013)

**Titolo PR:** Hardening RLS: is_venditore(), venditori/eventi/campagne/invii, firma storia
**Branch:** `feat/pr7-rls-013` · **Contiene migrations:** SÌ (013 — additiva, idempotente, nessuna colonna toccata)

## Scope (addendum regia — è l'intero contenuto della 013)

### A. Ricorsione
Una policy SU `venditori` che interroga `venditori`
(`not exists (select 1 from venditori ...)`) produce "infinite recursion detected".
Helper `security definer`:

```sql
create or replace function public.is_venditore()
returns boolean language sql stable security definer
set search_path = public
as $$ select exists (select 1 from venditori where id = auth.uid()) $$;
```

- Su `venditori`: `operatore_full using (not is_venditore())` +
  `venditore_se_stesso for select using (id = auth.uid())`.
- Le policy §011 su `leads`/`aziende`/`lead_stati_storia` NON si toccano
  (interrogano un'altra tabella: nessuna ricorsione).

### B. Firma della storia
`venditore_storia`: `with check` anche su `autore = auth.uid()`, oltre al lead assegnato —
nessuno firma righe per conto d'altri. `USING` invariato (il venditore continua a leggere
tutta la storia dei suoi lead, note operatore incluse).

### C. Superfici aperte
`eventi`/`campagne`/`invii`: `drop auth_full` → `operatore_full` con `is_venditore()`.
Il service role non è toccato (bypassa la RLS: form, import, motore invio restano identici).

### D. Verifica
Test per impersonation + regressione middleware: l'operatore legge ancora la lista
venditori (menu "Smista a"), il venditore la propria riga (redirect ruolo), e non può
inserire storia con `autore` altrui. Idempotente, nessuna colonna toccata.

## Nota di implementazione (B)
Il vincolo `autore = auth.uid()` è stato messo nel `WITH CHECK` della policy
`venditore_storia` ricreata `for all` (il `WITH CHECK` vale solo su insert/update, non su
select), invece di una policy `_insert` separata: risultato identico all'intento (lettura
preservata, scrittura firmata) con la modifica minima. Split letterale disponibile su
richiesta.
