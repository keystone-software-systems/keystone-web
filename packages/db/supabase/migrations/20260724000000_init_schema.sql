-- Keystone Systems — initial schema.
-- Combines the commercial spine from docs/admin-tool-design.md §5 with the
-- portal additions from docs/intake-portal-design.md §4. Single source of
-- truth for apps/admin and apps/portal, both of which read/write this schema
-- against the same Supabase project.
--
-- Deliberately excludes: take-rate/fee fields on project_assignments
-- (blocked on intake-portal-design.md §11.2, a founder decision, not an
-- engineering one — see engineer_payouts below).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type profile_role as enum ('owner', 'staff', 'viewer', 'client', 'engineer');

-- Five current service lines (company-context.md) — acquisition due diligence
-- spun out to StackDiligence and is not a Keystone Systems service line.
create type service_line as enum (
  'net_new_development',
  'vibe_code_to_production',
  'business_process_automation',
  'ai_training_setup',
  'codebase_improvement'
);

create type project_status as enum (
  'submitted', 'lead', 'scoping', 'contracting', 'active', 'handoff', 'closed', 'lost'
);
create type pricing_type as enum ('fixed', 'retainer');
create type engagement_type as enum ('short_term_project', 'long_term_project', 'retainer');
create type milestone_status as enum ('pending', 'invoiced', 'paid');
create type invoice_status as enum ('draft', 'open', 'paid', 'void', 'uncollectible');
create type contract_status as enum ('draft', 'sent', 'viewed', 'signed', 'declined', 'expired');
create type engineer_availability as enum ('full_time', 'moonlighting', 'flexible');
create type connect_status as enum ('not_started', 'onboarding', 'active', 'restricted');
create type assignment_status as enum ('offered', 'accepted', 'declined', 'completed');
create type payout_status as enum ('pending', 'paid', 'reversed', 'failed');

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- Core tables (dependency order)
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role profile_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  stripe_customer_id text,
  billing_email text,
  address_json jsonb,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger t_clients_updated before update on clients
  for each row execute function set_updated_at();

create table contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  email text,
  title text,
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_contacts_client on contacts(client_id);

-- name is nullable: a portal submission (status='submitted') arrives with only
-- a description; the founder names it on promotion to 'lead'.
create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text,
  service_line service_line,
  status project_status not null default 'submitted',
  pricing_type pricing_type,
  engagement_type engagement_type,
  amount_total integer,
  currency char(3) not null default 'USD',
  summary text,
  start_date date,
  target_end_date date,
  notion_url text,
  notion_page_id text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_projects_client on projects(client_id);
create index idx_projects_status on projects(status);
create trigger t_projects_updated before update on projects
  for each row execute function set_updated_at();

create table milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  amount integer not null,
  currency char(3) not null default 'USD',
  due_date date,
  status milestone_status not null default 'pending',
  sort_order integer not null default 0,
  invoice_id uuid,
  created_at timestamptz not null default now()
);
create index idx_milestones_project on milestones(project_id);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  stripe_invoice_id text unique,
  number text,
  status invoice_status not null default 'draft',
  amount_due integer,
  amount_paid integer not null default 0,
  currency char(3) not null default 'USD',
  issued_at timestamptz,
  due_at timestamptz,
  paid_at timestamptz,
  hosted_invoice_url text,
  pdf_url text,
  created_at timestamptz not null default now()
);
create index idx_invoices_client on invoices(client_id);
create index idx_invoices_project on invoices(project_id);

alter table milestones
  add constraint milestones_invoice_id_fkey foreign key (invoice_id)
  references invoices(id) on delete set null;

create table invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity integer not null default 1,
  unit_amount integer not null,
  amount integer not null,
  milestone_id uuid references milestones(id) on delete set null,
  created_at timestamptz not null default now()
);
create index idx_invoice_line_items_invoice on invoice_line_items(invoice_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  stripe_payment_intent_id text,
  amount integer not null,
  currency char(3) not null default 'USD',
  status text,
  received_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_payments_invoice on payments(invoice_id);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  zoho_request_id text,
  title text,
  status contract_status not null default 'draft',
  sent_at timestamptz,
  signed_at timestamptz,
  signed_pdf_path text,
  template_key text,
  created_at timestamptz not null default now()
);
create index idx_contracts_client on contracts(client_id);
create index idx_contracts_project on contracts(project_id);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  summary text,
  metadata_json jsonb,
  created_at timestamptz not null default now()
);
create index idx_activity_log_entity on activity_log(entity_type, entity_id);

