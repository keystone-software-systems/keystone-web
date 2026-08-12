# Keystone Systems / StackDiligence — Repo Instructions

This monorepo holds two marketing sites for two separate brands/entities run by the same
founder: **Keystone Systems** (`apps/web`) and **StackDiligence** (`apps/stackdiligence`). This
repo is unrelated to Land Catalyst/PropDog.ai — treat it as a separate client context even though
the same person operates both.

Full business context for Keystone lives in `docs/company-context.md`; StackDiligence's spec is
in `docs/stack-diligence-init.md`. Read the relevant one before writing any copy, not just this
summary.

## Keystone Systems (`apps/web`)

One-line pitch: **senior engineering judgment, without the full-time hire.** The founder
(Senior/Staff-level engineer, background at Stripe and Microsoft) sells judgment applied at a
specific, well-scoped moment — not staff augmentation, not "AI-assisted development" as a
headline claim.

**Five service lines** (`apps/web/app/solutions/content.ts`):
1. Net New Development
2. Vibe-Code to Production
3. Business Process Automation
4. AI Training & Setup
5. Existing Codebase Improvement

**Engagement model:** priced to the outcome, not hourly. Handoff is the default; fractional-CTO
retainers are available but not the default framing.

### Copy Guardrails (Keystone) — read before editing any user-facing text

These are hard constraints from `docs/company-context.md`, not style preferences:

- **No superlatives** — no "world-class," "rockstar," "best-in-class," "cutting-edge,"
  "game-changing." Replace with a concrete noun phrase ("senior engineering judgment") or a
  named deliverable, never a softened hype word.
- **No "empower," "revolutionize," or transformation language.** State the specific problem
  solved or artifact delivered instead.
- **No em dashes, no exclamation points, no urgency language** anywhere in copy.
- **State the Stripe/Microsoft credential once, plainly, in one place** (About page). Don't
  repeat or dramatize it elsewhere. Don't lead with AI capability as the headline hook.
- **Never mention Cedar or that the founder currently holds another job**, anywhere
  public-facing. Present Microsoft/Stripe as background without "currently"/"most recently"
  framing that implies a current-vs-past ordering.
