# Ubility: Security Remediation Proposal

*Draft proposal, written for Steve. Covers the security fix only, not ongoing maintenance or
feature development, those are a separate conversation once this is done.*

---

## The situation

The recent security review of the six Ubility repositories turned up a set of real, currently
exploitable issues: live production credentials sitting in git history, an API auth model that
amounts to a key shipped to every browser, a path to pulling real customer utility bills through
an unvalidated server-side request, and investor financial figures exposed in a public bundle with
no real access check behind them.

None of this reflects poorly on the work that's been done. It reflects the reality of a platform
built and maintained by one engineer with no second set of eyes and no time carved out for this
kind of hardening. The goal here is to close these specific issues, in order of urgency, and hand
back a named list of exactly what changed.

The original review also called out that the repos are "functional but under-documented,
untested, and have no CI in place." We're not building a full automated test suite as part of
this engagement, that's a much larger, longer-horizon effort and there isn't an existing suite to
build on. But going into production changes with zero safety net at all isn't acceptable either,
especially with two engineers working in parallel against a codebase neither of us built. So we're
including a minimal CI pipeline that verifies the application builds cleanly on every change,
nothing more. It won't catch logic bugs, but it will catch broken builds before they reach
production, which is the immediate risk given there's no staging environment and no other check in
place today.

We're also producing real system architecture documentation as part of this engagement, directly
answering the "under-documented" half of that same finding. Right now the only accurate picture of
how these six repos fit together lives in the code itself and in what's left of the prior
engineer's knowledge. A confirmed architecture document means that picture survives the next
transition, whoever's doing the maintenance six months from now doesn't have to reverse-engineer
it from scratch the way we had to.

This work is staffed by two senior engineers, not one, so the single-point-of-failure problem that
led to this review doesn't repeat itself on our side.

**Timeline: Phase 0 and Phase 1 complete by August 14. Phase 2 wraps up by September 7, paced
around a pre-planned vacation August 15-24.**

---

## Approach: three phases

The work is ordered by urgency, not by size. Phase 0 is access and discovery, sorting out exactly
what we can get into before committing to fixed pricing on the rest. Phase 1 stops the most
exploitable issues within days of that. Phase 2 closes out everything else confirmed in the
review over the remaining weeks.

### Phase 0: Access & discovery ($5,500)

This is the one piece of the engagement with real scope uncertainty. If something significant
surfaces that materially changes the picture, we'll flag it and check in before continuing rather
than let it silently become a bigger phase.

