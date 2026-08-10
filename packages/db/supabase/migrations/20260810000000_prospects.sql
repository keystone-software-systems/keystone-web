-- Prospect sourcing & outreach tracker (docs/marketing-plan.md).
-- Adds brand-scoped access control (profile_brand_access / has_brand_access) since this is the
-- first table where Keystone and StackDiligence data lives side by side — clients/projects
-- today are Keystone-only, with no brand column.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Not prospect-specific by name: this is the first brand-scoped table, and future
-- StackDiligence-side data (clients/projects are Keystone-only today) would reuse it rather
-- than each table growing its own enum.
create type brand as enum ('keystone', 'stackdiligence');

create type prospect_segment as enum (
  'vibe_code_to_production', 'codebase_improvement', 'ai_training_setup',
  'warm_network', 'partner_referral',
  'referral_partner', 'live_deal', 'independent_sponsor'
);

create type prospect_status as enum (
  'new', 'researching', 'contacted', 'replied', 'call_booked', 'engaged', 'not_now', 'dead'
);

-- ---------------------------------------------------------------------------
-- Brand access control
-- ---------------------------------------------------------------------------

-- Per-brand grant for staff/viewer profiles. Owners implicitly see every brand (see
-- has_brand_access() below) and never need a row here. Managed out-of-band, same as `profiles`
-- itself — no admin UI yet.
create table profile_brand_access (
  profile_id uuid not null references profiles(id) on delete cascade,
  brand brand not null,
  primary key (profile_id, brand)
);

create or replace function has_brand_access(p_brand brand) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.active
      and (
        p.role = 'owner'
        or exists (
          select 1 from profile_brand_access pba
          where pba.profile_id = p.id and pba.brand = p_brand
        )
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table prospects (
  id uuid primary key default gen_random_uuid(),
  brand brand not null,
  segment prospect_segment not null,
  status prospect_status not null default 'new',
  name text not null,           -- person or firm name
  company text,
  title text,
  email text,
  linkedin_url text,
  website_url text,
  location text,
  source text,                  -- free text: "Product Hunt launch", "ACG Utah roster", url, etc.
  notes text,
  next_follow_up_on date,
  last_contacted_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_prospects_brand_segment_status on prospects(brand, segment, status);
create index idx_prospects_follow_up on prospects(next_follow_up_on);
create trigger t_prospects_updated before update on prospects
  for each row execute function set_updated_at();

-- Semi-automated sourcing: scheduled fetch jobs write candidates here for human triage; nothing
-- auto-promotes into `prospects`.
create table feed_sources (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,       -- e.g. 'producthunt-no-code'
  kind text not null,             -- 'producthunt_topic' | 'rss'
  label text not null,
  brand brand not null,
  segment prospect_segment not null,
  config_json jsonb not null,     -- {topic: 'no-code'} or {url: 'https://...'}
  active boolean not null default true,
  last_run_at timestamptz,
  created_at timestamptz not null default now()
);

-- brand/segment are denormalized from feed_sources at insert time (the cron job copies them
-- over) rather than joined in RLS/queries — keeps the read policy a flat column check like
-- every other brand-scoped table here.
create table prospect_feed_items (
  id uuid primary key default gen_random_uuid(),
  feed_source_id uuid not null references feed_sources(id) on delete cascade,
  brand brand not null,
  segment prospect_segment not null,
  external_id text not null,      -- dedup key from the source (PH post id, RSS guid/link)
  title text not null,
  url text,
  snippet text,
  raw_json jsonb,
  status text not null default 'new',  -- 'new' | 'promoted' | 'dismissed'
  prospect_id uuid references prospects(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index idx_prospect_feed_items_dedup on prospect_feed_items(feed_source_id, external_id);
create index idx_prospect_feed_items_status on prospect_feed_items(status);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table profile_brand_access enable row level security;
create policy profile_brand_access_read on profile_brand_access for select using (
  profile_id = auth.uid() or is_active_staff()
);
create policy profile_brand_access_staff_write on profile_brand_access for all using (
  is_active_staff()
) with check (
  is_active_staff()
);

-- Internal read + staff write, same shape as clients/contacts, gated additionally by
-- has_brand_access() so a brand-scoped staff/viewer profile never sees the other brand's data.
alter table prospects enable row level security;
create policy prospects_read on prospects for select using (
  is_provisioned_internal() and has_brand_access(brand)
);
create policy prospects_write on prospects for all using (
  is_active_staff() and has_brand_access(brand)
) with check (
  is_active_staff() and has_brand_access(brand)
);

alter table feed_sources enable row level security;
create policy feed_sources_staff on feed_sources for all using (
  is_active_staff() and has_brand_access(brand)
) with check (
  is_active_staff() and has_brand_access(brand)
);

alter table prospect_feed_items enable row level security;
create policy prospect_feed_items_read on prospect_feed_items for select using (
  is_provisioned_internal() and has_brand_access(brand)
);
create policy prospect_feed_items_write on prospect_feed_items for all using (
  is_active_staff() and has_brand_access(brand)
) with check (
  is_active_staff() and has_brand_access(brand)
);

-- ---------------------------------------------------------------------------
-- Seed data — Product Hunt feed sources only. RSS sources need a user-specific Google Alert
-- URL, added manually (via Supabase) once one exists.
-- ---------------------------------------------------------------------------

insert into feed_sources (key, kind, label, brand, segment, config_json) values
  ('producthunt-no-code', 'producthunt_topic', 'Product Hunt — No-Code launches',
   'keystone', 'vibe_code_to_production', '{"topic":"no-code"}'),
  ('producthunt-ai', 'producthunt_topic', 'Product Hunt — AI launches',
   'keystone', 'vibe_code_to_production', '{"topic":"artificial-intelligence"}');
