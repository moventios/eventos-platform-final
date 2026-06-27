# SOVEREIGN OS ENTERPRISE KNOWLEDGE BASE (SEKB)

**Version:** 1.0.0  
**Status:** PRODUCTION READY  
**Date:** June 25, 2026  
**Classification:** Canonical Single Source of Truth (SSOT)  
**Supersedes:** Layer 1 v5.0.1, Layer 2 v5.0.1, Layer 3 v5.1, ARB Audit v1.0

---

# EXECUTIVE SUMMARY

Sovereign OS is an **AI-Native, Zero-Trust Enterprise Operating System** for B2B SaaS. It unifies physical logistics, multi-tenant digital commerce, spatial resource management, and Swiss-standard financial ledger integrity into a deterministic ecosystem.

**This SEKB is the authoritative, unified repository** of all architectural knowledge, operationalized for:

- **Autonomous AI agents** (Google Antigravity, Cursor, Claude)
- **500+ person engineering teams** needing clear ownership & governance
- **Regulated enterprises** (HIPAA, SOX, GDPR) requiring audit & compliance
- **10+ year evolution** with minimal documentation drift

**Maturity Assessment:** 6.5/10 (strong DDD foundation; missing operations, governance, compliance)

**Critical Path to Production:** Phase 0-1 remediation (7 weeks) before scaling to 200+ engineers or selling to regulated customers.

---

# VOLUME 0: KNOWLEDGE ARCHITECTURE & AI IDE RULES

## Purpose & Scope

This SEKB consolidates three previously separate SSOTs into one coherent, machine-readable knowledge base. It is the **definitive reference** for all Sovereign OS development, operations, and governance decisions.

## Recommended `.cursorrules` for AI IDE Agents

```
# SOVEREIGN OS DEVELOPMENT RULES (for Cursor, Claude, Copilot)

## 1. ARCHITECTURE: Hexagonal + DDD
- Business logic in `packages/core/domain` (ISOLATED from DB, UI, APIs).
- Database queries ONLY in repositories (`packages/database/repositories`).
- No domain logic in Next.js API routes; routes are thin adapters to Command Handlers.

## 2. DATABASE: Multi-Tenant Isolation (RLS + Middleware)
- EVERY table MUST have `tenant_id` (directly or via FK chain).
- EVERY table MUST have RLS policy: `tenant_id = auth.jwt()->'tenant_id'`.
- Test: `SELECT count(*) FROM {table} WHERE tenant_id != current_tenant_id; -- expect 0 rows`.

## 3. FINANCE: Double-Entry, Immutable, Idempotent
- All mutations (`payments`, `invoices`, `journal_entries`) accept `idempotency_key`.
- Ledger mutations ONLY via `post_ledger_transaction()` stored procedure.
- All currency: `numeric(19,4)`, never `float`.
- Test: ∑ debit = ∑ credit for all journal entries.

## 4. STATE MACHINES: Explicit, Guarded, Audited
- EVERY state transition has explicit guards (checked before UPDATE).
- Transition history logged to `{entity}_histories` (immutable append-only).
- Invalid transitions rejected with explicit error.

## 5. COMMANDS & EVENTS: Deterministic, Async
- Commands: imperative (`IssueAccessPass`, `CapturePayment`).
- Events: past-tense (`AccessPassIssued`, `PaymentCaptured`).
- Events go to Outbox table; no direct subscribers.
- Test: Every command emits exactly one event.

## 6. API: Contract-First, Versioned, Idempotent
- Define OpenAPI 3.1 BEFORE implementation.
- All mutations accept `X-Idempotency-Key` header.
- All endpoints include `X-Trace-Id` for distributed tracing.
- Breaking changes: increment major version (v1 → v2).

## 7. VALIDATION: Zod Schemas, Strict
- All API inputs validated via `packages/contracts` Zod schemas.
- No `any` types; use `satisfies` for exhaustive pattern matching.
- Domain invariants checked in Command Handlers, not in routes.

## 8. AI AGENTS: Read-Only, Approval-Gated
- AI agents have `READ` access to ledger, policies, documents.
- AI agents CANNOT directly issue payments, invoices, approvals.
- All WRITE proposals from AI → Approval workflow (human sign-off required).
- MCP tools categorized: `access_level: 'READ' | 'WRITE->PENDING'`.

## 9. TESTING: Comprehensive
- Unit: Domain aggregates (80% coverage).
- Contract: Pact + OpenAPI linting.
- E2E: Playwright (happy + failure paths; all state transitions).
- Property-based: fast-check (ledger balance invariant, idempotency).
- Performance: k6 (p50/p95/p99 latencies, error budget).

## 10. OBSERVABILITY: Distributed Tracing
- Every Command Handler wrapped in OpenTelemetry span.
- Span attributes: `tenant_id`, `actor_id`, `command_name`, `aggregate_id`.
- Logs: structured JSON with `trace_id`, `span_id` for correlation.
- Errors: PII redaction, stack trace truncation.

## 11. NAMING: Ubiquitous Language
- Use ONLY canonical terms from SEKB Volume 1.
- e.g., `AccessPass` (not `Ticket`), `Booking` (not `Reservation`).
- Database: snake_case. Domain models: PascalCase.

## 12. MONOREPO: Strict Boundaries
- `packages/core`: Domain logic (ZERO external deps except `decimal.js`, `zod`).
- `packages/database`: ORM, migrations, RLS.
- `packages/ui`: React components (shadcn/ui only).
- `packages/contracts`: Zod schemas, OpenAPI types.
- `apps/web`: Next.js BFF (thin adapter layer).
- `apps/workers`: Trigger.dev background jobs.

## 13. COMMIT MESSAGES: Deterministic
- Format: `{type}({scope}): {description} [{ticket-id}]`
- e.g., `feat(payment): capture payment via Stripe webhook [SOV-1234]`
- Include ADR reference for architecture changes: `[ADR-007]`

## 14. DEPRECATION: Explicit, Versioned
- Use `@deprecated` JSDoc + link to ADR.
- Remove after 2 releases + 90-day notice (CHANGELOG).

## 15. RFC / ADR: Before Major Changes
- Propose significant changes via RFC.
- Approved RFCs become ADRs (immutable).
```

