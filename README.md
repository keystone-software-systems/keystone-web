# Keystone Systems / StackDiligence

Two brands, one monorepo, apps grouped by brand under `apps/`: **Keystone Systems**
(keystone.systems), a solo/founder-led software engineering consultancy, with a marketing site,
internal ops tool, and client portal under `apps/keystone/`; and **StackDiligence**
(stackdiligence.com), technical due diligence for software acquisitions, with a marketing site
and internal ops tool under `apps/stackdiligence/`. They're separate brands/entities run by the
same founder — see each app's own docs for its specific context. All are Next.js App Router
apps deployed to Vercel as separate projects.

See `docs/build-plan.md`, `docs/company-context.md`, `docs/stack-diligence-init.md`, and
`branding/keystone-systems-brand-guide.md` for full project and brand context.

## Structure

```
apps/keystone/web/            Keystone Systems — public marketing site
apps/keystone/admin/          Keystone internal ops tool (submissions + prospects/outreach)
apps/keystone/portal/         Keystone client-facing project portal
apps/stackdiligence/web/      StackDiligence — public marketing site
apps/stackdiligence/admin/    StackDiligence internal ops tool (prospects/outreach)
packages/admin-core/          Shared prospects/outreach logic for the two admin apps
packages/ui/, packages/db/    Shared UI components and Supabase client, used across apps
branding/                     Keystone logo files and brand guide
docs/                         Planning docs
```

## Development

```
npm install
npm run dev:web                     # apps/keystone/web on http://localhost:3000
npm run dev:stackdiligence          # apps/stackdiligence/web on http://localhost:3000
npm run dev:admin                   # apps/keystone/admin
npm run dev:admin-stackdiligence    # apps/stackdiligence/admin
npm run dev:portal                  # apps/keystone/portal
npm run typecheck                   # all apps
npm run lint                        # all apps
npm run build                       # all apps
```

## Environment variables

Copy each app's `.env.example` to `.env.local` (e.g. `apps/keystone/web/.env.example`,
`apps/stackdiligence/web/.env.example`) and fill in real values for local dev. See those files
for what each variable does.

## Deployment

`.github/workflows/ci.yml` runs typecheck, lint, and build on every push and pull request — it's
CI only, no deploy step.

Actual deploys are handled by Vercel's native GitHub integration: import this repo as a separate
Vercel project per app, with Root Directory set to that app's path (e.g. `apps/keystone/web`,
`apps/stackdiligence/admin`) — preview deployments on every PR, production deploys on push to
`main`. No repo secrets needed.

Each app needs these set as its own Vercel project's environment variables (Project Settings →
Environment Variables):

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Sends contact-form email via Resend |
| `RESEND_FROM_EMAIL` | Verified sender address once the app's domain is set up in Resend |
| `CONTACT_TO_EMAIL` | Inbox that receives contact-form submissions |
