# **SOVEREIGN OS — ENTERPRISE PRODUCT EXPERIENCE ARCHITECTURE (EPXA) & ENGINEERING SPECIFICATION**

**Version:** 5.1 (ARB Harmonization Release)
**Classification:** Canonical Single Source of Truth (SSOT) — Engineering Blueprint
**Status:** RATIFIED
**Date:** June 2026
**Supersedes:** Layer 3 v5.0.1-ENTERPRISE
**Alignment:** Constitution v5.0.2, Database SSOT v5.0.2

---

## **DEPENDENCIES**

- **Layer 1:** Platform Constitution v5.0.2 (Governance, Principles, Ontology, Ubiquitous Language, Enterprise Laws, Domain Events, State Machines, Command ↔ Event Mapping)
- **Layer 2:** Enterprise Database SSOT v5.0.2 (ERD, Schemas, RLS Policies, Immutable Triggers, Materialized Views, Stored Procedures)

**Harmonization Notes (ARB Audit):**
- Resolved terminology drift (TicketType ↔ pass_tiers): Canonical term is TicketType in domain language; database mapping to `pass_tiers` table is implementation detail, not ontology.
- Clarified API contract expectations: BFF layer responsible for multi-join assembly; no cross-context SQL joins at database.
- Formalized AI Safety Law (L-06): MCP tools categorized into Level 0/1/2; Level 1 WRITE tools auto-create Approval rows before state transition.
- Complete Command ↔ Event mapping provided in Constitution Part 13.5; Layer 3 implements all command sequences.
- RLS policy coverage verified 100% (38 tables); Layer 3 assumes RLS enforced at application middleware level and database level.

---

## **PART 1: EXECUTIVE SUMMARY & ARCHITECTURE POSITIONING**

Sovereign OS is an **AI-Native, Zero-Trust, Event-Driven Distributed Ledger & Workflow Engine** for enterprise B2B operations spanning physical logistics, spatial resource management, commerce, and Swiss-standard financial integrity.

Layer 3 transforms the ratified Layer 1 principles and Layer 2 persistence model into a **complete, enforceable engineering specification**. It guarantees unbroken traceability from business capability to database execution, observability, and AI interaction while enforcing Hexagonal Architecture, DDD, CQRS, Event-Driven Architecture, and Zero Trust at every boundary.

### Core Tenets (Non-Negotiable)

- Every mutation flows through a Command → Aggregate → Domain Event → Outbox.
- No cross-bounded-context JOINs at the database (L-01).
- All financial history is Append-Only (L-02).
- AI never writes material state without explicit Human Approval (L-06) — routed through Workflow Approval gate; no bypass regardless of confidence score.
- Every request carries a `tenant_id` claim enforced by RLS and application middleware.
- Idempotency is mandatory for all financial, booking, and notification mutations (L-04); Valkey-backed.

---

## **PART 2: ENTERPRISE TECHNOLOGY LANDSCAPE & OSS CATALOG**

All technologies evaluated against DDD compatibility, RLS support, Hexagonal isolation, licensing, maturity, and long-term sustainability (as of June 2026).

### 2.1 Core Infrastructure

| Category | Technology | Status | License | Justification | Constraints |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Edge Compute / BFF** | Next.js 15+ (App Router) | ADOPT | MIT | Stateless, React Server Components, BFF API gateway. Implements multi-join logic for cross-context reads (L-01 compliant). | All business logic remains in domain packages; never in route handlers. |
| **High-Throughput Services** | Go 1.22+ | ADOPT | BSD | Sub-ms cold start for Ledger, real-time matching, financial invariant validation. | Type-safe; errors are explicit. |
| **Database** | PostgreSQL 16+ + pgvector | ADOPT | PostgreSQL | ACID, native RLS (tenant isolation), GiST (spatio-temporal), HNSW (vector RAG). Single source of truth. | No sharding; vertical scaling to 500GB+ supported. |
| **ORM / Migrations** | Drizzle ORM | EXTEND | Apache-2.0 | Zero-overhead, type-safe SQL wrapper. Direct SQL control retained for complex RLS and immutable triggers. | Schema-as-code; migrations are code. |
| **Caching / KV** | Valkey (Redis fork) | ADOPT | BSD-3 | Idempotency key cache (24h TTL), session state, semantic cache, rate limiting. Cluster mode ready. | All cache misses are safe; upstream always authoritative. |
| **Workflow / Orchestration** | Trigger.dev (primary) | CONFIGURE | Apache-2.0 | Durable execution for approvals, scheduled tasks, sagas. Temporal.io planned if \> 1M instances/day or cross-language required. | Runs on Next.js; serverless-friendly. |
| **Job Queue / Outbox** | pg-boss | ADOPT | MIT | PostgreSQL-native outbox pattern. Avoids dual-write problem; domain events reliably dispatched. | Monitor: queue depth, worker pool size, retry exponential backoff (max 5 attempts). |
| **Notifications** | Resend (Email) + Fonnte (WhatsApp) | ADOPT | MIT / SaaS | Aligned to Constitution Part 6.8. Template-driven, reliable delivery, per-tenant config. | Novu as optional wrapper for template versioning. |
| **IaC** | OpenTofu | ADOPT | MPL-2.0 | Terraform-compatible, no vendor lock-in. Drift detection mandatory in CI. | State stored in remote backend (S3 + DynamoDB lock). |
| **Monorepo** | Turborepo | ADOPT | MIT | Remote caching, dependency graph. Strict package boundaries enforced via Eslint import plugin. | Workspace: apps/, packages/ (core, database, ui, contracts). |

