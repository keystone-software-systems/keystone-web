# Ubility: Engineering Engagement Options

Prepared for Steve Chidester

---

## Two decisions, not one

There are really two separate things to decide here, and it's cleaner to treat them apart rather than as
one number.

The first is immediate: a set of security issues in the current system that are worth closing regardless of
what direction you take the platform. That work is scoped and priced below.

The second is ongoing: who is responsible for this codebase going forward. That comes down to whether the
priority is keeping things stable or continuing to build. Both options are laid out below.

You can act on the first without committing to the second. The security work stands on its own, and it's
the right place to start.

---

## 1. Security remediation

A recent third-party review, plus my own pass over the codebase, surfaced a set of security issues. Some
are exposed right now and worth closing quickly. Everything here is delivered as a named checklist of what
was fixed, so you have a concrete record of what changed.

### Stop the bleeding

The issues that are exposed right now and quick to close as a first pass:

- **Rotate the credentials sitting in the codebase.** Passwords and API keys are currently stored in plain
  text where they shouldn't be. Rotate them and move the new ones somewhere safe.
- **Take real financial figures off a public page.** Some sensitive numbers are visible on a public-facing
  site today. Pull them down as an immediate stopgap.
- **Close the endpoints anyone can trigger.** A couple of entry points can be hit by anyone on the internet
  and run up cost. Put a basic check in front of them.

**Delivered within the week. $4,500 flat.**

### Full remediation

The complete set of confirmed findings:

- **Real login-based access control on the API.** Today a single shared key, which also ships to every
  visitor's browser, is enough to reach parts of the system. Replace it with proper per-user access.
- **Lock down the endpoints anyone can call,** including diagnostic ones that trigger paid third-party work
  or can create an administrator account.
- **Stop the server fetching untrusted web addresses.** One version of this could be used to reach real
  customer bill data. Restrict what the server is allowed to fetch.
- **Get access tokens out of web addresses.** Login and file-access tokens currently ride in the URL, where
  they leak into logs and browser history. Move them somewhere they can't be lifted.
- **Fix the bill-image access gap.** A bill link can currently be guessed to view another resident's bill.
  Add an ownership check.
- **Move all secrets into proper secret management,** and clear the old ones out of the code history so they
  can't be recovered.
- **Rebuild the investor page's access control on the server,** so confidential figures aren't sent to every
  visitor and simply hidden in the browser.
- **Clean up the repositories:** remove committed dependency files and dead binaries, and fix the settings
  that let secrets get committed in the first place.

**Roughly four to five weeks. $32,000 flat, or $35,000 including the stop-the-bleeding items above as one
engagement.**

### A third way: split it with the retainer

If you're planning to move onto ongoing development anyway, the security work can be split: the urgent
closures done now as a smaller flat engagement, and the remaining hardening folded into the first month of
a development retainer instead of the flat fee.

- **Urgent closure now (real API access, the server-fetch and token fixes, the bill-image fix, and history
  cleanup): ~$22,000 flat.**
- The remaining items (secret management, the investor-page rebuild, and the final cleanup) handled in month
  one of the retainer below.

This keeps the upfront number smaller and starts the ongoing relationship sooner.

---

## 2. Ongoing support

Once the security work is underway, the open question is who owns this codebase now. Two options, priced
separately. Pick based on what Ubility needs next.

### Maintenance & Support — $5,500/month

For keeping the platform stable and responsive without committing to a development roadmap.

- Reserved senior engineering time each month for maintenance and incident response
- On-call coverage for production-impacting issues
- Ongoing security hygiene: dependency checks, credential rotation, monitoring for the class of issues found
  in the review
- A regular check-in to review anything addressed and flag what to keep an eye on

For bug fixes, incident response, and keeping the lights on. Not new features.

### Feature Development & AI — $18,000/month

For continuing to build: new features, AI-assisted invoice and billing capabilities, and the incremental
architecture changes that make the platform easier to scale over time, for example moving business logic
out of the database stored procedures where it's currently hardest to maintain and test.

- A committed monthly scope of work, agreed up front and reviewed as we go
- Maintenance and on-call coverage folded in at no extra charge
- A weekly working meeting to go over what was built or shipped that week and line up the next priorities
- If we take the split approach above, month one begins by finishing the remaining security hardening before
  moving to features

---

## On the Blue Step quote

You mentioned Blue Step offered a dedicated junior engineer for $6,000/month if Ubility hosted with them.
Worth addressing directly.

That's a different kind of offer: full-time headcount, bundled with moving your hosting to their platform.
It can make sense if what Ubility needs is someone to close tickets at volume and the hosting move is
acceptable. What it doesn't include is the judgment that matters most for a codebase like this one: knowing
which shortcuts are safe and which ones turn into an outage or a lost customer six months later. That's the
same gap the security review surfaced, and a junior working full-time doesn't substitute for it regardless
of how much time is put in.

The options above cost well under a full-time hire, with no hosting change required. The tradeoff is time in
seat versus experience applied to the decisions that are expensive to get wrong.

---

## Terms

**Security remediation**
- 40% due on signing to schedule the work, the balance on delivery (or across agreed milestones for the full
  engagement)
- Delivered as an itemized list of what was fixed, verified against the findings
- Credential rotation and history cleanup depend on timely access and approvals from your side

**Retainers**
- Invoiced monthly, in advance
- Three-month minimum initial term, month-to-month after that, 30 days notice to cancel
- Work beyond the agreed monthly scope is handled by agreeing on the next block of work up front
- A weekly working meeting in place of time tracking or written reports

**Both**
- Payment due on receipt
- All deliverables and associated IP assigned to Ubility on full payment. Handoff is the default; nothing
  here creates a lock-in

---

## Next step

Let's talk through which of these fits where Ubility is headed. The security work can start on its own this
week; the ongoing question can wait until that's underway.
