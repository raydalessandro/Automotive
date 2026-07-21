-- Migration 012 — Esiti strutturati: i "motivi del perso" (§PR-6).
-- Additiva e idempotente: una sola colonna jsonb sulla storia degli stati, dove il
-- venditore registra { motivi, ricontattare_il?, nota_altro? } quando marca un lead
-- come perso. Le policy esistenti sulla storia (§011: operatore_full + venditore_storia)
-- coprono già la nuova colonna — niente policy da toccare.
alter table lead_stati_storia add column if not exists dettagli jsonb;
