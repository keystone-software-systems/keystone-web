# Keystone Systems — Project Intake & Engineer Network Portal (Design)

*Design document for a self-serve portal where prospective clients submit project briefs and
track them, and where a network of independent engineers can pick up sourced work and get paid.
Data and auth on Supabase, payments on Stripe (direct + Connect).*

Status: **proposed**. This is a design, not a commitment. It builds directly on
`docs/admin-tool-design.md` (the internal back-office app) and reuses its architecture rather than
inventing a new one. Read that doc first — this one assumes its data model, auth pattern, and
Stripe integration as a starting point. Open decisions, including one strategic one, are at the
end; resolve those before Phase 0.

---

## 0. Read this first — a scoped positioning decision, not a rebrand

`docs/company-context.md` sells Keystone as **a specific, named person's judgment**, with bench
depth ("a small network of equally experienced independent engineers") stated only in the vaguest
possible terms on the public site. This portal does not change that firm-level positioning.

**Resolved direction (2026-07):** the operating model stays founder-led — the founder still scopes
every engagement personally and decides who, if anyone, gets looped in. What changes is narrower
than "Keystone is now a marketplace": once a client submits a project through the portal and the
founder assigns a specific network engineer to it, **that client** can see who's actually working on
their project (name, background, relevant skills) inside their own authenticated portal dashboard.
That's disclosure to a client who already has a live engagement, not a public marketing claim. The
network itself is real — senior independent engineers, some moonlighting alongside a full-time
role, some doing this full-time — and is what makes lower-ticket or short-turnaround work viable
without the founder personally becoming the bottleneck, but the network is the fulfillment
mechanism behind a founder-led engagement, not the headline pitch.

**Scope, made explicit:**

- `apps/web` (the public marketing site) is **unchanged** by this — it keeps the current generic
  bench-depth framing, no numbers, no names, founder-led judgment stays the headline. This doc does
  not open that back up.
- `apps/portal` is where bench depth becomes concrete, and only **per-client, per-project, post-match**
  — a client sees the engineer assigned to *their* project, not a public roster or team page.
- Wherever an engineer's background is shown (portal dashboard or otherwise), it's stated plainly
  with specifics — prior companies where shareable, years of experience — never a superlative like
  "world-class." Same treatment as the founder's own Stripe/Microsoft line in `company-context.md`:
  say the specific thing once, let it carry the weight, no adjective doing the work.

