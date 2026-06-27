# Volume 07: Business Model & Operations

## Moventios

**Business Capabilities & Value Delivery for Running Events and Projects**

**Version:** 5.1-ENTERPRISE  
**Status:** RATIFIED  
**Date:** June 25, 2026  
**Authority:** Constitution Parts 1–2, 6 (Manifesto, Principles, Business Capability Model)  
**Owner:** Product Lead + Strategy

---

## Overview

> **Canonical Source:** Platform manifesto, principles, dan Business Capability Model ada di [Layer-1-Constitution-v5.0.2.md](../Layer-1-Constitution-v5.0.2.md) Parts 1–2, 6.  
> Volume ini menyediakan **Feature Justification Framework, use case taxonomy, dan value/pricing model** — operational guidance yang tidak ada di Layer-1.

Volume 07 translates the platform's vision and business model from the Constitution into a **practical, actionable framework** for product managers, business stakeholders, and anyone proposing new features.

This volume answers:

- What capabilities help run events and projects reliably?
- How do we decide what to build (and what NOT to build)?
- What is the value delivered to operators?
- How does the platform support profitable, auditable operations?

**Every feature starts here.** Before building, a capability must clearly help plan, execute, monitor, or audit events and projects more easily, reliably, or profitably.

---

## Part 1: Platform Manifesto & Mission

[Authority: Constitution Parts 1–2]

### 1.1 Mission

> This platform exists to help organizations run events, projects, and related operations with less chaos — providing coordination, visibility, accountability, and reliable records at scale.

### 1.2 Vision

Organizations of all sizes can run complex events and projects with the coordination, financial handling, and intelligence they need — without the usual fragmentation or loss of control.

### 1.3 Platform Ethos

| Principle                     | What It Means                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| **Sovereignty First**         | Tenant data is the tenant's data. The platform is a tool, not a landlord.                |
| **Deterministic Over Clever** | A predictable system that's boring to maintain beats a clever system that surprises you. |
| **Financial Integrity**       | Money is serious. Swiss-standard double-entry accounting is non-negotiable.              |
| **AI Under Control**          | AI amplifies human decisions; it does not replace them for material consequences.        |
| **Open Standards**            | MIT/Apache-licensed components; no vendor lock-in by architectural choice.               |

---

## Part 2: Platform Principles

[Authority: Constitution Part 2]

### 2.1 The Nine Core Principles (Moventios)

#### P-1: Value-Friction Resolution (L-01)

Every feature must resolve more friction than it creates. Features that introduce complexity without proportional business value are rejected.

**Evaluation Framework:**

| Dimension          | Question                                                          | Weight |
| ------------------ | ----------------------------------------------------------------- | ------ |
| Revenue            | Does this directly drive new revenue or protect existing revenue? | 35%    |
| Cost Saving        | Does this reduce operational cost for tenants or for Moventios?   | 25%    |
| Risk Reduction     | Does this reduce legal, financial, or reputational risk?          | 20%    |
| Strategic Position | Does this create defensible differentiation?                      | 20%    |

**Minimum score to proceed:** 60/100 (weighted). Below 60, the feature is deferred or rejected.

#### P-2: Tenant Sovereignty

Tenants own their data, their business logic configuration, and their operational workflows. The platform provides infrastructure; the tenant drives the outcomes.

**Practical implications:**

- Tenant can export ALL their data at any time (JSON/CSV)
- Tenant can customize workflow states, approval rules, and notification templates
- Tenant data is never shared with or accessible to other tenants (L-05, RLS)
- Tenant can migrate off the platform with their data intact (no lock-in)

#### P-3: Swiss-Standard Financial Integrity

Financial records are sacred. Accuracy, auditability, and immutability are non-negotiable.

**Practical implications:**

- Double-entry accounting for all financial flows (L-02)
- All currency in `numeric(19,4)` — never floating point
- Every transaction has a human-readable narration and audit trail
- Reconciliation tools built-in (not bolted on)

#### P-4: Zero-Trust Security

No component is trusted by default — not even internal services. Identity, authorization, and data access are verified at every layer.

#### P-5: Open Source First

Build on mature OSS components rather than building from scratch. Every component choice follows: Adopt → Configure → Extend → Compose → Replace → Build.

#### P-6: AI-Augmented, Human-Decided

AI provides recommendations, insights, and automation proposals. Humans make material decisions. (See Volume 04, L-06.)

#### P-7: Observability by Default

Every operation is traced, logged, and metered from inception. Observability is not added after the fact.

#### P-8: Scale Without Rewrite

Architecture decisions should support 10x current load without structural change, and 100x with planned evolution paths (Volume 10).

#### P-9: Boring to Maintain

The best architecture is the one that a new engineer can understand in 2 days and be productive in a week. This is why SEKB exists.

---

## Part 3: Business Capability Model

[Authority: Constitution Part 6]

### 3.1 Capability Map Overview

Moventios provides capabilities across 8 business domains, organized hierarchically:

```
SOVEREIGN OS PLATFORM
│
├── 1. IDENTITY & ACCESS MANAGEMENT
│   ├── 1.1 Tenant Provisioning & Onboarding
│   ├── 1.2 Multi-Tenant Organization Hierarchy
│   ├── 1.3 RBAC/ABAC Role Management
│   └── 1.4 SSO & Federation (OIDC/SAML)
│
├── 2. SPATIAL & FACILITY MANAGEMENT
│   ├── 2.1 Facility Registration & Configuration
│   ├── 2.2 Room & Asset Management
│   ├── 2.3 Collision-Free Booking Engine
│   └── 2.4 Occupancy Analytics & Reporting
│
├── 3. EVENT & COMMERCE MANAGEMENT
│   ├── 3.1 Event Lifecycle Management (Draft → Published → Completed)
│   ├── 3.2 Access Pass Issuance & QR Management
│   ├── 3.3 Ticket Tier Configuration (TicketType)
│   ├── 3.4 Capacity Management & Waitlisting
│   └── 3.5 Check-In & Attendance Tracking
│
├── 4. FINANCIAL OPERATIONS
│   ├── 4.1 Double-Entry Ledger (Swiss-Standard)
│   ├── 4.2 Invoice Generation & Management
│   ├── 4.3 Multi-PSP Payment Processing (Xendit, Stripe, Midtrans)
│   ├── 4.4 Escrow & Fund Holding Management
│   ├── 4.5 Financial Reconciliation & Reporting
│   └── 4.6 Subscription & Recurring Billing
│
├── 5. WORKFLOW & APPROVAL MANAGEMENT
│   ├── 5.1 Configurable State Machine Workflows
│   ├── 5.2 Human-in-the-Loop Approval Routing
│   ├── 5.3 SLA-Driven Task Management
│   └── 5.4 Audit-Complete Transition Logging
│
├── 6. AI & INTELLIGENCE
│   ├── 6.1 Knowledge Base & Document Indexing
│   ├── 6.2 AI-Augmented Search (RAG)
│   ├── 6.3 Recommendation Engine (Booking, Events)
│   ├── 6.4 Operational Anomaly Detection
│   └── 6.5 AI Agent Orchestration (Under L-06)
│
├── 7. NOTIFICATIONS & COMMUNICATIONS
│   ├── 7.1 Transactional Email (Resend)
│   ├── 7.2 WhatsApp Business Messaging (Fonnte)
│   ├── 7.3 Push Notifications (future scope)
│   └── 7.4 Notification Template Management
│
└── 8. PLATFORM & DEVELOPER OPERATIONS
    ├── 8.1 Multi-Tenant API Gateway (BFF)
    ├── 8.2 Developer Portal & API Documentation
    ├── 8.3 Observability & SRE Tooling
    └── 8.4 IaC & Platform Configuration
```

### 3.2 Capability Maturity Levels

| Level         | Definition                                         | Example                                          |
| ------------- | -------------------------------------------------- | ------------------------------------------------ |
| **ADOPT**     | Production-ready, fully integrated capability      | Ledger posting, Booking with GiST exclusion      |
| **CONFIGURE** | Available; requires tenant-specific configuration  | Workflow state machine, AI agent setup           |
| **EXTEND**    | Framework exists; tenant-specific extension needed | Cerbos ABAC rules, Custom notification templates |
| **PLANNED**   | Architecture defined; implementation in roadmap    | Subscription billing (v5.2), GDPR export portal  |
| **EVALUATE**  | Research stage; no commitment                      | Multi-region active-active writes                |

---

## Part 4: Feature Justification Framework

### 4.1 The Feature Proposal Process

Before any feature enters development, the **Feature Justification Document (FJD)** must be completed:

```markdown
## Feature: {Feature Name}

**Requested By:** {Stakeholder}
**Date:** {Date}
**Target Version:** {e.g., v5.2}

### Step 1: Value-Friction Analysis (P-1)

| Dimension          | Impact                           | Score (0-25)    |
| ------------------ | -------------------------------- | --------------- |
| Revenue            | {Description of revenue impact}  | {Score}         |
| Cost Saving        | {Description of cost saving}     | {Score}         |
| Risk Reduction     | {Description of risk reduction}  | {Score}         |
| Strategic Position | {Description of differentiation} | {Score}         |
| **Total**          |                                  | **{Total}/100** |

Proceed? {YES (≥60) / NO (<60)}

### Step 2: Bounded Context Owner

Which Bounded Context owns this feature?
[ ] IAM & Governance
[ ] Spatial & Facility
[ ] Commerce & Event
[ ] Finance & Ledger
[ ] Workflow & Operations
[ ] AI & Knowledge

### Step 3: Enterprise Law Impact

Does this feature require:
[ ] Cross-context data composition (L-01: must use Read Model/CQRS)
[ ] Financial history modification (L-02: must use reversal pattern)
[ ] Entity deletion (L-03: must use soft delete)
[ ] Financial mutation (L-04: idempotency key required)
[ ] AI write action (L-06: Approval workflow required)

### Step 4: Architecture Owner Sign-off

Lead Architect: {Name} | Date: {Date} | {APPROVE / DEFER / REJECT}
```