create table integration_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text not null,
  external_id text not null unique,
  payload_json jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Portal additions (intake-portal-design.md §4)
-- ---------------------------------------------------------------------------

create table client_users (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (client_id, user_id)
);
create index idx_client_users_user on client_users(user_id);

create table submission_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  author_id uuid not null references profiles(id),
  visible_to_client boolean not null default true,
  body text not null,
  created_at timestamptz not null default now()
);
create index idx_submission_comments_project on submission_comments(project_id);

create table engineer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  display_name text not null,
  bio text,
  background_note text,
  years_experience integer,
  skills text[] not null default '{}',
  availability engineer_availability,
  stripe_connect_account_id text,
  connect_status connect_status not null default 'not_started',
  hourly_rate_cents integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger t_engineer_profiles_updated before update on engineer_profiles
  for each row execute function set_updated_at();

create table project_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  engineer_id uuid not null references engineer_profiles(id) on delete cascade,
  status assignment_status not null default 'offered',
  offered_at timestamptz not null default now(),
  responded_at timestamptz,
  role_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_project_assignments_project on project_assignments(project_id);
create index idx_project_assignments_engineer on project_assignments(engineer_id);
create trigger t_project_assignments_updated before update on project_assignments
  for each row execute function set_updated_at();

-- Records completed Stripe Connect transfers. The engineer's agreed share
-- (flat fee vs. percentage) is a founder decision, not yet made
-- (intake-portal-design.md §11.2) — those field(s) land on project_assignments
-- in a follow-up migration once decided. This table just tracks money that
-- already moved.
create table engineer_payouts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  engineer_id uuid not null references engineer_profiles(id) on delete cascade,
  milestone_id uuid references milestones(id) on delete set null,
  stripe_transfer_id text unique,
  amount_cents integer not null,
  currency char(3) not null default 'USD',
  status payout_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index idx_engineer_payouts_engineer on engineer_payouts(engineer_id);

-- ---------------------------------------------------------------------------
-- RLS helper functions
-- ---------------------------------------------------------------------------

-- owner/staff only — the "can mutate anything" check.
create or replace function is_active_staff() returns boolean
language sql stable as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.active and p.role in ('owner', 'staff')
  );
$$;

-- owner/staff/viewer — the "can read the internal commercial spine" check.
create or replace function is_provisioned_internal() returns boolean
language sql stable as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.active and p.role in ('owner', 'staff', 'viewer')
  );
$$;

create or replace function is_project_client(p_project_id uuid) returns boolean
language sql stable as $$
  select exists (
    select 1
    from projects proj
    join client_users cu on cu.client_id = proj.client_id
    where proj.id = p_project_id and cu.user_id = auth.uid()
  );
$$;

