# Ubility: Ongoing Engineering Partnership

*Proposal for a six-month platform roadmap and continuing engineering ownership, following the security remediation engagement currently underway.*

---

## The situation

Ubility has a working product with real customers, real revenue, and real third-party integrations.

Worth stating plainly before anything else: this platform has been stable for months with nobody actively maintaining it. Nothing has broken on its own. Whatever else is true about how it was built, the parts that are running work.

Part of why it has stayed stable is that nothing new has been added to it. No changes means nothing has had the chance to break. Building it out further, and doing that safely, needs a sustainable way of making changes that does not exist today. That is what the gaps below add up to, and they have nothing to do with the quality of the work that was done, and everything to do with the fact that it was built and operated by one person who is no longer here:

- **No staging environment.** Every change goes directly to production. The current remediation contract names this explicitly as an assumed risk, mitigated with pre-deploy snapshots, because nothing better is available today.
- **No automated test coverage.** The remediation engagement adds a build-verification step that confirms the application compiles. It does not confirm the application is correct. That was a deliberate scope boundary, not an oversight.
- **599 stored-procedure-backed functions carrying core business logic, existing only inside the live production database.** They are not in version control. There is no history of who changed what, no way to review a change before it ships, and no way to test one outside production. This is the single largest constraint on both maintainability and scale. Keystone has already built a full inventory of all 599, with a best-effort read on what each one does: [ubility-stored-procedures.md](./ubility-stored-procedures.md). <!-- TODO (Google Docs): relative link won't resolve outside this repo, so attach the file separately or swap in a real URL. This same TODO applies to the matching link in roadmap item 5 below. -->
- **A single .NET application on one Windows VM with one SQL Server instance.** Everything funnels through it. There is no horizontal scaling path from where it sits today.
- **No engineer who has the system in their head.** The person who did is gone. Right now the closest thing to institutional knowledge about this platform is the audit and architecture work Keystone has already produced.
- **No visibility into the business itself.** Revenue billed versus collected, delinquency by property, provider cost trends, none of it exists as a dashboard or a report. Seeing any of it today means writing a one-off database query. There is no observability layer for the business side of the platform, only for whether the servers are up.

The remediation engagement closes the security holes and puts a real build-and-deploy pipeline underneath the platform. That is the floor. It is not a platform that can absorb new features, new customers, or new load without something breaking.

This proposal covers what comes after: six months of committed work to move Ubility from a system that one person maintained by hand into a platform a team can safely change, test, and grow.

---

## What kind of relationship this is

Said plainly up front: the goal is a long-term partnership, not a single project. The roadmap, the pricing, and how support is handled below are all built on that assumption.

That goal is also why this proposal does not lock Ubility in. A relationship that survives only because leaving costs more than staying is not a partnership, it is a captive customer. Keystone would rather earn next month's work than make this month's work expensive to walk away from. That is the reasoning behind staying on Ubility's own infrastructure, behind moving business logic out of one person's head and into something documented and version-controlled, and behind both pricing options below ending cleanly whenever Ubility wants them to. The Portability section later in this document covers exactly how that gets built in, not just promised.

If this becomes a multi-year relationship, which is the intent, it will be because it kept earning that every month, not because Ubility ran out of ways to leave.

---

## Continuity first

Before any roadmap work starts, the platform has to keep running. That is the base layer of this engagement, not a separate line item.

- **Nothing moves.** Ubility stays on its current AWS infrastructure. No hosting migration is required, requested, or implied by this proposal. Changing where the platform runs at the same time as changing how it is built would compound risk for no benefit.
- **Production support is included, not billed separately.** Bugs, incidents, integration failures, and customer-reported issues are handled inside the monthly engagement. There is no separate support contract, and no incentive on our side to classify work one way or the other.
- **The deploy pipeline built during remediation is the mechanism.** Every change reaches production through a known, repeatable pipeline tied to a specific commit, rather than a manual copy from someone's machine.
- **Snapshots before every deploy** continue until the staging environment exists, at which point staging replaces them as the primary safety net.
- **Existing behavior is preserved by default.** Where business logic moves out of a stored procedure, the target is identical output for identical input, verified by tests written against the current behavior before anything is changed. Migration is not an excuse to redesign.

Keystone has already read all six repositories, verified the security findings line by line, and produced the system architecture map. There is no ramp-up period being billed here.

---

## How we work

### Communications