This resolution is reflected in `docs/company-context.md` (§"Bench depth and post-handoff
support") and `docs/todo.md` directly — read those for the authoritative statement of the firm-level
decision; this section exists to explain how the portal's design (§4/§5 below) implements it.

---

## 1. What this is

Two connected surfaces, both feeding the same commercial spine already designed in
`docs/admin-tool-design.md`:

- **Client intake** — a fast, low-friction way for a prospective client to describe a project,
  optionally without an account at first, and get a submission into Keystone's pipeline instead of
  a cold email. Once submitted, the client gets a lightweight account to track status and receive
  synchronous feedback/questions from the founder — a comment thread on their submission, not a
  support ticket queue.
- **Engineer network** — profiles for the senior independent engineers in Keystone's network, mixed
  availability (some moonlighting alongside a full-time role, some doing this full-time), so that
  when the founder wants to route a sourced project to someone, that person already has a Keystone
  profile, a way to see what's been offered to them, and a way to get paid without a manual
  invoice-and-Venmo process.

Both surfaces are **new front doors onto the same underlying `projects`/`clients` data** that
`apps/admin` already owns — this is additive to that design, not a parallel system. A submission
becomes a `projects` row at `status = 'lead'` (or a new pre-lead `submitted` status, see §4); an
engineer being looped in becomes a new `project_assignments` row; everything the founder already
does in `apps/admin` (scope it, contract it, invoice it) continues to work unchanged.

The portal is meant to cover the **full range of engagement shapes**, not just one-off projects:
a small short-turnaround fix, a longer project, or an ongoing retainer, all submitted and tracked
the same way (see §4/§5 for how that's captured at intake).

**What this is not:** a public job board or an open-bid marketplace where engineers browse and
claim unclaimed work. Per §0, the network is visible to clients (they can see who's working on
their project), but on the engineer side, "available work" is still curated by the founder —
offered to a specific engineer based on fit, not a self-serve claim queue open to the whole
network. That distinction (visible network, curated matching) is what keeps this from reading as a
generic marketplace.

---

## 2. Where it lives

```
apps/
  web/       existing public marketing site (unchanged)
  admin/     internal back-office app (docs/admin-tool-design.md)
  portal/    new — client + engineer self-serve app  ← this document
```

A third Next.js app, its own Vercel project (Root Directory `apps/portal`), host
`portal.keystone.systems` (resolved 2026-07, §11 decision 0 — a subdomain, not the apex; the apex
stays reserved for `apps/web` marketing so `keystone.systems` never conditionally resolves to a
login-gated app, and not folded into `apps/web` either, to keep the static-marketing-vs-dynamic-
authenticated-app split clean). Reasons to keep it a separate app rather than folding into
`apps/admin`:

- **Different trust boundary.** `apps/admin` is invite-only, staff/owner only, `noindex`, never
  linked publicly. `apps/portal` has public self-serve signup and is linked from the marketing
  site. Mixing self-serve auth into the internal app's middleware/RLS surface is exactly the kind
  of blast-radius mistake the admin doc's security section (§11 there) is designed to avoid.
- **Different UI register.** The admin app is a dense internal tool; the portal needs to read like
  an extension of the marketing site (`apps/web`'s Blueprint palette, calmer pacing) since it's the
  first authenticated experience a prospective client has with the firm.

**Shared, not duplicated:** `apps/portal` talks to the **same Supabase project** as `apps/admin`
(same `clients`/`projects`/`activity_log` tables), so a submission through the portal shows up in
the founder's existing pipeline immediately, with no sync step. It is a second frontend on the same
backend, not a second backend.

### Stack (same as `apps/admin`)

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind v4, Blueprint palette (softened toward `apps/web`'s marketing tone) |
| Data + Auth | Supabase (same project as `apps/admin`) |
| Payments (client → Keystone) | Stripe, reuses the invoicing design from `admin-tool-design.md` §6 |
| Payments (Keystone → engineer) | Stripe Connect (new — see §6) |
| Secrets | Supabase Vault (new — see §7) |
| Hosting | Vercel, separate project, Node runtime |

---

## 3. Authentication & authorization

Reuses Supabase Auth from the same project as `apps/admin`, but with a **different signup path**
and **two new roles** on `profiles`:

| Role | Can | Signup |
|---|---|---|
| `owner` / `staff` / `viewer` | (unchanged, from admin doc) | invite-only, no change |
| `client` | Submit projects, view/comment on their own submissions & projects, view their own invoices | self-serve (email/password or magic link) |
| `engineer` | View projects assigned/offered to them, accept/decline, submit invoices against milestones, manage payout account | invite-only (founder adds them after an off-platform conversation — no public "apply to join the network" page in v1; the network is *visible* to clients per §0, but still *curated* on intake, see §1) |

**Enforcement, same three layers as the admin doc:**

1. Middleware gates by role: a `client` hitting an `/admin`-shaped route or another client's
   project is redirected/denied before render.
2. RLS is the real boundary: a `client` can `select` only `projects` where
   `projects.client_id`'s owning `clients` row is linked to their `auth.uid()` (new
   `client_users` join table, see §4); an `engineer` can `select` only `project_assignments` rows
   that name them.
3. Server Actions re-check role before any write, independent of RLS.

**Why not merge `client`/`engineer` into the existing `profiles.role` enum values instead of adding
two new ones:** `owner`/`staff`/`viewer` describe *internal* trust levels over the whole dataset;
`client`/`engineer` describe *external* parties scoped to their own rows only. Keeping them as
distinct enum values (not a new table) keeps one `profiles` table and one auth system, but the RLS
policies for external roles are row-scoped in a way internal roles never are — worth naming
separately so a future policy author can't accidentally write a `client` policy as broad as a
`viewer` policy.

---

## 4. Data model additions

Extends the schema in `admin-tool-design.md` §5. New/changed tables only:

```
client_users        id · client_id → clients · user_id → profiles · created_at
                     -- links a self-serve auth user to a clients row; a client
                     -- row can have multiple users (e.g. two people at the same company)

engineer_profiles    id · user_id → profiles (unique) · display_name · bio ·
                     background_note · years_experience (nullable) ·
                     skills text[] · availability · stripe_connect_account_id ·
                     connect_status · hourly_rate_cents (nullable) · active ·
                     created_at
                     -- one per engineer; connect_status mirrors Stripe
                     -- ('not_started' | 'onboarding' | 'active' | 'restricted')
                     -- availability: 'full_time' | 'moonlighting' | 'flexible'
                     -- background_note: plain-stated credential/prior-company
                     -- line, same treatment as the founder's Stripe/Microsoft
                     -- line in company-context.md — specifics, not adjectives.
                     -- This is what's shown to a client on "who's working on
                     -- this" (§5), so it needs to earn its claim, not assert it.

project_assignments  id · project_id → projects · engineer_id → engineer_profiles ·
                     status · offered_at · responded_at · role_note
                     -- status: 'offered' | 'accepted' | 'declined' | 'completed'
                     -- role_note: free text, e.g. "lead" or "pairing with founder"

submission_comments  id · project_id → projects · author_id → profiles ·
                     visible_to_client boolean default true · body · created_at
                     -- the synchronous-feedback thread; staff can also leave
                     -- internal-only notes (visible_to_client = false)

engineer_payouts     id · project_id → projects · engineer_id → engineer_profiles ·
                     milestone_id → milestones (nullable) ·
                     stripe_transfer_id · amount_cents · currency ·
                     status · created_at
                     -- one row per Stripe Connect transfer out to an engineer
```

**`projects` gains an `engagement_type` field:** `short_term_project` | `long_term_project` |
`retainer` — captured as a client-facing choice at intake (§5), distinct from the existing
`pricing_type` (`fixed` | `retainer`), which is the internal billing categorization decided during
scoping. The two usually line up (`retainer` engagement type → `retainer` pricing type; the two
project types → `fixed`), but keeping them separate means the client's stated intent at submission
time survives even if scoping changes the billing shape.

**`projects.status` gains a pre-lead state:** `submitted` → `lead` → … (existing states from the
admin doc unchanged after `lead`). A portal submission lands as `submitted`; the founder promotes
it to `lead` once reviewed. This keeps "someone filled out a form" distinct from "the founder has
actually looked at this and it's a real prospect" in the pipeline the founder already uses daily.

RLS additions follow the same pattern as `admin-tool-design.md` §5 — helper functions
`is_project_client(project_id)` and `is_project_engineer(project_id)` analogous to the existing
`is_active_staff()`, used in `for select using (...)` policies on `projects`, `submission_comments`,
and `project_assignments`.

**How "find `clients` row by email" actually resolves (§5 depends on this):** `clients` has no
direct email column — matching goes through `contacts.email`. On submit, look up a `contacts` row
by case-insensitive email match; if found, reuse its `client_id`; if not, create a new `clients` row
(`name` left null — the founder names it on promotion to `lead`, per the existing comment on
`projects.name`) plus a `contacts` row (`email`, `is_primary = true`) for it. Add
`create index idx_contacts_email_lower on contacts (lower(email))` to keep that lookup cheap. No
new column, no new table — this reuses schema that already exists.

**Account claiming is automatic, not a manual step.** `client_users` links get created by
email-match, not by the client clicking anything labeled "claim": every time someone completes auth
provisioning (self-serve password signup, or verifying a magic link at `/auth/confirm`) with a given
email, that provisioning step looks up every `contacts` row matching that email, resolves the
`client_id`(s), and upserts a `client_users` row for each (`on conflict (client_id, user_id) do
nothing` — idempotent, safe to run on every login, not just the first). This runs on *every*
provisioning touchpoint, not only account creation, specifically so a second anonymous submission
made after someone already has an account still shows up the next time they authenticate, without
them doing anything differently. This is what makes "no account to submit, easy account after"
actually true: the account, once it exists under a matching email, always ends up wired to
everything that email ever submitted — nothing to remember to link.

---

## 5. Client intake flow

```
Prospective client → portal.keystone.systems/submit
      │
      ▼
Brief form (no login required to start):
  - project description (free text, this is the core field)
  - engagement type: short-term project / long-term project / ongoing retainer
    (sets `projects.engagement_type`, helps route to an engineer with the
    right availability — a moonlighter is a fine fit for a short fix, a
    retainer needs someone with steady bandwidth)
  - rough budget band / timeline (optional, unlocks better routing)
  - contact email
      │
      ▼
Submit → finds or creates a `clients` row (matched by contact email, see §4)
        + `projects` row (status='submitted')
        + sends a magic link (account creation is optional, not required — the
          submission is already saved either way; clicking the link is how they
          later check on it, and auto-attaches every past submission under that
          email, see §4)
      │
      ▼
Client's dashboard (/dashboard, after auth):
  - status of their submission(s)
  - comment thread (submission_comments) — founder can ask a clarifying
    question, client replies, all synchronous, no email back-and-forth
  - once an engineer is assigned: a "who's working on this" panel showing the
    assigned engineer's `engineer_profiles` (name, background_note, skills) —
    this is the visible-network piece from §0; the client isn't left guessing
    who's actually doing the work
  - once scoped: contract status (mirrors Zoho state from apps/admin, read-only)
    and invoice status (mirrors Stripe state, read-only, "Pay" link to Stripe's
    hosted page)
```

Design choice: **capture the brief before asking for an account, and never make claiming it a
separate action.** The single biggest lever for "fast and easy," per the stated goal, is not making
someone create a password before they've told you what they need. The submission itself never
depends on auth — a `clients` + `projects` row exist the moment the form is submitted, full stop.
The magic link that goes out immediately after is an invitation, not a requirement: ignore it, and
the submission is still in the founder's pipeline; click it (now or in three weeks, doesn't matter)
and the account that comes out the other side is already wired to that submission and any other one
made under the same email, because the email-match/auto-link logic in §4 runs at every auth
provisioning step, not just the first. Nothing about "creating the account" is a distinct feature
from "logging in" — they're the same action.

The founder's side of this (reviewing a `submitted` project, promoting it to `lead`, replying in
the comment thread) happens **inside `apps/admin`**, not a new founder-facing UI in the portal —
`apps/admin`'s existing project detail page (`admin-tool-design.md` §9) just gains a "Submission"
tab that reads `submission_comments` and lets staff post replies. One inbox, not two.

---

## 6. Engineer network & payments

### Getting an engineer onto the platform

Invite-only in v1 (§0/§3): the founder creates a `profiles` row with `role='engineer'` and sends a
magic link; the engineer completes their `engineer_profiles` row (bio, skills) and Stripe Connect
onboarding.

### Stripe Connect — payout side

This is additive to the Stripe integration already designed in `admin-tool-design.md` §6, which
covers **client → Keystone** invoicing only. Connect adds **Keystone → engineer** payouts:

- **Account type: Express.** Lowest lift — Stripe hosts the onboarding flow (identity, bank
  details, tax info) and dashboard; Keystone doesn't build or store any of that. Fits the "boring
  and durable, no feature we can't maintain solo" principle from the admin doc.
- **Money flow model: separate charges and transfers**, not destination charges. The client pays
  Keystone directly via the existing hosted-invoice flow (unchanged); once that invoice is marked
  `paid` (via the existing `/api/webhooks/stripe` handler in `apps/admin`), a Server Action creates
  a `stripe.transfers.create({ destination: engineer's connect account id, amount, ... })` for the
  engineer's agreed share, logged as an `engineer_payouts` row.
  - Why not destination charges (client pays engineer's connect account directly, platform fee
    skimmed automatically): it would split the client-facing billing relationship across two
    systems for no benefit here — the client already only ever deals with Keystone, never
    knows or needs to know which connect account did the work. Separate transfers keep 100% of the
    client relationship inside the invoicing flow that's already built.
- **Fee handling:** the transfer amount is the engineer's agreed take (however that's negotiated —
  flat fee, percentage, hourly-converted), decided per-project and stored on `project_assignments`
  or the relevant `milestone`, not hardcoded as a platform-wide percentage. (Whether there even *is*
  a standard take rate is an open decision, §11.)
