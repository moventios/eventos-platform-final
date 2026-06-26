# Volume 03: Engineering Blueprint
## Sovereign OS Enterprise Knowledge Base

**Technology Stack, System Integration Patterns & Developer Standards**

**Version:** 5.1-ENTERPRISE  
**Status:** RATIFIED  
**Date:** June 25, 2026  
**Authority:** Layer 3 EPXA v5.1 (definitive source) | Constitution Part 2.4 (Engineering Principles)  
**Owner:** Platform Engineering Lead

> **Note (2026-06-25):** The legacy `02_engineering-kb.md` has been archived to `archive/volumes/02_engineering-kb.md` (see ADR-003). It is no longer active. This document (`docs/volumes/03-engineering.md`) is the sole canonical engineering specification.

---

## Overview

> **Canonical Source:** Technology decisions dan cross-layer synchronization ada di [Layer-3-EPXA-v5.1.md](../Layer-3-EPXA-v5.1.md).  
> Volume ini menyediakan **practical implementation guidance** (cursorrules, BFF patterns, code examples, monorepo structure) yang melengkapi Layer-3. Bila ada konflik technology decision, Layer-3 menang.

Volume 03 is the **deterministic engineering authority** for Sovereign OS. It translates the ratified technology landscape from Layer 3 (EPXA v5.1) into daily engineering practice: how code is structured, how services communicate, how the BFF pattern is implemented, and what rules AI IDE agents must follow.

**Core Engineering Hierarchy:**
```
Adopt → Configure → Extend → Compose → Replace → Build
```

We do not build commoditized infrastructure. We adopt mature OSS, wrap it in Anti-Corruption Layers (ACL), and enforce Hexagonal isolation at every boundary.

---

## Part 1: Ratified Technology Stack

All technology selections are **final per the current RFC cycle**. Changes require RFC → ADR process (Volume 06, Part 3).

### 1.1 Core Infrastructure

| Category | Technology | Version | License | Constraints |
|----------|-----------|---------|---------|------------|
| **Edge Compute / BFF** | Next.js App Router | 15+ | MIT | Stateless; all business logic in `packages/core`, never in API routes |
| **Domain Services** | Go | 1.22+ | BSD | Used for Finance Ledger, real-time matching; sub-ms latency requirements |
| **Database** | PostgreSQL | 16+ | PostgreSQL | ACID, native RLS, GiST exclusions, HNSW pgvector. SSOT for all state |
| **ORM / Migrations** | Drizzle ORM | Latest | Apache-2.0 | Zero-overhead; direct SQL retained for complex RLS and stored procedures |
| **Caching / KV** | Valkey | Latest | BSD-3 | Redis fork; high-throughput cluster mode; idempotency, session, semantic cache |
| **Workflow Engine** | Trigger.dev | Latest | Apache-2.0 | Durable execution; switch to Temporal when > 1M workflow instances/day |
| **Job Queue / Outbox** | pg-boss | Latest | MIT | PostgreSQL-native outbox pattern; avoids dual-write problem |
| **Notifications** | Resend + Fonnte | Latest | MIT/SaaS | Email (Resend) + WhatsApp (Fonnte); primary providers per Layer 1 |
| **IaC** | OpenTofu | Latest | MPL-2.0 | Terraform-compatible; no vendor lock-in |
| **Monorepo** | Turborepo | Latest | MIT | Remote caching; strict package boundary enforcement |

### 1.2 Auth, Security & Governance

| Category | Technology | Status | Notes |
|----------|-----------|--------|-------|
| **Identity / SSO** | Supabase Auth (OIDC) | ADOPT | JWT claims feed RLS directly; MFA mandatory for financial actions |
| **Authorization** | Cerbos (ABAC) | EXTEND | Decoupled stateless policy engine for complex contextual permissions above RLS |
| **Secrets** | HashiCorp Vault | ADOPT | Dynamic secrets only; AES-256; zero static secrets in code, env, or DB (L-10) |

### 1.3 AI, Search & Cognitive