---

# VOLUME 1: FOUNDATIONS

## 1.1 Ubiquitous Language (Canonical Terminology)

All code, documentation, databases, and conversations MUST use ONLY these canonical terms.

| Term                 | Definition                                             | Usage                                                      | Forbidden                                  | Reason                                                |
| -------------------- | ------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| **Tenant**           | Top-level SaaS isolation boundary (one per customer).  | "This Tenant has 5 invoices."                              | Account, Customer, Workspace (wrong level) | Tenants are org-level; Customers are personas.        |
| **Organization**     | Legal entity / business unit under Tenant.             | "Register new Org under Tenant ABC."                       | Company, Department                        | DDD aggregate root.                                   |
| **Workspace**        | Collaborative area / project boundary.                 | "Assign user to Workspace Marketing."                      | Space, Team, Channel                       | Specific DDD aggregate.                               |
| **Facility**         | Physical/virtual asset container (building, venue).    | "Facility 'Downtown Office' has 10 rooms."                 | Venue, Location, Site                      | Domain-specific to Spatial context.                   |
| **Room**             | Discrete, bookable unit within Facility.               | "Room 'Conference A' available 9am-5pm."                   | Space, Unit                                | Enforces single identity.                             |
| **Booking**          | Claim (spatio-temporal) on Room during TimeRange.      | "Booking #123 reserves Conference A."                      | Reservation, Appointment, Rent             | Distinct from AccessPass.                             |
| **Event**            | Aktualisasi Project; spatio-temporal gathering.        | "Event 'Tech Summit' starts 2026-09-15."                   | Konferensi, Meeting, Program               | DDD aggregate; orchestrates Commerce.                 |
| **TicketType**       | Tier/category of AccessPass for Event.                 | "TicketType 'VIP' costs $500."                             | Tier, Pass Tier                            | Aggregate child; Ticket is overloaded.                |
| **AccessPass**       | Cryptographically verified right-of-entry.             | "AccessPass #456 grants entry to Tech Summit."             | Ticket, Wristband, Pass                    | Distinct from Booking.                                |
| **Campaign**         | Structured marketing initiative to drive conversions.  | "Campaign 'Early Bird' offers 20% discount."               | Promotion, Drive, Blast                    | DDD aggregate.                                        |
| **Product**          | Saleable good or service (SKU).                        | "Product 'Merchandise' has 100 units."                     | Item, SKU                                  | DDD aggregate.                                        |
| **Supplier**         | Third-party B2B vendor providing goods/services.       | "Supplier 'Acme Logistics' approved."                      | Vendor, Provider, Partner                  | DDD aggregate; distinct from Customer.                |
| **Customer**         | External buyer / consumer.                             | "Customer 'Alice' purchased 2 AccessPasses."               | Client, Attendee, Buyer                    | CRM aggregate; lifecycle: Lead→Active→Churned.        |
| **Asset**            | Trackable physical/digital property.                   | "Asset 'Projector #42' assigned to Conference Room A."     | Equipment, Gear                            | Spatial domain.                                       |
| **Ledger**           | Double-entry accounting ledger (one per Tenant).       | "Ledger for Tenant ABC is balanced."                       | General Ledger                             | Finance aggregate root.                               |
| **Account**          | Chart of Accounts node (Asset, Liability, etc.).       | "Account 1000 (Cash) has balance $50,000."                 | GL Account, CoA Node                       | Finance; nested hierarchy.                            |
| **JournalEntry**     | Single balanced transaction (∑ debit = ∑ credit).      | "JournalEntry #789 posts $1,000 revenue."                  | Transaction (overloaded), Mutation         | Finance; immutable after Posted.                      |
| **JournalLine**      | Single debit or credit within JournalEntry.            | "JournalLine: Debit Account 4000 (Revenue) $1,000."        | Posting, Line Item                         | Finance; child of JournalEntry.                       |
| **Invoice**          | Commercial billing document.                           | "Invoice #INV-001 for $10,000 due 2026-08-15."             | Bill, Statement                            | Finance; triggers payments.                           |
| **Payment**          | Transfer of funds.                                     | "Payment #PAY-123 captured $5,000 via Stripe."             | Transaction (overloaded), Transfer         | Finance; state-machine (8 states).                    |
| **Escrow**           | Funds held in suspension until release trigger.        | "Escrow $2,000 locked until Event completion."             | Hold, Reservation                          | Finance; immutable until released.                    |
| **Workflow**         | State machine template for business process.           | "Workflow 'Approval' defines transitions."                 | Process, Pipeline, Engine                  | Aggregate root (template); immutable after Published. |
| **WorkflowInstance** | Single execution of Workflow.                          | "WorkflowInstance for Booking #123 in PendingApproval."    | Job, Run, Execution                        | Aggregate root (instantiation).                       |
| **Task**             | Atomic work unit within WorkflowInstance.              | "Task 'Verify Contact Info' assigned to user@example.com." | Todo, Action Item, Subtask                 | Workflow child.                                       |
| **Approval**         | Human-in-the-loop gate within WorkflowInstance.        | "Approval gate: $50k payment requires CFO sign-off."       | Gate, Checkpoint, Decision                 | Workflow child; blocks progression.                   |
| **DomainEvent**      | Immutable fact: past-tense statement of what happened. | "DomainEvent: AccessPassIssued(passId=123)."               | Event (overloaded), Notification, Message  | Event-Driven architecture.                            |
| **Command**          | Imperative request to change state.                    | "Command: IssueAccessPassCommand(eventId=X)."              | Request, Action, Operation                 | CQRS pattern.                                         |
| **ReadModel**        | Denormalized view optimized for queries.               | "ReadModel: EventSalesView (updated every 5 sec)."         | Projection, Snapshot, Cache                | CQRS pattern.                                         |
| **Aggregate**        | Consistency boundary; root + children.                 | "Aggregate: Event (root) → TicketType → AccessPass."       | Entity Cluster, Domain Model               | DDD; transaction boundary.                            |
| **BoundedContext**   | Explicit linguistic/organizational boundary.           | "Bounded Context 'Commerce' owns Events, AccessPasses."    | Domain, Module, Namespace                  | DDD; prevents terminology collision.                  |

