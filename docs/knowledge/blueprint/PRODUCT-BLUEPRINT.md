# PRODUCT BLUEPRINT

## AI-Native Project & Event Operations Platform (Moventios)

**Status:** Authoritative Reference  
**Date:** 2026-06-26  
**Purpose:** The single primary reference for Product Design, UI/UX, Frontend, Backend, AI Features, Documentation, Marketing, and Customer Education.

**Guiding Philosophy**  
The platform is built around **work**, not modules.  
Users think: “I need to prepare tomorrow’s event.”  
The platform guides them through the natural operational flow.

This document harmonizes existing strategy (`docs/strategy/`), business and product volumes (`docs/volumes/07-business.md`, `08-product.md`), the current application (facilities, events, approvals, booking flows), and prior workflow analysis into one coherent view.

It does **not** redefine engineering architecture (see Layers 1–3 and EPXA). All technical implementation must continue to respect existing patterns (command handlers, outbox, RLS, Stoic UX).

**Note:** Previous detailed research notes live in the sibling files in this directory. This `PRODUCT-BLUEPRINT.md` is the single integrated, implementation-ready document.

---

## 1. Platform Vision

**What the platform is**  
An **AI-Native Project & Event Operations Platform** that helps organizations plan, coordinate, execute, monitor, and audit real-world operations involving events, venues, projects, teams, logistics, schedules, resources, assets, vendors, finance, payments, approvals, and documentation.

**Who it serves**  
Mid-to-large organizations running hybrid physical-digital operations: event organizers, exhibition and conference producers, wedding and corporate event companies, venues, convention centers, hotels, production houses, creative/marketing agencies, and project-based service companies.

**Problems it solves**

- Operational chaos and double-booking
- Fragmented information across spreadsheets, email, and tools
- Lack of visibility and accountability during execution
- Manual reconciliation, audit risk, and financial leakage
- Slow, error-prone coordination between people and resources
- Fear of using AI on material decisions without guardrails

**What it intentionally does NOT try to become**

- A generic Enterprise Resource Planning (ERP) system
- A pure project management tool (Asana/ClickUp/Monday replacement)
- A consumer event app or ticketing platform
- A full accounting or HR system
- A generic knowledge base or intranet

**Positioning statement**  
The trusted operational partner that makes running events and projects feel predictable, transparent, and reliable — with AI that helps but never decides anything that matters.

---

## 2. Business Flow

The platform follows the complete real-world operational lifecycle:

**Lead → Discovery → Proposal → Quotation → Approval → Contract → Project/Event → Planning → Execution → Finance → Closing → Reporting → Repeat Business**

### Phase Details

| Phase         | User Goals                            | Key Decisions                           | Deliverables                   | Primary Roles          | Operational Outputs                   |
| ------------- | ------------------------------------- | --------------------------------------- | ------------------------------ | ---------------------- | ------------------------------------- |
| Lead          | Capture opportunity quickly           | Is this a fit?                          | Inquiry record                 | Sales, Owner           | Qualified lead, initial notes         |
| Discovery     | Understand requirements & constraints | Scope, dates, constraints, budget range | Survey / site notes, photos    | Event Manager + Client | Requirements document                 |
| Proposal      | Present realistic plan & value        | Scope, timeline, pricing, resources     | Proposal (timeline + budget)   | Event Manager          | Versioned proposal                    |
| Quotation     | Lock commercial terms                 | Discounts, payment terms                | Quote / revision history       | Sales + Finance        | Signed quotation                      |
| Approval      | Internal governance                   | Budget, resource availability, risk     | Approved plan                  | Ops, Finance, Owner    | Approval record + committed scope     |
| Contract      | Legal & financial commitment          | Terms, deposits, SLAs                   | Signed contract                | Owner + Client         | Contract + deposit schedule           |
| Project/Event | Kick off with full context            | Confirm resources & timeline            | Active project + workspace     | Event/Project Manager  | Timeline, budget, tasks, reservations |
| Planning      | Detailed coordination                 | Assignments, vendors, equipment         | Detailed plan, purchase orders | Manager + Team         | Allocations, vendor contracts         |
| Execution     | Deliver without surprises             | Real-time changes, issues               | Live status, incident logs     | On-site team + Manager | Activity log, access records          |
| Finance       | Accurate money movement & records     | Invoices, variances, payments           | Invoices, reconciliation       | Finance                | Ledger entries, payments              |
| Closing       | Complete & learn                      | Sign-off, returns, lessons              | Closure report                 | Manager + Client       | Completed project, assets returned    |
| Reporting     | Extract value & insight               | What worked, what to improve            | Reports, insights, templates   | Manager + Owner        | Performance data, updated knowledge   |
| Repeat        | Turn success into more business       | Relationship nurturing                  | Templates, case notes          | Sales + Manager        | Repeat opportunity, knowledge reuse   |

