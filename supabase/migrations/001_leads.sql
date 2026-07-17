-- Migration 001 — leads (base + estensioni workflow) — §2 spec dashboard.
-- Scritta per convivere con una tabella leads eventualmente già creata dalla spec sito (§6.1):
-- create if not exists + alter.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  fonte jsonb,
  pagina text,
  veicolo_id text,
  ragione_sociale text not null,
  referente text not null,
  forma_giuridica text not null,
  anni_attivita text not null,
  settore text,
  n_veicoli text not null,
  km_anno text not null,
  telefono text not null,
  email text,
  provincia text not null,
  consenso_privacy boolean not null,
  consenso_marketing boolean default false,
  score int,
  stato text default 'nuovo'  -- nuovo | contattato | preventivo_inviato | chiuso | perso
);

alter table leads
  add column if not exists note text,
  add column if not exists richiamare_il timestamptz,
  add column if not exists aggiornato_il timestamptz,
  add column if not exists aggiornato_da uuid references auth.users(id);

create index if not exists leads_stato_idx on leads (stato, created_at desc);