---

# VOLUME 2: ENTERPRISE ARCHITECTURE

## 2.1 Bounded Contexts & Ownership

### 1. IAM & Governance (Supporting)

| Property            | Value                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| **Owner**           | Identity Lead (2 FTE)                                                                             |
| **Responsibility**  | Tenant lifecycle, user identity, RBAC/ABAC, audit trail.                                          |
| **Aggregate Roots** | `Tenant`, `Organization`, `Workspace`                                                             |
| **Key Entities**    | `Department`, `Membership`, `Profile`, `LegalHold`                                                |
| **Commands**        | `ProvisionTenant`, `InviteUser`, `AssignRole`, `FreezeTenant`, `RevokeAccess`                     |
| **Domain Events**   | `TenantProvisioned`, `TenantFrozen`, `MembershipGranted`, `RoleAssigned`, `UserRegistered`        |
| **API Routes**      | `POST /api/v1/iam/tenants`, `GET /api/v1/iam/tenants/{id}`, `POST /api/v1/iam/memberships`        |
| **Database Tables** | `tenants`, `organizations`, `workspaces`, `departments`, `profiles`, `memberships`, `legal_holds` |
| **RLS Policy**      | Direct: `tenant_id = auth.jwt()->'tenant_id'` on all tables.                                      |
| **External Ports**  | **Driving:** REST API, MCP tools (read-only). **Driven:** Supabase Auth (OIDC), Cerbos (ABAC).    |

### 2. Spatial & Facility (Core — Competitive)

| Property            | Value                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Owner**           | Spatial Lead (3 FTE)                                                                                                    |
| **Responsibility**  | Facility registration, room inventory, collision-free booking (GiST constraint), occupancy tracking.                    |
| **Aggregate Roots** | `Facility`                                                                                                              |
| **Key Entities**    | `Room`, `Asset` (orphan), `Booking`                                                                                     |
| **Commands**        | `RegisterFacility`, `CreateRoom`, `SubmitBooking`, `ApproveBooking`, `CancelBooking`                                    |
| **Domain Events**   | `FacilityRegistered`, `BookingSubmitted`, `BookingApproved`, `BookingConflictDetected`, `BookingCanceled`               |
| **API Routes**      | `POST /api/v1/spatial/facilities`, `GET /api/v1/spatial/bookings/{id}/calendar`                                         |
| **Database Tables** | `facilities`, `rooms`, `assets`, `bookings`, `booking_histories`                                                        |
| **RLS Policy**      | Indirect: `facility.organization_id → organization.tenant_id`.                                                          |
| **State Machines**  | Booking (Pending→UnderReview→Approved→Active→Completed; OR Rejected/Canceled). Room (Available, Occupied, Maintenance). |
| **Invariants**      | **CRITICAL:** No two Bookings overlap on same Room. Enforced by GiST EXCLUSION.                                         |

### 3. Commerce & Event (Core — Competitive)

| Property            | Value                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| **Owner**           | Commerce Lead (4 FTE)                                                                               |
| **Responsibility**  | Event lifecycle, ticket issuance, inventory depletion tracking.                                     |
| **Aggregate Roots** | `Event`                                                                                             |
| **Key Entities**    | `TicketType`, `AccessPass`, `Campaign` (orphan)                                                     |
| **Commands**        | `CreateEvent`, `PublishEvent`, `IssueAccessPass`, `ScanAccessPass`, `RevokeAccessPass`              |
| **Domain Events**   | `EventPublished`, `AccessPassIssued`, `AccessPassScanned`, `AccessPassExpired`, `AccessPassRevoked` |
| **API Routes**      | `POST /api/v1/commerce/events`, `POST /api/v1/commerce/access-passes`                               |
| **Database Tables** | `events`, `pass_tiers`, `access_passes`, `products`, `campaigns`                                    |
| **RLS Policy**      | Indirect: `event.project_id → project.tenant_id`.                                                   |
| **Invariants**      | **CRITICAL:** Issued AccessPass count ≤ Capacity per TicketType.                                    |

### 4. Finance & Ledger (Core — Competitive) ⭐ **CRITICAL**

