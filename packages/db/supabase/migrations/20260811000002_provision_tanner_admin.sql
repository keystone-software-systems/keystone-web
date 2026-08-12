-- migration-metadata: types-unchanged
-- Data-only: provisions the founder's profiles row as 'admin' now that the role exists.
-- No-op if auth.users has no matching row yet (first magic-link/password-set request
-- creates that row before this can run).
insert into profiles (id, email, full_name, role, active)
select id, email, 'Tanner Barlow', 'admin', true
from auth.users where email = 'tanner@keystone.systems'
on conflict (id) do update set role = 'admin', active = true;
