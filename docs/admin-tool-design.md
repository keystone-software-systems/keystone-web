# Keystone Systems — Internal Admin Tool Design

*Design document for an internal back-office application: invoicing (Stripe), contracts and
e-signature (Zoho Sign), and project management. Data and auth on Supabase.*

Status: **proposed**. This is a design, not a commitment. Open decisions are listed at the end;
resolve those before Phase 1.

---

## 1. What this is

A single internal web app the founder (and, later, bench consultants) uses to run the operational
side of the consultancy:

- **Clients & contacts** — the companies engaged and the people at them.
- **Projects** — one per engagement, tracking scope, status, milestones, and commercials.
- **Invoicing** — issue and track invoices through Stripe, with payment status synced back.
- **Contracts** — generate an engagement agreement, send it for signature through Zoho Sign, and
  track it to signed.
- **Activity** — an audit trail of what happened and when.

It is deliberately narrow. It is not a CRM, not a time tracker (engagements are priced to the
outcome, not the hour — see `docs/company-context.md`), and not a general accounting system.
Stripe is the system of record for money; Zoho Sign is the system of record for signatures; this
app is the operational layer that ties a project to its invoices and its contract.

### Design principles

- **Boring and durable.** Same values as the brand: understated, correct, low-surface-area. No
  feature we cannot maintain solo.
- **External systems own their domain.** We store *references* (Stripe/Zoho IDs) and a cached
  status, never a second source of truth for money or signatures. Webhooks reconcile.
- **Server-side secrets, always.** Stripe secret key, Zoho refresh token, and the Supabase service
  role key never reach the browser. All privileged work runs in Route Handlers / Server Actions.
- **Least privilege, audited.** Small user set, role-gated, every mutation logged.

---

## 2. Where it lives

A new workspace in this monorepo:

```
apps/
  web/      existing public marketing site (unchanged)
  admin/    new internal admin app  ← this document
```

Rationale: it shares the toolchain, brand tokens, and TypeScript config with `apps/web`, but is a
**separate Next.js app deployed as a separate Vercel project** (Root Directory `apps/admin`). The
public site stays fully static and unauthenticated; the admin app is gated end-to-end. They do not
share a runtime, a domain, or a set of secrets.

Suggested host: `admin.keystone.systems` (or a Vercel-generated URL behind auth — no public link
from the marketing site).

> **Open decision:** if this is meant to become the Scaleyard back-office (see company context —
> Scaleyard is a separate venture with payments/contracts/e-signature tooling) rather than a
> Keystone-only tool, it should probably be its own repo. Designed here as Keystone-internal in
> this monorepo; relocating is cheap while it is early.

### Stack (matches `apps/web`)

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind v4, brand tokens from the Blueprint palette |
| Data + Auth | Supabase (Postgres, Auth, Storage, RLS) |
| Payments | Stripe (Invoicing API + webhooks) |
| E-signature | Zoho Sign (REST API + webhooks) |
| Hosting | Vercel (separate project, Node runtime for integration routes) |

New dependencies (admin app only): `@supabase/supabase-js`, `@supabase/ssr`, `stripe`, `zod`
(input validation). Zoho is called over `fetch` (thin, no maintained first-party Node SDK worth
pulling in).

> **Next.js version note:** `apps/web/AGENTS.md` warns this Next.js has breaking changes vs. prior
> training data. Before writing app code, read the relevant guides in
> `apps/admin/node_modules/next/dist/docs/` — especially for Route Handlers, middleware, and
> Server Actions, which the auth and webhook layers depend on.

---

## 3. Architecture

```
                          ┌────────────────────────────────────────────┐
                          │            apps/admin (Next.js)             │
  Browser  ──────────────▶│  Server Components  ·  Server Actions       │
  (staff, authed)         │  Route Handlers (/api/*)                    │
                          │  Middleware (session refresh + gate)        │
                          └───────┬───────────────┬───────────────┬─────┘
                                  │               │               │
                     Supabase     │        Stripe │         Zoho  │ Sign
                  (Postgres/Auth/ │  (secret key, │      (OAuth2, │
                   Storage/RLS)   │   Invoicing)  │       Sign)   │
                                  │               │               │
                                  ▼               ▼               ▼
                          Webhooks reconcile status back into Postgres:
                          /api/webhooks/stripe   /api/webhooks/zoho
```