- **A direct line to the people doing the work.** A shared channel connects Ubility staff to Tanner and Alex directly, not a ticket queue that has to escalate before anyone who actually knows the codebase sees it. Both monitor it, so one person being unreachable does not leave Ubility without a way to reach someone.
- **Automated detection, not waiting for a resident to notice first.** Uptime and health checks against the backend, frontend, and bill-processing pipeline, wired into an alerting tool (PagerDuty or incident.io, whichever fits the budget better) that pages Tanner and Alex directly the moment something fails, rather than relying on a customer complaint or someone happening to check. Set up on the free or low-cost tier of whichever tool is chosen, since monitoring at Ubility's current scale does not need an enterprise incident platform, and included in the monthly engagement rather than billed separately.
- **Response times, tiered by what's actually broken:**

| Severity | What it looks like | Response |
|---|---|---|
| Critical | Production down, billing calculating wrong, a security issue, anything resident- or revenue-impacting | Automated alert fires immediately. Acknowledged within 1 hour during business hours, within 4 hours outside business hours, worked until resolved or mitigated. |
| High | A specific feature or integration broken, a workaround exists | Acknowledged by the next business day |
| Standard | A bug, a small request, a question that isn't blocking day-to-day operation | Handled in the normal weekly cadence alongside roadmap work |

- **A self-serve client portal, coming soon.** Keystone is building a client portal, included in this partnership at no additional cost, not something that turns into a paid add-on later. Anyone on Ubility's side of this, not just one point of contact, will be able to get their own account with access to see what work is actually happening, leave comments, ask questions, and follow progress in real time, rather than waiting on the monthly written summary. It also carries read-only contract and invoice status. It is on track to be ready soon, and it comes online automatically for Ubility the moment it is, at no extra charge. It is a side benefit of working with Keystone during this period, not the reason to, and it reflects the same transparency the rest of this section is built around.

---

## How this is priced

Keystone Systems prices to the outcome. There is no hourly rate in this proposal and no time tracking. That is a structural position, not a preference.

Hourly billing and dedicated-headcount billing both price the same thing: attendance. Under either model, the vendor is paid more for taking longer, and the client's only lever is to audit the timesheet. Every hour spent recording, categorizing, and reviewing hours is overhead that both sides pay for and neither side gets value from. Worse, it puts the estimation risk on the buyer. If a piece of work turns out to be three times harder than expected, an hourly engagement invoices three times as much and calls it accurate.

Outcome pricing inverts that. The roadmap below is a named list of deliverables at a fixed price. If the stored-procedure migration on the billing path takes twice as long as estimated, that is Keystone's problem to absorb, not a change order. The incentive on our side is to find the shortest correct path to each deliverable, which is the same thing Ubility wants.

The tradeoff is that outcome pricing only works if the outcome is specific. That is why this document itemizes the work by phase and by deliverable instead of quoting a number of hours per week.

---

## Current state and target state

### Where the platform is today

<!-- TODO (Google Docs): render this diagram to an image and embed it, since Docs does not render mermaid natively. -->

```mermaid
graph TD
    DEV["Developer change"] -->|"no test gate,<br/>no staging"| PROD

    subgraph PROD["Production (only environment)"]
        FE["c4-frontend<br/>Next.js"]
        BE["c4-backend<br/>single Windows VM<br/>no horizontal scaling"]
        DB[("SQL Server database<br/>599 stored procs<br/>business logic lives here,<br/>not in git")]
        SC["c4-scrape<br/>synchronous call,<br/>no queue, no retry"]
        EX["c4-extract<br/>Claude bill extraction"]
    end

    FE --> BE
    BE --> DB
    BE --> SC
    SC --> BE
    BE --> EX
    EX --> BE

    style PROD fill:#f5f5f5,stroke:#999
    style DB fill:#ffe9e9,stroke:#c66
```

Single environment, single backend instance, and the business rules that decide what a resident owes are stored in a place that cannot be reviewed, versioned, or tested.

### Where it lands in six months

<!-- TODO (Google Docs): render this diagram to an image and embed it, since Docs does not render mermaid natively. -->