### 2.2 Auth, Security & Governance

| Category | Technology | Status | Notes |
| :---- | :---- | :---- | :---- |
| **Identity / SSO** | Supabase Auth (OIDC) | ADOPT | JWT claims directly feed RLS (`auth.jwt()->>'tenant_id'`). MFA mandatory for financial actions. |
| **Authorization** | Cerbos (ABAC) | EXTEND | Decoupled policy engine for complex contextual permissions above RLS. Simple RBAC flows may use RLS + JWT only. |
| **Secrets** | HashiCorp Vault | ADOPT | Dynamic secrets, AES-256, auto-rotation (90 days or on leak). Zero static secrets in code/env/DB. |

### 2.3 AI, Search & Cognitive

| Category | Technology | Status | Notes |
| :---- | :---- | :---- | :---- |
| **Vector Store** | pgvector (HNSW) | ADOPT | Tenant-isolated via RLS. Primary for RAG. 1536-dim embeddings. |
| **Lexical Search** | Typesense (isolated) | ADOPT | Ultra-fast typo-tolerant search. GPL isolated via API only. Meilisearch (MIT) as alternative. |
| **LLM Gateway** | OpenRouter | CONFIGURE | Unified routing, fallbacks, cost attribution per tenant. Direct provider (OpenAI/Groq) for specific SLAs. |
| **Agent Protocol** | MCP (Anthropic) | ADOPT | Standardized JSON-RPC tool exposure. All WRITE actions Level 0/1/2 categorized (Constitution Part 16.1); Level 1 → auto-creates Approval. |

### 2.4 Observability & DX

| Category | Technology | Status | Notes |
| :---- | :---- | :---- | :---- |
| **Telemetry** | OpenTelemetry | ADOPT | End-to-end trace correlation (`trace_id`). Mandatory in all Server Actions, Command Handlers, adapters. |
| **Error / Exception** | OpenTelemetry + structured logs | ADOPT | Redaction of PII/secrets enforced via policy. |
| **Deployment** | Vercel (web), Supabase (database), Fly.io (go services) | ADOPT | Stateless edge compute. Multi-region ready. |

---

## **PART 3: CROSS-LAYER SYNCHRONIZATION & CANONICAL ALIGNMENT**

All terminology, aggregates, commands, events, and entities synchronized with Layer 1 (SSOT for language and governance) and Layer 2 (SSOT for persistence).

### 3.1 Ontology Harmonization

| Concept | Layer 1 (Canonical) | Layer 2 (Database) | Layer 3 (Code) | Conversion Point |
| :---- | :---- | :---- | :---- | :---- |
| **TicketType** | Aggregate component of Event; pricing tier, capacity, duration | `pass_tiers` table (properties: name, price, capacity, quantity_issued) | Domain model `TicketType` (immutable value object); Drizzle `passTiers` table reference | ACL at commerce boundary: `PassTierDTO → TicketType` |
| **AccessPass** | Individual instance of right-of-entry, linked to TicketType | `access_passes` table (customer_id, pass_tier_id, secure_qr_hash, status) | Domain `AccessPass` aggregate; Drizzle `accessPasses` table | Entity mapping: 1:1 between domain and persistence |
| **Booking** | Spatio-temporal claim on Room with lifecycle | `bookings` table (room_id, time_range GiST, idempotency_key) | Domain `Booking` aggregate; conflict detection via GiST | Entity mapping: 1:1 |
| **Approval** | Human-in-the-loop verification gate in Workflow; L-06 enforcement | `approvals` table (status, assigned_to, request_context JSONB) | Domain `Approval` entity; workflow state machine blocking | Entity mapping: 1:1; creation via `enforce_ai_write_interception()` |
| **JournalEntry** | Transactional unit of accounting (debit+credit pairs) | `journal_entries` table (status, posted_at, reversal_of_id) | Domain `JournalEntry` aggregate with invariant ∑debit=∑credit | Entity mapping: 1:1 |

### 3.2 Ubiquitous Language Enforcement

All code, API contracts, database comments, and AI prompts use only terms from Constitution Part 4:

- Domain code: `TicketType`, `AccessPass`, `Booking`, `Approval` (PascalCase singular)
- Database schema: `ticket_type` → `pass_tiers`, `access_pass` → `access_passes` (snake_case plural)
- API contracts: Domain names (TicketType in request/response schemas; Drizzle layer internal)
- AI prompts / MCP tools: Canonical names from Constitution Part 4

**Conversion Code Pattern:**
```typescript
// ACL boundary: Drizzle ↔ Domain
interface PassTierDTO {
  id: string; // from pass_tiers
  name: string;
  price: Decimal;
  capacity: number;
}

function dtoToTicketType(dto: PassTierDTO): TicketType {
  return TicketType.create({
    id: dto.id,
    name: dto.name,
    price: Money.create(dto.price, 'IDR'),
    capacity: dto.capacity,
  });
}
```