---

## 3. Workflow Library

Standardized workflows that the platform must support. Each workflow is triggered by user action or system event and produces clear outcomes.

### Core Workflows

**Receive Client / Lead**  
Trigger: Form submission, email, sales entry.  
Steps: Capture details → Auto-enrich → Qualify (ICP match + capacity preview) → Create inquiry.  
User interactions: Review & edit.  
System actions: Create record, suggest similar past jobs.  
AI assistance: Score fit, draft first qualification questions.  
Success: Qualified lead with next action.

**Create Proposal**  
Trigger: From lead or manually.  
Steps: Select template or similar past job → Generate draft timeline/budget/scope → Edit → Internal review.  
AI assistance: Generate first draft from brief + historical data.  
Success: Versioned proposal ready to send.

**Create Event / Project**  
Trigger: Approved proposal + contract + deposit.  
Steps: Define type, dates, venue → System kickoff.  
Success: Fully initialized workspace.

**Book Venue / Room**  
Trigger: Planning or direct request.  
Steps: Search availability → Select slot + resources → Conflict check → Reserve (or suggest alternatives).  
System actions: Create booking, block calendar, create budget lines.  
AI assistance: Suggest optimal slots, detect conflicts.  
Success: Confirmed reservation with no overlaps.

**Assign Team & Allocate Equipment**  
Trigger: Planning phase.  
Steps: View availability → Assign people/gear → Confirm.  
AI assistance: Recommend crew based on skills + past performance.  
Success: All required resources allocated.

**Manage Vendors**  
Trigger: Need for external service.  
Steps: Select from knowledge base or new → Create PO → Track delivery/execution.  
Success: Vendor performance recorded for future recommendations.

**Approve Budget / Scope Change**  
Trigger: Any material change during planning or execution.  
Steps: Request with impact → Route to approvers → Decision + note.  
AI assistance: Prepare context + risk summary.  
Success: Approved change with full audit trail.

**Execute Event**  
Trigger: Day-of start.  
Steps: Command center view → Check-ins (access passes) → Live updates → Incident logging → Real-time adjustments.  
Success: Smooth execution with complete log.

**Close Project**  
Trigger: All deliverables complete + client sign-off.  
Steps: Return assets → Reconcile budget → Capture lessons → Generate report.  
AI assistance: Draft close report and suggested template updates.  
Success: Project marked complete, knowledge captured.

**Invoice Client**  
Trigger: Milestone or completion.  
Steps: System proposes invoice from budget/actuals → Review → Send.  
Success: Invoice issued + payment tracked.

**Generate Report**  
Trigger: Manual or scheduled.  
AI assistance: Summarize performance, profitability, risks, recommendations.  
Success: Actionable report stored and shareable.

---

## 4. User Journey

### Primary Roles & Daily Experience

**Owner / Executive**  
Objectives: Portfolio health, risk, profitability, scalability.  
Navigation: Home (portfolio view) → Reports → Approvals (escalations only).  
Primary screens: Home dashboard, Executive reports, Approval queue (high-value only).  
Frequent actions: Review alerts, approve major changes, view utilization & margin.

