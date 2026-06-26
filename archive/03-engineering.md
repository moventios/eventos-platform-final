# Volume 03: Engineering Blueprint
## Sovereign OS Enterprise Knowledge Base

**Technology Stack, System Integration Patterns, and Implementation Standards**

**Version:** 5.1-ENTERPRISE  
**Status:** RATIFIED  
**Date:** June 25, 2026  
**Authority:** EPXA Parts 2–3, Database SSOT Sections 1–2

---

## Part 1: Ratified Technology Stack

All technologies listed below are **ADOPT** status unless otherwise marked. No substitutions without RFC.

### 1.1 Core Infrastructure

| Category | Technology | Version | License | Status | Justification |
|----------|-----------|---------|---------|--------|---|
| Edge Compute / BFF | Next.js | 15+ | MIT | ADOPT | React Server Components, edge functions, API routes stateless |
| Backend Runtime | Go | 1.22+ | BSD | ADOPT | Ledger, payment processing, high-concurrency services |
| Database | PostgreSQL | 16+ | PostgreSQL | ADOPT | ACID, native RLS, pgvector, GiST exclusion |
| ORM | Drizzle ORM | Latest | Apache-2.0 | EXTEND | Type-safe SQL generation; direct driver control for complex policies |
| Caching / Session | Valkey | Latest | BSD-3 | ADOPT | Redis-compatible; semantic cache, idempotency, rate limiting |
| Workflow Engine | Trigger.dev | Latest | Apache-2.0 | CONFIGURE | Durable execution, long-running tasks, approvals |
| Message Queue | pg-boss | Latest | MIT | ADOPT | PostgreSQL-backed Outbox pattern; no dual-write |
| Notifications | Resend + Fonnte | Latest | MIT / SaaS | ADOPT | Email + WhatsApp; template-driven dispatch |
| Payment ACL | Custom Adapters | Latest | MIT | ADOPT | Wraps Xendit, Stripe, Midtrans; emits standardized events |
| IaC | OpenTofu | Latest | MPL-2.0 | ADOPT | Terraform-compatible; drift detection in CI |
| Monorepo | Turborepo | Latest | MIT | ADOPT | Remote caching, dependency graph enforcement |

### 1.2 Auth, Security & Governance

| Category | Technology | Version | License | Status | Notes |
|----------|-----------|---------|---------|--------|-------|
| Identity / SSO | Supabase Auth | Latest | MIT | ADOPT | OIDC/OAuth2, JWT RS256, native Postgres integration |
| Authorization | Cerbos | Latest | Apache-2.0 | EXTEND | ABAC/RBAC sidecar; complex contextual permissions |
| Secrets Manager | HashiCorp Vault | Latest | BSL/MIT | ADOPT | AES-256 encryption, dynamic secrets, 90-day rotation |

### 1.3 AI, Search & Cognitive

| Category | Technology | Version | License | Status | Notes |
|----------|-----------|---------|---------|--------|-------|
| Vector DB | pgvector | 0.5+ | PostgreSQL | ADOPT | 1536-dim embeddings, HNSW index, tenant-isolated RLS |
| Lexical Search | Typesense | 0.25+ | GPL-3 (isolated) | ADOPT | Ultra-fast typo-tolerant search; isolated via API only |
| LLM Gateway | OpenRouter | Latest | SaaS | CONFIGURE | Claude 3.5, GPT-4o, DeepSeek; fallbacks, cost attribution |
| Agent Protocol | MCP (Anthropic) | Latest | MIT | ADOPT | Standardized JSON-RPC tool exposure; WRITE→PENDING enforcement |

### 1.4 Observability & DevOps

| Category | Technology | Version | License | Status | Notes |
|----------|-----------|---------|---------|--------|-------|
| Telemetry | OpenTelemetry | Latest | Apache-2.0 | ADOPT | Distributed tracing, metrics, logs; Trace-ID end-to-end |
| IaC | OpenTofu | Latest | MPL-2.0 | ADOPT | Declarative infrastructure; drift detection mandatory |
| Monorepo | Turborepo | Latest | MIT | ADOPT | Remote caching, strict package boundaries |

