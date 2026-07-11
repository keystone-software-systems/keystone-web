# Keystone Systems — Internal Admin Tool Design

*Design document for an internal back-office application: invoicing (Stripe), contracts and
e-signature (Zoho Sign), project management, and a tight Notion integration. Data and auth on
Supabase.*

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
- **Notion** — every project gets a linked Notion workspace page (scoping docs, notes, tasks,
  meeting notes, handoff material), auto-provisioned and kept status-stamped by the tool. Notion is
  the day-to-day working surface — the founder's task manager, notes, and AI meeting notes all live
  there — and the admin tool is the commercial spine that orchestrates it and feeds it authoritative
  status. The tool does not rebuild any of Notion's intelligence; it makes Notion AI smarter by
  putting real invoice/contract/milestone truth into the workspace it reasons over.
- **Activity** — an audit trail of what happened and when.

It is deliberately narrow. It is not a CRM, not a time tracker (engagements are priced to the
outcome, not the hour — see `docs/company-context.md`), and not a general accounting system.
Each external system owns its domain and the admin tool owns the links between them:

- **Stripe** — system of record for money.
- **Zoho Sign** — system of record for signatures.
- **Notion** — system of record for project *knowledge and working docs* (scoping, notes, tasks,
  deliverables, handoff). Heavily used; the founder lives here for the actual work.
- **Admin tool (Postgres)** — system of record for the *commercial spine*: clients, project
  lifecycle status, milestones (they gate billing), and the references that tie a project to its
  invoices, its contract, and its Notion page.

### Design principles

- **Boring and durable.** Same values as the brand: understated, correct, low-surface-area. No
  feature we cannot maintain solo.
- **External systems own their domain.** We store *references* (Stripe/Zoho/Notion IDs) and a cached
  status, never a second source of truth for money, signatures, or project docs. Webhooks and
  on-demand syncs reconcile.
- **Fast both ways, but no field written by two systems.** Communication is bidirectional and
  near-real-time — the tool pushes commercial truth into Notion on events, and Notion changes stream
  back within seconds via webhook → cache → Supabase Realtime. The rule that keeps that safe: every
  field has exactly one owner and syncs one direction. Postgres owns commercial fields (and mirrors
  them *into* Notion as display-only); Notion owns working fields (and the tool reads them *out* for
  display). Bidirectional *communication*, never two-way *sync* of a shared field — that is what
  keeps a tight integration from becoming a merge-conflict-and-loop maintenance sink.
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
| Project docs | Notion (official SDK; auto-provisioned project pages, status mirror, read-back) |
| Hosting | Vercel (separate project, Node runtime for integration routes) |

New dependencies (admin app only): `@supabase/supabase-js`, `@supabase/ssr`, `stripe`,
`@notionhq/client` (official, maintained Notion SDK), `zod` (input validation). Zoho is called over
`fetch` (thin, no maintained first-party Node SDK worth pulling in).

> **Next.js version note:** `apps/web/AGENTS.md` warns this Next.js has breaking changes vs. prior
> training data. Before writing app code, read the relevant guides in
> `apps/admin/node_modules/next/dist/docs/` — especially for Route Handlers, middleware, and
> Server Actions, which the auth and webhook layers depend on.

---

## 3. Architecture

```
                       ┌───────────────────────────────────────────────┐
                       │             apps/admin (Next.js)               │
  Browser  ───────────▶│  Server Components  ·  Server Actions          │
  (staff, authed)      │  Route Handlers (/api/*)                       │
                       │  Middleware (session refresh + gate)           │
                       └──────┬──────────┬──────────┬──────────┬────────┘
                              │          │          │          │
                 Supabase     │   Stripe │    Zoho  │   Notion │
              (Postgres/Auth/ │ (secret, │  (OAuth2,│ (SDK,    │
               Storage/RLS)   │ Invoicing)│  Sign)  │ internal │
                              │          │          │ integ.)  │
                              │          │          │          │
                              ▼          ▼          ▼          ▼
             Reconcile status back into Postgres:
             /api/webhooks/stripe  /api/webhooks/zoho   /api/webhooks/notion
             Notion: push on events (out) + webhook (in) → cache → Supabase Realtime → live UI
```