---

## **PART 4: BOUNDED CONTEXT & DOMAIN CATALOG (DETERMINISTIC TEMPLATE)**

Every Bounded Context follows this exact structure. Ownership is explicit. Communication is exclusively via Domain Events (no RPC).

### 4.1 IAM & Governance (Supporting Domain)

**Purpose:** Multi-tenant isolation, identity, authorization.

**Aggregate Roots:** `Tenant`, `Organization`, `Workspace`

**Entities:** `Department`, `Membership`

**Commands:** `ProvisionTenant`, `InviteUser`, `AssignRole`, `FreezeTenant` (see Constitution Part 13.5)

**Domain Events:** `TenantProvisioned`, `MembershipGranted`, `TenantFrozen` (Constitution Part 13.1)

**Read Models:** `TenantSummaryView`, `UserMembershipView`

**Repositories (interface in domain package):**
```typescript
interface ITenantRepository {
  getById(tenantId: UUID): Promise<Tenant>;
  create(cmd: ProvisionTenantCommand): Promise<Tenant>;
  freeze(tenantId: UUID, reason: string, actor: IdentityReference): Promise<void>;
}
```

**Ports:**
- **Driving:** REST/GraphQL BFF, MCP tools (read-only: `get_tenant_summary`)
- **Driven:** Supabase Auth adapter (external identity → internal Membership), Cerbos policy adapter

**ACL Boundaries:**
- Supabase Auth → ACL: External identity mapped to internal `User` + `Membership`
- Cerbos → ACL: Complex ABAC rules evaluated above RLS

**APIs:**
- BFF: `/api/v1/iam/tenants`, `/api/v1/iam/memberships` (versioned)
- Internal: Event-driven only

**Database Mapping (Layer 2):**
`tenants`, `organizations`, `workspaces`, `memberships`, `profiles` (from auth.users)
RLS: `tenant_id = auth.jwt()->>'tenant_id'` on all tables

**AI Rules (L-06):**
- MCP tools: `get_tenant_summary` (READ only)
- No WRITE actions for IAM (requires admin via Approval gate)

---

### 4.2 Spatial & Facility (Core — Competitive)

**Purpose:** Collision-free spatio-temporal resource allocation.

**Aggregate Roots:** `Facility`

**Entities:** `Room`, `Asset`, `Booking`

**Value Objects:** `TimeRange`, `GeoCoordinate`, `Address`

**Commands:** `RegisterFacility`, `CreateRoom`, `SubmitBooking`, `ApproveBooking`, `CancelBooking` (Constitution Part 13.5)

**Domain Events:** `FacilityRegistered`, `BookingSubmitted`, `BookingApproved`, `BookingConflictDetected`, `BookingCanceled` (Constitution Part 13.2)

**Queries:**
```typescript
interface IBookingQueries {
  getAvailableRooms(facilityId: UUID, timeRange: TimeRange): Promise<Room[]>;
  getBookingCalendar(roomId: UUID, month: Date): Promise<BookingCalendarView[]>;
}
```

**Invariants:**
- `Booking` time overlaps on same Room blocked by PostgreSQL GiST EXCLUSION USING gist (room_id WITH =, time_range WITH &&)
- Facility status must be `Active` to accept new bookings

**Stored Procedures / Functions:**
- PostgreSQL GiST constraint enforces zero-conflict invariant at insert time
- No application-level conflict detection needed

**Database Mapping:**
`facilities`, `rooms`, `bookings`, `booking_histories` (audit trail)
GiST index on `(room_id, time_range)` with EXCLUSION constraint

**Read Models:**
`mv_booking_calendar_view` (event-driven, real-time)

**AI Rules:**
- `get_booking_status` (READ)
- `create_booking` always routed through Workflow Approval gate (requires human approval before booking.status → Approved)

---

### 4.3 Commerce & Event (Core — Competitive)

**Purpose:** End-to-end event lifecycle, ticketing (AccessPass), inventory, commercial transactions.

**Aggregate Roots:** `Event`

**Entities:** `TicketType` (Layer 2: `pass_tiers` table), `AccessPass`

**Commands:** `PublishEvent`, `IssueAccessPass`, `RevokeAccessPass`, `CheckInAccessPass`, `ConsumeAccessPass` (Constitution Part 13.5)

**Domain Events:** `EventPublished`, `AccessPassIssued`, `AccessPassScanned`, `AccessPassRevoked`, `AccessPassExpired`, `AccessPassConsumed` (Constitution Part 13.3)

**Invariants:**
- AccessPass quantity issued must not exceed TicketType capacity: `issued ≤ capacity`
- AccessPass hold timer (15 min default): Pending → Expired if no PaymentCaptured event received
- Event status `Live` required to issue new AccessPasses

**Database Mapping:**
`events`, `pass_tiers` (TicketType), `access_passes`, `products`, `inventory_lots`
RLS via project → organization → tenant

**Read Models:**
`mv_event_sales_view` (event-driven + nightly recompute)

**ACL Boundaries:**
- Payment outcomes received via webhook ACL → standardized `PaymentCaptured` event (never raw PSP structures)