**License Policy:** GPL/AGPL prohibited in core execution paths. Typesense accepted only because isolated via API.

---

## Part 2: Full-Stack Traceability Chain (EPXA Template)

Every new feature MUST produce a traceability record following this chain. Use this as a checklist:

### 2.1 Generic Traceability Chain (Template)

```
1. BUSINESS CAPABILITY
   ↓ (From Constitution Part 6)
   
2. USER GOAL
   ↓ (What user wants to achieve)
   
3. JOURNEY / WORKFLOW
   ↓ (Steps in happy path)
   
4. INFORMATION ARCHITECTURE (IA)
   ↓ (Pages/screens, information structure)
   
5. SCREEN / LAYOUT
   ↓ (SCR_* ID, Figma design token)
   
6. COMPONENT
   ↓ (COMP_* ID, shadcn/ui base)
   
7. CLIENT INTERACTION
   ↓ (onClick, onChange, form submission)
   
8. API CONTRACT
   ↓ (OpenAPI definition, request/response schema)
   
9. COMMAND PAYLOAD
   ↓ (Domain-driven input, validated by Zod)
   
10. APPLICATION SERVICE
    ↓ (Domain service executing the command)
    
11. AGGREGATE INVARIANTS
    ↓ (Guard conditions before mutation)
    
12. PERSISTENCE
    ↓ (SQL INSERT/UPDATE with RLS)
    
13. RLS POLICY ENFORCEMENT
    ↓ (Verify JWT tenant_id match)
    
14. OUTBOX EVENT
    ↓ (Emit domain event to Outbox)
    
15. WORKFLOW ORCHESTRATION
    ↓ (Trigger.dev timer, approval gate, etc.)
    
16. AI CONTEXT INGESTION
    ↓ (Feed to knowledge graph if applicable)
    
17. ANALYTICS EVENT
    ↓ (Track KPI)
    
18. OBSERVABILITY SPAN
    ↓ (OpenTelemetry trace, duration target)
    
19. TESTING REQUIREMENTS
    ↓ (Unit, contract, E2E)
    
20. PERFORMANCE BUDGET
    ↓ (LCP, INP, CLS targets)
    
21. ACCESSIBILITY
    ↓ (WCAG 2.2 AA compliance)
    
22. OFFLINE BEHAVIOR
    ↓ (IndexedDB mutation buffer, deterministic reconciliation)
    
23. RECOVERY / ROLLBACK
    ↓ (Idempotency key, reversal workflow)
```

### 2.2 Concrete Example: Access Pass Issuance (Commerce)

**1. Business Capability:**  
Commerce & Event Management (Constitution Part 6.4)

**2. User Goal:**  
Secure premium access pass before capacity depletes; receive QR code immediately

**3. Journey:**  
Event Discovery → Tier Selection → Payment Method → Confirm → AccessPass Issued → QR Downloaded

**4. Information Architecture:**  
Event Detail Page → Pass Tiers List (3-column grid) → Checkout Modal → Success Overlay

**5. Screen:**  
`SCR_COMMERCE_CHECKOUT_001` (centered modal, dark overlay, max-width 500px)

**6. Component:**  
`AccessPassCheckoutForm` (Radix Dialog, Stripe Elements iframe, Submit button)

**7. Client Interaction:**  
`onClick(Confirm)` → Validate Zod schema locally → Generate UUID idempotency_key → POST

**8. API Contract:**  
```
POST /api/v1/commerce/access-passes
Headers:
  X-Idempotency-Key: {UUID}
  X-Trace-Id: {UUID}
Body: {
  pass_tier_id: string (UUID),
  customer_id: string (UUID),
  payment_method: "stripe" | "xendit"
}
Response: {
  access_pass_id: string,
  status: "pending",
  qr_code: string (data URL),
  expires_at: ISO-8601,
  holder_name: string
}
```

