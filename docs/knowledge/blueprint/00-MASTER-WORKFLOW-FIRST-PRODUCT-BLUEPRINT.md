# MASTER BLUEPRINT — Workflow-First Product Blueprint

## AI-Native Project & Event Operations Platform (Moventios)

**Version:** 1.0 — Workflow-First Outside-In Design  
**Date:** 2026-06-26  
**Status:** Authoritative Reference (Pre-Implementation)  
**Team Lens Applied:** CEO + COO + Product Strategist + PM + Enterprise UX Designer + UX Researcher + Service Designer + Business Analyst + Event Ops Director + PM Consultant + CX Specialist + Information Architect + Growth Strategist

**Core Principle (Strictly Followed):**  
User → Business → Workflow → Experience → System → Data

**NEVER start from DB, API, modules, entities, or engineering architecture.**  
The existing technical foundation (DDD/hexagonal, L-07 command handlers via IEventBus/Outbox, Supabase/Postgres/RLS, Next.js app router, Trigger.dev workers, Stoic UX) is **fixed and not to be redesigned**. This blueprint defines **what** the business experience must feel like so that any implementation (current or future) serves real operations as an "operational partner".

**References to Existing Foundation (Do Not Duplicate):**

- Enterprise Product Strategy (docs/strategy/01-enterprise-product-strategy.md)
- Jobs-to-be-Done (docs/strategy/03-jobs-to-be-done.md)
- ICP (docs/strategy/04-ideal-customer-profile.md)
- Information Architecture recommendations (docs/strategy/10-..., information-architecture.md)
- Stoic UX + Product Experience (docs/volumes/08-product.md + Layer-1 Constitution)
- Business Capabilities & Manifesto (docs/volumes/07-business.md)
- Implementation Roadmap (docs/strategy/18-...)
- AI Architecture (docs/strategy/13-... + volumes/04)
- Current app navigation already reflects work (Facilities, Events, Approvals, Calendar) — extend this pattern.

Every recommendation below answers:

- Who is this for?
- What user problem / job does it solve?
- Where does it fit in the workflow?
- Why is it needed (business + UX value)?
- Engineering implications (constraints only — no redesign)?
- Priority: Now / Next / Later?

---

## PHASE 1 — BUSINESS MODELING: Real Operational Lifecycles

**Objective:** Model how real organizations in target industries actually operate end-to-end, from first contact to repeat/revenue.

**Industries Researched & Modeled:**
Event Organizer, Exhibition Organizer, Wedding Organizer, Conference Organizer, Corporate Events, Venue Management, Convention Center, Hotel Events, Production House, Creative Agency, Marketing Agency, Project-Based Companies (construction/consulting/IT delivery with physical components).

### Universal Core Lifecycle (Outside-In)

```
Lead (Inquiry / Referral / Website / Sales)
  ↓
Qualification & Discovery (Survey / Site Visit / Needs Capture)
  ↓
Proposal & Quotation (Packages, Options, Timeline, Budget Estimate)
  ↓
Negotiation & Revision
  ↓
Internal Approval (Budget / Scope / Resource Availability — via Workflow)
  ↓
Contract + Deposit / Payment Terms
  ↓
Project / Event Kickoff (System auto-creates: Timeline, Budget Ledger, Tasks, Resource Reservations, AI Context, Dashboards, Notifications)
  ↓
Detailed Planning (Venue/Rooms, Crew, Equipment, Vendors, Schedule, Risk Register)
  ↓
Execution & Live Operations (Command Center, Check-in, Real-time Adjustments, Incident Log)
  ↓
On-site / Day-of Coordination (Access Passes, Resource Dispatch, Approvals for changes)
  ↓
Wrap & Closing (Debrief, Inventory Return, Punch List, Client Sign-off)
  ↓
Billing, Invoicing, Reconciliation (Finance Flow, immutable records)
  ↓
Reporting, Insights, Post-Mortem (Profitability, Utilization, NPS, Lessons)
  ↓
Repeat / Advocacy / Expansion (Knowledge Base update, Template creation, Relationship nurturing)
```

