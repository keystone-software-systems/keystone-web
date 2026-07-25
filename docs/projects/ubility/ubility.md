# Ubility / C4Billing — Project Papertrail

*Running log of what we know, in the order we learned it. Newest entries at the bottom of each section. This is a working file, not client-facing copy.*

---

## What / Who

Prospective client work, referred to as "Ubility" — codebase lives under `../projects/ubility/` (i.e. `/Users/tanner/dev/keystone/projects/ubility/`), separate from this `keystone` repo. GitHub org appears to be **C4Billing** (seen in a merge-commit message in `c4-scrape`). Relationship to Keystone Systems engagement not yet defined — could be Net New Dev, Codebase Improvement, Due Diligence, etc. TBD once we know more.

## Repos (as of 2026-07-21)

Six repos, all on `main`, none uncommitted/dirty at time of inspection:

| Repo | Size | Commits | Last commit | Notes |
|---|---|---|---|---|
| `c4-scrape` | 171M | 74 | 2025-11-05 (9mo ago) | Biggest on disk — likely includes scraped data/artifacts, not just code |
| `c4-frontend` | 17M | 1135 | 2026-05-11 (2mo ago) | Most commits, most recently touched — likely core active product |
| `c4-marketing` | 14M | 34 | 2025-07-31 (12mo ago) | Stalest repo |
| `c4-backend` | 13M | 430 | 2026-05-06 (3mo ago) | Second-most active — pairs with frontend |
| `ubility-ai` | 12M | 32 | 2026-03-11 (4mo ago) | |
| `c4-extract` | 732K | 24 | 2026-04-23 (3mo ago) | Smallest — likely a focused pipeline/utility |

**Working read:** `c4-frontend` + `c4-backend` look like the actively developed core product. `c4-extract` and `c4-scrape` read as supporting data pipelines. `c4-marketing` and `ubility-ai` are separate and less active. Not yet confirmed — contents haven't been opened.

## Open Questions

- [ ] What does the product actually do? (name "C4Billing" suggests billing/invoicing — unconfirmed)
- [ ] What's the actual engagement ask — build, harden, audit, or diligence?
- [ ] Who is the point of contact / decision-maker at Ubility?
- [ ] Any timeline or deadline driving this?

## Next Steps

- [ ] Open up README / package.json / stack info in each repo to confirm what they do
- [ ] Map relationships between the six repos (which calls which)

## Original Report that triggered engagement

The reason we're involved in this in the first place is that my friend Jeremy Johnson is an investor in Residence Billing, who is the primary customer of Ubility. They're currently going through a merger process with this company called Valiflo, who is building their own pre-revenue solution for utility management. They are specifically targeting municipalities, not multi-family, which is what Ubility does. The important thing is that Valiflo is still pre-revenue and hasn't proven that their solution works at all.

Residence Billing, who is already doing multi-family utility billing, would prefer to continue to use Ubility. Steve Chidester, who is one of the owners of Residence Billing, is also one of the owners of Ubility, so he's the one coming to me and asking for potential development help.

Important context is that their only engineer passed away a few months ago, and they need help. They'd like to potentially scale the platform.

Below is the report. These are more tactical things that they're looking to have solved in the shorter term. Some of them, like test coverage, are going to be a lot more tricky to handle given the architecture setup. The below report was the things that they had surfaced in their initial audit of the Ubility repo. 

### Report from Valiflo engineers

Hello!

I wanted to reach out and say thank you for the transparency and meeting with us to answer our questions. We have completed our review of Ubility as a potential software platform for the multifamily offering and wanted to share what we found. First off, there is clearly a lot of work that has gone into this, and it shows. The codebase is well organized, uses a modern tech stack, and reflects real effort that has proven successful. We want to be upfront and direct with what we found so everyone has the full picture, but none of this is meant to take away from the work that has been done.

First, security. Our engineering review turned up serious issues across the six shared repositories, which are functional but under-documented, untested, and have no CI in place. The critical findings:
- Live secrets committed to Git: Real database passwords and third party API keys are sitting in the config history of the repo.
Why it matters: These are live credentials, not just misplaced files. Anyone with access to the repo's history, including former contractors or anyone who ever cloned it, can pull working passwords and keys.
How it could be used: An attacker who finds these in a public or leaked repo could log directly into the production database or third party services using valid credentials, with no need to break through any other defenses.
- API auth relies on a shared key shipped to the browser: The client key that gates API access is bundled into the frontend code that runs in every user's browser.
Why it matters: The key is meant to prove a request is coming from the real app, but since it ships to every browser, it is effectively public.
How it could be used: Anyone can open dev tools, copy the key, and write their own script that calls the API directly, impersonating the app to scrape resident data in bulk or hit endpoints the UI would normally restrict.
- Public endpoints trigger costly external work: Certain endpoints are deployed with no authentication required at all.
Why it matters: Without any login or key check, these endpoints will run for anyone who finds the URL, including automated scanners that constantly probe the internet for open endpoints.
How it could be used: An attacker could repeatedly hit them to trigger AI calls, file fetches, or headless browser jobs at will, running up cloud costs or using the server as a launch point for other activity, all without needing credentials.
- Server fetches attacker supplied URLs (SSRF): The server will fetch or render a URL supplied by whoever is calling it, rather than a fixed, trusted address.
Why it matters: This is a well known class of vulnerability because it lets an outsider make the server itself send requests on their behalf.
How it could be used: An attacker could point this at internal only systems, such as databases, cloud metadata services, or internal admin tools, that are normally unreachable from the outside, using the server as a proxy to map out or attack internal infrastructure.
- Auth tokens passed in URLs: Session tokens are base64 encoded, which is not encryption, and placed directly into page URLs.
Why it matters: URLs get logged everywhere, including browser history, server access logs, and proxy logs, and are sent to third party sites via the referrer header.
How it could be used: Anyone with access to those logs, or anyone watching over a user's shoulder or a screen share, could lift a token straight out of the URL and log in as that resident or staff member.
- Live API config committed to Git: A tracked .env file exposes the API root and key configuration, and the .gitignore misses plain .env files, so this keeps happening.
Why it matters: Same core problem as the first finding, working credentials sitting in a place they should never be, with the safety net meant to prevent it misconfigured.
How it could be used: Anyone who gains access to the repo can immediately connect to the same APIs the application uses, with no additional work required.

