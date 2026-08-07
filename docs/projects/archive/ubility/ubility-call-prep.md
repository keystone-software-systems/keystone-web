# Ubility — Call Prep: "What major system things need to improve"

*Talking points for the team call. Not client-facing copy — full detail and reasoning lives in
`ubility.md` (papertrail), `ubility-architecture.md` (system map), and
`ubility-ongoing-proposal.md` (draft retainer proposal).*

---

## The one-sentence framing

Security first, architecture second. Security is real but individually small and fast to fix.
The stored-procedure/monolith architecture is the actual "can this scale" question, and it's a
re-architecture, not a remediation — separate conversation, separate timeline.

---

## Major system-level issues (the architecture conversation)

1. **Business logic lives in SQL stored procedures, not in code.** 480+ proc-backed functions in
   `c4-backend`, confirmed at real scale by reading the repo, not just secondhand from Mike. This
   logic is unversioned outside the live production database — no git history, no code review, no
   meaningful unit testing possible. This is the single biggest thing blocking "scale this
   platform" as a goal.

2. **Single monolithic .NET Framework 4.7.2 app on a Windows VM (EC2) + one SQL Server instance
   (RDS), no horizontal scaling path.** Everything (`c4-frontend`, `c4-scrape`, `c4-extract`)
   funnels through this one backend. There's no story for scaling it out as-is — it's one box,
   one DB.

3. **No tests, no CI, across all six repos.** Combined with #1, core business logic can't really
   be tested at all, and there's no pipeline to catch regressions.

4. **Bus factor was already 1, and that person passed away.** The whole system (2.5 years of
   continuous development in `c4-frontend`, the entire backend) was built and maintained by a
   single engineer. Nothing is documented beyond what's in the code itself.

---

## Security (the urgent, faster-to-fix bucket)

Independently verified Valiflo's audit per-repo rather than taking it at face value — directionally
right, but overstated how spread out the issues were (most concentrate in one or two repos, not
uniformly across all six).

### From Valiflo's report

1. **Live secrets committed to Git** — CONFIRMED, concentrated almost entirely in
   `c4-backend/Web.config`: SQL Server passwords, an AWS key pair, an OpenAI key, plus Stripe,
   Twilio, SendGrid, QuickBooks, Bill.com, Forte, Entrata, RentManager, RealPage — live since the
   first commit. Partially confirmed in `c4-marketing` (a real-looking API key in a committed
   `.env`, but paired with a localhost address, so likely a dev-only value). Refuted (clean
   history) in `c4-extract`, `c4-scrape`, `ubility-ai`, `c4-frontend`.
2. **API auth relies on a shared key shipped to the browser** — CONFIRMED. Backend's static
   `ClientKey` is sufficient auth by itself on some routes, and it ships to every visitor's browser
   via `c4-frontend`'s `NEXT_PUBLIC_CONFIG_APIKEY`.
3. **Public endpoints trigger costly external work with no auth** — CONFIRMED in three repos:
   `c4-backend` (real third-party API calls including OpenAI, plus a `Test*` action that can
   create an admin-level user), `c4-extract` (unmetered Claude calls per request), `c4-scrape`
   (unlimited headless-Chromium jobs via a single `curl`).
4. **Server fetches attacker-supplied URLs (SSRF)** — CONFIRMED in `c4-extract` and `c4-scrape`.
   The `c4-scrape` case is the serious one: an attacker-supplied logging endpoint gets the actual
   downloaded customer utility-bill PDF posted to it — a real exfiltration path, not just a
   theoretical one. Not confirmed in `c4-backend` (only fixed, config-defined URLs are used there).
5. **Auth tokens passed in URLs, base64-encoded** — CONFIRMED, extensively, in both `c4-backend`
   (redirect/invoice/report endpoints) and `c4-frontend` (~12 download/report call sites). The
   login-session-token piece specifically was mid-remediation (moved to memory + CSRF header) in
   the engineer's final two weeks of commits before work stopped.
6. **Live API config committed to Git (`.env`)** — CONFIRMED, mechanism varies by stack:
   `c4-marketing`'s `.env` is tracked and `.gitignore` only excludes `.env*.local`, not plain
   `.env`. `c4-backend` has no `.env` (it's .NET) but the equivalent — `Web.config` — was never
   gitignored either, same underlying problem. Refuted for `c4-extract`, `c4-scrape`, `ubility-ai`,
   `c4-frontend`.
7. **Session cookies missing Secure/SameSite/HttpOnly** — REFUTED for `c4-backend` (all three
   flags set correctly on every cookie). Mostly refuted for `c4-frontend` at HEAD too — remaining
   cookies are low-sensitivity; the one that mattered (auth token in a JS-writable cookie) was
   already being phased out in the engineer's last commits.
8. **Investor-only content gated client-side only** — CONFIRMED, and serious, in `ubility-ai`.
   Real ARR, burn rate, funding ask, and pipeline figures ship in the public JS bundle; the "gate"
   is a `sessionStorage` boolean, no server-side check at all. A prior attempt to remove the
   numbers ("Removed ARR from UMS") only pulled the top-of-page stat block — deeper figures are
   still present.
9. **~5,300 dependency files (`node_modules`) committed to Git** — CONFIRMED, but specifically
   `c4-scrape` (5,258 files) — not spread across all six repos as the report's phrasing implied.
   Refuted elsewhere.

### Additional findings we surfaced (not in Valiflo's report)

1. **IDOR on `c4-backend`'s `FileAccessController.FinalBillImage`** — zero auth filter at all;
   anyone who can guess or enumerate a `propertyID`/`finalBillID` pair can render another tenant's
   final bill PDF. Same access-key-in-URL family as item #5 above, just missing the check
   entirely rather than using a weak one.

**Scope/cost if it comes up:** ~22 person-days total across three phases (stop-the-bleeding ~2
days, close confirmed holes ~13 days, proper fixes ~7 days). Priced as two quotes: Phase 0 flat
$4,000–5,000 delivered within the week; Phase 1+2 flat $30,000–35,000. Full phase breakdown in
`ubility.md`.

---

## How to frame it on the call

- Lead with security, since it's urgent and independent of any bigger decision — the live
  credentials and exposed investor financials warrant a heads-up regardless of how the broader
  engagement shapes up.
- Position the stored-procedure/scaling question as the real strategic conversation. If Steve
  wants to scale this platform, that's not a quick fix — it's a multi-month modernization, likely
  paired with a feature-development retainer rather than a one-time project.
- Two ongoing-support options are already drafted (`ubility-ongoing-proposal.md`): a
  maintenance/on-call retainer ($5,500/mo) vs. a feature-development retainer ($12k–$18k/mo) that
  includes the stored-procedure migration work. Don't conflate these with the security quote —
  keep that conversation separate until trust is established from the security fix.
- Open questions worth asking the team directly rather than assuming: what actually triggers a
  scrape job, whether anything besides the backend calls `c4-extract`, and whether there are other
  consumers of the backend API not visible in these six repos (mobile app, partner integration).
