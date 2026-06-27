# Volume 10: Remediation & Roadmap

## Moventios Enterprise Knowledge Base

**Gap Resolution Audit, Technical Debt, Risk Register & Implementation Roadmap**

**Version:** 5.1-ENTERPRISE  
**Status:** LIVING DOCUMENT — Updated Quarterly  
**Date:** June 25, 2026  
**Authority:** Database SSOT Section 12 | EPXA Part 8 | Constitution Part 22 (ADR Manifest)  
**Owner:** Architecture Board (EAB) — Quarterly Review

---

## Overview

> **Canonical Source:** Gap tracking references [00-SEKB-AUDIT-MAPPING-CLEANUP-PLAN.md](../00-SEKB-AUDIT-MAPPING-CLEANUP-PLAN.md) and ADR-003. Technology replacement horizon and Layer decisions are in Layer-3 and the Constitution.

Volume 10 is the **operational health dashboard** of the Moventios platform. It is the only volume that is explicitly a living document with quarterly update cadence.

It answers:

- What gaps existed and how were they resolved?
- What technical debt remains and what is the backlog priority?
- What risks exist and what are the mitigations?
- When should we replace OSS components?
- What is the 12-month implementation roadmap?

**Key Principle:** This volume is not a blame log. It is a **forward-looking** instrument for architectural hygiene.

---

## Part 1: Gap Resolution Audit

### 1.1 Summary

All identified gaps from the v5.0.1 architectural review have been resolved in v5.0.2 / v5.1. This section provides the proof of resolution for each gap.

**Total Gaps Identified:** 19+  
**Total Resolved:** 19  
**Outstanding:** 0 (as of v5.1)

---

### 1.2 Gap Resolution Registry

| Gap ID     | Description                                                                              | Status      | Resolved In | Evidence                                                                                |
| ---------- | ---------------------------------------------------------------------------------------- | ----------- | ----------- | --------------------------------------------------------------------------------------- |
| **GAP-1**  | Missing `rejected` and `expired` states in `booking_state` and `access_pass_state` enums | ✅ RESOLVED | v5.0.2      | Volume 01 Part 3.1 + 3.3; Constitution Part 12                                          |
| **GAP-2**  | `payment_state` enum incomplete (missing `processing`, `refund_settled`)                 | ✅ RESOLVED | v5.0.2      | Volume 01 Part 3.7; Constitution Part 12.2                                              |
| **GAP-3**  | `journal_state` enum missing from Layer 2                                                | ✅ RESOLVED | v5.0.2      | Volume 01 Part 3.8; Layer 2 SSOT Section 4                                              |
| **GAP-4**  | `Asset` entity defined in Constitution but missing from Database SSOT                    | ✅ RESOLVED | v5.0.2      | Volume 01 Part 2.2 (Asset entity); `assets` table in Layer 2                            |
| **GAP-5**  | `Campaign` entity missing from Database SSOT and Layer 3                                 | ✅ RESOLVED | v5.0.2      | Volume 01 Part 2.3 (Campaign); `campaigns` table + `campaign_state` enum                |
| **GAP-6**  | `Supplier` entity missing from Database SSOT                                             | ✅ RESOLVED | v5.0.2      | Volume 01 Part 2.1 (Supplier); `suppliers` table in Layer 2                             |
| **GAP-7**  | No audit trail table for `Booking` status transitions                                    | ✅ RESOLVED | v5.0.2      | Volume 01 Part 2.2 (BookingHistory); `booking_histories` table                          |
| **GAP-8**  | `Invoice` and `Payment` entities under-specified; missing state machine                  | ✅ RESOLVED | v5.0.2      | Constitution Part 12.2 + 12.4 (complete state machines); Volume 01 Part 2.4             |
| **GAP-9**  | `Prompt` entity missing from Database SSOT                                               | ✅ RESOLVED | v5.0.2      | Volume 01 Part 2.6 (Prompt); `prompts` table in Layer 2                                 |
| **GAP-10** | `AccessPass` aggregate boundary unclear; lifecycle incomplete                            | ✅ RESOLVED | v5.0.2      | Constitution Part 12.3 (complete state machine); Volume 01 Part 2.3                     |
| **GAP-11** | `AIAgent` entity missing from Database SSOT                                              | ✅ RESOLVED | v5.0.2      | Volume 01 Part 2.6 (AIAgent); `ai_agents` table in Layer 2                              |
| **GAP-12** | `JournalEntry` missing `reversal_of_id` column for reversal linkage                      | ✅ RESOLVED | v5.0.2      | Volume 01 Part 2.4 (JournalEntry key fields); `reversal_of_id` in Layer 2               |
| **GAP-13** | Command catalog incomplete (Payment domain missing `ReconcilePayment`)                   | ✅ RESOLVED | v5.0.2      | Constitution Part 13.5 (Command↔Event mapping table); `ReconcilePayment` added          |
| **GAP-14** | `WorkflowInstance` state machine lacked `Aborted` terminal state                         | ✅ RESOLVED | v5.0.2      | Constitution Part 12.5 (complete state machine with Aborted)                            |
| **GAP-15** | HNSW index for `embeddings` not specified (only mentioned pgvector)                      | ✅ RESOLVED | v5.0.2      | Volume 01 Part 2.6 (Embedding index spec); Layer 2 schema                               |
| **GAP-16** | `ip_address` type unspecified (VARCHAR vs. PostgreSQL inet type)                         | ✅ RESOLVED | v5.0.2      | Volume 01 Part 4.3 (IPAddress value object using PostgreSQL `inet` type)                |
| **GAP-17** | Cross-layer terminology drift: `AccessPassReserved` vs. `AccessPassIssued`               | ✅ RESOLVED | v5.0.2      | Constitution Part 13.3; Volume 01 Part 5 (Terminological Reconciliation Matrix)         |
| **GAP-18** | `PaymentProcessing` mid-state event missing from Domain Event Catalog                    | ✅ RESOLVED | v5.0.2      | Constitution Part 13.4 (`PaymentProcessing` event added with payload)                   |
| **GAP-19** | Layer 1 Command taxonomy incomplete (no AI domain commands)                              | ✅ RESOLVED | v5.0.2      | Constitution Part 13.5 (`GenerateRecommendation`, `IndexDocument`, `GenerateEmbedding`) |

