-- Migration 008 — Ciclo di vita lead (§PR30 spec Analytics). La storia degli stati
-- è l'unico modo di calcolare i tassi del funnel sul RAGGIUNGIMENTO di uno stadio
-- (non sullo stato attuale, che sottoconta chi è andato avanti).

create table if not exists lead_stati_storia (
  id bigint generated always as identity primary key,
  lead_id uuid references leads(id) not null,
  stato text not null,
  ts timestamptz default now(),
  autore uuid references auth.users(id)
);
create index if not exists lead_stati_storia_lead_ts_idx on lead_stati_storia (lead_id, ts);

-- Valore della commissione a contratto chiuso (§PR31 blocco Business).
alter table leads add column if not exists valore_commissione numeric;

-- RLS come le altre tabelle: authenticated pieno, niente anon.
alter table lead_stati_storia enable row level security;
drop policy if exists auth_full on lead_stati_storia;
create policy auth_full on lead_stati_storia for all to authenticated using (true) with check (true);

-- Backfill idempotente: una riga con lo stato attuale per ogni lead che non ne ha
-- ancora, con ts = coalesce(aggiornato_il, created_at).
insert into lead_stati_storia (lead_id, stato, ts)
select l.id, l.stato, coalesce(l.aggiornato_il, l.created_at)
from leads l
where not exists (select 1 from lead_stati_storia s where s.lead_id = l.id);