- **Don't state a post-handoff support window, guarantee, or warranty length.** Not yet decided
  internally — see `docs/todo.md`. Current About-page framing ("if something doesn't hold up,
  that's on Keystone Systems to fix") is the only sanctioned phrasing until this changes.
- **Don't state bench-depth specifics** (numbers, names) in public copy. Current framing is "a
  small network of equally experienced independent engineers" — keep it generic.
- **No social proof** (testimonials, case studies, before/after) until real client examples
  exist and are cleared to share.
- The name's personal meaning to the founder is private — never explain "what Keystone means"
  in copy, and avoid anything that reads as religious/denominational.

When in doubt about copy, check `docs/todo.md` for open decisions before locking language in —
several things (support terms, bench depth, social proof) are intentionally left vague pending a
founder decision.

### Visual/Brand Direction (Keystone)

Full detail in `branding/keystone-systems-brand-guide.md`. Summary: clean, minimal, geometric —
closer to Stripe/Linear/Vercel than a creative agency. Monochrome-first with a single accent
color (Blueprint Navy `#14324D`, Technical Blue `#3E7CB1`). No gradients, glow effects, mascots,
or literal stone/arch imagery.

## StackDiligence (`apps/stackdiligence`)

One-line pitch: technical due diligence for software acquisitions — a full-stack assessment of
what a buyer is actually buying, delivered in plain deal-language for PE/VC deal teams without
in-house technical staff. Full spec in `docs/stack-diligence-init.md`. Separate LLC/entity from
Keystone Systems (see the entity-setup checklist in that doc) — **don't conflate the two brands
in copy**, and don't share components/content between `apps/web` and `apps/stackdiligence`.

Same house style as Keystone's guardrails above: no superlatives, no em dashes, no invented
numbers for pricing or a support/disclaimer window until decided. The Cedar/current-job rule
applies here too — it's the same founder, so never mention Cedar or a current other job in
StackDiligence copy either.

### Visual/Brand Direction (StackDiligence)

No formal brand guide yet — placeholder palette, distinct from Keystone's Blueprint Navy so the
two sites never read as the same company: Graphite `#1E2328` (primary), Ledger Green `#4B6357`
(accent). Same restrained Stripe/Linear tone as Keystone. Text-based wordmark only for now (no
icon mark) — revisit if/when real brand work happens.

## Stack & Structure

- **Monorepo:** npm workspaces. Two marketing sites — `apps/web` (Keystone) and
  `apps/stackdiligence` (StackDiligence) — plus two internal, auth-gated tools: `apps/admin`
  (Keystone ops: submissions review, prospects/outreach) and `apps/admin-stackdiligence`
  (StackDiligence prospects/outreach only — no submissions pipeline yet), and `apps/portal`
  (client-facing project portal, Keystone only).
- **Framework:** Next.js 16 App Router, static generation, for both marketing sites
- **Styling:** Tailwind CSS v4, brand palette as CSS variables (each marketing site has its own
  palette; the two admin apps share Keystone's neutral navy/slate/blue tokens since they're
  internal tools, not brand surfaces — only the header wordmark differs)
- **Font:** Inter via `next/font/google`
- **Contact form:** Resend, one API route per app (`app/api/contact/route.ts`) — separate
  from/to addresses per brand
- **Shared admin logic:** `packages/admin-core` holds the brand-agnostic prospects/outreach
  code (auth, brand-access check, server actions, components, feed-source fetchers) used by both
  `apps/admin` and `apps/admin-stackdiligence`. This is the one intentional exception to "don't
  share components between brands" below — it's internal tooling, not brand-facing content, and
  each app still hardcodes its own `Brand` in `lib/brand.ts` rather than switching at runtime.
- **Deployment:** Vercel, native GitHub integration, one Vercel project per app (Root Directory
  = the app's path under `apps/`). No deploy step in CI — `.github/workflows/ci.yml` runs
  typecheck/lint/build only.

```
apps/web/                  Keystone Systems site — see apps/web/CLAUDE.md for Next.js-16-specific rules
apps/stackdiligence/       StackDiligence site — same Next.js-16 rules via its own CLAUDE.md
apps/admin/                Keystone internal ops tool (submissions + prospects/outreach)
apps/admin-stackdiligence/ StackDiligence internal ops tool (prospects/outreach only)
apps/portal/               Keystone client-facing project portal
packages/admin-core/       Shared prospects/outreach logic for the two admin apps
branding/                  Keystone logo SVGs + brand guide
docs/                      Company context, build plan, open TODOs, StackDiligence spec
```

Both apps have their own `CLAUDE.md` (Next.js 16 breaking-change warning — read the bundled docs
in `node_modules/next/dist/docs/` before writing Next.js code, don't assume training-data APIs).

## Commands

Run from repo root (workspace-aware):

```
npm install
npm run dev:web              # apps/web on localhost:3000
npm run dev:stackdiligence   # apps/stackdiligence on localhost:3000 (run one at a time, same port)
npm run typecheck            # both apps
npm run lint                 # both apps
npm run build                # both apps
```

Run `npm run typecheck && npm run lint && npm run build` before considering any change done —
this mirrors CI exactly, across both apps.

## Conventions

- TypeScript, functional components, App Router conventions throughout, both apps.
- Keystone's solutions pages are template-driven off `apps/web/app/solutions/content.ts` —
  add/edit a service there, not by hand-writing a new page. StackDiligence has a single service
  line, so its pages are hand-written (`apps/stackdiligence/app/*/page.tsx`), not template-driven.
- `generateMetadata()` on every route; keep each app's `sitemap.ts` and `robots.ts` in sync when
  adding routes.
- Minimal comments, no unnecessary abstraction — same house style as other Tanner projects.