| # | Item |
|---|---|
| 1 | Get set up with working AWS IAM credentials (in progress, issued directly since the account's root login is available, no AWS Support case needed) and confirm database access across every environment actually in use, at least three databases have come up in conversation (dev, production, and one referred to as "Micro V"), not just the one we already know about. While we're in there, we'll also do a quick pass on basic infrastructure exposure, for example, whether RDP is open to the whole internet on the Windows VM, since that class of issue wouldn't show up in a code-only review and is a common gap on a solo-managed server. Daily backups already exist, which gives us a fallback if anything about the live instance turns out to be harder to access than expected. |
| 2 | Confirm hosting and registrar/DNS access for the backend, frontend, and investor site, then build a real deploy pipeline for the backend and frontend rather than just documenting a manual process. The backend previously deployed straight from the prior engineer's machine with no repeatable process, and the investor site is known to at least be on Amazon EC2, but not the specific setup or how a new build would actually get published there. Automating deploy means production always reflects a known, specific commit instead of whatever was last copied over by hand, safer for two engineers shipping changes in parallel, and it means you always know exactly what's running. How far we can automate the backend specifically depends on what we find here, its legacy Windows hosting may need more work than a modern platform would, we'll flag it rather than let that balloon quietly. |
| 3 | Stand up the CI side of that pipeline: every change is automatically built and verified before it's allowed to deploy. Build verification only, not a full test suite, there isn't an existing one to run, but combined with item 2 this means nothing reaches production without at least confirming it compiles cleanly first. This is the direct answer to the original review's "no CI in place" finding. |

### Phase 1: Stop the bleeding ($4,500)

Live and exploitable right now, cheap to mitigate even as a stopgap.

| # | Item |
|---|---|
| 4 | Rotate every credential found committed to the backend repo: database passwords, cloud access keys, the AI provider key, and third-party service keys. Some of these (payment processor, accounting, property-management integrations) are contracted through Residence Billing rather than Ubility directly, so rotating them requires coordination with their contact, not just access on Ubility's side. |
| 5 | Pull the real financial figures (revenue, burn, funding ask, pipeline) off the public investor site, either by stripping the hardcoded numbers or taking the affected pages offline until a properly gated version exists. |
| 6 | Remove open public access from the two backend services that currently accept requests from anyone with no login, and gate both behind a shared secret as an interim measure. This alone closes off the free abuse path for triggering paid AI calls and automated browser jobs. |

### Phase 2: Close the confirmed holes ($23,000)

| # | Item |
|---|---|
| 7 | Design and implement real per-request authentication for the backend API, replacing the single static key that currently ships to every browser. Likely per-user/service tokens issued at login and validated server-side. Touches both the backend auth layer and the frontend's request logic. |
| 8 | Add proper URL validation to the two services that fetch external content on request, closing the path that currently lets an outside caller redirect that server-side fetch, including the one with a real path to exposing customer bill data. |
| 9 | Replace the pattern of auth/access tokens encoded (not encrypted) directly into URLs with signed, short-lived tokens or header-based auth. This touches a number of download and report features on both the backend and frontend, and needs regression testing on each affected flow. |
| 10 | Fix an access-control gap found beyond the original review: one file-access endpoint has no ownership check at all, meaning a guessable ID could expose another resident's bill. Add the missing check. |
| 11 | Purge committed secrets and other sensitive history from git across the affected repos, then coordinate a clean re-clone for anyone with a local copy. This step is disruptive (it rewrites commit history) and needs explicit sign-off before we do it. |
| 12 | Fix the `.gitignore` gaps that let secrets get committed in the first place. |
| 13 | Remove roughly 5,300 committed `node_modules` dependency files from one repo that should never have been tracked in git at all, bloating the repository and burying the real, current dependency list. |
| 14 | Move all remaining secrets out of plaintext config files and into a real secrets manager, with the application reading from it at startup instead. |
| 15 | Rebuild the investor site's protected pages as a real server-verified route: confidential content is fetched from an authenticated endpoint after login, not bundled into the public site. |
| 16 | Replace the Phase 1 shared-secret stopgap on the two backend services with proper per-caller authentication consistent with item 7, and add basic rate limiting since both trigger real paid work per call. |
| 17 | Remove or properly gate a set of diagnostic actions in the backend that currently hit real third-party paid APIs and, in one case, can create a new user account. |
| 18 | Finish a cookie/session cleanup that was already in progress before development stopped, confirming no sensitive tokens remain anywhere they shouldn't. |

---

## Timeline

Phase 0 comes first, since everything else depends on actually having access. Phase 1 follows
immediately after and closes the most exploitable issues fast. Phase 0 and Phase 1 together are
targeted for completion by August 14, assuming a prompt start.

Phase 2 is the bulk of the engagement and spans Tanner's vacation window (mostly unavailable
August 15-24, pre-planned): work continues during it with Alex covering solo, wrapping up with a
final handoff summary by September 7.

---

## What you get

A named, itemized list of exactly what was fixed, mapped back to this list, so there's a concrete
internal record of what changed and why.

A confirmed system architecture document covering how the six repos fit together, what talks to
what, and where the real risk points are, so this knowledge exists somewhere other than in code
and whoever picks up maintenance next isn't starting from zero.

A working, automated build-and-deploy pipeline for the backend and frontend, an actual asset you
keep using after we're gone, not just a one-time fix. Replaces the manual copy-from-a-laptop
process entirely.

A credential and integration inventory: what third-party services and keys actually exist in this
system, and which ones got rotated and when. This doesn't exist anywhere today and is useful
security hygiene going forward, independent of this specific engagement.

A shareable remediation summary, a clean, external-facing version of what was fixed, distinct from
the internal itemized list, meant for Residence Billing or anyone evaluating Ubility's security
posture as part of the merger conversation.

---

## Price

**$33,000 total** ($5,500 for Phase 0, $4,500 for Phase 1, $23,000 for Phase 2).

Open question worth raising directly: whether Residence Billing might co-fund this work, given
their interest in Ubility staying viable as their billing platform through the merger evaluation.

---

## Terms

- Phase 0 and Phase 1 complete by August 14; Phase 2 wraps up by September 7. Fixed scope as
  outlined above.