- **Reads** happen in Server Components using a request-scoped Supabase client bound to the signed-in
  user, so **RLS** governs what is visible.
- **Mutations** happen in Server Actions / Route Handlers. Calls to Stripe/Zoho/Notion and any
  privileged DB write use the **service-role** client (RLS-bypassing) and re-check the caller's role
  in code.
- **Webhooks** (Stripe, Zoho) are unauthenticated public routes that verify a provider signature,
  then write with the service-role client. They are the primary way external status enters the DB,
  which keeps reconciliation in one place.
- **Notion** is bidirectional but field-scoped, and both directions are near-real-time: the tool
  *pushes* commercial status onto the linked page on events (invoice paid, contract signed,
  milestone/status change), and a **Notion webhook** (`/api/webhooks/notion`) *pulls* Notion-owned
  fields (working phase, task rollups, action items, meetings) within seconds of an edit into a
  read-back cache, which **Supabase Realtime** streams to the open UI live. No single field flows
  both ways, so fast two-way traffic never conflicts or loops (see §8). A cron pass is a backstop
  for missed webhooks, not the primary path.

### Two Supabase clients

| Client | Key | Used by | RLS |
|---|---|---|---|
| Request client | anon key + user JWT (via `@supabase/ssr` cookies) | Server Components, user-scoped reads | enforced |
| Admin client | service role key | Route Handlers, webhooks, integration writes | bypassed |

The service-role key is server-only (never in a `NEXT_PUBLIC_` var, never imported into a Client
Component).

### Backend hosting (decided)

**Supabase for everything stateful; one Next.js app on Vercel for the app runtime.** No third
platform and no containers.

- **Supabase** owns the backbone: Postgres (all data), Auth (login/sessions/roles), Storage (signed
  contract PDFs), and RLS (the real security boundary).
- **Vercel** hosts the single Next.js app, which serves the UI *and* runs the server-side glue —
  the Server Actions that call Stripe/Zoho and the two webhook routes that receive their callbacks.
  This is the same two-vendor shape as `apps/web` today, plus Supabase as the data layer.

Rationale: one codebase, one language, shared types end to end, and type-safe UI→server calls with
no network boilerplate — the least to build and maintain solo, matching the small-surface-area
principle. The workloads are short request/response (CRUD + a few outbound API calls + inbound
webhooks), a textbook serverless fit; a long-running container would be provisioning for a problem
this app does not have.

**Graduation paths (not needed now, no rewrite to adopt later):**
- *Supabase Edge Functions* — the natural first candidate is peeling just the Stripe/Zoho **webhook
  receivers** out of Next.js so they sit next to Postgres and are decoupled from the frontend
  deploy. On Deno this needs Stripe's fetch HTTP client and the async webhook verifier
  (`constructEventAsync`); Zoho is plain `fetch` and unchanged. Consider only if webhook decoupling
  becomes a real need.
- *Containerized worker* (Fly / Railway / Render / Cloud Run) — add **alongside** the app only when
  a concrete feature needs a long-running process: background PDF pipeline, nightly reconciliation
  batch, job queue, or websockets. Do not move the whole app into a container.
- *Supabase-only backend* — if minimizing vendors ever outranks build ergonomics, the frontend can
  go client-rendered (static export / SPA) talking to `supabase-js` directly for RLS-guarded reads
  and to Edge Functions for privileged integration calls, dropping Vercel from the backend. Noted
  as an alternative, not the plan.

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
                     address_json · notion_page_id · notion_url · notes · created_by
contacts           id · client_id → clients · name · email · title · phone · is_primary
projects           id · client_id → clients · name · service_line · status ·
                     pricing_type · amount_total · currency · summary ·
                     start_date · target_end_date ·
                     notion_page_id · notion_url · notion_synced_at · created_by
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
notion_project_state project_id → projects (pk) · working_phase · next_action ·
                     open_tasks · done_tasks · open_action_items ·
                     recent_meetings_json · notion_state_synced_at
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
- A **project** maps 1:1 to a **Notion page** (`notion_page_id`), auto-created on project creation.
  `notion_url` is the deep link shown in the UI; `notion_synced_at` records the last successful
  push so the UI can flag drift. `clients.notion_page_id` is optional — link a client-level Notion
  wiki page if one is used. These are the *only* Notion identifiers we persist; Notion's own content
  is never copied into Postgres.