```mermaid
graph TD
    DEV["Developer change"] --> CI

    subgraph CI["Automated build & test pipeline"]
        BUILD["Build verification<br/>(delivered in remediation)"]
        TEST["Automated test suite<br/>(added in this engagement)"]
        BUILD --> TEST
    end

    CI --> STG

    subgraph STG["Staging environment"]
        SBE["Backend"]
        SDB[("Restored database copy")]
        SBE --> SDB
    end

    STG -->|"verified change"| PRD

    subgraph PRD["Production"]
        LB["Load balancer"]
        BE1["Backend instance"]
        BE2["Backend instance"]
        SVC["Versioned business logic<br/>in application code,<br/>covered by tests"]
        DB2[("SQL Server<br/>data store;<br/>remaining procs<br/>versioned in git")]
        Q["Queued bill pipeline<br/>retry + exception queue"]
        EX2["c4-extract<br/>expanded AI extraction,<br/>confidence scoring"]
        OPS["Operations & business dashboard<br/>pipeline + revenue/collections metrics"]

        LB --> BE1
        LB --> BE2
        BE1 --> SVC
        BE2 --> SVC
        SVC --> DB2
        SVC --> Q
        Q --> EX2
        OPS --> Q
    end

    style CI fill:#eef4fa,stroke:#3E7CB1
    style STG fill:#eef4fa,stroke:#3E7CB1
    style PRD fill:#f5f5f5,stroke:#999
```

One important clarification on scope: the horizontally scaled production topology above is delivered in this engagement as the enabling work (packaging the backend so it can run as multiple identical copies, externalizing its configuration, making session state independent of any one instance, and a costed cutover plan with a recommended target). The cutover itself follows the same pattern as every other change in this roadmap: build and prove it in staging first, then stand up production and cut over, never modify the live system in place. It is sequenced by that plan rather than assumed to finish inside the six months, because doing it correctly depends on what the assessment finds. Everything else in the target diagram is committed roadmap scope.

---

## The six-month roadmap

<!-- TODO (Google Docs): render this Gantt chart to an image and embed it, since Docs does not render mermaid natively. -->

```mermaid
gantt
    title Ubility platform roadmap
    dateFormat YYYY-MM-DD
    axisFormat %b

    section Phase A: Foundation
    Staging environment stood up           :a1, 2026-09-08, 35d
    Stored procs extracted into git        :a2, 2026-09-08, 45d
    Test harness and automated test gate    :a3, 2026-09-22, 40d
    Characterization tests, billing path   :a4, 2026-10-06, 30d

    section Phase B: Migration and features
    Billing logic out of procs             :b1, 2026-11-03, 50d
    Test coverage, payables and invoicing  :b2, 2026-11-03, 45d
    Queued bill pipeline with retry        :b3, 2026-11-24, 35d
    Operations & business dashboard        :b4, 2026-12-08, 30d

    section Phase C: AI and scale
    AI extraction expansion                :c1, 2027-01-05, 45d
    Provider invoice extraction            :c2, 2027-01-19, 35d
    Scale assessment and enabling work     :c3, 2027-01-05, 55d
    Performance work on hot paths          :c4, 2027-02-02, 30d
```

Dates assume a start as the remediation engagement completes. They shift together if the start shifts.

### Phase A, months 1 and 2: a system that can be changed safely

Nothing else on this roadmap is safe to do until this exists.

| # | Deliverable | Why it is first |
|---|---|---|
| 1 | **Staging environment.** A second backend instance and a database restored from the existing daily backup, wired into the deploy pipeline built during remediation. Changes land here before production. | Removes the assumed-risk clause from the remediation contract. Today there is no place to try anything. |
| 2 | **Every stored procedure extracted into version control.** All 599 procs scripted out of the production database into versioned migration files in git, with the deploy pipeline applying them. No logic is rewritten in this step. | Core business logic currently exists in exactly one place: the live production database. If that instance is lost, the rules for what a resident owes are lost with it. This step alone removes the largest single point of failure on the platform. |
| 3 | **Automated test harness and test gate.** A test project wired into the existing build pipeline so that failing tests block a deploy, upgrading the build-verification step from remediation into an actual correctness check. | The remediation contract explicitly scoped a test suite out. This is where that gap gets closed. |
| 4 | **Characterization tests over the billing calculation path.** Tests written against current behavior, on the highest-traffic path first, so that current output is pinned down before any logic moves. | Migration without a behavioral baseline is a guess. This is what makes Phase B a safe operation instead of a risky one. |
| 5 | **A written migration plan for the remaining procedures**, ordered by traffic and risk, with each one classified as move, keep, or retire, building on the [initial inventory](./ubility-stored-procedures.md) already done. | Turns 599 procedures from an unbounded problem into a prioritized, finite list Ubility can track progress against. |

