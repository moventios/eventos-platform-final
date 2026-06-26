# Volume 06: Governance & Compliance
## Sovereign OS Enterprise Knowledge Base

**Enterprise Laws, Change Management, Audit, and Regulatory Compliance**

**Version:** 5.1-ENTERPRISE  
**Status:** RATIFIED  
**Date:** June 25, 2026  
**Authority:** Constitution Parts 9, 19, 21 | Layer 2 Database SSOT | EPXA Part 6  
**Owner:** Compliance Lead + Lead Architect

---

## Overview

Volume 06 is the **single source of truth for governance, compliance, and enforcement** across Sovereign OS. It translates the Enterprise Laws (L-01 through L-10) from abstract principles into concrete, auditable, and machine-enforceable mechanisms.

This volume governs:
- How every Enterprise Law is detected, prevented, and remediated
- How architectural decisions are made and recorded (ADR/RFC process)
- How data is classified, protected, and retained
- How external auditors and regulators can verify compliance
- How the platform evolves without accumulating technical debt

**Every engineer, AI agent, and architect must be able to answer:** "Which law governs this?" and find the enforcement mechanism here.

---

## Part 1: Enterprise Laws — Enforcement Mechanisms

> **Definisi lengkap + rationale** L-01 sampai L-10 ada di [Layer-1-Constitution-v5.0.2.md](../Layer-1-Constitution-v5.0.2.md) Part 9.  
> Volume ini hanya mendokumentasikan **mekanisme enforcement** (triggers, linter, middleware, proses) yang bersifat implementasi. Bila ada konflik definisi, Layer-1 menang.

Enterprise Laws are **non-negotiable constants**. Pelanggaran wajib melalui ADR yang diratifikasi.

[Authority: Constitution Part 9 + ADR process di volume ini]

### Enforcement Reference (L-01 to L-10)

**Full law definitions and rationale:** See [Layer-1-Constitution-v5.0.2.md](../Layer-1-Constitution-v5.0.2.md) Part 9.

This volume focuses on **enforcement mechanisms only**. For each law, the implementation (SQL, CI, middleware, process) is described in the sections below.

(See detailed enforcement tables for L-02 to L-10 in the remainder of this document or cross-reference to Layer-1.)
| **Code Review** | Reviewer checklist: "Does this query span table prefixes from different contexts?" | PR BLOCKED pending refactor |
| **Database** | Schema isolation: each context has its own table prefix or schema (`iam_`, `finance_`, `spatial_`, etc.) | Schema separation makes the violation visible |
| **Runtime** | Query logging via OpenTelemetry; anomaly detection for unexpected JOIN patterns | Alert fired; post-incident ADR required |

#### Allowed Patterns (After Composition)

```typescript
// ✅ CORRECT: Compose in application layer (BFF)
const booking = await bookingRepository.getById(bookingId);       // Spatial context
const invoice  = await invoiceRepository.getByBooking(bookingId); // Finance context
return { booking, invoice };                                       // Composed in BFF

// ❌ FORBIDDEN: Cross-context SQL JOIN
SELECT b.*, i.* FROM bookings b
JOIN invoices i ON i.booking_reference = b.id;  -- BLOCKED by CI
```

#### Remediation Path
1. Identify which contexts own the tables being joined.
2. Expose the data need via Domain Event subscription or Query (within the owning context).
3. Compose at the BFF or CQRS Read Model layer.
4. File ADR if a structural Read Model is needed (e.g., a new materialized view joining denormalized data).

---

### L-02: Immutable Financial History

**Statement:** Tables `journal_entries`, `journal_lines`, `ledgers` are **Append-Only** in production. No `UPDATE` or `DELETE` DML is permitted on records with status `posted` or `voided`. Corrections use Reversal JournalEntry linked via `reversal_of_id`.

**Rationale:** Financial auditability, legal compliance (SOX, IFRS), and prevention of data tampering. The ledger must be a verifiable append-only log.

#### Enforcement Mechanisms

| Layer | Mechanism | Action on Violation |
|-------|-----------|-------------------|
| **Database Trigger** | `journal_entry_immutable` trigger blocks UPDATE/DELETE on posted/voided rows | `EXCEPTION` raised; transaction rolled back |
| **Database Trigger** | `journal_lines_immutable` trigger blocks mutations when parent entry is not in `draft` | `EXCEPTION` raised |
| **Migration Linter** | CI blocks any migration containing `DROP COLUMN`, raw `DELETE`, or `UPDATE` on financial tables | Pipeline FAILS |
| **Stored Procedure** | `post_ledger_transaction()` is the only path to post entries; validates balance before committing | Invalid entries rejected |
| **RLS** | Finance context users cannot execute DELETE on financial tables even if trigger were bypassed | Two independent enforcement layers |

#### Immutable Trigger Implementation