- **Webhook additions to the existing `/api/webhooks/stripe` handler:** `account.updated` (sync
  `engineer_profiles.connect_status`), `transfer.created`/`transfer.reversed` (sync
  `engineer_payouts.status`). Same idempotency pattern via `integration_events` as the existing
  invoice webhook handling.

### Engineer's dashboard (`apps/portal`, `role='engineer'`)

- Projects offered to them (`project_assignments` where `status='offered'`) — accept/decline.
- Active/completed assignments, with a link to the shared project detail (read-only subset: scope,
  timeline — not full commercial terms unless relevant to their cut).
- Payout history (`engineer_payouts`) and a "Connect Stripe account" / "update payout details"
  entry point into Stripe's hosted Express dashboard.

---

## 7. Secrets transmission

The stated need: a client sometimes has to hand over a credential (API key, DB connection string,
staging login) for an engineer to do the work, and that shouldn't happen over email or Slack DM.

**Recommendation: Supabase Vault, not Azure Key Vault.** Supabase Vault (`pgsodium`-backed,
built into the same Postgres instance already in use) gets the same encryption-at-rest guarantee
without adding a third infrastructure vendor to a two-vendor stack (Supabase + Vercel, per the
admin doc's "boring and durable" principle) or a cross-cloud credential (Azure AD app registration,
separate key rotation policy) for a feature that's or otherwise entirely within Supabase already.
Azure Key Vault would only make sense if there were an existing Azure-side consumer of these
secrets — there isn't; the consumer is always a human engineer reading it once to configure their
own environment.