- `notion_project_state` is a **read-back cache** (one row per project) of Notion-owned display
  fields, kept fresh by the Notion webhook. The UI reads it from Postgres for instant renders, and
  the project page / dashboard subscribe to it via **Supabase Realtime** so Notion edits appear live.
  It is a cache, never a source of truth — safe to rebuild from Notion at any time.
- `integration_events.external_id` is **unique** — this is the idempotency guard so a replayed
  webhook (Stripe, Zoho, or a Notion subscription event if adopted) is a no-op.

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

## 8. Notion — project workspace integration

Notion will be heavily used, so it is a first-class integration, not a link field. Notion is the
founder's **task manager, notes, and meeting record** — used heavily with **Notion AI and AI
meeting notes**, which generate summaries and action items directly inside the workspace. The admin
tool provisions each project's Notion page, keeps it stamped with authoritative commercial status,
and reads a few Notion-owned signals back for a unified glance. The discipline that makes this
"tight" rather than fragile is the ownership split below. The concrete workspace design — every
database, property, ownership tag, value mapping, and the webhook routing table — lives in
`docs/admin-tool-notion-workspace.md`, which becomes `lib/notion/schema.ts` at build time.

**Boundary: the tool feeds Notion AI, it does not compete with it.** All intelligence — summarizing
meetings, drafting action items, answering questions across the workspace — stays in Notion AI. The
admin tool contributes the one thing Notion does not have on its own: authoritative commercial truth
(is this invoice paid, is the contract signed, which milestone is live). Pushing that onto the
linked pages means Notion AI answers questions like "which active projects have an unpaid invoice"
grounded in real state, without the tool building any AI of its own.

### Ownership split (the golden rule)

| Field / concern | Owner | Sync direction |
|---|---|---|
| Client, project lifecycle status, milestones, amounts, invoice/contract status | **Postgres** | push → Notion (display-only mirror) |
| Scoping docs, meeting notes (incl. AI meeting notes), research, deliverable drafts, handoff docs | **Notion** | not synced — lives only in Notion |
| Granular tasks / kanban, action items, "working phase", "next action" | **Notion** | pull → tool (read-only display) |
| The link itself (`notion_page_id`) | **Postgres** | set once on creation |

No field is written by both systems. A mirrored property edited by hand in Notion is cosmetic and
is overwritten on the next push; a commercial value is never authored in Notion.

> **Decided:** Notion is the founder's task manager, notes, and meeting record, so **all task/kanban
> PM and note-taking stay in Notion**. The admin tool owns project *records, lifecycle status, and
> milestones* (because milestones gate billing) and never duplicates task management. The tool's
> `/projects` board tracks the commercial lifecycle (lead → closed); day-to-day execution, tasks,
> and AI meeting notes live in the linked Notion page.

### Auth & config

Single Notion workspace, so a **Notion internal integration** (not OAuth): one secret token, with
the relevant databases/pages explicitly shared to the integration in Notion's UI.

- `NOTION_TOKEN` — internal integration secret, server only.
- `NOTION_PROJECTS_DB_ID` — parent database new project pages are created under.
- `NOTION_CLIENTS_DB_ID` — optional, if client wiki pages are used.

Property names/IDs on those databases are kept in one `lib/notion/schema.ts` map so a Notion schema
change is a one-file edit, not a hunt.

### Flow 1 — auto-provision a project page (Postgres → Notion)

```
Project created in the admin tool
      │
      ▼
Server Action (role-checked), best-effort after the DB row commits
  1. notion.pages.create under NOTION_PROJECTS_DB_ID with:
       - properties: Name, Client (relation or text), Service line,
         Status (mirror of project.status), Amount, Admin link (URL back to /projects/[id])
       - children: a code-defined block skeleton — a "managed by admin" callout +
         Scope · Notes · Deliverables · Handoff  (the "template"; Tasks and
         Meetings live in their own related databases, per the workspace design)
  2. Store page id + url → projects.notion_page_id, notion_url; set notion_synced_at
  3. activity_log: "Notion workspace created for <project>"
```

