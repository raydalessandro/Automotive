-- Migration 015 — Chiavi di sito fuori dalla portata degli authenticated (§PR-9).
-- Le policy RLS di registro_target restano identiche (§014): questa agisce a livello di
-- GRANT di colonna. `chiave_hash` si gestisce solo via CLI/service role: nemmeno
-- l'operatore la legge da UI, ed è giusto così (una chiave che nessuno rilegge).
-- Il service role bypassa i grant: le CLI e la route continuano a leggerla.
-- Idempotente.

revoke select on registro_target from authenticated;
grant select (
  target, brand, tipo_cliente, host, schema_dati, schema_v, labels,
  scoring, notifiche, schemi_esiti, attivo
) on registro_target to authenticated;
