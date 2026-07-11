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
  invoice_id uuid, -- fk added in the invoicing migration once `invoices` exists
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger t_milestones_updated before update on milestones
  for each row execute function set_updated_at();

create index milestones_project_id_idx on milestones (project_id);

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

alter table projects enable row level security;
alter table milestones enable row level security;
alter table activity_log enable row level security;

create policy projects_read on projects for select using (is_provisioned());
create policy projects_write on projects for all using (is_active_staff()) with check (is_active_staff());

create policy milestones_read on milestones for select using (is_provisioned());
create policy milestones_write on milestones for all using (is_active_staff()) with check (is_active_staff());

-- Activity is an append-only audit trail: readable by anyone provisioned,
-- insertable by active staff, never updated or deleted through the API.
create policy activity_log_read on activity_log for select using (is_provisioned());
create policy activity_log_insert on activity_log for insert with check (is_active_staff());