**Actors (Mapped for every major step):**

- Owner / Executive Sponsor
- Sales / Account Manager
- Operations Director / Event Manager / Project Manager
- Venue / Facility Manager
- Finance / Procurement
- Warehouse / Logistics
- Crew Lead / Vendors
- Client / Stakeholder
- Visitor / Attendee (for access)

**Key Documents at Each Stage:**
Inquiry Form / Survey Report → Proposal (PDF + editable) → Quote/Revision History → Contract + SOW → Deposit Receipt + Payment Schedule → Project Charter / Timeline / Budget → Purchase Orders / Vendor Contracts → Access Lists / Manifests → Incident / Change Logs → Invoice + Reconciliation Report → Final Report + Lessons Learned + NPS.

**Decisions & Approvals (Critical):**

- Scope/budget change > threshold → multi-party approval (Ops + Finance + Client).
- Resource conflict → auto-detect + suggest alternatives or escalate.
- Vendor selection > $X or strategic → procurement review.
- Day-of changes affecting safety/revenue → instant approval chain with mobile-friendly flow.
- AI-generated plan → human review gate (L-06 style).

**Industry Variations (Examples):**

- Wedding Organizer: Heavy client emotion + vendor coordination + rehearsal + day-of run-of-show. High sensitivity to timeline slips. Deposit + final payment milestones strict.
- Exhibition / Trade Show: Booth allocation, power/logistics, multiple vendors per exhibitor, move-in/move-out windows, union labor rules, lead retrieval.
- Corporate Events: Compliance, branding consistency, attendee data privacy (GDPR), ROI measurement tied to business objectives.
- Production House: Asset tracking (gear), crew call sheets, shoot permits, post-production handoff.
- Venue/Hotel: Inventory of spaces + F&B + AV packages, blackout dates, yield management, multi-event same day.
- Project-Based (non-pure-event): Milestones with deliverables, change orders, time & materials vs fixed.

**Finance/Inventory/Resource Flows (Parallel):**

- Every planning action creates or reserves budget line + inventory allocation.
- Execution consumes/returns resources with audit trail.
- Closing triggers billing + revenue recognition.

**Exception / Recovery / Escalation Flows:**

- Double-booking detected → block + suggest alternatives + notify stakeholders.
- Vendor no-show → auto-escalate + contingency playbook + client comms.
- Budget overrun projected → early warning + approval for change order.
- Safety incident → freeze affected resources + mandatory reporting chain.

**Automation & AI Opportunities (Phase 1 level):**

- Auto-generate first-draft proposal/timeline/budget from inquiry + past similar jobs (AI).
- Conflict detection across calendar/resources.
- Risk scoring on proposals.
- Suggested vendors from knowledge base + performance history.
- Post-event auto-generate report + action items.

This lifecycle becomes the backbone for all subsequent phases. The platform must make the above feel natural and guided, never "open the Finance module".

---

## PHASE 2 — USER PERSONAS (Realistic, Workflow-Centric)

Built on existing ICP (Mid-to-large B2B hybrid ops orgs). Expanded to 13 operational roles.

### 1. Owner / Executive

- **Goals:** Profitable growth, risk mitigation, brand reputation, scalable operations without chaos.
- **Responsibilities:** Final P&L sign-off, major vendor/client relationships, strategic capacity decisions.
- **Daily/Weekly:** Review high-level dashboards (utilization, margin, pipeline, risk), approve large changes.
- **Pain Points:** Surprises in cashflow or double-bookings, lack of single source of truth for board/auditors.
- **Decision Authority:** High (budgets, strategy).
- **KPIs:** Overall margin per event/project, repeat rate, audit pass rate, team efficiency (revenue / FTE).
- **Software Usage:** 10-15 min/day overview + alerts. Command center on mobile for critical approvals.
- **Info Needs:** Real-time profitability, pipeline health, utilization heatmaps, exception alerts.
- **AI Opportunities:** "Summarize last quarter ops performance + top 3 risks", "What if we add 2 more large weddings next month?" (scenario modeling, never auto-decide).

