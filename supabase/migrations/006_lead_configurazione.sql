-- Migration 006 — configurazione del configuratore allegata al lead (§3 spec configuratore).
-- Contenuto jsonb: { veicolo_id, durata, km_anno, servizi_scelti[], servizi_interesse[],
--                    rischi_accettati[], rata_configurata }

alter table leads add column if not exists configurazione jsonb;
