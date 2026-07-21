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

The handful of issues that are exposed right now and cheap to close as a first pass: rotating credentials
that are currently sitting in the codebase, taking real financial figures off a public-facing site, and
closing a couple of endpoints that can currently be triggered by anyone.

- **Scope:** the immediate-exposure items only
- **Timing:** delivered within the week
- **Price:** $4,500 flat

### 2b. Full remediation

The complete set of confirmed findings: request-level authentication on the API, fixing the
server-side-request issues (including one path that could expose real customer bill data), moving access
tokens out of URLs, an access-control fix on bill images, purging committed secrets from history, and
moving secrets into proper secret management.

- **Scope:** all confirmed findings from the review, delivered as a named checklist of what was fixed
- **Timing:** roughly four to five weeks of focused work, dependent on timely access and approvals from
  your side for credential rotation
- **Price:** $32,000 flat, or $35,000 including 2a if done as one engagement

> **Note (internal):**
> - Numbers are from the Phase 0 / Phase 1+2 estimate in `ubility.md` (~22 person-days total). Confirm the
>   final figures before this goes out; the ranges in that doc were $4–5k and $30–35k, I've picked
>   $4,500 / $32,000 as the single numbers to quote.
> - The itemized fix list doubles as something Steve can show Residence Billing to counter the Valiflo
>   report. Worth mentioning to him verbally, not in the doc.
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

- 15 to 20 hours per month of reserved senior engineering time
- On-call coverage for production-impacting issues
- Ongoing security hygiene: dependency checks, credential rotation, monitoring for the class of issues
  found in the review
- A short written summary each month of what was fixed or checked

**For:** bug fixes, incident response, keeping the lights on. Not new features.

**Price:** $5,500/month.

### Option B: Feature Development & AI Capabilities Retainer

For continuing to build: new features, AI-assisted invoice and billing capabilities, and the incremental
architecture changes that make the platform easier to scale over time (for example, moving business logic
out of SQL stored procedures where it's currently hardest to maintain and test).

- A committed monthly scope of work, agreed upfront rather than billed by the hour, sized to roughly 10 to
  15 hours a week depending on tier
- Maintenance and on-call coverage folded in at no extra charge, since the work is already embedded in the
  codebase week to week
- A weekly check-in on status and priorities
- A written summary each month of what shipped

**Price:**
- Standard scope (~10 hrs/week): $12,000/month
- Expanded scope (~15 hrs/week): $18,000/month

### On the Blue Step quote

You mentioned Blue Step offered a dedicated junior, new-grad engineer for $6,000/month if Ubility hosted
with them. Worth addressing directly.

That's a different kind of offer: full-time headcount, bundled with moving your hosting to their platform.
It can make sense if what Ubility needs is someone to close tickets at volume and the hosting move is
acceptable. What it doesn't include is the judgment call that matters most for a codebase like this one:
knowing which shortcuts are safe and which ones turn into an outage or a lost customer six months later.
That's the same gap the security review surfaced, and full-time junior hours don't substitute for it
regardless of how many of them there are.

The retainers above are priced for fewer hours than a full-time hire, with no hosting change required. The
tradeoff is time in seat versus experience applied to the decisions that are expensive to get wrong.

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
- **Out-of-scope work:** anything beyond the agreed monthly scope, or outside a fixed project's boundary,
  billed at $275/hour by prior agreement
- **Summary:** a written monthly summary of what was done

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
> - $275/hr overage is consistent with the effective rate on the development retainer in `ubility.md`. It
>   exists to protect the flat pricing, not as a profit center.
> - Levers to give if he pushes on price, in order of preference: smaller deposit, longer term commitment
>   (6 or 12 months) for a modest discount, bundling 2a into full remediation. Avoid visibly cutting the
>   day-rate math.

---

## 5. Open decisions before this goes out

- [ ] Lock final numbers for 2a / full remediation (currently $4,500 / $32,000)
- [ ] Decide staging: security quote first, or the whole thing at once (recommendation: security first)
- [ ] Whether to raise Residence Billing co-funding with Steve, given their stake in Ubility surviving the
      merger review. Suggest raising verbally, not in the written proposal
- [ ] Confirm there's no warranty/support-window language anywhere before sending (guardrail)

---

## 6. Next step

Let's talk through which of these fits where Ubility is headed. The security work can start on its own this
week; the ongoing question can wait until that's underway.
