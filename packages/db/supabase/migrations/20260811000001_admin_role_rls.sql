-- Extends the RLS helper functions below to recognize the new `admin` role added in
-- 20260811000000_add_admin_role.sql. These supersede the versions defined in
-- 20260724000000_init_schema.sql (is_active_staff, is_provisioned_internal) and
-- 20260810000000_prospects.sql (has_brand_access) — table policies call these functions, so
-- updating the functions is sufficient without touching any policy.

create or replace function is_active_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.active and p.role in ('owner', 'staff', 'admin')
  );
$$;

create or replace function is_provisioned_internal() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.active and p.role in ('owner', 'staff', 'viewer', 'admin')
  );
$$;

create or replace function has_brand_access(p_brand brand) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.active
      and (
        p.role in ('owner', 'admin')
        or exists (
          select 1 from profile_brand_access pba
          where pba.profile_id = p.id and pba.brand = p_brand
        )
      )
  );
$$;
