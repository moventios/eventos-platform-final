# SEKB AI Index & Mapping

**For AI IDE Agents (Cursor, Claude, Copilot, etc.)**

**Version:** 5.1.1  
**Purpose:** Single source of truth indexing file for coding/implementation tasks.  
**Date:** 2026-06-25

> **CRITICAL RULE FOR AI AGENTS**  
> Never load the entire `volumes/` folder or all .md files at once.  
> Always follow the exact loading order below. Load only the files required for the current task.

---

## 1. Mandatory Loading Order (Strict)

Load in this exact sequence before any coding or architecture task:

1. `.cursorrules` (this workspace root) — includes essential mapping
2. `docs/ai-ide/SEKB-AI-Agent-Instructions.md`
3. `docs/layers/Layer-1-Constitution-v5.0.2.md` — **Always** for ontology, laws, events, commands
4. `docs/layers/Layer-3-EPXA-v5.1.md` — when engineering, tech stack, patterns, or DX decisions
5. `docs/layers/Layer-2-Database-SSOT-v5.0.2.md` — when schema, RLS, stored procedures, or DB enforcement
6. Specific `volumes/XX-*.md` — **only** for targeted depth (see map below)

**Never load:**

- Anything from `archive/` or `archive/meta/`
- Full SEKB folder
- Old DELIVERY-STATUS or large audit files unless explicitly investigating history

**Note:** The full detailed version of this map is here in `docs/SEKB-AI-INDEX.md`. For AI agents, `.cursorrules` now contains the critical mapping rules.

---

## 2. Authority Hierarchy

```
Layer-1 (Constitution) > Layer-2 (Database) > Layer-3 (EPXA) > SEKB Volumes
```

- Layers are **immutable canonical SSOT**.
- SEKB Volumes provide **practical guidance, examples, and reconciliation only**.
- If conflict → Layer wins.

---

## 3. File Map & When to Load

| File                                          | Type      | Purpose                                                                                                                | Load For                                                    | Notes                                                    |
| --------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| `docs/layers/Layer-1-Constitution-v5.0.2.md`  | Layer     | Governance, ontology, ubiquitous language, Enterprise Laws (L-01..L-10), state machines, commands ↔ events, aggregates | **Always** for any feature, bug, or decision                | Highest authority. Parts 3,4,7-10,9,12-13.5,16 most used |
| `docs/layers/Layer-2-Database-SSOT-v5.0.2.md` | Layer     | Schema, enums, RLS, immutable triggers, stored procedures, enforcement                                                 | Schema changes, new tables, financial mutations, RLS issues | References actual Drizzle + migrations                   |
| `docs/layers/Layer-3-EPXA-v5.1.md`            | Layer     | Tech stack, hexagonal + CQRS + event-driven patterns, cross-layer alignment, traceability, high-level DX               | Any implementation, architecture, or integration work       | Authoritative for "how we build"                         |
| `volumes/00-knowledge-architecture.md`        | Volume 00 | Meta rules for SEKB itself, document taxonomy, AI consumption                                                          | Understanding how docs are governed                         | Rarely needed for coding                                 |
| `volumes/01-foundations.md`                   | Volume 01 | Reconciliation matrix + cross-layer mappings + forbidden terms                                                         | Terminology disputes or new entity work                     | Use after Layer-1                                        |
| `volumes/02-enterprise-architecture.md`       | Volume 02 | Bounded context map, communication patterns, repository contracts                                                      | Cross-context work or new domain                            | High-level only — details in Layer-1                     |
| `volumes/03-engineering.md`                   | Volume 03 | Practical tech decisions, monorepo structure, full cursorrules examples, production gates, traceability template       | Day-to-day coding, new packages, CI rules                   | Most frequently used SEKB volume for implementation      |
| `volumes/04-ai-architecture.md`               | Volume 04 | MCP tool registry, L-06 enforcement, RAG pipeline, prompt governance                                                   | Any AI agent, MCP tool, or RAG work                         | Critical for AI-related coding                           |
| `volumes/05-operations.md`                    | Volume 05 | SRE patterns, observability, deployment, runbooks                                                                      | Reliability, scaling, incident work                         | Load when touching infra or monitoring                   |
| `volumes/06-governance.md`                    | Volume 06 | ADR/RFC process, law enforcement mechanisms, compliance                                                                | Governance decisions or new laws impact                     | Use for any architectural change                         |
| `volumes/07-business.md`                      | Volume 07 | Business capability model, value justification (L-01)                                                                  | Feature justification or roadmap work                       | Business-facing                                          |
| `volumes/08-product.md`                       | Volume 08 | Stoic UX, design system, component patterns, performance budgets                                                       | UI/frontend work                                            | Design + frontend engineers                              |
| `volumes/09-reserved.md`                      | Volume 09 | Placeholder                                                                                                            | Future domain expansion                                     | Ignore for now                                           |
| `volumes/10-remediation-roadmap.md`           | Volume 10 | Gap status, technical debt, OSS replacement horizon                                                                    | Long-term planning or risk assessment                       | Living document                                          |

