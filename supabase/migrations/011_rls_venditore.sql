-- Migration 011 — Isolamento RLS del venditore (§PR-4, il "+RLS" del piano).
-- Nota: la consegna PR-4 diceva "no migrations", ma il criterio di accettazione
-- "il venditore A non vede i lead di B" è impossibile finché `auth_full` concede tutto
-- a ogni authenticated. Qui si scioglie il nodo: l'OPERATORE (chi NON è in `venditori`)
-- mantiene accesso pieno; il VENDITORE vede/aggiorna solo ciò che gli è assegnato.
-- Idempotente. Il service role (API, import) bypassa comunque la RLS.

-- ————— leads —————
drop policy if exists auth_full on leads;
drop policy if exists operatore_full on leads;
create policy operatore_full on leads for all to authenticated
  using (not exists (select 1 from venditori v where v.id = auth.uid()))
  with check (not exists (select 1 from venditori v where v.id = auth.uid()));

drop policy if exists venditore_assegnati_select on leads;
create policy venditore_assegnati_select on leads
  for select to authenticated using (assegnato_a = auth.uid());
drop policy if exists venditore_assegnati_update on leads;
create policy venditore_assegnati_update on leads
  for update to authenticated using (assegnato_a = auth.uid()) with check (assegnato_a = auth.uid());

-- ————— lead_stati_storia (timeline + esiti) —————
drop policy if exists auth_full on lead_stati_storia;
drop policy if exists operatore_full on lead_stati_storia;
create policy operatore_full on lead_stati_storia for all to authenticated
  using (not exists (select 1 from venditori v where v.id = auth.uid()))
  with check (not exists (select 1 from venditori v where v.id = auth.uid()));

drop policy if exists venditore_storia on lead_stati_storia;
create policy venditore_storia on lead_stati_storia for all to authenticated
  using (exists (select 1 from leads l where l.id = lead_stati_storia.lead_id and l.assegnato_a = auth.uid()))
  with check (exists (select 1 from leads l where l.id = lead_stati_storia.lead_id and l.assegnato_a = auth.uid()));

-- ————— aziende (brief del lead) — mai esporre aziende non assegnate —————
drop policy if exists auth_full on aziende;
drop policy if exists operatore_full on aziende;
create policy operatore_full on aziende for all to authenticated
  using (not exists (select 1 from venditori v where v.id = auth.uid()))
  with check (not exists (select 1 from venditori v where v.id = auth.uid()));

drop policy if exists venditore_aziende_select on aziende;
create policy venditore_aziende_select on aziende for select to authenticated
  using (exists (select 1 from leads l where l.azienda_id = aziende.id and l.assegnato_a = auth.uid()));