| Property            | Value                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Owner**           | Finance Lead (5 FTE)                                                                                                                                             |
| **Responsibility**  | Double-entry accounting, invoice lifecycle, payment processing, reconciliation, escrow management.                                                               |
| **Aggregate Roots** | `Ledger`, `Invoice`, `Payment`, `Escrow`                                                                                                                         |
| **Key Entities**    | `Account`, `JournalEntry`, `JournalLine`                                                                                                                         |
| **Commands**        | `PostJournalEntry`, `IssueInvoice`, `InitiatePayment`, `CapturePayment`, `SettlePayment`, `ReconcilePayment`, `RefundPayment`, `ReleaseEscrow`                   |
| **Domain Events**   | `InvoiceIssued`, `PaymentInitiated`, `PaymentCaptured`, `PaymentSettled`, `PaymentFailed`, `RefundInitiated`, `RefundSettled`, `JournalPosted`, `EscrowReleased` |
| **API Routes**      | `POST /api/v1/finance/invoices`, `POST /api/v1/finance/payments`, `PATCH /api/v1/finance/payments/{id}/capture`                                                  |
| **Database Tables** | `ledgers`, `ledger_accounts`, `journal_entries`, `journal_lines`, `invoices`, `payments`, `escrows`, `subscriptions`                                             |
| **RLS Policy**      | Direct: `ledger.tenant_id = auth.jwt()->'tenant_id'`. Indirect: `payment.invoice_id → invoice.tenant_id`.                                                        |
| **Invariants**      | **CRITICAL:** ∑ debit = ∑ credit for all JournalEntries. Enforced via `post_ledger_transaction()` stored procedure.                                              |
| **Immutability**    | JournalEntry, JournalLine immutable after Posted. Cancellation only via Reversal (new entry with inverted debits/credits).                                       |
| **Status**          | 🔴 **CRITICAL:** Payment state machine incomplete (Processing→Captured event missing). **Requires G004 (ARB).**                                                  |

### 5. Workflow & Operations (Supporting)

| Property            | Value                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| **Owner**           | Workflow Lead (2 FTE)                                                                          |
| **Responsibility**  | State machine orchestration, approval gates, task assignment.                                  |
| **Aggregate Roots** | `Workflow` (template), `WorkflowInstance` (execution)                                          |
| **Key Entities**    | `Task`, `Approval`, `StateTransitionLog`                                                       |
| **Commands**        | `PublishWorkflow`, `StartWorkflow`, `CompleteTask`, `ResolveApproval`                          |
| **Domain Events**   | `WorkflowPublished`, `WorkflowStarted`, `TaskCreated`, `ApprovalRequested`, `ApprovalResolved` |
| **API Routes**      | `POST /api/v1/workflow/workflows`, `POST /api/v1/workflow/instances`                           |
| **Database Tables** | `workflows`, `workflow_instances`, `tasks`, `approvals`                                        |
| **Invariants**      | **CRITICAL L-06:** Approval cannot auto-resolve for material changes. Human sign-off required. |

### 6. AI & Knowledge (Core — Competitive)

| Property            | Value                                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Owner**           | AI Lead (3 FTE)                                                                                                              |
| **Responsibility**  | RAG-indexed document repository, semantic search, LLM agent orchestration, safe AI augmentation (L-06).                      |
| **Aggregate Roots** | `KnowledgeBase`, `Prompt`, `AIAgent`                                                                                         |
| **Key Entities**    | `Document`, `Chunk`, `Embedding`                                                                                             |
| **Commands**        | `IndexDocument`, `UpdatePrompt`, `ConfigureAgent`                                                                            |
| **Domain Events**   | `KnowledgeIndexed`, `EmbeddingGenerated`, `AIRecommendationGenerated`                                                        |
| **API Routes**      | `POST /api/v1/ai/knowledge-bases/{id}/documents`, `GET /api/v1/ai/search`                                                    |
| **Database Tables** | `knowledge_bases`, `documents`, `chunks`, `embeddings` (pgvector), `prompts`, `ai_agents`                                    |
| **Invariants**      | **CRITICAL L-06:** AI agents CANNOT directly WRITE to material state. All WRITE proposals → Approval pending human sign-off. |
| **Status**          | ⚠️ **BETA:** MCP framework defined. L-06 enforcement incomplete. **Requires G011 + ADR-007 (ARB).**                          |

---

# VOLUME 3: ENGINEERING

## 3.1 Command Handler & Event Pattern (Template)

```typescript
// packages/core/application/commands/IssueAccessPassCommand.ts

import { Command, CommandHandler, DomainEvent } from '@sovereign/core';
import { AccessPass } from '../domain/commerce/aggregates';
import { AccessPassIssued } from '../domain/commerce/events';

// 1. COMMAND (imperative, input-validated)
export class IssueAccessPassCommand implements Command {
  constructor(
    public readonly ticketTypeId: string,
    public readonly customerId: string,
    public readonly idempotencyKey: string,
  ) {}
}

// 2. COMMAND HANDLER (orchestrates aggregate + emits event)
@CommandHandler(IssueAccessPassCommand)
export class IssueAccessPassHandler {
  constructor(
    private eventRepo,
    private accessPassRepo,
  ) {}

  async execute(cmd: IssueAccessPassCommand) {
    // Step 1: Load aggregate + invariant checks
    const ticketType = await this.eventRepo.findTicketTypeById(cmd.ticketTypeId);
    if (!ticketType) return Result.err(new Error('TicketType not found'));

    const event = await this.eventRepo.findById(ticketType.eventId);
    if (!event) return Result.err(new Error('Event not found'));
    if (event.status !== 'Live') return Result.err(new Error('Event not live'));
    if (ticketType.quantityIssued >= ticketType.capacity) {
      return Result.err(new Error('Capacity exceeded'));
    }

    // Step 2: Create aggregate (invariant enforced in constructor)
    const accessPass = AccessPass.issue({
      passTierId: cmd.ticketTypeId,
      customerId: cmd.customerId,
      idempotencyKey: cmd.idempotencyKey,
    });

    // Step 3: Persist + emit event
    const passId = await this.accessPassRepo.save(accessPass);
    const event_domain = new AccessPassIssued(
      passId,
      cmd.ticketTypeId,
      cmd.customerId,
      new Date(Date.now() + 15 * 60000), // 15-min expiry
    );

    // Step 4: Publish to Outbox (pg-boss) for async dispatch
    await this.eventRepo.publishDomainEvent(event_domain);

    return Result.ok(passId);
  }
}

// 3. DOMAIN AGGREGATE (encapsulates invariants)
export class AccessPass {
  id: string;
  status: 'pending' | 'issued' | 'checked_in' | 'consumed' | 'revoked' | 'expired';
  expiresAt: Date;

  static issue(dto): AccessPass {
    return new AccessPass({
      id: crypto.randomUUID(),
      passTierId: dto.passTierId,
      customerId: dto.customerId,
      status: 'pending',
      expiresAt: new Date(Date.now() + 15 * 60000),
    });
  }
}

// 4. DOMAIN EVENT (past-tense, immutable fact)
export class AccessPassIssued implements DomainEvent {
  eventType = 'AccessPassIssued';
  version = 1;

  constructor(
    public passId: string,
    public passTierId: string,
    public customerId: string,
    public expiresAt: Date,
  ) {}

  toJSON() {
    return {
      eventType: this.eventType,
      passId: this.passId,
      passTierId: this.passTierId,
      customerId: this.customerId,
      expiresAt: this.expiresAt.toISOString(),
    };
  }
}
```

