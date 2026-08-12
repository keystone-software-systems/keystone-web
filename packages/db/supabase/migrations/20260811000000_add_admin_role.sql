-- Adds a cross-app super-role. `admin` passes every authorization check in both apps/admin and
-- apps/portal (see requireRole() in each app's lib/auth.ts) — not just the ones `owner`
-- currently satisfies. Split into its own migration/transaction because Postgres won't let a
-- transaction use an enum value it added in that same transaction; the RLS helper updates that
-- reference 'admin' live in the next migration.
alter type profile_role add value 'admin';
