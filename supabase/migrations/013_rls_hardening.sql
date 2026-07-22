-- Migration 013 — Hardening RLS (§PR-7, addendum regia). Idempotente, nessuna colonna
-- toccata. Il service role bypassa comunque la RLS: form pubblico, import e motore invio
-- restano identici (§004: "form ed eventi scrivono via service role dalle API route").

-- ————— Helper anti-ricorsione —————
-- "L'utente corrente è un venditore?" in SECURITY DEFINER: gira come owner e quindi
-- bypassa la RLS di `venditori`. Serve perché una policy SU venditori che interroghi
-- venditori (not exists (select 1 from venditori ...)) darebbe "infinite recursion
-- detected". Le policy §011 su leads/aziende/storia NON lo richiedono: interrogano
-- un'altra tabella (venditori), nessuna ricorsione — e restano intatte.
create or replace function public.is_venditore()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from venditori where id = auth.uid()) $$;

-- ————— venditori: operatore pieno · venditore vede solo se stesso —————
drop policy if exists auth_full on venditori;
drop policy if exists operatore_full on venditori;
create policy operatore_full on venditori for all to authenticated
  using (not public.is_venditore())
  with check (not public.is_venditore());

drop policy if exists venditore_se_stesso on venditori;
create policy venditore_se_stesso on venditori for select to authenticated
  using (id = auth.uid());

-- ————— lead_stati_storia: nessuno firma righe per conto d'altri —————
-- USING invariato: il venditore continua a leggere TUTTA la storia dei suoi lead
-- (incluse le note dell'operatore). WITH CHECK ora richiede anche autore = auth.uid():
-- in scrittura può firmare solo a proprio nome. La operatore_full (§011) non si tocca.
drop policy if exists venditore_storia on lead_stati_storia;
create policy venditore_storia on lead_stati_storia for all to authenticated
  using (
    exists (select 1 from leads l where l.id = lead_stati_storia.lead_id and l.assegnato_a = auth.uid())
  )
  with check (
    autore = auth.uid()
    and exists (select 1 from leads l where l.id = lead_stati_storia.lead_id and l.assegnato_a = auth.uid())
  );

-- ————— eventi / campagne / invii: da auth_full a operatore_full —————
-- Solo l'operatore (chi NON è in venditori) legge/scrive. Il venditore non li vede.
-- Il service role (tracking form, import, motore invio) bypassa la RLS: invariati.
drop policy if exists auth_full on eventi;
drop policy if exists operatore_full on eventi;
create policy operatore_full on eventi for all to authenticated
  using (not public.is_venditore())
  with check (not public.is_venditore());

drop policy if exists auth_full on campagne;
drop policy if exists operatore_full on campagne;
create policy operatore_full on campagne for all to authenticated
  using (not public.is_venditore())
  with check (not public.is_venditore());

drop policy if exists auth_full on invii;
drop policy if exists operatore_full on invii;
create policy operatore_full on invii for all to authenticated
  using (not public.is_venditore())
  with check (not public.is_venditore());