**Flow:**

```
Client, on a project page in the portal:
  "Add a secret" → name + value + which project it's for
      │
      ▼
Server Action (client role, own project only) calls a Postgres RPC that wraps
`vault.create_secret(value, name, description)` — the plaintext never lands in
a table Keystone staff can casually SELECT; it's stored via pgsodium encryption
      │
      ▼
Engineer assigned to that project, viewing the same project page:
  "Reveal" button → Server Action checks `is_project_engineer(project_id)`,
  then calls `vault.decrypted_secrets` (a view, decryption requires the
  service-role context) → value shown once, not persisted client-side,
  copy-to-clipboard only
      │
      ▼
activity_log entry on every create and every reveal: who, when, which secret
name (never the value) — so there's an audit trail of who saw what
```

Guardrails:
- Only the specific `engineer_profiles` row(s) assigned to that project can reveal a given
  project's secrets — enforced via `is_project_engineer()`, same helper as elsewhere.
- Secrets are **never** included in any API response by default; the reveal action is a distinct,
  logged, on-demand call, not a field on the normal project payload.
- A "delete this secret" action for the client once a project wraps, so nothing sensitive sits
  around indefinitely after handoff — matches the admin doc's general posture of external systems
  (here: the vault) owning sensitive data with Keystone storing only what's needed to broker access,
  not a permanent copy.