create or replace function is_project_engineer(p_project_id uuid) returns boolean
language sql stable as $$
  select exists (
    select 1
    from project_assignments pa
    join engineer_profiles ep on ep.id = pa.engineer_id
    where pa.project_id = p_project_id and ep.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS: enable + policies
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
create policy profiles_read on profiles for select using (
  id = auth.uid() or is_provisioned_internal()
);

alter table clients enable row level security;
create policy clients_read on clients for select using (
  is_provisioned_internal()
  or exists (select 1 from client_users cu where cu.client_id = clients.id and cu.user_id = auth.uid())
);
create policy clients_write on clients for all using (is_active_staff()) with check (is_active_staff());

alter table contacts enable row level security;
create policy contacts_read on contacts for select using (
  is_provisioned_internal()
  or exists (select 1 from client_users cu where cu.client_id = contacts.client_id and cu.user_id = auth.uid())
);
create policy contacts_write on contacts for all using (is_active_staff()) with check (is_active_staff());

alter table projects enable row level security;
create policy projects_read on projects for select using (
  is_provisioned_internal()
  or is_project_client(id)
  or is_project_engineer(id)
);
create policy projects_write on projects for all using (is_active_staff()) with check (is_active_staff());

alter table milestones enable row level security;
create policy milestones_read on milestones for select using (
  is_provisioned_internal() or is_project_client(project_id)
);
create policy milestones_write on milestones for all using (is_active_staff()) with check (is_active_staff());

alter table invoices enable row level security;
create policy invoices_read on invoices for select using (
  is_provisioned_internal()
  or exists (select 1 from client_users cu where cu.client_id = invoices.client_id and cu.user_id = auth.uid())
);
create policy invoices_write on invoices for all using (is_active_staff()) with check (is_active_staff());

alter table invoice_line_items enable row level security;
create policy invoice_line_items_read on invoice_line_items for select using (
  is_provisioned_internal()
  or exists (
    select 1 from invoices i
    join client_users cu on cu.client_id = i.client_id
    where i.id = invoice_line_items.invoice_id and cu.user_id = auth.uid()
  )
);
create policy invoice_line_items_write on invoice_line_items for all using (is_active_staff()) with check (is_active_staff());

alter table payments enable row level security;
create policy payments_read on payments for select using (
  is_provisioned_internal()
  or exists (
    select 1 from invoices i
    join client_users cu on cu.client_id = i.client_id
    where i.id = payments.invoice_id and cu.user_id = auth.uid()
  )
);
create policy payments_write on payments for all using (is_active_staff()) with check (is_active_staff());

alter table contracts enable row level security;
create policy contracts_read on contracts for select using (
  is_provisioned_internal()
  or exists (select 1 from client_users cu where cu.client_id = contracts.client_id and cu.user_id = auth.uid())
);
create policy contracts_write on contracts for all using (is_active_staff()) with check (is_active_staff());

alter table activity_log enable row level security;
create policy activity_log_read on activity_log for select using (is_provisioned_internal());
create policy activity_log_write on activity_log for all using (is_active_staff()) with check (is_active_staff());

alter table integration_events enable row level security;
create policy integration_events_staff on integration_events for all using (is_active_staff()) with check (is_active_staff());

alter table client_users enable row level security;
create policy client_users_read on client_users for select using (
  is_provisioned_internal() or user_id = auth.uid()
);
create policy client_users_write on client_users for all using (is_active_staff()) with check (is_active_staff());

alter table submission_comments enable row level security;
create policy submission_comments_read on submission_comments for select using (
  is_provisioned_internal()
  or (visible_to_client and is_project_client(project_id))
);
create policy submission_comments_insert_client on submission_comments for insert with check (
  is_project_client(project_id) and visible_to_client and author_id = auth.uid()
);
create policy submission_comments_staff_write on submission_comments for all using (is_active_staff()) with check (is_active_staff());

alter table engineer_profiles enable row level security;
create policy engineer_profiles_read on engineer_profiles for select using (
  is_provisioned_internal()
  or user_id = auth.uid()
  or exists (
    select 1 from project_assignments pa
    where pa.engineer_id = engineer_profiles.id
      and pa.status = 'accepted'
      and is_project_client(pa.project_id)
  )
);
create policy engineer_profiles_self_write on engineer_profiles for update using (
  user_id = auth.uid()
) with check (
  user_id = auth.uid()
);
create policy engineer_profiles_staff_write on engineer_profiles for all using (is_active_staff()) with check (is_active_staff());

alter table project_assignments enable row level security;
create policy project_assignments_read on project_assignments for select using (
  is_provisioned_internal()
  or is_project_client(project_id)
  or exists (select 1 from engineer_profiles ep where ep.id = project_assignments.engineer_id and ep.user_id = auth.uid())
);
create policy project_assignments_engineer_respond on project_assignments for update using (
  exists (select 1 from engineer_profiles ep where ep.id = project_assignments.engineer_id and ep.user_id = auth.uid())
) with check (
  exists (select 1 from engineer_profiles ep where ep.id = project_assignments.engineer_id and ep.user_id = auth.uid())
);
create policy project_assignments_staff_write on project_assignments for all using (is_active_staff()) with check (is_active_staff());

alter table engineer_payouts enable row level security;
create policy engineer_payouts_read on engineer_payouts for select using (
  is_provisioned_internal()
  or exists (select 1 from engineer_profiles ep where ep.id = engineer_payouts.engineer_id and ep.user_id = auth.uid())
);
create policy engineer_payouts_write on engineer_payouts for all using (is_active_staff()) with check (is_active_staff());
