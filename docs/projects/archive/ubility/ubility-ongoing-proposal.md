# Ubility: Ongoing Engineering Support Options

*Draft proposal, written for Steve. Two paths, priced separately, not mutually exclusive.*

---

## The situation

Once the security remediation work is done, Ubility needs an ongoing answer to a question that doesn't go away: who is responsible for this codebase now that there's no engineer on staff. Two different answers fit two different goals. If the priority is stability, that's a maintenance retainer. If the priority is building, including the AI capabilities and scale you've mentioned wanting, that's a development retainer. Both are described below so you can pick based on what Ubility actually needs next, not based on which one sounds bigger.

---

## Option A: Maintenance & Support Retainer

For keeping the platform stable and responsive without committing to a development roadmap.

**What's included:**
- 15 to 20 hours per month of reserved senior engineering time
- On-call coverage for production-impacting issues
- Ongoing security hygiene: dependency checks, credential rotation reminders, monitoring for the class of issues found in the recent security review
- A short written summary each month of what was fixed or checked

**What it's for:** bug fixes, incident response, keeping the lights on. Not new features.

**Price:** $5,500/month.

---

## Option B: Feature Development & AI Capabilities Retainer

For continuing to build: new features, AI-assisted invoice processing and billing capabilities, and the incremental architecture changes that make the platform easier to scale over time (for example, moving business logic out of SQL stored procedures where it's currently hardest to maintain and test).

**What's included:**
- A committed monthly scope of work, agreed upfront rather than billed by the hour, sized to roughly 10 to 15 hours a week depending on tier
- Maintenance and on-call coverage folded in at no extra charge, since the work is already embedded in the codebase week to week
- A weekly check-in on status and priorities
- A written summary each month of what shipped

**Pricing:**
- Standard scope (~10 hrs/week): $12,000/month
- Expanded scope (~15 hrs/week): $18,000/month

---

## On the Blue Step quote

You mentioned Blue Step (bluestep.net) offered a dedicated junior, new-grad engineer for $6,000/month if Ubility hosted with them. Worth addressing directly rather than ignoring it.

That's a different kind of offer: full-time headcount, bundled with moving your hosting to their platform. It can make sense if what Ubility needs is someone to close tickets at volume and the hosting move is acceptable. What it doesn't include is the judgment call that matters most for a codebase like this one: knowing which shortcuts are safe to take and which ones turn into an outage or a lost customer six months later. That's the same gap the recent security review surfaced, and it's not something junior, full-time hours substitute for regardless of how many of them there are.

The retainers above are priced for fewer hours than a full-time hire and no hosting change is required. The tradeoff is time in seat versus experience applied to the decisions that are expensive to get wrong.

---

## Terms (both options)

- 3-month minimum initial term, month-to-month after that
- 30 days notice to cancel
- Invoiced monthly
- Either option can start after the security remediation work is complete, or run alongside it if timing matters

---

## Next step

Let's talk through which of these fits where Ubility is headed, and whether Residence Billing has a stake in funding either one given their interest in Ubility staying on as their billing platform.