**AI Rules (L-06):**
- `get_event_availability` (READ)
- `issue_access_pass` → Level 1 (auto-creates Approval; blocks until human approves)
- Mass issuance or price change requires explicit Approval

---

### 4.4 Finance & Ledger (Core — Competitive)

**Purpose:** Swiss-standard double-entry accounting with immutable history.

**Aggregate Roots:** `Ledger`

**Entities:** `Account`, `JournalEntry`, `JournalLine`, `Invoice`, `Payment`, `Escrow`

**Value Objects:** `Money`, `LedgerBalance`, `TaxRate`

**Commands:** `PostJournalEntry`, `IssueInvoice`, `CapturePayment`, `ReleaseEscrow`, `VoidJournalEntry` (Constitution Part 13.5)

**Domain Events:** `InvoiceIssued`, `PaymentInitiated`, `PaymentProcessing`, `PaymentCaptured`, `PaymentFailed`, `PaymentSettled`, `PaymentReconciled`, `RefundInitiated`, `RefundSettled`, `JournalPosted`, `JournalVoided`, `EscrowReleased` (Constitution Part 13.4)

**Invariants:**
- Double-entry balance: ∑Debit = ∑Credit (to penny; enforced by `post_ledger_transaction()` stored procedure)
- Immutability: JournalEntry posted cannot be modified; only voided (creates new reversal entry)
- Account classification: Every account must belong to one of {Asset, Liability, Equity, Revenue, Expense}

**Stored Procedures:**
- `post_ledger_transaction(p_journal_entry_id, p_actor_id, p_trace_id)` (Constitution Part 13.5): Validates balance, updates status, emits JournalPosted event, locks Ledger row for consistency
- `enforce_ai_write_interception(p_command_type, p_actor_id, p_actor_type, p_aggregate_id, p_tenant_id)` (L-06): Creates Approval before material WRITE completes

**Database Mapping:**
`ledgers`, `ledger_accounts`, `journal_entries`, `journal_lines`, `invoices`, `payments`, `escrows`
RLS on `ledger_id` → tenant
Immutable triggers on status = 'posted' / 'voided'

**Read Models:**
`mv_ledger_summary_view`, `mv_customer_invoice_history_view` (event-driven, async debounce 5s)

**ACL Boundaries:**
- All PSP webhooks (Xendit, Stripe, Midtrans) → `IPaymentAdapter` → normalized Domain Events (never raw PSP structures)

**AI Rules (L-06):**
- `get_ledger_balance`, `get_invoice_summary` (READ only)
- `draft_journal_entry` → Level 0 (FORBIDDEN; human must via web UI)
- Any accounting mutation requires explicit Approval before state transition

---

### 4.5 Workflow & Operations (Supporting Domain)

**Purpose:** State machine orchestration and human-in-the-loop approvals.

**Aggregate Roots:** `Workflow` (template), `WorkflowInstance` (execution)

**Entities:** `Task`, `Approval`, `StateTransitionLog`

**Commands:** `StartWorkflow`, `RequestApproval`, `ResolveApproval`, `CompleteWorkflow` (Constitution Part 13.5)

**Domain Events:** `WorkflowStarted`, `ApprovalRequested`, `ApprovalResolved`, `WorkflowCompleted` (Constitution Part 13.5)

**Blocking Mechanism:**
- `WorkflowInstance.status = Running` remains blocked at approval gate until `Approval.status = Approved`
- Event listener (`ApprovalResolved`) unblocks and transitions to next state
- Rejected approvals abort workflow entirely

**Database Mapping:**
`workflows`, `workflow_states`, `workflow_transitions`, `workflow_instances`, `approvals`, `tasks`

**Orchestration Provider:**
- **Primary:** Trigger.dev (durable execution, schedule-friendly)
- **Horizon:** Temporal.io (if instances \> 1M/day or cross-language required)

**AI Rules:**
- AI may request Approval but never auto-resolve material approvals
- MCP tool `request_approval` creates entry; human must resolve

---

### 4.6 AI & Knowledge (Core — Competitive)

**Purpose:** RAG, semantic search, agent orchestration, safe AI augmentation.

**Aggregate Roots:** `KnowledgeBase`

**Entities:** `Document`, `Embedding`, `Prompt`, `AIAgent`

**Value Objects:** `Chunk`, `Vector` (1536-dim)

**Commands:** `IndexDocument`, `UpdatePrompt`, `ConfigureAgent`, `GenerateRecommendation` (Constitution Part 13.5)

**Domain Events:** `KnowledgeIndexed`, `EmbeddingGenerated`, `AIRecommendationGenerated` (Constitution Part 13.5)

**Queries:**
```typescript
interface IKnowledgeQueries {
  searchKnowledgeBase(tenantId: UUID, query: string, limit: number): Promise<SearchResult[]>;
  getRAGContext(tenantId: UUID, entityId: UUID, aggregateType: string): Promise<string>;
}
```

**RAG Pipeline:**
1. **Ingestion:** Document → Text Extraction → Recursive Character Chunking (512 tokens, 64 overlap) → text-embedding-3-large → pgvector (1536-dim)
2. **Retrieval:** Hybrid Search (Typesense BM25 + pgvector HNSW Cosine Similarity) → Reranking → Context Injection
3. **Augmentation:** LLM context injected with retrieved chunks; prompt versioning from `prompts` table

