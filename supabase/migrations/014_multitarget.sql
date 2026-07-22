-- Migration 014 — Multi-target: registro, colonne lead, validazione nel DB (§PR-8).
-- Idempotente. Nessun dato esistente migrato/riscritto: i lead attuali diventano
-- 'nlt_b2b' per default. La validazione vive nel DB (trigger): morde chiunque scriva,
-- service role inclusa. Ordine obbligato: extension → registro → semina → FK →
-- drop not null → trigger (la FK non deve nascere orfana).

-- ————— 1. Estensione JSON Schema —————
create extension if not exists pg_jsonschema with schema extensions;

-- ————— 2. registro_target (il registro valida se stesso) —————
-- Ogni voce di schemi_esiti dev'essere un JSON Schema valido.
create or replace function public.schemi_esiti_validi(s jsonb)
returns boolean language sql immutable as $$
  select s is null or not exists (
    select 1 from jsonb_each(s) e
    where not extensions.jsonschema_is_valid(e.value::json)
  );
$$;

create table if not exists registro_target (
  target text primary key,
  brand text,
  tipo_cliente text check (tipo_cliente in ('b2b','privato')),
  host text,
  schema_dati jsonb,
  schema_v int not null default 1,
  labels jsonb,
  scoring jsonb,
  notifiche jsonb,
  schemi_esiti jsonb,
  chiave_hash text,
  attivo boolean not null default false,
  constraint schema_dati_valido
    check (schema_dati is null or extensions.jsonschema_is_valid(schema_dati::json)),
  constraint schemi_esiti_validi_chk
    check (public.schemi_esiti_validi(schemi_esiti))
);

alter table registro_target enable row level security;
drop policy if exists operatore_full on registro_target;
create policy operatore_full on registro_target for all to authenticated
  using (not public.is_venditore())
  with check (not public.is_venditore());
-- Il rendering (labels/target) serve a chiunque sia autenticato: select aperta.
drop policy if exists registro_select on registro_target;
create policy registro_select on registro_target for select to authenticated
  using (true);

-- ————— 3. Semina: nlt_b2b attivo + 5 spenti. In schemi_esiti di TUTTI le crocette
-- del "perso" (id di MOTIVI_PERSO) così il trigger d NON rompe la PR-6. —————
with perso(schema) as (
  select '{"type":"object","additionalProperties":false,"required":["motivi"],
    "properties":{
      "motivi":{"type":"array","minItems":1,"items":{"enum":[
        "canone_alto","fornitore_attivo","preferisce_acquisto","non_e_il_momento",
        "decisore_non_raggiunto","veicolo_non_adatto","diffidenza","altro"]}},
      "ricontattare_il":{"type":"string"},
      "nota_altro":{"type":"string"}}}'::jsonb
)
insert into registro_target (target, brand, tipo_cliente, schema_dati, labels, schemi_esiti, attivo)
select v.target, v.brand, v.tipo_cliente, v.schema_dati, v.labels,
       jsonb_build_object('perso', perso.schema), v.attivo
from perso, (values
  ('nlt_b2b',        'Impero Automotive',   'b2b',     null::jsonb,
     '{"ragione_sociale":"Ragione sociale"}'::jsonb, true),
  ('nlt_giovani',    'Impero Giovani',      'privato',
     '{"type":"object","properties":{"eta":{"type":"integer"},"patente_da_anni":{"type":"integer"}}}'::jsonb,
     '{"ragione_sociale":"Nome e cognome"}'::jsonb, false),
  ('energia_b2b',    'Impero Energia',      'b2b',
     '{"type":"object","properties":{"fornitore_attuale":{"type":"string"},"spesa_mensile":{"type":"number"}}}'::jsonb,
     '{"ragione_sociale":"Ragione sociale"}'::jsonb, false),
  ('telefonia_b2b',  'Impero Telefonia',    'b2b',
     '{"type":"object","properties":{"operatore_attuale":{"type":"string"},"n_sim":{"type":"integer"}}}'::jsonb,
     '{"ragione_sociale":"Ragione sociale"}'::jsonb, false),
  ('fotovoltaico_b2b','Impero Fotovoltaico','b2b',
     '{"type":"object","properties":{"mq_tetto":{"type":"number"},"consumo_annuo_kwh":{"type":"number"}}}'::jsonb,
     '{"ragione_sociale":"Ragione sociale"}'::jsonb, false),
  ('pos',            'Impero POS',          'b2b',
     '{"type":"object","properties":{"fatturato_mensile":{"type":"number"},"ha_pos":{"type":"boolean"}}}'::jsonb,
     '{"ragione_sociale":"Ragione sociale"}'::jsonb, false)
) as v(target, brand, tipo_cliente, schema_dati, labels, attivo)
on conflict (target) do nothing;