```sql
-- Blocks UPDATE or DELETE on posted or voided journal entries
CREATE OR REPLACE FUNCTION block_journal_entry_mutations()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('posted', 'voided') THEN
    RAISE EXCEPTION 'L-02 VIOLATION: Cannot modify journal entry % in status %',
      OLD.id, OLD.status
      USING HINT = 'Use VoidJournalEntry command to create a reversal entry.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_entry_immutable
  BEFORE UPDATE OR DELETE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION block_journal_entry_mutations();
```

#### Reversal Pattern (Correct Correction Method)

Reversals are created as new draft JournalEntry:
1. Insert reversal entry (linked via `reversal_of_id`)
2. Copy lines with debits/credits flipped
3. Post via `post_ledger_transaction()`

Full SQL example is in Layer-2-Database-SSOT-v5.0.2.md (immutable triggers section). This volume documents the policy, not the exact DDL.

---

### L-03: Soft Delete Everywhere

**Statement:** Physical deletion (`DELETE`) of business entities is forbidden in production. All entities use `deleted_at TIMESTAMPTZ` + `deleted_by UUID`. Data is archived to cold storage after the retention period expires.

**Rationale:** Audit trails, forensic investigation, GDPR right-to-erasure (handled via anonymization, not deletion), and accidental deletion recovery.

#### Required Columns (All Business Tables)

Every business table must include `deleted_at TIMESTAMPTZ`, `deleted_by UUID` (and the check constraint). See Layer-2 for exact schema.

Queries default to `WHERE deleted_at IS NULL`.

#### Enforcement Mechanisms

| Layer | Mechanism | Action |
|-------|-----------|--------|
| **Migration Linter** | CI blocks migrations with raw `DELETE FROM` on business tables | Pipeline FAILS |
| **Query Layer** | All repository `find*` methods apply `WHERE deleted_at IS NULL` by default | Soft-deleted records invisible to normal queries |
| **RLS** | `deleted_at IS NULL` included in base RLS policies | Extra guard at database level |
| **Audit** | `deleted_by` links to `profiles` table for accountability | Full audit trail |

#### GDPR Erasure Handling (Special Case)
When a data subject invokes GDPR right-to-erasure:
1. PII fields are **anonymized** in-place (name → `[REDACTED]`, email → `null`)
2. `deleted_at` is set to current timestamp
3. `deleted_by` references the system actor executing the erasure
4. Financial records linked to the individual are **not deleted**; they are decoupled by nullifying the `customer_id` foreign key where legally permissible
5. A `DataErasureRequested` domain event is emitted and logged in the compliance audit trail

---

### L-04: Idempotency Mandate

**Statement:** All API mutations (financial, booking, notification) **must** accept and validate `X-Idempotency-Key`. Identical keys for identical operations return cached responses without re-executing the operation.

**Rationale:** Network failures, client retries, and distributed system partitions make duplicate requests inevitable. Idempotency prevents double-charging, double-booking, and duplicate notifications.

#### Implementation Contract

All mutating endpoints **require** `X-Idempotency-Key` header (UUID).

- Middleware checks Valkey cache (24h TTL)
- If hit, return cached response (no re-execution)
- On miss, execute, store result in cache keyed by (tenant_id, key, operation hash)

See Layer-2 for `idempotency_key` column requirements on relevant tables.
  const cached = await valkey.get(`idempotency:${tenantId}:${key}`);
  if (cached) {
    return res.status(200).json(JSON.parse(cached));  // Return cached response
  }

  // Execute operation, store result
  res.on('finish', async () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      await valkey.setex(`idempotency:${tenantId}:${key}`, 86400, JSON.stringify(res.body));
    }
  });
  next();
}
```

#### Database Enforcement

```sql
-- Unique constraint on all financial mutation tables
ALTER TABLE invoices ADD CONSTRAINT uq_invoices_idempotency_key
  UNIQUE (tenant_id, idempotency_key);

ALTER TABLE payments ADD CONSTRAINT uq_payments_idempotency_key
  UNIQUE (tenant_id, idempotency_key);

ALTER TABLE bookings ADD CONSTRAINT uq_bookings_idempotency_key
  UNIQUE (tenant_id, idempotency_key);