**Prompts Table (Layer 2):**
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  template TEXT NOT NULL,
  input_schema JSONB, -- Variables that can be injected
  output_format JSONB, -- JSON Schema for response
  guardrails JSONB, -- Active filters (PII, hallucination, etc.)
  status VARCHAR(50) DEFAULT 'draft', -- draft | active | deprecated
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**AIAgent Tools (MCP):**
```typescript
interface MCPToolDefinition {
  name: string;
  access_type: 'READ' | 'WRITE→PENDING' | 'FORBIDDEN'; // Constitution Part 16.1
  description: string;
  input_schema: JSONSchema;
  output_schema: JSONSchema;
}

// Example: CREATE TABLE ai_agents (
//   tools JSONB[] -- array of MCPToolDefinition
// );
```

**L-06 Enforcement (MCP Tool Safety):**
- **Level 0 (FORBIDDEN):** `post_journal_entry`, `transfer_asset`, `delete_record`
- **Level 1 (PENDING):** `issue_access_pass`, `cancel_booking`, `create_approval` → auto-creates Approval row before execution
- **Level 2 (ALLOWED):** `get_ledger_balance`, `search_knowledge_base`, `list_events`

**Database Mapping:**
`knowledge_bases`, `documents`, `document_versions`, `chunks`, `embeddings`, `prompts`, `ai_agents`

**AI Rules (Strict — L-06):**
- Any WRITE proposal from AI generates `Approval` entry; workflow transitions to `PendingApproval` state; human must explicitly `ResolveApproval` before material state change
- No bypass based on confidence score, model capability, or token count
- All LLM outputs logged with trace_id for audit trail

---

## **PART 5: ENTERPRISE PRODUCT EXPERIENCE ARCHITECTURE (EPXA)**

EPXA provides **exhaustive, deterministic traceability** from Business Capability to every implementation layer. Every new feature produces a traceability record following this chain.

### 5.1 Generic Traceability Chain (Mandatory Template)

```
Business Capability (Layer 1 Part 6)
↓ User Goal & Journey
↓ Information Architecture
↓ Screen ID + Layout Design
↓ Component + Interaction Handler
↓ Client Validation (Zod)
↓ API Contract (OpenAPI) + Idempotency Key
↓ Command Validation + Aggregate Invariants
↓ Persistence (INSERT/UPDATE with RLS + immutable triggers)
↓ Outbox Domain Event
↓ Workflow / Trigger.dev Orchestration (if approval or async)
↓ AI Context Ingestion (if applicable)
↓ Read Model Refresh
↓ Analytics Event
↓ Observability Span (OpenTelemetry trace_id end-to-end)
↓ Testing Requirements (unit + contract + E2E)
↓ Performance Budget (LCP/INP/CLS targets)
↓ Accessibility (WCAG 2.2 AA)
↓ Offline Behavior (IndexedDB mutation buffer + deterministic reconciliation)
↓ Recovery / Rollback Path
```

### 5.2 Traceability Example: Access Pass Issuance (Commerce Domain)

**Business Capability:** Commerce & Event Management (Constitution Part 6.4)

**User Goal:** Secure verified AccessPass before capacity depletes; receive QR code; check in at event.

**Journey:** Event Discovery → Tier Selection → Payment Intent → Confirmation → AccessPass Issued + QR Download → Event Day Check-In.

**Information Architecture:** Event Detail Screen → Pass Tiers List (sortable, filterable) → Checkout Modal (payment form overlay) → Success Screen (QR code, PDF download, email confirmation).

**Screen:** `SCR_COMMERCE_CHECKOUT_001` (centered modal over dark overlay; 90% max-width on mobile; focus trap).

**Component:** `AccessPassCheckoutForm` (Radix Popover, Stripe Elements iframe for payment).

**Interaction:**
```typescript
// Client: onClick(ConfirmPurchase) →
const payload = {
  ticketTypeId: selectedTicketType.id,
  customerId: currentUser.id, // or guest email
  quantity: 1,
  idempotencyKey: uuidv4(), // Generated client-side
};

// Local Zod validation before submit
const schema = z.object({
  ticketTypeId: z.string().uuid(),
  customerId: z.string().uuid(),
  quantity: z.number().int().positive(),
  idempotencyKey: z.string().uuid(),
});

const validated = schema.parse(payload);
```

**API Contract:**
```typescript
// POST /api/v1/commerce/access-passes
// Headers:
//   X-Idempotency-Key: {uuid}
//   X-Trace-Id: {trace_id}
//   Authorization: Bearer {jwt}

Request: {
  ticketTypeId: UUID,
  customerId: UUID,
  quantity: number,
  idempotencyKey: UUID,
}

Response (202 Accepted — async processing):
{
  accessPassId: UUID,
  status: "pending",
  expiresAt: ISO8601,
  qrHash: string,
  approvalRequired: boolean,
  approvalId?: UUID,
}
```

