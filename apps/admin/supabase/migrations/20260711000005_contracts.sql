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