### Phase B, months 3 and 4: logic out of the database, first new capability

| # | Deliverable | Why it matters |
|---|---|---|
| 6 | **Resident billing and invoice generation logic moved from stored procedures into versioned application code**, covered by the tests from item 4, with the procedures retired or reduced to thin wrappers. | This is the highest-traffic, highest-consequence path in the product. Once it is in code, a change to how a bill is calculated can be reviewed, tested, and rolled back. |
| 7 | **Test coverage extended to provider invoice processing and payables**, the second cluster of business-critical logic. | These paths touch money moving outward. Same argument as item 6, applied in priority order. |
| 8 | **The bill-processing pipeline moved to a queued model with retry and an exception queue.** Today the backend calls the scraper synchronously and waits. A failed utility-portal login or a failed extraction has no automatic retry and no place to surface for a human. | Turns silent failures into visible, actionable work items. This is both a reliability fix and an operations fix: someone in operations can see what needs attention without an engineer reading logs. |
| 9 | **Operations and business metrics dashboard.** Two layers in one place: pipeline visibility (bills in flight, failed scrapes by utility provider, extractions awaiting review, unmatched bills, with retry and reassign actions) and business metrics (revenue billed versus collected, delinquency and collections aging by property, provider cost trends, bill exception rates, AI extraction cost and accuracy). | Direct answer to wanting better tools to manage the business, and to the observability gap named at the start of this document. Right now nobody at Ubility can see revenue or collections trends without asking an engineer to pull them by hand. |
| 10 | **A second round of feature work, selected with the team at the start of Phase B** from Ubility's own backlog and priorities, sized to the remaining capacity in these two months. | The roadmap should not assume we know Ubility's product priorities better than Ubility does. This slot is deliberately reserved and scoped jointly. |

### Phase C, months 5 and 6: AI capability and scale

| # | Deliverable | Why it matters |
|---|---|---|
| 11 | **AI bill extraction expanded.** The existing Claude integration in `c4-extract` gets broader utility-provider and bill-format coverage, per-field confidence scoring, and automatic routing of low-confidence extractions into the exception queue from item 8 instead of into the ledger. | This is an existing, working foundation, not a new capability being invented. The gap today is that extraction results are trusted or not trusted with no gradient, and there is nowhere for a doubtful result to go. |
| 12 | **AI extraction applied to provider invoices**, reusing the same pipeline against the payables side rather than only resident utility bills. | Same machinery, a second revenue-relevant workflow, and meaningfully less manual data entry. |
| 13 | **Natural-language query over billing and operational data**, including the metrics layer from item 9, for admin staff, scoped to read-only reporting against the data model, so a staff member can ask a question without an engineer writing a report. | Second half of the better-tools ask: instead of only a fixed dashboard, staff can ask a specific question directly. Deliberately scoped read-only. |
| 14 | **Scale assessment and enabling work.** Packaging the backend so it can run as multiple identical copies instead of one, externalizing its configuration, making session state independent of any single copy, plus a written assessment with a recommended target setup, a cost comparison, and a sequenced cutover plan. This new version of the backend gets built and proven in the staging environment from Phase A first; only once it holds up there does a production copy get stood up and traffic cut over to it, rather than changing the live Windows VM in place. | The current single Windows VM has no horizontal scaling path. This phase makes the backend capable of running as more than one instance and produces the plan for actually doing it, with real numbers attached. |
| 15 | **Performance work on the paths surfaced by the assessment**, now measurable because the logic is in code and covered by tests. | Optimizing stored procedures nobody can test is guesswork. By month 5, it is not. |

Every item above traces back to a specific finding in the security audit or the system architecture map already delivered. None of it is generic modernization work.

---

## How AI is incorporated

Two separate answers, because they are two separate things.

**In the product.** Ubility already runs Claude in production through `c4-extract` for utility bill extraction. That is a real foundation and the reason the AI items on this roadmap are extensions rather than experiments. The roadmap expands it along the axes that actually reduce manual work: more bill formats, confidence scoring so uncertain results are routed to a human instead of silently accepted, the same pipeline applied to provider invoices, and natural-language reporting for admin staff. The constraint we hold to is that AI output touching billing data is either verified by a deterministic check or routed to a person, never written straight to the ledger on confidence alone.

