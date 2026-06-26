# Volume 01: Foundations
## Sovereign OS Enterprise Knowledge Base

**Canonical Ontology, Terminology, and Entity Harmonization**

**Version:** 5.1-ENTERPRISE  
**Status:** RATIFIED  
**Date:** June 25, 2026  
**Authority:** Constitution Part 3–4, Database SSOT Section 2, EPXA Part 2

---

## Overview

> **Canonical Source:** Definisi kanonik ada di [Layer-1-Constitution-v5.0.2.md](../Layer-1-Constitution-v5.0.2.md) Parts 3–4 dan [Layer-2-Database-SSOT-v5.0.2.md](../Layer-2-Database-SSOT-v5.0.2.md) Sections 2–4.  
> Volume ini menyediakan **reconciliation matrix dan cross-layer mapping** — bukan menduplikasi Layer content. Bila ada konflik, Layer-1 menang.

Volume 01 is the **single source of truth for terminology, entity definitions, and ubiquitous language** across all of Sovereign OS. It harmonizes terminology across three layers:

- **Layer 1 (Constitution):** Canonical ontology and principles
- **Layer 2 (Database SSOT):** Physical schema tables and enums
- **Layer 3 (EPXA):** Engineering implementation names and references

Every team — architecture, engineering, product, compliance, and AI agents — MUST use only the terms and definitions in this volume.

---

## Part 1: Canonical Naming Standards

> **Full canonical definitions and tables are in [Layer-1-Constitution-v5.0.2.md](../Layer-1-Constitution-v5.0.2.md) Appendix A / Part 4 (Ubiquitous Language) and Part 3 (Ontology).**  
> This volume only records **additional practical rules and reconciliation** that arose during harmonization. Bila ada konflik, Layer-1 menang.

### Quick Reference — Core Conventions (see Layer-1 for complete authoritative list)
- **Tables**: snake_case, plural (`journal_entries`, `access_passes`)
- **Columns**: snake_case, singular (`tenant_id`, `created_at`)
- **Aggregates / Entities**: PascalCase singular (`AccessPass`, `Booking`, `JournalEntry`)
- **Commands**: imperative PascalCase (`IssueAccessPass`)
- **Domain Events**: past-tense PascalCase (`AccessPassIssued`)
- **Forbidden terms**: See "Rule 3" below + Layer-1 Part 4 for exhaustive list.

### Rule 3: Forbidden / Deprecated Terms (Harmonized)

| ❌ Forbidden | ✅ Use Instead | Reason |
|-------------|---------------|--------|
| `Tiket`, `Wristband`, `Pass`, `EntryCode`, `QRTicket` | `AccessPass` | One canonical term; reduces drift |
| `Mutasi`, `Transaction`, `LedgerLog` | `JournalEntry` | Avoids database/payment context confusion |
| `Folder`, `Group`, `Space`, `Team`, `Channel` | `Workspace` | Single term for collaboration boundary |
| `Reservation`, `Rent`, `Order`, `Appointment` | `Booking` | Specific to spatio-temporal claims |
| `Vendor`, `Partner`, `Contractor` | `Supplier` | B2B-specific procurement term |
| `Role`, `Account Link`, `Access` | `Membership` | Explicit User ↔ Tenant relationship |
| `Process`, `Job`, `Run` | `WorkflowInstance` | Template vs. execution clarity |
| `Venue`, `Location`, `Place`, `Site` | `Facility` | Aggregate root clarity |

### Rule 4: Time & Date Handling

All temporal values **MUST** use:
- **Type:** `TIMESTAMPTZ` (PostgreSQL with UTC timezone)
- **Format:** ISO 8601 (e.g., `2026-06-25T14:30:00Z`)
- **Serialization:** JSON as ISO string, never epoch seconds (prevents timezone ambiguity)
- **Queries:** Always compare in UTC; never assume local time.

See Layer-1 for any additional temporal value objects.
-- CORRECT
SELECT * FROM bookings WHERE created_at > '2026-06-25T00:00:00Z';

-- INCORRECT (timezone-ambiguous)
SELECT * FROM bookings WHERE created_at > '2026-06-25';
```

### Rule 5: Currency & Money

All financial values **MUST** use:
- **Type:** `NUMERIC(19,4)` (PostgreSQL; 15 digits, 4 decimal places)
- **Never:** Floating-point (`FLOAT`, `DECIMAL(10,2)`)
- **Language:** Use `decimal.js` or equivalent in application code
- **Format:** Always as string in JSON (e.g., `"amount": "1234.5678"`)

Example:
```sql
-- CORRECT
CREATE TABLE payments (
  amount NUMERIC(19,4) NOT NULL,
  currency VARCHAR(3) NOT NULL
);