**Project / Event Manager** (Core daily user)  
Objectives: Deliver on time, on budget, happy client.  
Navigation: Home → Projects/Events list → Specific Project workspace.  
Primary screens: Project Overview, Timeline, Tasks, Schedule, Resources, Budget, Approvals, Activity.  
Frequent actions: Update timeline, assign people, book rooms, request/respond to approvals, communicate with client.

**Venue / Facility Manager**  
Objectives: Maximize safe utilization, protect assets.  
Primary screens: Resources (facilities/rooms), Calendar, Booking requests, Utilization reports.  
Frequent actions: Review incoming bookings, block dates, approve or suggest alternatives.

**Finance**  
Objectives: Accuracy, cash visibility, clean close, audit readiness.  
Navigation: Finance section + deep links from projects.  
Primary screens: Budget overview, Invoices, Reconciliations, Project financials.  
Frequent actions: Review proposed invoices, reconcile, run reports.

**Sales**  
Objectives: Win good business quickly.  
Primary screens: Leads, Proposals, Pipeline view inside Projects.  
Frequent actions: Create/edit proposals, check availability for promising dates.

**Operations / Warehouse / Crew Lead**  
Objectives: Right resources at right place/time.  
Primary screens: Resources, Tasks assigned to me, Calendar, Mobile command views.  
Frequent actions: Confirm allocations, scan/check-in, log issues.

**Vendor (external)**  
Limited portal view: Assignments, confirmations, documents, payment status.

**Client**  
Lightweight portal: Progress view, approvals, files, schedule, communication.

**Common Pattern**  
Everyone lands in a personalized Home/Command Center that surfaces the work that needs them today, then drills into project-centric workspaces.

---

## 5. System Flow

When key user actions occur, the platform automatically performs supporting work so users only see meaningful operational state.

**Example: Create / Kickoff Event/Project**

1. User confirms contract + deposit (or direct create after approval).
2. System creates core Project/Event record.
3. Generates Timeline (from template + AI suggestion).
4. Creates Calendar entries.
5. Initializes Budget ledger lines.
6. Prepares Tasks / checklist.
7. Reserves requested Rooms & Resources (conflict-checked).
8. Initializes Approval instances for gated items.
9. Prepares Notifications & Realtime subscriptions.
10. Seeds AI Context (past similar projects + knowledge base).
11. Creates full Activity / Audit trail.

**Example: Book Room**

- Submit booking → Handler validates → Creates Booking record → Updates availability → Creates budget impact → Publishes domain event → Workers notify relevant parties.

Users experience the result (confirmed slot, updated timeline, budget line) without orchestrating the steps.

All system actions happen through command handlers + outbox pattern for reliability and auditability.

---

## 6. Information Architecture

Navigation is organized around the work people actually do.

### Top Level

- **Home** — Personalized command center (“What needs me today?”)
- **Workspace** — Switch between organizations/teams (multi-tenant)
- **Projects**
- **Events**
- **Calendar** — Master view with filters and resource layers
- **Resources** — Facilities, Rooms, Equipment, Crew, Inventory
- **Approvals** — Unified queue
- **Finance** — Budgets, invoices, reconciliations (deep-linked from projects)
- **Reports & Insights**
- **Knowledge** — Templates, playbooks, lessons, search
- **Settings** (minimal)

### Inside a Project or Event (consistent structure)

- Overview
- Timeline
- Tasks
- Schedule
- Venue / Resources
- Budget
- Team & Assignments
- Vendors
- Files
- Activity
- Insights
- Approvals (contextual)
- Communication
- History

This structure makes the natural flow obvious and keeps context together.

---

## 7. UI/UX Blueprint

**Guiding Experience**  
Stoic, data-dense, high signal-to-noise, professional, calm. Every pixel earns its place. Keyboard-first. Excellent empty, loading, and error states.

