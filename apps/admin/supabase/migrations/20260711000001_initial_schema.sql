-- Keystone Admin — initial schema.
-- See docs/admin-tool-design.md at the repo root for the full design.

create extension if not exists pgcrypto;

-- Shared by every table with an `updated_at` column.
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

--------------------------------------------------------------------------------
-- profiles
--------------------------------------------------------------------------------
-- One row per provisioned staff member. Access is provisioned by inserting a
-- row here; a Supabase Auth login with no matching row is rejected at the
-- proxy/middleware layer (see lib/supabase/middleware.ts).

create type user_role as enum ('owner', 'staff', 'viewer');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'staff',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- security definer: these run with the function owner's privileges, which
-- bypasses RLS on the lookup itself. Without this, a policy on `profiles`
-- that queries `profiles` recurses into itself (Postgres raises
-- "infinite recursion detected in policy for relation profiles").
create or replace function is_provisioned() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p where p.id = auth.uid() and p.active
  );
$$;

create or replace function is_active_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.active
      and p.role in ('owner', 'staff')
  );
$$;

create or replace function is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.active and p.role = 'owner'
  );
$$;

create or replace function current_profile_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

-- Any provisioned user can read the small internal roster (useful for
-- "assigned to" pickers). Only an owner can change role/active/who exists;
-- everyone else can edit only their own display fields, and never their own
-- role or active flag (enforced via current_profile_role(), not a raw
-- self-select, to avoid the recursion above).
create policy profiles_read on profiles
  for select using (is_provisioned());

create policy profiles_update_self on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = current_profile_role());

create policy profiles_owner_manage on profiles
  for all using (is_owner()) with check (is_owner());

--------------------------------------------------------------------------------
-- clients & contacts
--------------------------------------------------------------------------------

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  stripe_customer_id text unique,
  billing_email text,
  address_json jsonb,
  notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger t_clients_updated before update on clients
  for each row execute function set_updated_at();

create table contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  name text not null,
  email text,
  title text,
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger t_contacts_updated before update on contacts
  for each row execute function set_updated_at();

create index contacts_client_id_idx on contacts (client_id);

alter table clients enable row level security;
alter table contacts enable row level security;

create policy clients_read on clients for select using (is_provisioned());
create policy clients_write on clients for all using (is_active_staff()) with check (is_active_staff());

create policy contacts_read on contacts for select using (is_provisioned());
create policy contacts_write on contacts for all using (is_active_staff()) with check (is_active_staff());

--------------------------------------------------------------------------------
-- projects
--------------------------------------------------------------------------------

create type service_line as enum (
  'net_new_development',
  'vibe_code_to_production',
  'business_process_automation',
  'acquisition_due_diligence',
  'ai_training_setup',
  'codebase_improvement'
);

create type project_status as enum (
  'lead', 'scoping', 'contracting', 'active', 'handoff', 'closed', 'lost'
);

create type pricing_type as enum ('fixed', 'retainer');

create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  name text not null,
  service_line service_line,
  status project_status not null default 'lead',
  pricing_type pricing_type not null default 'fixed',
  amount_total integer, -- minor units (cents)
  currency char(3) not null default 'usd',
  summary text,
  start_date date,
  target_end_date date,
  notion_url text,
  notion_page_id text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger t_projects_updated before update on projects
  for each row execute function set_updated_at();

create index projects_client_id_idx on projects (client_id);
create index projects_status_idx on projects (status);

alter table projects enable row level security;

create policy projects_read on projects for select using (is_provisioned());
create policy projects_write on projects for all using (is_active_staff()) with check (is_active_staff());

--------------------------------------------------------------------------------
-- invoices (created before milestones so milestones.invoice_id can reference
-- it directly, with no later alter table)
--------------------------------------------------------------------------------

create type invoice_status as enum ('draft', 'open', 'paid', 'void', 'uncollectible');

create table invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id),
  project_id uuid references projects (id),
  stripe_invoice_id text unique,
  number text,
  status invoice_status not null default 'draft',
  amount_due integer not null default 0, -- minor units
  amount_paid integer not null default 0,
  currency char(3) not null default 'usd',
  issued_at timestamptz,
  due_at timestamptz,
  paid_at timestamptz,
  hosted_invoice_url text,
  pdf_url text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger t_invoices_updated before update on invoices
  for each row execute function set_updated_at();

create index invoices_client_id_idx on invoices (client_id);
create index invoices_project_id_idx on invoices (project_id);
create index invoices_status_idx on invoices (status);