---

### 1.3 Gap Resolution Evidence Location

| Gap Range        | Primary Evidence Document                             | Section                      |
| ---------------- | ----------------------------------------------------- | ---------------------------- |
| GAP-1 to GAP-3   | Volume 01 — Foundations                               | Part 3 (State Machine Enums) |
| GAP-4 to GAP-7   | Volume 01 — Foundations                               | Part 2 (Entity Registry)     |
| GAP-8 to GAP-14  | Layer 1 Constitution v5.0.2                           | Parts 12, 13, 13.5           |
| GAP-15 to GAP-16 | Volume 01 — Foundations                               | Part 4 (Value Objects)       |
| GAP-17 to GAP-19 | Volume 01 Part 5 (Reconciliation) + Layer 1 Part 13.5 | —                            |

---

## Part 2: Technical Debt Inventory

### 2.1 Current Technical Debt (v5.1)

Technical debt is ranked by **impact × effort** (H=High, M=Medium, L=Low).

| ID         | Debt Item                                                                                         | Impact | Effort | Priority            | Owner                | Target Version                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------- | ------ | ------ | ------------------- | -------------------- | ------------------------------------------------------------------------------- |
| **TD-001** | ~~Layer 3 EPXA still has duplicate sections in old `02_engineering-kb.md` file~~                  | M      | L      | ~~P1~~ **RESOLVED** | Platform Engineering | v5.1.1 — `02_engineering-kb.md` archived to `archive/` per ADR-003 (2026-06-25) |
| **TD-002** | Traceability chains in EPXA: only 1 of 6 full-stack chains documented (Access Pass Issuance only) | H      | M      | **P1**              | Platform Engineering | v5.2                                                                            |
| **TD-003** | EventCatalog integration (automated generation from code) not yet implemented; catalog is manual  | H      | H      | **P2**              | Platform Engineering | v5.2                                                                            |
| **TD-004** | OpenAPI specs for all 6 bounded context APIs not yet generated; only informal contracts           | H      | M      | **P2**              | API Platform Team    | v5.2                                                                            |
| **TD-005** | Cerbos ABAC policies only partially specified; RLS-only for simple flows                          | M      | M      | **P2**              | Security Team        | v5.2                                                                            |
| **TD-006** | Semantic cache table (`semantic_cache`) schema not in Layer 2 SSOT                                | M      | L      | **P3**              | AI Engineering       | v5.1.2                                                                          |
| **TD-007** | `mcp_tool_registry` table schema not in Layer 2 SSOT                                              | M      | L      | **P3**              | AI Engineering       | v5.1.2                                                                          |
| **TD-008** | `ai_usage_records` table schema not in Layer 2 SSOT                                               | M      | L      | **P3**              | AI Engineering       | v5.1.2                                                                          |
| **TD-009** | Runbook catalog (Volume 05 Part 6) references runbooks that do not exist yet                      | H      | M      | **P1**              | SRE Team             | v5.1.1                                                                          |
| **TD-010** | Volume 09 (Reserved) is a stub — not yet assigned purpose                                         | L      | L      | **P3**              | EAB                  | v6.0                                                                            |