**One thing we don't yet know, and will confirm early.** The Anthropic (Claude) API key currently in production is a single, shared credential, but where it actually comes from is not confirmed from the repos alone: whose account it is billed to, what usage limits it runs under, and whether it is still tied to the prior engineer personally rather than a Ubility-owned account. That last possibility deserves the same treatment as the other credentials already being rotated in the remediation work: a key tied to a person who is no longer here is a real operational risk, not just an administrative detail. Confirming ownership, and moving it to a Ubility-owned account if needed, happens early rather than being left as an assumption.

**Cost is worth a second look alongside correctness.** The service already tracks estimated spend on every extraction, which is a useful thing to already have. Once the key's ownership is confirmed, the same roadmap work is a natural point to check whether the current setup is the cheapest way to get the same accuracy: not paying to re-send the same instructions on every single call, processing work that isn't time-sensitive in a cheaper batch mode instead of paying for an instant answer every time, and confirming the more expensive AI model is only used where a cheaper one genuinely cannot do the job, not by default. Nothing here is a committed savings number. It is a real lever worth checking once the current baseline is confirmed, not assumed to already be optimal.

**In how the work gets done.** Keystone uses AI tooling heavily in its own engineering process, which is part of why two senior engineers can commit to this volume of work. The stored-procedure migration in particular is high-volume mechanical translation with high consequence for getting it wrong, which is exactly the shape of work where tooling handles the volume and senior review handles the judgment. That leverage is why this is offered as a fixed roadmap rather than an open-ended hours arrangement. It is not the reason to hire Keystone, and it does not replace the tests, the staging environment, or the review that catch the cases where the tooling is confidently wrong.

---

## Who does the work

Tanner and Alex are both actively working on this engagement and have been through the full six-repository audit, the independent verification of the security review, and the architecture mapping.

Both have led engineering on systems where getting it wrong is not an option. Tanner led engineering on Stripe's core payments infrastructure and was a Principal Engineer at Microsoft. Alex built and led the software that manages Amazon's satellite fleet. Both come out of environments moving billions of transactions a day, where scale, durability, security, and correctness are not features added later, they are load-bearing from the start, because at that scale the failure mode is a public outage, not a bug ticket. That is the same discipline applied here, just on a platform sized very differently: the habits that keep a payments network and a satellite fleet running show up here as a bill calculated correctly and a change that does not take the platform down.

Keystone maintains a small network of equally experienced independent engineers who are brought in when a piece of work calls for surge capacity or specific expertise. Engagements stay founder-scoped: Tanner scopes the work and decides who is looped in.

The practical point is coverage. A single-engineer arrangement, whether that engineer is a contractor or a full-time hire, reproduces the exact situation Ubility is recovering from now.

---

## Pricing

Two structures for the same roadmap. The work, the deliverables, and the phase sequencing are identical. The difference is the commitment shape.

### Option 1: Fixed roadmap price, invoiced monthly

The entire six-month roadmap quoted as one total, invoiced in six equal installments.

| Phase | Months | Committed scope | Price |
|---|---|---|---|
| Phase A | 1 to 2 | Staging environment, stored procedures into version control, test harness and CI test gate, characterization tests on the billing path, migration plan | $34,000 |
| Phase B | 3 to 4 | Billing logic migrated out of stored procedures, test coverage on payables and invoicing, queued bill pipeline with retry and exception handling, operations and business metrics dashboard, jointly scoped feature slot | $34,000 |
| Phase C | 5 to 6 | AI extraction expansion with confidence scoring, provider invoice extraction, natural-language reporting, scale assessment and enabling work, performance work | $34,000 |
| **Total** | **6 months** | | **$102,000** |

Invoiced at **$17,000 per month for six months**. Production support, incident response, and the weekly check-in are included throughout at no additional charge.

This option prices the outcome of the full roadmap rather than a month of availability. Both sides commit to the six months, and Ubility gets a lower total in exchange for that commitment.

### Option 2: Monthly retainer

| Item | Price |
|---|---|
| Ongoing engineering partnership | **$18,000 per month** |
| Minimum initial term | 3 months |
| After the initial term | Month to month, 30 days notice |

Same roadmap, same phase sequence, same included production support. Ubility can stop after any month past the initial term without owing the balance of the roadmap. Over a full six months this comes to $108,000, a $6,000 premium over Option 1, which is the price of that flexibility.

### What is committed and what is held back