---

# VOLUME 4: AI ARCHITECTURE

## 4.1 L-06 SQL Implementation (AI Safety Law)

```sql
-- STORED PROCEDURE: Intercept AI WRITE attempts
-- If actor is AI_AGENT, creates Approval instead of executing mutation directly

CREATE OR REPLACE FUNCTION public.check_ai_write_safety(
  p_actor_id UUID,
  p_actor_type VARCHAR,
  p_table_name VARCHAR,
  p_operation VARCHAR,
  p_record_json JSONB
) RETURNS TABLE (
  is_safe BOOLEAN,
  action VARCHAR,
  approval_id UUID
) LANGUAGE plpgsql AS $$
DECLARE
  v_approval_id UUID;
BEGIN
  -- STEP 1: Check if actor is AI agent
  IF p_actor_type != 'AI_AGENT' THEN
    RETURN QUERY SELECT true, 'ALLOW'::VARCHAR, NULL::UUID;
    RETURN;
  END IF;

  -- STEP 2: Check if table requires approval
  IF p_table_name IN ('payments', 'journal_entries', 'invoices', 'escrows', 'access_passes') THEN
    -- STEP 3: Create Approval instead of allowing direct mutation
    INSERT INTO public.approvals (id, status, context)
    VALUES (gen_random_uuid(), 'pending',
      jsonb_build_object('actor_id', p_actor_id, 'table_name', p_table_name,
                         'operation', p_operation, 'proposed_record', p_record_json))
    RETURNING id INTO v_approval_id;

    RETURN QUERY SELECT false, 'BLOCK_CREATE_APPROVAL'::VARCHAR, v_approval_id;
    RETURN;
  END IF;

  -- STEP 4: Non-material tables: allow
  RETURN QUERY SELECT true, 'ALLOW'::VARCHAR, NULL::UUID;
END;
$$;

-- TRIGGER: Enforce L-06 on material tables
CREATE OR REPLACE FUNCTION public.trigger_ai_write_safety()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_actor_id UUID := current_setting('app.actor_id')::UUID;
  v_actor_type VARCHAR := current_setting('app.actor_type');
  v_check RECORD;
BEGIN
  SELECT * INTO v_check FROM public.check_ai_write_safety(
    v_actor_id, v_actor_type, TG_TABLE_NAME, TG_OP, to_jsonb(NEW)
  );

  IF NOT (v_check).is_safe THEN
    RAISE EXCEPTION 'AI agents cannot directly mutate material state. Approval created: %', (v_check).approval_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to material tables
CREATE TRIGGER tr_ai_write_safety_payments
BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.trigger_ai_write_safety();

CREATE TRIGGER tr_ai_write_safety_journal_entries
BEFORE INSERT OR UPDATE ON public.journal_entries
FOR EACH ROW EXECUTE FUNCTION public.trigger_ai_write_safety();

CREATE TRIGGER tr_ai_write_safety_invoices
BEFORE INSERT OR UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.trigger_ai_write_safety();

-- ... repeat for escrows, access_passes, etc.
```

## 4.2 MCP Tool Registry (READ vs WRITE Categorization)

```json
{
  "mcp_tools": [
    {
      "id": "get_ledger_balance",
      "context": "finance",
      "description": "Retrieve Ledger account balances (READ-only)",
      "access_level": "READ",
      "requires_approval": false
    },
    {
      "id": "draft_journal_entry",
      "context": "finance",
      "description": "CREATE draft JournalEntry (WRITE; requires Approval per L-06)",
      "access_level": "WRITE->PENDING",
      "requires_approval": true,
      "approval_gate": "finance:approver"
    },
    {
      "id": "issue_access_pass",
      "context": "commerce",
      "description": "ISSUE AccessPass (WRITE; requires Approval if AI attempts)",
      "access_level": "WRITE->PENDING",
      "requires_approval": true,
      "approval_gate": "commerce:event_manager"
    }
  ]
}
```

---

# VOLUME 5: OPERATIONS

## 5.1 SRE Runbook Template