A few additional findings are also worth flagging:

- Session cookies missing security flags: Cookies are set without Secure, SameSite, or HttpOnly.
Why it matters: Without these flags, cookies can be read by scripts on the page and sent along on cross site requests.
How it could be used: If an attacker injects even a small script onto the page, through a comment field or ad script for example, they could steal a resident's session cookie and take over their logged in session.
- Investor only content gated client side only: The protected investor page is unlocked with a flag stored in the browser, rather than checked on the server.
Why it matters: Any check that only happens in the browser can be changed by the person using the browser.
How it could be used: Anyone could open dev tools, set that flag manually, and view investor only content without real access rights.
- Roughly 5,300 dependency files committed to Git: The node_modules folder is tracked despite being set up to be ignored.
Why it matters: This buries the real, current list of dependencies and hides whether any of them have known vulnerabilities that need patching.
How it could be used: A known vulnerability in a buried dependency could go unnoticed and unpatched simply because normal scanning tools cannot see it clearly, leaving a quiet way in for anyone aware of it.

Second, architecture. The platform uses a modern tech stack, but most of the business logic is built into SQL stored procedures. This can work fine early on, but in our experience at a previous company that used the same approach, this pattern becomes difficult to maintain during high growth periods. Technical debt accumulates quickly, ultimately leading to a brittle, slow system that does not scale well.

Given all of this, we recognize the amount of work that has gone into building this, and these issues could be corrected. That said, resolving them will take real time spent searching and troubleshooting rather than straightforward fixes. We believe continuing to build on our current platform is the best way forward.

## My initial takeaways

I talked to Mike, who is an individual contributor for Ubility that is coming out of retirement or came out of retirement to help them out briefly. It seems like the main experience of the team that put this together is mainly around Microsoft solutions. The main infrastructure is running on a Windows VM on EC2, and they're using SQL Server on RDS on AWS. That is potentially concerning to me for a number of reasons. Primarily because Mike said that most of their business logic exists within SQL stored procedures, which are infamously hard to test and could be pretty problematic.
Steve, who's one of the owners of Ubility, wants to potentially scale this platform, and I can't see how you would auto-scale. It doesn't have to be auto-scale. I don't see how you would do that with a Windows VM and SQL Server. I would prefer to have it in Postgres and just any container that handles business logic. Right now it's written in C# and ASP.NET stuff, but we should consider potential other options to recommend.
I think Steve is looking for maybe a few options here:
1. Someone that is available for maintenance and is on call, essentially.
2. Someone that could continue to develop new features and add AI capabilities to the application.
There are all sorts of options there.

I haven't yet scanned through the repos themselves, this is just what Mike and Steve have told me. I think the next step is to get a better understanding of what the product actually does, and then we can start to make some recommendations on how to proceed.

---

## Independent Verification of Valiflo Report (per-repo agent audits)

Spawned one research agent per repo (read-only, no edits) to verify the Valiflo claims against actual code + git history, and to confirm what each repo does. Live secrets found are redacted in these notes — full values were not printed by the agents.

### c4-extract — DONE

