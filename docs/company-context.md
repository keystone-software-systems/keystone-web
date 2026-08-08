# Keystone Systems — Company Context

*This document is meant as a standalone reference — for briefing other tools, agents, or collaborators on the company without requiring prior context.*

---

## What Keystone Systems Is

Keystone Systems is operated by a founder who personally scopes every engagement, working alongside a network of senior-plus independent engineers, built around senior technical judgment — architecture decisions, scoping, and hands-on engineering — rather than commodity development capacity. The pitch, in one line: **senior engineering judgment, without the full-time hire.**

**Public-facing framing (updated 2026-08-08):** public copy no longer presents Keystone as "solo, founder-led" or narrates the founder's individual career trajectory. It's described as a network of senior-plus engineers, with credentials (Stripe/Amazon/Microsoft-type backgrounds) stated at the network level, not attributed to one named, bio-able person. See "Founder Background" and "Bench depth" sections below for why, and for what's still true internally versus what's said publicly.

Clients bring Keystone Systems in for the decisions that are expensive to get wrong and hard to undo later — not for headcount augmentation. The firm positions itself as the person a company calls before a big technical decision, not after.

---

## Positioning: The Judgment Gap

### The real shift in the market

AI coding tools collapsed the cost of producing code. They did not collapse the cost of knowing whether that code is sound. Writing code was never the scarce, valuable thing, and now that everyone can generate a plausible-looking product in a weekend, the market is flooded with unverified systems built by people who can produce but cannot evaluate what they produced. The judgment premium did not shrink. It went up, because there is more code than ever that nobody with the right experience has looked at.

This is the gap Keystone Systems fills: not "AI-assisted development," which every dev shop and freelancer now claims, but the judgment layer sitting on top of it. Knowing what to build, what to refuse to build, and which shortcuts are harmless versus which ones quietly become an outage or a failed audit six months out.

### Why the network can fill it

The engineers in the network have built and operated real systems at scale (payments infrastructure at Stripe-caliber companies, principal-level roles at Microsoft-caliber companies) and have been on-call for what happens when a shortcut turns out to be a landmine. That is the source of the judgment: not credentials for their own sake, stated once and plainly, but the pattern recognition that only comes from having paid for failures directly in production. Internally, the founder personally has this background (see "Founder Background" below); publicly, it's stated as a network-level credential rather than a personal bio, for the reasons covered there.

Fluency with AI coding tools is not the pitch. It is the infrastructure underneath the pitch: it is what lets one person deliver senior-level judgment at solo speed, without the standups, handoffs, and telephone-game overhead a traditional dev shop needs to move at the same pace. The AI tools are the leverage that makes the judgment affordable and fast. They are never the reason to trust the work.

### What is actually being sold

Not "quality code" as an abstract good, and not reassurance. Clients are buying a specific, named person to put their judgment behind, at the one moment where being wrong is expensive and hard to undo: pre-launch, pre-raise, pre-acquisition-close, pre-scale.

Concretely, that means:

- **Engineers who say no.** AI coding assistants are structurally agreeable and have no skin in the game. A dev-shop contractor has an incentive to keep billing. The engineers in Keystone's network have professional reputations built on real production experience and will tell a client not to do something an AI tool would happily generate.
- **A credible, specific proxy for "will this hold up."** A non-technical buyer cannot personally evaluate a data model or an auth flow. They are outsourcing that call to someone whose judgment has already been tested against real production load.
- **Not their job to know this.** The client's job is running their company, not becoming a part-time systems architect. They are paying so they don't have to develop that expertise themselves.
- **A concrete deliverable, not a feeling.** Phrases like "a clear-eyed technical assessment of what's solid and what isn't," "know what you're buying before you close," and "a second set of senior eyes" all point at the same thing: a specific list of what's broken, what it will cost to fix, and a name attached to that list. Not "peace of mind." Not "validated and certified" (there is no such certification in custom software, and claiming one undercuts credibility with a technical audience).

The pricing logic follows an insurance framing without ever using the word insurance: a client pays a few thousand to a few tens of thousands of dollars now to avoid a six-figure mistake later (a breach discovered after a raise, an acquisition that turns into a money pit, a rebuild forced by a bad early data-model decision).

### Guardrails on how this gets said