| Category | Technology | Status | Notes |
|----------|-----------|--------|-------|
| **Vector Store** | pgvector (HNSW) | ADOPT | Tenant-isolated via RLS; 1536-dim embeddings; primary RAG store |
| **Lexical Search** | Typesense | ADOPT | GPL isolated via API only; Meilisearch (MIT) as migration path |
| **LLM Gateway** | OpenRouter | CONFIGURE | Unified routing; fallback chains; per-tenant cost attribution |
| **Agent Protocol** | MCP (Anthropic) | ADOPT | Standardized tool exposure; all WRITE intercepted to Approval (L-06, ADR-002) |

### 1.4 Observability & DX

| Category | Technology | Status | Notes |
|----------|-----------|--------|-------|
| **Telemetry** | OpenTelemetry | ADOPT | End-to-end trace correlation; mandatory in all Command Handlers and Adapters |
| **Error Handling** | OTel + structured logs | ADOPT | PII redaction enforced; no stack traces in production logs |
| **Payments ACL** | Stripe + Xendit + Midtrans Adapters | EXTEND | Wraps each PSP in `IPaymentAdapter` port; emits `PaymentCaptured` domain event |

**License Policy:** GPL/AGPL/copyleft prohibited in core execution paths. Typesense accepted only because it is isolated behind an API boundary.

---

## Part 2: Hexagonal Architecture — Enforcement

### 2.1 Port & Adapter Pattern

Every Bounded Context is a hexagon:

```
                    [DRIVING PORTS]
          REST BFF │ MCP Tools │ CLI / Workers
                    │
             ┌──────┴──────┐
             │  APPLICATION │
             │   SERVICES   │
             │  (Commands,  │
             │   Queries)   │
             │              │
             │    DOMAIN    │
             │  (Aggregates,│
             │   Events,    │
             │   Invariants)│
             └──────┬──────┘
                    │
         [DRIVEN PORTS / ADAPTERS]
    PostgreSQL │ Valkey │ PSP │ OpenRouter │ Trigger.dev
```

**Rules:**
- Domain layer has **zero** infrastructure dependencies (no `import pg from 'pg'` in domain files)
- Application services orchestrate domain + adapters but contain no business logic
- Adapters are swappable — replacing Xendit with Stripe requires only a new adapter, not domain changes

### 2.2 Cross-Context Communication (Events Only)

```
Commerce Context → emits → AccessPassIssued (domain_events table)
                                │
Finance Context ← pg-boss picks up event ←── reads domain_events
                                │
Finance Context → emits → JournalPosted (domain_events table)
```

```typescript
// ✅ CORRECT: Cross-context via Domain Event
await domainEventBus.publish({
  type: 'AccessPassIssued',
  version: 'v1',
  payload: { passId, customerId, eventId, amount, tenantId, traceId }
});

// ❌ FORBIDDEN: Direct cross-context call
import { FinanceService } from '@sovereign/finance-domain';  // L-01 VIOLATION
await financeService.postJournalEntry(passId, amount);       // RPC FORBIDDEN
```

---

## Part 3: Monorepo Structure

### 3.1 Canonical Directory Layout

