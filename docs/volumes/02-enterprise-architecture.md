# Volume 02: Enterprise Architecture

## Moventios Enterprise Knowledge Base

**Bounded Contexts, Domain Model, and Inter-Service Relationships**

**Version:** 5.1-ENTERPRISE  
**Status:** RATIFIED  
**Date:** June 25, 2026  
**Authority:** Constitution Parts 7–10, EPXA Part 4

---

## Overview

> **Canonical Source:** Definisi Bounded Context, Aggregate, dan Domain Event ada di [Layer-1-Constitution-v5.0.2.md](../Layer-1-Constitution-v5.0.2.md) Parts 7–10.  
> Volume ini menambahkan **BC-specific invariants, repository interfaces, dan communication patterns** — bukan menduplikasi Layer-1 ontology. Bila ada konflik, Layer-1 menang.

Volume 02 defines the **strategic domain architecture** of Moventios. It partitions the platform into clearly owned Bounded Contexts, specifies aggregate boundaries, and defines how contexts communicate via Domain Events (never RPC).

This volume is the source of truth for:

- Bounded context ownership and responsibilities
- Aggregate roots and entity hierarchies
- Invariants that must never be violated
- Communication patterns between contexts
- Repository interfaces
- Port / Adapter boundaries

---

## Part 1: Bounded Context Map & Communication

### 1.1 Context Taxonomy

Moventios is partitioned into **6 core Bounded Contexts** plus **supporting domains**:

**Core Domains** (Competitive Advantage)

- Financial Ledger (Swiss-standard accounting)
- Spatial & Facility (Collision-free booking)
- Commerce & Event (End-to-end ticketing)
- AI & Knowledge (RAG, semantic search, LLM agents)

**Supporting Domains** (Business Enablers)

- Workflow & Operations (State machine orchestration)
- CRM (Customer and supplier management)
- Inventory & Fulfillment (Stock tracking)

**Generic Domains** (Commoditized)

- IAM & Governance (Supabase Auth, Cerbos ABAC)
- Notifications (Resend, Fonnte, Novu)
- Payment Integration (Xendit, Stripe, Midtrans)

### 1.2 Context Communication Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  [IAM & GOVERNANCE] ◄── Open Host Service (OHS) ───► [ALL CONTEXTS]    │
│                                                                      │
│  Provides: user_id, tenant_id, permissions                          │
│  Never duplicates: User profile data                                 │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ (Auth & Authn)
                              │
┌────────────┐        ┌──────────────┐        ┌──────────────┐
│  SPATIAL & │        │  COMMERCE &  │        │   WORKFLOW & │
│ FACILITY   │◄──────►│    EVENT     │        │ OPERATIONS   │
│            │        │              │        │              │
│ (Core)     │        │  (Core)      │◄──────►│ (Supporting) │
└────────────┘        └──────────────┘        └──────────────┘
        │                     │                       │
        │ Booking.approved    │ Event catalog         │ Approval gates
        │ (Domain Event)      │                       │
        ▼                     ▼                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  [LEDGER & FINANCE] (Core)                           │
│                                                                      │
│  ◄─ Conformist: Consumes external domain events (Booking, Payment)  │
│  ────► Emits: JournalPosted, InvoiceIssued, PaymentSettled          │
└──────────────────────────────────────────────────────────────────────┘
        ▲
        │
        │ PaymentCaptured (via ACL)
        │
┌──────────────────────────────────────────────────────────────────────┐
│      [PAYMENT GATEWAY ACL] ◄── Anti-Corruption Layer (ACL)           │
│                                                                      │
│  Wraps: Xendit, Stripe, Midtrans webhooks                           │
│  Emits: Standardized PaymentCaptured → Ledger                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│     [AI & KNOWLEDGE] (Core)                                          │
│                                                                      │
│  ◄─ Shared Kernel: Document, Embedding, Vector abstractions         │
│  ───► Consumes: Domain events from all contexts (for knowledge graph)│
│  ◄─ MCP Tool Registry: Exposes READ/WRITE→PENDING tools             │
└──────────────────────────────────────────────────────────────────────┘
        ▲
        │
        │ All domain events flow to Knowledge Graph
        │
        └──────────────────────────────────────────────────────────────