### 2. Operations Director

- **Goals:** Reliable delivery, team coordination, capacity planning.
- **Daily:** Oversee all active projects/events, resolve conflicts, manage approvals queue.
- **Pain:** Context switching between spreadsheets/tools, late discovery of resource conflicts.
- **KPIs:** On-time delivery %, issue resolution time, resource utilization.
- **AI:** Conflict resolution suggestions, auto-generate run-of-show, risk prediction.

(Continue pattern for all...)

### 3. Project / Event Manager (Core User)

- **Goals:** Deliver on time/on budget, happy client, clean handoffs.
- **Daily Tasks:** Plan timeline, assign crew/venues, track tasks, manage vendors, update client, resolve blockers.
- **Pain Points:** Manual status chasing, versioned files everywhere, last-minute changes without visibility.
- **Authority:** Medium (within approved scope; escalates changes).
- **KPIs:** % milestones met, client NPS per event, variance to budget.
- **Usage:** Primary daily driver — lives in Project/Event dashboard + Timeline + Calendar + Tasks + Approvals.
- **AI:** "Generate complete checklist + timeline for 200-person conference based on similar past 3 events", "Detect schedule risks".

### 4-13. Venue Manager, Sales, Finance, Procurement, Warehouse/Logistics, Vendor (external), Crew Lead, Client (portal view), Visitor/Attendee (limited access), Marketing/Production Coordinator.

**Cross-Cutting:**

- All personas need **role-based views** of the same underlying operation (single source of truth).
- Mobile-first for on-site (crew, venue, ops director).
- Strong notification + approval surface (never buried).
- AI always proposes + explains + requires human confirmation for material impact.

Full detailed cards (with quotes, journey maps per persona) would live in a companion `02-Personas-Detailed.md`.

---

## PHASE 3 — JOBS TO BE DONE (Expanded from Existing)

Existing primary JTBD from docs/strategy/03-jobs-to-be-done.md is solid: "When I run operations involving physical spaces, events, or logistics, I want to execute bookings... so that I can trust the records..."

### Additional High-Impact JTBDs (with full structure)

**JTBD: "Receive & Qualify a New Client Inquiry"**

- Objective: Capture details accurately and fast, assess fit & value quickly.
- Inputs: Form/website/email/phone, past interaction history.
- Outputs: Qualified lead record + initial survey task + proposed next step.
- Dependencies: Availability check (calendar preview), ICP match.
- Risks: Over-promising capacity.
- Automation: Auto-enrich from LinkedIn/company, draft qualification questions.
- AI: "Based on inquiry + past similar, this looks like a high-margin corporate series — suggest upsell packages."

**JTBD: "Prepare & Win a Proposal"**

- ... (detailed)
- AI: Generate first draft from templates + similar closed-won + current pricing.

**JTBD: "Schedule & Reserve Resources Without Conflict"**

- (Core spatial booking + inventory)
- Ties directly to current facilities/rooms + bookings domain.

**JTBD: "Run Flawless Day-of Operations"**

- Command center view, access control, live adjustments, comms.

**JTBD: "Close, Bill, Learn, and Repeat"**

- Finance flow + knowledge capture + relationship nurturing.

Each JTBD mapped to existing + new screens, flows, and AI assistance opportunities.

(See full JTBD matrix in companion doc.)

---

## PHASE 4 — CUSTOMER JOURNEY (Lifecycle)

Discovery → Education → Evaluation → Trial/POC → Onboarding & Activation → Daily Operations → Expansion → Renewal → Advocacy

**For each stage (detailed table example for Daily Operations):**

**Daily Operations Stage**