- **Reads** happen in Server Components using a request-scoped Supabase client bound to the signed-in
  user, so **RLS** governs what is visible.
- **Mutations** happen in Server Actions / Route Handlers. Calls to Stripe/Zoho and any privileged
  DB write use the **service-role** client (RLS-bypassing) and re-check the caller's role in code.
- **Webhooks** are unauthenticated public routes that verify a provider signature, then write with
  the service-role client. They are the *only* way external status enters the DB, which keeps
  reconciliation in one place.

### Two Supabase clients

| Client | Key | Used by | RLS |
|---|---|---|---|
| Request client | anon key + user JWT (via `@supabase/ssr` cookies) | Server Components, user-scoped reads | enforced |
| Admin client | service role key | Route Handlers, webhooks, integration writes | bypassed |

The service-role key is server-only (never in a `NEXT_PUBLIC_` var, never imported into a Client
Component).

---

## 4. Authentication & authorization

**Provider:** Supabase Auth.

**Method:** Google OAuth restricted to allowed identities, plus email magic link as a fallback.
Because the user set is tiny (founder + a few bench consultants), we do not self-serve signups.
Access is provisioned by inserting a row into `profiles` with a role; a login whose email is not
pre-provisioned is rejected at the middleware layer even if Supabase authenticates it.

**Roles:**

| Role | Can |
|---|---|
| `owner` | Everything, incl. managing users and integration settings |
| `staff` | Clients, projects, invoices, contracts — day-to-day ops |
| `viewer` | Read-only (e.g. an accountant or a bench consultant during handoff) |

**Enforcement layers (defense in depth):**

1. **Middleware** (`middleware.ts`) — refreshes the Supabase session cookie on every request and
   redirects unauthenticated users to `/login`. Also blocks any authenticated user without a
   `profiles` row.
2. **RLS** — every table requires an authenticated user with a `profiles` row to read; writes are
   further gated by role via policy. This is the real security boundary.
3. **In-code role checks** — Server Actions re-assert role before privileged work, so a missing or
   loose policy is not the only thing standing between a `viewer` and a Stripe charge.

RLS is the backstop: even if an app-layer check is forgotten, Postgres refuses the row.

---

## 5. Data model

Postgres via Supabase. All tables are in `public`, have `id uuid default gen_random_uuid()`,
`created_at timestamptz default now()`, and (where mutated) `updated_at` maintained by a trigger.
Money is stored as **integer minor units** (cents) plus a `currency` char(3), matching Stripe —
never floats.

### Core tables

```
profiles           id (= auth.users.id) · email · full_name · role · active
clients            id · name · legal_name · stripe_customer_id · billing_email ·
                     address_json · notes · created_by
contacts           id · client_id → clients · name · email · title · phone · is_primary
projects           id · client_id → clients · name · service_line · status ·
                     pricing_type · amount_total · currency · summary ·
                     start_date · target_end_date · created_by
milestones         id · project_id → projects · title · amount · currency ·
                     due_date · status · sort_order · invoice_id → invoices (nullable)
invoices           id · client_id → clients · project_id → projects (nullable) ·
                     stripe_invoice_id · number · status · amount_due · amount_paid ·
                     currency · issued_at · due_at · paid_at · hosted_invoice_url · pdf_url
invoice_line_items id · invoice_id → invoices · description · quantity ·
                     unit_amount · amount · milestone_id → milestones (nullable)
contracts          id · client_id → clients · project_id → projects (nullable) ·
                     zoho_request_id · title · status · sent_at · signed_at ·
                     signed_pdf_path (Supabase Storage) · template_key
payments           id · invoice_id → invoices · stripe_payment_intent_id ·
                     amount · currency · status · received_at
activity_log       id · actor_id → profiles (nullable) · entity_type · entity_id ·
                     action · summary · metadata_json · created_at
integration_events id · provider · event_type · external_id (unique) ·
                     payload_json · processed_at · created_at
```