```
.  (monorepo root)
├── apps/
│   ├── web/                  # Next.js App Router (BFF + Experience layer)
│   │   ├── app/              # App Router pages and layouts
│   │   ├── components/       # Page-specific components (NOT in packages/ui)
│   │   └── middleware.ts     # JWT validation, tenant extraction, rate limiting
│   ├── admin/                # Internal ops console (same stack)
│   └── workers/              # Trigger.dev + Go workers
│       ├── trigger/          # Trigger.dev workflows
│       └── go/               # Go microservices (Finance Ledger, Matching)
│
├── packages/
│   ├── contracts/            # Zod schemas, OpenAPI/AsyncAPI specs, shared types
│   │   ├── commands/         # Command schemas (IssueAccessPassSchema, etc.)
│   │   ├── events/           # Domain event schemas (typed payloads)
│   │   └── api/              # OpenAPI spec files per bounded context
│   │
│   ├── core/                 # Pure domain logic (ZERO infrastructure)
│   │   ├── iam/              # IAM domain: Tenant, Organization, Membership
│   │   ├── spatial/          # Spatial: Facility, Booking, Room
│   │   ├── commerce/         # Commerce: Event, AccessPass, TicketType
│   │   ├── finance/          # Finance: Ledger, JournalEntry, Invoice, Payment
│   │   ├── workflow/         # Workflow: WorkflowInstance, Approval, Task
│   │   └── ai/               # AI: KnowledgeBase, Document, Embedding, Prompt
│   │
│   ├── database/             # Drizzle ORM schemas + SQL migrations
│   │   ├── schema/           # One file per table; named by context
│   │   ├── migrations/       # Drizzle-generated migration files
│   │   ├── rls/              # RLS policy SQL files (source of truth)
│   │   └── procedures/       # Stored procedure SQL files
│   │
│   ├── ui/                   # @sovereign/ui — shared component library
│   │   ├── primitives/       # Radix-based primitives
│   │   ├── data-display/     # Table, Badge, AmountDisplay
│   │   ├── forms/            # Input, Select, DatePicker
│   │   ├── feedback/         # Toast, Alert, Skeleton, Empty
│   │   └── finance/          # LedgerTable, JournalEntry viewer
│   │
│   └── infrastructure/       # Adapters (NOT in domain packages)
│       ├── postgres/          # Drizzle query helpers, RLS context
│       ├── valkey/            # Redis/Valkey client wrapper
│       ├── payment/           # PSP adapters (Xendit, Stripe, Midtrans)
│       ├── notification/      # Resend, Fonnte adapters
│       ├── mcp/               # MCP tool handler infrastructure
│       └── telemetry/         # OpenTelemetry initialization
│
└── infrastructure/            # IaC (OpenTofu modules)
    ├── database/              # PostgreSQL + Supabase config
    ├── compute/               # Vercel/Fly.io configuration
    └── secrets/               # Vault configuration
```

### 3.2 Package Boundary Rules

| Import Direction | Allowed? | Rule |
|-----------------|---------|------|
| `apps/web` → `packages/core` | ✅ Yes | Application imports domain |
| `apps/web` → `packages/ui` | ✅ Yes | Application imports shared UI |
| `packages/core` → `packages/database` | ❌ No | Domain must not depend on infrastructure |
| `packages/core` → `packages/infrastructure` | ❌ No | Domain must not depend on adapters |
| `packages/ui` → `packages/core` | ❌ No | UI components must not contain business logic |
| Cross-package within `apps/` | ❌ No | Each app is self-contained |

**Enforcement:** Turborepo boundary lint rules + TypeScript path mapping.

---

## Part 4: API Standards

### 4.1 BFF Pattern (Mandatory)

All client-facing API routes are in `apps/web/app/api/v1/`. They are the only entry point for external requests. They:
1. Validate JWT (Supabase Auth middleware)
2. Extract `tenant_id` from JWT claims
3. Parse and validate request body via Zod schema from `packages/contracts`
4. Construct Command object
5. Invoke Application Service from `packages/core`
6. Return structured HTTP response

```typescript
// apps/web/app/api/v1/commerce/access-passes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { IssueAccessPassSchema } from '@sovereign/contracts/commands';
import { IssueAccessPassHandler } from '@sovereign/core/commerce';
import { withTenantContext } from '@/middleware/tenant';
import { withIdempotency } from '@/middleware/idempotency';
import { withTracing } from '@/middleware/tracing';

export const POST = withTracing(
  withTenantContext(
    withIdempotency(
      async (req: NextRequest, { tenantId, actorId, traceId }) => {
        // 1. Parse + validate (Zod)
        const body = IssueAccessPassSchema.parse(await req.json());
        
        // 2. Build command
        const command = {
          ...body,
          tenantId,
          actorId,
          traceId,
          idempotencyKey: req.headers.get('X-Idempotency-Key')!
        };
        
        // 3. Execute via Command Handler (domain logic, invariants)
        const handler = new IssueAccessPassHandler(/* DI: repos, event bus */);
        const result = await handler.execute(command);
        
        // 4. Return
        return NextResponse.json(result, { status: 201 });
      }
    )
  )
);
```

### 4.2 API Error Response Standard

```typescript
// Canonical error response shape (ALL API errors must use this)
interface ApiErrorResponse {
  error: {
    code:       string;       // Machine-readable: 'BOOKING_CONFLICT', 'CAPACITY_EXCEEDED'
    message:    string;       // Human-readable (safe for display)
    trace_id:   string;       // For support correlation
    details?:   object;       // Optional: field-level validation errors
  }
}

// HTTP status codes:
// 400 — Validation error (Zod parse fail, missing idempotency key)
// 401 — Unauthenticated (missing or invalid JWT)
// 403 — Unauthorized (valid JWT, insufficient permissions)
// 404 — Entity not found
// 409 — Business rule conflict (capacity exceeded, booking conflict, duplicate)
// 422 — Domain invariant violation (ledger imbalance, state machine violation)
// 429 — Rate limit exceeded
// 500 — Internal server error (sanitized; no stack trace exposed)
```

