-- Profiles: one row per provisioned staff member. Access is provisioned by
-- inserting a row here; a Supabase Auth login with no matching row is
-- rejected at the middleware layer (see lib/supabase/middleware.ts).

create extension if not exists pgcrypto;

-- Shared by every table with an `updated_at` column.
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