### 2.2 Debt Remediation Process

For each technical debt item:

1. File issue in architecture backlog with reference to this table (TD-XXX)
2. Estimate effort in Volume 10 next quarterly review
3. Assign to volume owner
4. Track completion in quarterly Volume 10 update

---

## Part 3: Risk Register

### 3.1 Operational Risks

| ID        | Risk                                                                              | Probability | Impact   | Severity     | Mitigation                                                                                                                                                          | Owner                     |
| --------- | --------------------------------------------------------------------------------- | ----------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| **R-001** | Next.js Server Actions error leakage (uncaught errors expose internal logic)      | Medium      | High     | **HIGH**     | Wrap all Server Actions in `safeAction` HOC with `Result<T, E>` pattern; sanitize error messages before returning to client                                         | Platform Engineering      |
| **R-002** | pgvector HNSW index build blocks concurrent writes during bulk document ingestion | Medium      | Medium   | **MEDIUM**   | Route batch ingestion to async pg-boss worker during low-traffic windows (02:00–06:00 UTC); monitor index build duration                                            | AI Engineering            |
| **R-003** | Webhook delivery failure from payment providers (Xendit/Stripe/Midtrans)          | Medium      | High     | **HIGH**     | Webhook ACL: immediate HTTP 200 ACK + push to internal reliable queue (pg-boss); retry with exponential backoff (max 5 attempts, 24h window); DLQ for manual review | Platform Engineering      |
| **R-004** | AI agent prompt injection / jailbreak attempt                                     | Low         | High     | **HIGH**     | Constitutional system prompt prepended to all messages; `jailbreak_prevention` guardrail active on all prompts; security audit on prompt registry quarterly         | Security + AI Engineering |
| **R-005** | Cross-tenant data leak via RLS misconfiguration                                   | Low         | Critical | **CRITICAL** | Two-tenant isolation test in CI (required for every new table); quarterly RLS audit; FORCE ROW LEVEL SECURITY on all tables                                         | Database Architect        |
| **R-006** | Trigger.dev scaling limitation at high workflow volume                            | Low         | Medium   | **MEDIUM**   | Monitor workflow instance creation rate; threshold: 100K/day triggers Temporal migration planning; see OSS Replacement Horizon                                      | Platform Engineering      |
| **R-007** | Supabase Auth token size limits with complex claims                               | Low         | Low      | **LOW**      | Keep JWT claims minimal (tenant_id, role, user_id only); use Cerbos for complex permission resolution                                                               | Security Team             |
| **R-008** | OpenRouter rate limiting or provider outage during peak load                      | Medium      | Medium   | **MEDIUM**   | Multi-model fallback chain (see Volume 04 Part 5.3); semantic cache absorbs repeated queries; graceful degradation to cached responses                              | AI Engineering            |