- Invoiced in three parts, one at the completion of each phase.
- Any scope discovered mid-engagement that falls outside this list (for example, a dependency
  found to rely on the current shared key in a way not visible from the repos alone) will be
  flagged before any additional work is started, not billed after the fact.
- Ongoing maintenance and feature development are a separate conversation, to be had once this
  work is complete.
- The timeline assumes IAM access, database access, and a working deploy path (items 1/2) are
  confirmed during Phase 0. Root-level AWS access already exists on your side, so this should be
  straightforward, but if it turns out to require a deeper AWS Support case, the timeline will
  need to be revisited.
- If we end up needing to restore from a backup into a new RDS instance rather than working
  against the existing one, that's real additional scope beyond a credential rotation,
  provisioning, restoring the data, reconfiguring every connection string, and cutover testing.
  Daily backups already existing makes this a realistic fallback rather than a blocker, but it's
  not included in the price above and would be scoped and quoted separately if it's needed.
- Timely credential rotation on the Residence Billing-contracted services (item 4) depends on
  their contact being looped in promptly, delays there push out Phase 1.
- This timeline depends on Client making Mike Bowers and the rest of the team promptly available
  for whatever account and credential access comes up along the way. Delays getting access from
  them push out the
  timeline the same way delays from AWS or Residence Billing would.
- This engagement is based on the six repos reviewed plus what we learn once we have live access.
  If another consumer of the backend API exists that we haven't been told about (a mobile app, a
  partner integration), the authentication change in item 7 could affect it unexpectedly, we'll
  confirm this before starting that item, but can't be responsible for integrations we were never
  made aware of.
- The original review, and our verification of it, was based on static code and history review,
  not a live walkthrough of production. Additional findings may surface once we have live access
  that weren't visible in the repos alone, that's expected, not a sign of scope creep on our part.
- Where our fixes touch payment-related flows (item 9), we're correcting the access-token pattern
  around them, not expanding into payment processing itself or taking on any additional compliance
  scope.
- Any customer-facing communication about maintenance windows or possible service interruption
  during a deploy is Client's responsibility, not ours.

---

## Legal Terms

**Limitation of liability.** Our total liability under this agreement is capped at the total fees
paid. Neither party is liable to the other for indirect, incidental, or consequential damages,
including lost revenue, lost data, or business interruption.

**No warranty on the pre-existing system.** This engagement fixes the specific items listed above.
It is not a certification that the platform is otherwise free of defects or vulnerabilities, and
we are not responsible for pre-existing issues in the system that fall outside that list.

**Assumption of risk: no staging environment.** Client acknowledges that changes will be made
against production with no staging environment available. We will take a database and server
snapshot before each deploy as a mitigation, but this is not a guarantee against downtime or
data loss from causes outside our control.

**Change orders.** Any work outside the items listed above requires written approval (email is
sufficient) of the added scope and price before we start it. We will not bill for out-of-scope
work performed without that approval.

**Payment.** Invoices are due within 15 days of receipt. Late payment may result in interest
charges and suspension of work. Final deliverables may be withheld until payment is received in
full.

**Termination.** Either party may terminate for convenience with written notice, or immediately
for material breach (including non-payment). Fees for completed phases are non-refundable. A
phase terminated mid-way is billed for work completed to that point.

**Delays outside our control.** Timelines depend on timely access and cooperation from Client,
AWS, and Residence Billing (for the credential rotations they control). Delays caused by any of
these parties extend the timeline accordingly and are not a breach of this agreement.

**Confidentiality and data handling.** Both parties will keep the other's confidential information
confidential. We will not retain copies of credentials or secrets beyond what's operationally
necessary to complete this engagement, and will follow reasonable security practices in handling
any production data or access we're given.

**Client responsibility for provided access.** Client is responsible for the legitimacy and scope
of any credentials, accounts, or system access granted to us, and indemnifies us against claims
arising from our good-faith use of that access.

**Work product.** Deliverables produced under this agreement become Client's property upon full
payment. We retain rights to our own general tools, methods, and know-how used in producing them.

**Independent contractor.** We perform this work as independent contractors, not employees, and
may involve additional personnel or subcontractors in delivering it.

**Governing law.** This agreement is governed by the laws of the state of Utah. Disputes will be
addressed through good-faith negotiation before either party pursues formal legal action.
