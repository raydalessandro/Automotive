-- Migration 007 — Eventi v2 (§PR29 spec Analytics). Colonna dati jsonb per le
-- proprietà strutturate dei nuovi eventi (sezione, soglia, cta, strumento, env…).
alter table eventi add column if not exists dati jsonb;
create index if not exists eventi_tipo_ts_idx on eventi (tipo, ts);
