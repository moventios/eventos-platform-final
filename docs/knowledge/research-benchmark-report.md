# Research Benchmark Report: AI-Native Project & Event Operations Platform

**Date:** 2026-06-25  
**Focus:** Re-centered to AI-Native Project & Event Operations Platform (not generic Enterprise OS).  
**Sources:** Open source GitHub projects, SaaS benchmarks (Eventbrite, Cvent, Plane, OpenProject, Monday.com, Odoo, Cal.com, ERPNext, etc.), architecture patterns, design systems, pricing models.

## 1. Market Landscape Report

The market for event/project/operations tools is fragmented between:

- Pure event ticketing (Eventbrite, Pretix, Hi.Events): Strong on registration/payments, weak on project execution, resource allocation, deep finance, AI.
- Project management (Plane, OpenProject, Monday.com, Asana, Linear): Excellent for tasks/boards/Gantt, weak on venue booking, event commerce, immutable audit, field operations.
- ERP (Odoo, ERPNext): Broad modules, but bloated for focused ops, not AI-native.
- Booking/scheduling (Cal.com, Skedda): Good for calendars, not full ops stack.
- AI productivity (Glean, Notion AI, AppFlowy): Strong search/knowledge, not operations backbone.

**Opportunity for this Platform**: AI-native unification of event + project + resource + finance + execution with auditability and operational intelligence. Target mid-market to enterprise with hybrid physical/digital needs (venues, conferences, productions, logistics).

**ICP**: Event organizers, PMOs, venue/facility managers, corporate event teams, production houses. Buyers: Ops/PM leads, with finance/IT input. Pains: Chaos in coordination, reconciliation, compliance, scaling without headcount.

**Positioning**: "The AI-native platform that makes running projects and events reliable, visible, and auditable — from planning to execution to finance."

Gaps in market: Integrated AI for scheduling/optimization without losing control; unified audit-grade finance for events/projects; offline/field support; true open/self-host parity with SaaS.

## 2. Open Source Ecosystem Map

**Key OSS Projects** (from GitHub searches):

- **Event/Ticketing**: Hi.Events (modern self-hosted Eventbrite alt, AGPL, payments, check-in, capacity); Pretix (flexible for conferences, AGPL, shop + POS); Attendize (Laravel, basic ticketing); Eventmie (Laravel, self-hosted).
- **Project/PM**: Plane (modern Jira alt, open-core, issues, cycles, AI features); OpenProject (hybrid PM, Gantt, boards, GPL); AppFlowy (Notion-like with AI, AGPL); Taiga, Redmine.
- **Scheduling/Booking**: Cal.com (open scheduling, embeddable);
- **Low-code/ERP-like**: ERPNext (full ERP with events/inventory, AGPL); Odoo community (modules for events/projects/finance); NocoDB, ToolJet, Budibase (for custom ops UIs).
- **Workflow/Automation**: n8n (visual workflows); Trigger.dev (durable jobs); Kestra, Windmill (orchestration); Temporal (durable execution).
- **Backend/AI**: Supabase (auth, realtime, pgvector); Postgres + pgvector (RAG); LangGraph/CrewAI (agents).

**Patterns**:

- Many strong in one area (ticketing or PM) but not unified.
- AGPL for core (self-host friendly, copyleft for SaaS).
- Modern stacks: Next.js/React, Postgres, good DX.
- Gaps: Few combine event ops + project + finance + AI in one place with strong audit.

**Opportunities**: Build on these (e.g., integrate Cal-like scheduling + Pretix ticketing + Plane PM + n8n workflows + pgvector AI).

## 3. Competitive Benchmark Matrix

| Dimension                    | Eventbrite/Pretix    | Plane/OpenProject | Monday/Asana | Odoo/ERPNext    | Our Platform (Target)              |
| ---------------------------- | -------------------- | ----------------- | ------------ | --------------- | ---------------------------------- |
| Event Ticketing/Registration | Strong               | Weak              | Weak         | Medium          | Strong + AI                        |
| Project/Task Management      | Weak                 | Strong            | Strong       | Medium          | Strong + event context             |
| Resource/Venue Booking       | Weak-Medium          | Weak              | Weak         | Medium          | Strong (GiST, conflicts)           |
| Finance/Payments             | Weak                 | Weak              | Weak         | Strong          | Strong (immutable, double-entry)   |
| AI/Intelligence              | Low                  | Emerging          | Low          | Low             | Native (RAG, agents, optimization) |
| Audit/Traceability           | Low                  | Medium            | Low          | Medium          | High (event sourcing, immutable)   |
| UX for Ops Teams             | Consumer             | Dev-focused       | Flexible     | ERP-bloated     | Stoic/dense, ops-first             |
| Open/Self-host               | Pretix strong        | Strong            | None         | Strong          | Strong (open core)                 |
| Pricing                      | % ticket or free OSS | Per user or OSS   | Per seat     | Per user/module | Per event/org + usage + OSS        |

