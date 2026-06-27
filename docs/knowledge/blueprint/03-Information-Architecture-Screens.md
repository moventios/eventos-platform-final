# Phases 7 + 8: Information Architecture + Screen Blueprints (Workflow-First)

## Top Navigation (Work, Not Modules)
Home | Workspace Switcher | Projects | Events | Calendar | Resources | Approvals | Finance | Reports | Knowledge | (minimal) Settings

Rationale: Matches user's mental model ("I need to prepare tomorrow's event") vs "open the Spatial module".

## Within Any Project/Event (Persistent Structure — Answers Goal/Decision/Action)
1. **Overview** — Status at a glance + "What must I do today?" + AI summary + key metrics + next actions.
2. **Timeline / Schedule** — Visual plan + drag to adjust + conflict detection.
3. **Tasks** — Kanban or list + assignment + due + dependencies.
4. **Venue & Logistics** — Spaces, rooms, setup details (links to current facilities/rooms).
5. **Budget** — Visual + editable lines (auto-synced from planning actions).
6. **Team & Assignments**
7. **Vendors & Contracts**
8. **Equipment & Inventory**
9. **Files & Docs**
10. **Approvals** (contextual to this project)
11. **Activity & History** (full audit + communication)
12. **Insights** (utilization, margin, risks, learnings + AI)
13. **Client View** (what they see)

## High-Priority Screen Blueprints (Text Spec)

**Home / Command Center**
- Purpose: Single place for "what requires attention or action from me right now?"
- Audience: All internal personas (personalized).
- Primary Action: "Go to Project X" or "Approve Y" or "Resolve conflict Z".
- Critical Information (top to bottom): My Today (events/tasks), Urgent Approvals (with context snippet), Portfolio Snapshot (utilization, margin, open risks), AI Briefing ("3 items need review").
- States: Empty (calm "Everything looks good. Here's recommended focus areas" + quick create), Loading (skeletons with meaning), Error (actionable recovery).
- AI: Daily briefing + proactive risk callouts.
- Mobile: Prioritized cards + floating actions.

**Project Overview**
- Header: Name + status + client + dates + overall health indicators.
- Sections: AI Summary, Key Dates, Budget Burn, Resource Summary, Pending Actions, Recent Activity.
- Actions: Edit plan, Add task, Request approval, Message client, Generate report.

**Approvals (Unified)**
- Filters: Status, Type (budget, resource, scope, vendor), Urgency, Project.
- Table + Detail Drawer: Full request context (who, what, impact, history), resolution note, approve/reject with reason.
- Realtime updates.
- Mobile: Card list + one-tap approve.

**Resource Allocation**
- Calendar + list or board view.
- Drag resources onto timeline slots.
- Immediate visual conflict highlighting + alternative suggestions.
- "Reserve with conditions" option.

**Budget View**
- Hierarchical lines (auto-created from planning).
- Forecast vs actual.
- Change impact preview ("Adding 2 crew will increase by $X and requires approval").

**AI Copilot Panel** (contextual, available on most screens)
- Triggered by "Ask AI" or always visible in wide views.
- Suggestions are cards: "Proposed timeline adjustment" with "Why", "Impact", "Apply / Edit / Dismiss".
- Grounded answers to natural language questions.

All screens must pass the "Goal / Decision / Next Action" test before implementation.

**Empty States Examples:**
- No projects: "Run your first event. Start with a venue or import from calendar." + 2 primary CTAs.
- No approvals: "Clear queue. Great work." + link to knowledge or recommended actions.

This IA + screens extend the current app structure without disruption.