```

### 1.3 Context Coupling Types (DDD Patterns)

| Relationship              | Pattern                            | Example                                              | Strength                     |
| ------------------------- | ---------------------------------- | ---------------------------------------------------- | ---------------------------- |
| **Ownership**             | Aggregate Root in one context only | Event owns AccessPass; Ledger owns JournalEntry      | Strong (no shared ownership) |
| **Communication**         | Domain Events (async)              | BookingApproved → Finance subscribes                 | Loose (event-driven)         |
| **Shared Kernel**         | Intentional code reuse             | Value Objects (Money, TimeRange) in shared package   | Medium (negotiated)          |
| **Upstream/Downstream**   | Dependency                         | Commerce (downstream) depends on Workflow (upstream) | Medium (controlled)          |
| **Conformist**            | ACL consumption                    | Ledger (conformist) accepts PSP webhooks via ACL     | Loose (translated)           |
| **Anti-Corruption Layer** | Translation                        | PSP webhooks → standardized PaymentCaptured event    | Loose (isolated)             |

**Forbidden Patterns:**

- ❌ **RPC between contexts** — Use Domain Events instead
- ❌ **Direct SQL JOIN across contexts** — Fetch and compose in application
- ❌ **Shared database** — Each context has its own schema (logical or physical)
- ❌ **Circular dependencies** — Events flow one direction; never bidirectional

---

## Part 2: Core Bounded Contexts — Summary & References

> **Full deterministic specifications** (purpose, aggregates, entities, commands, domain events, invariants, RLS, enforcement) for all Bounded Contexts are in **[Layer-1-Constitution-v5.0.2.md](../Layer-1-Constitution-v5.0.2.md) Parts 7–10**.
> This volume only adds **high-level map, communication patterns, repository interfaces, and cross-context rules**. Detailed per-context content has been harmonized into Layer-1. Bila ada konflik, Layer-1 menang.

### 2.1 Core Bounded Contexts at a Glance (see Layer-1 for full details)

| Bounded Context       | Type       | Key Responsibility                      | Primary Aggregate(s)                       |
| --------------------- | ---------- | --------------------------------------- | ------------------------------------------ |
| IAM & Governance      | Supporting | Identity, tenant isolation, permissions | Tenant, Organization, Membership           |
| Spatial & Facility    | Core       | Collision-free spatio-temporal booking  | Facility, Room, Booking                    |
| Commerce & Event      | Core       | Ticketing, access, campaigns            | Event, TicketType, AccessPass              |
| Ledger & Finance      | Core       | Swiss-standard double-entry accounting  | Ledger, JournalEntry, Invoice, Payment     |
| Workflow & Operations | Supporting | State machine orchestration & approvals | Workflow, WorkflowInstance, Approval       |
| AI & Knowledge        | Core       | RAG, embeddings, agent tooling          | KnowledgeBase, Document, Embedding, Prompt |

**Communication rule (strict):** All cross-context interaction uses Domain Events via the `domain_events` outbox table. No RPC, no direct method calls between bounded context packages.

### 2.2 High-Level Communication (see diagram above + Layer-1 Part 8)

- Invariants
- Guard conditions
- Enterprise laws

---

## Context 1: IAM & Governance (Core) — Summary Only

**Full spec (aggregates, events, commands, invariants):** See Layer-1 Parts 3, 7, 9.

This context owns tenant isolation and authorization. All other contexts depend on it for `tenant_id` and permission claims. Detailed model is in Layer-1.

**Key practical note (this volume):** Every request must carry a resolvable `tenant_id`. No business context may bypass IAM for ownership checks.

- `IdentityReference` — (id, type)
- `Email`, `Phone`, `IPAddress`
- `AuditStamp` — (actor, timestamp, trace_id)

### Commands

- `ProvisionTenant` → emits `TenantProvisioned`
- `InviteUser` → emits `UserRegistered` + `MembershipGranted`
- `AssignRole` → emits `RoleAssigned`
- `FreezeTenant` → emits `TenantFrozen` (blocks all mutations)
- `ApplyLegalHold` → emits `LegalHoldApplied` (data retention)

### Queries

- `GetTenantProfile` — Summary of tenant, organization, stats
- `ListUserWorkspaces` — All workspaces accessible by user
- `GetMembership(userId, tenantId)` — Role and permissions
- `CheckPermission(userId, resource, action)` — ABAC evaluation via Cerbos

### Domain Events (Emitted)

- `TenantProvisioned` { tenantId, slug, plan }
- `TenantFrozen` { tenantId, reason }
- `UserRegistered` { userId, tenantId, email }
- `MembershipGranted` { userId, tenantId, role }
- `RoleAssigned` { userId, role, scope }
- `LegalHoldApplied` { tenantId, reason, appliedAt }

### Repositories (Interface)

```typescript
interface ITenantRepository {
  getById(tenantId: UUID): Promise<Tenant | null>;
  getBySlug(slug: string): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<void>;
  listAll(): Promise<Tenant[]>;
}

