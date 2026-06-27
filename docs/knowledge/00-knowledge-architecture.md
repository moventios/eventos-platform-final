# Volume 00: Knowledge Architecture

## Moventios Enterprise Knowledge Base (SEKB)

**Version:** 5.1.0  
**Status:** DRAFT — Foundation for SEKB v5.1  
**Date:** June 25, 2026  
**Authority:** Enterprise Architecture Review Board (EAB)

---

## 1. Purpose of This Volume

> **Canonical Source:** This meta-document is the only source for SEKB structure, taxonomy, and AI consumption rules. It references the three Layers as immutable foundation.

This volume defines the **meta-architecture** of the Moventios Enterprise Knowledge Base itself.

It answers:

- Why SEKB exists
- How it is structured
- How knowledge is governed, versioned, and consumed
- How humans and AI agents interact with it
- How it evolves over a 10–15 year horizon

SEKB is not documentation. It is the **deterministic operating system for enterprise knowledge** at Moventios.

---

## 2. Strategic Evolution

### From Three SSOTs → Enterprise Knowledge Base

**Previous Objective (v5.0.x):**

> Harmonize and maintain three canonical documents (Layer 1 Constitution, Layer 2 Database SSOT, Layer 3 EPXA).

**New Objective (v5.1+):**

> Transform Moventios into a complete, scalable, future-proof **Enterprise Knowledge Base** that serves as the Single Source of Truth for architecture, engineering, product, operations, governance, business, and AI agents for the next 10–15 years.

Layer 1, Layer 2, and Layer 3 remain the **immutable canonical foundation**. Everything else is built systematically on top of them.

---

## 3. SEKB Document Taxonomy

SEKB is organized into **10 core volumes** + **Living Catalogs** + **Foundation Layers**.

### 3.1 Volume Structure (10 Volumes)

| Volume | Title                             | Primary Audience                    | Update Cadence         | Ownership                 |
| ------ | --------------------------------- | ----------------------------------- | ---------------------- | ------------------------- |
| **00** | Knowledge Architecture            | Architects, AI Agents, EAB          | Major versions only    | Lead Architect            |
| **01** | Foundations                       | All engineers + AI                  | Minor patches          | Architecture Team         |
| **02** | Enterprise Architecture           | System Architects, Domain Leads     | Quarterly              | Domain Owners             |
| **03** | Engineering Blueprint             | Staff Engineers, Platform Team      | As needed              | Platform Engineering      |
| **04** | AI Architecture                   | AI Engineers, Security              | Quarterly              | AI Lead                   |
| **05** | Operations & Reliability          | SRE, On-call, Platform              | Monthly                | SRE Lead                  |
| **06** | Governance & Compliance           | Compliance, Legal, Auditors         | As needed (regulatory) | Compliance Lead           |
| **07** | Business Model & Capabilities     | Product, Business, Leadership       | Quarterly              | Product + Strategy        |
| **08** | Product Experience                | Design, Frontend, PMs               | Bi-weekly              | Design System Owner       |
| **09** | AI IDE Skills & Tooling Ecosystem | All engineers + AI agents + Product | As tools evolve        | AI Platform + Engineering |
| **10** | Remediation, Roadmap & Playbooks  | EAB, Tech Leads                     | Quarterly              | Architecture Board        |

### 3.2 Living Catalogs (Separate from Volumes)

These are **machine-consumable, frequently updated** artifacts:

- **Event Catalog** (living, generated from code + manual)
- **API Catalog** (OpenAPI + AsyncAPI, versioned)
- **MCP Tool Registry** (AI agent capabilities)
- **Prompt Registry** (versioned, evaluated prompts)
- **ADR Repository** (immutable decisions)
- **RFC Repository** (proposals under review)
- **Runbook Catalog** (operational procedures)

### 3.3 Canonical Foundation Layers (Immutable SSOTs)

These three documents are **not volumes**. They are the **bedrock**:

| Layer       | Document                                          | Version (Current) | Nature                                                     |
| ----------- | ------------------------------------------------- | ----------------- | ---------------------------------------------------------- |
| **Layer 1** | Platform Constitution                             | v5.0.2-HARMONIZED | Governance, Principles, Ontology, Laws, State Machines     |
| **Layer 2** | Enterprise Database SSOT                          | v5.0.2-HARMONIZED | Physical schema, RLS, Stored Procedures, Enums             |
| **Layer 3** | Enterprise Product Experience Architecture (EPXA) | v5.1-HARMONIZED   | Technology stack, Bounded Contexts, Traceability, DX rules |

**Rule:** No volume or catalog may contradict these three layers. Conflicts are resolved by referring back to Layer 1 as the highest authority.

---

## 4. Knowledge Governance Model

### 4.1 Ownership & Accountability

