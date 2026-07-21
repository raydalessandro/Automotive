-- Migration 010 — Ponte azienda→lead + nota nella storia (§PR-2 / spec-flusso-lead).
-- Additiva e idempotente. Chiude il cerchio ricerca→lead: un lead nato da una
-- risposta outreach porta l'azienda del magazzino da cui proviene.

alter table leads add column if not exists azienda_id uuid references aziende(id);
create index if not exists leads_azienda_idx on leads (azienda_id);

-- Nota libera del venditore su ogni transizione ("cosa è venuto fuori"): entra nella
-- timeline degli stati (lead_stati_storia) e compone il brief.
alter table lead_stati_storia add column if not exists nota text;

-- Nessun CHECK sugli stati di leads.stato (validati a livello applicativo via
-- STATI_LEAD): niente vincolo da estendere.
