# Keystone Admin Tool — Notion Workspace Design

*Companion to `docs/admin-tool-design.md` (§8). Defines the Notion workspace the admin tool
provisions and syncs with: databases, properties, ownership, value mappings, the project-page
skeleton, and how webhook events route. This is greenfield — no existing Notion structure is
assumed — so it doubles as a recommended task/notes/meetings setup and as the integration contract.*

Status: **deferred**. This is the design for a *future* deeper Notion integration. **v1 does not
build any of this** — it only links a Notion doc URL to a project (see `docs/admin-tool-design.md`
§8). Keep this doc as the blueprint for if/when the two-way integration is worth extending; nothing
here is scheduled.

---

## 1. Principles this inherits

From the main design's ownership rule — the thing that keeps fast two-way traffic safe:

- **Every property has exactly one owner and syncs one direction.**
- **Tool-owned (mirror)** properties are authoritative in Postgres, pushed *into* Notion for display
  and for Notion AI to reason over, and never adopted back if hand-edited (authority-wins).
- **Notion-owned** properties are authoritative in Notion, read *out* into the tool's read-back
  cache, and never written by the tool.

A visible callout at the top of every project page tells the founder which fields are tool-managed,
so there is no ambiguity about what not to hand-edit.

---

## 2. Workspace layout

