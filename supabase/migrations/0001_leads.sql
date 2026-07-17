-- Tabella leads — §6.1 della spec.
-- RLS attiva: nessun accesso pubblico; insert solo dall'API route con service role.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  fonte jsonb,                 -- utm_source/medium/campaign + referrer
  pagina text,                 -- path di provenienza
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
  stato text default 'nuovo'   -- nuovo | contattato | preventivo_inviato | chiuso | perso
);

alter table public.leads enable row level security;

-- Nessuna policy pubblica: il service role bypassa RLS, tutti gli altri ruoli non accedono.
-- (Non creiamo policy per anon/authenticated: di default l'accesso è negato.)

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_stato_idx on public.leads (stato);