**9. Command Payload:**  
```typescript
class IssueAccessPassCommand {
  constructor(
    public passTypeId: UUID,
    public customerId: UUID,
    public paymentIntentId?: UUID,
    public idempotencyKey: UUID,
  ) {}
}
```

**10. Application Service:**  
```typescript
class CheckoutService {
  async issueAccessPass(cmd: IssueAccessPassCommand): Promise<AccessPass> {
    // Validate payload against Zod schema
    // Query PassType aggregate via IPassTierRepository
    // Check: capacity > issued
    // Create AccessPass aggregate
    // Generate secure QR code
    // save(accessPass)  → triggers OutboxEvent
    // Return AccessPass
  }
}
```

**11. Aggregate Invariants:**  
- Event.status must be 'live' or 'published'
- PassTier.quantity_issued < PassTier.capacity
- AccessPass.status == 'pending' initially
- SecureQRCode.payload is AES-256 encrypted

**12. Persistence:**  
```sql
INSERT INTO access_passes (
  id, pass_tier_id, customer_id, holder_name,
  secure_qr_hash, expires_at, status, created_at, created_by
)
VALUES (
  gen_random_uuid(), $1, $2, $3, $4, now() + interval '15 minutes', 'pending', now(), $5
);
```

**13. RLS Policy:**  
```sql
CREATE POLICY "tenant_isolation_access_passes" ON access_passes
  FOR ALL USING (
    pass_tier_id IN (
      SELECT id FROM pass_tiers WHERE event_id IN (
        SELECT id FROM events WHERE project_id IN (
          SELECT id FROM projects WHERE tenant_id = auth.jwt()->>'tenant_id'::uuid
        )
      )
    )
  );
```

**14. Outbox Event:**  
```json
{
  "event_type": "AccessPassIssued",
  "event_data": {
    "pass_id": "uuid",
    "event_id": "uuid",
    "customer_id": "uuid",
    "expires_at": "ISO-8601",
    "status": "pending"
  },
  "trace_id": "uuid",
  "created_at": "ISO-8601"
}
```

**15. Workflow Orchestration:**  
Trigger.dev schedules 15-minute timer. On `PaymentCaptured` event → transition to 'issued' + emit QR. On timeout → `AccessPassExpired`.

**16. AI Context:**  
Event ingested into Knowledge Graph: "User X reserved Pass Y at time Z for Event E"

**17. Analytics Event:**  
`access_pass.issued { event_id, tier_id, customer_id, timestamp }`

**18. Observability Span:**  
```
commerce.issueAccessPass {
  duration: < 800ms (p95 target)
  attributes: {
    pass_tier_id, customer_id, trace_id
  }
  error_rate: < 0.1%
}
```

**19. Testing Requirements:**
- Unit: Capacity invariant validation
- Contract: API schema validation
- E2E: Checkout happy path + conflict handling
- Idempotency: Same key returns cached result

**20. Performance Budget:**  
LCP < 2.0s, INP < 150ms, CLS < 0.1

**21. Accessibility:**  
WCAG 2.2 AA: keyboard nav, ARIA labels, high-contrast mode

**22. Offline Behavior:**  
Mutation buffered in IndexedDB; reconciliation on reconnect with conflict detection

**23. Recovery:**  
Idempotency key allows safe retry; reversal via `AccessPassRevoked` + refund workflow

---

## Part 3: System Integration Patterns

### 3.1 Hexagonal Architecture (Ports & Adapters)

All domains follow strict inward dependency:

```
┌─────────────────────────────────────────────┐
│  EXTERNAL (UI, APIs, DBs, Services)         │
├─────────────────────────────────────────────┤
│           ADAPTER LAYER                     │
│  ┌──────────────────────────────────────┐   │
│  │ HTTP Adapter │ DB Adapter │ Event... │   │
│  └─────────────┬─────────────┬──────────┘   │
├────────────────┼─────────────┼────────────────┤
│    PORT INTERFACE (Input/Output Boundaries)  │
│  IEventRepository  IPaymentGateway  etc.    │
├─────────────────────────────────────────────┤
│          DOMAIN LOGIC (Pure)                │
│  Aggregates, Commands, Events, Rules       │
└─────────────────────────────────────────────┘

Rules:
✓ Domain logic is dependency-free
✓ Adapters inject dependencies via interfaces
✓ Inbound: HTTP → Adapter → Service → Domain
✓ Outbound: Domain → Event → Adapter → Queue
✗ Never: Domain calls HTTP, DB, or external service directly
```

### 3.2 CQRS (Command Query Responsibility Segregation)

**Command Side (Write):**
- Command → Validate → Aggregate → Domain Event → Outbox
- Normalized tables (one table per aggregate root)
- Transactional consistency (ACID)
- Slow writes; fast, safe mutations

**Query Side (Read):**
- Materialized Views (mv_*) denormalized
- Event-driven refresh (async via pg-boss)
- No JOINs across Bounded Contexts
- Fast reads; eventual consistency acceptable

**Example Flow:**
```
POST /api/v1/finance/invoices (command)
  ↓
POST /api/v1/finance/invoices?read=true (query)
  ↓ (cache stale for 2 seconds, that's ok)
  ↓
SELECT * FROM mv_ledger_summary_view (materialized)
```

### 3.3 Event-Driven Architecture (EDA)

**Rules:**
- ✓ Commands trigger events
- ✓ Events are immutable facts
- ✓ Subscribers are independent (no RPC chain)
- ✗ Never: Subscriber waits for response
- ✗ Never: Circular event chains

**Outbox Pattern** (prevents dual-write):
```sql
-- Atomic: both INSERT together or neither
BEGIN;
INSERT INTO journal_entries (...);
INSERT INTO domain_events (...);  -- Outbox
COMMIT;

-- pg-boss polls domain_events WHERE status='pending'
-- Publishes to Event Bus after COMMIT confirmation
```

### 3.4 BFF (Backend for Frontend) Pattern

One BFF per client type (web, mobile, partner API):

```typescript
// packages/bff/web/src/routes/commerce/[eventId]/checkout.ts
export async function POST(req: Request) {
  const authenticated = await auth.requireUser(req);
  const command = await req.json();
  
  // Validate against Zod
  const payload = checkoutPayloadSchema.parse(command);
  
  // Call domain service
  const accessPass = await checkoutService.issueAccessPass(payload);
  
  // Format response for web client
  return {
    status: 200,
    body: {
      pass_id: accessPass.id,
      qr_code: accessPass.secureQrCode.payload,
      expires_at: accessPass.expiresAt,
    },
  };
}
```

**BFF Responsibilities:**
- Input validation (Zod)
- Authentication & authorization
- Data aggregation (no cross-context JOINs; fetch separately)
- Response formatting (client-specific needs)
- Error translation (domain errors → HTTP status)

### 3.5 Monorepo Structure & Package Boundaries

