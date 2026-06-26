# Website Information Architecture
## Event & Project Operations Platform

**Version:** 1.0  
**Date:** June 2026  
**Authority:** product-experience-research.md Part 3 | docs/strategy/information-architecture.md  
**Owner:** Product + Content  

> **Principle:** Pages exist because users need them — not because competitors have them.  
> Every page must answer: Why does this exist? Who needs it? When? What decision follows?

---

## 1. IA Design Principles

1. **User-needs first** — Every section exists because a specific persona needs it at a specific journey stage
2. **Single source of truth** — No duplicate information across sections
3. **Progressive disclosure** — Simple overview → detail on demand
4. **Audience-segmented** — Different entry paths for Ops, Finance, Developer, IT Admin
5. **AI-optimized** — Structured for both human navigation and LLM indexing (GEO)
6. **Indonesia-ready** — Bilingual where needed; local payment/compliance references

---

## 2. Complete Site IA Tree

### Navigation Tier 1 (Primary Nav)
```
Platform | Solutions | Pricing | Resources | Docs | [Sign in] | [Start Free]
```

---

### `/` — Home
**Audience:** All (unknown → problem-aware)  
**Journey stage:** Awareness  
**Decision:** "Is this for me? Do I want to learn more?"  

Sections:
1. Hero — Problem → Platform → Proof + CTA pair
2. Social proof bar (customer logos / metrics)
3. Platform overview (3 pillars: Plan / Execute / Prove)
4. Feature highlights (bento grid, 6 cards)
5. Customer story (1 featured)
6. Metrics bar
7. Final CTA

---

### `/platform` — Platform Overview
**Audience:** Evaluator (solution-aware)  
**Journey stage:** Solution aware → Product aware  
**Decision:** "Does this platform cover everything I need?"  

Sub-pages:
- `/platform/overview` — What the platform is and how it works
- `/platform/architecture` — Technical overview (for IT/CTO evaluators)
- `/platform/ai` — AI capabilities + L-06 governance
- `/platform/integrations` — Integration ecosystem overview
- `/platform/security` → redirect to `/security`

---

### `/features` — Feature Directory
**Audience:** Deep evaluator, power user  
**Journey stage:** Product aware  
**Decision:** "Does it have the specific feature I need?"  

Sub-pages (one per major capability):
- `/features/event-operations` — Event creation, publishing, AccessPass management
- `/features/project-management` — Tasks, milestones, Gantt, boards
- `/features/resource-scheduling` — Conflict-free venue/room/resource booking (GiST)
- `/features/financial-management` — Immutable ledger, journal entries, reconciliation
- `/features/approvals-workflows` — Approval chains, escalation, audit trail
- `/features/ai-copilot` — AI suggestions with human approval (L-06)
- `/features/reporting-analytics` — Reports, dashboards, exports
- `/features/access-control` — Roles, permissions, multi-tenant isolation

---

### `/solutions` — Solutions by Role & Industry
**Audience:** Problem-aware buyer (specific role/industry)  
**Journey stage:** Problem aware → Solution aware  
**Decision:** "Does this solve *my specific* problem?"  

By Role:
- `/solutions/event-organizers`
- `/solutions/project-management-offices`
- `/solutions/venue-facility-managers`
- `/solutions/finance-teams`
- `/solutions/operations-leaders`
- `/solutions/developers-integrators`

By Industry (cross-linked from role pages):
- `/solutions/corporate-events`
- `/solutions/universities-campuses`
- `/solutions/sports-entertainment`
- `/solutions/government-public-sector`
- `/solutions/hospitality-venues`

---

### `/industries` — Industry Pages
**Audience:** Vertical buyer  
**Journey stage:** Problem aware (industry-specific pain)  
**Decision:** "Does this platform understand my industry?"  

- `/industries/corporate-events`
- `/industries/universities-campuses`
- `/industries/sports-entertainment`
- `/industries/government-public-sector`
- `/industries/hospitality-venues`
- `/industries/professional-services`

---

### `/use-cases` — Specific Scenarios
**Audience:** Operational buyer with a specific workflow need  
**Journey stage:** Solution aware → Product aware  
**Decision:** "Can it handle my specific use case?"  