```

#### Enforcement Mechanisms

| Layer | Mechanism | Action on Violation |
|-------|-----------|-------------------|
| **API Middleware** | `IdempotencyMiddleware` checks Valkey before processing | 400 error if key missing; cached response if key seen |
| **Database** | `UNIQUE (tenant_id, idempotency_key)` constraint | `23505` unique violation error returned |
| **CI** | Static analysis: any route touching financial tables must declare idempotency handling | Pipeline WARNING; escalates to FAIL if finance route lacks middleware |

---

### L-05: No Entity Without Owner

**Statement:** Every row in every business table must be traceable to a `tenant_id` either directly or via foreign key chain. Orphan entities without tenant context are forbidden.

**Rationale:** Multi-tenancy isolation is the core security boundary of Sovereign OS. An entity without `tenant_id` is an isolation violation.

#### Required Traceability Chain

```
tenant_id (direct) → Most tables
OR
organization_id → organizations.tenant_id
OR
project_id → projects.organization_id → organizations.tenant_id
OR
event_id → events.project_id → projects.organization_id → organizations.tenant_id
```

#### Enforcement Mechanisms

| Layer | Mechanism | Action |
|-------|-----------|--------|
| **RLS** | Every table has RLS policy filtering on `tenant_id` (direct or via subquery) | Queries without tenant context return empty sets |
| **Foreign Keys** | `NOT NULL` on `tenant_id` (or ancestor FK) prevents null insertion | `23502` violation on INSERT |
| **Migration Linter** | CI requires `tenant_id` column or documented FK chain on every new table | Pipeline FAILS |
| **Application Layer** | `TenantContext` injected from JWT into every repository call | Cannot instantiate repository without tenant context |

#### RLS Coverage Matrix (38 Tables)

| Context | Tables | RLS Policy | Isolation Type |
|---------|--------|-----------|----------------|
| IAM | `tenants`, `organizations`, `departments`, `workspaces`, `profiles`, `memberships` | Direct `tenant_id` | Direct |
| Spatial | `facilities`, `rooms`, `assets`, `bookings`, `booking_histories` | Via `organization_id` or direct | FK Chain |
| Commerce | `events`, `pass_tiers`, `access_passes`, `products`, `product_variants`, `inventory_lots`, `stock_movements`, `campaigns` | Via `project_id → organization_id` or direct | FK Chain |
| Finance | `ledgers`, `ledger_accounts`, `journal_entries`, `journal_lines`, `invoices`, `invoice_lines`, `payments`, `escrows`, `subscriptions` | Direct `tenant_id` or via `ledger_id` | Direct / FK Chain |
| Workflow | `workflows`, `workflow_states`, `workflow_transitions`, `workflow_instances`, `tasks`, `approvals` | Via `workspace_id → organization_id` | FK Chain |
| AI | `knowledge_bases`, `documents`, `document_versions`, `chunks`, `embeddings`, `prompts`, `ai_agents` | Direct `tenant_id` | Direct |
| CRM | `customers`, `suppliers` | Direct `tenant_id` | Direct |

---

### L-06: AI Write Interception (AI Safety Law)

**Statement:** AI agents **never** directly write to financial, ownership, or workflow state tables. All AI WRITE actions produce an `Approval` record with status `Pending` which must be resolved by a human actor **before** any state transition occurs.

**Rationale:** AI models can hallucinate, misinterpret context, or be manipulated. Financial mutations and ownership transfers are irreversible (or costly to reverse). Human-in-the-loop is non-negotiable for material state changes.

**Enforcement:** See [ADR-002](../architecture/adr/ADR-002-ai-safety-l06-enforcement.md) for the complete MCP Tool Level enforcement architecture.

#### Quick Reference: Tool Access Levels

| Level | Category | Example Tools | Effect |
|-------|----------|--------------|--------|
| **Level 0** | FORBIDDEN | `post_journal_entry`, `capture_payment`, `transfer_ownership`, `purge_data` | Tool does not exist in AI-callable registry |
| **Level 1** | WRITE→PENDING | `draft_journal_entry`, `issue_access_pass`, `cancel_booking`, `initiate_refund` | Creates `Approval` row; NO state mutation until human approves |
| **Level 2** | ALLOWED | `search_knowledge_base`, `get_ledger_balance`, `get_booking_status`, `get_event_sales` | Read-only; executes immediately under RLS |

#### CI Enforcement
```bash
# CI gate: ensures no new MCP tool is added to Level 1/2 without review
scripts/validate-mcp-tool-levels.sh
# Grep for new tool registrations; require PR approval from AI Engineering Lead
```

---

### L-07: Command Handler Mandate

**Statement:** All material data mutations must flow through a Command Handler or Stored Procedure that validates domain invariants before persistence. Direct mutations via UI, API route handler, or raw SQL that bypass domain validation are architectural violations.

**Rationale:** Domain invariants (e.g., "∑Debit = ∑Credit", "booking cannot overlap", "pass capacity ≤ limit") can only be reliably enforced if all writes go through the validation layer.

#### Enforcement Mechanisms

| Layer | Mechanism | Action |
|-------|-----------|--------|
| **Architecture Review** | PR review requires Command Handler present for any new mutation | PR BLOCKED if missing |
| **Stored Procedure** | `post_ledger_transaction()` is the mandatory path for journal postings (not raw UPDATE) | Raw SQL update blocked by trigger |
| **Application Layer** | Domain Command Handler validates invariants; only then calls Repository.save() | Invalid commands throw DomainException |
| **CI** | Static analysis: API routes must delegate to application service/command handler | Pipeline WARNING |

#### Command Handler Pattern

```typescript
// ✅ CORRECT: Command → Handler → Invariant Check → Repository
class PostJournalEntryHandler {
  async execute(cmd: PostJournalEntryCommand): Promise<void> {
    const entry = await this.journalRepo.getById(cmd.journalEntryId);
    
    // Invariant: must be draft
    if (entry.status !== 'draft') {
      throw new DomainException('Entry must be in draft status');
    }
    
    // Invariant: debit must equal credit
    const totalDebit  = entry.lines.filter(l => l.type === 'debit').reduce((s, l) => s.plus(l.amount), Decimal(0));
    const totalCredit = entry.lines.filter(l => l.type === 'credit').reduce((s, l) => s.plus(l.amount), Decimal(0));
    if (!totalDebit.equals(totalCredit)) {
      throw new DomainException(`Debit (${totalDebit}) ≠ Credit (${totalCredit})`);
    }
    
    // Delegate to stored procedure (not raw UPDATE)
    await this.db.execute('SELECT post_ledger_transaction($1, $2, $3)',
      [cmd.journalEntryId, cmd.actorId, cmd.traceId]);
  }
}

