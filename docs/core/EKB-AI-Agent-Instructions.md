# EKB AI IDE Agent System Instructions — Moventios (Movent)

**Version:** 5.1.1  
**For:** Google Antigravity, Cursor, Claude Code, Copilot, and other AI IDE agents  
**Date:** June 25, 2026  
**Updated:** Positioning reset to Moventios

---

## Core Mission

You are working inside the documentation and knowledge base for **Movent** (the reusable Relationship Infrastructure) and **Moventios** (the first public ecosystem built on Movent).

**Movent** = reusable engines (Identity, Place, Activation, Governance).
**Moventios** = public Network.
Canonical language: Identity, Organization, Place/Venue, Catalyst, Participation, Governance, Workspace, Network.

Your purpose is to help evolve the infrastructure and the ecosystem experience so that relationship-driven networks (and future Solutions built on the same engines) are easier to discover, trust, activate, and collaborate within.

**Do not treat this as "documentation work" alone.**  
You are helping build a product that teams use to coordinate real-world operations without chaos.

---

## New Knowledge Architecture (Moventios)

**Four Execution Layers** (implementation-first):

1. **Core** (always, minimal): Brand (Moventios/Movent), principles, laws, ubiquitous language, AI rules, coding standards. Loaded every session.
2. **Build** (task-specific): Specs, schemas, decisions, components needed for actual coding.
3. **Operate**: Deployment, runbooks, monitoring (only for ops tasks).
4. **Knowledge**: Research, history, benchmarks (only on explicit request).

**AI Context Policy (80%+ reduction)**:
- Start with Core only.
- Detect task.
- Load Build files **only** when directly relevant to implementation.
- Never preload strategy/ or volumes/.
- Documentation updates are by-products of implementation, not the goal.

## Mandatory Context Loading Order

When starting any significant task, load context in this **exact sequence**:

```
1. .cursorrules                                    ← Core (brand, laws, loading policy, rules) — ALWAYS
2. docs/core/EKB-AI-Agent-Instructions.md         ← Core AI behavior
3. docs/core/Layer-1-Constitution-v5.0.2.md       ← Core (ontology, laws, events)
```

**After Core only:**
- Detect task.
- Load **only** the minimal required Build-layer documents.
- Load Operate or Knowledge **only** if task explicitly demands it.

**Golden Rule:** Load the smallest possible context. Default = Core only. Implementation > documentation volume.

---

## Non-Negotiable Rules

### 1. Ubiquitous Language (Layer 1, Part 3-4)
- Use **only** canonical terms defined in Layer 1 Part 3 and docs/volumes/01-foundations.md.
- **Forbidden terms:** `Ticket`, `Reservation`, `Vendor`, `Space` (unless GeoCoordinate), `Group`, `Process` (when `Workflow` is meant).
- Canonical replacements: `AccessPass`, `Booking`, `Supplier`, `Facility`, `Workflow`.
- If unsure of canonical term → search Layer-1 Part 3 first.

### 2. Enterprise Laws (L-01 to L-10)
**Canonical source: Layer-1-Constitution-v5.0.2.md Part 9.**

**Movent Engine Mapping (reinterpreted bounded contexts):**
- IAM → Identity Engine
- Spatial → Place Engine
- Commerce → Activation Engine
- Workflow → Governance Engine

These are reusable infrastructure components. Moventios and future Solutions are built on top of them.

Enforcement details: docs/volumes/06-governance.md.

| Law | Rule |
|-----|------|
| **L-01** | No cross-bounded-context SQL JOINs. Use Read Models / CQRS at application layer. |
| **L-02** | Financial history is immutable. Use reversal journal entries — never UPDATE/DELETE journal_entries. |
| **L-03** | Soft delete only. All business entities have `deleted_at` + `deleted_by`. |
| **L-04** | All financial/booking mutations require `idempotency_key`. UNIQUE(tenant_id, idempotency_key). |
| **L-05** | Every entity must have a tenant owner (directly or via FK chain). RLS enforced. |
| **L-06** | AI agents have WRITE→PENDING only. Create Approval record — no direct material state mutation. |
| **L-07** | All state mutations flow through Command Handlers (never raw DB writes from API routes). |
| **L-08** | Zero-downtime migrations: Expand/Contract pattern. No RENAME COLUMN or breaking DDL. |
| **L-09** | Observability by default: OpenTelemetry span on every Command Handler + Adapter. |
| **L-10** | No secrets in code, env files, or DB columns. Use HashiCorp Vault exclusively. |

### 3. Architecture Principles (Internal)
- The internal implementation uses hexagonal, event-driven, and other patterns (details in Layers).
- From the product view: the system supports reliable coordination and execution for events and projects.
- Significant product or strategy decisions are captured in `docs/strategy/` and architecture/adr/.

### 4. AI Agent Behavior (L-06 Enforcement)
- You have **READ** access to all knowledge.
- You have **WRITE→PENDING** access to material state: propose via Approval workflow, never execute directly.
- Never generate code that bypasses `Approval` gates for financial, ownership, or workflow changes.

### 5. Traceability
- Every feature, API, event, or schema change must trace back to how it makes planning, executing, monitoring, or auditing events and projects easier, faster, safer, or more profitable.

### 6. Output Quality
- All documents you author must be: self-contained, focused on how features help run events and projects (coordination, execution, visibility, accountability, auditability), free of placeholders.
- Keep public/product content (in `docs/strategy/`) separate in tone from internal engineering details (in `docs/layers/` and architecture docs).

---

## Actual Folder Structure (New 4-Layer Model)

Core files (minimal) are now the default load. Most strategy/ and volumes/ have been classified into Build / Operate / Knowledge.

Legacy flat structure under docs/ is being migrated incrementally by moving existing files.

```
/ (project root)
├── README.md                                      ← Main public documentation (Moventios)
├── .cursorrules                                   ← AI rules + essential mapping (load first)
│
├── docs/
│   ├── layers/                                    ← Internal engineering Layers (SSOT for architecture)
│   │   ├── Layer-1-...
│   │   ├── Layer-2-...
│   │   └── Layer-3-...
│   ├── volumes/                                   ← Knowledge volumes (internal + product guidance)
│   ├── strategy/                                  ← Brand, business, product strategy (commercial foundation)
│   ├── ai-ide/
│   │   └── EKB-AI-Agent-Instructions.md
│   └── architecture/                              ← ADRs and RFCs (internal governance)
│
└── archive/                                       ← Historical / superseded (DO NOT LOAD)
```

**Important for AI agents:**
- Use `docs/layers/` for deep architecture details only when needed.
- Focus on how features help run events and projects.
- Never load entire volumes/ or archive/ unless explicitly investigating history.

---

## When You Should Create an ADR

Create an ADR when you make a decision that:
- Changes architecture significantly
- Introduces new patterns or technologies
- Modifies Enterprise Law enforcement
- Affects multiple bounded contexts
- Changes how AI agents interact with the system (especially L-06)

Use the template in `docs/architecture/adr/TEMPLATE.md`.

---

## Final Principle

> "We are not writing documentation.  
> We are building the deterministic brain of the Platform that will outlive any individual engineer or AI model."

Every artifact you create should be worthy of being the authoritative reference for the next decade.

---

**End of AI IDE Agent Instructions v5.1.1**