| Artifact Type          | Primary Owner             | Approval Required              | Change Process                |
| ---------------------- | ------------------------- | ------------------------------ | ----------------------------- |
| Layer 1 (Constitution) | Lead Architect + EAB      | Full ARB + Lead Architect      | RFC → EAB Vote → Ratification |
| Layer 2 (Database)     | Database Architect        | Data + Security + Architecture | RFC → Technical Review        |
| Layer 3 (EPXA)         | Platform Engineering Lead | Architecture + DX + Security   | RFC → Platform Review         |
| Volumes 01–10          | Volume Owner (assigned)   | Peer Review + Architecture     | PR + Volume Owner sign-off    |
| Living Catalogs        | Domain Owner              | Automated + Human review       | CI/CD + manual override       |
| ADRs                   | Decision Maker            | EAB (for strategic)            | ADR template + merge          |
| RFCs                   | Proposer                  | Relevant domain owners         | Discussion → Decision → ADR   |

### 4.2 Versioning Strategy

- **Layers 1–3**: Semantic Versioning (`MAJOR.MINOR.PATCH`). Major versions require EAB + ARB ratification.
- **Volumes 00–10**: Calendar + semantic (`YYYY.Q.N` or `v5.1.0`). Minor changes do not require RFC.
- **Living Catalogs**: Continuous + tagged releases. Breaking changes require ADR.
- **Deprecation**: Minimum 90-day notice for breaking changes. Documented in relevant volume + ADR.

---

## 5. AI IDE Agent Interaction Model

SEKB is designed to be **first-class context** for AI IDE agents (Google Antigravity, Cursor, Claude, Copilot, etc.).

### 5.1 Recommended Context Loading Order (for AI Agents)

When starting a new task, AI agents **MUST** load in this order:

1. **Volume 00: Knowledge Architecture** (this document) — Understand the system.
2. **Layer 1 Constitution** (latest harmonized) — Ubiquitous language + Enterprise Laws.
3. **Relevant Volume** (e.g., Volume 02 for architecture work, Volume 03 for engineering).
4. **Layer 2 or Layer 3** only when needed for schema or technology decisions.
5. **Living Catalogs** (Event Catalog, API Catalog, MCP Registry) for current state.

### 5.2 Mandatory AI IDE Rules (enforced via `.cursorrules` or system prompt)

See `docs/ai-ide/SEKB-AI-Agent-Rules.md` (to be created).

Core principles:

- Never contradict Layer 1 ubiquitous language.
- All database changes must respect RLS + Enterprise Laws (L-01 to L-10).
- All AI WRITE actions must go through Approval workflow (L-06).
- Every significant decision should reference or create an ADR.
- Use only canonical terms from Volume 01.

---

## 6. Roadmap for SEKB Completion

| Phase       | Focus                            | Target Volumes / Artifacts                                       | Timeline   | Exit Criteria                                     |
| ----------- | -------------------------------- | ---------------------------------------------------------------- | ---------- | ------------------------------------------------- |
| **Phase 0** | Foundation Cleanup               | Volume 00, harmonize Layers 1-3, restructure workspace           | Week 1     | Clean folder structure + Volume 00 ratified       |
| **Phase 1** | Core Volumes                     | Complete Volume 04 (AI), 05 (Ops), 06 (Governance)               | Weeks 2-4  | 3 new volumes production-ready                    |
| **Phase 2** | Business & Product               | Volume 07, 08 + Living Catalogs (Event + API)                    | Weeks 5-7  | Business + Product coverage                       |
| **Phase 3** | Developer Experience & Playbooks | Volume 09, 10 + Runbooks + ADR/RFC process                       | Weeks 8-10 | Full SEKB v5.2 ready                              |
| **Phase 4** | AI-Native Optimization           | Structured data exports, prompt evaluation harness, agent memory | Ongoing    | SEKB becomes active context for autonomous agents |

---

## 7. Success Criteria for SEKB

A successful Enterprise Knowledge Base must satisfy:

- [ ] **Deterministic** — Same question always yields consistent answer (no drift).
- [ ] **Traceable** — Every artifact links back to Layer 1 principles and laws.
- [ ] **Consumable by AI** — Structured, versioned, with clear ownership and context loading rules.
- [ ] **Auditable** — External auditors and regulators can navigate without tribal knowledge.
- [ ] **Evolvable** — 10+ year horizon supported via clear versioning + deprecation policies.
- [ ] **Owned** — Clear human accountability for every section.
- [ ] **Living** — Critical parts (catalogs, runbooks) update faster than volumes.

---

**End of Volume 00**

_This document is the meta-architecture of Moventios knowledge. It is the first document any architect, engineer, or AI agent should read when engaging with Moventios at a deep level._