### 3.2 Architectural Risks

| ID         | Risk                                                                         | Current Mitigation                                                    | Escalation Trigger                                      |
| ---------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------- |
| **AR-001** | Event schema drift: producers and consumers become out of sync               | AsyncAPI specs + EventCatalog (TD-003); versioned events (v1, v2)     | > 3 consumers on deprecated event version for > 30 days |
| **AR-002** | Aggregate boundary erosion over time                                         | Volume 01 canonical entity registry; code review checklist            | Domain entity found in wrong bounded context table      |
| **AR-003** | L-02 trigger disabled accidentally during migration                          | Migration CI gate blocks trigger DROP; two-person review on migration | Any modification to `journal_entry_immutable` trigger   |
| **AR-004** | Idempotency key collision (different operations, same key, different tenant) | UNIQUE constraint is `(tenant_id, idempotency_key)` — tenant-scoped   | 409 Conflict rate on financial routes > 0.1%            |

---

## Part 4: OSS Replacement Horizon

### 4.1 Technology Replacement Matrix

These are **planned, conditional replacements** — not current actions. Each has a trigger condition that activates the replacement plan.

| Current Technology  | Replacement                             | Trigger Condition                                                                    | Estimated Effort | Lead Time                  |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------ | ---------------- | -------------------------- |
| **Trigger.dev**     | Temporal.io                             | Workflow instances > 1M/day OR cross-language saga orchestration required            | 8-12 weeks       | Plan at 500K/day           |
| **Supabase Auth**   | Keycloak or Ory Kratos                  | Enterprise B2B customers require complex on-premise SAML/AD federation               | 12-16 weeks      | Plan at 5+ SAML requests   |
| **Vercel compute**  | Go microservices on Kubernetes / Fly.io | API compute cost exceeds unit economics target (> 40% revenue)                       | 16-24 weeks      | Plan at 30% threshold      |
| **pgvector (HNSW)** | Qdrant or Milvus                        | Embedding count > 50M per tenant OR sub-millisecond ANN required                     | 8-12 weeks       | Monitor at 10M vectors     |
| **Typesense**       | Meilisearch (MIT license)               | Typesense GPL license becomes problematic in core paths                              | 4-6 weeks        | Immediate if license issue |
| **OpenRouter**      | LiteLLM (self-hosted)                   | OpenRouter SLA < 99.5% in 30-day window OR cost > 60% of AI budget                   | 4-8 weeks        | Plan at 99.7% SLA          |
| **pg-boss**         | NATS JetStream or BullMQ                | Event throughput > 10K events/second sustained                                       | 8-10 weeks       | Plan at 5K/second          |
| **Drizzle ORM**     | Raw pg driver / SQLx (Go)               | Complex query requirements that Drizzle cannot express; or Go microservice migration | 6-8 weeks        | On Go migration trigger    |

### 4.2 Replacement Decision Process

When a trigger condition is reached:

1. **Alert**: Volume 10 quarterly review flags the condition
2. **RFC Filed**: RFC-XXX proposing the migration (architecture/rfc/)
3. **Spike**: 2-week engineering spike to validate replacement
4. **ADR Created**: Records decision to proceed or defer
5. **Migration Plan**: Detailed phased plan with rollback strategy
6. **Execution**: Implement using Expand/Contract (L-08 compliant)

---

## Part 5: Performance Optimization Paths

### 5.1 Current Performance Baselines (v5.1)

| Operation                     | p50   | p95 Target | p99 Target | Current Status |
| ----------------------------- | ----- | ---------- | ---------- | -------------- |
| Booking submit                | 80ms  | 200ms      | 500ms      | ✅ On target   |
| Payment capture (webhook ACL) | 150ms | 400ms      | 1000ms     | ✅ On target   |
| Journal post                  | 100ms | 250ms      | 600ms      | ✅ On target   |
| Access pass issuance          | 120ms | 300ms      | 700ms      | ✅ On target   |
| RAG retrieval (hybrid search) | 80ms  | 200ms      | 400ms      | ✅ On target   |
| LLM inference (cached)        | 400ms | 1500ms     | 3000ms     | ✅ On target   |
| Ledger summary view (read)    | 20ms  | 100ms      | 300ms      | ✅ On target   |