interface IMembershipRepository {
  getByUserAndTenant(userId: UUID, tenantId: UUID): Promise<Membership | null>;
  listByUser(userId: UUID): Promise<Membership[]>;
  listByTenant(tenantId: UUID): Promise<Membership[]>;
  save(membership: Membership): Promise<void>;
}
```

### Ports (External Dependencies)

**Driving:** REST API (`/api/v1/iam/*`), GraphQL
**Driven:**

- Supabase Auth adapter (provisions users, handles OIDC)
- Cerbos adapter (evaluates ABAC policies)
- Email adapter (invitation notifications)

### ACL Boundaries

- **Supabase Auth ACL:** External identity → Internal User profile
  - Supabase Auth provides JWT with claims
  - ACL maps `auth.users.id` → `Profile.user_id`
  - JWT claims (tenant_id, role) injected into Auth context for RLS
- **Cerbos ACL:** External policy engine → Internal permission cache
  - Query: `(user_id, tenant_id, action, resource)`
  - Response: `ALLOW | DENY | (reason)`
  - Cache result for 60 seconds (Valkey)

### RLS Policies (Implementation)

All tables in this context have tenant_isolation policy:

```sql
CREATE POLICY "tenant_isolation_tenants" ON tenants
  FOR ALL USING (id = auth.jwt()->>'tenant_id'::uuid);

CREATE POLICY "tenant_isolation_memberships" ON memberships
  FOR ALL USING (tenant_id = auth.jwt()->>'tenant_id'::uuid);
```

### Invariants (Must Never Violate)

- **L-05:** Every entity has `tenant_id` (directly or via FK chain)
- **Tenant Uniqueness:** Slug is globally unique
- **Frozen Tenant:** Cannot create/modify entities; reads allowed
- **Legal Hold:** All mutations blocked (deletes, updates, inserts)
- **Single Active Ledger:** Exactly one Ledger per Tenant with status='active'

### Enterprise Laws Enforcement

- **L-01 (No Cross-Context Join):** Enforced at query level; IAM never joins to other contexts
- **L-05 (No Entity Without Owner):** Every table has tenant_id; RLS on 100% coverage
- **L-09 (API Versioning):** /api/v1/iam/\* immutable; breaking changes in v2

---

## Context 2: Spatial & Facility (Core) — Summary Only

**Full spec:** See Layer-1 Parts 3.2, 7, 12 (State Machines).

Handles collision-free bookings via GiST. Key invariants are in Layer-1. This volume adds no new aggregates.

### Purpose & Responsibilities

- Physical asset (facility, room) registration and lifecycle
- Collision-free booking (spatio-temporal conflict detection)
- Occupancy analytics
- Asset tracking and assignment

### Aggregate Roots

- `Facility` — Macro property asset
- `Asset` — Trackable physical/digital unit

### Entities

- `Room` — Bookable sub-unit of facility
- `Booking` — Spatio-temporal claim
- `BookingHistory` — Audit trail of transitions
- `OperationalSchedule` — Facility availability rules (implicit)

### Value Objects

- `TimeRange` { start: TIMESTAMPTZ, end: TIMESTAMPTZ }
- `GeoCoordinate` { latitude, longitude }
- `Address` { street, city, state, postal_code, country_code }
- `CoordinatePolygon` — Facility boundary (for spatial analytics)

### Commands

- `RegisterFacility` → emits `FacilityRegistered`
- `CreateRoom` → emits `RoomCreated`
- `SubmitBooking` { roomId, timeRange, customerId? } → emits `BookingSubmitted`
- `ApproveBooking` → emits `BookingApproved` (triggers Ledger/Payment if applicable)
- `RejectBooking` { reason } → emits `BookingRejected`
- `CancelBooking` → emits `BookingCanceled` (triggers refund workflow)
- `CheckConflict` { roomId, timeRange } → returns conflict list (query, not event)

### Queries

- `GetAvailableRooms(facilityId, timeRange)` → List rooms with no overlapping bookings
- `GetBookingCalendar(roomId)` → Timeline view for facility scheduling UI
- `GetOccupancyMetrics(facilityId, dateRange)` → Utilization analytics

### Domain Events (Emitted)

- `FacilityRegistered` { facilityId, organizationId, name }
- `RoomCreated` { roomId, facilityId, capacity }
- `BookingSubmitted` { bookingId, roomId, timeRange, customerId }
- `BookingApproved` { bookingId, approvedBy, timestamp }
- `BookingRejected` { bookingId, reason }
- `BookingCanceled` { bookingId, reason } (may trigger refund)
- `BookingConflictDetected` { bookingId, conflictingBookingId } (notification → customer)

### Repositories (Interface)

```typescript
interface IFacilityRepository {
  getById(facilityId: UUID): Promise<Facility | null>;
  save(facility: Facility): Promise<void>;
}

interface IBookingRepository {
  getById(bookingId: UUID): Promise<Booking | null>;
  findByRoom(roomId: UUID): Promise<Booking[]>;
  findConflicts(roomId: UUID, timeRange: TimeRange): Promise<Booking[]>;
  save(booking: Booking): Promise<void>;
}
```

### Ports (External Dependencies)

**Driving:** REST API (`/api/v1/spatial/*`)
**Driven:**

- Workflow adapter (approval gates for high-value bookings)
- Notification adapter (conflict warnings)
- Analytics adapter (occupancy metrics export)

### ACL Boundaries

None external; this is a core domain. Internal boundaries:

- **Workflow ACL:** Booking approval logic delegates to Workflow context; waits for ApprovalResolved event

### RLS Policies

```sql
-- Direct tenant isolation
CREATE POLICY "tenant_isolation_facilities" ON facilities
  FOR ALL USING (
    organization_id IN (
      SELECT id FROM organizations WHERE tenant_id = auth.jwt()->>'tenant_id'::uuid
    )
  );

-- Transitive isolation via FK chain
CREATE POLICY "tenant_isolation_bookings" ON bookings
  FOR ALL USING (tenant_id = auth.jwt()->>'tenant_id'::uuid);
```

### Invariants (Must Never Violate)

- **L-01 (No Cross-Context Join):** Bookings never joined to Financial ledger in SQL
- **Spatio-Temporal Uniqueness:** No two bookings overlap in same room; enforced by GiST EXCLUSION CONSTRAINT:
  ```sql
  CONSTRAINT bookings_no_overlap EXCLUDE USING GIST (
    room_id WITH =,
    time_range WITH &&
  );
  ```
- **Idempotency (L-04):** Same idempotency_key prevents duplicate bookings
- **Time Range Validity:** end_time > start_time (never equal or reversed)
- **Capacity Enforcement:** Room.capacity drives analytics; bookings are atomic (no fractional)

### Enterprise Laws Enforcement

- **L-01:** Booking never joins to Invoice in SQL; composition happens in Finance BFF
- **L-04:** Idempotency key required on POST /api/v1/spatial/bookings
- **L-05:** All bookings have tenant_id; RLS enforced
- **L-08:** Any schema migration uses Expand/Contract pattern (no destructive DDL)

### Critical Behavior: Conflict Resolution

When `SubmitBooking` detects overlap:

1. Query: `SELECT * FROM bookings WHERE room_id = ? AND time_range && ?`
2. If conflict found:
   - Emit `BookingConflictDetected` event
   - Set booking.status = 'rejected' (or enter waitlist queue)
   - Return conflict details to client (suggest alternatives)
3. If no conflict:
   - INSERT booking with status='pending'
   - Emit `BookingSubmitted` event
   - Trigger approval workflow

---

## Context 3: Commerce & Event (Core) — Summary Only

**Full spec:** See Layer-1 Parts 3.2, 7, 10, 13.5.

Owns events and AccessPass issuance. All detailed commands/events are in Layer-1.

### Purpose & Responsibilities

- End-to-end event lifecycle (Draft → Published → Live → Finished)
- Ticketing (AccessPass) issuance, validation, and revocation
- Product and inventory management
- Campaign orchestration
- Revenue realization

### Aggregate Roots

- `Event` — Main event entity; lifecycle owner
- `Product` — Saleable good (ticket, merchandise, service)
- `Campaign` — Marketing initiative

### Entities

- `TicketType` (stored as `pass_tiers` table) — Tier configuration within Event
- `AccessPass` — Individual issued pass with QR
- `ProductVariant` — Specific SKU configuration
- `InventoryLot` — Quantity at specific warehouse

### Value Objects

- `Money` { amount, currency }
- `Percentage` { value, basis }
- `SecureQRCode` { payload, checksum, expiresAt }

### Commands

- `CreateEvent` → emits `EventCreated`
- `PublishEvent` → emits `EventPublished` (opens sales)
- `IssueAccessPass` { ticketTypeId, customerId, paymentIntentId? } → emits `AccessPassIssued` (L-06: may create Pending Approval)
- `RevokeAccessPass` { reason } → emits `AccessPassRevoked` (triggers refund)
- `CheckInAccessPass` { qrHash, facilityId } → emits `AccessPassScanned` (analytics)

### Queries

- `GetEventDetails(eventId)` → Full event + ticket types + inventory
- `GetEventSales(eventId)` → Revenue, units sold, remaining capacity
- `ValidateAccessPass(qrHash)` → Return pass details if valid + not expired/revoked

### Domain Events (Emitted)

- `EventPublished` { eventId, startTime, endTime }
- `AccessPassIssued` { passId, eventId, customerId, expiresAt }
- `AccessPassScanned` { passId, scannedAt, facilityId } (check-in)
- `AccessPassRevoked` { passId, reason }
- `AccessPassExpired` { passId } (workflow timer fired)
- `ProductStockDepleted` { productId, inventoryLotId }
- `TicketTypeCapacityReached` { eventId, ticketTypeId }

### Repositories (Interface)

```typescript
interface IEventRepository {
  getById(eventId: UUID): Promise<Event | null>;
  listByProject(projectId: UUID): Promise<Event[]>;
  save(event: Event): Promise<void>;
}

interface IAccessPassRepository {
  getById(passId: UUID): Promise<AccessPass | null>;
  getByQRHash(qrHash: string): Promise<AccessPass | null>;
  findByEvent(eventId: UUID): Promise<AccessPass[]>;
  save(accessPass: AccessPass): Promise<void>;
}
```

### Ports (External Dependencies)

**Driving:** REST API (`/api/v1/commerce/*`), BFF (web/mobile)
**Driven:**

- Workflow adapter (approval gates; timeout timer for AccessPass expiry)
- Ledger adapter (revenue realization via InvoiceIssued)
- Notification adapter (order confirmations, reminder emails)
- Analytics adapter (sales metrics, funnel analysis)

### ACL Boundaries

- **Ledger ACL:** Commerce emits commercial events (AccessPassIssued); Finance consumes and posts JournalEntry via stored procedure
- **Workflow ACL:** AccessPass expiry managed by Workflow timer (15-min hold if payment pending)

### RLS Policies

```sql
CREATE POLICY "tenant_isolation_events" ON events
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE tenant_id = auth.jwt()->>'tenant_id'::uuid
    )
  );

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

### Invariants (Must Never Violate)

- **Capacity Constraint:** `COUNT(accessPasses WHERE status='issued') ≤ ticketType.capacity`
- **No Double-Issuance:** Same idempotency_key returns cached AccessPass (L-04)
- **Expiry Enforcement:** Workflow timer fires at `accessPass.expiresAt`; status transitions to 'expired'
- **Published-Only Issuance:** Can only issue passes if event.status = 'published' or 'live'
- **Revenue Recognition:** AccessPass issued does NOT post revenue until Payment captured (L-02: immutable history)

### Enterprise Laws Enforcement

- **L-04:** `idempotency_key` mandatory on POST /api/v1/commerce/access-passes
- **L-06:** Any WRITE command (IssueAccessPass, RevokeAccessPass) may route to Approval if actor is AIAgent
- **L-01:** Never join access_passes directly to journal_entries; use Finance context's Invoice aggregate

---

## Context 4: Finance & Ledger (Core) — Summary Only

**Full spec:** See Layer-1 Parts 3.3, 7, 9 (L-02, L-07), 10, 12.6, 13.5.

The only context that mutates financial state. Strict append-only via stored procedures. Full model in Layer-1.

### Purpose & Responsibilities

- Swiss-standard double-entry accounting
- Immutable financial history (Append-Only)
- Invoice lifecycle and payment settlement
- Escrow management
- Subscription billing
- Financial reporting

### Aggregate Roots

- `Ledger` — One per tenant; master accounting entity
- `Invoice` — Billing document lifecycle
- `Payment` — Fund settlement

### Entities

- `Account` — Chart of Accounts node (hierarchical)
- `JournalEntry` — Atomic accounting transaction
- `JournalLine` — Debit or credit posting
- `Escrow` — Funds held in suspension
- `Subscription` — Recurring billing contract

### Value Objects

- `Money` { amount: NUMERIC(19,4), currency: VARCHAR(3) }
- `LedgerBalance` { debit: Money, credit: Money, net: Money }
- `TaxRate` { code, percentage, jurisdiction }

### Commands

- `CreateAccount` { code, name, classification, normalBalance } → emits `AccountCreated`
- `DraftJournalEntry` { referenceType, referenceId, narration, lines[] } → status='draft', not yet posted
- `PostJournalEntry` (via stored procedure post_ledger_transaction) → validates balance, emits `JournalPosted`
- `VoidJournalEntry` → creates new reversal entry (never destructive), emits `JournalVoided`
- `IssueInvoice` → emits `InvoiceIssued`
- `CapturePayment` (via webhook ACL) → emits `PaymentCaptured`
- `SettlePayment` → emits `PaymentSettled`
- `ReleaseEscrow` (triggered by approval) → emits `EscrowReleased`

### Queries

- `GetLedgerSummary(tenantId)` → Account balances (from mv_ledger_summary_view, cached)
- `GetAccountBalance(accountId)` → Current debit/credit balance
- `GetJournalEntry(journalEntryId)` → Full entry + all lines
- `GetInvoiceHistory(customerId)` → All invoices with payment status
- `GetPaymentStatus(paymentId)` → Current state + gateway reference

### Domain Events (Emitted)

- `InvoiceIssued` { invoiceId, customerId, amount, dueDate }
- `PaymentInitiated` { paymentId, invoiceId, gateway, amount }
- `PaymentCaptured` { paymentId, gateway, gatewayRef, capturedAmount }
- `PaymentFailed` { paymentId, reason }
- `PaymentSettled` { paymentId, settledAt }
- `PaymentRefunded` { paymentId, refundAmount, reason }
- `JournalPosted` { journalEntryId, ledgerId, totalDebit, totalCredit }
- `JournalVoided` { journalEntryId, reversalEntryId }
- `EscrowReleased` { escrowId, releasedTo, amount }

### Repositories (Interface)

```typescript
interface ILedgerRepository {
  getByTenant(tenantId: UUID): Promise<Ledger>;
  save(ledger: Ledger): Promise<void>;
}

interface IJournalRepository {
  getById(journalEntryId: UUID): Promise<JournalEntry | null>;
  findByStatus(ledgerId: UUID, status: JournalState): Promise<JournalEntry[]>;
  save(journalEntry: JournalEntry): Promise<void>;
}

interface IInvoiceRepository {
  getById(invoiceId: UUID): Promise<Invoice | null>;
  findByCustomer(customerId: UUID): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<void>;
}

interface IPaymentRepository {
  getById(paymentId: UUID): Promise<Payment | null>;
  findByInvoice(invoiceId: UUID): Promise<Payment[]>;
  save(payment: Payment): Promise<void>;
}
```

### Ports (External Dependencies)

**Driving:** REST API (`/api/v1/finance/*`), read-only for most roles; mutations via Command only
**Driven:**

- Payment Gateway ACLs (Xendit, Stripe, Midtrans) — webhooks → PaymentCaptured
- Workflow adapter (approval gates for high-value journals: > $10,000)
- Notification adapter (invoice delivery, payment receipts)
- Analytics adapter (P&L, balance sheet, cash flow reporting)

### ACL Boundaries

- **Xendit ACL:** External webhook (raw_payment_callback) → normalized PaymentCaptured event
- **Stripe ACL:** External webhook (charge.succeeded) → PaymentCaptured
- **Midtrans ACL:** External webhook (transaction_status) → PaymentCaptured

**ACL Implementation:**

```typescript
// Adapter validates webhook signature, translates schema
class XenditPaymentAdapter implements IPaymentAdapter {
  async handleWebhook(raw: XenditWebhookPayload): Promise<void> {
    if (!verifySignature(raw)) throw new Error('Invalid signature');

    const normalized: PaymentCaptured = {
      paymentId: raw.external_id,
      gatewayRef: raw.id,
      capturedAmount: Money(raw.amount, 'IDR'),
      timestamp: new Date(raw.created),
    };

    // Emit normalized event; Ledger context subscribes
    await this.eventBus.publish(normalized);
  }
}
```

### RLS Policies

```sql
CREATE POLICY "tenant_isolation_journal_entries" ON journal_entries
  FOR ALL USING (
    ledger_id IN (
      SELECT id FROM ledgers WHERE tenant_id = auth.jwt()->>'tenant_id'::uuid
    )
  );

CREATE POLICY "tenant_isolation_invoices" ON invoices
  FOR ALL USING (tenant_id = auth.jwt()->>'tenant_id'::uuid);

CREATE POLICY "tenant_isolation_payments" ON payments
  FOR ALL USING (tenant_id = auth.jwt()->>'tenant_id'::uuid);
```

### Immutable Enforcement (L-02)

**Trigger on journal_entries:**

```sql
CREATE OR REPLACE FUNCTION block_journal_entry_mutations()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('posted', 'voided') THEN
    RAISE EXCEPTION 'Cannot modify posted or voided journal entry';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_entry_immutable
BEFORE UPDATE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION block_journal_entry_mutations();
```

**Trigger on journal_lines:**

```sql
-- No UPDATE/DELETE on journal_lines if parent.status != 'draft'
CREATE TRIGGER journal_lines_immutable
BEFORE UPDATE OR DELETE ON journal_lines
FOR EACH ROW
WHEN (
  (SELECT status FROM journal_entries WHERE id = NEW.journal_entry_id) != 'draft'
)
EXECUTE FUNCTION raise_immutable_error();
```

### Invariants (Must Never Violate)

- **L-02 (Immutable):** Posted entries cannot be mutated; voiding creates reversal only
- **Double-Entry Balance:** ∑Debit = ∑Credit; validated in `post_ledger_transaction()` stored procedure
- **Precision:** All Money values use NUMERIC(19,4); never float
- **No Negative Balances (per account rules):** Some accounts (liability) allow negative; validated per account classification
- **Orphan-Free:** Every JournalEntry has ledger_id; every Invoice has tenant_id
- **Temporal Ordering:** Posted timestamp ≥ transaction date; never backdated
- **Idempotency:** Same idempotency_key returns cached Invoice/Payment (L-04)

### Enterprise Laws Enforcement

- **L-02:** Immutable triggers on journal_entries and journal_lines
- **L-03:** Soft delete via deleted_at (for audit trail); never physical DELETE
- **L-04:** Idempotency key on invoices, payments (uniqueness constraint)
- **L-05:** All entities have tenant_id; RLS on 100%
- **L-07:** Command Handler mandate: all posting via `post_ledger_transaction()` stored procedure

### Stored Procedure: post_ledger_transaction() [L-07]

```sql
CREATE OR REPLACE FUNCTION post_ledger_transaction(
  p_journal_entry_id UUID,
  p_actor_id UUID,
  p_trace_id UUID
)
RETURNS void AS $$
DECLARE
  v_total_debit NUMERIC := 0;
  v_total_credit NUMERIC := 0;
  v_entry_status journal_state;
BEGIN
  -- 1. Lock the entry (prevent race condition)
  SELECT status INTO v_entry_status
  FROM journal_entries
  WHERE id = p_journal_entry_id
  FOR UPDATE;

  -- 2. Validate: must be draft
  IF v_entry_status != 'draft' THEN
    RAISE EXCEPTION 'Entry must be in draft status; current: %', v_entry_status;
  END IF;

  -- 3. Validate: debit = credit
  SELECT
    COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0)
  INTO v_total_debit, v_total_credit
  FROM journal_lines
  WHERE journal_entry_id = p_journal_entry_id;

  IF v_total_debit != v_total_credit THEN
    RAISE EXCEPTION 'Debit (%) != Credit (%); transaction rejected',
      v_total_debit, v_total_credit;
  END IF;

  -- 4. Update status
  UPDATE journal_entries
  SET
    status = 'posted'::journal_state,
    posted_at = NOW(),
    updated_at = NOW(),
    updated_by = p_actor_id
  WHERE id = p_journal_entry_id;

  -- 5. Emit event
  INSERT INTO domain_events (event_type, event_data, trace_id, created_at)
  VALUES (
    'JournalPosted',
    jsonb_build_object(
      'journalEntryId', p_journal_entry_id,
      'totalDebit', v_total_debit,
      'totalCredit', v_total_credit,
      'postedAt', NOW()
    ),
    p_trace_id,
    NOW()
  );

  COMMIT;
END;
$$ LANGUAGE plpgsql STRICT;
```

---

## Context 5: Workflow & Operations (Supporting) — Summary Only

**Full spec:** See Layer-1 Parts 7, 12.5, 13, 16 (for L-06 approvals).

Manages state machines and human approvals (critical for AI safety). Details in Layer-1.

### Purpose & Responsibilities

- State machine orchestration and definition
- Human-in-the-loop approval gates (non-bypassable by AI)
- Task assignment and tracking
- Long-running saga coordination
- Idempotent durable execution (via Trigger.dev or Temporal)

### Aggregate Roots

- `Workflow` — Immutable state machine template
- `WorkflowInstance` — Single execution of a workflow for an entity

### Entities

- `Task` — Unit of work assignable to user or AI
- `Approval` — Verification gate requiring human explicit action
- `WorkflowState`, `WorkflowTransition` — Template structure
- `StateTransitionLog` — Audit trail of instance transitions

### Value Objects

- `State` { name, isTerminal }
- `Transition` { fromState, toState, trigger, guardCondition }

### Commands

- `CreateWorkflow` { name, stateDefinition, transitions } → emits `WorkflowCreated`
- `PublishWorkflow` → emits `WorkflowPublished` (immutable from now on)
- `StartWorkflowInstance` { workflowId, entityType, entityId, context } → emits `WorkflowStarted`
- `TransitionInstance` { instanceId, trigger, context? } → validates guards, emits `InstanceTransitioned` or `ApprovalRequested`
- `ResolveApproval` { approvalId, resolution } → emits `ApprovalResolved`, triggers instance continuation
- `CompleteTask` { taskId, result } → emits `TaskCompleted`

### Queries

- `GetWorkflowStatus(instanceId)` → Current state + pending approvals
- `ListPendingApprovals(userId)` → All approvals assigned to user
- `GetTaskList(userId)` → All tasks assigned (status != done)
- `GetInstanceHistory(instanceId)` → Audit trail of all transitions

### Domain Events (Emitted)

- `WorkflowStarted` { instanceId, workflowId, entityId }
- `InstanceTransitioned` { instanceId, fromState, toState }
- `ApprovalRequested` { approvalId, instanceId, context }
- `ApprovalResolved` { approvalId, resolution, resolvedBy, timestamp }
- `TaskAssigned` { taskId, assignedTo }
- `TaskCompleted` { taskId, result }

### Repositories (Interface)

```typescript
interface IWorkflowRepository {
  getById(workflowId: UUID): Promise<Workflow | null>;
  findPublished(): Promise<Workflow[]>;
  save(workflow: Workflow): Promise<void>;
}

interface IWorkflowInstanceRepository {
  getById(instanceId: UUID): Promise<WorkflowInstance | null>;
  findByEntity(entityType: string, entityId: UUID): Promise<WorkflowInstance[]>;
  save(instance: WorkflowInstance): Promise<void>;
}

interface IApprovalRepository {
  getById(approvalId: UUID): Promise<Approval | null>;
  findByUser(userId: UUID): Promise<Approval[]>;
  findPending(instanceId: UUID): Promise<Approval[]>;
  save(approval: Approval): Promise<void>;
}
```

### Ports (External Dependencies)

**Driving:** REST API (`/api/v1/workflows/*`), WebSocket for real-time updates
**Driven:**

- Trigger.dev adapter (durable timers, long-running sagas)
- Notification adapter (approval requests, task assignments)
- Domain context adapters (trigger external commands)

### ACL Boundaries

- **Trigger.dev ACL:** External workflow definitions → normalized WorkflowInstance execution
- **Approval escalation:** High-value approvals (> $50K) require escalation to CFO

### RLS Policies

```sql
CREATE POLICY "tenant_isolation_workflow_instances" ON workflow_instances
  FOR ALL USING (
    entity_id IN (
      SELECT id FROM (
        -- Depends on entity_type; example for bookings:
        SELECT id FROM bookings WHERE tenant_id = auth.jwt()->>'tenant_id'::uuid
      ) AS allowed_entities
    )
  );
```

### Invariants (Must Never Violate)

- **Published Immutability:** Workflow template cannot be edited after publish
- **Guard Validation:** Transition only proceeds if guard condition evaluates true
- **Approval Non-Bypass:** AI agents cannot auto-resolve Approval; requires explicit human action (L-06)
- **Singleton Approval:** Only one pending Approval per transition (no duplicate gates)

### Enterprise Laws Enforcement

- **L-06 (AI Safety Law):** Approval.status requires human_id to be set; AI cannot transition to 'approved' state
- **L-07 (Command Handler):** All state transitions via WorkflowInstance.transitionTo() method (not direct SQL updates)

---

## Context 6: AI & Knowledge (Core) — Summary Only

**Full spec:** See Layer-1 Part 7, 16; full implementation in volumes/04-ai-architecture.md and ADR-002.

Owns RAG, prompts, and MCP tool registry. Tenant-isolated cognition. L-06 enforcement here + Layer-1.

### Purpose & Responsibilities

- Document ingestion and semantic indexing
- Retrieval-augmented generation (RAG) pipeline
- LLM agent orchestration via MCP (Model Context Protocol)
- Prompt versioning and governance
- Knowledge graph construction
- Semantic search and anomaly detection

### Aggregate Roots

- `KnowledgeBase` — Tenant-scoped document repository
- `AIAgent` — LLM agent with MCP tool registry

### Entities

- `Document` — Content artifact (PDF, Markdown, text)
- `DocumentVersion` — Versioned snapshot
- `Chunk` — Text fragment (512 tokens, overlap)
- `Embedding` — Vector representation (1536-dim)
- `Prompt` — LLM instruction template
- `MCPTool` — Tool definition in MCP registry

### Value Objects

- `Chunk` { text, tokenCount, index }
- `Vector` { data: VECTOR(1536), model, timestamp }
- `PromptTemplate` { text, inputSchema, outputFormat, guardrails }

### Commands

- `IngestDocument` { title, sourceType, content } → triggers chunking + embedding
- `IndexDocument` { documentVersionId } → emits `KnowledgeIndexed`
- `GenerateEmbedding` { chunkId, model } → emits `EmbeddingGenerated`
- `UpdatePrompt` { promptId, template, inputSchema, guardrails } → emits `PromptUpdated` (version bump)
- `ConfigureAgent` { agentId, model, tools, budget } → emits `AgentConfigured`
- `ExecuteAgent` { agentId, query, context } → emits `AgentExecutionStarted` + `AIRecommendationGenerated`

### Queries

- `SearchKnowledge(query, topK)` — Hybrid search (Typesense + pgvector HNSW)
- `GetRAGContext(query)` — Retrieve and rerank context chunks
- `GetPromptHistory(promptId)` — All versions of a prompt
- `GetAgentCapabilities(agentId)` → MCP tool list

### Domain Events (Emitted)

- `KnowledgeIndexed` { documentId, chunkCount, embeddingModel }
- `EmbeddingGenerated` { embeddingId, chunkId, model, timestamp }
- `PromptUpdated` { promptId, version, updatedAt }
- `AgentConfigured` { agentId, model, toolCount }
- `AIRecommendationGenerated` { agentId, recommendation, confidence, timestamp }
- `AnomalyDetected` { entityType, entityId, anomalyType, confidence }

### Repositories (Interface)

```typescript
interface IKnowledgeBaseRepository {
  getByTenant(tenantId: UUID): Promise<KnowledgeBase>;
  save(kb: KnowledgeBase): Promise<void>;
}

interface IDocumentRepository {
  getById(documentId: UUID): Promise<Document | null>;
  findByKB(kbId: UUID): Promise<Document[]>;
  save(doc: Document): Promise<void>;
}

interface IEmbeddingRepository {
  getById(embeddingId: UUID): Promise<Embedding | null>;
  findByChunk(chunkId: UUID): Promise<Embedding | null>;
  search(vector: Vector, topK: number): Promise<Embedding[]>; // HNSW cosine
  save(embedding: Embedding): Promise<void>;
}

interface IPromptRepository {
  getById(promptId: UUID): Promise<Prompt | null>;
  findActive(tenantId: UUID): Promise<Prompt[]>;
  save(prompt: Prompt): Promise<void>;
}

interface IAIAgentRepository {
  getById(agentId: UUID): Promise<AIAgent | null>;
  findByTenant(tenantId: UUID): Promise<AIAgent[]>;
  save(agent: AIAgent): Promise<void>;
}
```

### Ports (External Dependencies)

**Driving:** MCP tools, REST API (`/api/v1/ai/*`)
**Driven:**

- OpenRouter adapter (unified LLM routing, fallbacks)
- pgvector adapter (HNSW similarity search)
- Typesense adapter (lexical search)
- OpenTelemetry adapter (span tracing for agent execution)

### ACL Boundaries

- **OpenRouter ACL:** Unified interface abstracts Claude, GPT-4o, DeepSeek, etc.
  - Supports fallback logic (if primary model fails, retry with secondary)
  - Cost attribution per tenant
  - Token counting and budget enforcement
- **MCP Tool Exposure ACL:**
  - Every tool has `access_type: enum(READ, WRITE→PENDING)`
  - WRITE tools never execute directly; create Approval in Workflow context
  - Example: `issue_refund` tool → creates Approval, not direct ledger mutation

### RLS Policies

```sql
CREATE POLICY "tenant_isolation_knowledge_bases" ON knowledge_bases
  FOR ALL USING (tenant_id = auth.jwt()->>'tenant_id'::uuid);

CREATE POLICY "tenant_isolation_embeddings" ON embeddings
  FOR ALL USING (
    chunk_id IN (
      SELECT id FROM chunks WHERE document_id IN (
        SELECT id FROM documents WHERE knowledge_base_id IN (
          SELECT id FROM knowledge_bases WHERE tenant_id = auth.jwt()->>'tenant_id'::uuid
        )
      )
    )
  );
```

### Invariants (Must Never Violate)

- **L-06 (AI Safety Law):** Any MCP tool with `access_type='WRITE'` creates Approval; blocks direct execution
- **Immutable Documents:** DocumentVersion is append-only; never update existing version
- **Embedding Consistency:** All embeddings in a KnowledgeBase use same model version
- **Prompt Versioning:** Version increments on any template change; no in-place updates

### MCP Tool Registry Example

```jsonb
{
  "tools": [
    {
      "name": "get_ledger_balance",
      "access_type": "READ",
      "description": "Get current balance of an account",
      "parameters": {
        "type": "object",
        "properties": {
          "account_id": { "type": "string" }
        }
      }
    },
    {
      "name": "issue_refund",
      "access_type": "WRITE→PENDING",
      "description": "Issue refund for a payment (creates approval)",
      "parameters": {
        "type": "object",
        "properties": {
          "payment_id": { "type": "string" },
          "amount": { "type": "number" },
          "reason": { "type": "string" }
        }
      }
    }
  ]
}
```

---

## Part 3: Repository Interfaces (Shared Contracts)

Repositories follow standard ports (see Layer-3 for full hexagonal contract).

Core contract (in packages/core):

- `getById`, `save`, `find*` (soft-delete aware)
- Event-sourced variants for audit-heavy aggregates.

Exact interfaces are defined in the monorepo `packages/core` and should not be duplicated here. This volume only requires that every BC exposes its repository interfaces for DI.

---

## Part 4: Domain Events Data Flow

All cross-context communication uses the **Outbox Pattern** (see Layer-3 and Layer-2 for implementation).

- Command Handler → Aggregate emits events in-memory
- Repository.save performs transactional insert to main table + `domain_events`
- pg-boss polls and publishes
- Subscribers in other BCs react (never direct calls)

Full example flows and diagrams are in Layer-1 Part 13 and Layer-3 Part on Event-Driven Architecture. This volume only defines the high-level rule: **events only, no RPC**.

---

## Part 5: Invariant Validation Checklist

Every aggregate must document and enforce its invariants. Violations result in **rejected commands**, never silent failures.

| Invariant                     | Enforcement                                          | Example                                                 |
| ----------------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| **Aggregate Ownership**       | Repository save() enforces no cross-context mutation | Only Event context can mutate Event aggregate           |
| **Value Object Immutability** | Value Objects are final/frozen classes               | Money instance never modified post-creation             |
| **Entity Uniqueness**         | Database unique constraints + repository query       | User email unique globally; Tenant slug unique globally |
| **Temporal Ordering**         | Timestamp comparison in command handler              | Booking.end_time > Booking.start_time                   |
| **State Machine Transitions** | Guard conditions evaluated before transition         | Can only transition to 'refunded' from 'captured' state |
| **Consistency Boundaries**    | No mutation across aggregate roots                   | Command touches one root; emits events for others       |

---

**Volume 02: Enterprise Architecture | SEKB v5.1-ENTERPRISE | Ratified June 25, 2026**