Under either option, the named deliverables above are scoped to roughly four fifths of each month's capacity. The remainder is deliberately unallocated and held for production incidents, customer-reported bugs, requests that come up mid-month, and the discovery work that legacy systems reliably produce. That reserve is why a production issue in week two does not push a roadmap deliverable into the next month, and why an unexpected request does not require a change order.

Work that falls genuinely outside the roadmap (a new integration with a property-management system not already connected, the scale cutover itself once the plan is approved, a database platform migration) is flagged and scoped before anything is started, never billed after the fact.

---

## What Ubility gets that is durable

Independent of how long the engagement runs, each of these is an asset that stays:

- **Business logic in version control.** Reviewable, testable, and recoverable if the database instance is not.
- **A staging environment.** A place to try a change before customers see it.
- **A test suite that blocks bad deploys**, growing with each phase rather than existing as a one-time artifact.
- **A pipeline and business metrics dashboard** that lets operations staff act on failed bill fetches and lets leadership see revenue, collections, and property-level performance, without an engineer pulling either by hand.
- **Architecture and system documentation** kept current as the platform changes, extending the document already delivered.
- **A costed, sequenced scale plan** with a recommended target, usable whether Keystone executes it or someone else does.

Handoff is the default posture at Keystone. Everything above is built so that Ubility, or whoever Ubility hires next, is not dependent on us to keep it running.

---

## Portability: Ubility keeps control of who maintains this

This is a stated goal of the engagement, not a side effect of it. When the six months are over, Ubility should be able to hand this platform to any competent engineer or firm and have them be productive on it. That includes handing it to someone other than Keystone.

**Everything stays on infrastructure Ubility owns.** The code stays in Ubility's own repositories. The platform stays in Ubility's own AWS account, under Ubility's own billing relationship, with Ubility holding root access. Keystone works inside those accounts rather than moving anything into a Keystone-controlled environment. There is nothing in this proposal that Ubility would have to migrate off of in order to stop working with Keystone.

**The modernization work is what creates the portability.** This is worth being explicit about, because the two goals are the same goal:

| Roadmap item | What it does for portability |
|---|---|
| Stored procedures extracted into version control | A new engineer can read the business rules in git instead of having to be granted production database access and reverse-engineer them |
| Business logic moved into application code with tests | The rules become reviewable and verifiable by someone who was not here when they were written |
| Staging environment | A new engineer can learn the system by trying things, without their learning curve running through production |
| Automated test suite | A new engineer finds out they broke something from the automated tests rather than from a customer |
| Architecture and system documentation kept current | The knowledge exists in a document instead of in one person's head, which is precisely the failure Ubility is recovering from now |
| Packaging the backend so it can run as multiple identical copies, with its configuration externalized | The application can be stood up somewhere else by someone else, rather than being tied to one hand-configured machine |

Every one of those is a handoff asset first and a productivity improvement second.