// ❌ FORBIDDEN: Direct mutation bypassing invariant checks
await db.update(journal_entries).set({ status: 'posted' }).where(eq(id, journalEntryId));
```

---

### L-08: Zero-Downtime Migration

**Statement:** All database schema changes must use the **Expand and Contract** pattern. Direct column renames, type changes, or drops in a single migration are forbidden in production.

**Rationale:** A deployed application and a database migration must be compatible at every point in time. Breaking DDL in a single step causes downtime.

#### The Expand and Contract Pattern

```
Phase 1 — EXPAND (backward compatible)
  → Add new_column (nullable, or with default)
  → Start writing to BOTH old_column and new_column in application code
  → Deploy application

Phase 2 — MIGRATE (data)
  → Backfill new_column from old_column
  → Verify all rows are migrated

Phase 3 — CUT OVER (application)
  → Update application to read from new_column only
  → Stop writing to old_column
  → Deploy application

Phase 4 — CONTRACT (cleanup)
  → Drop old_column (now safe; no application reads it)
  → Deploy migration

Example (rename column `pass_tier_id` → `ticket_type_id`):
  EXPAND:   ALTER TABLE access_passes ADD COLUMN ticket_type_id UUID;
  MIGRATE:  UPDATE access_passes SET ticket_type_id = pass_tier_id;
  CUTOVER:  Deploy code that reads ticket_type_id
  CONTRACT: ALTER TABLE access_passes DROP COLUMN pass_tier_id;
```

#### Forbidden DDL in Single Migration

```sql
-- ❌ FORBIDDEN: Will cause downtime
ALTER TABLE access_passes RENAME COLUMN pass_tier_id TO ticket_type_id;
ALTER TABLE journal_entries ALTER COLUMN amount TYPE DECIMAL(16,4);  -- if data in flight

-- ✅ CORRECT: Use Expand and Contract (4-phase migration)
```

#### Enforcement

| Layer | Mechanism | Action |
|-------|-----------|--------|
| **Migration CI** | `drizzle-kit` migration linter + custom script detecting forbidden DDL | Pipeline FAILS |
| **PR Review Checklist** | "Is this a rename or type change? If yes, use Expand/Contract" | PR BLOCKED |

---

### L-09: API Versioning

**Statement:** Public APIs must not undergo breaking changes without publishing a new major version (v1 → v2) and providing a sunset notice of at least **90 days** to registered consumers.

**Breaking changes include:**
- Removing a field from a response
- Changing a field type
- Removing an endpoint
- Changing authentication mechanism
- Changing error response schema

**Non-breaking changes** (allowed without new version):
- Adding optional fields to responses
- Adding new optional request parameters
- Adding new endpoints
- Performance improvements

#### Versioning Convention

```
/api/v1/commerce/access-passes   ← Current stable version
/api/v2/commerce/access-passes   ← New version (parallel, during transition)
```

#### Sunset Process

```
Day 0:   v2 released; v1 marked DEPRECATED
         Response header added: Deprecation: true, Sunset: <date 90 days out>