**Differentiation**: AI deeply embedded in ops (not chat), unified event+project+finance, audit-grade by design, practical for physical ops.

## 4. Feature Gap Analysis

Gaps in market:

- No single system for end-to-end event/project ops with finance and AI.
- Weak handling of resource conflicts across events/projects.
- Limited offline/field ops support.
- AI not "operational" (e.g., auto-suggest schedules, optimize resources, extract from docs).
- Poor audit/finance integration for compliance-heavy events.
- Fragmented UX (planning vs execution vs finance).

**Our Fill**: AI for planning/optimization/insights; unified data model; strong audit + finance; practical UX for ops teams.

## 5. Recommended Technology Stack

Build on existing (from current docs): Next.js/React, Postgres + pgvector, Drizzle, shadcn/ui, Trigger.dev or n8n for workflows, OpenTelemetry.

Add/Confirm:

- Backend: Supabase or custom (auth, realtime, storage).
- Scheduling/Resource: Custom with GiST for conflicts (inspired by spatial in current docs) + Cal.com patterns.
- Workflow: Trigger.dev/n8n + Temporal for complex.
- AI: LangGraph/CrewAI for agents, pgvector for RAG on docs/knowledge.
- UI: Fullcalendar or custom for timelines/calendars; dense tables (TanStack); Kanban/Gantt (inspired by Plane).
- Finance: Custom immutable ledger (as in Layer 2).
- Extensibility: Plugin system or API-first (like Strapi/Directus patterns).
- Self-host: Docker, one-command (like many OSS).

**Why**: Proven in OSS (Pretix for events, Plane for PM, n8n for flows, Supabase for backend). AI-native by design.

## 6. Recommended Documentation Structure

Inspired by Stripe (clear, example-rich), Supabase (dev-focused), Plane (simple), ERPNext (comprehensive but structured).

- **Public/Product**: README (positioning, quickstart), docs/strategy/ (positioning, GTM, brand), marketing site.
- **User Guides**: docs/guides/ (how to run events/projects, step-by-step).
- **Developer**: docs/api/ (SDKs, integrations), examples.
- **Internal**: docs/layers/ (SSOT), docs/volumes/ (knowledge), docs/architecture/ (ADRs).
- **AI-Optimized**: .cursorrules + EKB-AI-Agent-Instructions.md (load order, rules).

Keep focused — avoid hundreds of docs. One "Operations Playbook" volume. Use consistent cross-refs. Versioned.

## 7. Recommended Product Positioning

**AI-Native Project & Event Operations Platform**.

- For teams/orgs running events, projects, venues: "Plan, coordinate, execute, and audit without chaos — with AI that actually helps."
- Vs competitors: Unified + AI-native + audit-grade + open.
- Messaging: Practical, outcome-focused (see separate doc).

## 8. Recommended Brand Positioning

Practical, reliable, intelligent, focused on operators (not abstract philosophy).

- Name ideas (neutral, brainstorm): Use current EKB or "Opsly", "Eventra", "ProjectForge", "Coordly" — descriptive + memorable. Avoid hype.
- Voice: Clear, professional, helpful, data-backed (engineer-to-operator).
- Tagline: "Operations that just work — with intelligence."
- Differentiators: AI that coordinates (not just chats), one system for end-to-end, open & sovereign.

See brand docs in this folder for canvas/details (neutralized).

## 9. Recommended Business Model

- Core: SaaS (per organization/event, usage for AI/compute) + self-hosted OSS (AGPL or similar, with commercial license option).
- Tiers: Free (small events), Pro (teams), Enterprise (custom, support, on-prem).
- Revenue: Subscriptions + marketplace % (integrations, templates) + services (implementation, training).
- Expansion: Marketplace for verticals (festivals, corporate, logistics), partner ecosystem (agencies, integrators).
- Inspired by: Pretix (OSS+hosted), Plane (open-core), Eventbrite (ticket %), Monday (seats + addons).

Avoid pure seat-based if ops scale with events.

## 10. Recommended Information Architecture