```
.
├── apps/
│   ├── web/                    # Next.js 15+ App Router
│   │   ├── src/app/
│   │   │   ├── api/            # API routes (server functions)
│   │   │   └── (features)/     # Feature pages
│   │   └── src/components/     # UI components
│   │
│   └── workers/                # Trigger.dev background jobs
│       └── src/workflows/
│
├── packages/
│   ├── core/                   # Domain logic (pure)
│   │   ├── domain/             # Aggregates, commands, events
│   │   ├── services/           # Application services
│   │   └── repositories/       # Repository interfaces
│   │
│   ├── database/               # Persistence layer
│   │   ├── schema/             # Drizzle ORM definitions
│   │   ├── migrations/         # SQL migrations
│   │   └── adapters/           # Repository implementations
│   │
│   ├── ui/                     # shadcn/ui components
│   │   ├── components/         # Radix-based (button, dialog, etc.)
│   │   ├── styles/             # Tailwind config
│   │   └── themes/             # Dark/light mode
│   │
│   └── contracts/              # Shared validation & types
│       ├── zod/                # Zod schemas for validation
│       └── openapi/            # OpenAPI definitions (v3.1)
│
└── infrastructure/             # OpenTofu IaC modules
    ├── modules/
    │   ├── network/
    │   ├── database/
    │   └── compute/
    └── environments/

Dependency Rules:
apps → packages/* (one direction only)
packages/core ← packages/database, packages/contracts
packages/ui ← (nothing; leaf package)
No cycles allowed; enforced by Turborepo
```

---

## Part 4: Critical Implementation Patterns

### 4.1 Idempotency (L-04)

Every financial/booking mutation accepts `X-Idempotency-Key`:

```typescript
// 1. Extract key from request header
const idempotencyKey = req.headers['x-idempotency-key'];

// 2. Check Valkey cache
const cached = await cache.get(`idempotency:${idempotencyKey}`);
if (cached) return cached;  // Return same response

// 3. Execute command
const result = await checkoutService.execute(command);

// 4. Cache result (30 minutes)
await cache.set(`idempotency:${idempotencyKey}`, result, 30 * 60);

return result;
```

**Database Enforcement:**
```sql
-- Unique constraint prevents duplicates
ALTER TABLE invoices ADD CONSTRAINT uq_invoices_idempotency_key
  UNIQUE(idempotency_key);

-- Same for bookings, payments
```

### 4.2 RLS (Row-Level Security) Coverage

**Coverage: 100% of business tables (38 tables)**

**Direct Isolation (tenant_id column):**
```sql
CREATE POLICY "tenant_isolation_invoices" ON invoices
  FOR ALL USING (tenant_id = auth.jwt()->>'tenant_id'::uuid);
```

**Transitive Isolation (FK chain):**
```sql
-- access_passes → pass_tiers → events → projects → tenant_id
CREATE POLICY "tenant_isolation_access_passes" ON access_passes
  FOR ALL USING (
    pass_tier_id IN (
      SELECT id FROM pass_tiers WHERE event_id IN (
        SELECT id FROM events WHERE project_id IN (
          SELECT id FROM projects WHERE tenant_id = auth.jwt()->>'tenant_id'::uuid
        )
      )
    )
  );
```

**Service Role Bypass** (background workers only):
```sql
SET ROLE service_role;  -- Bypasses RLS; only for internal workers
SELECT * FROM sensitive_table;
RESET ROLE;
```

### 4.3 AI Safety Law Enforcement (L-06)

**MCP Tool Access Levels:**

```typescript
// tools in ai_agents table
{
  "tools": [
    {
      "name": "get_ledger_balance",
      "access_type": "READ",
      "description": "Query account balance"
    },
    {
      "name": "issue_refund",
      "access_type": "WRITE→PENDING",
      "description": "Initiate refund (creates approval)"
    },
    {
      "name": "delete_tenant_data",
      "access_type": "BLOCKED",
      "description": "Never exposed to agents"
    }
  ]
}
```

**Enforcement in MCP Handler:**

```typescript
async function handleMCPToolCall(tool: MCPTool, params: any) {
  if (tool.access_type === 'BLOCKED') {
    throw new Error(`Tool ${tool.name} is not available to agents`);
  }
  
  if (tool.access_type === 'READ') {
    return await executeToolDirectly(tool, params);  // Direct execution
  }
  
  if (tool.access_type === 'WRITE→PENDING') {
    // Create approval workflow instead
    const approval = await workflowService.createApproval({
      tool_name: tool.name,
      parameters: params,
      pending_agent_id: currentAgent.id,
      required_approval_role: 'tenant:admin',  // Must be human
    });
    
    return {
      status: 'pending_approval',
      approval_id: approval.id,
      estimated_resolution_time: '24 hours',
    };
  }
}
```