No superlatives ("world-class," "rockstar," "best-in-class," "amazing," "cutting-edge," "game-changing"). The substitute for all of these is a concrete noun phrase like "senior engineering judgment" or a named deliverable, never a toned-down version of the hype word. No "empower," "revolutionize," or vague transformation language; replace with the specific problem solved or the specific artifact delivered (a risk assessment, a fixed data model, a handoff document). State the Stripe/Amazon/Microsoft-type credential at the network level (companies, seniority, kind of work) in one or two places (About page, homepage); never attribute it to one named, bio-able individual, and do not lead with AI capability as the headline hook since it is one of five service lines, not the identity of the firm. No em dashes, no exclamation points, no urgency language. Confidence comes from specificity (named deliverables, a stated engagement model, a stated decision-timing moment), not from adjectives.

---

## Founder Background

**Internal reference only — do not use to write a founder bio in public copy.** This section exists so anyone briefing on the company has the real background; it is not a template for an About-page paragraph.

The founder is a Senior/Staff-level software engineer, currently working remotely at **Cedar** (Mountain Time zone, with East Coast teammates). Prior experience includes:
- **Principal Software Engineer at Microsoft**
- Engineering role at **Stripe**

**Do not mention Cedar, or that the founder currently holds another job, anywhere in public-facing copy.** Cedar carries no brand recognition (unlike Microsoft/Stripe) and stating up front that the founder has another current job reads as off-putting to a prospective client evaluating Keystone Systems.

**Updated 2026-08-08 — public copy does not name the founder, link a personal profile (e.g. LinkedIn), or narrate an individually-identifiable career trajectory (specific promotion timelines, intern-to-Principal path, etc.), even without a name attached.** Reason: the founder currently holds a full-time role elsewhere (Cedar) and does not want this consultancy easily traceable back to them by a colleague or employer piecing together a distinctive career narrative. The Stripe/Amazon/Microsoft-type credential is now stated as a property of the network (see "Bench depth" below and `apps/web` About/homepage copy), not as one person's bio. This supersedes the previous single-mention-on-About-page approach.

This background shapes the firm's actual differentiation: the founder thinks in terms of long-term defensibility, data moats, equity/architecture tradeoffs, and systems-level design — the kind of judgment that typically only comes from having built and scaled real infrastructure at large-scale technical organizations.

---

## Services / Revenue Streams

Keystone Systems offers five categories of engagement:

1. **Net New Development** — greenfield software builds from scratch, for companies that need something built right the first time rather than fast and disposable.
2. **Vibe-Code to Production** — taking AI-generated or prototype-stage code ("vibe-coded" MVPs) and hardening it into a production-ready, maintainable system. This is a growing category as more non-technical founders and teams build fast prototypes with AI tools but lack the engineering judgment to take them to production safely.
3. **Business Process Automation** — identifying and automating manual, repetitive, or error-prone operational workflows inside a business.
4. **AI Training & Setup** — helping teams and companies stand up AI tooling and workflows (e.g., AI-assisted development practices, internal AI adoption) rather than adopting it haphazardly.
5. **Existing Codebase Improvement** — dropping into a company's existing codebase for audits, refactors, incremental feature development, and ongoing improvement — not just greenfield work.

These five lines share a common thread: **judgment applied at a specific, well-scoped moment** — a new build, a fragile prototype, a messy workflow, an AI rollout, or an existing system that needs a second set of senior eyes. None of them are "staff augmentation" in the traditional sense.

Acquisition due diligence used to be a sixth Keystone line but has spun out as its own separate
brand/entity, **StackDiligence** (see `docs/stack-diligence-init.md` and `apps/stackdiligence`) —
not part of Keystone Systems going forward — kept as a distinct brand/entity rather than folded
back in.

---

## Engagement Model & Pricing

- **Priced to the outcome, not billed hourly.** Engagements are scoped and priced up front against the outcome, not billed by the hour. This is a deliberate incentive-alignment choice: hourly billing rewards a consultant for taking longer, while outcome-based pricing keeps both the client and Keystone Systems pulling toward the fastest path to done.
- **Handoff is the default, not the only option.** Most engagements end with a clean handoff back to the client's team, documentation included, so the client is never dependent on Keystone Systems to maintain what was built. For companies that want continued senior technical leadership without a full-time hire, ongoing or **fractional-CTO-style retainer** arrangements are also available, rather than a hard requirement that every engagement wind down.

### Bench depth and post-handoff support