**Public**:

- Home: Value prop, ICP, demos.
- Product: Features (by ops area: scheduling, resources, finance, AI), pricing, use cases (events, projects, venues).
- Docs: User guides, API, self-host.
- Resources: Blog, community, benchmarks.

**Internal/EKB**:

- Strategy (this folder)
- Layers (SSOT)
- Volumes (detailed knowledge)
- Architecture/ADRs

Use consistent nav, search (with RAG), versioning. AI-optimized (structured, examples).

## 11. Recommended UX Architecture

- **Core Views**: Dashboard (ops overview), Timeline/Calendar (scheduling), Kanban/Boards (tasks), Resource Allocator (with conflict viz), Finance Ledger (immutable view), Approvals, AI Assistant (contextual).
- Patterns from benchmarks: Dense tables (TanStack), visual schedulers (Cal.com style), Gantt (OpenProject), real-time collab (Supabase).
- Stoic UX: Data-dense, high contrast, keyboard-first, no fluff. For pros, not consumers.
- Mobile: Field ops support.
- Accessibility: WCAG AA+.

## 12. Recommended Engineering Architecture

Build on current (Layers 1-3):

- DDD with bounded contexts (Events, Projects, Resources, Finance, AI).
- Hexagonal + CQRS + Event Sourcing (immutable, traceable).
- Workflow: Trigger.dev/n8n + custom for complex.
- Multi-tenant: RLS + strong isolation.
- AI: RAG (pgvector) + agents (LangGraph) with L-06 guardrails.
- Extensibility: Plugins/API-first.
- Realtime/Offline: As needed for field.
- Inspired by: Plane (modern), Pretix (events), n8n (flows), Supabase (backend).

## 13. Recommended AI Architecture

- Core: RAG over knowledge/docs + structured data for ops.
- Agents: For scheduling suggestions, resource optimization, document extraction, post-event analysis, budget forecasts.
- Guardrails: Human approval for material actions (as in current L-06).
- UI: Contextual copilot in ops views.
- Inspired by: Glean (enterprise search), Cursor/Linear AI (in-product), agent frameworks.

## 14. Build vs Buy Matrix

**Build** (core differentiators):

- Unified event+project+finance+resource model.
- AI agents for ops.
- Immutable audit layer.
- Stoic ops UX.

**Buy/Integrate** (commodity):

- Auth (Supabase/Auth0).
- Payments (Stripe/etc. via adapters).
- Calendar libs (FullCalendar).
- Basic workflow (n8n/Trigger.dev).
- Vector search (pgvector).

## 15. OSS Adoption Matrix

- Adopt: Postgres/pgvector (core DB), n8n/Trigger (workflow), Cal.com patterns (scheduling), Plane UI/UX (modern PM), Supabase (backend if fits).
- License: AGPL for core (self-host friendly, like Pretix), MIT for SDKs/clients. Offer commercial for enterprise self-host without copyleft.
- Contribute back where possible.

## 16. Licensing Analysis

- Core: AGPL-3.0 (ensures open, allows commercial hosting with terms).
- Client SDKs: MIT/Apache.
- Inspired by: Pretix (AGPL + commercial), Plane (open-core).

Risks: Copyleft may deter some; mitigate with clear commercial options.

## 17. Integration Opportunities

- Scheduling: Cal.com.
- Ticketing: Pretix/Hi.Events.
- PM: Plane patterns.
- Workflow: n8n.
- Backend: Supabase.
- AI: LangGraph + existing RAG.
- Low-code: For custom extensions (ToolJet/Budibase).

## 18. Implementation Priority Roadmap

**Now (MVP focus)**:

- Core event/project CRUD + scheduling + resource allocation + basic finance.
- AI RAG for docs/knowledge.
- Stoic UX for key views.

**Next (6-12 months)**:

- AI agents for suggestions/optimization.
- Advanced approvals/workflows.
- Self-host packaging + SaaS parity.
- Marketplace basics.

**Later**:

- Full vertical templates (festivals, corporate, logistics).
- Advanced analytics/intelligence.
- Ecosystem (integrations, white-label).

**Priority Criteria**: Customer impact on ops pain points, build vs buy, complexity.

All based on benchmarks. Update EKB docs (especially strategy and volumes) to reflect this positioning. Use neutral "Platform" language pending name decision.

---

_Research synthesized from public sources (GitHub, product sites, blogs). For deeper, specific repos can be cloned/analyzed. All recommendations support the AI-Native Project & Event Operations Platform focus._
