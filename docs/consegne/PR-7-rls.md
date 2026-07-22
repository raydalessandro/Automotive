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

### B. Storia append-only per il venditore
Il venditore legge tutta la storia dei suoi lead (note operatore incluse) e può SOLO
aggiungere righe firmate a proprio nome. Due policy distinte — `venditore_storia_select`
(read) e `venditore_storia_insert` (`with check: autore = auth.uid()` + lead assegnato) —
e **nessuna** policy di UPDATE/DELETE: le correzioni restano all'operatore
(`operatore_full`, §011). Una singola policy `FOR ALL` NON basta: armerebbe anche UPDATE e
DELETE col solo `USING` (l'`autore` nel `WITH CHECK` non li tocca).

### C. Superfici aperte
`eventi`/`campagne`/`invii`: `drop auth_full` → `operatore_full` con `is_venditore()`.
Il service role non è toccato (bypassa la RLS: form, import, motore invio restano identici).

### D. Verifica
Test per impersonation + regressione middleware: l'operatore legge ancora la lista
venditori (menu "Smista a"), il venditore la propria riga (redirect ruolo), e non può
inserire storia con `autore` altrui. Idempotente, nessuna colonna toccata.

## Storico del fix (B)
Prima stesura: policy `venditore_storia` `FOR ALL` con `autore` nel `WITH CHECK`.
Bocciata in review con prova dal vivo: `FOR ALL` arma anche UPDATE e DELETE valutando il
solo `USING`, quindi il venditore poteva riscrivere o cancellare tutta la storia dei suoi
lead (righe operatore comprese) — 8/8 righe, attese 0. Buco già presente con la §011.
Fix definitivo: split append-only (select + insert, niente update/delete).