Day 90:  v1 stopped accepting new requests
Day 90+: v1 removed from routing
```

#### Enforcement

| Layer | Mechanism | Action |
|-------|-----------|--------|
| **OpenAPI Linter** | `spectral` detects breaking changes in diff between API versions | Pipeline FAILS on breaking change without new version |
| **Response Headers** | Deprecated endpoints emit `Deprecation: true` and `Sunset: <date>` headers | Automated via middleware reading `api_versions` table |
| **Contract Registry** | `api_versions` table tracks active versions + sunset dates per tenant | Used for sunset enforcement and consumer notification |

---

### L-10: Secrets Never at Rest in App DB

**Statement:** API keys, OAuth secrets, PSP credentials, and any cryptographic secret must **not** be stored in Sovereign OS application database tables. All secrets must be stored in HashiCorp Vault with AES-256 encryption and automatic rotation.

**Rationale:** Database breaches must not expose secrets. Vault provides audited access, rotation, and revocation.

#### Forbidden Storage Patterns

```typescript
// ❌ FORBIDDEN: Secret in database column
await db.insert(integrations).values({
  tenant_id: tenantId,
  xendit_secret_key: 'xnd_production_...',  // NEVER DO THIS
});

// ❌ FORBIDDEN: Secret in environment variable shared across tenants
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;  // Multi-tenant violation

// ✅ CORRECT: Vault dynamic secret retrieval
const secret = await vault.read(`secret/tenant/${tenantId}/xendit`);
const xenditClient = new XenditClient(secret.data.api_key);
```

#### Vault Paths Convention

```
secret/tenant/{tenantId}/xendit        ← Xendit API keys per tenant
secret/tenant/{tenantId}/stripe        ← Stripe API keys per tenant
secret/system/jwt_signing_key          ← Platform-wide JWT signing key
secret/system/encryption_key           ← AES-256 key for QR payload encryption
secret/platform/supabase_service_role  ← Admin Supabase key (never in app)
```

#### Enforcement

| Layer | Mechanism | Action |
|-------|-----------|--------|
| **CI Secret Scan** | `gitleaks` + `trivy` secret detection | Pipeline FAILS on any hardcoded secret pattern |
| **Code Review** | Reviewer checklist: "Any secrets in column definitions or env files?" | PR BLOCKED |
| **Vault Audit Log** | Every Vault access logged; anomalies alerted | Security alert fired |
| **Rotation Policy** | Vault auto-rotates secrets every 90 days (or immediately on leak detection) | Automated; zero manual rotation required |

---

## Part 2: Enterprise Law Enforcement Summary

| Law | Mechanism Category | Automated? | Severity |
|-----|--------------------|-----------|---------|
| L-01 | CI static analysis + schema isolation | ✅ Yes | Pipeline FAIL |
| L-02 | Database trigger + migration linter | ✅ Yes | Transaction ROLLBACK |
| L-03 | Migration linter + RLS filter | ✅ Yes | Pipeline FAIL |
| L-04 | API middleware + DB constraint | ✅ Yes | 400 Error |
| L-05 | RLS policy + FK constraints | ✅ Yes | Query returns empty |
| L-06 | MCP tool registry + Approval stored proc | ✅ Yes | Tool call creates Approval |
| L-07 | PR review + stored proc mandates | Partial (code review) | Architecture violation |
| L-08 | Migration CI linter + PR checklist | ✅ Yes | Pipeline FAIL |
| L-09 | OpenAPI linter + response headers | ✅ Yes | Pipeline FAIL |
| L-10 | CI secret scan + Vault access | ✅ Yes | Pipeline FAIL |

---

## Part 3: Change Management — RFC & ADR Process

### 3.1 When to File an RFC

File a **Request for Constitution Change (RFC)** when proposing:
- Changes to any Enterprise Law (L-01 through L-10)
- Changes to canonical ontology (adding/removing entities in Volume 01)
- Introducing new technology into the ratified stack (Layer 3)
- Modifying the SEKB taxonomy (adding/removing volumes)
- Adding or modifying public API contracts in breaking ways

**Do NOT file RFC for:** Bug fixes, clarifications, adding examples, operational runbook updates.

### 3.2 RFC Process

```
Step 1: DRAFT
  → Author files RFC using template at architecture/rfc/RFC-TEMPLATE.md
  → Assigns reviewers from relevant domain owners

Step 2: UNDER REVIEW (minimum 5 business days)
  → Reviewers comment and vote in the RFC document
  → Author responds to concerns; revises draft if needed

Step 3: VOTE
  → Lead Architect + 2 ARB members must APPROVE
  → Any single REJECT from Lead Architect vetoes the RFC
  → ABSTAIN counts as non-objection (not a positive vote)

Step 4: ACCEPTED or REJECTED
  → If ACCEPTED: RFC status = ACCEPTED; author creates ADR within 10 business days
  → If REJECTED: RFC status = REJECTED; rejection reasoning documented

Step 5: ADR CREATED
  → ADR records the decision formally (immutable after status = ACCEPTED)
  → Implementation follows the ADR specification
