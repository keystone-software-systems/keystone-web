# Ubility: Engineering Engagement Proposal

*Master proposal draft. Internal working version. Written in Keystone's voice so the client-facing
sections can be lifted mostly as-is, but this file also carries staging notes and open decisions that
should not go to Steve. Client-facing text is in the numbered sections; anything in a "Note (internal)"
block stays here.*

*Recommended delivery: send the security remediation as its own quote first (Section 2), land it, then
open the ongoing conversation (Section 3) once there is a track record. The doc is structured so Section 2
lifts out cleanly on its own.*

---

## 1. How I'd suggest proceeding

Ubility has two separate needs, and it's cleaner to treat them as two separate decisions rather than one
big number.

The first is immediate and not really optional: a set of security issues in the current system that are
worth closing regardless of what direction you take the platform. This is scoped and priced as a fixed
piece of work in Section 2.

The second is ongoing: who is responsible for this codebase now that there is no engineer on staff. That
splits into two options depending on whether the priority is stability or continued building. Both are in
Section 3.

You can act on the first without committing to the second. The security work stands on its own, and it's
the right place to start.

> **Note (internal):** the two-decisions framing is deliberate. It lets Steve say yes to the smaller,
> urgent thing without feeling like he's signing up for a retainer, and it earns the ongoing conversation
> instead of front-loading it. Do not bundle these into one combined price when this goes out.

---

## 2. Security remediation (immediate)

A recent third-party review, plus my own pass over the six repositories, surfaced a set of security issues
in the current system. Some are live and worth closing quickly. This section is scoped so it can start
this week and be delivered as a concrete, itemized list of what was fixed.

### 2a. Stop the bleeding (first, on its own if you prefer)

The handful of issues that are exposed right now and cheap to close as a first pass:

- **Rotate the credentials sitting in the codebase.** Passwords and API keys are currently stored in plain
  text where they shouldn't be. Rotate them and put the new ones somewhere safe.
- **Take real financial figures off a public-facing site.** Some sensitive numbers are visible on a public
  page today. Pull them down as an immediate stopgap.
- **Close the endpoints anyone can trigger.** A couple of entry points can be hit by anyone on the internet
  and run up cost. Lock them behind a basic check.

- **Scope:** the immediate-exposure items above
- **Timing:** delivered within the week
- **Price:** $4,500 flat

### 2b. Full remediation

The complete set of confirmed findings, delivered as a named checklist of what was fixed:

- **Real login-based access control on the API.** Today a single shared key, which also ships to every
  visitor's browser, is enough to reach parts of the system. Replace it with proper per-user access.
- **Lock down the endpoints anyone can call.** Beyond the quick stopgap above, put real access control on
  the entry points that trigger paid third-party work or send email.
- **Stop the server fetching untrusted web addresses.** One version of this could be used to reach real
  customer bill data. Restrict what the server is allowed to fetch.
- **Get access tokens out of web addresses.** Login and file-access tokens currently ride in the URL, where
  they leak into logs and browser history. Move them somewhere they can't be lifted.
- **Fix the bill-image access gap.** A bill-download link can currently be guessed to view another
  resident's bill. Add an ownership check.
- **Move all secrets into proper secret management,** and scrub the old ones out of the code history so they
  can't be recovered.
- **Rebuild the investor page's access control on the server,** so confidential figures aren't sent to
  every visitor and simply hidden in the browser.
- **Clean up the repositories:** remove committed dependency files and dead binaries, and fix the settings
  that let secrets get committed in the first place.

- **Scope:** all confirmed findings from the review
- **Timing:** roughly four to five weeks of focused work, dependent on timely access and approvals from
  your side for credential rotation
- **Price:** $32,000 flat, or $35,000 including 2a if done as one engagement