---

## 8. Directory structure (`apps/portal`)

```
apps/portal/
  app/
    (public)/
      submit/page.tsx                intake brief form, no auth required
      login/page.tsx                 magic link / password
    (client)/
      dashboard/page.tsx             submission + project status list
      projects/[id]/page.tsx         status, comment thread, contract/invoice
                                        read-only view, secrets panel
    (engineer)/
      dashboard/page.tsx             offered/active assignments
      projects/[id]/page.tsx         assignment detail, secrets reveal
      payouts/page.tsx               payout history, Connect account link
    api/
      webhooks/stripe-connect/route.ts   (or folded into apps/admin's existing
                                           Stripe webhook — see open decision)
    layout.tsx  globals.css
  lib/
    supabase/server.ts  supabase/admin.ts  supabase/middleware.ts
    stripe/connect.ts                  onboarding links, transfers
    vault/secrets.ts                   create/reveal wrappers over the RPCs
    auth.ts                            requireRole('client'|'engineer')
  actions/
    submissions.ts  comments.ts  assignments.ts  payouts.ts  secrets.ts
  components/
  middleware.ts
  .env.example
```

---

## 9. Build phases

Each phase independently shippable, mirrors the admin doc's phasing style. Checkboxes are the
implementation plan — this section is the source of truth for build tracking; no separate
build-plan file (same precedent as `apps/admin`, which also has none).

**Status at a glance.** Only two things in this whole plan are genuinely blocked on a decision only
the founder can make — everything else can be built against reasonable engineering defaults today.
"Blocked" below means *that specific item*, not the whole phase; nothing here requires stopping an
entire phase to wait on one line item.

| Phase | Status | Blocked on |
|---|---|---|
| 0 — Scaffold & client auth | 🟢 Ready | — |
| 1 — Intake | 🟢 Ready | — |
| 2 — Engineer profiles & assignment | 🟢 Ready | — |
| 3 — Stripe Connect payouts | 🟡 One item blocked | §11.2 take-rate/fee model — only the transfer-amount Server Action; account setup, migration, and webhook work are unblocked |
| 4 — Secrets | 🟢 Ready | — |
| 5 — Polish / distribution | 🟡 One item blocked | §11.7 CTA copy/placement — only the `apps/web` CTA; everything else in the phase is unblocked |

**Phase 0 — Scaffold & client auth** — 🟢 no blockers — done 2026-07-24
- [x] Scaffold `apps/portal` (Next 16 App Router, React 19, TS, Tailwind v4) pointed at the *same*
      Supabase project as `apps/admin` — no new project, reuse `NEXT_PUBLIC_SUPABASE_URL`/anon key.
- [x] Add `apps/portal` to root workspace scripts (`dev -w apps/portal`, `build`, `lint`,
      `typecheck`) and to `.github/workflows/ci.yml`. (`--workspaces --if-present` already covers
      lint/build/typecheck automatically; CI needed no edit.)
- [x] Migration: `client_users` table + RLS; `is_project_client(project_id)` helper function
      (mirrors `is_active_staff()` in the admin doc). Landed in `packages/db`'s initial migration
      alongside the rest of the shared schema, not written separately.
- [x] `lib/supabase/server.ts`, `lib/supabase/admin.ts`, `lib/supabase/middleware.ts` — same
      request-scoped-vs-service-role split as `apps/admin`.
- [x] `lib/auth.ts`: `requireRole('client' | 'engineer')`.
- [x] `proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts` — confirmed against
      `node_modules/next/dist/docs`): session refresh + redirect unauthenticated users to `/login`.
- [x] `/login` and `/signup` — both magic-link and password forms shipped (superseded the original
      plan of magic-link-only). Password stays as an option for returning users who'd rather not
      wait on email each time; magic link stays the mechanism the intake-claim flow in Phase 1
      relies on (see below).
- [x] `/dashboard` — empty state, behind auth, confirms the role gate works end to end.
- [x] `.env.example` for `apps/portal`.
- [ ] Deploy: new Vercel project, Root Directory `apps/portal`, behind a Vercel-generated URL to
      start (custom domain can wait for Phase 5). Deliberately left for a manual step — creating a
      new Vercel project is an account-level action, not something to do unprompted.