### 4.2 Feature Categories

| Category                 | Definition                                                          | Approval Path                     |
| ------------------------ | ------------------------------------------------------------------- | --------------------------------- |
| **Tier 1 — Core**        | Directly affects financial integrity, tenant isolation, or security | RFC → Lead Architect + EAB        |
| **Tier 2 — Competitive** | New capability that differentiates from competitors                 | FJD + Volume Owner + Product Lead |
| **Tier 3 — Enhancement** | Improvement to existing capability                                  | FJD + Volume Owner                |
| **Tier 4 — UX/DX**       | Developer or user experience improvements                           | PR review only (no FJD)           |

---

## Part 5: Use Case Taxonomy

### 5.1 Primary Use Cases by Tenant Type

**Tenant Type A: Event Organizers**

- Core jobs: Publish events, sell access passes, manage check-ins
- Key capabilities: 3.1–3.5 (Commerce), 4.2–4.3 (Payments), 7.1–7.2 (Notifications)
- Success metrics: Pass sell-through rate, check-in success rate, revenue per event

**Tenant Type B: Facility & Space Managers**

- Core jobs: Manage rooms/assets, prevent double-bookings, invoice clients
- Key capabilities: 2.1–2.4 (Spatial), 4.1–4.5 (Finance), 5.1–5.4 (Workflow)
- Success metrics: Facility utilization rate, invoice collection rate, booking conflict rate

**Tenant Type C: Enterprise Operations (Combined)**

- Core jobs: Run events AND manage facilities, complex approval workflows, multi-department
- Key capabilities: All domains, with emphasis on 1.2–1.4 (IAM hierarchy), 5.1–5.4 (Workflow)
- Success metrics: Cross-department booking efficiency, financial reporting accuracy, audit readiness

**Tenant Type D: Platform Partners (API-First)**

- Core jobs: Build on Moventios APIs; white-label specific capabilities
- Key capabilities: 8.1–8.4 (Developer Operations), OpenAPI contract stability
- Success metrics: API uptime, SDK adoption, integration time-to-value

---

## Part 6: Revenue & Value Model

### 6.1 Value Delivered by Capability

| Capability              | Tenant Value                                                                | Platform Revenue Driver         |
| ----------------------- | --------------------------------------------------------------------------- | ------------------------------- |
| Collision-free Booking  | Eliminates double-booking liability and manual coordination cost            | Core infrastructure usage       |
| Double-Entry Ledger     | Eliminates accounting errors; audit-ready from day one                      | Core infrastructure usage       |
| Multi-PSP Payments      | Single integration for Xendit/Stripe/Midtrans; reduces payment failure rate | Transaction fee or platform fee |
| AI Knowledge Base       | Reduces support tickets; speeds up internal knowledge discovery             | AI add-on subscription          |
| White-label Event Pages | Tenant's brand on a robust commerce platform                                | Commerce add-on                 |
| Approval Workflows      | Compliance-grade decision trails without Enterprise HR software             | Advanced workflow add-on        |

### 6.2 Pricing Tier Alignment

| Tier           | Capabilities Included                                                              | Primary Tenant Type   |
| -------------- | ---------------------------------------------------------------------------------- | --------------------- |
| **Starter**    | IAM, basic Spatial (5 rooms), basic Commerce (1 event active), transactional email | Type A (small events) |
| **Growth**     | Full Spatial, Commerce, Finance, Notifications                                     | Type A + B            |
| **Enterprise** | All capabilities + AI, advanced Workflow, multi-department hierarchy               | Type C                |
| **Platform**   | Enterprise + API-first access, white-label, custom domain                          | Type D                |

---

## Part 7: Anti-Patterns (What We Don't Build)

Moventios deliberately **does not** build:

| Anti-Pattern                        | Why Not                                                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **CRM replacement**                 | We integrate with CRMs; `Customer` in our model is a transactional actor, not a full CRM record          |
| **Content Management**              | Tenant event descriptions live in their own systems; we store structured data, not content               |
| **HR Management**                   | `Department` and `Membership` are authorization constructs, not HR records                               |
| **Native mobile apps**              | PWA-first; native apps are tenant responsibility or third-party integration                              |
| **Proprietary payment processing**  | We wrap PSPs; we are not a payment provider and do not want payment license overhead                     |
| **AI training on tenant data**      | Tenant data never leaves their isolation boundary; we do not train foundation models on operational data |
| **Competitor comparison marketing** | Platform speaks for itself through capability and reliability                                            |

---

**End of Volume 07**

_Every feature that is built here has passed the Value-Friction Resolution test. The platform earns its place in each tenant's operations by being reliably useful — not by being impressive._

_[Constitution Parts 1, 2, 6, 9] [Volume 06, L-01] [Volume 02 — Bounded Context Catalog]_