--------------------------------------------------------------------------------
-- milestones
--------------------------------------------------------------------------------

create type milestone_status as enum ('pending', 'invoiced', 'paid');

create table milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  title text not null,
  amount integer not null, -- minor units (cents)
  currency char(3) not null default 'usd',
  due_date date,
  status milestone_status not null default 'pending',
  sort_order integer not null default 0,
  invoice_id uuid references invoices (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger t_milestones_updated before update on milestones
  for each row execute function set_updated_at();

create index milestones_project_id_idx on milestones (project_id);

alter table milestones enable row level security;

create policy milestones_read on milestones for select using (is_provisioned());
create policy milestones_write on milestones for all using (is_active_staff()) with check (is_active_staff());

--------------------------------------------------------------------------------
-- invoice line items, payments, integration events
--------------------------------------------------------------------------------

create table invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  description text not null,
  quantity integer not null default 1,
  unit_amount integer not null, -- minor units
  amount integer not null, -- minor units
  milestone_id uuid references milestones (id),
  created_at timestamptz not null default now()
);

create index invoice_line_items_invoice_id_idx on invoice_line_items (invoice_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id),
  stripe_payment_intent_id text unique,
  amount integer not null, -- minor units
  currency char(3) not null default 'usd',
  status text not null,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index payments_invoice_id_idx on payments (invoice_id);

-- Idempotency guard for replayed provider webhooks (Stripe, Zoho). A unique
-- violation on `external_id` means "already processed" — the webhook
-- handler treats that as a no-op, not an error.
create table integration_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text not null,
  external_id text not null unique,
  payload_json jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index integration_events_provider_idx on integration_events (provider);

alter table invoices enable row level security;
alter table invoice_line_items enable row level security;
alter table payments enable row level security;
alter table integration_events enable row level security;

create policy invoices_read on invoices for select using (is_provisioned());
create policy invoices_write on invoices for all using (is_active_staff()) with check (is_active_staff());

create policy invoice_line_items_read on invoice_line_items for select using (is_provisioned());
create policy invoice_line_items_write on invoice_line_items for all using (is_active_staff()) with check (is_active_staff());

create policy payments_read on payments for select using (is_provisioned());
create policy payments_write on payments for all using (is_active_staff()) with check (is_active_staff());

-- integration_events is service-role-only: no policy grants staff/viewer
-- access, so a request-scoped (RLS) client can never read or write it —
-- only Route Handlers using the admin client (webhooks) touch this table.
-- Owners can inspect it for the /settings integration health view.
create policy integration_events_owner_read on integration_events for select using (is_owner());

--------------------------------------------------------------------------------
-- contracts
--------------------------------------------------------------------------------

create type contract_status as enum ('draft', 'sent', 'viewed', 'signed', 'declined', 'expired');

create table contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id),
  project_id uuid references projects (id),
  zoho_request_id text unique,
  title text not null,
  status contract_status not null default 'draft',
  template_key text,
  sent_at timestamptz,
  signed_at timestamptz,
  signed_pdf_path text, -- path within the private `contracts` Storage bucket
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger t_contracts_updated before update on contracts
  for each row execute function set_updated_at();

create index contracts_client_id_idx on contracts (client_id);
create index contracts_project_id_idx on contracts (project_id);

alter table contracts enable row level security;

create policy contracts_read on contracts for select using (is_provisioned());
create policy contracts_write on contracts for all using (is_active_staff()) with check (is_active_staff());

-- Private bucket for executed contract PDFs. Only ever accessed via
-- short-lived signed URLs generated server-side (lib/zoho/sign.ts) —
-- Storage RLS below still gates direct access as a backstop.
insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

create policy contracts_bucket_read on storage.objects
  for select using (bucket_id = 'contracts' and is_provisioned());

create policy contracts_bucket_write on storage.objects
  for insert with check (bucket_id = 'contracts' and is_active_staff());

--------------------------------------------------------------------------------
-- activity log
--------------------------------------------------------------------------------

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  summary text not null,
  metadata_json jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_entity_idx on activity_log (entity_type, entity_id);
create index activity_log_created_at_idx on activity_log (created_at desc);

alter table activity_log enable row level security;

-- Append-only audit trail: readable by anyone provisioned, insertable by
-- active staff, never updated or deleted through the API.
create policy activity_log_read on activity_log for select using (is_provisioned());
create policy activity_log_insert on activity_log for insert with check (is_active_staff());
