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

Deploys to Vercel via `.github/workflows/deploy.yml`:

- Every push and pull request runs typecheck, lint, and build.
- Pull requests additionally deploy a Vercel preview and comment the URL on the PR.
- Pushes to `main` additionally deploy to Vercel production.

The workflow needs these repo secrets (Settings → Secrets and variables → Actions):

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `apps/web/.vercel/project.json` after running `vercel link` |
| `VERCEL_PROJECT_ID` | `apps/web/.vercel/project.json` after running `vercel link` |

The app itself needs these set as Vercel project environment variables (Project Settings →
Environment Variables), which `vercel pull` fetches during CI builds:

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Sends contact-form email via Resend |
| `RESEND_FROM_EMAIL` | Verified sender address once `keystone.systems` is set up in Resend |
| `CONTACT_TO_EMAIL` | Inbox that receives contact-form submissions |

Until `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` are added, the `checks` job still runs
on every push and PR; the `deploy-preview` and `deploy-production` jobs will fail until the
project is linked and those secrets are added.
