# Marketing Plan — Keystone Systems & StackDiligence

*Solo-founder, bang-for-buck prioritization. Two brands, two buyer motions — channels are planned separately, not shared.*

## Operating constraints (read before picking channels)

- **Solo founder, limited hours.** Time budget matters more than channel count. Prioritize ruthlessly.
- **Founder identity stays non-public.** The founder holds a full-time role elsewhere and does not want either brand traceable back to them by a colleague or employer. This rules out the standard solo-consultant playbook of founder-led personal-brand content (LinkedIn thought leadership under a real name, conference talks as "founder of X," podcast guesting). Both brands post as the *company*, never as a named person.
- **No social proof yet.** No testimonials, case studies, or before/after examples until real client work exists and is cleared to share. Content marketing has to run on frameworks/opinions, not proof, for now.
- **No hype voice.** No superlatives, no em dashes, no urgency language, on either brand's public copy — this applies to marketing copy too, not just the site.
- **Keep the two brands separate.** No shared content, no cross-referencing in copy, no conflating audiences.
- **Note:** `docs/stack-diligence-init.md`'s About-page draft currently names "Cedar" and uses first-person founder narration — that predates and conflicts with the current no-Cedar / no-personal-narrative guardrail in `CLAUDE.md` and `company-context.md`. Flag for a rewrite before that page ships.

## Why the channel mix differs by brand

**Keystone Systems** has five service lines and a broad-ish buyer pool (startup founders, CTOs, non-technical founders with AI prototypes). Volume-oriented, benefits from inbound/content that compounds.

**StackDiligence** has one service line and a small, identifiable buyer universe (PE/VC partners doing smaller software deals, plus the intermediaries around them). Relationship- and referral-oriented — content is a supporting asset, not the primary channel.

---

## Keystone Systems — channel plan

### Tier 1 — do first

1. **Warm referral flywheel.** Direct, personal 1:1 outreach to the founder's existing professional network (former Stripe/Microsoft colleagues, past clients) — not a broadcast — explaining what Keystone does and asking for intros. Highest conversion, near-zero cost. Cadence: quarterly touch.
2. **Signal-based outbound for "Vibe-Code to Production."** This is the most identifiable, highest-intent segment: founders who just shipped something in Bubble/Replit/Lovable/Cursor and are hitting scaling, security, or reliability walls. Source leads from Product Hunt launches, IndieHackers "I built X" posts, no-code community showcases, and X/Twitter searches for phrases like "vibe coded" plus "security"/"scale"/"help." Outreach references their actual product, not a template.
3. **Company-brand content on LinkedIn/X.** Post under the Keystone Systems name, no personal byline — opinionated, specific judgment frameworks ("when to rebuild vs. patch," common failure patterns in AI-generated code). Builds inbound signal without exposing the founder. Cost is writing time only; compounds.
4. **SEO landing pages per service line.** The site is already template-driven off `apps/web/app/solutions/content.ts`. Extend with problem-specific long-tail pages ("hardening a Replit app for production," "technical review before a seed round") targeting actual searcher intent rather than generic service pages. Cheap to add, compounds over months.

### Tier 2 — moderate effort, worth it once Tier 1 is running

5. **Partner referral network.** One-time outreach + quarterly touch to accelerators/incubators, no-code agencies/freelancers who don't do hardening work themselves, and startup-focused lawyers/CPAs — same referral-partner logic as StackDiligence, aimed at founders instead of PE.
6. **Start banking case-study material now.** Log outcome metrics on every engagement (with client permission to anonymize later), even though nothing can be published yet. Free, and removes the lag once the no-social-proof constraint lifts — at that point case studies become the highest-leverage channel available.

### Tier 3 — skip or defer

7. **Paid ads (Google/LinkedIn).** Expensive per lead for a considered B2B purchase with no social proof to close the credibility gap. Revisit once case studies exist.
8. **Conference speaking / podcasts under the founder's name.** Directly conflicts with the non-identifiable constraint. Skip.

---

## StackDiligence — channel plan

### Tier 1 — do first

1. **Referral partner network** (deal lawyers, CPAs, fractional CFOs, M&A advisors). The single best channel for this brand — a small, identifiable set of intermediaries sits in front of nearly every deal. Build a target list starting with the founder's existing network + local ACG members, send the personalized outreach already drafted in `docs/stack-diligence-init.md`, one follow-up, then quarterly light-touch (share an insight, not a pitch).
2. **Direct outreach on live, identifiable deals.** Use public deal signals (press releases, local business-journal M&A sections, Crunchbase/PitchBook alerts where affordable) to reach a PE partner or principal at the exact moment they're evaluating a target. Highest intent of any channel here; requires ~1 hr/week of monitoring.
3. **ACG (Association for Corporate Growth) and local PE/M&A meetups.** In-person relationship building where the exact buyer already congregates. High ROI for a relationship-sold service; modest time cost (a few events per quarter).

### Tier 2

4. **StackDiligence company LinkedIn — "AI-generated code risk in acquisition targets."** A timely, differentiated angle most diligence providers don't yet have a framework for. Post frameworks and observations, not case studies (none exist yet). Reasonable shot at earning press or backlink pickup given the timeliness.
5. **Sample report / mock engagement.** Build the placeholder deliverable already called out in the site spec (redacted or illustrative) so referral partners and PE partners can see the format before committing. This is a conversion asset that makes Tier 1 outreach convert better — not a channel on its own.

### Tier 3 — defer

6. **SEO content.** The buyer universe is small and doesn't discover this kind of service via search the way startup founders discover dev shops. Low volume for the effort; revisit only once Tier 1/2 relationships are established and there's spare time.
7. **Paid ads.** Worse ROI than for Keystone — the targetable audience is tiny and the decision is high-trust, high-consideration.

---

## 90-day sequencing

**Weeks 1–2**
Build the two target lists (Keystone warm-network list; StackDiligence referral-partner list + local ACG chapter). Set up minimal deal-signal monitoring for StackDiligence (Google Alerts, free-tier Crunchbase). Draft 4–6 banked company-brand posts per brand.

**Weeks 3–6**
Start warm outreach on both brands. Begin posting company content 1–2x/week per brand. Identify and message 5–10 vibe-code-to-production leads via Product Hunt/IndieHackers.

**Weeks 7–12**
Follow up on referral-partner intros. Attend the first ACG/local M&A event. Publish the first problem-specific SEO page per Keystone service line. Build the StackDiligence sample report.

## Time budget

Suggest capping total marketing time at ~4–6 hrs/week combined across both brands, weighted toward Tier 1 (referral/outbound) over content — content without a personal-brand byline is a weaker version of the classic solo-consultant playbook and has a longer payback period, so it shouldn't crowd out the higher-converting relationship work.

## Metrics

Track per channel, reviewed monthly: outreach sent, reply rate, calls booked, engagements closed, time spent. Kill any channel with no signal (zero replies, zero booked calls) after 90 days of consistent effort.