```

### 3.3 When to Create an ADR

Create an **Architecture Decision Record (ADR)** when:
- An RFC is accepted (mandatory)
- A significant architectural pattern is chosen (e.g., "use pg-boss for outbox")
- A technology is added or removed from the stack
- An Enterprise Law enforcement mechanism is changed
- A decision is made that affects multiple bounded contexts
- AI agent interaction rules are modified (especially L-06)

**Template:** [architecture/adr/TEMPLATE.md](../architecture/adr/TEMPLATE.md)

### 3.4 ADR Numbering

```
ADR-001: SEKB Foundation Decision [ACCEPTED]
ADR-002: AI Safety L-06 MCP Tool Level Enforcement [ACCEPTED]
ADR-003: {Next decision} [PROPOSED]
...
```

ADRs are **numbered sequentially** and **immutable once accepted**. Superseding an ADR requires a new ADR that references the old one.

---

## Part 4: Audit Trail Specification

### 4.1 AuditStamp Value Object

Every database mutation must carry an `AuditStamp`. It is the foundational audit primitive.

```typescript
// Value Object (from Volume 01, Part 4.3)
interface AuditStamp {
  actor_id:   UUID;           // User.id or AIAgent.id
  actor_type: ActorType;      // 'USER' | 'AI_AGENT' | 'SYSTEM'
  timestamp:  TIMESTAMPTZ;    // UTC
  ip_address: IPAddress;      // Requestor IP (null for system actors)
  trace_id:   UUID;           // End-to-end trace identifier
}
```

### 4.2 Mandatory Audit Columns (All Business Tables)

```sql
-- These columns are MANDATORY on every business entity table
created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
created_by   UUID           REFERENCES profiles(id),
updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
updated_by   UUID           REFERENCES profiles(id),
deleted_at   TIMESTAMPTZ,
deleted_by   UUID           REFERENCES profiles(id)
```

### 4.3 Financial Audit Trail (Extended)

For financial tables (`journal_entries`, `payments`, `invoices`), additional immutable fields:

```sql
posted_at    TIMESTAMPTZ,   -- When entry was posted (immutable after set)
posted_by    UUID,          -- Who posted it (immutable)
voided_at    TIMESTAMPTZ,   -- When voided (if applicable)
voided_by    UUID,          -- Who voided it
reversal_of_id UUID         -- FK to original entry (for reversals only)
```

### 4.4 Domain Event Outbox (Audit Log)

Every domain event emitted is persisted in `domain_events` table before being dispatched:

```sql
CREATE TABLE domain_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    VARCHAR(100) NOT NULL,    -- e.g., 'JournalPosted'
  event_version VARCHAR(10)  NOT NULL DEFAULT 'v1',
  event_data    JSONB        NOT NULL,    -- Full payload including trace_id
  tenant_id     UUID         NOT NULL,
  trace_id      UUID         NOT NULL,
  emitted_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  dispatched_at TIMESTAMPTZ,             -- When pg-boss picked it up
  status        VARCHAR(20)  NOT NULL DEFAULT 'pending'  -- pending | dispatched | failed
);
```

This table serves as:
- **Audit log**: Every business event is permanently recorded
- **Outbox buffer**: pg-boss reads from this table to dispatch to consumers
- **Replay source**: Failed consumers can replay from this table

---

## Part 5: Data Governance & PII Classification

### 5.1 PII Classification Matrix

| Field | Classification | Table | Handling |
|-------|---------------|-------|---------|
| `email` | **PII — High** | `profiles`, `customers`, `suppliers` | Encrypted at rest (AES-256); never logged; GDPR erasure anonymizes |
| `full_name` | **PII — Medium** | `profiles`, `customers` | Searchable but masked in logs; GDPR anonymization available |
| `phone` | **PII — Medium** | `profiles`, `customers`, `suppliers` | Encrypted; E.164 format; GDPR erasure anonymizes |
| `ip_address` | **PII — Low** | Audit stamps | Stored as `inet`; purged after 90 days from hot tables |
| `holder_name` | **PII — Medium** | `access_passes` | AccessPass holder; anonymized on GDPR erasure |
| `secure_qr_hash` | **Non-PII (cryptographic)** | `access_passes` | SHA-256 hash; not personally identifiable |
| `amount` | **Non-PII (financial)** | `journal_lines`, `payments` | Financial data; not PII but regulated under financial law |
| `address` | **PII — Medium** | `facilities`, `customers` | Facility addresses not PII; customer billing addresses are |

### 5.2 PII Handling Rules

1. **Storage**: PII fields must use column-level encryption where classified as High. Use Vault-managed encryption keys.
2. **Logging**: Never log PII in application logs. Use `[REDACTED]` or masked format. Enforce via OpenTelemetry attribute redaction.
3. **API Responses**: PII fields excluded from analytics/reporting APIs. Projection layer filters PII from non-privileged roles.
4. **Transfer**: PII may not leave the tenant's data boundary without explicit consent (tenant + customer).
5. **Retention**: Default retention is 7 years for financial data; 2 years for operational data. PII of churned customers is anonymized after 2 years of inactivity.

### 5.3 Data Retention Schedule

| Data Category | Retention Period | Action After Expiry | Authority |
|--------------|-----------------|---------------------|----------|
| Financial records (JournalEntry, Invoice, Payment) | 7 years | Archive to cold storage; never delete | SOX, IFRS |
| Booking records | 5 years | Archive to cold storage | Operational |
| AccessPass records | 3 years | Archive, then anonymize holder data | Operational |
| Audit logs (domain_events) | 7 years | Archive to cold storage | Regulatory |
| Application logs | 90 days | Purge (except incidents: 1 year) | GDPR |
| AI interaction logs (MCP calls) | 1 year | Purge | Operational |
| Personally identifiable data of churned customers | 2 years post-churn | Anonymize in place | GDPR |

### 5.4 Legal Hold Policy

When a legal hold is applied (`LegalHoldApplied` event emitted):
- All data mutations for the affected tenant are **blocked** (reads remain allowed)
- Soft-delete operations are **blocked** (cannot delete under legal hold)
- Retention schedules are **suspended** (data cannot be archived or anonymized)
- Hold continues until `LegalHoldReleased` event is emitted by a `compliance:admin` actor
- All hold-related events are logged in the compliance audit trail

---

## Part 6: Multi-Tenant Isolation Verification

### 6.1 Isolation Levels

| Level | Mechanism | Scope |
|-------|-----------|-------|
| **Network** | Tenant-scoped API routes; tenant_id extracted from JWT | All HTTP requests |
| **Application** | `TenantContext` injected at middleware; every repository call carries tenant_id | All domain operations |
| **Database** | Row-Level Security (RLS) policies on 100% of business tables | All SQL queries |
| **Encryption** | Tenant-specific encryption keys (via Vault) for sensitive fields | High-PII columns |

### 6.2 RLS Verification Checklist

Before any new table goes to production, verify:
- [ ] `tenant_id` column present OR FK chain to `tenant_id` documented
- [ ] RLS policy created: `tenant_isolation_{table_name}`
- [ ] Policy filters: `tenant_id = auth.jwt()->>'tenant_id'::uuid` (or equivalent FK traversal)
- [ ] Policy applied to ALL operations (SELECT, INSERT, UPDATE, DELETE)
- [ ] RLS tested with two-tenant isolation test (data of tenant A invisible to tenant B)
- [ ] `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;` executed
- [ ] `ALTER TABLE {table} FORCE ROW LEVEL SECURITY;` executed (applies to table owners too)

### 6.3 Two-Tenant Isolation Test (Required)

```sql
-- Test: Tenant A data must be invisible to Tenant B's session

