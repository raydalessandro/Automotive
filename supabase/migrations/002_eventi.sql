-- Migration 002 — eventi (analytics first-party) — §2 spec dashboard.
-- Design privacy-first: nessun IP, nessun cookie, sessione anonima non persistente tra visite.

create table if not exists eventi (
  id bigint generated always as identity primary key,
  ts timestamptz default now(),
  sessione text not null,      -- id anonimo generato client-side (sessionStorage)
  tipo text not null,          -- pagina_vista | veicolo_visto | calcolatore_usato |
                               -- preventivo_inviato | telefono_click | whatsapp_click | condividi_click
  pagina text,
  veicolo_id text,
  profilo_fiscale text,        -- valorizzato solo per calcolatore_usato
  fonte jsonb                  -- utm + referrer, solo sul primo evento della sessione
);

create index if not exists eventi_ts_idx on eventi (ts);
create index if not exists eventi_tipo_idx on eventi (tipo, ts);
create index if not exists eventi_veicolo_idx on eventi (veicolo_id) where veicolo_id is not null;