- [ ] RLS test: an authenticated `client` with no `client_users` row sees nothing; a `client` user
      cannot read another client's row via direct table access. Policies are in place and correct
      (verified by inspection against `packages/db`'s migration), but no automated test suite
      exists yet for either app — worth adding once a testing convention is picked for the monorepo.
- *Outcome: a client can log in and see an empty dashboard. No submissions yet.*

**Phase 1 — Intake** — 🟢 no blockers
- [x] Migration: `projects.engagement_type` enum (`short_term_project` | `long_term_project` |
      `retainer`); `submitted` added to `projects.status`; `submission_comments` table + RLS.
      Already landed in the initial migration alongside Phase 0's schema, same as `client_users` —
      not a separate migration after all.
- [x] Migration: `create index idx_contacts_email_lower on contacts (lower(email))` — supports the
      email-match lookup below at submission volume.
- [x] `/submit` — public brief form (description, engagement type, optional budget/timeline,
      contact email), no auth required. Submitting alone is the complete action — no account is
      created or required as part of this form.
- [x] Abuse protection on `/submit`: honeypot field (`company_website`, hidden via CSS not
      `type="hidden"`) + per-email rate limiting (3 submissions/hour, checked via existing
      `projects.created_at` — no new table).
- [x] Server Action `submitProjectBrief`: look up `contacts` by case-insensitive email match → reuse
      `client_id` if found, else create a `clients` row + a `contacts` row (`email`,
      `is_primary=true`) → insert `projects` row (`status='submitted'`) → call the existing
      `sendMagicLink` action for that email. The magic link is an invitation to check status, not a
      requirement — the row exists whether or not it's ever clicked. One deviation from the
      original write-up above: `clients.name` is `not null` in the actual schema (unlike
      `projects.name`, which is the column really left null here) — new clients get the submitted
      email as a placeholder name, same as the new `contacts.name`, since `/submit` doesn't collect
      a separate "your name" field.
- [x] `apps/portal/lib/auth.ts`: `linkClientByEmail`, called alongside `ensureClientProfile` at both
      provisioning touchpoints (`signUpWithPassword`, magic-link verify in `/auth/confirm`) — not
      just first-time profile creation. Looks up all `contacts` rows matching the authenticated
      email, resolves their `client_id`(s), and upserts a `client_users` row for each (idempotent).
      This is the "account, once it exists, auto-attaches to everything that email ever submitted"
      behavior from §4/§5 — no separate claim UI, no token. Lives in `apps/portal` rather than
      `packages/db` as originally sketched — it's the only consumer, `packages/db`'s `auth-actions.ts`
      is deliberately app-agnostic (see comment there), and this logic is portal-specific.
- [x] Client dashboard: submission/project list with status (relies entirely on
      `is_project_client`/`is_project_engineer` RLS for scoping — no manual `client_id` filter).
- [x] Client project detail page: `submission_comments` thread (read + reply Server Action).
- [x] `apps/admin`: new `/submissions` list + detail section — reads `submission_comments`, lets
      staff reply, lets staff post internal-only notes (`visible_to_client=false`). Built as its own
      route rather than a tab on "the existing project detail page" as originally sketched, because
      no general project detail page exists yet in `apps/admin` (that's `admin-tool-design.md`
      Phase 1, not yet built) — this covers the submission-review slice that intake actually needs,
      not the full commercial spine (milestones, invoices, contracts) that page will eventually
      carry. Revisit folding `/submissions/[id]` into that page once it exists.
- [x] `apps/admin`: "Promote to lead" action (`submitted` → `lead`), on `/submissions/[id]`. Also
      names the project (`projects.name`, per the placeholder note above), since promotion is the
      point where the founder first assigns a real name.
- [x] Resend: new-submission email to the founder. Skipped silently if `RESEND_API_KEY` is unset
      (same pattern as `apps/web`'s contact form) rather than failing the submission.
- [x] RLS test: client A cannot read client B's `projects`/`submission_comments` rows (the
      cross-tenant case flagged in §10), verified live against local Supabase — two clients, two
      submissions, confirmed client A's session reads only its own project and gets an empty result
      /RLS-denied insert against client B's. Manual, not an automated suite (still no test runner in
      the monorepo, same gap noted in Phase 0) — worth converting to a real test once a convention is
      picked. This same session caught and fixed a real bug in the process: `is_project_client` and
      `is_project_engineer` (and, latently, `is_active_staff`/`is_provisioned_internal`) needed
      `security definer` — without it they recursed into the RLS policy that calls them and blew the
      Postgres stack (`stack depth limit exceeded`) the first time a client queried their own
      `projects` row. Fixed directly in the init migration (not deployed anywhere yet) with a comment
      explaining why; see `packages/db/supabase/migrations/20260724000000_init_schema.sql`.
- *Outcome: the actual ask — a fast, shareable link that gets a real submission into the founder's
  pipeline. Shippable and useful on its own, everything after this is additive.*