The template is a **block skeleton defined in code**, not a duplicated Notion template page — the
Notion API has no first-class "duplicate this template" call, and a code skeleton is versioned with
the app. One click in the tool yields a ready project workspace.

### Flow 2 — push authoritative status (Postgres → Notion)

On events that change commercial state — project status change, milestone completed, invoice paid,
contract signed — update the mirrored **Status** property on the linked page and append a dated
entry to its **Log** section. Triggered from the same Server Actions / webhook handlers that already
process those events (e.g. the Stripe `invoice.paid` handler also pushes "Invoice paid" to Notion).

- **Property sets are naturally idempotent** (setting Status='active' twice is a no-op), so status
  mirroring needs no dedupe.
- **Log appends are guarded** against webhook retries: each timeline event carries a stable key
  (e.g. `invoice:<id>:paid`) recorded in `activity_log`; we append to Notion only if that key has
  not already been pushed.
- **Best-effort, non-blocking.** A Notion failure never blocks a payment or a signature. On failure
  we leave `notion_synced_at` stale and surface a "Notion out of sync — Resync" affordance on the
  project page; a manual/cron resync is idempotent.

### Flow 3 — read Notion-owned signals back, near-real-time (Notion → tool)

The tool surfaces a small set of Notion-owned fields next to the commercial context: a "Working
phase" property, a "Next action" text, task rollup counts (open / done), open **action items**
(which AI meeting notes generate), and a link list of **recent meeting notes** for the project.
These stay **read-only in the tool and are never written back** — Notion remains their home and
Notion AI remains what produces them. What changes for *fast bidirectional* is how quickly and by
what mechanism they land.

**Webhook-driven, not poll-driven (the fast path).**

```
Founder (or Notion AI meeting notes) edits the project page / a task / an action item
      │
      ▼
Notion change subscription fires → POST /api/webhooks/notion
  1. Verify Notion's signature; dedupe via integration_events on the event id
  2. Map the changed entity → the owning project (via notion_page_id / relation)
  3. Pull only the changed Notion-owned fields for that entity (1–2 API calls)
  4. Upsert them into the notion_project_state cache table; set notion_state_synced_at
      │
      ▼
Supabase Realtime broadcasts the cache row change → the open project page updates live
```

- **Fast reads:** the UI reads Notion-owned fields from the `notion_project_state` cache in Postgres,
  so pages render instantly with no live Notion call. The webhook keeps that cache fresh within
  seconds of a Notion edit.
- **Live UI:** the project page and dashboard subscribe to the cache table via **Supabase Realtime**,
  so a change made in Notion appears without a manual refresh. Combined with the immediate Flow-2
  push the other way, both directions feel live.
- **Cron is a backstop, not the path:** `/api/cron/notion-sync` runs infrequently only to reconcile
  anything a missed/failed webhook left stale (self-healing), plus a manual "Refresh from Notion"
  button per project.

If a **Meetings** database exists with a relation to projects/clients, the webhook maps meeting/task
events to the project through that relation; if meeting notes are sub-pages under the project page,
it maps by parent. `lib/notion/schema.ts` records whichever structure is in use.

### Why fast two-way traffic stays safe (no loops, no conflicts)

The single-owner-per-field rule is what makes bidirectional communication safe to run fast:

- **Disjoint field sets → no merge conflicts.** The tool only ever *writes* its own fields to Notion
  (Flow 2) and only ever *reads* Notion-owned fields back (Flow 3). No property is authored by both.
- **No echo loop by construction.** An inbound Notion webhook only updates the read-back cache; it
  never triggers a push back to Notion. A tool-side push only writes tool-owned mirror fields; it
  never reacts to its own resulting webhook. The cycle cannot close.
- **Belt-and-suspenders loop guard.** Webhook events whose actor is our own integration are ignored,
  and we compare incoming values against the cache before writing, so a redundant event is a no-op.
- **Mirror fields are authority-wins.** If someone hand-edits a tool-owned mirror property in Notion
  (e.g. flips Status), the tool does not adopt it; the next push re-asserts the authoritative value.
  Notion-owned fields always win for Notion-owned fields; tool-owned fields always win for theirs.