-- Setup
SET app.tenant_id = 'tenant-a-uuid';
INSERT INTO bookings (id, tenant_id, ...) VALUES ('booking-1', 'tenant-a-uuid', ...);

-- Test
SET app.tenant_id = 'tenant-b-uuid';
SELECT * FROM bookings WHERE id = 'booking-1';
-- Expected result: 0 rows (RLS blocks it)

-- Verify
ASSERT (SELECT COUNT(*) FROM bookings WHERE id = 'booking-1') = 0;
```

This test must be present in the test suite for every new table before production deployment.

---

## Part 7: Compliance & Regulatory Reference

### 7.1 Regulatory Alignment

| Regulation | Requirement | Sovereign OS Implementation |
|-----------|-------------|----------------------------|
| **GDPR** | Right to erasure | Soft-delete + PII anonymization (not physical deletion) |
| **GDPR** | Data portability | Export API per tenant (tenant data export in JSON/CSV) |
| **GDPR** | Consent management | `consent_records` table (future scope); current: explicit Membership model |
| **GDPR** | Breach notification | Security incident process triggers within 72 hours |
| **SOX** | Immutable financial records | L-02 enforcement; append-only ledger |
| **SOX** | Audit trail | `domain_events` outbox + `audit_stamps` on all mutations |
| **PCI-DSS** | No card data at rest | Payment card data never stored; routed directly to PSP (Stripe/Xendit) |
| **PCI-DSS** | Tokenization | PSP tokens stored (not raw card numbers); Vault for API credentials (L-10) |
| **PDPA (Indonesia)** | Personal data protection | Aligned to GDPR controls; local DPO designation required |

### 7.2 Pre-Audit Checklist

Before a compliance or security audit, verify:

**Financial Controls**
- [ ] L-02 immutable triggers active on all financial tables
- [ ] `post_ledger_transaction()` stored procedure is the only posting path
- [ ] Double-entry balance constraint tested and passing
- [ ] Reversal entry pattern used for all corrections (no destructive updates)

**Data Isolation**
- [ ] RLS active on 100% of 38+ tables
- [ ] Two-tenant isolation tests passing in CI
- [ ] No cross-tenant data leak in last 90 days of audit logs

**Access Control**
- [ ] No hardcoded secrets in codebase (`gitleaks` clean)
- [ ] Vault rotation schedule up-to-date (< 90 days since last rotation)
- [ ] All privileged actions logged with actor_id + trace_id

**AI Safety**
- [ ] MCP tool registry reviewed: no Level 0 tools accessible to AI agents
- [ ] All Level 1 tool invocations created Approval records (verify in approvals table)
- [ ] No direct DML from AI context in last 90 days

**API Governance**
- [ ] All deprecated API versions have sunset notices active
- [ ] OpenAPI specs up-to-date and versioned
- [ ] No breaking changes deployed without version bump

---

## Part 8: Security Policies

### 8.1 Zero Trust Architecture

Sovereign OS enforces Zero Trust at seven layers:

| Layer | Control | Implemented By |
|-------|---------|---------------|
| 1. Network/Edge | WAF + DDoS protection + mTLS | Cloudflare / Vercel Edge |
| 2. API Gateway | JWT validation + rate limiting + schema validation | Next.js middleware + Zod |
| 3. Authorization | RBAC + ABAC evaluation | Cerbos sidecar |
| 4. Application | Tenant context enforcement + Command Handler invariants | Application layer |
| 5. Database | RLS on all tables + immutable triggers | PostgreSQL |
| 6. Secrets | Vault dynamic secrets + AES-256 at rest | HashiCorp Vault |
| 7. Supply Chain | SBOM + SLSA provenance + Trivy + Dependabot | CI/CD pipeline |

### 8.2 Secrets Rotation Policy

| Secret Type | Rotation Period | Trigger Events |
|------------|----------------|---------------|
| PSP API keys | 90 days | Automatic + on any suspected leak |
| JWT signing keys | 180 days | Automatic + on any employee departure |
| Database passwords | 90 days | Automatic via Vault |
| OAuth client secrets | 180 days | Automatic |
| Encryption keys (AES-256) | 365 days | Manual (key ceremony required) |

### 8.3 Incident Response (Security Events)

```
SEVERITY 1 (Critical): Financial data leak, cross-tenant data access, AI bypass of L-06
  → Immediate: Block affected API routes
  → 15 minutes: Notify Lead Architect + Security Lead
  → 1 hour: Incident Commander assigned; post-incident ADR required
  → 72 hours: Regulatory notification if PII breach (GDPR requirement)