```markdown
# Runbook: {Title}

## Severity Level

- **SEV-1 (Critical):** Service down, data loss imminent. < 15 min MTTR.
- **SEV-2 (High):** Partial outage, feature broken. < 1 hour MTTR.
- **SEV-3 (Medium):** Non-critical functionality broken. < 4 hours MTTR.

## This Runbook

**Severity:** {SEV-1/2/3}  
**Owner:** {Team}  
**Detection Signal:** {Metric/Alert that triggers this}

## Diagnosis

1. Check alert in Datadog/Grafana. Record: timestamp, affected service, metric value.
2. Correlate logs: `trace_id` from alert → search in ELK.
3. Check service status page.
4. Confirm with customer (Slack #customer-incidents).

## Recovery (Escalating)

### Attempt 1: Graceful Mitigation (5 min)

- Increase timeouts
- Scale up replicas
- Drain connection pool

### Attempt 2: Controlled Restart (10 min)

- Restart service gracefully
- Monitor logs
- Verify health

### Attempt 3: Rollback (20 min)

- Identify last good deployment
- Rollback: `git revert {commit}` → `git push`
- Verify

### Attempt 4: Escalate (30+ min)

- Call on-call database engineer
- Prepare snapshot
- Consider: manual failover, PITR restore

## Testing

- **Weekly:** Simulate SEV-3 incident
- **Monthly:** Simulate SEV-2
- **Quarterly:** SEV-1 fire drill (full recovery)

## Post-Mortem

1. Record: timeline, root cause
2. Create Jira ticket with incident details
3. Schedule post-mortem: engineering + on-call + customer
4. Document: what went wrong, what we learned, ADR if needed
5. Close: implement fix, add monitoring, update runbook
```

---

# VOLUME 6: GOVERNANCE

## 6.1 RFC & ADR Process

### RFC Template

```markdown
# RFC-XXX: {Title}

**Author:** {Name}  
**Date Proposed:** {YYYY-MM-DD}  
**Status:** {DRAFT | REVIEW | APPROVED | IMPLEMENTED}  
**Decision Owner:** {CTO / Tech Lead}

## Problem Statement

What problem are we solving? Why now?

## Proposed Solution

Technical approach + affected systems + data model changes + API contract changes.

## Alternatives Considered

1. Alternative A (pros / cons)
2. Alternative B (pros / cons)
3. Decision: Why chosen?

## Impact Analysis

- **Effort:** {1 week | 4 weeks | 12 weeks}
- **Risk:** {Low | Medium | High} + mitigation
- **Compliance:** {HIPAA | SOX | GDPR impact?}
- **Breaking Changes:** {Yes → API version bump | No}

## Timeline

- Week 1: EAB review
- Week 2-3: Implementation
- Week 4: Testing + merge

## Success Criteria

- [ ] EAB approval
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Performance benchmarks met
```

### ADR Template

```markdown
# ADR-XXX: {Title}

**Status:** {APPROVED | SUPERSEDED BY ADR-YYY}  
**Decision Date:** {YYYY-MM-DD}  
**Decision Maker:** {EAB consensus}

## Context

What was the situation?

## Decision

We decided to {action}.

## Rationale

Why? Problem solved? Constraints?

## Consequences

- ✅ **Positive:** {benefit}
- ⚠️ **Negative:** {tradeoff}

## Alternatives Rejected

- **Alternative A:** {Why not?}
```

---

# VOLUME 7: BUSINESS

## 7.1 Capability Map & Status

| Capability                    | Context   | Team         | Status          | Roadmap                                | Risk                                                                            |
| ----------------------------- | --------- | ------------ | --------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| **Tenant Provisioning**       | IAM       | Identity (2) | ✅ **GA**       | Maintenance                            | None                                                                            |
| **Facility + Booking (GiST)** | Spatial   | Spatial (3)  | ✅ **GA**       | Stress testing                         | None                                                                            |
| **Event + AccessPass**        | Commerce  | Commerce (4) | ✅ **GA**       | Maintenance                            | None                                                                            |
| **Double-Entry Ledger**       | Finance   | Finance (5)  | ✅ **GA**       | Maintenance                            | None                                                                            |
| **Payment Processing**        | Finance   | Finance (5)  | 🔴 **CRITICAL** | **G004:** Complete state machine (R01) | **R01 + R14:** State machine incomplete; webhook ACL missing. Phase 1 priority. |
| **Workflow Orchestration**    | Workflow  | Workflow (2) | ✅ **GA**       | SLA tracking                           | **R11:** Transition guards undefined.                                           |
| **AI RAG + Agents**           | AI        | AI (3)       | ⚠️ **BETA**     | L-06 enforcement                       | **R04:** L-06 SQL not implemented (G011, ADR-007). Phase 1 priority.            |
| **Supplier Management**       | CRM       | CRM (2)      | 🔴 **DEFERRED** | **R10:** Operationalize or remove?     | Schema exists; no commands/events/workflows.                                    |
| **Campaign Management**       | Commerce  | Commerce (4) | 🔴 **DEFERRED** | **R10:** Operationalize or remove?     | Schema exists; no operations.                                                   |
| **Inventory Management**      | Inventory | Commerce (4) | 🔴 **DEFERRED** | Workflows undefined                    | Tables exist; no commands.                                                      |

---

# VOLUME 8: PRODUCT

## 8.1 Experience Principles (Stoic UX)