-- INCORRECT
CREATE TABLE payments (
  amount FLOAT,  -- Will lose precision
  currency VARCHAR(3)
);
```

---

## Part 2: Complete Entity Registry

All entities defined below are **canonical and immutable**. Any contradictions between this section and the source documents are resolved in favor of this registry.

### 2.1 Governance, Identity & CRM Entities

#### Tenant (Aggregate Root)
- **Definition:** Highest-level isolation unit. One SaaS customer.
- **Lifecycle:** Provisioning → Active → Frozen → Terminated
- **Key Fields:** `id`, `slug` (globally unique), `base_currency`, `timezone`
- **Invariants:**
  - Slug must be globally unique
  - Frozen tenants cannot create new entities
  - Legal hold blocks all mutations
- **Database:** `tenants` table
- **Ownership:** IAM & Governance domain

#### Organization (Entity)
- **Definition:** Legal business entity under a Tenant. One tenant may have multiple orgs.
- **Lifecycle:** Draft → Active → Archived
- **Key Fields:** `id`, `tenant_id`, `slug` (unique per tenant), `status`
- **Database:** `organizations` table
- **Ownership:** IAM & Governance domain

#### Department (Entity)
- **Definition:** Sub-functional division within Organization (e.g., Finance, Operations, Marketing)
- **Lifecycle:** Active ↔ Inactive
- **Key Fields:** `id`, `organization_id`, `is_active`
- **Database:** `departments` table
- **Ownership:** IAM & Governance domain

#### Workspace (Entity)
- **Definition:** Logical collaboration boundary. Contains Projects, Tasks, and shared context.
- **Lifecycle:** Created → Active → Archived
- **Key Fields:** `id`, `organization_id`, `name`
- **Database:** `workspaces` table
- **Ownership:** IAM & Governance domain

#### User / Profile (Aggregate Root)
- **Definition:** Individual human identity. Maps to `auth.users` in Supabase.
- **Lifecycle:** Registered → Active → Suspended → Deactivated
- **Key Fields:** `id`, `user_id` (auth.users FK), `email`, `full_name`
- **Invariants:** One email per user globally
- **Database:** `profiles` table
- **Ownership:** IAM & Governance domain

#### Membership (Entity)
- **Definition:** Explicit link between User and Tenant, carrying Role and permissions.
- **Lifecycle:** Invited → Active → Revoked
- **Key Fields:** `id`, `tenant_id`, `profile_id`, `role`
- **Invariants:** One membership per (user, tenant) pair
- **Database:** `memberships` table
- **Ownership:** IAM & Governance domain

#### Customer (Aggregate Root)
- **Definition:** External purchaser of services or products.
- **Lifecycle:** Lead → Active → Churned
- **Key Fields:** `id`, `tenant_id`, `name`, `email`, `status`
- **Database:** `customers` table
- **Ownership:** CRM domain

#### Supplier (Aggregate Root)
- **Definition:** B2B provider of goods or logistics services to Tenant.
- **Lifecycle:** Draft → Approved → Suspended → Banned
- **Key Fields:** `id`, `tenant_id`, `company_name`, `contact_name`, `email`, `status`
- **Database:** `suppliers` table [GAP-6 Resolved]
- **Ownership:** CRM domain

---

### 2.2 Spatial, Facility & Booking Entities

#### Facility (Aggregate Root)
- **Definition:** Macro physical asset (building, area, land) managed by Organization.
- **Lifecycle:** Draft → Active → Maintenance → Decommissioned
- **Key Fields:** `id`, `organization_id`, `name`, `address`, `status`
- **Database:** `facilities` table
- **Ownership:** Spatial & Facility domain

#### Room (Entity)
- **Definition:** Sub-unit of Facility that can be independently booked. Can represent physical space or abstract slot.
- **Lifecycle:** Available → Occupied → Maintenance
- **Key Fields:** `id`, `facility_id`, `name`, `capacity`
- **Invariants:** Capacity must be > 0
- **Database:** `rooms` table
- **Ownership:** Spatial & Facility domain

#### Asset (Aggregate Root) [GAP-4 Resolved]
- **Definition:** Unit of property (physical or digital) with tracked ownership and lifecycle.
- **Lifecycle:** Procured → Active → Retired
- **Key Fields:** `id`, `tenant_id`, `organization_id`, `asset_type`, `serial_number`, `assigned_to`, `status`
- **Database:** `assets` table
- **Ownership:** Spatial & Facility domain

#### Booking (Aggregate Root)
- **Definition:** Exclusive claim over spatio-temporal dimensions of a Room.
- **Lifecycle:** Pending → UnderReview → Approved → Active → Completed | Rejected | Canceled
- **Key Fields:** `id`, `tenant_id`, `room_id`, `project_id`, `time_range` (tsrange), `idempotency_key`
- **Invariants:**
  - `time_range` must be non-overlapping for same room (GiST exclusion constraint)
  - Status transitions follow defined state machine (Constitution Part 12.1)
  - Idempotency key prevents duplicate bookings
- **Database:** `bookings` table
- **RLS:** `tenant_isolation_bookings`
- **Ownership:** Spatial & Facility domain

#### BookingHistory (Entity) [GAP-7 Resolved]
- **Definition:** Audit trail of all status transitions for a Booking.
- **Key Fields:** `id`, `booking_id`, `from_status`, `to_status`, `actor_id`, `actor_type`, `reason`
- **Database:** `booking_histories` table
- **Ownership:** Spatial & Facility domain

---

### 2.3 Commerce & Event Management Entities

#### Project (Aggregate Root)
- **Definition:** Macro work initiative with defined scope, timeline, and resources.
- **Lifecycle:** Draft → Active → OnHold → Completed → Archived
- **Key Fields:** `id`, `tenant_id`, `organization_id`, `workspace_id`, `title`, `status`
- **Database:** `projects` table
- **Ownership:** Workflow & Operations domain

#### Event (Aggregate Root)
- **Definition:** Spatial, temporal actualization of a Project. Brings together customers and resources at a point in time.
- **Lifecycle:** Draft → Published → Live → Finished → Archived
- **Key Fields:** `id`, `project_id`, `title`, `start_time`, `end_time`, `status`
- **Invariants:** `end_time > start_time`
- **Database:** `events` table
- **Ownership:** Commerce & Event domain

#### TicketType / PassTier (Value Object in Event Aggregate, stored as table)
- **Definition:** Categorization of AccessPass tiers (e.g., VIP, General, Student).
- **Key Fields:** `id`, `event_id`, `name`, `price`, `capacity`, `quantity_issued`
- **Invariants:** `quantity_issued ≤ capacity` at all times
- **Database:** `pass_tiers` table
- **Note:** While stored as a table for querying efficiency, logically this is a Value Object composition within Event aggregate
- **Ownership:** Commerce & Event domain

#### AccessPass (Aggregate Root) [GAP-10 Resolved]
- **Definition:** Verified, tradeable right of entry (digital or physical) to Facility or Event.
- **Lifecycle:** Pending → Issued → CheckedIn → Consumed | Revoked | Expired
- **Key Fields:** `id`, `pass_tier_id`, `customer_id`, `holder_name`, `secure_qr_hash`, `expires_at`, `status`
- **Invariants:**
  - `secure_qr_hash` is globally unique
  - Status progression follows state machine (Constitution Part 12.3)
  - Expiry enforced by Workflow timer
- **Database:** `access_passes` table
- **Ownership:** Commerce & Event domain

#### Campaign (Aggregate Root) [GAP-5 Resolved]
- **Definition:** Structured marketing initiative to drive commercial conversion from Event or Product.
- **Lifecycle:** Planned → Active → Concluded
- **Key Fields:** `id`, `tenant_id`, `project_id`, `name`, `target_type`, `start_date`, `end_date`, `budget`, `status`
- **Database:** `campaigns` table
- **Ownership:** Commerce & Event domain

#### Product (Aggregate Root)
- **Definition:** Saleable good or service (SKU). Can be ticket, merchandise, subscription, or service.
- **Lifecycle:** Draft → Published → Discontinued
- **Key Fields:** `id`, `tenant_id`, `name`, `sku` (globally unique per tenant), `status`
- **Database:** `products` table
- **Ownership:** Commerce & Inventory domain

#### ProductVariant (Entity)
- **Definition:** Specific configuration of Product (size, color, pricing tier).
- **Key Fields:** `id`, `product_id`, `sku_override`, `price`
- **Database:** `product_variants` table
- **Ownership:** Commerce & Inventory domain

#### InventoryLot (Aggregate Root)
- **Definition:** Specific quantity of Product (variant) at a warehouse location.
- **Lifecycle:** Active → Locked → Reconciled → Depleted
- **Key Fields:** `id`, `product_variant_id`, `warehouse_id`, `quantity`, `status`
- **Invariants:** `quantity ≥ 0`
- **Database:** `inventory_lots` table
- **Ownership:** Commerce & Inventory domain

#### StockMovement (Entity)
- **Definition:** Atomic change to InventoryLot quantity.
- **Key Fields:** `id`, `inventory_lot_id`, `quantity`, `movement_type` (IN, OUT, ADJUST), `reason`
- **Database:** `stock_movements` table
- **Ownership:** Commerce & Inventory domain

---

### 2.4 Finance & Accounting Entities

#### Ledger (Aggregate Root)
- **Definition:** Double-entry general ledger. One per Tenant.
- **Lifecycle:** Initialized → Active → Closed
- **Key Fields:** `id`, `tenant_id`, `name`, `currency`, `status`
- **Invariants:** Exactly one active ledger per tenant
- **Database:** `ledgers` table
- **Ownership:** Finance & Ledger domain

#### Account (Entity)
- **Definition:** Node in Chart of Accounts hierarchy (CoA). Accumulates debit/credit postings.
- **Lifecycle:** Draft → Active → Frozen → Closed
- **Key Fields:** `id`, `ledger_id`, `parent_id` (self-ref), `code` (unique per ledger), `name`, `classification`, `normal_balance`
- **Classification Values:** `asset`, `liability`, `equity`, `revenue`, `expense`
- **Invariants:**
  - `code` must be unique per ledger
  - `normal_balance` is either `debit` or `credit` depending on classification
- **Database:** `ledger_accounts` table
- **Ownership:** Finance & Ledger domain

#### JournalEntry (Aggregate Root)
- **Definition:** Single accounting transaction consisting of 2+ JournalLines that must balance.
- **Lifecycle:** Draft → Posted → Voided [Constitution Part 12.6]
- **Key Fields:** `id`, `ledger_id`, `reference_type`, `reference_id`, `narration`, `status`, `posted_at`, `voided_at`, `voided_by`, `reversal_of_id`
- **Invariants:**
  - ∑Debit must equal ∑Credit (verified before posting)
  - Posted entries are immutable (L-02 enforcement via trigger)
  - Voiding creates a new reversal entry, never destructive UPDATE/DELETE
- **Database:** `journal_entries` table [GAP-12 Resolved]
- **RLS:** Enforces `ledger_id → tenant_id` traversal
- **Ownership:** Finance & Ledger domain

#### JournalLine (Entity)
- **Definition:** Single debit or credit posting to an Account.
- **Key Fields:** `id`, `journal_entry_id`, `account_id`, `type` (debit | credit), `amount`
- **Invariants:**
  - Immutable after parent JournalEntry is Posted
  - `amount` must be > 0
- **Database:** `journal_lines` table
- **Ownership:** Finance & Ledger domain

#### Invoice (Aggregate Root)
- **Definition:** Official billing document issued to Customer.
- **Lifecycle:** Draft → Issued → PartiallyPaid → Paid → Settled | Voided
- **Key Fields:** `id`, `tenant_id`, `customer_id`, `idempotency_key`, `status`, `total_amount`, `due_date`
- **Invariants:**
  - `total_amount = ∑(InvoiceLineItem.total) + ∑(TaxLine.amount) - ∑(Discount.amount)`
  - Precision: `NUMERIC(16,4)` (cents for most currencies)
- **Database:** `invoices` table [GAP-8 Resolved]
- **Ownership:** Finance & Ledger domain

#### InvoiceLine (Entity)
- **Definition:** Single line item on Invoice.
- **Key Fields:** `id`, `invoice_id`, `description`, `quantity`, `unit_price`, `total_amount`
- **Database:** `invoice_lines` table
- **Ownership:** Finance & Ledger domain

#### Payment (Aggregate Root)
- **Definition:** Movement of funds to settle Invoice.
- **Lifecycle:** Initiated → Processing → Captured → Settled → Reconciled | Failed | Refunded → RefundSettled
- **Key Fields:** `id`, `tenant_id`, `invoice_id`, `amount`, `gateway_reference`, `gateway_provider`, `idempotency_key`, `status`, `captured_at`, `settled_at`
- **Invariants:** Status transitions follow state machine (Constitution Part 12.2)
- **Database:** `payments` table [GAP-2, GAP-8 Resolved]
- **Gateway Providers:** `xendit`, `stripe`, `midtrans` (extensible via ACL)
- **Ownership:** Finance & Ledger domain

#### Escrow (Aggregate Root)
- **Definition:** Funds held in penitent account awaiting release trigger.
- **Lifecycle:** Locked → PendingRelease → Released → Settled | Refunded
- **Key Fields:** `id`, `tenant_id`, `journal_entry_id`, `amount`, `status`, `release_trigger`, `released_at`
- **Database:** `escrows` table
- **Ownership:** Finance & Ledger domain

#### Subscription (Aggregate Root)
- **Definition:** Recurring billing contract.
- **Lifecycle:** Active → PastDue → Paused → Canceled
- **Key Fields:** `id`, `tenant_id`, `customer_id`, `status`, `interval` (monthly, yearly, etc.)
- **Database:** `subscriptions` table
- **Ownership:** Finance & Billing domain

---

### 2.5 Workflow & Operations Entities

#### Workflow (Aggregate Root)
- **Definition:** Immutable state machine template defining transitions and guards.
- **Lifecycle:** Draft → Published → Deprecated
- **Key Fields:** `id`, `workspace_id`, `name`, `definition` (JSON state machine), `status`
- **Invariants:** Published workflows cannot be modified; deprecation only
- **Database:** `workflows` table
- **Ownership:** Workflow & Operations domain

#### WorkflowState (Entity)
- **Definition:** Single state in state machine.
- **Key Fields:** `id`, `workflow_id`, `name`, `is_terminal`
- **Database:** `workflow_states` table
- **Ownership:** Workflow & Operations domain

#### WorkflowTransition (Entity)
- **Definition:** Permitted edge between two states.
- **Key Fields:** `id`, `workflow_id`, `from_state_id`, `to_state_id`, `trigger_event`, `guard_condition` (JSON)
- **Database:** `workflow_transitions` table
- **Ownership:** Workflow & Operations domain

#### WorkflowInstance (Aggregate Root)
- **Definition:** Single execution of a Workflow for a specific entity.
- **Lifecycle:** Running → PendingApproval → Running → Completed | Suspended | Aborted
- **Key Fields:** `id`, `workflow_id`, `entity_type`, `entity_id`, `status`, `context` (JSONB)
- **Database:** `workflow_instances` table
- **Ownership:** Workflow & Operations domain

#### Task (Entity)
- **Definition:** Unit of work assignable to User or AIAgent.
- **Lifecycle:** Backlog → Todo → InProgress → PendingReview → Done | Blocked
- **Key Fields:** `id`, `workflow_instance_id`, `project_id`, `assigned_to`, `status`, `priority`
- **Database:** `tasks` table
- **Ownership:** Workflow & Operations domain

#### Approval (Entity)
- **Definition:** Human-in-the-loop verification gate in Workflow.
- **Lifecycle:** Pending → Assigned → Reviewed → Approved | Rejected
- **Key Fields:** `id`, `workflow_instance_id`, `assigned_to`, `status`, `context` (JSONB), `resolution` (JSONB)
- **Invariants:** Cannot be auto-bypassed; requires explicit human action
- **Database:** `approvals` table
- **Ownership:** Workflow & Operations domain

---

### 2.6 AI & Knowledge Entities

#### KnowledgeBase (Aggregate Root)
- **Definition:** Repository of documents indexed for semantic search and RAG.
- **Lifecycle:** Initialized → Indexing → Active → Archived
- **Key Fields:** `id`, `tenant_id`, `name`, `status`, `index_model` (embedding model)
- **Database:** `knowledge_bases` table
- **Ownership:** AI & Knowledge domain

#### Document (Entity)
- **Definition:** Content artifact (PDF, Markdown, plain text) stored in KnowledgeBase.
- **Lifecycle:** Draft → Published → Superseded → Archived
- **Key Fields:** `id`, `knowledge_base_id`, `title`, `source_type`, `status`, `metadata` (JSONB)
- **Database:** `documents` table
- **Ownership:** AI & Knowledge domain

#### DocumentVersion (Entity)
- **Definition:** Versioned snapshot of Document content.
- **Key Fields:** `id`, `document_id`, `version_number`, `content`, `created_at`
- **Database:** `document_versions` table
- **Ownership:** AI & Knowledge domain

#### Chunk (Entity) [Implicit, not always persisted]
- **Definition:** Granular fragment of Document content (512 tokens, 64-token overlap) for RAG retrieval.
- **Key Fields:** `id`, `document_version_id`, `chunk_index`, `text_content`, `token_count`
- **Database:** `chunks` table
- **Ownership:** AI & Knowledge domain

#### Embedding (Entity)
- **Definition:** Vector representation of Chunk text.
- **Type:** `vector(1536)` (pgvector HNSW index)
- **Model:** `text-embedding-3-large` (OpenAI)
- **Key Fields:** `id`, `chunk_id`, `vector_data`, `model_version`, `created_at`
- **Invariants:** Immutable once created; re-indexed on upstream change
- **Database:** `embeddings` table with HNSW index [GAP-15 Resolved]
- **Index:** `idx_embeddings_hnsw_vector_cosine_ops`
- **Ownership:** AI & Knowledge domain

#### Prompt (Aggregate Root)
- **Definition:** LLM instruction template with versioning and governance.
- **Lifecycle:** Draft → Active → Deprecated
- **Key Fields:** `id`, `tenant_id`, `name`, `template`, `input_schema` (JSON Schema), `output_format` (JSON Schema), `guardrails` (array), `status`, `version`
- **Invariants:**
  - `input_schema` defines injectable variables
  - `guardrails` define active filters (PII, hallucination, etc.)
  - Version increments on any template change
- **Database:** `prompts` table [GAP-9 Resolved]
- **Ownership:** AI & Knowledge domain

#### AIAgent (Aggregate Root)
- **Definition:** Autonomous computational entity with LLM backend and tool registry.
- **Lifecycle:** Configured → Running → Idle → Disabled
- **Key Fields:** `id`, `tenant_id`, `name`, `model` (via OpenRouter), `tools` (JSONB MCP registry), `max_budget_per_call`, `status`
- **Invariants:** Tools are the exclusive interface; no direct database access
- **Database:** `ai_agents` table [GAP-11 Resolved]
- **Ownership:** AI & Knowledge domain

---

## Part 3: State Machine Enums (Complete Registry)

All enums are SQL enum types in PostgreSQL. Values are immutable once defined.

### 3.1 Booking State Enum [GAP-1 Resolved]
```sql
CREATE TYPE booking_state AS ENUM (
  'pending',      -- Initial submission
  'under_review', -- Awaiting approval
  'approved',     -- Approved but not yet active
  'active',       -- Currently occupying space
  'completed',    -- Time window passed, occupation ended
  'rejected',     -- Proposal rejected [GAP-1]
  'canceled'      -- Canceled post-approval
);
```

### 3.2 Invoice State Enum
```sql
CREATE TYPE invoice_state AS ENUM (
  'draft',           -- Not yet issued
  'issued',          -- Official billing document sent
  'partially_paid',  -- Partial payment received
  'paid',            -- Full amount due received
  'settled',         -- Funds reconciled to ledger
  'voided'           -- Canceled; reversal entries created
);
```

### 3.3 AccessPass State Enum [GAP-1 Resolved]
```sql
CREATE TYPE access_pass_state AS ENUM (
  'pending',    -- Awaiting issuance
  'issued',     -- Official pass created; QR active
  'checked_in', -- Entry scanned
  'consumed',   -- Used (terminal for physical passes)
  'revoked',    -- Invalidated
  'expired'     -- Expiry time passed [GAP-1]
);
```

### 3.4 Workflow State Enum
```sql
CREATE TYPE workflow_state AS ENUM (
  'running',              -- Active
  'pending_approval',     -- Awaiting human/AI resolution
  'completed',            -- Terminal: success
  'suspended',            -- Paused, can resume
  'aborted'               -- Terminal: failed or manual abort
);
```

### 3.5 Account Classification Enum
```sql
CREATE TYPE account_classification AS ENUM (
  'asset',      -- Debit normal balance
  'liability',  -- Credit normal balance
  'equity',     -- Credit normal balance
  'revenue',    -- Credit normal balance (income)
  'expense'     -- Debit normal balance (cost)
);
```

### 3.6 Actor Type Enum
```sql
CREATE TYPE actor_type AS ENUM (
  'USER',      -- Human actor
  'AI_AGENT',  -- LLM-based agent
  'SYSTEM'     -- Automated system (workflow engine, scheduled job)
);
```

### 3.7 Payment State Enum [GAP-2 Resolved]
```sql
CREATE TYPE payment_state AS ENUM (
  'initiated',      -- Payment process started
  'processing',     -- In flight to payment processor
  'captured',       -- Funds captured by processor
  'settled',        -- Settled to bank account
  'reconciled',     -- Reconciled to ledger
  'failed',         -- Transaction failed
  'refunded',       -- Refund issued
  'refund_settled'  -- Refund completed
);
```

### 3.8 Journal Entry State Enum [GAP-3 Resolved]
```sql
CREATE TYPE journal_state AS ENUM (
  'draft',   -- Not posted; can be modified
  'posted',  -- Posted to ledger; immutable
  'voided'   -- Voided; reversal entry created
);
```

### 3.9 Asset State Enum [GAP-4 Resolved]
```sql
CREATE TYPE asset_state AS ENUM (
  'procured', -- Acquired; not yet operational
  'active',   -- In service
  'retired'   -- End of life; decommissioned
);
```

### 3.10 Campaign State Enum [GAP-5 Resolved]
```sql
CREATE TYPE campaign_state AS ENUM (
  'planned',    -- Designed but not launched
  'active',     -- Currently running
  'concluded'   -- Ended; results tracked
);
```

---

## Part 4: Value Objects (Immutable Structures)

Value Objects are immutable, identity-agnostic data structures. Equality is based on value, not reference. They compose into Entities and Aggregates.

### 4.1 Financial Value Objects

#### Money
- **Composition:** `amount: NUMERIC(19,4)`, `currency: VARCHAR(3)` (ISO 4217)
- **Invariants:**
  - `amount ≥ 0` (no negative money; use separate semantics for debit/credit)
  - Arithmetic operations require same currency; cross-currency requires explicit conversion
- **Example:** `Money(1000.00, 'IDR')`

#### Percentage
- **Composition:** `value: NUMERIC(5,4)` (0.0000 to 1.0000), `basis: enum(FLAT, COMPOUND)`
- **Invariants:**
  - `0.0000 ≤ value ≤ 1.0000`
  - FLAT = simple %; COMPOUND = compounding calculation
- **Example:** `Percentage(0.1500, FLAT)` = 15%

#### TaxRate
- **Composition:** `code: VARCHAR`, `percentage: Percentage`, `jurisdiction: VARCHAR`
- **Example:** `TaxRate('PPN-10', Percentage(0.10, FLAT), 'ID')`

#### LedgerBalance
- **Composition:** `debit: Money`, `credit: Money`, `net: Money`
- **Calculation:** `net = debit - credit` (for normal debit account); reversed for credit accounts
- **Invariants:** Always computable from debit/credit values

### 4.2 Spatial & Temporal Value Objects

#### TimeRange
- **Composition:** `start: TIMESTAMPTZ`, `end: TIMESTAMPTZ`
- **Invariants:**
  - `end > start` (strict inequality; no zero-duration ranges)
  - Stored as PostgreSQL `tsrange` type for GiST exclusion
- **Usage:** Booking spatio-temporal uniqueness
- **Example:** `TimeRange('2026-06-25T10:00:00Z', '2026-06-25T12:00:00Z')`

#### GeoCoordinate
- **Composition:** `latitude: FLOAT8`, `longitude: FLOAT8`
- **Invariants:**
  - `-90 ≤ latitude ≤ 90`
  - `-180 ≤ longitude ≤ 180`
- **Storage:** PostgreSQL `point` type (or decomposed FLOAT columns)
- **Example:** `GeoCoordinate(-6.2088, 106.8456)` (Jakarta)

#### Address
- **Composition:** `street: VARCHAR`, `city: VARCHAR`, `state: VARCHAR`, `postal_code: VARCHAR`, `country_code: VARCHAR(2)` (ISO 3166-1)
- **Invariants:** None; all fields optional but country_code strongly recommended
- **Example:** Address with Jakarta coordinates above

#### CoordinatePolygon
- **Composition:** `points: GeoCoordinate[]`
- **Invariants:**
  - Minimum 3 points (valid polygon)
  - Closed loop (first point == last point) optional
- **Usage:** Facility boundary definition for occupancy analytics
- **Storage:** PostgreSQL `polygon` type

### 4.3 Identity & Cryptography Value Objects

#### IdentityReference
- **Composition:** `id: UUID`, `type: enum(USER, AI_AGENT, SYSTEM)`
- **Invariants:** Type must match actual entity type
- **Usage:** Audit trails, approval chains

#### Email
- **Composition:** `address: VARCHAR` (RFC 5321 validated)
- **Invariants:** Valid email format
- **Example:** `Email('user@example.com')`

#### Phone
- **Composition:** `number: VARCHAR` (E.164 format), `country_code: VARCHAR(2)`
- **Invariants:** E.164 format (starts with +, then 1–15 digits)
- **Example:** `Phone('+62812345678', 'ID')`

#### IPAddress
- **Composition:** `value: VARCHAR` (IPv4 or IPv6)
- **Invariants:** Valid IP format
- **Storage:** PostgreSQL `inet` type [GAP-16 Resolved]

#### AuditStamp
- **Composition:** `actor_id: IdentityReference`, `timestamp: TIMESTAMPTZ`, `ip_address: IPAddress`, `trace_id: UUID`
- **Usage:** Every database mutation includes this
- **Invariants:** Immutable once created

#### SecureQRCode
- **Composition:** `payload: EncryptedPayload`, `checksum: Hash`, `expiresAt: TIMESTAMPTZ`
- **Usage:** AccessPass physical/digital verification
- **Invariants:**
  - Payload is AES-256 encrypted
  - Checksum validates integrity
  - Expiry enforced by workflow timer

#### Hash
- **Composition:** `algorithm: enum(SHA256, SHA512)`, `value: VARCHAR`
- **Example:** `Hash(SHA256, '5d41402abc4b2a76b9719d911017c592')`

---

## Part 5: Terminological Reconciliation Matrix

This section resolves ambiguous or drift-prone terms across Layer 1, Layer 2, and Layer 3.

| Concept | Layer 1 (Constitution) | Layer 2 (Database) | Layer 3 (EPXA) | Canonical Form | Resolution |
|---------|----------------------|-------------------|----------------|----------------|-----------|
| **AccessPass Type Hierarchy** | TicketType (in Event aggregate) | pass_tiers table | AccessPass concept model | **TicketType** (Value Object) in Event; **pass_tiers** (database table) | TicketType is ontological; pass_tiers is physical. No conflict. |
| **Reserve vs. Issue** | `ReserveAccessPassCommand` (Part 10.3) | status='pending' then 'issued' | `IssueAccessPassCommand` (MCP tool) | **IssueAccessPassCommand** emits **AccessPassIssued** event | "Reserve" is action; "Issue" is outcome. Use "Issue" for canonical command name. |
| **Payment Gateway** | "Payment Gateways" (Part 17) | gateway_provider column | IPaymentAdapter port | **IPaymentAdapter** interface (abstraction); **gateway_provider** (implementation detail) | Adapter is pattern; provider is data. Use both terms, distinct usage. |
| **Access Control** | Bounded Context (DDD) | RLS policy (SQL) | RBAC/ABAC (pattern) | **Bounded Context** (architecture); **RLS** (implementation); **RBAC/ABAC** (governance) | All three are valid in different contexts. Use precisely. |
| **Event Publication** | Domain Events (Part 13) | domain_events Outbox table | MCP tools + Webhook adapters | **Domain Events** (canonical); **Outbox pattern** (implementation) | No conflict. Domain Events are published via Outbox. |
| **Workflow** | Workflow aggregate | workflows + workflow_instances | Trigger.dev orchestration | **Workflow** (template); **WorkflowInstance** (execution) | Template vs. instance distinction is critical. Never confuse. |
| **Read Model** | CQRS & Read Model Strategy (Part 14) | mv_* materialized views | Hybrid search (Typesense + pgvector) | **Materialized View** (database); **Read Model** (architectural pattern) | Read Model is abstract; MV is concrete implementation. |
| **Asset** | Asset entity (Part 3.2) | assets table | Asset domain model | **Asset** (consistent across all layers) | No drift. Canonical. |
| **Supplier** | Supplier entity (Part 3.1) | suppliers table [GAP-6] | Supplier in CRM context | **Supplier** (canonical) | Resolved. Entity now appears in all layers. |
| **Campaign** | Campaign entity (Part 3.2) | campaigns table [GAP-5] | Campaign in Commerce context | **Campaign** (canonical) | Resolved. Entity now appears in all layers. |

---

## Part 6: Cross-Layer Entity Mapping

This mapping shows which entities belong to which layers and how they interconnect.

| Entity | Layer 1 | Layer 2 | Layer 3 | Ownership |
|--------|---------|---------|---------|-----------|
| Tenant | Part 3.1 ✓ | tenants table ✓ | IAM context ✓ | IAM & Governance |
| Organization | Part 3.1 ✓ | organizations table ✓ | IAM context ✓ | IAM & Governance |
| Workspace | Part 3.1 ✓ | workspaces table ✓ | Workflow context ✓ | IAM & Governance |
| User / Profile | Part 3.1 ✓ | profiles table ✓ | IAM context ✓ | IAM & Governance |
| Membership | Part 3.1 ✓ | memberships table ✓ | IAM context ✓ | IAM & Governance |
| Customer | Part 3.1 ✓ | customers table ✓ | Commerce context ✓ | CRM |
| Supplier | Part 3.1 ✓ | suppliers table [GAP-6] ✓ | CRM context ✓ | CRM |
| Facility | Part 3.2 ✓ | facilities table ✓ | Spatial context ✓ | Spatial |
| Room | Part 3.2 ✓ | rooms table ✓ | Spatial context ✓ | Spatial |
| Asset | Part 3.2 ✓ | assets table [GAP-4] ✓ | Spatial context ✓ | Spatial |
| Booking | Part 3.2 ✓ | bookings table ✓ | Spatial context ✓ | Spatial |
| Project | Part 3.2 ✓ | projects table ✓ | Workflow context ✓ | Workflow |
| Event | Part 3.2 ✓ | events table ✓ | Commerce context ✓ | Commerce |
| AccessPass | Part 3.2 ✓ | access_passes table ✓ | Commerce context ✓ | Commerce |
| Campaign | Part 3.2 ✓ | campaigns table [GAP-5] ✓ | Commerce context ✓ | Commerce |
| Product | Part 3.2 ✓ | products table ✓ | Inventory context ✓ | Inventory |
| Ledger | Part 3.3 ✓ | ledgers table ✓ | Finance context ✓ | Finance |
| Account | Part 3.3 ✓ | ledger_accounts table ✓ | Finance context ✓ | Finance |
| JournalEntry | Part 3.3 ✓ | journal_entries table ✓ | Finance context ✓ | Finance |
| Invoice | Part 3.3 ✓ | invoices table ✓ | Finance context ✓ | Finance |
| Payment | Part 3.3 ✓ | payments table ✓ | Finance context ✓ | Finance |
| Workflow | Part 3.4 ✓ | workflows table ✓ | Workflow context ✓ | Workflow |
| WorkflowInstance | Part 3.4 ✓ | workflow_instances table ✓ | Workflow context ✓ | Workflow |
| Task | Part 3.4 ✓ | tasks table ✓ | Workflow context ✓ | Workflow |
| KnowledgeBase | Part 3.4 ✓ | knowledge_bases table ✓ | AI context ✓ | AI & Knowledge |
| Document | Part 3.4 ✓ | documents table ✓ | AI context ✓ | AI & Knowledge |
| Embedding | Part 3.4 ✓ | embeddings table ✓ | AI context ✓ | AI & Knowledge |
| Prompt | Part 3.4 ✓ | prompts table [GAP-9] ✓ | AI context ✓ | AI & Knowledge |
| AIAgent | Part 3.4 ✓ | ai_agents table [GAP-11] ✓ | AI context ✓ | AI & Knowledge |

---

## Part 7: Enforcement & Governance

### 7.1 How Terminology is Enforced

**Violation Detection:**
- **CI/CD Gate:** Spell-check against canonical terms in `/docs/terms.dict`
- **Code Review:** Peer review flags forbidden terms (e.g., "Pass" instead of "AccessPass")
- **Database Audit:** Schema drift detected if table names deviate from registry
- **Linter Rule:** ESLint plugin checks `git diff` for terminology violations

**Remediation Path:**
1. Developer introduces forbidden term
2. CI gate fails with link to this volume (01-foundations.md)
3. Developer updates code to use canonical term
4. Re-run CI; passes
5. PR merged

### 7.2 Updates to Terminology

**Process:**
1. File an RFC with the proposed terminology change
2. Architecture review board votes
3. If approved, update this volume (01-foundations.md)
4. Update spell-check dictionary
5. Release in next major version (5.1 → 5.2)
6. Deprecated terms remain in "Forbidden Terms" section for 12 months

**Example:** Renaming "Ticket" to "AccessPass" (completed in v5.0.1)

---

## Appendix A: Quick Reference — Canonical Terms

```
Tenant
├── Organization
│   ├── Department
│   ├── Workspace
│   │   └── Project
│   │       ├── Event (Commerce)
│   │       │   ├── TicketType (in pass_tiers table)
│   │       │   └── AccessPass
│   │       ├── Booking (Spatial)
│   │       └── Campaign
│   └── Facility (Spatial)
│       └── Room
├── Customer (CRM)
├── Supplier (CRM)
├── Ledger (Finance)
│   ├── Account
│   └── JournalEntry
│       └── JournalLine
├── Invoice
├── Payment
├── Product (Inventory)
├── Workflow (Orchestration)
│   └── WorkflowInstance
│       ├── Task
│       └── Approval
├── KnowledgeBase (AI)
│   ├── Document
│   └── Embedding
├── Prompt (AI)
├── AIAgent (AI)
└── Asset (Physical)
```

---

**Volume 01: Foundations | SEKB v5.1-ENTERPRISE | Ratified June 25, 2026**