-- ————— 4. Colonne su leads + eventi (FK dopo la semina) —————
alter table leads
  add column if not exists target text not null default 'nlt_b2b' references registro_target(target),
  add column if not exists dati jsonb,
  add column if not exists schema_v int;

-- Le sei colonne B2B non sono più obbligatorie a livello di tabella: la rigidità per
-- 'nlt_b2b' si sposta nel trigger (punto 5b), così i target privati possono ometterle.
alter table leads
  alter column forma_giuridica drop not null,
  alter column anni_attivita drop not null,
  alter column n_veicoli drop not null,
  alter column km_anno drop not null,
  alter column referente drop not null,
  alter column provincia drop not null;

alter table eventi add column if not exists target text default 'nlt_b2b';

-- ————— 5. Trigger di validazione (SECURITY INVOKER: mordono anche il service role) —————

-- a. valida_dati: schema_dati null → dati deve essere null; altrimenti dati conforme.
--    Timbra schema_v dal registro. INSERT sempre; UPDATE solo se dati cambia.
create or replace function public.trg_valida_dati_lead()
returns trigger language plpgsql as $$
declare
  reg registro_target%rowtype;
begin
  select * into reg from registro_target where target = NEW.target;
  if not found then
    raise exception 'target inesistente: %', NEW.target;
  end if;
  if reg.schema_dati is null then
    if NEW.dati is not null then
      raise exception 'il target % non prevede dati strutturati: dati deve essere null', NEW.target;
    end if;
  else
    if NEW.dati is null or not extensions.jsonb_matches_schema(reg.schema_dati::json, NEW.dati) then
      raise exception 'dati non conformi allo schema del target %', NEW.target;
    end if;
  end if;
  NEW.schema_v := reg.schema_v;
  return NEW;
end $$;

drop trigger if exists valida_dati_ins on leads;
create trigger valida_dati_ins before insert on leads
  for each row execute function public.trg_valida_dati_lead();
drop trigger if exists valida_dati_upd on leads;
create trigger valida_dati_upd before update on leads
  for each row when (NEW.dati is distinct from OLD.dati)
  execute function public.trg_valida_dati_lead();

-- b. not-null condizionale: per 'nlt_b2b' le sei colonne restano obbligatorie.
create or replace function public.trg_notnull_nlt_b2b()
returns trigger language plpgsql as $$
begin
  if NEW.target = 'nlt_b2b'
     and (NEW.forma_giuridica is null or NEW.anni_attivita is null or NEW.n_veicoli is null
       or NEW.km_anno is null or NEW.referente is null or NEW.provincia is null) then
    raise exception 'lead nlt_b2b: forma_giuridica, anni_attivita, n_veicoli, km_anno, referente, provincia sono obbligatori';
  end if;
  return NEW;
end $$;

drop trigger if exists notnull_nlt_b2b on leads;
create trigger notnull_nlt_b2b before insert or update on leads
  for each row execute function public.trg_notnull_nlt_b2b();

-- c. target immutabile: il target è provenienza, non si cambia.
create or replace function public.trg_target_immutabile()
returns trigger language plpgsql as $$
begin
  if NEW.target is distinct from OLD.target then
    raise exception 'il target è provenienza: creare un nuovo lead e scartare questo';
  end if;
  return NEW;
end $$;

drop trigger if exists target_immutabile on leads;
create trigger target_immutabile before update on leads
  for each row execute function public.trg_target_immutabile();

-- d. valida_dettagli su lead_stati_storia: dettagli vs schemi_esiti[stato] del target
--    del lead. Permissivo se lo schema per quello stato manca.
create or replace function public.trg_valida_dettagli()
returns trigger language plpgsql as $$
declare
  tgt text;
  sch jsonb;
begin
  select l.target into tgt from leads l where l.id = NEW.lead_id;
  if tgt is null then return NEW; end if;
  select (r.schemi_esiti -> NEW.stato) into sch from registro_target r where r.target = tgt;
  if sch is null then return NEW; end if; -- permissivo: nessuno schema per questo stato
  if not extensions.jsonb_matches_schema(sch::json, NEW.dettagli) then
    raise exception 'dettagli non conformi allo schema esiti (target %, stato %)', tgt, NEW.stato;
  end if;
  return NEW;
end $$;

drop trigger if exists valida_dettagli on lead_stati_storia;
create trigger valida_dettagli before insert or update on lead_stati_storia
  for each row when (NEW.dettagli is not null)
  execute function public.trg_valida_dettagli();