**Command:**
```typescript
// Layer 3 Command Handler
interface IssueAccessPassCommand {
  ticketTypeId: UUID;
  customerId: UUID;
  quantity: number;
  idempotencyKey: UUID;
}

class IssueAccessPassHandler {
  async execute(cmd: IssueAccessPassCommand, actor: IdentityReference): Promise<UUID> {
    // Load aggregates
    const ticketType = await ticketTypeRepository.get(cmd.ticketTypeId);
    const event = await eventRepository.get(ticketType.eventId);

    // Validate invariants
    if (ticketType.quantityIssued + cmd.quantity > ticketType.capacity) {
      throw new CapacityExceededError();
    }
    if (event.status !== 'Live') {
      throw new EventNotLiveError();
    }

    // Execute Command (idempotent via key)
    const accessPass = AccessPass.create({
      id: uuid(),
      ticketTypeId: cmd.ticketTypeId,
      customerId: cmd.customerId,
      status: 'pending',
      expiresAt: now() + 15 minutes,
      secureQrHash: hash(payload),
      idempotencyKey: cmd.idempotencyKey,
    });

    // Persist (RLS enforced at DB level)
    await accessPassRepository.save(accessPass);

    // Emit Domain Event
    await eventBus.publish(new AccessPassIssued({
      passId: accessPass.id,
      eventId: event.id,
      ticketTypeId: ticketType.id,
      customerId: cmd.customerId,
      expiresAt: accessPass.expiresAt,
      qrHash: accessPass.secureQrHash,
      traceId: ctx.traceId,
    }));

    return accessPass.id;
  }
}
```

**Aggregate Invariants:**
- `AccessPass.status` must be one of enum `access_pass_state` (pending, issued, checked_in, consumed, revoked, expired)
- `Event.status = 'Live'` required
- `TicketType.quantityIssued < capacity` (checked at command execution; atomic via database)

**Persistence (L-02, L-03, L-04):**
```sql
-- INSERT access_passes with RLS policy enforced
INSERT INTO access_passes (
  id, pass_tier_id, customer_id, holder_name, secure_qr_hash,
  expires_at, status, idempotency_key, created_by
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
ON CONFLICT (idempotency_key) DO UPDATE
  SET updated_at = NOW() -- Idempotent: returns existing record
WHERE tenant_id = auth.jwt()->>'tenant_id'; -- L-04 (idempotency)
```

**RLS Policy:**
```sql
CREATE POLICY "tenant_isolation_access_passes" ON access_passes
  FOR ALL USING (
    -- Indirect traversal: access_passes → pass_tiers → events → projects → tenant_id
    EXISTS (
      SELECT 1 FROM pass_tiers pt
      JOIN events e ON e.id = pt.event_id
      JOIN projects p ON p.id = e.project_id
      WHERE pt.id = access_passes.pass_tier_id
        AND p.tenant_id = auth.jwt()->>'tenant_id'
    )
  );
```

**Outbox Domain Event:**
```typescript
// domain_events Outbox table (L-02 append-only)
{
  id: uuid(),
  tenant_id: JWT_TENANT_ID,
  event_type: 'AccessPassIssued',
  event_payload: {
    passId: UUID,
    eventId: UUID,
    ticketTypeId: UUID,
    customerId: UUID,
    expiresAt: ISO8601,
    qrHash: string,
    traceId: UUID,
  },
  status: 'pending',
  created_at: NOW(),
}
```

**Workflow / Trigger.dev Orchestration:**
```typescript
// Trigger.dev task (durable execution)
export const holdAccessPassTimer = task({
  id: 'hold-access-pass',
  run: async (passId: UUID, expiresAt: Date) => {
    // Wait for AccessPassIssued event consumer to detect PaymentCaptured
    // If timer expires without PaymentCaptured, emit AccessPassExpired
    const result = await waitForEvent({
      eventType: 'PaymentCaptured',
      timeout: 15 * 60 * 1000, // 15 min
    });

    if (!result) {
      // Timer expired; emit expiry event
      await eventBus.publish(new AccessPassExpired({
        passId,
        expiredAt: NOW(),
        traceId: ctx.traceId,
      }));
    }
  },
});
```

**AI Context Ingestion:**
```typescript
// Event listener: AccessPassIssued → Knowledge Graph update
eventBus.on('AccessPassIssued', async (event) => {
  const embedding = await embedModel.embed(
    `AccessPass issued for customer ${event.customerId} at ${event.createdAt}`
  );

  await knowledgeBase.insert({
    documentId: event.passId,
    chunkId: uuid(),
    text: `Customer ${event.customerId} purchased ${event.ticketTypeId} at ${event.createdAt}`,
    vector: embedding,
    metadata: { passId: event.passId, eventId: event.eventId },
  });
});
```

**Read Model Refresh:**
```typescript
// mv_event_sales_view (materialized, event-driven)
// Refreshed on AccessPassIssued, PaymentCaptured, AccessPassRevoked events
// Aggregates: qty_sold, revenue_gross, revenue_net, by_tier, by_cohort
```

**Analytics Event:**
```typescript
// Custom event for BI
{
  event_name: 'access_pass.issued',
  tenant_id: JWT_TENANT_ID,
  user_id: ACTOR_ID,
  pass_id: UUID,
  event_id: UUID,
  tier_id: UUID,
  quantity: 1,
  revenue_usd: NUMERIC,
  timestamp: ISO8601,
  trace_id: UUID,
}
```