- `/use-cases/conference-management`
- `/use-cases/venue-booking-management`
- `/use-cases/multi-event-portfolio`
- `/use-cases/project-budget-tracking`
- `/use-cases/compliance-audit-trail`
- `/use-cases/resource-conflict-resolution`
- `/use-cases/hybrid-event-management`

---

### `/pricing` — Pricing & Plans
**Audience:** Decision-maker (economic buyer)  
**Journey stage:** Product aware → Trial  
**Decision:** "What does it cost? Is it worth it? Which plan?"  

Sections:
1. Pricing headline (honest, simple)
2. Tier cards (Free / Pro / Enterprise)
3. Feature comparison table (full matrix)
4. ROI calculator (interactive)
5. FAQ (pricing-specific, 8 questions)
6. Trust signals (security badges, uptime)
7. Enterprise CTA ("Talk to our team")

---

### `/resources` — Resource Hub
**Audience:** Research phase (problem → solution aware)  
**Journey stage:** Awareness → Consideration  
**Decision:** "Should I learn more about this space / product?"  

Sub-sections:
- `/resources/blog` — Thought leadership + problem-aware articles
- `/resources/guides` — Long-form gated guides
- `/resources/playbooks` — Operational best practices
- `/resources/templates` — Downloadable operational templates
- `/resources/case-studies` → `/customers/stories`
- `/resources/industry-reports` — Original research (gated)
- `/resources/webinars` — Live + on-demand
- `/resources/changelog` — Product updates (weekly)
- `/resources/roadmap` — Public roadmap

---

### `/docs` — Product Documentation
**Audience:** Developer, power user, new user  
**Journey stage:** Trial → Activation → Daily use  
**Decision:** "How do I do [specific thing]? Does the API support [X]?"  

Full IA:
```
/docs
├── Getting Started
│   ├── What is [Platform]?
│   ├── Core concepts
│   ├── Quickstart (5 steps)
│   └── Self-hosting setup
├── Concepts
│   ├── Platform overview
│   ├── Tenant model
│   ├── Event model
│   ├── Project model
│   ├── Resource & Facility model
│   ├── Financial model
│   ├── Workflow & Approval model
│   └── AI & Agents (L-06)
├── Guides (task-oriented)
│   ├── Create and publish an event
│   ├── Configure venue/facility
│   ├── Issue access passes
│   ├── Set up approval workflows
│   ├── Financial reconciliation
│   ├── Run an audit report
│   └── Integrate payment gateway
├── Modules (feature reference)
│   ├── Events
│   ├── Projects
│   ├── Resources & Scheduling
│   ├── Finance & Ledger
│   ├── Approvals & Workflows
│   ├── AI Assistant
│   ├── Reports & Analytics
│   └── Administration
├── API Reference
│   ├── Authentication
│   ├── Endpoints (OpenAPI)
│   ├── Webhooks
│   ├── Rate limits
│   ├── Idempotency
│   └── Error codes
├── Integrations
│   ├── Payment (Midtrans, Xendit, Stripe)
│   ├── Calendar sync
│   ├── HR systems
│   └── Custom webhooks
└── Self-hosting
    ├── Requirements
    ├── Docker setup
    ├── Environment variables
    ├── DB migrations
    └── Upgrading
```

---

### `/developer` — Developer Portal
**Audience:** Developer, system integrator  
**Journey stage:** Activation → Expansion  
**Decision:** "Can I build what I need on top of this platform?"  

- API Reference (full OpenAPI)
- SDKs & Libraries (TypeScript, Python)
- Webhooks reference
- Authentication guide
- Sandbox / Playground
- Sample applications
- Community forum
- Changelog (developer-focused)

---

### `/security` — Security Overview
**Audience:** IT Admin, CISO, security evaluator  
**Journey stage:** Late evaluation (approval gate)  
**Decision:** "Is this secure enough to pass our internal security review?"  

Sections:
1. Security headline ("Security built into every layer")
2. Data encryption (at rest + in transit)
3. Access control (RLS, RBAC, tenant isolation)
4. Infrastructure (availability, backups, regions)
5. Audit (immutable logs, export)
6. Compliance certifications (SOC 2, GDPR)
7. Download center (security summary, DPA)
8. Contact security team CTA

