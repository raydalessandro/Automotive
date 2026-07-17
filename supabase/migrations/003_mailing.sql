-- Migration 003 — mailing (aziende, campagne, invii) — §2 spec dashboard.

create table if not exists aziende (
  id uuid primary key default gen_random_uuid(),
  creato_il timestamptz default now(),
  ragione_sociale text not null,
  segmento text not null,        -- artigiani | agenti | pmi | forfettari | altro
  settore text,
  provincia text,
  citta text,
  sito text,
  email text unique,             -- SOLO email ordinarie: mai PEC
  telefono text,
  dimensione_stimata text,       -- 1 | 2-9 | 10-30 | 31+
  segnali text,                  -- indizi utili dalla ricerca (flotta, tecnici on the road, ecc.)
  score int,
  stato text default 'da_contattare',
  -- da_contattare | in_campagna | risposto | lead | non_interessata | scartata | opt_out
  fonte_ricerca text             -- batch di ricerca AI di provenienza, o "manuale"
);

create table if not exists campagne (
  id uuid primary key default gen_random_uuid(),
  creato_il timestamptz default now(),
  nome text not null,
  segmento text not null,
  oggetto text not null,
  corpo text not null,           -- template con segnaposto: {ragione_sociale}, {citta}, ...
  tetto_giornaliero int not null default 30,
  stato text default 'bozza'     -- bozza | attiva | in_pausa | completata
);

create table if not exists invii (
  id uuid primary key default gen_random_uuid(),
  campagna_id uuid references campagne(id) not null,
  azienda_id uuid references aziende(id) not null,
  pianificato_il timestamptz,
  inviato_il timestamptz,
  esito text default 'in_coda',  -- in_coda | inviata | errore | bounce
  errore text,
  unique (campagna_id, azienda_id)  -- mai due invii della stessa campagna alla stessa azienda
);

create index if not exists invii_coda_idx on invii (esito, pianificato_il);
