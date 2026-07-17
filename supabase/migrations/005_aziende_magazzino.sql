-- Migration 005 — magazzino aziende ("repo come motore") — Addendum §1.
-- Chiave naturale piva, timestamp arricchimento, indici per dedup/filtri.
-- Nuovo stato ammesso a livello applicativo: 'grezza' (prima di 'da_contattare').

alter table aziende
  add column if not exists piva text unique,           -- chiave naturale quando nota
  add column if not exists arricchita_il timestamptz;  -- ultimo arricchimento

create index if not exists aziende_dedup_idx
  on aziende (lower(ragione_sociale), coalesce(provincia, ''));

create index if not exists aziende_stato_idx on aziende (stato, segmento);