### 4.4 Immutable Financial History (L-02)

**Trigger Enforcement:**

```sql
CREATE OR REPLACE FUNCTION block_journal_mutations()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('posted', 'voided') THEN
    RAISE EXCEPTION 'Cannot modify posted/voided journal entry';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_immutable BEFORE UPDATE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION block_journal_mutations();
```

**Voiding (Never Delete):**

```typescript
class LedgerService {
  async voidJournalEntry(entryId: UUID, reason: string) {
    // 1. Fetch original entry
    const original = await journalRepo.getById(entryId);
    if (!original) throw new Error('Entry not found');
    
    // 2. Create new REVERSAL entry with opposite lines
    const reversal = new JournalEntry({
      reference_type: 'REVERSAL',
      reference_id: entryId,
      narration: `Reversal: ${original.narration}`,
      lines: original.lines.map(line => ({
        ...line,
        type: line.type === 'debit' ? 'credit' : 'debit',  // Flip
      })),
    });
    
    // 3. Post reversal
    await this.postJournalEntry(reversal);
    
    // 4. Mark original as voided (soft flag)
    original.status = 'voided';
    original.voided_at = new Date();
    original.reversal_of_id = reversal.id;
    await journalRepo.save(original);
  }
}
```

---

## Part 5: cursorrules / AI Agent Directives

These rules govern AI IDE agent behavior (Cursor, Claude, Copilot, etc.) when working in Sovereign OS codebase.

### 5.1 Architecture & Design