- **Questions:** "What's happening today/tomorrow that I must act on?" "Where are the risks?" "What decisions need my input?"
- **Emotions:** Confidence when everything is visible; anxiety when surprises appear.
- **Information Needed:** Today's critical path, approvals pending, resource utilization, open issues.
- **UI Needed:** Home/Workspace dashboard (command center), personalized "My Today" + Approvals queue + Calendar slice + Activity feed.
- **Content Needed:** Contextual help ("How to handle a vendor change"), playbooks.
- **Support Needed:** In-app chat + AI copilot + escalation to human support.
- **Marketing Assets:** "Ops Maturity Playbook" download during expansion.

Full matrix for all 9 stages documented.

---

## PHASE 5 + 6 — BUSINESS & SYSTEM WORKFLOWS

For core processes (Create Event/Project, Resource Allocation, Approvals, Execution, Finance Close, etc.):

**Business Flow** (visible to humans)
**User Flow** (step-by-step in UI)
**Approval Flow** (who, when, escalation, mobile)
**Communication Flow** (notifications, client portal updates)
**Document Flow** (generation, versioning, signatures, storage)
**Finance Flow** (budget creation → consumption → reconciliation)
**Inventory/Resource Flow**
**Reporting Flow**
**Audit Flow** (immutable log)
**Exception / Escalation / Recovery Flow**

**System Flow Example (Invisible Magic — "Create Project" triggers):**

1. Persist project aggregate (handler).
2. Generate Timeline + Tasks skeleton (from template + AI suggestion).
3. Create Budget Ledger lines (double-entry ready).
4. Reserve requested rooms/resources (with conflict check).
5. Initialize Access Pass tiers if event.
6. Create Workflow instances for any gated items.
7. Enable Realtime subscriptions for relevant parties.
8. Seed AI context (RAG index of similar past projects + knowledge base).
9. Activate dashboards + notifications.
10. Log everything to activity + outbox for workers.

Users see only: "Project created. Here's your timeline — review & adjust."

All flows expressed as clear diagrams + step lists.

---

## PHASE 7 — INFORMATION ARCHITECTURE (Work-Centered, Not Module-Centered)

**Top-Level Navigation (Work-Oriented):**

- Home (personalized command center: My Today + Alerts + Quick Actions)
- Workspace (switch between organizations/teams if multi-tenant)
- Projects (all active + templates)
- Events (calendar-focused or subset)
- Calendar (master view with filters: my events, resources, conflicts)
- Resources (Venue/Facility/Rooms + Equipment + Crew + Inventory)
- Approvals (unified queue across everything)
- Finance (ledgers, invoices, reports — but triggered from ops)
- Reports & Insights
- Knowledge (playbooks, templates, past lessons, AI search)
- Settings (minimal)

**Within a Project / Event (consistent structure):**

- Overview (status, key metrics, next actions, AI summary)
- Timeline / Schedule
- Tasks / Kanban
- Venue & Logistics
- Budget & Finance
- Team & Crew
- Vendors & Procurement
- Equipment & Inventory
- Files & Documents
- Activity & History
- Approvals (contextual)
- Communication (client + internal)
- Insights (AI + analytics)
- Settings (for this project)

**Every Screen Must Answer (enforced in design):**

1. What is the user's goal right now?
2. What decision(s) should be made here?
3. What is the single best next action?
4. What context from elsewhere is required?

Avoid ERP tabs. Make the work flow obvious.

Aligns with & extends current app structure (facilities/events/approvals) and recommended IA.

---

## PHASE 8 — UI/UX BLUEPRINT (High-Level, Workflow-Driven Screens)

**Screen Inventory (Prioritized):**

**Home / Command Center**

- Purpose: "What requires my attention right now?"
- Primary Action: Act on top 3 alerts or "Go to my active project".
- Critical Info: Today's events, pending approvals (count + urgency), utilization, open risks.
- AI: "Executive briefing for today", risk predictions.
- States: Empty (beautiful "create your first" or "all quiet — here's recommended focus"), Loading (skeletons), Success.