**Observability Span:**
```typescript
// OpenTelemetry (end-to-end correlation)
const span = tracer.startSpan('commerce.issueAccessPass', {
  attributes: {
    'tenant_id': JWT_TENANT_ID,
    'actor_id': ACTOR_ID,
    'actor_type': 'USER',
    'event_id': EVENT_ID,
    'ticket_type_id': TICKET_TYPE_ID,
    'trace_id': TRACE_ID,
    'span.kind': 'internal',
    'domain': 'commerce',
    'aggregate': 'AccessPass',
    'event_name': 'AccessPassIssued',
    'status': 'success',
  },
  startTime: Date.now(),
});

// Measure duration
const duration = Date.now() - startTime;
span.addEvent('duration_ms', { value: duration });
// SLA target: p95 < 800ms
```

**Testing Requirements:**
- **Unit:** Invariant validation (capacity check, event status), idempotency key deduplication
- **Contract:** BFF ↔ API contract matches OpenAPI; Drizzle queries match RLS policies
- **E2E:** Happy path (issue, pay, check in); capacity exhausted; timer expiry; concurrent requests with same idempotency key

**Performance Budget:**
- **LCP** (Largest Contentful Paint): \< 2.0s (event list page load)
- **INP** (Interaction to Next Paint): \< 150ms (click confirm → form validation)
- **CLS** (Cumulative Layout Shift): \< 0.1 (no jank on modal appearance)

**Accessibility (WCAG 2.2 AA):**
- Keyboard navigation: Tab through form; Enter to confirm
- ARIA labels: "Pass Tier: Gold (€50, 100 remaining)"
- High contrast: Text AAA ratio (7:1)
- Focus management: Modal focus trap; return focus on close

**Offline Behavior:**
- Mutation buffered in IndexedDB (pass_id, ticket_type_id, customer_id)
- On reconnect: Re-submit with same idempotency_key
- Conflict: API returns existing AccessPass; IndexedDB record merged

**Recovery / Rollback:**
- If payment fails (PaymentFailed event): AccessPass.status remains `Pending`; hold timer expires → `Expired`; no refund needed
- If manual revocation: RevokeAccessPass command → Approval gate → AccessPassRevoked event → triggers refund workflow
- Disaster: Point-in-time recovery via WAL archiving; replay events from Outbox table

---

## **PART 6: API GOVERNANCE & VERSIONING**

- All public APIs **defined contract-first** in OpenAPI 3.1 (or AsyncAPI for events)
- Versioning: URL path (`/api/v1/`, `/api/v2/`); breaking changes require new major version + 90-day sunset notice
- BFF pattern mandatory for all client-facing surfaces; domain APIs internal only
- Error responses follow standardized taxonomy (Constitution Appendix B)
- Every mutating endpoint **accepts and validates** `X-Idempotency-Key`
- Rate limiting: per-tenant + per-user with tenant override capability
- API linting (Spectral) + breaking-change detection enforced in CI pipeline

---

## **PART 7: AI ENGINEERING & MCP TOOL SAFETY LEVELS** (L-06 Enforcement)

### 7.1 MCP Tool Categorization (Constitution Part 16.1)

**Level 0 — FORBIDDEN** (Never callable by AI)
- Direct financial mutations: `post_journal_entry`, `capture_payment`, `issue_invoice`
- Ownership changes: `transfer_asset`, `change_account_owner`
- Permanent deletes: `delete_record`, `purge_data`

**Level 1 — PENDING** (AI callable; auto-creates Approval)
- Material writes: `issue_access_pass`, `cancel_booking`, `draft_journal_entry`, `revoke_access_pass`, `create_approval`
- Behavior: Callable by AI agent; immediately creates `Approval` row with status = `Pending`; blocks Workflow until human tenant:admin approves
- Enforcement: MCP tool handler checks permission level; for Level 1, calls `enforce_ai_write_interception()` stored procedure before returning 202 Accepted to LLM

**Level 2 — ALLOWED** (AI callable; no approval)
- Read-only: `get_ledger_balance`, `search_knowledge_base`, `list_bookings`, `get_event_status`, `get_payment_status`, `get_workflow_instance`, `get_invoice_summary`
- No state changes; no approval needed

### 7.2 MCP Tool Implementation Pattern

```typescript
// MCP Tool Handler (BFF layer)
export async function handleMCPToolCall(tool: MCPToolDefinition, input: unknown): Promise<unknown> {
  const actor = ctx.actor; // from JWT: actor_id, actor_type
  const aggregateId = input.aggregateId;

  // Check tool access level
  if (tool.access_type === 'FORBIDDEN' && actor.type === 'AI_AGENT') {
    throw new ForbiddenError(`AI agents cannot call ${tool.name}`);
  }

  if (tool.access_type === 'WRITE→PENDING' && actor.type === 'AI_AGENT') {
    // Level 1: Auto-create Approval
    const approvalId = await db.call('enforce_ai_write_interception', {
      commandType: tool.name,
      actorId: actor.id,
      actorType: actor.type,
      aggregateId,
      aggregateType: tool.aggregateType,
      tenantId: ctx.tenantId,
    });

    return {
      status: 'pending',
      approvalId,
      statusCode: 202, // Accepted
      message: 'Awaiting human approval',
    };
  }

  // Level 2: Direct execution for READ tools
  if (tool.access_type === 'READ') {
    return await executeReadTool(tool, input);
  }

  throw new UnknownToolError(tool.name);
}
```

