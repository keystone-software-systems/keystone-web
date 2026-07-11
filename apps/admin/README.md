# Keystone Admin

Internal back-office app: clients, projects, Stripe invoicing, Zoho Sign contracts, and a linked
Notion doc per project. See `docs/admin-tool-design.md` at the repo root for the full design.

## Setup

```bash
cp .env.example .env.local   # fill in Supabase/Stripe/Zoho values
npm install                  # from the repo root (npm workspaces)
npm run dev:admin            # from the repo root
```

Apply migrations to your Supabase project with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Structure

- `app/(auth)` — login (Supabase magic link)
- `app/(app)` — the authenticated app shell: dashboard, clients, projects, invoices, contracts, settings
- `app/api/webhooks` — Stripe and Zoho webhook receivers (unauthenticated, signature-verified)
- `lib/supabase` — request-scoped (RLS) and service-role Supabase clients
- `lib/stripe`, `lib/zoho`, `lib/notion` — integration clients
- `actions/` — Server Actions, the single write path for the UI
- `supabase/migrations` — versioned schema + RLS policies

## Status

Scaffolded per `docs/admin-tool-design.md`'s phased build plan (Phase 0–4). Real Stripe/Zoho
credentials are required to exercise those integrations end-to-end; until then this runs against
placeholder env vars for typecheck/build/CI.