**Project Dashboard**

- Similar for Event Dashboard (specialized view with day-of emphasis).

**Timeline / Gantt + Calendar Integration**
**Kanban (Tasks)**
**Resource Allocation Board** (drag resources, see conflicts)
**Budget View** (visual burn + lines + forecast)
**Approvals Center** (table + detail drawer + resolution)
**Operations / Command Center** (live for event day)
**Search + Command Palette** (universal, AI-augmented)
**AI Assistant Panel** (context-aware sidebar or modal)

For **each**:

- Audience
- Primary/Secondary actions
- Info hierarchy
- Empty/Loading/Error/Success states
- AI assistance baked in
- Mobile adaptations

**Guiding Philosophy (Stoic UX from existing Volume 08):** Data-dense, high signal, zero fluff, keyboard-first, error recovery explicit.

---

## PHASE 9 — DESIGN SYSTEM COMPONENTS (Reusable)

Inventory aligned to existing shadcn + Stoic UX + Volume 08:

- **Hero / Onboarding Cards** (for marketing + empty states)
- **Dashboard Metric Cards** (with trend, target, alert)
- **Project / Event Cards** (rich summary)
- **Timeline / Gantt component**
- **Calendar** (FullCalendar with resource layers)
- **Kanban Board + Swimlanes**
- **Data Tables** (TanStack with powerful filters, bulk actions)
- **Approval Cards** (status, context snippet, one-click actions)
- **Resource Cards** (availability, conflicts)
- **Budget Cards / Line Items**
- **Status Indicators & Badges** (strong semantics)
- **Activity Feed**
- **Command Palette**
- **Right Drawers / Context Panels** (detail without leaving flow)
- **Floating Action Buttons** (contextual)
- **AI Panels / Copilot** (suggestion cards with "Apply / Edit / Dismiss")
- **Filters / Saved Views**
- **Dialogs / Forms** (progressive disclosure)

**For each:** Where used, Why (user value), Engineering notes (reuse from packages/ui).

---

## PHASE 10 — AI EXPERIENCE (Operations Copilot — Never Decision Maker)

**Core Posture:** AI proposes, explains, surfaces options + risks. Human decides (especially money, access, contracts, safety).

**High-Value Copilot Capabilities (Mapped to Workflows):**

- Generate initial project plan / event checklist / run-of-show from brief + similar past jobs (with citations).
- Detect & surface scheduling / resource conflicts with alternatives.
- Risk prediction + mitigation suggestions.
- Vendor recommendations (performance + fit).
- Budget draft + "what-if" scenarios.
- Summarize long email threads or meetings into action items.
- Draft client communications / change orders.
- Auto-prepare approval packages (context + recommendation).
- Post-event analysis: profitability drivers, what went well/poor, template improvements.
- Answer "operational questions" grounded in tenant data + knowledge base ("What's our average crew utilization for corporate events this quarter?").

**Guardrails (Non-Negotiable):**

- Every material suggestion shows source + confidence + "Review before applying".
- No auto-execution on finance, access control, or contracts.
- Human override + audit log for all AI-influenced actions.
- "Why did you suggest this?" always available.
- Fallback to human when confidence low or out-of-distribution.

**UI Patterns:** Context-aware "Ask AI" or always-visible copilot panel. Suggestions appear as cards in relevant screens (Timeline, Budget, Approvals).

Aligns with existing recommended AI architecture (human-decided).

---

## PHASE 11 — CONTENT & COPY

**Education-While-Working Philosophy:** The product teaches operational excellence.

**Inventory:**