1. **Data-Dense, High Signal-to-Noise Ratio**
   - Dark theme (onyx #09090b) + high-contrast text (#fafafa).
   - Tables: TanStack Table with server-side pagination, sorting.

2. **Maximum Cognitive Efficiency**
   - Minimize decisions. Pre-select sensible defaults.
   - Progressive disclosure: Hide advanced options until needed.
   - Keyboard-first: All interactions via keyboard.

3. **Zero Decorative Motion**
   - No bounce, fade-in, rotate animations.
   - Motion only conveys state change.
   - Transitions: 200ms linear.
   - Respect `prefers-reduced-motion`.

4. **Explicit Error Communication**
   - Never generic "Error." Always specific.
   - Color: Red (#7f1d1d) for destructive actions only.
   - Validation: Inline error messages under form fields.

5. **Accessibility by Default (WCAG 2.2 AA)**
   - Color contrast: ≥4.5:1 normal, ≥3:1 large text.
   - Keyboard navigation: Tab, Shift+Tab, Enter, Escape, Arrow Keys.
   - ARIA labels on all controls. Screen reader tested.
   - Focus visible always.

6. **Trust Through Transparency**
   - Show state clearly: "Read-only," "Draft," "Locked."
   - Audit trail visible: "Last edited by admin@example.io on 2026-06-25 14:30 UTC."
   - Immutable records marked: "Cannot edit; finalized."

7. **Performance Budgets**
   - LCP < 2.5s, INP < 200ms, CLS < 0.1, TTI < 4s.
   - Monitor real-user metrics continuously.

---

# VOLUME 9: DEVELOPER HANDBOOK

## 9.1 Canonical Naming Standards

| Category             | Rule                                | Example ✅                       | Counterexample ❌            |
| -------------------- | ----------------------------------- | -------------------------------- | ---------------------------- |
| **Aggregates**       | PascalCase, singular                | `Event`, `AccessPass`            | `EventAggregate`, `events`   |
| **Commands**         | PascalCase, imperative, no suffix   | `IssueAccessPass`                | `IssueAccessPassCommand`     |
| **Events**           | PascalCase, past-tense, no suffix   | `AccessPassIssued`               | `IssueAccessPass`            |
| **Repositories**     | Interface: `I{Aggregate}Repository` | `IEventRepository`               | `EventDao`                   |
| **Database Tables**  | snake_case, plural                  | `events`, `access_passes`        | `tbl_events`, `Event`        |
| **Database Columns** | snake_case, singular                | `created_by`, `expires_at`       | `CreatedBy`, `created_by_id` |
| **Foreign Keys**     | `fk_{child}_{parent}`               | `fk_access_passes_pass_tiers`    | `FK_AP`                      |
| **Indexes**          | `idx_{table}_{columns}`             | `idx_bookings_room_id_status`    | `index_booking`              |
| **Enum Types**       | snake_case, no prefix               | `booking_state`, `payment_state` | `BookingState`               |
| **Enum Values**      | snake_case, lowercase               | `pending`, `under_review`        | `Pending`, `PENDING`         |
| **Zod Schemas**      | PascalCase, "Schema" suffix         | `EventSchema`                    | `event_schema`               |
| **API Routes**       | kebab-case, plural, RESTful         | `/api/v1/commerce/access-passes` | `/api/v1/getAccessPass`      |
| **Test Files**       | `{unit}.test.ts`, co-located        | `event.aggregate.test.ts`        | `test_event.ts`              |

## 9.2 Testing Architecture

| Test Type          | Target                                | Tool                      | Failure = Block  |
| ------------------ | ------------------------------------- | ------------------------- | ---------------- |
| **Unit**           | 80% of core/domain                    | Jest + fast-check         | ✅ Yes           |
| **Contract**       | OpenAPI conformance                   | Pact + Spectral           | ✅ Yes           |
| **E2E**            | Happy + failure paths                 | Playwright                | ✅ Yes           |
| **Property-Based** | Ledger invariant (∑ debit = ∑ credit) | fast-check                | ✅ Yes           |
| **Performance**    | p50 < 200ms, p95 < 800ms, p99 < 2s    | k6                        | ✅ Yes           |
| **Chaos**          | Pod failures, packet loss, latency    | Chaos Toolkit             | N (non-blocking) |
| **Security**       | OWASP Top 10, PCI DSS                 | SonarQube, Trivy          | ✅ Yes           |
| **Accessibility**  | WCAG 2.2 AA                           | axe DevTools + Playwright | ✅ Yes (in CI)   |

---

# VOLUME 10: REMEDIATION ROADMAP

## 10.1 Executive Summary

**Current Maturity:** 6.5/10 (strong DDD, missing operations/governance/compliance)

**Critical Gaps:**

1. **G003:** No OpenAPI 3.1 contracts (API-first blocked)
2. **G004:** Payment state machine incomplete (Processing→Captured event missing)
3. **L-06:** AI Safety Law not implementable (SQL enforcement missing)
4. **G020:** Webhook ACL underspecified (no signature validation, PII redaction)
5. **G001/G002:** No RFC/ADR process (architecture drifts at scale)

**Recommended Remediation:** Phase 0-1 (7 weeks) before scaling to 200+ engineers or selling to regulated customers.

---

## 10.2 Phased Roadmap

### PHASE 0: Immediate Corrections (1-2 Weeks)

| Task                           | Owner          | Deliverable                                                 | Effort | Block  |
| ------------------------------ | -------------- | ----------------------------------------------------------- | ------ | ------ |
| **RFC + ADR Templates**        | CTO            | `docs/RFC/TEMPLATE.md`, `docs/ADR/TEMPLATE.md` + 3 examples | 3d     | N      |
| **Error Taxonomy**             | API Lead       | Layer 1 Appendix B + HTTP status mapping                    | 2d     | ✅ Yes |
| **RLS Audit**                  | Security Lead  | Verify Layer 2 indirect traversals + test suite             | 5d     | ✅ Yes |
| **Database Schema Validation** | Data Architect | Confirm GAP-13 resolved; schema tests pass                  | 2d     | ✅ Yes |
| **CODEOWNERS**                 | CTO            | `.github/CODEOWNERS` enforcing RFC + ADR                    | 1d     | ✅ Yes |

### PHASE 1: Critical Gaps (6 Weeks)

| Task                        | Owner         | Effort | Block | Dependency               |
| --------------------------- | ------------- | ------ | ----- | ------------------------ |
| **G003: OpenAPI 3.1**       | API Lead      | 4w     | ✅    | Error Taxonomy (Phase 0) |
| **G004: Payment Domain**    | Finance Lead  | 3w     | ✅    | OpenAPI                  |
| **G011: MCP Tool Registry** | AI Lead       | 2w     | ✅    | Payment domain           |
| **ADR-007: L-06 SQL**       | AI Lead       | 3w     | ✅    | MCP registry             |
| **G020: Webhook ACL**       | Security Lead | 2w     | ✅    | Payment domain           |
| **G014: Idempotency Guide** | Finance Lead  | 2w     | ✅    | Payment domain           |
| **Implement L-06 SQL**      | AI Lead       | 2w     | ✅    | ADR-007                  |
| **API Client SDKs**         | API Lead      | 2w     | N     | OpenAPI                  |
| **Contract Testing**        | QA Lead       | 2w     | ✅    | OpenAPI                  |

**Phase 1 Exit Criteria:**

- [ ] OpenAPI 3.1 for all endpoints (breaking-change detection active).
- [ ] Payment domain complete (8 states, all commands/events, PSP error mapping).
- [ ] L-06 SQL enforcement deployed + tested.
- [ ] Webhook ACL implemented (signature validation, PII redaction).
- [ ] Contract tests 100% passing.

**Unlock:** Can scale to 200 engineers safely.

### PHASE 2: Operational Readiness (6 Weeks)

| Task                            | Owner           | Effort | Unlock                                 |
| ------------------------------- | --------------- | ------ | -------------------------------------- |
| **G006: SRE Runbook**           | SRE Lead        | 3w     | Incident response                      |
| **G007: Disaster Recovery**     | SRE Lead        | 3w     | PITR validation, quarterly fire drills |
| **G008: Compliance Procedures** | Compliance Lead | 4w     | HIPAA/SOX/GDPR checklist               |
| **G009: Testing Strategy**      | QA Lead         | 3w     | CI pipeline complete                   |
| **G013: Migration Runbook**     | Data Architect  | 2w     | Safe DB changes                        |
| **R06: Read Model SLA**         | Data Lead       | 1w     | Monitoring active                      |
| **R15: Doc Governance**         | CTO             | 1w     | Deprecation policy                     |

**Unlock:** Can sell to regulated enterprises (HIPAA/SOX/GDPR ready).

### PHASE 3: Knowledge Base Evolution (6 Weeks)

| Task                               | Owner             | Effort | Status                                            |
| ---------------------------------- | ----------------- | ------ | ------------------------------------------------- |
| **Restructure Docs (Volumes A-G)** | Tech Writers      | 4w     | Optional for 200-person teams; required for 500+. |
| **Living Catalogs**                | Tech Writers      | 3w     | Event, API, Prompt, MCP registries.               |
| **AI-Native Platform**             | Platform Engineer | 2w     | Structured markdown for Claude context.           |
| **Consistency Validation**         | Platform Engineer | 3w     | Layer 1 ↔ Layer 2 ↔ Layer 3 reconciliation.       |
| **Code Generation Tools**          | Platform Engineer | 2w     | OpenAPI → SDKs, Event schema → types.             |
| **R10 Decision**                   | Product Lead      | 1w     | Supplier/Campaign: operationalize or remove?      |

**Unlock:** Ready for 500+ engineers + open-source.

---

## 10.3 Priority Matrix

| Phase       | Duration    | Critical Blocks              | FTE               | Go/No-Go               | Shipping            |
| ----------- | ----------- | ---------------------------- | ----------------- | ---------------------- | ------------------- |
| **Phase 0** | 1-2w        | None                         | 2 FTE             | Governance pass        | Not shippable alone |
| **Phase 1** | 6w          | **OpenAPI + Payment + L-06** | 5 FTE             | **Can scale to 200**   | Production-ready    |
| **Phase 2** | 6w          | SRE + Compliance             | 4 FTE             | **Can sell regulated** | Enterprise-ready    |
| **Phase 3** | 6w          | None                         | 3 FTE             | Can scale 500+         | True enterprise     |
| **TOTAL**   | 27w (~6.5m) | **Phase 0-1 critical**       | **14-15 FTE avg** | **Phase 1 = safety**   | **Phase 3 = scale** |

---

# IDE FOLDER STRUCTURE

```
sovereign-os/
├── packages/core/domain/                 # Pure DDD (ZERO external deps except decimal.js, zod)
├── packages/database/                    # Drizzle ORM + migrations + RLS policies
├── packages/contracts/                   # Zod schemas + OpenAPI definitions
├── packages/ui/                          # shadcn/ui components
├── apps/web/                             # Next.js BFF
├── apps/workers/                         # Trigger.dev background jobs
├── docs/SEKB/                            # This knowledge base (volumes 0-10)
├── docs/RFC/                             # Request for Comment proposals
├── docs/ADR/                             # Architecture Decision Records
├── docs/RUNBOOKS/                        # Operational procedures
├── .cursorrules                          # AI IDE agent instructions (Volume 0)
├── .env.example
├── turbo.json
├── pnpm-workspace.yaml
└── README.md
```

---

**SEKB v1.0 — Production Ready — June 25, 2026**

**This is the authoritative, unified knowledge base for Sovereign OS architecture, implementation, operations, and governance.**

**Next Review:** Week 8 (Phase 1 completion, go/no-go decision).  
**Maintainer:** Enterprise Architecture Review Board (EAB).  
**Update Process:** RFC → ADR → SEKB (continuous, via git).
