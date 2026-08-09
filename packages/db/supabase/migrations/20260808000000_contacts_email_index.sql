-- intake-portal-design.md §4/§9 Phase 1: the "find/create clients by email"
-- lookup on /submit and the auto-link-on-auth lookup both go through
-- contacts.email case-insensitively — index it.
create index idx_contacts_email_lower on contacts (lower(email));