### 5.2 Optimization Backlog

| Optimization                                    | Current State   | Target State                     | Expected Gain                                  | Priority        |
| ----------------------------------------------- | --------------- | -------------------------------- | ---------------------------------------------- | --------------- |
| Materialized view refresh (async debounce)      | 5s debounce     | 2s debounce                      | 60% latency reduction on high-frequency events | P2              |
| Embedding batch size increase                   | 100 chunks/call | 500 chunks/call                  | 5x ingestion throughput                        | P3              |
| HNSW `ef_search` tuning                         | Default (40)    | 80                               | 15% recall improvement at 20% latency cost     | P2              |
| Connection pooling (pgBouncer transaction mode) | Session mode    | Transaction mode                 | 3x connection efficiency                       | P1              |
| Valkey semantic cache warm-up                   | Cold on deploy  | Warm (pre-loaded common queries) | 30% cache hit rate improvement                 | P2              |
| Go microservice for Ledger domain               | Next.js edge    | Go service                       | Sub-ms financial invariant validation          | P2 (post-scale) |

---

## Part 6: Quarterly Review Schedule

### 6.1 Review Cadence

**Quarterly Review Date:** Last Friday of each quarter (Q1: March, Q2: June, Q3: September, Q4: December)

**Review Duration:** 3 hours

**Participants:**

- Lead Architect (required)
- Volume owners for Volumes 03-10 (required)
- Security Architect (required)
- AI Engineering Lead (required)
- Product Lead (invited)

### 6.2 Quarterly Review Checklist

**Architecture Health:**

- [ ] Review all open technical debt items (Part 2) — update status, priority
- [ ] Review risk register (Part 3) — any risks that escalated?
- [ ] Check OSS replacement triggers (Part 4) — any thresholds breached?
- [ ] Review ADR manifest — any decisions that need revisiting?

**Compliance Health:**

- [ ] RLS audit — any new tables missing RLS coverage?
- [ ] Secret rotation — all secrets within rotation schedule?
- [ ] L-06 audit — review Approval creation logs; any anomalies?
- [ ] Enterprise Law CI gates — all passing? Any false positives?

**Performance Health:**

- [ ] Review SLA attainment from last quarter (Volume 05 metrics)
- [ ] Identify any operations trending above p95 targets
- [ ] Activate any optimization backlog items needed

**AI Health:**

- [ ] Prompt eval score review — any prompts below 0.85?
- [ ] LLM cost trend — within budget?
- [ ] Token usage growth — budget adjustment needed?
- [ ] Level 1 Approval resolution time — within SLA?

**Roadmap:**

- [ ] Update 12-month roadmap (Part 7) with actual progress
- [ ] Reprioritize technical debt backlog
- [ ] Plan next quarter deliverables

### 6.3 Exit Criteria

Quarterly review is complete when:

- Volume 10 is updated with new status for all items
- Any new technical debt or risk is entered into registry
- Roadmap updated with actual progress markers
- Version bumped (5.1.N → 5.1.N+1)

---

## Part 7: 12-Month Implementation Roadmap

### 7.1 Roadmap (June 2026 — June 2027)