### 4.3 Required Headers

| Header | Direction | Requirement |
|--------|-----------|------------|
| `X-Idempotency-Key` | Request | REQUIRED on all mutating endpoints (L-04) |
| `X-Trace-Id` | Request | REQUIRED; generated by BFF if not present |
| `Authorization: Bearer <jwt>` | Request | REQUIRED on all authenticated endpoints |
| `X-Trace-Id` | Response | ALWAYS echoed back; enables client-side tracing |
| `Deprecation: true` | Response | Emitted on deprecated API versions |
| `Sunset: <date>` | Response | Emitted on deprecated API versions |

---

## Part 5: AI IDE Agent Rules (cursorrules)

Every AI IDE agent (Cursor, Claude, Copilot, Antigravity) operating in this codebase **must** follow these rules exactly. Non-compliance produces architecturally incorrect code.

[Authority: EPXA Part 19, Volume 06 — L-01 through L-10]

```
# SOVEREIGN OS — MANDATORY AI IDE AGENT RULES v5.1

## ARCHITECTURE
1. HEXAGONAL: Never mix database queries inside Next.js components or API routes.
   All business logic goes in packages/core/{domain}/. API routes orchestrate only.
2. NO RPC: Bounded contexts communicate ONLY through Domain Events via domain_events table.
   Never import services from another bounded context package.
3. DOMAIN PURITY: packages/core/ must have ZERO imports from packages/database/ or
   packages/infrastructure/. Use Repository interfaces (IBookingRepository) only.

## DATABASE
4. ORM: Use Drizzle ORM. ALL new tables must have:
   - tenant_id (UUID, NOT NULL, with RLS policy)
   - created_at, updated_at, created_by, updated_by (AuditStamp)
   - deleted_at, deleted_by (L-03: soft delete)
5. RLS: Every table must have RLS enabled + FORCE RLS. Write the RLS policy SQL
   in packages/database/rls/{table_name}.sql
6. NO CROSS-CONTEXT JOIN: Never write SQL that JOINs tables from different
   bounded contexts. Compose at application layer (BFF) instead. (L-01)

## FINANCE
7. MONEY: All currency amounts use Decimal.js (or decimal-js-light). NEVER use
   JavaScript number or float for money. Column type: NUMERIC(19,4).
8. IMMUTABLE: Never write UPDATE or DELETE on journal_entries, journal_lines,
   journal_entries WHERE status IN ('posted','voided'). Use VoidJournalEntry
   + reversal pattern. (L-02)
9. IDEMPOTENCY: Any route touching financial tables MUST accept and validate
   X-Idempotency-Key header. Add UNIQUE(tenant_id, idempotency_key) to the table. (L-04)

## STATE & VALIDATION
10. STATE MACHINES: If an entity has a state, use the enum from Volume 01 Part 3.
    Never use raw strings for status fields.
11. VALIDATION: ALL incoming payloads must be parsed via Zod schemas from
    packages/contracts/. Never write ad-hoc validation in API routes.
12. COMMANDS: All data mutations go through Command Handlers in packages/core/.
    Never write raw INSERT/UPDATE in API routes or Server Actions. (L-07)

## AI SAFETY
13. MCP TOOLS: If writing a new MCP tool, check Volume 04 Part 1.2 for correct
    access level (0/1/2). Register in mcp_tool_registry table.
14. APPROVALS: Any MCP tool that proposes a material write MUST use Level 1 pattern
    (creates Approval record, no state mutation). (L-06, ADR-002)

## UI
15. COMPONENTS: Use only @sovereign/ui components. Never install new UI libraries
    without RFC approval.
16. TABLES: Use TanStack Table with manualPagination + manualSorting + URL-synced state.
17. FORMS: Use react-hook-form + zodResolver. Pre-generate idempotency_key for
    financial forms before form submission.
18. AMOUNTS: Use <AmountDisplay> component for all currency values. Never render
    raw numbers as currency.

## OBSERVABILITY
19. TRACING: Every Command Handler and Adapter MUST be wrapped in an OpenTelemetry
    span with mandatory attributes (see Volume 05, Part 4.1).
20. LOGGING: No PII, no secrets, no stack traces in production logs.

## SECRETS
21. VAULT: Never store secrets in .env, database columns, or code.
    Use Vault SDK: await vault.read('secret/tenant/{tenantId}/{service}')
    (L-10)

## TERMINOLOGY (STRICT)
22. CANONICAL NAMES: Use ONLY terms from Volume 01 ubiquitous language:
    - AccessPass (not Ticket, not Token)
    - Booking (not Reservation, not Appointment)
    - Supplier (not Vendor)
    - TicketType (not TicketTier, not PassType)
    - Facility (not Space, not Location) [unless in GeoCoordinate context]
    Violation = mandatory code review + refactor before merge.
```