SEVERITY 2 (High): Secret leaked to logs/code, RLS bypass attempt, DLQ overflow
  → 30 minutes: Alert on-call engineer
  → 2 hours: Mitigation deployed
  → 24 hours: Post-mortem scheduled

SEVERITY 3 (Medium): Idempotency key collision, schema drift, API rate limit breach
  → 4 hours: Alert assigned engineer
  → 48 hours: Fix deployed
  → Weekly: Reviewed in on-call sync
```

---

## Appendix A: Enterprise Law Quick Reference

| Law | One-Line Summary | Enforcement Layer |
|-----|-----------------|-------------------|
| L-01 | No cross-context SQL JOINs | CI lint + schema isolation |
| L-02 | Financial records are append-only | DB trigger + migration linter |
| L-03 | Soft delete everywhere (use deleted_at) | Migration linter + RLS |
| L-04 | All financial/booking mutations need idempotency key | API middleware + DB constraint |
| L-05 | Every entity must have a tenant owner | RLS + FK constraints |
| L-06 | AI agents cannot directly mutate material state | MCP tool levels + Approval workflow |
| L-07 | Mutations flow through Command Handlers / Stored Procedures | Code review + stored proc mandates |
| L-08 | Schema changes use Expand and Contract pattern | Migration CI linter |
| L-09 | API breaking changes require new version + 90-day sunset | OpenAPI linter + response headers |
| L-10 | Secrets stored in Vault; never in app DB or code | CI secret scan + Vault access |

---

## Appendix B: Governance Contacts

| Role | Responsibility | Contact |
|------|---------------|---------|
| Lead Architect | Layer 1 changes; ARB chair | architecture-leads@sovereign-os.internal |
| Compliance Lead | Volume 06 owner; GDPR/SOX; audit coordination | compliance@sovereign-os.internal |
| Security Architect | L-06, L-10 enforcement; incident response | security-team@sovereign-os.internal |
| Database Architect | Layer 2 changes; RLS; migration review | database-team@sovereign-os.internal |
| AI Engineering Lead | Volume 04 owner; MCP tool registry; L-06 | ai-team@sovereign-os.internal |
| SEKB Maintainers | Cross-volume consistency; terminology | sekb-maintainers@sovereign-os.internal |

---

**End of Volume 06**

*This volume is the governance backbone of Sovereign OS. Every Enterprise Law has teeth here — automated, auditable, and enforced at multiple layers. Compliance is not optional; it is architecturally enforced.*

*[Constitution Part 9] [Volume 01 Part 1] [ADR-001] [ADR-002] [EPXA Part 6 (implied)]*