**Phase 2 — Engineer profiles & assignment** — 🟢 no blockers
- [ ] Migration: `engineer_profiles`, `project_assignments` tables + RLS;
      `is_project_engineer(project_id)` helper.
- [ ] `apps/admin`: "Invite engineer" action — creates a `profiles` row (`role='engineer'`), sends
      magic link.
- [ ] `apps/portal` engineer onboarding: form for `engineer_profiles` (display name, bio,
      `background_note`, `years_experience`, `skills`, `availability`).
- [ ] `apps/admin`: "Assign engineer" action on project detail — creates a `project_assignments`
      row (`status='offered'`).
- [ ] `apps/portal` engineer dashboard: offered/active assignments list; accept/decline Server
      Action.
- [ ] `apps/portal` client project detail: "who's working on this" panel once an assignment is
      `accepted` (name, `background_note`, skills — per §0 wording guardrail, no superlatives).
- [ ] Resend: project-offered email to the engineer.
- *Outcome: the founder can loop in a network engineer through the tool instead of a side
  conversation.*

**Phase 3 — Stripe Connect payouts** — 🟡 one item blocked (see below)

Unblocked — start any time:
- [ ] Migration: `engineer_payouts` table.
- [ ] `lib/stripe/connect.ts`: Express account creation + onboarding link, `transfers.create`
      wrapper with idempotency key.
- [ ] `apps/portal` engineer dashboard: "Connect Stripe account" entry point → Express onboarding.
- [ ] Webhook additions, folded into `apps/admin`'s existing `/api/webhooks/stripe` handler (§11.6,
      resolved): `account.updated` → sync `engineer_profiles.connect_status`;
      `transfer.created`/`transfer.reversed` → sync `engineer_payouts.status`.
- [ ] `apps/portal` engineer dashboard: payout history page.
- [ ] Manual E2E in Stripe test mode: invoice paid (test) → transfer fires → payout row appears →
      `stripe trigger transfer.created` confirms webhook sync.

🔴 **Blocked on §11.2 (take-rate/fee model)** — needs the founder to decide flat percentage vs.
per-project negotiation vs. something else before this can be written, since it determines both the
schema (what field(s) hold the agreed split) and the transfer-amount calculation itself:
- [ ] Server Action: on `invoice.paid` (existing handler in `admin-tool-design.md` §6), create the
      transfer to the assigned engineer's Connect account for their agreed share; insert
      `engineer_payouts` row; log `activity_log`.

- *Outcome: engineers get paid through the platform, not manually.*

**Phase 4 — Secrets** — 🟢 no blockers
- [ ] Enable Supabase Vault (`pgsodium`) on the shared project (if not already on).
- [ ] Postgres RPCs: `create_secret(project_id, name, value)` (checks `is_project_client`),
      `reveal_secret(secret_id)` (checks `is_project_engineer`, reads `vault.decrypted_secrets`).
- [ ] `lib/vault/secrets.ts` — thin wrappers over the RPCs; no plaintext ever assigned to a
      variable that outlives the request.
- [ ] `apps/portal` client project detail: "Add a secret" panel (name + value + submit).
- [ ] `apps/portal` engineer project detail: "Reveal" button — show once, copy-to-clipboard only,
      never re-render on refresh without a fresh explicit reveal.
- [ ] `activity_log` entries on every create and every reveal (name only, never the value).
- [ ] "Delete secret" action, client-triggered.
- [ ] RLS/RPC test: an engineer *not* assigned to a project cannot call `reveal_secret` for it.
- *Outcome: the "don't send API keys over email" ask is solved.*

**Phase 5 — Polish / distribution** — 🟡 one item blocked (see below)

Unblocked — start any time:
- [ ] Resend: comment-posted notification to whichever party didn't post it (client ↔ founder).
- [ ] `apps/admin`: `submitted`-status triage view if volume warrants it (§11.8) — skip if not.
- [ ] Mobile + accessibility pass on `/submit` specifically (public, unauthenticated, first
      impression of the firm for anyone who lands there directly).
- [ ] Point `portal.keystone.systems` (decided §11.0) at the Vercel project — DNS/CNAME, custom
      domain in Vercel project settings.

🔴 **Blocked on §11.7 (CTA copy/placement)** — needs a copy decision consistent with `apps/web`'s
no-superlatives/no-urgency guardrails before this ships, not an engineering default:
- [ ] Add the `apps/web` → `/submit` CTA.
- [ ] Confirm `/submit`'s indexability (indexed for lead-gen SEO value vs. deliberately `noindex`
      like the rest of the portal) — depends on how the CTA decision frames the page. Every other
      portal route stays `noindex` regardless.

- *Outcome: the portal is discoverable and the feedback loop (submission → comment → reply) closes
  without either party needing to remember to check back.*

---

## 10. Security