**Quick Rule:**  
Start with **Layer-1 + Layer-3 + volumes/03**. Add others only when the task clearly requires their domain.

---

## 4. Core Rules (Condensed for Fast Loading)

### Ubiquitous Language (Strict)

Use only canonical terms:

- `AccessPass` (not Ticket, Pass, Token)
- `Booking` (not Reservation)
- `Supplier` (not Vendor)
- `Facility` (not Space/Venue unless geographic)
- `TicketType` (not PassTier)
- `Workflow` / `WorkflowInstance`
- `JournalEntry` (not Transaction)

### Enterprise Laws (L-01 to L-10) — Layer-1 Part 9

- **L-01**: No cross-Bounded-Context SQL JOINs. Compose in BFF / Read Model.
- **L-02**: Financial history is append-only. Use reversal entries only.
- **L-03**: Soft delete everywhere (`deleted_at` + `deleted_by`).
- **L-04**: `X-Idempotency-Key` required on all financial/booking mutations.
- **L-05**: Every entity has tenant owner (RLS + FK).
- **L-06**: AI = WRITE→PENDING only. Must create `Approval` record first.
- **L-07**: All mutations go through Command Handlers / stored procedures.
- **L-08**: Zero-downtime migrations (Expand → Contract).
- **L-09**: OpenTelemetry on every handler/adapter.
- **L-10**: No secrets in code, env, or DB (Vault only).

### Commands vs Events

- Commands = imperative (`IssueAccessPass`)
- Events = past tense (`AccessPassIssued`)

### Architecture (Hexagonal + Event-Driven)

- Business logic only in `packages/core`.
- Cross-context = Domain Events via outbox only (no RPC, no direct imports).
- All tables: `tenant_id` + audit columns + soft delete.

---

## 5. Task-Specific Loading Guides (for Coding)

**New feature in Commerce domain**

1. Layer-1 (Parts 3,7,13.5)
2. Layer-3
3. volumes/03 (traceability + gates)
4. volumes/02 (if cross-context)
5. volumes/04 (if AI involved)

**Database / schema change**

1. Layer-1 (relevant parts)
2. Layer-2 (full)
3. Layer-3
4. volumes/06 (governance impact)

**AI / MCP tool or RAG work**

1. Layer-1 (Part 16 + L-06)
2. Layer-3
3. volumes/04 (primary)
4. volumes/03 (for agent rules)

**New Bounded Context or major aggregate**

1. Layer-1 (Parts 7-10)
2. Layer-3
3. volumes/02
4. volumes/06 (ADR required)

**Frontend / UX component**

1. Layer-1 (Stoic UX principles)
2. Layer-3
3. volumes/08
4. volumes/03 (DX rules)

---

## 6. AI Agent Behavior Rules

- You have **READ** access to all knowledge.
- You have **WRITE→PENDING** only for material state (create Approval first).
- Always produce deterministic, cross-referenced output.
- Reference the Layer first, then volume. Never duplicate canonical content.
- If unsure of term → search Layer-1 Part 3-4 first.
- Every significant decision must have (or reference) an ADR.

---

## 7. Navigation & Further Reading

- Full navigation: `README.md`
- Historical cleanup record: `00-SEKB-AUDIT-MAPPING-CLEANUP-PLAN.md`
- ADR decisions: `architecture/adr/`
- Detailed AI instructions: `docs/ai-ide/SEKB-AI-Agent-Instructions.md`

**When in doubt during coding**: Load Layer-1 + Layer-3 + volumes/03 first.

---

**This file is the primary indexing map for AI IDE agents.**  
Load it early. Use it to decide exactly which other files (if any) to bring into context.

_End of SEKB AI Index & Mapping_