- **Debounce.** Rapid successive edits to one page are coalesced within a short window before the
  pull, keeping us well under Notion's ~3 req/s limit and avoiding thrash.

> Notion change subscriptions are a newer capability with a one-time verification handshake and a
> signed delivery scheme; confirm the current event catalog and signature method against the Notion
> API docs during Phase 2 rather than hard-coding from memory. If a needed event type is not yet
> offered, the cron backstop covers that field until it is — correctness never depends on the
> webhook alone.

### Operational notes

- **Rate limits:** the Notion API averages ~3 requests/second. Webhook-triggered pulls are bounded by
  human editing rate and debounced; event pushes are trivial volume. Any backfill (provisioning pages
  for pre-existing projects) must throttle and paginate with the API's cursor.
- **Reconciliation:** `notion_synced_at` (push freshness) and `notion_state_synced_at` (read-back
  freshness) plus the `/settings` integration-health panel show whether a project is current;
  "Resync" re-pushes status and re-pulls read-back fields.
- **Backfill:** a one-off script provisions Notion pages for projects that predate the integration,
  linking existing Notion pages by id where the founder already made one (paste the URL to link
  instead of create).

---

## 9. Project management UI

Organized around the **project** as the hub.

### Screens

| Route | Purpose |
|---|---|
| `/login` | Google / magic-link sign-in |
| `/` (dashboard) | At-a-glance: projects by status, invoices outstanding (open + overdue), contracts awaiting signature, recent activity |
| `/clients` · `/clients/[id]` | Client list; client detail with contacts, projects, billing (Stripe customer link) |
| `/projects` | Board view grouped by `status` (lead → … → closed); filter by service line |
| `/projects/[id]` | **The workhorse.** Tabs: **Overview** (scope, commercials, dates, Notion panel), **Milestones**, **Invoices**, **Contract**, **Activity** |
| `/invoices` | All invoices with status filters; drill to Stripe hosted page |
| `/contracts` | All contracts with signature status |
| `/settings` | Users & roles (owner only), integration health (Stripe / Zoho / Notion) |

### Project detail — the core interaction

The project page is where the four systems meet. From one screen the founder can:

- see scope, service line, price, and current status;
- define milestones and, for each, **create an invoice** (Stripe) — with the milestone's amount
  prefilled;
- **send the engagement contract** (Zoho Sign) and watch it go `sent → viewed → signed`;
- **open the linked Notion workspace** (deep link + an embedded panel showing the Notion-owned
  working phase, next action, task rollup, open action items, and recent meeting notes), or
  provision/link one if it does not exist yet;
- read the activity trail (contract sent, invoice paid, milestone closed) in one place.

Status badges reflect the *cached* external state, refreshed by webhooks (Stripe/Zoho) or the last
Notion sync — the UI never blocks on a live external call to render. A per-object "Sync" button
re-pulls on demand; the project header shows a "Notion out of sync" flag when `notion_synced_at`
lags a commercial change.

### UI conventions

Reuse the Blueprint palette (`#14324D` navy, `#3E7CB1` accent, `#8C97A6` slate, `#F5F7FA` bg) and
Inter, consistent with the marketing site — but this is a dense internal tool, so favor tables,
compact spacing, and keyboard-friendly forms over marketing-style whitespace. No public SEO
concerns; everything is behind auth and `noindex`.

---