### Key Screens

**Home / Command Center**  
Purpose: Immediate situational awareness and action.  
Audience: All internal roles (personalized).  
Primary action: Act on the most important item.  
Critical information: Today’s events & tasks, urgent approvals, open risks, utilization snapshot, AI briefing.  
Layout: Cards + prioritized list + quick actions.  
AI assistance: Daily briefing + proactive suggestions.

**Project / Event Overview**  
Purpose: One-screen understanding of status and next actions.  
Primary action: Jump to the work that matters most.  
Critical information: Health indicators, key dates, budget status, open approvals, recent activity.  
AI assistance: Summary + recommended next steps.

**Timeline + Schedule**  
Purpose: See and adjust the plan visually.  
Primary action: Drag to reschedule or add items.  
Critical information: Dependencies, conflicts, resource load.  
AI assistance: Conflict detection + alternative suggestions.

**Approvals**  
Purpose: Fast, confident governance decisions.  
Primary action: Approve or reject with note.  
Critical information: Full request context, impact on timeline/budget/resources, history.  
Layout: Table + rich detail drawer/panel.  
Realtime updates.

**Resources & Allocation**  
Purpose: Book and manage capacity.  
Primary action: Find available slot + reserve.  
Critical information: Availability, conflicts, utilization.

**Budget View**  
Purpose: See money in the context of the work.  
Primary action: Review variance or approve change.  
Critical information: Planned vs actual, forecast.

All screens follow progressive disclosure and provide clear “what happens next” guidance.

---

## 8. AI Copilot

**Core Rule**  
AI recommends and explains. Humans decide and approve — especially anything involving money, access, contracts, safety, or external commitments.

**High-Value Use Cases**

- Generate initial project plan / event timeline / checklist from brief + similar past work (with citations).
- Detect scheduling and resource conflicts + propose alternatives.
- Suggest vendors based on fit, availability, and historical performance.
- Draft budget from scope and historical data.
- Summarize meetings or long threads into action items.
- Prepare approval packages (context + recommendation + impact).
- Predict risks on current plan.
- Generate post-event report + suggested knowledge updates.
- Answer grounded operational questions (“What was our average crew utilization on corporate events last quarter?”).

**UI Patterns**

- Contextual “Ask AI” or always-available copilot panel.
- Suggestions appear as actionable cards with “Why”, “Impact”, “Apply / Edit / Dismiss”.
- Every material suggestion shows source + confidence.
- Full audit trail of AI-influenced actions.

---

## 9. Customer Journey & Marketing Funnel

| Stage       | User Intent                          | Key Questions                                            | Required Content / Pages                                      | CTAs                                   | Success Metric                  |
| ----------- | ------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------- | ------------------------------- |
| Discovery   | Find a solution for operational pain | “Is there something better than spreadsheets?”           | Homepage, use-case pages, “event operations software” content | “See how it works”, “Watch 2-min demo” | Time on site, sign-up intent    |
| Education   | Understand how it works              | “Will this actually solve my coordination problems?”     | Guides, templates (free run-of-show, budget), comparison      | Download template, “Try the demo”      | Template downloads, video views |
| Evaluation  | Compare & validate fit               | “Will it work for my type of events?”                    | Case studies, ROI calculator, security/audit page             | “Book a demo”, “Start trial”           | Demo bookings, trial starts     |
| Trial       | Experience first value fast          | “Can my team actually use this?”                         | Guided onboarding, sample data (wedding / conference)         | “Create first venue”, “Book a room”    | Time to first booking           |
| Activation  | Make it part of daily work           | “This is now how we run events.”                         | In-app checklists, tooltips, playbooks                        | Complete onboarding checklist          | 3+ active projects/events       |
| Daily Usage | Rely on it for coordination          | “What needs my attention today?”                         | Home, Project workspaces, Approvals                           | Daily return                           | Weekly active usage             |
| Expansion   | Get more value                       | “Can we use this for the whole team / more event types?” | Advanced features, AI copilot, reports                        | Enable AI, invite team                 | Team seats added, features used |
| Advocacy    | Recommend and co-create              | “This made us much more professional.”                   | Success stories, referral program                             | Share story, refer colleague           | Referrals, case study creation  |