**One shared workspace** (a single teamspace is fine; per-client workspaces are unnecessary for a
solo practice and would fragment Notion AI's context). Four databases, all shared with the admin
integration:

| Database | Role | Owner of most fields |
|---|---|---|
| **Projects** | The hub. One page per engagement; the working surface. | Mixed (tool mirror + Notion working fields) |
| **Tasks** | The task manager. Manual tasks *and* AI-meeting-notes action items. | Notion |
| **Meetings** | Meeting record. AI meeting notes create pages here. | Notion |
| **Clients** *(optional)* | Thin company wiki / relation anchor. | Tool (mirror) |

Recommendation: **one global Tasks database**, not per-project task lists — it makes a real task
manager (cross-project "everything due this week"), and Notion AI answers across it. Tasks relate to
a Project.

---

## 3. Link-key strategy (how the tool and Notion find each other)

- Each Notion page that mirrors a Postgres row carries an **`Admin ID`** text property = the Postgres
  UUID. The tool sets it once on creation.
- The tool stores the returned Notion page id in Postgres (`projects.notion_page_id`).
- **Webhook routing** rides the relations: a Task or Meeting event → its **Project relation** →
  the project's `notion_page_id` → the Postgres project. No separate mapping table needed.
- `Admin link` (URL) on each mirrored page deep-links back to the tool, so navigation is two-way.

---

## 4. Projects database (the hub)

| Property | Notion type | Owner | Sync | Notes |
|---|---|---|---|---|
| Name | Title | Notion (tool seeds) | push once | Tool sets initial name; founder may rename freely, not re-pushed |
| Admin ID | Text | Tool | set once | Postgres project id — the join key |
| Admin link | URL | Tool | push | Deep link to `/projects/[id]` |
| Client | Relation → Clients | Tool seeds | push once | Or plain text if the Clients DB is skipped |
| **Status** | Select | **Tool (mirror)** | push | `Lead · Scoping · Contracting · Active · Handoff · Closed · Lost` |
| **Service line** | Select | **Tool (mirror)** | push | The six service lines |
| **Amount** | Number ($) | **Tool (mirror)** | push | Engagement value |
| **Invoice status** | Select | **Tool (mirror)** | push | `None · Draft · Sent · Overdue · Partly paid · Paid` (derived) |
| **Contract status** | Select | **Tool (mirror)** | push | `None · Draft · Sent · Viewed · Signed · Declined · Expired` |
| Target date | Date | Tool (mirror) | push | From `projects.target_end_date` |
| **Working phase** | Select | **Notion** | read-back | Founder's sense of the work: `Discovery · Building · Review · Blocked · Wrapping up` |
| **Next action** | Text | **Notion** | read-back | One-liner: what's next |
| Tasks | Relation → Tasks | Notion | via Tasks | |
| Meetings | Relation → Meetings | Notion | via Meetings | |
| **Open tasks** | Rollup (count) | Notion | read-back | Tasks where Status ≠ Done |
| **Open action items** | Rollup (count) | Notion | read-back | Tasks where Type = Action item & Status ≠ Done |

The **mirror** block (Status, Service line, Amount, Invoice status, Contract status) is exactly what
lets Notion AI answer things like *"which Active projects have an Overdue invoice and no signed
contract"* — all real, tool-sourced truth sitting in the page it reasons over.

The **read-back** block (Working phase, Next action, Open tasks, Open action items) is what the
tool's project panel and dashboard show, kept live by the webhook.

---

## 5. Tasks database (task manager + AI action items)

| Property | Notion type | Owner | Sync | Notes |
|---|---|---|---|---|
| Name | Title | Notion | — | |
| Status | Status (To-do / In progress / Done) | Notion | read-back (rollup) | Notion's native Status type |
| Type | Select (`Task` / `Action item`) | Notion | read-back (rollup) | Distinguishes AI-meeting-notes action items from manual tasks |
| Project | Relation → Projects | Notion | routing key | How task events map to a project |
| Source meeting | Relation → Meetings | Notion | — | Action items link the meeting that generated them |
| Due | Date | Notion | — | |
| Priority | Select (`Low/Med/High`) | Notion | — | |
| Assignee | Person | Notion | — | Founder / bench consultant |

The tool never writes here. It only counts: open tasks and open action items per project, surfaced
in the read-back panel.

---

## 6. Meetings database (AI meeting notes land here)

| Property | Notion type | Owner | Sync | Notes |
|---|---|---|---|---|
| Name | Title | Notion (AI) | read-back (recent list) | AI meeting notes name it |
| Date | Date | Notion | read-back | |
| Project | Relation → Projects | Notion | routing key | Set once per meeting (see §9) |
| Client | Relation → Clients | Notion | — | Optional; derivable via Project |
| Type | Select (`Discovery · Check-in · Scoping · Review · Handoff`) | Notion | — | |
| Summary | Page body / text | Notion (AI) | — | AI-generated |
| Action items | Relation → Tasks | Notion (AI) | — | AI-generated tasks (Type = Action item) |
| Attendees | Person / Text | Notion | — | |

Read-back: the tool lists a project's most recent meetings (date · title · link) in the project
panel, so the last conversation is one glance from the invoice and contract state.

---

## 7. Clients database (optional, thin)

Postgres is the real system of record for clients; a Notion Clients DB is only worth it if you want
a company wiki page per client. If used, keep it minimal:

| Property | Notion type | Owner | Sync |
|---|---|---|---|
| Name | Title | Tool (mirror) | push once |
| Admin ID | Text | Tool | set once |
| Admin link | URL | Tool | push |
| Projects | Relation → Projects | Notion | — |
| (page body) | Wiki notes | Notion | — |

If skipped, the Projects `Client` property is plain text and the Meetings `Client` relation is
dropped.

---

## 8. Value mappings (keep enums aligned)

The tool writes select values by name; Notion auto-creates a missing option on write, but pre-create
them so colours/order are deliberate.

- **Status** ← `project.status`: `Lead, Scoping, Contracting, Active, Handoff, Closed, Lost`
  (title-cased 1:1 with the Postgres enum).
- **Service line** ← `project.service_line`: the six human labels (Net New Development, Vibe-Code to
  Production, Business Process Automation, Acquisition Due Diligence, AI Training & Setup, Existing
  Codebase Improvement).
- **Invoice status** ← derived by the tool from the project's invoices:
  `None` (no invoices) · `Draft` · `Sent` (open, not overdue) · `Overdue` · `Partly paid` · `Paid`.
- **Contract status** ← the project's contract: mirrors the Zoho-backed enum.

`lib/notion/schema.ts` holds the property IDs/names and these value maps in one place, so a Notion
rename is a one-file change.

---

## 9. Project-page body skeleton

Created by the tool on project provisioning (code-defined blocks, not a duplicated template page):

```
[callout]  🔒 Managed by Keystone Admin. Status, Amount, Invoice, and Contract fields
           sync from the admin tool — edit those there, not here.  → <Admin link>

## Scope
   (empty — founder/Notion AI fills)
## Notes
## Deliverables
## Handoff
```

Tasks and Meetings live in their own databases (related to this project), not inline, so they show up
in cross-project views and Notion AI. The founder can add a linked-database view of Tasks filtered to
this project inside the page if they like that layout — that is a manual Notion nicety, not something
the tool depends on.

---

## 10. Webhook event routing (Notion → tool read-back cache)

`/api/webhooks/notion` verifies the signature, dedupes on the event id, then:

| Change in Notion | Tool response |
|---|---|
| Project **Working phase** / **Next action** edited | Refresh those fields in `notion_project_state` for that project |
| Task created / **Status** or **Type** changed | Map via Task→Project relation; recompute Open tasks + Open action items for that project |
| Meeting created / dated / re-linked | Map via Meeting→Project relation; refresh the project's recent-meetings list |
| A **tool-owned mirror** property hand-edited (Status, Amount, …) | Ignore, or re-push the authoritative value (authority-wins) — never adopt |

Then Supabase Realtime streams the cache row change to any open project page or dashboard. Debounce
coalesces rapid edits to one page; events whose actor is our own integration are ignored (loop
guard). The cron backstop reconciles anything a missed webhook left stale.

---

## 11. AI meeting notes flow (the heavily-used path)

1. Founder runs **AI meeting notes** on a call → a **Meetings** page is created with an AI summary.
2. AI-generated action items become **Tasks** with `Type = Action item`, linked to the meeting.
3. The meeting's **Project relation** is set (see the manual touch below); action items inherit the
   project (via a Notion database automation, a template button, or manually).
4. Webhook fires → tool recomputes the project's Open action items and recent meetings → Realtime →
   the project panel in the tool shows "3 open action items · last meeting: Scoping call, Jul 10"
   next to the invoice and contract state — no refresh.

**The one manual touch:** AI meeting notes will not know which engagement a call belongs to. Set the
Meeting's **Project relation** once per meeting (a Notion template/button on the Meetings DB makes
this one click, and can default the action items' project). Everything downstream is automatic. If
you would rather the tool infer the project (e.g. by matching attendees to client contacts), that is
possible but heuristic — flagged as an open choice.

---

## 12. Setup checklist

1. Create the workspace/teamspace and the **Projects · Tasks · Meetings** (and optional **Clients**)
   databases with the properties above.
2. Pre-create the Select options for Status, Service line, Invoice status, Contract status, Type,
   Working phase, Priority (deliberate colours/order).
3. Create a **Notion internal integration**; share all databases with it.
4. Capture each database id → `NOTION_PROJECTS_DB_ID`, `NOTION_TASKS_DB_ID`, `NOTION_MEETINGS_DB_ID`,
   `NOTION_CLIENTS_DB_ID`.
5. Register the change subscription → `/api/webhooks/notion`; store `NOTION_WEBHOOK_SECRET`.
6. Encode property IDs/names + value maps in `lib/notion/schema.ts`.
7. (Optional) Add a Meetings template/button that sets Project and defaults action-item project.

> `NOTION_TASKS_DB_ID` and `NOTION_MEETINGS_DB_ID` are new relative to the main design's env list;
> fold them into `apps/admin/.env.example` when this is adopted.

---

## 13. Open choices (yours to call)

1. **Clients DB — use it or skip it?** Recommended thin, for a per-client wiki page. If skipped,
   `Client` is plain text and Meetings lose the Client relation.
2. **Working phase vocabulary.** Proposed: `Discovery · Building · Review · Blocked · Wrapping up`.
   Adjust to how you actually think about a project's state — it is Notion-owned, purely for glance
   value in the tool.
3. **Meeting → Project linking.** Manual one-click per meeting (recommended, reliable) vs. tool
   infers from attendees (automatic but heuristic).
4. **Tasks granularity.** One global Tasks DB (recommended) vs. task lists per project page.
5. **Retainer projects.** For ongoing/fractional-CTO work, does one long-lived Notion project page
   fit, or do you want a page per billing period? (Affects nothing structural — just how you file it.)
```