Same posture as `admin-tool-design.md` §11, plus what's new here:

- **Row-level isolation between clients is the new hard requirement this doc adds.** The admin app
  has a small trusted user set; this app has an open, self-serve `client` signup, so a bug in
  `is_project_client()` is a real cross-tenant data leak, not an internal mistake. Write RLS tests
  for this specifically (§ below) before Phase 1 ships.
- **Secrets never traverse the browser at rest**, only at the moment of a logged reveal (§7).
- **Stripe Connect Express** means Keystone never stores an engineer's bank details or tax ID —
  Stripe's hosted onboarding owns that, same "external systems own their domain" principle as the
  admin doc's Stripe/Zoho split.
- **Public `/submit` route needs abuse protection** (basic rate limiting / a lightweight CAPTCHA or
  honeypot field) since, unlike the admin app, it's an unauthenticated write path reachable by
  anyone, including spam/bots.

---

## 11. Open decisions

**Resolved (2026-07):**

0. **Domain.** `portal.keystone.systems`, a subdomain rather than the apex or a path under
   `apps/web`. Same reasoning as `admin-tool-design.md` §15 decision 5: the apex stays reserved for
   marketing so `keystone.systems` never conditionally resolves to a login-gated app depending on
   auth state, and a separate app/subdomain keeps the static-marketing-vs-dynamic-authenticated-app
   split clean rather than merging `apps/portal` into `apps/web`.

**Strategic (resolve before Phase 0 — these change the design, not just copy):**

1. ~~**§0 — Founder-gated intake vs. visible network.**~~ **Resolved 2026-07, scoped.** The
   operating model stays founder-led (unchanged from `company-context.md`); a client can see who's
   assigned to *their* project (name, background, skills) inside their own portal dashboard once
   matched, but this is per-client post-match disclosure, not a public marketing claim. `apps/web`
   is unchanged — still generic, no numbers, no names. `company-context.md` and `docs/todo.md` have
   been updated to reflect this scoped resolution (see "Bench depth and post-handoff support" in
   the former). One follow-on still open:
   1a. **Exact wording used inside the portal itself** when showing an engineer's background to a
       matched client. "World-class" collides with the no-superlatives guardrail. Needs a
       concrete-specifics substitute (a stated vetting bar, prior companies where shareable,
       years-of-experience floor) — same treatment as the founder's own Stripe/Microsoft line, not
       a new adjective. Not urgent — this is portal UI copy, written closer to Phase 1.
2. **Take-rate / fee model** between what the client pays and what the engineer is transferred —
   flat percentage, per-project negotiation, or something else. Affects `project_assignments`
   fields and whether it's ever shown to the client.
3. **Contracting party.** Does the client contract with Keystone Systems (which subcontracts to the
   network engineer) or directly with the engineer (Keystone as broker/referral)? This changes the
   Zoho Sign template needed (`admin-tool-design.md` §7) and who bears liability — needs a real
   legal answer, not an engineering default.
4. **Does this change the "priced to the outcome, not hourly" and "handoff is default" framing** in
   `company-context.md` for lower-ticket, network-sourced work specifically, or does that pricing
   philosophy hold unchanged regardless of who does the work?

**Product / build (resolve before the relevant phase, not blocking Phase 0):**

5. **Engineer onboarding path** — invite-only (assumed here) vs. an eventual public "apply to join
   the network" page. Invite-only is consistent with the resolved scope of decision 1 (network is
   curated, not self-serve either direction); revisit only if that changes.
6. ~~**Where the Connect webhook route lives.**~~ **Resolved 2026-07: folded into `apps/admin`'s
   existing `/api/webhooks/stripe` handler**, not a new route in `apps/portal`. It's one Stripe
   account either way, and a second webhook registration to maintain would be pure overhead with no
   offsetting benefit. This was already the stated lean with no real counter-argument, so treated
   as decided rather than left open — no build-blocking decision remains here (see Phase 3, §9).
7. **Marketing-site CTA copy and placement** for `/submit` — needs to go through the same copy
   guardrails as everything else in `apps/web` (no superlatives, no urgency language). Given
   decision 1's resolution, this is a low-key CTA into a faster intake mechanism, not a network/team
   showcase — `apps/web` framing stays as understated as everything else on the site.
8. **`submitted`-status volume** — if intake is frictionless, does the founder need lightweight
   triage tooling (bulk view, quick decline) in `apps/admin` beyond a single project-detail-at-a-time
   flow? Not needed for Phase 1 launch, likely needed once volume shows up.

---

*Ties into: `docs/admin-tool-design.md` (shared architecture, data model, and Stripe invoicing this
extends), `docs/company-context.md` (positioning constraints this doc explicitly weighs against in
§0), `docs/todo.md` (bench-depth decision, directly relevant to §0/§11.1 and §11.5).*