### Enumerations (Postgres enums or check-constrained text)

- `service_line`: the six lines from company context — `net_new_development`,
  `vibe_code_to_production`, `business_process_automation`, `acquisition_due_diligence`,
  `ai_training_setup`, `codebase_improvement`.
- `project.status`: `lead` → `scoping` → `contracting` → `active` → `handoff` → `closed`
  (plus `lost`). This mirrors how an engagement actually moves: scope it, paper it, do it, hand it
  off.
- `project.pricing_type`: `fixed` | `retainer`. (Outcome-priced fixed is the default; retainer
  covers the fractional-CTO arrangement.)
- `milestone.status`: `pending` | `invoiced` | `paid`.
- `invoice.status`: mirror Stripe — `draft` | `open` | `paid` | `void` | `uncollectible`.
- `contract.status`: mirror Zoho Sign — `draft` | `sent` | `viewed` | `signed` | `declined` |
  `expired`.

### Key relationships & rules

- A **client** maps 1:1 to a Stripe Customer (`stripe_customer_id`); created lazily the first time
  we invoice them.
- A **project** is the unit of work and the hub the UI is organized around. Invoices and contracts
  optionally link to a project so the project page can show its full commercial state.
- A **milestone** can trigger an invoice; `milestone.invoice_id` links them so "milestone accepted →
  invoice X sent → paid" is traceable. Useful for fixed-price engagements billed in stages
  (e.g. deposit / midpoint / on-handoff).
- `integration_events.external_id` is **unique** — this is the idempotency guard so a replayed
  webhook is a no-op.

### `updated_at` trigger

```sql
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
-- attach: create trigger t_<table>_updated before update on <table>
--         for each row execute function set_updated_at();
```

### RLS sketch

Enable RLS on every table. Reads require a provisioned, active profile; privileged writes require
role. Example for `invoices`:

```sql
alter table invoices enable row level security;

-- helper: is the caller a provisioned, active staff/owner?
create or replace function is_active_staff() returns boolean
language sql stable as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.active
      and p.role in ('owner','staff')
  );
$$;

create policy invoices_read on invoices
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.active)
  );

create policy invoices_write on invoices
  for all using (is_active_staff()) with check (is_active_staff());
```

`viewer` gets read but not `is_active_staff()`, so it can see invoices but not create or mutate
them. Webhooks bypass RLS via the service-role client, which is correct — they are trusted, signed
system input. Migrations live in `apps/admin/supabase/migrations/` and are applied with the
Supabase CLI (`supabase db push`), so the schema is version-controlled and reproducible.

---

## 6. Stripe — invoicing

**Scope:** create and send invoices; track them to paid. We use Stripe's hosted invoices (Stripe
emails the client a hosted payment page and the PDF), which means we do not handle card data and we
inherit Stripe's dunning and receipts.

### Issue-an-invoice flow

```
Staff clicks "Create invoice" on a project
      │
      ▼
Server Action (role-checked)
  1. Ensure client has a Stripe Customer:
       if clients.stripe_customer_id is null →
         stripe.customers.create({ name, email }) → store id
  2. For each line item:
       stripe.invoiceItems.create({ customer, amount, currency, description })
  3. stripe.invoices.create({ customer, collection_method: 'send_invoice',
                              days_until_due, metadata: { project_id, app_invoice_id } })
  4. stripe.invoices.finalizeInvoice(id)   (or sendInvoice to email immediately)
  5. Insert/So update invoices row: stripe_invoice_id, number, status='open',
       hosted_invoice_url, pdf_url, amount_due, due_at
  6. activity_log: "Invoice #<n> sent to <client> for $<amount>"
```

Every Stripe write passes an **idempotency key** (e.g. `invoice-create:<app_invoice_id>`) so a
double-submit or a retried action does not double-bill.

`metadata.app_invoice_id` on the Stripe object lets the webhook find our row without a lookup table.

### Reconciliation (webhook → DB)

`POST /api/webhooks/stripe` (Node runtime, raw body):

1. Verify signature: `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`.
2. Insert into `integration_events` keyed on `event.id`; if the insert conflicts, it is a replay —
   return 200 and stop.
