# Keystone Systems

Marketing site for Keystone Systems (keystone.systems), a solo/founder-led software engineering
consultancy. Next.js App Router site in `apps/web`, deployed to Vercel.

See `docs/build-plan.md`, `docs/company-context.md`, and `branding/keystone-systems-brand-guide.md`
for full project and brand context.

## Structure

```
apps/web/     Next.js 16 App Router site (Tailwind v4, TypeScript)
branding/     Logo files and brand guide
docs/         Planning docs
```

## Development

```
npm install
npm run dev        # apps/web on http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

## Environment variables

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in real values for local dev.
See that file for what each variable does.

## Deployment

`.github/workflows/ci.yml` runs typecheck, lint, and build on every push and pull request — it's
CI only, no deploy step.

Actual deploys are handled by Vercel's native GitHub integration: import this repo in the Vercel
dashboard, set the project's Root Directory to `apps/web`, and Vercel takes it from there —
preview deployments on every PR, production deploys on push to `main`. No repo secrets needed.

The app needs these set as Vercel project environment variables (Project Settings → Environment
Variables):

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Sends contact-form email via Resend |
| `RESEND_FROM_EMAIL` | Verified sender address once `keystone.systems` is set up in Resend |
| `CONTACT_TO_EMAIL` | Inbox that receives contact-form submissions |