---

## Part 6: Full-Stack Traceability Template

Every new feature must produce a traceability record following this chain. No feature may be shipped without this documentation.

[Authority: EPXA Part 5]

```markdown
## Feature: {Feature Name}

**Business Capability:** {e.g., Commerce & Event Management}
**User Goal:** {One sentence}
**Journey:** {Step 1 → Step 2 → Step 3}
**IA:** {Screen hierarchy}

**Screen:** SCR_{DOMAIN}_{PURPOSE}_{SEQ}
**Component:** {Component name} ({package})

**Interaction:** {user action} → {client validation} → {idempotency_key generated}
**API:** {METHOD} /api/v1/{domain}/{resource} (Headers: X-Idempotency-Key, X-Trace-Id)
**Command:** {CommandName} { field1, field2, idempotencyKey }

**Aggregate:** {AggregateName} → assert {invariant1} AND {invariant2}
**Persistence:** {SQL operation} + RLS policy {policy_name}
**Outbox:** Emits {EventName} to domain_events

**Workflow:** {Trigger.dev workflow if async / approval required}
**AI Context:** {What gets indexed, if applicable}
**Analytics:** {Event name + properties}
**Observability:** Span '{domain}.{operation}' (target < {N}ms p95)

**Testing:**
- Domain invariant: {what invariant is tested}
- Idempotency: {same key → same result}
- Contract: {adapter stub for external service}
- E2E: {happy path + failure path in Playwright}

**Performance Budget:** LCP < {N}s, INP < {N}ms
**Accessibility:** WCAG 2.2 AA, keyboard navigation, ARIA labels
**Offline:** {Buffered / Not applicable}
**Recovery:** {How to retry / rollback}
```

**Example — Access Pass Issuance (Commerce)** is documented in EPXA Part 5.1 and is the canonical reference implementation.

---

## Part 7: Production Readiness Gate

Before merging any code to `main`:

**Automated CI/CD Gates (must pass)**
```bash
# 1. Type checking
pnpm tsc --noEmit

# 2. Lint (includes architecture boundary check)
pnpm eslint . --max-warnings 0

# 3. Unit tests
pnpm test --coverage

# 4. Database migration validation (L-08)
scripts/validate-migration.sh

# 5. Terminology check (L-01 / ubiquitous language)
scripts/check-terminology.sh  # grep for forbidden terms

# 6. Secret scan (L-10)
gitleaks detect --source . --no-git

# 7. OSS license check
npx license-checker --production --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;PostgreSQL"

# 8. Build verification
pnpm build
```

**Code Review Checklist (human)**
- [ ] No cross-context imports or JOINs (L-01)
- [ ] Financial mutations use Command Handler + stored procedure (L-02, L-07)
- [ ] All new tables have RLS + soft delete + audit columns (L-03, L-05)
- [ ] Idempotency key present on financial mutations (L-04)
- [ ] Any new MCP tool has correct access level assigned (L-06)
- [ ] Expand/Contract pattern used if schema rename or type change (L-08)
- [ ] No secrets in code, env, or DB (L-10)
- [ ] Traceability record documented (Part 6 template)
- [ ] OpenTelemetry spans present on all new Command Handlers

---

## Appendix: Sovereign Monorepo Structure (Detailed)

This is the authoritative practical layout referenced by Layer-3.