3. Handle the event:
   - `invoice.paid` → set invoice `status='paid'`, `amount_paid`, `paid_at`; if it settled a
     milestone, mark that milestone `paid`; log activity.
   - `invoice.payment_failed` → log; surface a warning badge on the invoice.
   - `invoice.finalized` / `invoice.sent` / `invoice.voided` → sync `status`, URLs.
   - `invoice.marked_uncollectible` → status update.
4. Return 200 fast. Anything slow (e.g. emailing the founder) is fire-and-forget after the ack.

Webhook handlers are pure status-followers: Stripe is the source of truth, the DB is a cache of it.

### Keys & config

- `STRIPE_SECRET_KEY` — server only.
- `STRIPE_WEBHOOK_SECRET` — signature verification.
- No publishable key needed (no client-side Stripe.js; we never collect card details ourselves).

---

## 7. Zoho Sign — contracts

**Scope:** turn a project's engagement terms into a contract document, send it for signature, and
track it to signed, storing the executed PDF.

**Product choice:** **Zoho Sign** (e-signature). It fits "sending contracts" directly and has a
clean REST API + webhooks. (If the intent is invoicing-in-Zoho-Books or CRM instead, that is a
different integration — see open decisions. Stripe already owns invoicing here.)

### Auth: Zoho OAuth2 (server-to-server)

Zoho uses OAuth2 with a long-lived **refresh token** minted once via a self-client. We store:

- `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_ACCOUNTS_DOMAIN` / `ZOHO_API_DOMAIN` (region-specific: `.com`, `.eu`, etc.)

At call time we exchange the refresh token for a short-lived access token (cache it in memory for
its ~1h TTL) and call the Sign API. No user-interactive OAuth in the app; this is a back-office
service credential.

### Send-a-contract flow

```
Staff clicks "Send contract" on a project
      │
      ▼
Server Action (role-checked)
  1. Get a fresh Zoho access token (refresh-token grant, cached).
  2. Create a signature request from a Zoho Sign template
       (template_key chosen per engagement type; prefilled fields:
        client legal name, scope summary, amount, dates — from the project row).
  3. Add the client contact as recipient/signer; add founder as signer if
       counter-signature is required.
  4. Submit for signature (Zoho emails the signer its hosted signing page).
  5. Insert contracts row: zoho_request_id, status='sent', sent_at, template_key.
  6. activity_log: "Contract '<title>' sent to <contact> at <client>"
```

Templates live in Zoho (so legal copy is edited there, not in code); the app only picks a
`template_key` and supplies merge fields.

### Reconciliation (webhook → DB)

`POST /api/webhooks/zoho`:

1. Verify authenticity — validate the shared-secret / signature Zoho includes on the webhook
   (configured when registering the webhook), plus match `zoho_request_id` to a known contract.
2. Idempotency via `integration_events` on the Zoho event id.
3. On status transitions: `viewed`, `signed`, `declined`, `expired` → update `contracts.status`
   and timestamps.
4. On **signed/completed**: download the executed PDF from Zoho and store it in a **private
   Supabase Storage bucket** (`contracts/`), save the path to `contracts.signed_pdf_path`, set
   `signed_at`, log activity. The app serves it later via a short-lived signed URL — the bucket is
   never public.

> Zoho Sign webhook payloads and available events vary by API version and region. Confirm the exact
> event names and signature-verification scheme against current Zoho Sign REST API docs during
> Phase 3 rather than hard-coding against memory.

---

## 8. Project management UI

Organized around the **project** as the hub.

### Screens

| Route | Purpose |
|---|---|
| `/login` | Google / magic-link sign-in |
| `/` (dashboard) | At-a-glance: projects by status, invoices outstanding (open + overdue), contracts awaiting signature, recent activity |
| `/clients` · `/clients/[id]` | Client list; client detail with contacts, projects, billing (Stripe customer link) |
| `/projects` | Board view grouped by `status` (lead → … → closed); filter by service line |
| `/projects/[id]` | **The workhorse.** Tabs: **Overview** (scope, commercials, dates), **Milestones**, **Invoices**, **Contract**, **Activity** |
| `/invoices` | All invoices with status filters; drill to Stripe hosted page |
| `/contracts` | All contracts with signature status |
| `/settings` | Users & roles (owner only), integration health |

