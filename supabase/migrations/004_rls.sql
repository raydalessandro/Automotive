-- Migration 004 — RLS — §2 spec dashboard.
-- Stessa policy su tutte e 5 le tabelle: authenticated ha accesso pieno,
-- nessuna policy per anon (form ed eventi scrivono via service role dalle API route).

alter table leads    enable row level security;
alter table eventi   enable row level security;
alter table aziende  enable row level security;
alter table campagne enable row level security;
alter table invii    enable row level security;

-- leads
drop policy if exists auth_full on leads;
create policy auth_full on leads    for all to authenticated using (true) with check (true);

-- eventi
drop policy if exists auth_full on eventi;
create policy auth_full on eventi   for all to authenticated using (true) with check (true);

-- aziende
drop policy if exists auth_full on aziende;
create policy auth_full on aziende  for all to authenticated using (true) with check (true);

-- campagne
drop policy if exists auth_full on campagne;
create policy auth_full on campagne for all to authenticated using (true) with check (true);

-- invii
drop policy if exists auth_full on invii;
create policy auth_full on invii    for all to authenticated using (true) with check (true);