```
.
├── apps/
│   ├── web/               # Next.js App Router (Experience Layer)
│   │   ├── app/
│   │   │   ├── (commerce)/  # Bounded context routes
│   │   │   │   └── checkout.tsx
│   │   │   ├── (finance)/
│   │   │   └── api/
│   │   │       └── v1/
│   │   │           ├── commerce/
│   │   │           └── finance/
│   │   └── lib/
│   │       ├── client-validations.ts
│   │       ├── api-client.ts
│   │       └── observability.ts
│   └── workers/           # Trigger.dev background orchestrators
│       ├── tasks/
│       │   └── hold-access-pass-timer.ts
│       └── event-listeners/
│           └── on-payment-captured.ts
├── packages/
│   ├── core/              # Pure domain logic (Value Objects, Commands, Aggregates)
│   │   ├── src/
│   │   │   ├── domains/
│   │   │   │   ├── commerce/
│   │   │   │   ├── finance/
│   │   │   │   └── spatial/
│   │   │   ├── value-objects/
│   │   │   │   ├── Money.ts
│   │   │   │   └── TimeRange.ts
│   │   │   ├── commands/
│   │   │   │   └── IssueAccessPassCommand.ts
│   │   │   └── events/
│   │   │       └── AccessPassIssued.ts
│   ├── database/          # Drizzle ORM schemas, migrations
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── index.ts (all tables)
│   │   │   │   └── enums.ts
│   │   │   └── migrations/
│   │   └── drizzle.config.ts
│   ├── ui/                # shadcn components, Tailwind configs
│   │   ├── components/
│   │   │   ├── AccessPassCheckoutForm.tsx
│   │   │   └── BookingCalendar.tsx
│   │   └── tailwind.config.ts
│   ├── contracts/         # Zod schemas, OpenAPI definitions
│   │   ├── src/
│   │   │   ├── commerce/
│   │   │   │   └── issue-access-pass.ts (Zod)
│   │   │   └── openapi/
│   │   │       └── commerce-api.yaml
│   └── observability/
│       ├── src/
│       │   ├── tracing.ts
│       │   └── logging.ts
└── infrastructure/        # OpenTofu IaC modules
    ├── postgresql/
    ├── vault/
    └── app-deployment/
```

## Appendix: Expanded AI IDE Agent Directives (cursorrules)

```
# SOVEREIGN OS — MASTER AI SYSTEM INSTRUCTIONS

1. ARCHITECTURE: Hexagonal (Ports & Adapters). Never mix database queries inside Next.js components or route handlers.

2. DATABASE: Use Drizzle ORM. ALL tables have tenant_id and deleted_at. ALL policies enforce auth.jwt()->>'tenant_id'.

3. FINANCE: All currency must use decimal.js (no floating-point). Never round before final persistence.

4. VALIDATION: All incoming payloads parsed strictly with Zod from packages/contracts.

5. STATE: Business entities with state use explicit enums (booking_state, payment_state, etc.). Never use VARCHAR.

6. UI: Tailwind CSS + pre-existing @sovereign/ui components only. No new npm UI libraries without RFC.

7. TIME: Always serialize dates to PostgreSQL TIMESTAMPTZ in UTC. Never assume local timezone.

8. COMMANDS: Every mutation flows through Command Handler in packages/core. Handler validates invariants, calls repository, publishes event.

9. EVENTS: Every command emits 1+ Domain Events to Outbox (domain_events table). Events are past-tense (PassIssued, not IssuePass).

10. AI SAFETY (L-06): MCP tools categorized Level 0/1/2. Level 1 WRITE tools must call enforce_ai_write_interception() before state transition.

11. OBSERVABILITY: Wrap all Server Actions and Command Handlers in OpenTelemetry spans with tenant_id, actor_id, trace_id.

12. IDEMPOTENCY: Financial, booking, notification mutations require X-Idempotency-Key. Check Valkey cache first; return 304 if hit.

13. TESTS: Unit (invariants), Contract (API schema), E2E (happy + failure paths). No skips in main branch.
```

**End of Volume 03**

*The best engineering decision is one that is boring to maintain, impossible to misuse, and immediately obvious to a new engineer. This blueprint exists to make that possible.*

*[Layer 3 EPXA v5.1] [Constitution Part 2.4] [Volume 06, Enterprise Laws L-01 to L-10] [ADR-001] [ADR-002]*