> **Note (internal):**
> - Numbers are from the Phase 0 / Phase 1+2 estimate in `ubility.md` (~22 person-days total). Confirm the
>   final figures before this goes out; the ranges in that doc were $4–5k and $30–35k, I've picked
>   $4,500 / $32,000 as the single numbers to quote.
> - The itemized fix list doubles as something Steve can point to as concrete proof of what was closed out,
>   in contrast to the Valiflo report. Worth mentioning to him verbally, not in the doc.
> - Do not promise a warranty or support window on the fixes (per repo copy guardrails, that decision
>   isn't made). "Delivered as a named list of what was fixed" is the sanctioned framing.
> - Deliberately excludes the stored-procedure / Windows-VM re-architecture. That's modernization, not
>   remediation, and belongs in Section 3's development track or a separate scope.

---

## 3. Ongoing options (after remediation)

Once the security work is done, the open question is who owns this codebase going forward. Two options,
priced separately, not mutually exclusive. Pick based on what Ubility needs next, not on which one is
larger.

### Option A: Maintenance & Support Retainer

For keeping the platform stable and responsive without committing to a development roadmap.

- Reserved senior engineering time each month for maintenance and incident response
- On-call coverage for production-impacting issues
- Ongoing security hygiene: dependency checks, credential rotation, monitoring for the class of issues
  found in the review
- A regular check-in to review anything addressed and flag what to keep an eye on

**For:** bug fixes, incident response, keeping the lights on. Not new features.

**Price:** $8,000/month.

### Option B: Feature Development & AI Capabilities Retainer

For continuing to build: new features, AI-assisted invoice and billing capabilities, and the incremental
architecture changes that make the platform easier to scale over time (for example, moving business logic
out of SQL stored procedures where it's currently hardest to maintain and test).

- A committed monthly scope of work, agreed up front and reviewed as we go, rather than billed by the hour
- Maintenance and on-call coverage folded in at no extra charge, since the work is already embedded in the
  codebase week to week
- A weekly working meeting to go over what was built or shipped that week and line up the next priorities

**Price:**
- Standard: $12,000/month, a steady cadence of fixes, improvements, and new feature work
- Expanded: $18,000/month, a faster build cadence for when there's more to ship

### On the Blue Step quote

You mentioned Blue Step offered a dedicated junior, new-grad engineer for $6,000/month if Ubility hosted
with them. Worth addressing directly.

That's a different kind of offer: full-time headcount, bundled with moving your hosting to their platform.
It can make sense if what Ubility needs is someone to close tickets at volume and the hosting move is
acceptable. What it doesn't include is the judgment call that matters most for a codebase like this one:
knowing which shortcuts are safe and which ones turn into an outage or a lost customer six months later.
That's the same gap the security review surfaced, and a junior working full-time doesn't substitute for it
regardless of how much time is put in.

The retainers above cost well under a full-time hire, with no hosting change required. The tradeoff is time
in seat versus experience applied to the decisions that are expensive to get wrong.

---

## 4. Terms

### Security remediation (Section 2)

- **Deposit:** 40% due on signing to schedule the work
- **Balance:** for 2a alone, remaining 60% on delivery. For full remediation, structured as 40% on start /
  40% at an agreed midpoint / 20% on completion
- **Cancellation:** if cancelled mid-engagement, the current milestone is owed for work performed
- **Deliverable:** an itemized list of what was fixed, verified against the findings
- **Access:** credential rotation and history cleanup depend on timely access and approvals from your side.
  Elapsed time assumes prompt turnaround on those

### Retainers (Section 3)

- **Billing:** invoiced monthly, in advance, due at the start of each service month
- **Term:** 3-month minimum initial term, month-to-month after that
- **Notice:** 30 days to cancel after the initial term
- **Scope changes:** work beyond the agreed monthly scope is handled by agreeing on the next block of work
  up front, not billed piecemeal
- **Review:** a weekly working meeting to go over what was built or shipped and set the next priorities

### Both

- **Payment:** due on receipt. Net terms available by agreement
- **IP and handoff:** all deliverables and associated IP assigned to Ubility on full payment. Handoff is the
  default; nothing here creates a lock-in

> **Note (internal):**
> - Do not open with Net 30. "Due on receipt, net terms by agreement" keeps Net 30 as a concession you give
>   if he asks, not your default. For the retainer specifically, billing in advance is the point; hold that
>   line.
> - Deposit on the security work filters for a serious client and protects you from doing a multi-week flat
>   project fully in arrears.
> - No hour counts or hourly overage anywhere client-facing, by design. Tanner is selling committed
>   outcomes and is not reporting time. Scope creep is handled by agreeing the next block of work, not an
>   hourly true-up. The weekly meeting is the accountability mechanism in place of a timesheet or written
>   report: it shows progress through what shipped, not hours logged.
> - Levers to give if he pushes on price, in order of preference: smaller deposit, longer term commitment
>   (6 or 12 months) for a modest discount, bundling 2a into full remediation. Avoid reintroducing any
>   hours- or day-rate framing to justify a discount.

---

## 5. Open decisions before this goes out

- [ ] Lock final numbers for 2a / full remediation (currently $4,500 / $32,000)
- [ ] Decide staging: security quote first, or the whole thing at once (recommendation: security first)
- [ ] Confirm there's no warranty/support-window language anywhere before sending (guardrail)

---

## 6. Next step

Let's talk through which of these fits where Ubility is headed. The security work can start on its own this
week; the ongoing question can wait until that's underway.