---

## 10. Product Experience Principles

- **Workflow-first, not module-first** — Navigation and screens follow how people actually work.
- **Project-centric** — Most context lives inside a Project or Event workspace.
- **Context over modules** — Users see what they need where they need it.
- **AI as Copilot only** — AI accelerates; humans own every material decision.
- **Progressive disclosure** — Show the right amount of information at the right time.
- **Minimal cognitive load** — Data-dense but calm. High signal-to-noise (Stoic UX).
- **Operational clarity** — Every screen answers: What is my goal? What decision do I need to make? What should I do next?
- **Trust through transparency** — Full history, clear impact of changes, explainable AI.
- **Auditability without complexity** — Strong records are a natural byproduct of doing the work.
- **Value-Friction Resolution** — Every feature must remove more friction than it creates.

---

## 11. Implementation Roadmap

### Phase 1 — Core Operational Workflows (Foundation)

**Objectives:** Make the basic end-to-end flow reliable and visible.  
**Dependencies:** Existing booking, approvals, and handler infrastructure.  
**Deliverables:**

- Strong Home/Command Center
- Project/Event creation with automatic timeline, budget, and reservations
- Improved Timeline + Resource allocation with conflict handling
- Polished unified Approvals
- Educational states and basic AI draft generation (propose only)  
  **Priority:** Highest  
  **Expected user value:** First-time users reach a working event faster; daily users spend less time coordinating.

### Phase 2 — Project Workspace & Daily Execution

**Objectives:** Make the full planning-to-execution loop feel natural.  
**Deliverables:**

- Consistent Project/Event workspace (Overview, Tasks, Schedule, Resources, Budget, Activity)
- Mobile-friendly on-site views (check-in, task completion, incident logging)
- Basic vendor and team assignment flows  
  **Priority:** High  
  **Expected user value:** Managers have one place for the entire job.

### Phase 3 — Resource, Finance & Closing

**Objectives:** Close the loop on money, assets, and learning.  
**Deliverables:**

- Deeper resource inventory & allocation
- Budget tracking with actuals and variance
- Invoice generation from work
- Project close + lessons capture  
  **Priority:** Medium-High  
  **Expected user value:** Finance and ops have shared reality; clean closes become normal.

### Phase 4 — AI Copilot

**Objectives:** Amplify humans without removing control.  
**Deliverables:**

- Proposal / timeline / checklist generator
- Conflict detection + suggestions
- Risk prediction and approval package preparation
- Grounded Q&A in Knowledge  
  **Priority:** Medium (after core workflows are stable)  
  **Expected user value:** Dramatic reduction in planning time while maintaining full human oversight.

### Phase 5 — Knowledge, Templates & Customer Education

**Objectives:** Make success repeatable and help users get better over time.  
**Deliverables:**

- Template library + industry packs
- Knowledge base with AI search
- In-product playbooks and contextual help  
  **Priority:** Medium  
  **Expected user value:** New users ramp faster; organizations institutionalize their own best practices.

### Phase 6 — Growth & Ecosystem

**Objectives:** Scale adoption and expand value.  
**Deliverables:**

- Client/vendor portals
- Advanced reporting & insights
- Marketplace for templates/vendors (later)
- Vertical packs  
  **Priority:** Later

**Overall Guidance**  
Prioritize anything that makes the core work (plan → execute → close) feel guided, visible, and low-friction. Add AI and advanced capabilities only after the underlying workflows are solid.

---

**End of Product Blueprint**

This document, together with the existing strategy and volumes, provides a shared understanding for all future design and implementation work. Every new feature or screen should be traceable back to a workflow, a role journey, or a clear user goal described above.
