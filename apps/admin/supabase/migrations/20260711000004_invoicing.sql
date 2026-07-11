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

alter table milestones
  add constraint milestones_invoice_id_fkey
  foreign key (invoice_id) references invoices (id);

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

-- Idempotency guard for replayed provider webhooks (Stripe, Zoho). A
-- unique violation on `external_id` means "already processed" — the
-- webhook handler treats that as a no-op, not an error.
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
-- access, so a Request-scoped (RLS) client can never read or write it —
-- only the Route Handlers using the admin client (webhooks) touch this
-- table. Owners can inspect it for the /settings integration health view
-- via the admin client from a role-checked Server Action, not directly.
create policy integration_events_owner_read on integration_events for select using (is_owner());
