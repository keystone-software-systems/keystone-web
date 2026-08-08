# Open Decisions / TODO

Things intentionally left vague or unaddressed in current site copy, to revisit once decided.

- [ ] **Post-handoff support terms.** About page currently says only "if something delivered doesn't hold up the way it should, that's on Keystone Systems to fix, not on you to discover the hard way" — deliberately no specific window length or scope. Once decided (e.g. a 30-day bug-fix window for build/harden/automate/modernize engagements), update:
  - `apps/web/app/about/page.tsx` (Approach section) with concrete terms
  - `docs/company-context.md` under "Bench depth and post-handoff support"
- [x] **Bench depth specificity — resolved 2026-07, scoped.** Superseded in part 2026-08-08, see below. Bench depth stays visible in full only inside the planned intake portal (`docs/intake-portal-design.md`), and only to a client once matched to a specific engineer on their own project — not general marketing. See `docs/company-context.md` under "Bench depth and post-handoff support."
- [x] **Public site repositioned around the network — resolved 2026-08-08.** `apps/web` no longer describes Keystone as "solo, founder-led" or narrates the founder's individual career trajectory. It now leads with a network of senior-plus engineers with backgrounds at companies like Stripe, Amazon, and Microsoft (true, network-level, no individual names or headcount). The founder's personal LinkedIn link was removed from the footer and About page. Reason: reduce how identifiable the founder is personally, given a current full-time role elsewhere. Files touched: `apps/web/app/about/page.tsx`, `apps/web/app/page.tsx`, `apps/web/app/layout.tsx`, `apps/web/components/footer.tsx`. See `docs/company-context.md` under "Founder Background" and "Bench depth and post-handoff support."
- [ ] **No social proof anywhere on the site.** No testimonials, case studies, or before/after examples. Add once real client examples exist and are cleared to share.