---

## **PART 8: PRODUCTION OPERATIONS & SRE CATALOG**

### 8.1 Resiliency & Fault Tolerance

- **Circuit Breakers:** All external integration ports (Stripe, OpenRouter, WhatsApp) implement Circuit Breakers. If error rates exceed 15% in 30s, circuit opens; failing fast emits IntegrationDegraded event
- **Dead Letter Queues (DLQ):** Any pg-boss job failing 5 consecutive exponential backoff retries routed to DLQ for manual engineering review
- **Idempotency Registry:** Required for ALL financial and booking mutations (L-04); Valkey caches requests against `X-Idempotency-Key` header for 24h

### 8.2 Deployment & Scaling

- **API / Web:** Vercel / Cloudflare Pages for Edge rendering (stateless; infinite scaling)
- **Database:** Supabase Managed PostgreSQL with pgBouncer connection pooling; write-heavy ops → Primary; read-heavy → Read Replicas
- **Go Services:** Fly.io or self-hosted Kubernetes; horizontal scaling via replica counts
- **Disaster Recovery:** PITR via WAL archiving; RTO \< 15 min; RPO \< 5 min

### 8.3 SLA Targets (Constitution Part 18)

| Operation | p50 | p95 | p99 |
| :---- | :---- | :---- | :---- |
| Booking submit | 80ms | 200ms | 500ms |
| Payment capture | 150ms | 400ms | 1000ms |
| Journal post | 100ms | 250ms | 600ms |
| Access pass issuance | 120ms | 300ms | 700ms |

---

## **PART 9: DEVELOPER EXPERIENCE (DX) & AI IDE RULES**

All human engineers and AI IDE Agents (Cursor, Claude, Copilot) follow these canonical rules.

### 9.1 Sovereign Monorepo Structure & AI IDE Rules (Summary)

**Detailed monorepo tree, full directory examples, and expanded cursorrules are in [volumes/03-engineering.md](volumes/03-engineering.md).**

This Layer provides the authoritative high-level principles. Practical code structure lives in the Volume for day-to-day use by engineers and AI agents.

(Full expanded monorepo tree and AI directives moved to volumes/03-engineering.md for maintainability.)

---

## **PART 10: PRODUCTION READINESS CHECKLIST**

- \[x\] All Bounded Contexts (Part 4) defined with Aggregate Roots, Commands, Events, Repositories
- \[x\] All Commands mapped to Domain Events (Constitution Part 13.5)
- \[x\] All State Machines complete with guard conditions (Constitution Part 12)
- \[x\] Enterprise Laws L-01 through L-10 enforced at DB + application layers (Part 6)
- \[x\] MCP Tools categorized Level 0/1/2 with L-06 enforcement via stored procedures
- \[x\] Traceability chains documented for critical paths (Part 5.2)
- \[x\] EPXA Coverage: All 8 business capabilities mapped to Domain, Commands, Events, Read Models
- \[x\] API Contracts: OpenAPI 3.1 per bounded context; versioning strategy
- \[x\] SLA Targets defined and monitored (Part 8.3)
- \[x\] Accessibility (WCAG 2.2 AA) and offline-first patterns specified
- \[x\] Disaster Recovery and Rollback paths documented
- \[x\] DX tooling (monorepo, linting, testing) specified
- \[x\] AI Agent rules (MCP safety, prompt versioning, guardrails) formalized

---

## **PART 11: APPENDIX — GLOSSARY & QUICK REFERENCE**

| Term | Meaning | Layer Reference |
| :---- | :---- | :---- |
| **Aggregate Root** | Entity that owns a cluster of objects; boundary for consistency | DDD; Part 4 of Layer 3 |
| **Command** | Imperative request to mutate state (e.g., `IssueAccessPass`) | Constitution Part 13.5 |
| **Domain Event** | Historical fact of what happened (e.g., `AccessPassIssued`) | Constitution Part 13 |
| **Bounded Context** | Explicit boundary around a model; clear ownership | Part 4 |
| **Repository** | Interface for loading/saving aggregates | Part 4 per context |
| **Value Object** | Immutable, equality-by-value (e.g., `Money`, `TimeRange`) | Constitution Part 11 |
| **RLS Policy** | PostgreSQL row-level security; enforces tenant isolation | Layer 2, Part 8 |
| **Outbox Pattern** | Reliable event dispatch via database table; no dual-write | Layer 2, Part 1 |
| **MCP Tool** | JSON-RPC callable endpoint for AI agents; Level 0/1/2 categorized | Part 7 |
| **Approval** | Human-in-the-loop verification gate; blocks Workflow until resolved | Constitution Part 3.4 |
| **L-06** | AI Write Interception: AI WRITE → Approval gate before state transition | Constitution Part 9, Part 6 |

---

**End of Layer 3 — EPXA v5.1 (ARB Harmonization)**