---

### `/trust` — Trust Center
**Audience:** Procurement, legal, enterprise decision-maker  
**Journey stage:** Late evaluation (contract gate)  
**Decision:** "Do I trust this vendor enough to sign a contract?"  

Sections:
1. Trust headline
2. Compliance badges (SOC 2, GDPR, ISO)
3. Data residency options
4. SLA details
5. Audit log overview
6. Privacy policy link
7. Status page link
8. Download: SOC 2 summary, DPA, security whitepaper (NDA-gated)
9. CTA: Talk to compliance/security team

---

### `/compliance` — Compliance Details
**Audience:** Legal, compliance officer  
**Journey stage:** Contract/procurement stage  
**Decision:** "Does this meet our regulatory requirements?"  

- GDPR compliance
- ISO 27001 (roadmap)
- Indonesia: OJK/PBI compliance (where applicable)
- Data processing agreements (DPA)
- Sub-processor list

---

### `/customers` — Customer Stories
**Audience:** Late-stage evaluator  
**Journey stage:** Product aware → Trial  
**Decision:** "Do companies like mine use this? What were their results?"  

- Customer story index (filterable by industry, use case, company size)
- Individual story pages (Problem → Solution → Results format)
- Customer quotes / wall of love
- Video testimonials

---

### `/partners` — Partner Program
**Audience:** Implementation partners, consultants, technology partners  
**Journey stage:** Business development  
**Decision:** "Should I become a partner? How does the program work?"  

- Partner overview
- Partner benefits
- How to apply
- Partner portal login
- Technology partnership inquiry

---

### `/marketplace` — Marketplace
**Audience:** Existing users looking for extensions  
**Journey stage:** Expansion  
**Decision:** "What integrations/apps can I add?"  

- Integration directory (filterable by category)
- Template marketplace
- Partner-built apps
- Submit an integration

---

### `/learning` — Learning Center
**Audience:** New users, power users seeking depth  
**Journey stage:** Activation → Daily use → Expansion  
**Decision:** "How do I get better at using the platform?"  

- Learning paths (by role: Ops, Finance, Developer, Admin)
- Quick-start video library
- Deep-dive tutorials
- Webinar library
- Certification program
- Glossary (canonical terms)

---

### `/help` — Help Center
**Audience:** Existing users with a specific problem  
**Journey stage:** Daily use  
**Decision:** "How do I solve this specific issue right now?"  

- Prominent search bar (above fold)
- Getting Started section
- Feature-organized articles
- Troubleshooting
- Account & Billing
- Contact support (chat, email, enterprise CSM)
- Community forum link

---

### `/status` — System Status
**Audience:** Operations team, IT Admin  
**Journey stage:** Daily use / incident response  
**Decision:** "Is the platform down? When will it be restored?"  

- Live system status (green/amber/red per component)
- Active incident details
- Historical incident log
- Subscribe to updates (email/Slack/webhook)

---

### `/about` — Company
**Audience:** Enterprise buyer due diligence, recruits, press  
**Journey stage:** Any  
**Decision:** "Is this a legitimate, stable company?"  

- Company overview + mission
- Team (optional early stage)
- Open source contributions
- Press / Media kit
- Investors (optional)

---

### `/blog` — Blog
**IA by content pillar:**
1. `Operations Intelligence` — event coordination best practices
2. `Finance & Compliance` — audit, reconciliation, financial accuracy
3. `AI in Operations` — safe AI, practical applications
4. `Industry Playbooks` — vertical-specific guides
5. `Platform Education` — how-to, feature deep-dives
6. `Thought Leadership` — industry trends, original research

---

## 3. Navigation System Design

### Primary Navigation (Top Bar)

```
[Logo]    Platform  Solutions  Pricing  Resources  Docs    [Sign in]  [Start Free]
```

**Rules:**
- Max 5–6 items before "more" overflow
- `[Start Free]` = primary CTA button (high contrast, accent color)
- `[Sign in]` = ghost/text button
- Mobile: hamburger with full-screen overlay

