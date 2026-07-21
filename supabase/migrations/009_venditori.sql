-- Migration 009 — Venditori + assegnazione lead (§PR-2 / docs/spec-flusso-lead.md).
-- Additiva e idempotente: nessuna colonna/stato rimosso. Si applica al deploy.

create table if not exists venditori (
  id uuid primary key references auth.users(id),
  nome text,
  telefono text,
  email text,
  telegram_chat_id text,
  attivo boolean default true,
  creato_il timestamptz default now()
);

-- Assegnazione del lead a un venditore (smistamento dall'operatore di casa base).
alter table leads add column if not exists assegnato_a uuid references venditori(id);
alter table leads add column if not exists assegnato_il timestamptz;
create index if not exists leads_assegnato_idx on leads (assegnato_a);

-- RLS venditori: convenzione auth_full come le altre tabelle (casa base li gestisce).
alter table venditori enable row level security;
drop policy if exists auth_full on venditori;
create policy auth_full on venditori for all to authenticated using (true) with check (true);

-- RLS leads per il venditore: legge/aggiorna SOLO i lead a lui assegnati.
-- Policy additive accanto ad auth_full esistente (migration 004): qui è scaffolding.
-- Il restringimento pieno del ruolo venditore (scoping/rimozione di auth_full per
-- l'app /vendita) è finalizzato in PR-4 (/vendita + RLS), come da piano.
drop policy if exists venditore_assegnati_select on leads;
create policy venditore_assegnati_select on leads
  for select to authenticated using (assegnato_a = auth.uid());

drop policy if exists venditore_assegnati_update on leads;
create policy venditore_assegnati_update on leads
  for update to authenticated using (assegnato_a = auth.uid()) with check (assegnato_a = auth.uid());