**Why this cuts the other way for a hosting-bundled arrangement.** An offer that requires moving hosting onto the vendor's own platform makes leaving expensive by design. If that relationship changes for any reason, including reasons that have nothing to do with anyone's performance (the assigned engineer leaves, the vendor's priorities shift, pricing changes), Ubility is looking at an infrastructure migration on top of finding new engineering help, at the exact moment it has the least capacity to absorb either. The dependency is not on the engineering. It is on the hosting, and it survives after the engineering relationship ends.

Leaving the platform as it is today has the same shape of problem for a different reason: undocumented business logic living only in a production database means whoever touches it next has leverage over Ubility, whether that is Keystone or anyone else. Ubility's negotiating position with every future engineer is set by how legible the platform is.

**Two decisions, not one.** Who maintains this platform and where it runs are separate questions. They do not need the same answer, and bundling them together is what makes a hosting-bundled offer expensive to walk away from. If Ubility becomes unhappy with the engineering side, it is also stuck re-litigating the hosting side at the same time, starting from scratch. This proposal keeps the two decoupled on purpose. Ubility can change engineering partners without touching infrastructure, and can change infrastructure without touching the engineering relationship, because neither one is a condition of the other.

**Where it runs is its own decision, independent of who runs it.** The dedicated-headcount offer under consideration moves Ubility onto the vendor's own infrastructure: two data centers, both in Utah. That is a materially different category of infrastructure from a hyperscale cloud provider. AWS and Azure each operate dozens of physically distinct data centers across many regions, with a scale and reliability record no single company's own two facilities can match, regardless of how long that company has been running them. If the goal is to keep Ubility running, the difference may not matter day to day. If the goal is to scale this nationwide, the infrastructure foundation is as much a scale decision as the engineering is, and a small company's own data center is a ceiling on that regardless of the quality of their maintenance work. Staying on AWS, or moving to Azure if that ever made sense, keeps that ceiling as high as it can be and keeps it Ubility's decision to make, not a byproduct of who happens to be maintaining the platform this year.

**This same decoupling covers the good version of leaving, not just the bad one.** Everything above assumes something went wrong with the engineering relationship. There is a second, better reason this matters: if Ubility scales the way this roadmap is built to support, at some point it may make more sense to bring engineering in-house than to keep relying on an outside firm at all. That is not a failure of this engagement, it is what success looks like. A company running its own infrastructure with its own engineering team has no real use for an outside contractor managing it for them. Because the code and infrastructure stay in Ubility's own accounts throughout, and the business logic lives in reviewable, tested application code rather than in anyone's head, that transition is exactly as clean as the one described above. Decoupling who maintains the platform from where it runs makes both versions of parting ways equally straightforward, whether it's driven by dissatisfaction or by outgrowing the need for outside help.

**The test to hold this proposal to:** at any point during or after this engagement, could Ubility hand these repositories and this AWS account to a new firm and have them productive without Keystone's cooperation? If the answer is yes, the work is doing what it should. That is the state this roadmap is built to reach, and Ubility should feel free to check it against that standard at each phase boundary.

---

## On the alternative under consideration

Ubility is weighing this against a dedicated junior engineer bundled with a hosting migration. That is a legitimate option and worth comparing on the substance rather than on price alone.

| | Dedicated junior headcount | This proposal |
|---|---|---|
| **What is priced** | One person's time in seat, monthly | A named roadmap of deliverables |
| **Who carries estimation risk** | Ubility. Work taking longer costs more months. | Keystone. The roadmap price is fixed. |
| **Starting knowledge** | Begins at zero on six repositories with no documentation, no tests, and a sole author who is gone | Full six-repository audit complete, security review independently verified and corrected, architecture map delivered, remediation in progress |
| **Hosting** | Migration to the vendor's platform required | No change. Ubility stays on its own AWS infrastructure. |
| **Infrastructure foundation** | Vendor's own data centers, two facilities, both in Utah | Hyperscale cloud (AWS today; Azure or another major provider remains Ubility's option), built for national scale regardless of who maintains the application on top of it |
| **Seniority applied** | Execution capacity | Senior judgment on the decisions that are expensive to reverse, applied to a platform where those decisions are pending |
| **Continuity** | One person. The same single point of failure Ubility is recovering from. | Two engineers engaged, with a network available for surge capacity |
| **Cost of ending the relationship** | An infrastructure migration off the vendor's platform, on top of finding new engineering help | Nothing to migrate. Code and infrastructure stay in Ubility's own accounts throughout. |
| **Effect on future options** | Ubility becomes more dependent on one vendor over time | Ubility becomes handoff-ready to any firm over time (see the portability section above) |

The honest version of the comparison: if what Ubility needs is a volume of tickets closed and the hosting move is acceptable, dedicated junior headcount is a reasonable way to buy that. What it does not buy is someone who can look at 599 stored procedures carrying the billing rules and decide which ones move first, which ones stay, and which sequence avoids getting a resident's bill wrong in the process. Those calls are the expensive ones, and they all come due in the first sixty days.

---

## Why the timing matters

Not as a sales point, just as a description of the current state:

- Business logic for how customers are billed exists in one live database, not in version control.
- There is no environment in which a change can be tested before customers see it.
- There is no automated check that a change is correct, only that it compiles.
- The one person who understood the system end to end is gone, and the platform has been without a maintainer for months.
- Every additional month of the platform sitting in that condition is a month where a single database incident, a single bad manual deploy, or a single misunderstood billing rule has no safety net underneath it.

Phase A exists specifically to remove those conditions, which is why it comes before any feature work regardless of which pricing structure Ubility picks.

---

## Next step

A working session to confirm three things: which pricing structure fits how Ubility wants to commit, whether the Phase B feature slot should be pre-committed to specific items from Ubility's backlog now or scoped at the phase boundary, and whether Residence Billing has a stake in this given their interest in Ubility continuing as their billing platform.

Once direction is agreed, this becomes a contract with the same structure as the remediation agreement: itemized scope, fixed price, stated terms.