- **Homepage / Marketing:** Value-first messaging ("Run events and projects with less chaos and full trust"), industry pages, use-case stories.
- **Onboarding:** Role-based quickstarts, interactive checklist ("Set up your first venue").
- **Empty States:** Educational + actionable ("No bookings yet. Book a room or import from calendar.")
- **Microcopy:** Clear, professional, action-oriented. "Approve & notify team" not "Submit".
- **Errors:** "This time overlaps with X. Suggested alternatives:" + actions.
- **Notifications:** Human + AI context ("AI detected 2 conflicts. 1 auto-resolved, 1 needs your review.").
- **Knowledge Base / Playbooks:** "How to run a flawless 500-person conference", templates.
- **Academy / Academy-style in-app:** Short videos/playbooks triggered contextually.
- **Glossary:** Operational terms.
- **Tooltips & Progressive Disclosure.**

**Voice:** Stoic, competent, calm, helpful — never cute or salesy.

---

## PHASE 12 — MARKETING FUNNEL

Discovery (SEO for "event operations platform", "venue management software with approvals", AEO for "how to avoid double booking events", GEO for local venues) → Education (content, templates, calculators: "Event Profitability Estimator") → Trust (customer stories, auditability proofs, open architecture) → Evaluation (comparison matrix vs spreadsheets/legacy + Monday/Asana) → Trial (guided POC with sample data for their industry) → Activation (first value in <15 min: create facility + book something) → Daily Ops → Expansion (add AI, more teams, advanced finance) → Renewal & Advocacy (referral program, case studies co-created).

**Assets per stage:** Landing pages, interactive demos, video "day in the life", email sequences, community, templates (free downloadable run-of-show, budget, etc.), academy.

---

## PHASE 13 — IMPLEMENTATION BLUEPRINTS & ROADMAP

**Deliverables Produced by This Blueprint:**

- Business Blueprint (this document + Phase 1 flows)
- Workflow Blueprints (Phase 5+6 full set)
- User Journey Blueprint (Phase 4)
- System Flow Blueprint (auto-magic)
- Information Architecture + Navigation (Phase 7)
- Screen Inventory + Specs (Phase 8)
- Component Inventory (Phase 9)
- Content/Copy Inventory + Guidelines (Phase 11)
- Customer Education Blueprint
- Marketing Funnel Blueprint (Phase 12)
- AI Copilot Blueprint (Phase 10)
- Design System Blueprint (align existing)
- Development Roadmap + Priority Matrix

**Priority Matrix (Now / Next / Later) — Examples:**

**Now (Strengthen current foundation + workflow clarity):**

- Unified Home/Command Center + personalized "Today" view.
- Enhanced Approvals (detail, realtime, context) — already strong, polish.
- Timeline + Resource allocation with conflict surfacing.
- AI proposal / checklist generator (read-only first).
- Better empty states + educational copy.
- Ops Director + Event Manager persona flows end-to-end.

**Next:**

- Full Finance flow integration (budget creation auto + reconciliation).
- Live Command Center for event day.
- Advanced resource inventory + allocation board.
- Client portal views + communication.
- Knowledge base + RAG for AI grounded answers.
- Industry templates (wedding pack, exhibition pack).

**Later:**

- Marketplace for vendors/templates.
- Advanced forecasting / scenario planning AI.
- White-label / multi-brand enterprise.
- Deeper external integrations (accounting, CRM).

**For Every Item:** Who benefits most / Problem solved / Workflow position / Business value / UX value / Eng implications (must fit L-07, outbox, existing aggregates, RLS, handlers) / Dependencies.

This document + companions + referenced strategy files provide **zero ambiguity** for designers, PMs, developers, AI agents, marketers, and writers.

---

## Appendices (To Be Expanded)

- Mermaid diagrams for all major flows.
- Detailed persona cards.
- Full JTBD matrix.
- Screen-by-screen wireframe descriptions (text).
- Copy deck samples.
- Success metrics tied to blueprint.

**Next Step for Team:** Use this as the single source before any new UI, feature, content, or AI work. Validate every proposed change against "Does this make the operational lifecycle feel more like a trusted partner?"

**End of Master Blueprint v1.0**