### Project detail — the core interaction

The project page is where the three systems meet. From one screen the founder can:

- see scope, service line, price, and current status;
- define milestones and, for each, **create an invoice** (Stripe) — with the milestone's amount
  prefilled;
- **send the engagement contract** (Zoho Sign) and watch it go `sent → viewed → signed`;
- read the activity trail (contract sent, invoice paid, milestone closed) in one place.

Status badges reflect the *cached* external state, refreshed by webhooks — the UI never blocks on a
live Stripe/Zoho call to render, and a manual "Sync" button per object re-pulls on demand as an
escape hatch if a webhook was missed.

### UI conventions

Reuse the Blueprint palette (`#14324D` navy, `#3E7CB1` accent, `#8C97A6` slate, `#F5F7FA` bg) and
Inter, consistent with the marketing site — but this is a dense internal tool, so favor tables,
compact spacing, and keyboard-friendly forms over marketing-style whitespace. No public SEO
concerns; everything is behind auth and `noindex`.

---

## 9. Directory structure (`apps/admin`)

```
apps/admin/
  app/
    (auth)/login/page.tsx
    (app)/
      layout.tsx                     shell: nav, auth guard boundary
      page.tsx                       dashboard
      clients/page.tsx  clients/[id]/page.tsx
      projects/page.tsx projects/[id]/page.tsx
      invoices/page.tsx
      contracts/page.tsx
      settings/page.tsx
    api/
      webhooks/stripe/route.ts       raw-body, signature-verified
      webhooks/zoho/route.ts
    layout.tsx  globals.css
  lib/
    supabase/server.ts               request-scoped client (RLS)
    supabase/admin.ts                service-role client (server only)
    supabase/middleware.ts           session refresh helper
    stripe/client.ts  stripe/invoices.ts
    zoho/auth.ts       zoho/sign.ts
    auth.ts                          requireRole(), current profile
    activity.ts                      log() helper
    validation.ts                    zod schemas
  actions/
    invoices.ts  contracts.ts  projects.ts  clients.ts   (Server Actions)
  components/                        tables, forms, status badges
  supabase/migrations/*.sql
  middleware.ts
  .env.example
  package.json  tsconfig.json  next.config.ts  postcss.config.mjs
```

Server Actions in `actions/*` are the single write path for the UI; webhook routes are the single
write path for external status; both funnel through `lib/` helpers so Stripe/Zoho/Supabase access
is centralized and testable.

---

## 10. Security

- **Secrets** are Vercel project env vars, server-scoped. Nothing sensitive is `NEXT_PUBLIC_`.
  `lib/supabase/admin.ts` and the Stripe/Zoho clients throw if imported where a public bundle would
  include them.
- **Webhook routes verify signatures** before trusting a byte, and are idempotent via
  `integration_events`. They accept only the specific event types they handle.
- **RLS on by default** on every table; the service-role key is the only bypass and lives only in
  server routes.
- **Role re-checks in code** on every mutation (`requireRole('staff')`), independent of RLS.
- **Audit trail:** every money/contract action writes `activity_log` with the actor.
- **Signed contract PDFs** live in a private bucket, served via expiring signed URLs only.
- **No card data** touches our servers (Stripe hosted invoices).
- **`noindex`** + auth gate on everything; no link to it from public properties.

---

## 11. Environments & configuration

`apps/admin/.env.example`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server only, never public

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Zoho Sign
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
ZOHO_ACCOUNTS_DOMAIN=https://accounts.zoho.com
ZOHO_API_DOMAIN=https://sign.zoho.com

# App
APP_BASE_URL=https://admin.keystone.systems
```

- **Two Supabase projects** (or at least two schemas): one for local/preview, one for production.
  Test-mode Stripe keys and a Zoho sandbox for non-prod so previews cannot touch real money or send
  real contracts.
- **Local dev:** `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for webhook
  testing; Supabase CLI for local Postgres + migrations.
- **Deploy:** separate Vercel project, Root Directory `apps/admin`. Register the production webhook
  URLs in the Stripe and Zoho dashboards after first deploy.