## 10. Directory structure (`apps/admin`)

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
      webhooks/notion/route.ts       Notion change subscriptions (near-real-time read-back)
      cron/notion-sync/route.ts      reconciliation backstop for missed webhooks
    layout.tsx  globals.css
  lib/
    supabase/server.ts               request-scoped client (RLS)
    supabase/admin.ts                service-role client (server only)
    supabase/middleware.ts           session refresh helper
    stripe/client.ts  stripe/invoices.ts
    zoho/auth.ts       zoho/sign.ts
    notion/client.ts   notion/projects.ts   notion/schema.ts
    auth.ts                          requireRole(), current profile
    activity.ts                      log() helper
    validation.ts                    zod schemas
  actions/
    invoices.ts  contracts.ts  projects.ts  clients.ts  notion.ts   (Server Actions)
  components/                        tables, forms, status badges
  supabase/migrations/*.sql
  middleware.ts
  .env.example
  package.json  tsconfig.json  next.config.ts  postcss.config.mjs
```

Server Actions in `actions/*` are the single write path for the UI; webhook routes are the single
write path for external status; both funnel through `lib/` helpers so Stripe/Zoho/Notion/Supabase
access is centralized and testable.

---

## 11. Security

- **Secrets** are Vercel project env vars, server-scoped. Nothing sensitive is `NEXT_PUBLIC_`.
  `lib/supabase/admin.ts` and the Stripe/Zoho/Notion clients throw if imported where a public bundle
  would include them. The `NOTION_TOKEN` is scoped in Notion to only the databases/pages shared with
  the integration, so its blast radius is bounded even if leaked.
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

## 12. Environments & configuration

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

# Notion  (workspace/database design: docs/admin-tool-notion-workspace.md)
NOTION_TOKEN=                       # internal integration secret, server only
NOTION_PROJECTS_DB_ID=
NOTION_TASKS_DB_ID=
NOTION_MEETINGS_DB_ID=
NOTION_CLIENTS_DB_ID=               # optional
NOTION_WEBHOOK_SECRET=              # verifies inbound Notion change subscriptions

# App
APP_BASE_URL=https://admin.keystone.systems
```

- **Two Supabase projects** (or at least two schemas): one for local/preview, one for production.
  Test-mode Stripe keys and a Zoho sandbox for non-prod so previews cannot touch real money or send
  real contracts. For Notion, point non-prod at a **separate throwaway Notion workspace** (or a
  clearly-marked "Sandbox" database) so preview deploys never write into the real project workspace.
- **Local dev:** `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for webhook
  testing; Supabase CLI for local Postgres + migrations.
- **Deploy:** separate Vercel project, Root Directory `apps/admin`. Register the production webhook
  URLs in the Stripe and Zoho dashboards after first deploy; share the production Notion databases
  with the integration and (if adopted) register the Notion subscription endpoint.

Extend root scripts so `npm run dev -w apps/admin`, `build`, `lint`, `typecheck` all work alongside
the existing `apps/web` ones. Add `apps/admin` to CI (`.github/workflows/ci.yml`) so typecheck /
lint / build run on it too.

---

## 13. Build phases

Each phase is independently shippable and useful. Notion lands early (Phase 2) because it will be
heavily used — the project workspace is valuable the moment projects exist, before invoicing.

**Phase 0 — Scaffold & auth**
- Scaffold `apps/admin` (Next 16, Tailwind v4, TS), brand tokens, app shell.
- Supabase project; `profiles` table; Google OAuth + magic link; middleware gate; `requireRole`.
- Seed the founder as `owner`. Deploy behind auth. *Outcome: a locked-down empty app you can log
  into.*

**Phase 1 — Clients & projects (no integrations)**
- Migrations for `clients`, `contacts`, `projects`, `milestones`, `activity_log` + RLS.
- CRUD UI: client list/detail, project board, project detail (Overview, Milestones, Activity tabs).
- *Outcome: usable project tracker, replaces whatever spreadsheet exists today.*

**Phase 2 — Notion project workspaces (fast bidirectional)**
- `notion_page_id` / `notion_url` / `notion_synced_at` columns + `notion_project_state` cache;
  `lib/notion/*` + `NOTION_TOKEN`.
- Auto-provision a Notion page on project creation (code-defined block skeleton); link-existing flow.
- Push project status/milestone changes onto the Notion page (out).
- `/api/webhooks/notion` change subscriptions (in) → cache refresh; **Supabase Realtime** so the
  project page and dashboard update live; loop/debounce guards; `/api/cron/notion-sync` backstop.
- Read-back panel (phase, next action, task rollup, action items, recent meeting notes) + manual
  Refresh; backfill script for existing projects.
- *Outcome: every project has a linked, status-stamped Notion workspace that updates both ways within
  seconds — the daily working surface, live inside the tool.*

**Phase 3 — Stripe invoicing**
- `invoices`, `invoice_line_items`, `payments` migrations; `integration_events`.
- Create-invoice Server Action (customer lazy-create, line items, finalize/send, idempotency).
- `/api/webhooks/stripe` with signature verify + idempotency; invoice status sync; milestone→paid.
- On `invoice.paid`, also push "Invoice paid" to the linked Notion page.
- Invoices tab + `/invoices`. *Outcome: send and track real invoices from the tool.*

**Phase 4 — Zoho Sign contracts**
- `contracts` migration; private Storage bucket.
- Zoho OAuth token service; send-from-template Server Action.
- `/api/webhooks/zoho`: status sync + signed-PDF download to Storage; push "Contract signed" to Notion.
- Contract tab + `/contracts`. *Outcome: paper an engagement end-to-end from the tool.*

**Phase 5 — Dashboard, roles, polish**
- Dashboard aggregates (outstanding invoices, contracts pending, project pipeline, Notion rollups).
- `viewer` role, user management in `/settings`, integration health panel (Stripe/Zoho/Notion,
  showing last webhook and last Notion sync), per-object manual Sync.
- Overdue-invoice / stalled-contract nudges (email the founder via the existing Resend setup).

---

## 14. Testing & operations

- **Unit:** pure helpers (money formatting, Stripe line-item mapping, Zoho payload building, Notion
  block-skeleton + property mapping, log-append dedupe keys, idempotency logic).
- **Integration:** run webhook handlers against recorded Stripe/Zoho fixture payloads; assert DB
  state transitions and idempotency (replay = no-op). For Notion, test against the sandbox workspace
  and assert push idempotency (status set twice = one state; log append twice = one entry).
- **RLS tests:** a `viewer` JWT cannot write; an unprovisioned user reads nothing.
- **Manual E2E in test mode:** create client → project → verify Notion page provisioned and linked →
  milestone → invoice (Stripe test) → `stripe trigger invoice.paid` → verify paid *and* Notion log
  updated; send contract (Zoho sandbox) → sign → verify PDF stored and Notion stamped.
- **Observability:** `integration_events` is the source of truth for "did we process this?";
  `notion_synced_at` flags Notion drift. A simple `/settings` health view shows last webhook per
  provider, last Notion sync, and any unprocessed events. Stripe/Zoho dashboards remain the deep
  audit trail; Notion page history covers its own edits.

---

## 15. Open decisions (resolve before Phase 1)

1. **Repo boundary.** Keystone-internal in this monorepo (assumed), or the start of the Scaleyard
   back-office and therefore its own repo? Affects naming and where secrets live, not the design.
2. **Zoho product.** Zoho **Sign** (e-signature) is assumed for "contracts." Confirm it is Sign and
   not Zoho Books (invoicing) or CRM — Stripe already owns invoicing in this design.
3. **Notion as the PM surface.** *Resolved:* Notion is the task manager, notes, and meeting record;
   all task/kanban PM and note-taking stay in Notion, and the tool never duplicates them.
4. **Notion structure.** *Designed greenfield* in `docs/admin-tool-notion-workspace.md` (Projects ·
   Tasks · Meetings · optional Clients, with ownership tags and webhook routing). Remaining calls are
   listed there: whether to use the Clients DB, the Working-phase vocabulary, and manual-vs-inferred
   meeting→project linking.
5. **Invoicing model detail.** Confirm hosted-invoice email from Stripe (assumed) vs. quotes/
   estimates first, and whether milestone-staged billing (deposit/midpoint/handoff) is needed day
   one or later.
6. **Users at launch.** Just the founder, or bench consultants too on day one? Determines whether
   `viewer`/user-management ships in Phase 1 vs. Phase 5.
7. **Domain & email.** `admin.keystone.systems`? And is Resend (already configured in `apps/web`)
   the channel for internal notifications, or is that out of scope initially?

---

*Ties into existing docs: `docs/company-context.md` (business model, service lines, outcome
pricing), `branding/keystone-systems-brand-guide.md` (palette, type), `docs/build-plan.md`
(marketing-site stack conventions this app mirrors). Companion: `docs/admin-tool-notion-workspace.md`
(the concrete Notion database/property schema this integration provisions and syncs).*
