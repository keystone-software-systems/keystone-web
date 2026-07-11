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