### Mega Menu — Platform
```
┌────────────────────────────────────────────────────────┐
│  FEATURES                    PLATFORM                  │
│  ● Event Operations          Overview                  │
│  ● Project Management        Architecture              │
│  ● Resource Scheduling       AI Capabilities           │
│  ● Financial Management      Integrations              │
│  ● Approvals & Workflows     Security                  │
│  ● AI Copilot                                          │
│  ● Reporting & Analytics     FEATURED                  │
│  ● Access Control            ⭐ See what's new →       │
└────────────────────────────────────────────────────────┘
```

### Mega Menu — Solutions
```
┌────────────────────────────────────────────────────────┐
│  BY ROLE                    BY INDUSTRY                │
│  ● Event Organizers         Corporate Events           │
│  ● PMO / Project Managers   Universities               │
│  ● Venue Managers           Sports & Entertainment     │
│  ● Finance Teams            Government                 │
│  ● Operations Leaders       Hospitality & Venues       │
│  ● Developers                                          │
│                             FEATURED                   │
│                             ⭐ Customer stories →      │
└────────────────────────────────────────────────────────┘
```

### Footer Structure
```
Product         Solutions        Resources       Company
Platform        Event Organizers Blog            About
Features        Project PMO      Guides          Careers
Pricing         Finance Teams    Templates       Partners
Changelog       Venue Managers   Webinars        Press
Roadmap         Developers       Case Studies    Contact

Developers      Security         Legal
API Docs        Trust Center     Privacy Policy
SDKs            SOC 2            Terms of Service
Sandbox         GDPR             Cookie Policy
Community       Compliance       DPA

[Status: ● All systems operational]   [🌐 EN | ID]
```

---

## 4. User-Type Navigation Paths

### First-time visitor (problem-aware)
`Home → Solutions (by role) → Feature page → Customer story → Pricing → Start Free Trial`

### Enterprise evaluator (multi-stakeholder)
`Home → Security → Trust Center → Customer stories → Pricing (Enterprise) → Request Demo`

### Developer evaluator
`Home → Developer portal → API docs → Sandbox → Pricing → Start Trial`

### Existing user (looking for help)
`Direct link / search → Docs → Help Center → Support`

### Finance team evaluator
`Solutions/Finance → Features/Financial Management → Trust Center → Pricing → Demo`

---

## 5. SEO & GEO URL Structure

### URL Convention Rules
- Lowercase, hyphenated
- No `_` underscores
- Descriptive, no internal codes
- Consistent depth (max 3 levels: `/category/subcategory/page`)

### Structured Data (Schema.org)
| Page type | Schema |
|-----------|--------|
| Homepage | `Organization` + `SoftwareApplication` |
| Feature pages | `SoftwareApplication` + `FAQPage` |
| Blog articles | `Article` + `BreadcrumbList` |
| Help articles | `HowTo` or `FAQPage` |
| Pricing | `Product` + `AggregateOffer` |
| Customer stories | `Article` + `Review` |

### `llms.txt` (GEO)
Create `/llms.txt` at domain root with structured platform summary:
```
# Event & Project Operations Platform

## What it is
[Platform name] is an AI-native Event & Project Operations Platform that helps 
organizations coordinate, execute, and audit events, projects, venues, teams, 
and finances in one place.

## Key capabilities
- Conflict-free scheduling and resource management
- Immutable financial ledger with full audit trail
- Approval workflows with AI assistance (human approval required)
- Multi-tenant enterprise architecture with data isolation
- Open source core with self-hosting option

## Best for
Operations teams, event organizers, project management offices, finance teams, 
venue managers, and developers building on top of the platform.

## Not for
Pure consumer events (Eventbrite use case), generic ERP needs, 
or teams without any physical/spatial operational component.

## Documentation
Full documentation: [domain]/docs
API reference: [domain]/docs/api
Developer portal: [domain]/developer
```

---

## Internal Reference

| Document | Role |
|----------|------|
| `docs/strategy/product-experience-research.md` | Full IA + navigation source |
| `docs/strategy/information-architecture.md` | Internal EKB IA (separate from website IA) |
| `docs/strategy/messaging-framework.md` | Audience-specific messaging |
| `docs/strategy/04-ideal-customer-profile.md` | ICP that drives solution page structure |
| `docs/volumes/08-product.md` | In-product navigation standards |