- **Bench depth (resolved 2026-07, scoped; public framing updated 2026-08-08):** The founder has an established network of senior independent engineers — some full-time, some moonlighting alongside another role, with backgrounds at companies like Stripe, Airbnb, Amazon, Microsoft, and other companies at that scale — he brings in when a project calls for it. **The operating model stays founder-led internally**: the founder personally scopes every engagement and decides who, if anyone, gets looped in. This is not a pivot to a dev-shop or marketplace model.
  - **Public marketing site (`apps/web`) — updated 2026-08-08.** The site now leads with the network rather than a solo founder: "a network of senior-plus engineers, with backgrounds at companies like Stripe, Airbnb, Amazon, Microsoft, and other companies at that scale" (true, per the founder). Still no headcount numbers and no individual engineer names. The change from the 2026-07 decision is narrower than it looks: what's new is naming the companies at the network level and dropping "solo, founder-led" language and the founder's personal bio/LinkedIn link (see "Founder Background" above) — driven by wanting to reduce how identifiable the founder personally is, given a current full-time role elsewhere. The internal operating model (founder personally scopes everything) is unchanged; it's just no longer narrated publicly as a single named point of contact.
  - **Project intake portal (unchanged):** still planned (`docs/intake-portal-design.md`, `apps/portal`) — once the founder assigns a specific network engineer to a client's project, that client sees who's working on it — name, background, relevant skills — inside their own authenticated portal dashboard. This is disclosure to a client with a live, matched engagement, not a public claim, and stays distinct from anything on `apps/web`.
  - **Wording guardrail:** wherever an individual engineer's background is shown (portal or otherwise), state it plainly with specifics — prior companies where shareable, years of experience — never a superlative like "world-class." On the public site, credentials stay at the network level (companies, seniority, kind of work) rather than tied to a named individual.
- **Post-handoff support window:** Not yet defined. The founder has not settled on specific terms (length of any bug-fix window, what's covered) and does not want to commit to specifics in copy yet. Do not state any support-window length, guarantee, or warranty language in public copy until this is explicitly decided.

---

## Target Clients

- Growing companies (startups through mid-size) that need principal/staff-level engineering judgment but don't have — or don't yet need — a full-time hire at that level
- Non-technical or semi-technical founders who have a working AI-generated prototype and need it hardened for real users
- Teams with an existing codebase who need outside, senior-level help without a long-term hiring commitment

---

## Positioning & Differentiation

- **Not a dev shop.** The firm doesn't compete on headcount, cheap hourly rates, or speed-of-delivery alone. It competes on the quality of technical decisions made early, which is what prevents expensive rework later.
- **Boring is a feature, not a bug.** The brand deliberately reads as understated and credible rather than flashy or "startup-trendy" — closer in tone to an established engineering firm than a scrappy agency. This is intentional: the target buyer (a CTO or founder evaluating a vendor) is reassured by steadiness, not entertained by branding.
- **Broader than pure custom development.** Because of the five service lines above, Keystone Systems should be understood and marketed as a technical judgment / systems-advisory practice — encompassing build, harden, audit, automate, and advise — not narrowly as "a software development shop."

---

## Brand Name & Voice

**Name:** Keystone Systems. "Keystone" refers to the load-bearing wedge stone at the top of an arch — the single piece that locks a structure together and lets it bear weight, which maps directly onto the firm's positioning around foundational, architecture-level decisions. The name also carries a private, personal layer of meaning for the founder (unrelated to the business's public positioning) that is intentionally not surfaced in any client-facing material.

**Domain:** keystone.systems (confirmed available/secured)

**Voice guidelines:**
- Plain, direct, low-pressure — no hype, no credential name-dropping, no em dashes in written copy
- Confidence comes from clarity and specificity, not superlatives ("senior engineering judgment," never "world-class" or "rockstar")
- Speaks to a technical or semi-technical buyer (CTO, VP Engineering, technical founder) who is reassured by substance, not flash

**Visual direction:** Clean, minimal, geometric — closer to how Stripe, Linear, or Vercel present themselves than a typical creative/marketing agency. Monochrome-first, single accent color, no gradients or "AI-generated glow" visual clichés, no mascots or overly rounded UI. (Full detail in the separate logo and landing page prompt documents.)

---

## Legal / Trademark Notes (for reference, not legal advice)

A USPTO trademark search was run on "Keystone Systems." No live exact-match conflict was found (a prior exact-match registration existed but is now dead/lapsed). The closest live conflicts in the same class (IC 042, software/IT services) are **Keystone Solutions** (Tennessee, reg. 2025) and **Keystone Strategy** (Boston, reg. 2007, "computer software design for others") — both adjacent, not identical, names in the same field. Practical use of "Keystone Systems" as a business name carries low risk; pursuing federal trademark registration would likely face some pushback given the Keystone Strategy registration. An attorney consult is recommended before any significant branding investment if formal trademark protection is a priority.