```
# SOVEREIGN OS - AI AGENT SYSTEM INSTRUCTIONS
# Version: 5.1-ENTERPRISE
# Apply to all code generation, refactoring, and review tasks

## 1. HEXAGONAL ARCHITECTURE MANDATE
- Domain logic lives in `packages/core/domain/*` — pure, dependency-free
- Adapters in `packages/database/adapters/*` — implement repository interfaces
- Controllers/Routes in `apps/web/src/app/api/*` — thin HTTP layer
- NEVER mix concerns: domain entities must not import HTTP, ORM, or external services
- RULE: If domain file imports from 'drizzle-orm' or 'next', REJECT the code

## 2. DATABASE & SCHEMA RULES
- ALWAYS use Drizzle ORM (packages/database/schema)
- EVERY table MUST have: tenant_id, created_at, updated_at, deleted_at, created_by, updated_by
- Temporal columns: TIMESTAMPTZ with UTC
- Currency: NUMERIC(19,4), never FLOAT
- CREATE indexes for: (tenant_id, status), (tenant_id, created_at), FK columns
- NEVER make DELETE statements; use soft delete (deleted_at)

## 3. ENTITY NAMING — CANONICAL ONLY
- Use ONLY terms from Volume 01: Foundations
- Forbidden: "Tiket", "Pass", "Reservation", "Vendor", "Space", "Group"
- Canonical: "AccessPass", "Booking", "Supplier", "Workspace"
- Database tables: snake_case, plural (journal_entries, access_passes)
- Domain entities: PascalCase, singular (JournalEntry, AccessPass)
- RULE: If code uses deprecated terms, refuse to generate and link to Volume 01

## 4. COMMAND-DRIVEN MUTATIONS
- User action → Command object (IssueAccessPassCommand)
- Command → Domain service (CheckoutService.execute)
- Service → Aggregate (accessPass = AccessPass.create(...))
- Aggregate validates invariants; throws if invalid
- Domain event emitted (AccessPassIssued)
- Repository.save() → atomic INSERT (aggregate + events in transaction)
- RULE: No SQL mutations outside of repository.save()

## 5. FINITE STATE MACHINES (STATE ENUMS)
- EVERY entity with status must use explicit enum (booking_state, payment_state, journal_state)
- Enum values from Constitution Part 12; immutable
- State transitions via command handler with guard conditions
- RULE: NEVER use string literals like status='pending'; always use enum

## 6. VALIDATION — ZOD SCHEMAS
- ALL user input validated with Zod (packages/contracts/zod)
- Request schema defined once, imported everywhere
- Validate in BFF before calling domain service
- Domain service assumes input is valid (no re-validation)
- RULE: If route handler missing Zod parse, REJECT

## 7. RLS (ROW-LEVEL SECURITY)
- EVERY SELECT/INSERT/UPDATE must respect tenant_id isolation
- Auth context: JWT claims include tenant_id (from Supabase)
- Test RLS policy: try to access other tenant's data → should fail
- RULE: If new table added without RLS policy, REJECT the migration

## 8. IDEMPOTENCY (L-04)
- Mutations (booking, payment, invoice) MUST accept X-Idempotency-Key header
- Check Valkey cache for key before executing
- If cached, return same response (no re-execution)
- If new, execute, cache result (30 min TTL)
- Database: UNIQUE(idempotency_key) constraint
- RULE: POST /api/v1/commerce/bookings missing idempotency_key? REJECT

## 9. OBSERVABILITY — OTEL SPANS
- Wrap command handlers in OpenTelemetry spans
- Attributes: trace_id, tenant_id, actor_id, duration
- Error handling: log to OpenTelemetry, translate to HTTP 5xx
- RULE: If domain service missing span, REJECT

## 10. NO CROSS-CONTEXT JOINS (L-01)
- NEVER: SELECT FROM bookings JOIN journal_entries (different contexts)
- ALWAYS: Fetch separately, compose in application
- RULE: If SQL query joins tables from different Bounded Contexts, REJECT

## 11. API VERSIONING
- Path: /api/v1/, /api/v2/, etc.
- Schema: @openapi v3.1 (packages/contracts/openapi)
- Breaking changes: new major version + 90-day sunset notice
- RULE: If breaking change without version bump, REJECT

## 12. NO FINANCIAL MUTATIONS WITHOUT LEDGER
- AccessPass issued → emits event → Ledger context subscribes → creates Invoice + JournalEntry
- RULE: Never INSERT into journal_entries outside of post_ledger_transaction() stored procedure

## 13. ERROR HANDLING
- Domain exceptions: custom error classes (BookingConflictError, InsufficientFundsError)
- Translate to HTTP status in BFF (4xx for client error, 5xx for server error)
- Never expose internal error details; log full details to OpenTelemetry
- RULE: If error response leaks stack trace or database query, REJECT

## 14. ASYNC/AWAIT — DETERMINISTIC
- Use async/await consistently; no promise chains
- Errors automatically propagate (no .catch() swallowing)
- Wrap in try/catch at BFF level
- RULE: If promise chain or unhandled rejection possible, REJECT

## 15. TEST REQUIREMENTS
- Unit: Domain invariants (capacity check, state transitions)
- Contract: Repository interface implementation
- E2E: Happy path + error scenarios
- RULE: If feature added without tests, REJECT

```

---

## Part 6: Performance & Reliability Targets

| Metric | Target | Notes |
|--------|--------|-------|
| API Latency (p95) | < 500ms | Excludes external integrations |
| Database Query (p99) | < 100ms | With proper indexes |
| LCP (Largest Contentful Paint) | < 2.0s | First paint visible |
| INP (Interaction to Next Paint) | < 150ms | Responsiveness |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability |
| Error Rate | < 0.1% | Financial transactions |
| Availability (SLA) | 99.5% | Excludes planned maintenance |
| MTTR (Mean Time to Recover) | < 15 min | From incident detection |

---

**Volume 03: Engineering Blueprint | SEKB v5.1-ENTERPRISE | Ratified June 25, 2026**