```
Q2 2026 (June): SEKB v5.1 Foundation Complete
  ✅ Volumes 00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10
  ✅ ADR-001, ADR-002
  ✅ Architecture/ADR/RFC directory structure
  ✅ Layer 1/2/3 harmonized to v5.0.2

Q3 2026 (July–September): SEKB v5.1.1 — Engineering Blueprint Completion
  🔲 03-engineering.md (clean v5.1 version replacing old kb)
  🔲 EventCatalog integration (TD-003 partial)
  🔲 OpenAPI specs for all 6 bounded context APIs (TD-004)
  🔲 Layer 2: Add mcp_tool_registry, ai_usage_records, semantic_cache tables (TD-006/7/8)
  🔲 Production runbook library (TD-009)

Q4 2026 (October–December): SEKB v5.2 — Living Catalogs
  🔲 Automated Event Catalog (generated from code + AsyncAPI)
  🔲 MCP Tool Registry UI (admin console for managing AI tools)
  🔲 Prompt Registry UI (version management, eval harness)
  🔲 5 additional full-stack traceability chains (TD-002)
  🔲 CI/CD SEKB gates (terminology check, cross-reference validator, enum audit)
  🔲 Cerbos ABAC policy complete specification (TD-005)

Q1 2027 (January–March): SEKB v5.2.1 — AI-Native Optimization
  🔲 Structured JSONB exports for AI agent knowledge base ingestion
  🔲 Prompt evaluation harness (RAGAS-style automated scoring)
  🔲 Agent memory patterns (conversation history windowing, context management)
  🔲 AI cost attribution dashboard
  🔲 Performance optimization backlog (pgBouncer transaction mode, HNSW tuning)

Q2 2027 (April–June): SEKB v6.0 — Autonomous Agent Ready
  🔲 Full agentic loop support (multi-step reasoning with Approval orchestration)
  🔲 Volume 09 assigned purpose (domain-specific deep dive)
  🔲 Architecture review of scaling thresholds (R-006 trigger assessment)
  🔲 Go microservice proof of concept for Finance domain (if scale warrants)
  🔲 SEKB v6.0 ratification — 10-year horizon review
```

### 7.2 Immediate Actions (Week 1 — Current Sprint)

| Action                                                  | Owner                | Target        |
| ------------------------------------------------------- | -------------------- | ------------- |
| Create `03-engineering.md` clean v5.1                   | Platform Engineering | June 30, 2026 |
| Add missing tables to Layer 2 SSOT (TD-006/7/8)         | Database Architect   | July 5, 2026  |
| Begin production runbook templates (TD-009)             | SRE Lead             | July 7, 2026  |
| Configure `gitleaks` in CI pipeline (L-10)              | Security Team        | June 28, 2026 |
| Enable `FORCE ROW LEVEL SECURITY` on all tables (R-005) | Database Architect   | June 28, 2026 |

---

## Part 8: Dependency Management

### 8.1 Library Upgrade Policy

| Severity              | Upgrade Window | Process                                                         |
| --------------------- | -------------- | --------------------------------------------------------------- |
| **Critical Security** | 24 hours       | Emergency patch; bypass standard PR review; post-deployment ADR |
| **High Security**     | 1 week         | Expedited PR review; no RFC needed                              |
| **Medium Security**   | 2 weeks        | Standard PR review                                              |
| **Feature / Minor**   | Monthly batch  | Batched upgrade PR; Dependabot PRs grouped                      |
| **Major Version**     | Quarterly      | RFC if breaking changes; spike before upgrade                   |

### 8.2 Dependabot Configuration

```yaml
# .github/dependabot.yml (recommended)
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
    groups:
      security-updates:
        update-types: [security]
      production-dependencies:
        dependency-type: production
    ignore:
      - dependency-name: '*'
        update-types: [version-update:semver-major] # Major: quarterly review only
```

### 8.3 License Scanning

```bash
# CI gate: license compliance (run on every PR)
npx license-checker --production --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;PostgreSQL" \
  --excludePackages "typesense"  # Typesense GPL allowed (API-isolated)
```

---

## Appendix A: Gap Tracking Template

When a new gap is discovered:

```markdown
| GAP-{N} | {Brief description of the gap} | 🔲 OPEN | — | — |
```

Open a PR against Volume 10 with:

1. Gap entry in Part 1 registry (status: OPEN)
2. Technical debt entry in Part 2 (if applicable)
3. RFC filed (if constitution change required)
4. Resolution evidence added once resolved

---

**End of Volume 10**

_This volume is the honest mirror of the SEKB. Its job is to ensure we never forget our technical debt, never ignore our risks, and never miss the moment when our OSS choices need to evolve._

_Next quarterly review: September 2026_

_[Database SSOT Section 12] [EPXA Part 8] [Constitution Part 22] [ADR-001] [Volume 05, Part 8]_