**What it does:** Small Node/TS (Express) Cloud Run service — an AI-based utility-bill PDF extraction pipeline. `POST /extract` takes a `SignedUrl` to a PDF + a `LoggerUrl`, downloads the PDF, chunks it, sends chunks to Claude (Anthropic SDK — Sonnet for extraction, Haiku for account/template matching) via forced tool-use, matches the result to a Ubility account, and posts results back to `LoggerUrl` (Ubility's own audit-log system). Second endpoint `POST /populateInvoice` does the matching step synchronously on a pre-extracted payload. Anthropic-only, no other AI provider.

**Valiflo claims — verdicts:**
1. Live secrets committed to Git — **REFUTED.** Full history scan (`git log --all -p`) found no real keys. Only placeholder/dummy values in `.env.example`, `.claude/settings.local.json` (a fake `sk-ant-dummy` test key), and a test-stub fallback. No `.env` was ever committed.
2. Unauthenticated endpoints triggering costly AI calls — **CONFIRMED.** Cloud Run deployed with `--allow-unauthenticated` (`cloudbuild.yaml:55`); `POST /extract` and `POST /populateInvoice` have zero auth/authz middleware (only body-shape validation). Any anonymous caller can trigger multiple paid Claude calls per request (Sonnet, up to 64k max_tokens, per PDF chunk), no rate limiting.
3. SSRF — **CONFIRMED.** `SignedUrl` field has no URL-format check, no host allowlist, no scheme restriction (`src/schemas/request.ts:5`), and is fetched server-side (`src/services/pdfFetcher.ts:32`). Combined with #2, an anonymous caller could point this at internal/metadata endpoints.
4. Live API config (.env) committed to Git — **REFUTED / not applicable.** No `.env` ever tracked; `.gitignore`/`.dockerignore` correctly exclude it.
5. node_modules committed to Git — **REFUTED.** Largest blob in full history is `package-lock.json` (~76KB).

**Net read on c4-extract:** the "live secrets" and "tracked .env" claims do NOT hold here — this repo is actually clean on that front. But the unauthenticated-endpoint-triggers-costly-AI-calls claim and the SSRF claim are both real and concretely exploitable right now (no auth at all, weak URL validation). This is a cost/abuse risk more than a data-breach risk for this specific repo.

### c4-marketing — DONE

**What it does:** Public marketing/brochure site for Ubility (Next.js 14 App Router, MUI). Home/about/solutions/contact/get-started/privacy/sitemap pages. No CMS, no auth, no user accounts. One backend touchpoint: a "request information" contact-form POST that sends a header-based key to a configurable API root.

**Valiflo claims — verdicts:**
1. Live secrets committed to Git — **PARTIALLY CONFIRMED.** A real-looking, unchanged-since-creation API key is committed in `.env` (`NEXT_PUBLIC_CONFIG_APIKEY`, present since the file's first commit). Mitigating: it's `NEXT_PUBLIC_`-prefixed, so Next.js inlines it into the client bundle by design regardless of where it's stored, and its paired API root in this file points at a `localhost` dev address — suggesting these may be dev-only values overridden by real env vars at deploy time (can't confirm prod value from this repo alone). Still bad practice (no dev/prod separation in the repo, rotate-on-leak burden), but lower blast radius than a true server secret leak.
2. Tracked `.env` / `.gitignore` gap — **CONFIRMED.** `.env` is tracked; `.gitignore` only excludes `.env*.local`, not plain `.env` — same pattern as elsewhere: looks protected, isn't.
3. node_modules / dependency bloat committed — **REFUTED.** None tracked, `.gitignore` correctly covers build output.
4. Investor-only / gated content — **NOT APPLICABLE.** No investor or gated content of any kind on this site; it's a pure lead-gen brochure site.

**Net read on c4-marketing:** lowest-severity of the repos so far, consistent with it being the smallest/stalest and lowest business-criticality. Real issue (tracked `.env`, weak `.gitignore`) but likely low-impact — cheap fix (rotate key, fix `.gitignore`, scrub history if a clean repo matters for the engagement).

**Note on this audit process:** the agent's report for this repo included a partial preview (first/last 4 characters) of the committed API key. Per this session's security policy, even partial/truncated credential values shouldn't be echoed without explicit authorization — that partial value has been fully redacted here and was not carried into this doc. Going forward, agents auditing for secrets should be told to report only *existence + file:line + variable name*, no characters at all.

### ubility-ai — DONE

**What it does:** Despite the name, this is **not** an AI backend — it's a second static marketing/investor-pitch site (Vite + React + TS SPA, prerendered for SEO). Zero server-side code, zero AI provider integration anywhere in the repo (the `@supabase/supabase-js` dep is listed but unused; "AI" only appears as marketing copy / future-roadmap prose on the investor pages). It talks to an external ASP.NET-style backend (`VITE_API_BASE_URL`, e.g. `/API/UserAuth/InvestorLogin`) that lives in one of the other repos, not here. "UMS" isn't a system name — it's just the route suffix distinguishing two branded copies of the same investor deck (`/investors-ums` vs `/investors-cp`), gated to different distribution lists.

**Valiflo claims — verdicts:**
1. Live secrets committed to Git — **REFUTED.** Full history clean; only `.env.example` with a localhost placeholder was ever tracked.
2. Unauthenticated endpoints triggering costly AI calls — **NOT APPLICABLE.** No backend code exists in this repo at all — if this finding is real, it points at a different repo (c4-backend is the likely candidate; not yet reviewed as of this writing).
3. Tracked `.env` — **REFUTED.** `.gitignore` correctly excludes `.env`, and it's held — never bypassed in history.
4. node_modules committed — **REFUTED.** None tracked.
5. Investor content gated client-side only — **CONFIRMED, and serious.** Both investor pages (`Investors.tsx` / `InvestorsUMS.tsx`) hard-code real financial data directly in JSX — current ARR, monthly revenue, burn rate, a stated growth-capital ask, break-even ARR targets by phase, customer counts, and named pipeline leads. The `f655f4e "Removed ARR from UMS"` commit only removed the top-of-page stat block; deeper ARR figures further down `InvestorsUMS.tsx` are still present in the current code, and the "removed" content is still fully recoverable from git history regardless. Access control is `sessionStorage.getItem('investorAuthUMS') === 'true'` — a client-side boolean render-branch, not a server-verified gate. The confidential JSX is statically imported into `App.tsx` (not lazy-loaded), so **the entire investor deck ships in the public JS bundle to every visitor**, authenticated or not — viewable via dev tools with no login, or trivially unlocked by setting the sessionStorage flag in console. No password is actually required to see the data.

**Net read on ubility-ai:** clean on secrets/env/deps, but has the single most concrete, currently-exploitable finding of any repo so far — anyone visiting the public site can view Ubility's real financial/investor data with zero authentication, and the one prior attempt to remove sensitive figures ("Removed ARR from UMS") was incomplete. This is a real, immediate confidentiality problem independent of the code-quality/architecture conversation, and worth flagging to Steve early regardless of how the broader engagement shapes up.

### c4-scrape — DONE

**What it does:** Node/TS/Express Cloud Run service that drives headless Chromium (Puppeteer) to log into **real utility-company customer portals** — Rocky Mountain Power, Dominion Energy, Salt Lake City Public Utilities, Republic Services (Duke Energy partially built) — and download billing PDFs, using per-request `loginInfo.username/password` supplied by the caller. Triggered synchronously via `POST /scraper` (no queue/cron), presumably called by C4's core backend whenever a resident's utility bill needs to be pulled. Effectively single-author (Kurt Sprinzl), first commit 2025-09-20, last 2025-11-05 — consistent with the "recently deceased sole engineer" timeline.

**Valiflo claims — verdicts:**
1. Live secrets committed to Git — **REFUTED.** No real secrets found in current tree or full history; only placeholder `.env.example`.
2. Unauthenticated endpoints triggering headless-browser jobs — **CONFIRMED, severe.** `GET /screenshot`, `POST /scraper`, `POST /test`, `GET /pdf` have zero auth anywhere in the code, and the deploy config explicitly passes `--allow-unauthenticated` (`cloudbuild.yaml`, also documented in the README as the deploy instructions). Anyone can trigger unlimited, unmetered headless-Chromium jobs with a single `curl`.
3. SSRF — **CONFIRMED, and this one has real exfiltration potential.** `GET /screenshot?url=...` and `GET /pdf?url=...` pass the query param straight into `page.goto()` with no validation — classic SSRF-with-response-oracle (attacker gets the rendered content back), reachable against internal services / cloud metadata endpoints on GCP. Separately and more seriously: `config.loggingEndpoint` in the `POST /scraper` request body is fully attacker-controlled and used for outbound server-side fetches at multiple points in the scrape lifecycle — including `uploadToQueue()`, which **POSTs the downloaded real customer utility-bill PDF to that attacker-chosen URL**. An attacker who can reach this endpoint can potentially exfiltrate real customer billing data by supplying a malicious `loggingEndpoint` alongside otherwise-valid scrape parameters.
4. Tracked `.env` — **REFUTED / not applicable.** `.gitignore` correctly excludes it; never bypassed.
5. Dependency files (node_modules) committed despite `.gitignore` — **CONFIRMED.** 5,258 tracked files under `node_modules/` (209 packages, including `puppeteer`/`puppeteer-core`/Chromium tooling) despite `.gitignore` correctly listing it.

**Why the repo is 171M:** ~89M is the committed `node_modules` tree; ~82M is `.git` history still holding dead Chromium/puppeteer-core binaries (a 55MB+ compressed Chromium binary among them) left over from an earlier AWS Lambda/App Runner deployment before the project pivoted to GCP Cloud Run. No scraped-data dump or screenshot archive — it's purely dependency/history bloat.

**Net read on c4-scrape:** the most operationally dangerous repo found so far. Beyond the unauthenticated-headless-browser cost/abuse risk shared with c4-extract, this repo's SSRF has a concrete path to **exfiltrating real residents' utility billing data** via an attacker-supplied logging endpoint, and the service also receives real utility-portal credentials (`loginInfo.username/password`) per request with no auth layer protecting the endpoint that receives them.

### c4-backend — DONE

**What it does:** The core backend. `.NET Framework 4.7.2`, ASP.NET MVC 5 + Web API 5 + SignalR, single solution. Entity Framework 6 Database-First against **SQL Server on AWS RDS** (host confirmed in `Web.config`) — confirms the Windows/SQL Server stack assumption from Mike/Steve. Business domains: resident billing, provider invoice processing, payables, tickets, meter data, reporting, plus heavy third-party integrations (Yardi, RealPage, Entrata, RentManager, BillCom, Forte, QuickBooks, Stripe). Calls out to the scraper/extractor services (other repos) over HTTP. 517 tracked files, 50 commits, sole author.

**Valiflo claims — verdicts:**
1. Live secrets committed to Git — **CONFIRMED, and this is the real one.** `Web.config` (tracked, never gitignored) has live-looking credentials in plaintext since its first commit: SQL Server passwords for 3 DB users, an **AWS access key + secret key**, an **OpenAI key**, plus SendGrid, Twilio, QuickBooks, Adobe PDF Services, Bill.com, Forte, Entrata, RentManager, RealPage, and a Stripe test-mode key. Values redacted, not printed. This is almost certainly the finding Valiflo was describing across "the six shared repos" — it's concentrated here.
2. Shared static API key used for auth — **CONFIRMED on the backend side.** A single hardcoded `ClientKey` app setting, unchanged since the first commit, is checked by two auth filters and is sufficient by itself on several endpoints (no per-user check required). Can't confirm from this repo alone whether the same value ships in the frontend bundle — that's a c4-frontend question.
3. Unauthenticated endpoints triggering costly external work — **CONFIRMED, worse than described.** `Controllers/HomeController.cs` has zero auth attributes anywhere, and default MVC routing makes every action reachable. Includes dozens of `Test*` actions that hit real OpenAI, Yardi, RealPage, Entrata, BillCom, Forte, RentManager APIs, send real emails, and one that creates a user at admin level 900. (No headless-browser calls live in this repo — that part of the claim maps to c4-scrape, already confirmed there.)
4. SSRF — **NOT CONFIRMED for this repo.** All third-party calls use fixed config-defined base URLs, not user input. One admin-only scheduled-job mechanism fetches a DB-stored URL, but writing that URL requires top-tier admin auth already — doesn't meet the bar for attacker-controlled SSRF.
5. Auth tokens base64'd in URLs — **CONFIRMED.** Plain `Convert.ToBase64String`/`FromBase64String`, no encryption/signing, used for: an unauthenticated login-redirect token in a query string, an unauthenticated invoice-render `accessKey` in a query string, and a similar pattern on a provider expense-report endpoint and account-setup links.
6. Live API config + `.gitignore` gap — **PARTIALLY CONFIRMED, different mechanism.** No `.env` exists (this is .NET, not Node) so the "`.env` / `.gitignore` only excludes `.local`" framing doesn't literally apply — but the underlying problem (live secrets committed, never excluded) is true via `Web.config`, which was never added to `.gitignore` at all.
7. Session cookies missing Secure/SameSite/HttpOnly — **REFUTED.** All three cookie-setting call sites explicitly set `Secure`, `HttpOnly`, and a `SameSite` value. `SameSite=None` on the login cookie is a permissive-but-spec-compliant choice (paired with `Secure=true`), not a missing flag.
8. Dependency files (~5,300) committed despite `.gitignore` — **REFUTED for this repo.** No `node_modules`/`bin`/`obj`/`packages` tracked; `.gitignore` correctly excludes build output. This claim applies elsewhere (confirmed on c4-scrape: 5,258 files).
9. Business logic in SQL stored procedures — **CONFIRMED.** 480 stored-proc-backed function imports across the EF models plus 129 direct proc calls in application code. The procs themselves live only in the RDS database, not as versioned files in git — meaning core business logic is effectively unversioned outside the live production database.

**Additional finding beyond Valiflo's list:** an IDOR on `FileAccessController.FinalBillImage` — no auth filter at all, so anyone who can guess/enumerate a `propertyID`/`finalBillID` pair can render another tenant's final bill PDF. Same access-key-in-URL family as #5.

**Net read on c4-backend:** this is where the severe, concrete parts of Valiflo's report land hardest — real committed AWS/OpenAI/payment-processor credentials sitting in `Web.config` since day one, a shared static key sufficient for API auth on some routes, genuinely unauthenticated endpoints that hit paid third-party APIs, base64-not-encrypted tokens in URLs, and now a same-family IDOR Valiflo didn't even mention. The stored-procedure architecture concern is also validated at real scale (480+ proc-backed functions). This repo alone justifies prioritizing a security-first phase of any engagement before touching new features.

**Process note:** the agent flagged that this environment's `rtk` shell-filtering hook silently truncated some `grep`/`git log -p` output during the scan (collapsing large diffs to "N lines omitted"), and routed around it via `rtk proxy <cmd>` to get complete output for the secret-scanning work. Worth keeping in mind for any future security-sensitive scans in this environment — truncated output could cause a real secret to be missed.

### c4-frontend — DONE

**What it does:** The primary product UI. Next.js 14 App Router, TypeScript, MUI, Redux Toolkit, ag-grid-enterprise, TinyMCE, Stripe.js, SignalR client. Covers the admin back-office (billing/invoicing, property/customer management, provider integrations, payables, collections, affiliate commissions) plus a resident-facing portal (bill pay via Stripe, billing history/statements) plus login/2FA/password-reset. History spans 2023-11-20 to 2026-05-11 (~2.5 years), single author (Kurt Sprinzl, two email spellings), nearly monthly commits, with the final session mid-refactor of auth/CSRF handling — confirms this as the primary, continuously-developed product surface, active right up until development stopped.

**Valiflo claims — verdicts:**
1. Live secrets committed to Git — **REFUTED.** Full 1135-commit history clean of DB/AWS/Stripe/SMTP secrets. Only hardcoded credential-like value is a TinyMCE (rich-text widget) client key — comparable to a Google Maps key, not a backend secret.
2. Shared API key bundled into the frontend — **CONFIRMED, and this closes the loop with c4-backend.** `apiUtils.js` sets `NEXT_PUBLIC_CONFIG_APIKEY` as a default header on every request. Being `NEXT_PUBLIC_`-prefixed, Next.js inlines the literal value into the client bundle — every visitor's browser gets it. This is the frontend half of the backend's static `ClientKey` finding: the key that alone satisfies some backend auth checks does in fact ship to every browser, exactly as Valiflo described.
3. Auth tokens in URLs, base64-encoded — **CONFIRMED, extensively.** `btoa(token)` appended as a `?token=` query param across a dozen files (bill images, file downloads, report exports, billing summaries, move-out logs, final bills). Same access-key-in-URL family as the backend's `RedirectController`/`FileAccessController` findings — confirmed on both ends of the same mechanism. One narrower piece of this (the login session token specifically) was mid-remediation in the final two weeks of commits, moved to an in-memory variable + CSRF header — but the file/report download links using `?token=` are still present at HEAD across ~12 files.
4. Client-side cookie handling — **PARTIALLY CONFIRMED.** Direct `document.cookie` read/write (inherently no HttpOnly) with no Secure/SameSite flags. At HEAD the remaining cookies are low-sensitivity (terms-acknowledge, language pref) — but git history shows the actual auth token previously lived in a JS-writable cookie until the same recent CSRF refactor moved it into memory/Redux (not persisted to localStorage).
5. Investor content gated client-side only — **NOT APPLICABLE.** No mention of "investor" anywhere in this repo's current tree or full history — this finding is isolated to `ubility-ai`, already confirmed there.
6. Tracked `.env` — **REFUTED.** Never committed across full history; `.gitignore` correctly excludes it.
7. ~5,300 dependency files committed — **REFUTED for this repo.** Zero `node_modules` ever committed here. This figure matches `c4-scrape` almost exactly (5,258 tracked files) — Valiflo's "6 shared repos" framing aggregated per-repo findings into one combined list; several of the specific numbers/claims map to exactly one repo rather than being spread across all six.

**Net read on c4-frontend:** clean on secrets and dependency bloat, but confirms the two most structurally important claims from the backend review — the shared static API key really does ship to every browser, and the base64-token-in-URL pattern is pervasive across a dozen download/report features, not an isolated case. Notably, the repo's own commit history shows the sole engineer was in the middle of fixing part of this (the CSRF/session-token piece) when development stopped — this wasn't necessarily unknown to them, it was in-progress.

---

## Cross-Repo Synthesis (all 6 repos reviewed)

**Confirmed, real, currently exploitable:**
- Live secrets in `c4-backend/Web.config` since first commit — SQL passwords, AWS key pair, OpenAI key, Twilio, SendGrid, QuickBooks, Bill.com, Forte, Stripe (test). Concentrated almost entirely in this one repo.
- Static shared API key (`ClientKey`) sufficient for backend auth on some routes, and confirmed shipped to every browser via `c4-frontend`'s `NEXT_PUBLIC_CONFIG_APIKEY`.
- Base64-not-encrypted auth/access tokens in URLs — pervasive across both `c4-backend` (redirect/invoice/report endpoints) and `c4-frontend` (a dozen file/report download features). Partially mid-remediation (session token specifically) when the engineer's work stopped.
- Unauthenticated endpoints triggering costly external work — confirmed in `c4-backend` (real third-party API calls incl. OpenAI), `c4-extract` (Claude calls, no rate limit), and `c4-scrape` (unlimited headless-Chromium jobs).
- SSRF — confirmed in `c4-extract` and `c4-scrape` (the latter with a real path to exfiltrating actual residents' utility-bill PDFs via an attacker-supplied logging endpoint). Not confirmed in `c4-backend`.
- ~5,300 tracked dependency files despite `.gitignore` — this is specifically `c4-scrape` (5,258 files), not spread across all six repos as the report's phrasing implied.
- Investor/financial data exposed via client-side-only gating — specifically `ubility-ai` (real ARR/burn/funding-ask figures shippped in the public JS bundle, trivially bypassable).
- IDOR (not in Valiflo's list): `c4-backend`'s `FinalBillImage` endpoint has no auth at all.
- Business logic in SQL stored procedures — confirmed at real scale in `c4-backend` (480+ proc-backed functions), unversioned outside the live RDS database.

**Refuted or not applicable, repo-by-repo:**
- `c4-marketing` and `ubility-ai` (despite its name, not an AI backend) are the two lowest-severity repos — no live secrets of consequence, no dependency bloat.
- Missing cookie flags claim — refuted for both `c4-backend` (all three flags set correctly) and mostly for `c4-frontend` at HEAD (low-sensitivity cookies only; the risky version was already being phased out).
- `c4-extract` and `c4-scrape` are both clean on committed secrets (unlike the implication that secrets were spread across "the six shared repos" generally).

**Overall picture:** Valiflo's report is directionally accurate but its "across the six shared repos" framing overstates the spread — most individual findings are concentrated in one or two specific repos rather than uniform across all six. The most severe, unambiguous issues (live cloud/payment credentials, unauthenticated cost-triggering endpoints, a real data-exfiltration path via SSRF, and exposed investor financials) are real and would need to be treated as urgent regardless of how any Keystone engagement is scoped. The stored-procedure/Windows-VM architecture concern is also validated, not just secondhand from Mike — but fixing that is a much larger, longer-horizon undertaking than the security items, which are individually small, fast fixes (rotate keys, add auth middleware, validate URLs, encrypt/remove tokens from URLs, fix `.gitignore`, purge git history).

## Next Steps
- [x] Open up README / package.json / stack info in each repo to confirm what they do
- [x] Independently verify each Valiflo claim per repo
- [ ] Decide what to bring to Steve first — the urgent security items (live secrets, exposed investor data, SSRF/exfil path) likely warrant a heads-up independent of the broader scoping conversation
- [ ] Map relationships between the six repos more precisely (confirmed: frontend + backend are the core; extract and scrape are backend-called services; ubility-ai and marketing are separate public sites)
- [ ] Figure out what engagement shape to propose (security-first remediation phase vs. full modernization vs. maintenance retainer) given Steve's stated interest in "someone on call" and/or "someone to add AI features and scale"

---

## Security Remediation Scope (response to Valiflo report)

*Rough scope for a dedicated security-fix phase, based on the confirmed findings above. Estimates assume one senior engineer with full production/cloud/repo access, working focused (not part-time/interrupted). Real elapsed time will run longer than raw effort because credential rotation and history rewrites depend on Steve/Mike for access and coordination, not just engineering time. Treat these as person-days of effort, not calendar days.*

### Phase 0 — Stop the bleeding (do first, before anything else)

These are live, exploitable right now and cheap to mitigate even as a stopgap.

| # | Item | Repo(s) | Est. |
|---|---|---|---|
| 1 | Rotate every credential found in `Web.config` — DB passwords, AWS key pair, OpenAI key, Twilio, SendGrid, QuickBooks, Bill.com, Forte, Stripe — and push the new values through whatever config path replaces plaintext `Web.config` (see Phase 2). Needs Steve/Mike for account access to each provider. | c4-backend | 1 day |
| 2 | Pull real financial figures (ARR, burn, funding ask, pipeline) off the public `ubility-ai` site as an immediate stopgap — either strip the hardcoded numbers from the JSX or take the two investor pages offline until a real server-gated version exists (Phase 2 item). | ubility-ai | 0.5 day |
| 3 | Remove `--allow-unauthenticated` from `c4-extract` and `c4-scrape` Cloud Run deploys and gate both behind a shared secret/IAM check as a stopgap (proper per-caller auth is a Phase 1 item). This alone kills the free-headless-browser and free-AI-call abuse paths. | c4-extract, c4-scrape | 0.5 day |

**Phase 0 subtotal: ~2 days**

### Phase 1 — Close the confirmed holes

| # | Item | Repo(s) | Est. |
|---|---|---|---|
| 4 | Design and implement real request-level auth for the backend API (replace reliance on the single static `ClientKey`, which is also the frontend's `NEXT_PUBLIC_CONFIG_APIKEY`) — likely per-user/service tokens issued at login, validated server-side. Touches `ApiAuthFilter`, `BaseRequestFilter`, and the frontend's `apiUtils.js` header logic. | c4-backend, c4-frontend | 4 days |
| 5 | Fix SSRF: add URL validation/allowlisting to `c4-extract`'s `SignedUrl` fetch and `c4-scrape`'s `/screenshot`, `/pdf`, and `loggingEndpoint` params (the last of these is the one with a real path to exfiltrating real customer bill PDFs — treat as the priority sub-item). | c4-extract, c4-scrape | 2 days |
| 6 | Replace the base64-token-in-URL pattern with signed/short-lived tokens or move auth to headers — spans `RedirectController`, `FileAccessController`, `ReportController` on the backend and ~12 download/report call sites on the frontend. Mechanical but touches a lot of surface area; needs regression testing on every affected download/report flow. | c4-backend, c4-frontend | 4 days |
| 7 | Fix the IDOR on `FileAccessController.FinalBillImage` — add an ownership/authorization check before rendering. | c4-backend | 0.5 day |
| 8 | Purge committed secrets and dead binaries from git history (`Web.config` history in c4-backend, `.env` history in c4-marketing, the ~55MB dead Chromium blobs in c4-scrape) via `git-filter-repo`/BFG, then coordinate a force-push + re-clone for Steve/Mike/anyone else with a local copy. This is disruptive (rewrites all commit SHAs) — needs explicit sign-off before doing it. | c4-backend, c4-marketing, c4-scrape | 1.5 days (incl. coordination) |
| 9 | Fix `.gitignore` gaps (backend never excluded `Web.config`, marketing excludes only `.env*.local` not `.env`) and remove the 5,258 committed `node_modules` files from c4-scrape going forward. | c4-backend, c4-marketing, c4-scrape | 1 day |

**Phase 1 subtotal: ~13 days**

### Phase 2 — Proper fixes (beyond the stopgaps)

| # | Item | Repo(s) | Est. |
|---|---|---|---|
| 10 | Move all secrets out of `Web.config`/`.env` into a real secrets manager (AWS Secrets Manager, given the stack is already on AWS) and wire the app to read from it at startup instead of plaintext config. | c4-backend, c4-marketing | 2.5 days |
| 11 | Rebuild the `ubility-ai` investor pages as a real server-verified protected route — fetch confidential content from an authenticated endpoint post-login instead of statically bundling it into the public JS. | ubility-ai | 1.5 days |
| 12 | Replace the Phase-0 shared-secret stopgap on c4-extract/c4-scrape with proper per-caller auth consistent with whatever pattern comes out of item #4, and add basic rate limiting given both trigger real paid/costly work per call. | c4-extract, c4-scrape | 1.5 days |
| 13 | Remove or auth-gate the unauthenticated `Test*` diagnostic actions in `HomeController` that hit real third-party paid APIs and can create users. | c4-backend | 1 day |
| 14 | Finish the cookie-flag/session cleanup the sole engineer was mid-way through (CSRF refactor) — confirm no sensitive tokens remain in JS-writable cookies anywhere in the frontend. | c4-frontend | 0.5 day |

**Phase 2 subtotal: ~7 days**

### Rollup

- **Phase 0 (stop the bleeding):** ~2 days
- **Phase 1 (close confirmed holes):** ~13 days
- **Phase 2 (proper fixes):** ~7 days
- **Total: ~22 person-days (~4–5 weeks)** for one senior engineer, assuming no major surprises once inside the live infra and prompt turnaround from Steve/Mike on access and provider-rotation approvals.

**Explicitly out of scope here:** the stored-procedure/Windows-VM architecture question and the "no tests, no CI" gap Valiflo also flagged. Those are real but much larger, longer-horizon efforts (re-architecture, not remediation) and shouldn't be bundled into a security-fix estimate — worth scoping separately once there's a decision on whether Keystone's engagement is remediation-only or extends into modernization.

**Caveats on the estimate:** this was built from static code/history review only, not a live walkthrough of production — actual credential rotation may surface dependencies not visible in the repos (e.g., other systems relying on the same static `ClientKey`), and the git-history-rewrite item in particular can't be scheduled until Steve/Mike confirm no one else has an active local clone that would be orphaned by the force-push.

### Pricing Recommendation

Split into two quotes rather than one combined number:

- **Phase 0 ("stop the bleeding"): flat $4,000–5,000, delivered within the week.** Priced for speed and trust rather than day-rate math — the value being sold is "your live secrets and your investor financials are exposed right now," and closing that out fast is the point of this quote. This is the piece that earns the rest of the relationship.
- **Phase 1+2 (the remaining ~20 days): flat $30,000–35,000.** Works out to roughly $1,500–1,750/day-equivalent, below typical enterprise security-consulting day rates ($2,500–5,000+) but appropriate given this is a small, personally-referred client where the goal is to be the opening chapter of a longer relationship, not a one-off extraction. Deliver as a named list of what got fixed — matches the "concrete deliverable, not a feeling" positioning, and doubles as something Steve could show Residence Billing to counter the Valiflo report if he wants to.

Leave the retainer/AI-features conversation (see below) out of this quote entirely — land the security fix first, then have that conversation separately once trust is established.

**Open question before finalizing a number:** whether Residence Billing might co-fund this, since they're the party with the actual economic interest in Ubility surviving the merger evaluation. Ubility itself is small (~$204K ARR per the investor-deck figures found in `ubility-ai`) — worth asking Steve directly rather than assuming Ubility alone is footing the bill.

---

## Ongoing Engagement Proposals (Maintenance & Feature Development)

Steve has floated two directions for what comes after the security fix: (1) someone available for maintenance/on-call, or (2) someone to keep building — new features, AI capabilities, scaling the platform. These don't have to be mutually exclusive, but they're priced and scoped as two separate tiers below. Draft proposal language lives in `docs/projects/ubility-ongoing-proposal.md` (written in Keystone's voice, since this one might actually go to Steve as-is). Summary and reasoning here:

**Context for the number:** Steve mentioned a competing quote from Blue Step (bluestep.net) — if Ubility hosted with them, they'd bundle in a dedicated full-time junior/new-grad engineer for $6,000/month. Not using that as a pricing anchor directly (different model entirely: full-time junior headcount + hosting lock-in, versus fractional senior time with no infrastructure strings attached), but it's the real alternative Steve is weighing, so the proposal addresses it directly rather than pretending it doesn't exist.

**Maintenance & Support Retainer — $5,500/month.** ~15–20 hours/month of reserved senior time plus an on-call SLA for production-impacting issues. For a "just keep it stable" ask with no new feature commitments.

**Feature Development Retainer — $12,000/month (~10 hrs/week) or $18,000/month (~15 hrs/week).** Both tiers work out to roughly $275–280/hr effective, consistent across tiers rather than a volume discount. Structured as a committed monthly scope of work rather than dedicated calendar days, since this gets worked nights/mornings around the founder's existing schedule, with a weekly status check-in instead of a day-of-week commitment. Ongoing maintenance/on-call coverage is folded into this tier rather than sold separately, since the embedded work already covers it. This is the tier that includes AI-capability work and the incremental architecture changes (e.g., moving logic out of stored procedures where it actually matters) that Steve has mentioned wanting.

Both: 3-month minimum initial term, month-to-month after that, 30 days notice to cancel, monthly written summary of what got done.