Extend root scripts so `npm run dev -w apps/admin`, `build`, `lint`, `typecheck` all work alongside
the existing `apps/web` ones. Add `apps/admin` to CI (`.github/workflows/ci.yml`) so typecheck /
lint / build run on it too.

---

## 12. Build phases

Each phase is independently shippable and useful.

**Phase 0 — Scaffold & auth**
- Scaffold `apps/admin` (Next 16, Tailwind v4, TS), brand tokens, app shell.
- Supabase project; `profiles` table; Google OAuth + magic link; middleware gate; `requireRole`.
- Seed the founder as `owner`. Deploy behind auth. *Outcome: a locked-down empty app you can log
  into.*

**Phase 1 — Clients & projects (no integrations)**
- Migrations for `clients`, `contacts`, `projects`, `milestones`, `activity_log` + RLS.
- CRUD UI: client list/detail, project board, project detail (Overview, Milestones, Activity tabs).
- *Outcome: usable project tracker, replaces whatever spreadsheet exists today.*

**Phase 2 — Stripe invoicing**
- `invoices`, `invoice_line_items`, `payments` migrations; `integration_events`.
- Create-invoice Server Action (customer lazy-create, line items, finalize/send, idempotency).
- `/api/webhooks/stripe` with signature verify + idempotency; invoice status sync; milestone→paid.
- Invoices tab + `/invoices`. *Outcome: send and track real invoices from the tool.*

**Phase 3 — Zoho Sign contracts**
- `contracts` migration; private Storage bucket.
- Zoho OAuth token service; send-from-template Server Action.
- `/api/webhooks/zoho`: status sync + signed-PDF download to Storage.
- Contract tab + `/contracts`. *Outcome: paper an engagement end-to-end from the tool.*

**Phase 4 — Dashboard, roles, polish**
- Dashboard aggregates (outstanding invoices, contracts pending, project pipeline).
- `viewer` role, user management in `/settings`, integration health panel, per-object manual Sync.
- Overdue-invoice / stalled-contract nudges (email the founder via the existing Resend setup).

---

## 13. Testing & operations

- **Unit:** pure helpers (money formatting, Stripe line-item mapping, Zoho payload building,
  idempotency logic).
- **Integration:** run webhook handlers against recorded Stripe/Zoho fixture payloads; assert DB
  state transitions and idempotency (replay = no-op).
- **RLS tests:** a `viewer` JWT cannot write; an unprovisioned user reads nothing.
- **Manual E2E in test mode:** create client → project → milestone → invoice (Stripe test) →
  `stripe trigger invoice.paid` → verify paid; send contract (Zoho sandbox) → sign → verify PDF
  stored.
- **Observability:** `integration_events` is the source of truth for "did we process this?"; a
  simple `/settings` health view shows last webhook received per provider and any unprocessed
  events. Stripe/Zoho dashboards remain the deep audit trail.

---

## 14. Open decisions (resolve before Phase 1)

1. **Repo boundary.** Keystone-internal in this monorepo (assumed), or the start of the Scaleyard
   back-office and therefore its own repo? Affects naming and where secrets live, not the design.
2. **Zoho product.** Zoho **Sign** (e-signature) is assumed for "contracts." Confirm it is Sign and
   not Zoho Books (invoicing) or CRM — Stripe already owns invoicing in this design.
3. **Invoicing model detail.** Confirm hosted-invoice email from Stripe (assumed) vs. quotes/
   estimates first, and whether milestone-staged billing (deposit/midpoint/handoff) is needed day
   one or Phase 4.
4. **Users at launch.** Just the founder, or bench consultants too on day one? Determines whether
   `viewer`/user-management ships in Phase 1 vs. Phase 4.
5. **Domain & email.** `admin.keystone.systems`? And is Resend (already configured in `apps/web`)
   the channel for internal notifications, or is that out of scope initially?

---

*Ties into existing docs: `docs/company-context.md` (business model, service lines, outcome
pricing), `branding/keystone-systems-brand-guide.md` (palette, type), `docs/build-plan.md`
(marketing-site stack conventions this app mirrors).*
