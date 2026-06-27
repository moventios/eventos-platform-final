# Volume 05: Operations & Reliability
## Moventios Enterprise Knowledge Base

**SRE Patterns, Observability, Disaster Recovery & Production Runbooks**

**Version:** 5.1-ENTERPRISE  
**Status:** RATIFIED  
**Date:** June 25, 2026  
**Authority:** Constitution Parts 18 (Observability & SLA) | EPXA Part 6 | Layer 2 (pg-boss, Outbox)  
**Owner:** SRE Lead

---

## Overview

> **Canonical Source:** Reliability principles and SLA model ada di [Layer-1-Constitution-v5.0.2.md](../Layer-1-Constitution-v5.0.2.md) Part 18 + Part 2.5. Technology observability choices di [Layer-3-EPXA-v5.1.md](../Layer-3-EPXA-v5.1.md).  
> Volume ini menyediakan **SRE runbooks, circuit breaker patterns, deployment strategies, dan production checklists** — practical operations content. Bila ada konflik, Layer-1 / Layer-3 menang.

Volume 05 defines the **operational and reliability standards** for Moventios. It translates the reliability principles from Layer 1 (Constitution Part 2.5 — Reliability & Scalability Principles) into concrete SRE practices, runbooks, and infrastructure patterns.

This volume governs:
- How the platform maintains SLAs under failure conditions
- How incidents are detected, escalated, and resolved
- How deployments are performed without downtime
- How observability data flows from user action to database query
- How the platform scales and when to trigger replacement plans

**SRE Philosophy at Moventios:** Every failure is expected. Every failure must be observable. Every failure must be recoverable deterministically.

---

## Part 1: Reliability Architecture

### 1.1 Golden Signals (RED Method)

Every service component is monitored against three golden signals:

| Signal | Metric | Alert Threshold | Dashboard |
|--------|--------|----------------|-----------|
| **Rate** | Requests per second (RPS) | > 200% of 7-day p95 baseline | ops-rps-dashboard |
| **Errors** | Error rate (4xx+5xx / total) | > 0.5% for financial routes; > 2% for read routes | ops-error-dashboard |
| **Duration** | Latency percentiles (p50/p95/p99) | p95 > 2x SLA target | ops-latency-dashboard |

### 1.2 SLA Targets by Operation

[Authority: Constitution Part 18.1]

| Operation | p50 | p95 | p99 | Error Budget |
|-----------|-----|-----|-----|-------------|
| Booking submit | 80ms | 200ms | 500ms | 0.1% errors/month |
| Payment capture (webhook) | 150ms | 400ms | 1000ms | 0.01% errors/month |
| Journal post | 100ms | 250ms | 600ms | 0.01% errors/month |
| Access pass issuance | 120ms | 300ms | 700ms | 0.1% errors/month |
| API read operations | 50ms | 150ms | 400ms | 0.5% errors/month |
| RAG search | 80ms | 200ms | 400ms | 1% errors/month |
| LLM inference | 800ms | 2500ms | 5000ms | 2% errors/month |

**Overall Platform SLA:** 99.9% uptime (8.77 hours downtime budget per year)

---

## Part 2: Resilience Patterns

### 2.1 Circuit Breaker Pattern

All external integration ports (payment gateways, OpenRouter, WhatsApp/Fonnte, Resend email) implement circuit breakers using the **opossum** library (Node.js) or equivalent Go pattern.

```typescript
import CircuitBreaker from 'opossum';

// Circuit breaker for Xendit payment adapter
const xenditCircuitBreaker = new CircuitBreaker(xenditCallFunction, {
  timeout: 10000,           // 10s timeout per call
  errorThresholdPercentage: 15,   // Open if 15% errors in window
  resetTimeout: 30000,      // Try again after 30 seconds
  volumeThreshold: 10,      // Minimum calls before tracking errors
  rollingCountTimeout: 30000  // 30-second rolling window
});

// Events (emit to OpenTelemetry)
xenditCircuitBreaker.on('open', () => {
  telemetry.emit('circuit_breaker.opened', { integration: 'xendit' });
  alerting.fire('IntegrationDegraded', { integration: 'xendit', severity: 'high' });
});

xenditCircuitBreaker.on('halfOpen', () => {
  telemetry.emit('circuit_breaker.half_open', { integration: 'xendit' });
});

xenditCircuitBreaker.on('close', () => {
  telemetry.emit('circuit_breaker.closed', { integration: 'xendit' });
});
```

**Circuit Breaker Thresholds:**

| Integration | Error Threshold | Reset Timeout | Timeout |
|------------|----------------|--------------|---------|
| Xendit (PSP) | 15% | 30s | 10s |
| Stripe (PSP) | 15% | 30s | 10s |
| Midtrans (PSP) | 15% | 30s | 10s |
| OpenRouter (LLM) | 20% | 60s | 30s |
| Resend (Email) | 25% | 120s | 5s |
| Fonnte (WhatsApp) | 25% | 120s | 5s |
| Typesense (Search) | 30% | 30s | 3s |

### 2.2 Dead Letter Queue (DLQ) — Failed pg-boss Jobs

```sql
-- DLQ table for failed pg-boss jobs (pg-boss native feature)
-- Automatically populated when job fails max_retries times

-- Query: review DLQ entries
SELECT
  id,
  name AS job_type,
  data AS job_payload,
  fail_count,
  failed_on,
  expire_in
FROM pgboss.dead
WHERE created_on > NOW() - INTERVAL '24 hours'
ORDER BY failed_on DESC;

-- DLQ Alert: fire when DLQ depth > 10 items in 1 hour
SELECT COUNT(*) FROM pgboss.dead
WHERE created_on > NOW() - INTERVAL '1 hour';
```

**DLQ Response Protocol:**
1. Alert fires when DLQ depth > 10 (5-minute window)
2. On-call engineer reviews failed job types
3. If financial domain (JournalPosted, PaymentCaptured): immediate escalation
4. Root cause logged in incident report
5. Manual replay after root cause fixed:
   ```bash
   # Replay specific job type from DLQ
   scripts/replay-dlq-jobs.sh --job-type=JournalPosted --since=2026-06-25T00:00:00Z
   ```

### 2.3 Retry Policy

**Exponential Backoff (Standard)**

```typescript
const RETRY_POLICY = {
  financial: {
    maxAttempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,       // Start: 1s
      factor: 2,         // Doubles each attempt: 1s, 2s, 4s, 8s, 16s
      maxDelay: 30000    // Cap at 30s
    }
  },
  notification: {
    maxAttempts: 3,
    backoff: { type: 'linear', delay: 5000 }
  },
  analytics: {
    maxAttempts: 2,
    backoff: { type: 'linear', delay: 10000 }
  }
};
```

### 2.4 Idempotency Registry

[Authority: L-04 — Idempotency Mandate]

```typescript
// Valkey idempotency key storage
const IDEMPOTENCY_TTL = 86400;  // 24 hours

class IdempotencyRegistry {
  async checkAndSet(
    tenantId: UUID,
    key: string,
    response: object
  ): Promise<{ isNew: boolean; response: object }> {
    const cacheKey = `idempotency:${tenantId}:${key}`;
    
    // Atomic check-and-set (prevents race condition)
    const existing = await valkey.get(cacheKey);
    if (existing) {
      return { isNew: false, response: JSON.parse(existing) };
    }
    
    // Store response for future duplicate requests
    await valkey.setex(cacheKey, IDEMPOTENCY_TTL, JSON.stringify(response));
    return { isNew: true, response };
  }
}
```

---

## Part 3: Disaster Recovery

### 3.1 Recovery Objectives

[Authority: Constitution Part 2.5]

| Objective | Target | Measurement |
|-----------|--------|-------------|
| **RTO** (Recovery Time Objective) | < 15 minutes | Time from incident detection to service restoration |
| **RPO** (Recovery Point Objective) | < 5 minutes | Maximum data loss in the event of a failure |

### 3.2 Backup Strategy

**PostgreSQL (Supabase Managed)**
- **WAL Archiving**: Continuous WAL archiving to S3 (enables Point-in-Time Recovery)
- **Base Backups**: Daily full backup at 03:00 UTC
- **PITR Window**: 30-day recovery window
- **Cross-Region**: Backup replicated to secondary region

**Valkey (Cache)**
- **RDB Snapshots**: Every 60 seconds for financial-adjacent data
- **AOF**: Enabled for idempotency registry (prevents duplicate processing after restart)
- **Recovery**: Cache misses on restart are acceptable (warm-up from DB within 5 minutes)

### 3.3 Disaster Recovery Playbook

**Scenario 1: Database Primary Failure**
```
T+0:  Alert fires (connection refused to primary)
T+2:  Supabase auto-promotes read replica to primary
T+5:  Application health checks detect new primary endpoint
T+7:  Connection pools re-established; traffic flowing
T+15: Full validation: run SELECT 1 on all 38 tables; verify RLS active
T+20: Post-incident report opened in Notion; ADR filed if architecture change required
```

**Scenario 2: Complete Region Failure**
```
T+0:  Alert fires (all health checks fail)
T+2:  Incident Commander paged (on-call lead)
T+5:  Decision: failover to DR region
T+8:  DNS cutover to DR region endpoint
T+10: Verify PITR recovery (replay WAL from last clean checkpoint)
T+15: Service restored; RPO validated (< 5 minutes data loss)
T+60: Post-mortem scheduled; root cause analysis
```

**Scenario 3: Data Corruption (L-02 Violation Attempt)**
```
T+0:  Immutable trigger fires; exception raised; transaction rolled back
T+0:  Alert fires: "L-02 VIOLATION ATTEMPT on journal_entries"
T+2:  Security team paged (potential attack vector)
T+5:  Audit log reviewed: actor_id + trace_id identified
T+10: Actor's session terminated + credentials rotated
T+30: Security incident report filed; forensic audit of actor's actions
T+48: Post-mortem + security review; ADR if pattern change needed
```

---

## Part 4: Observability Stack

### 4.1 OpenTelemetry Instrumentation Requirements

**Every** Command Handler, Domain Service, MCP Tool, and Adapter **must** emit an OpenTelemetry span with the following mandatory attributes:

```typescript
// Mandatory span attributes (enforced by code review + linting)
interface MandatorySpanAttributes {
  'service.name':    string;   // e.g., 'sovereign-commerce-service'
  'service.version': string;   // e.g., '5.1.0'
  'tenant_id':       UUID;     // From JWT context
  'actor_id':        UUID;     // User or AIAgent ID
  'actor_type':      'USER' | 'AI_AGENT' | 'SYSTEM';
  'domain':          string;   // e.g., 'finance', 'spatial', 'commerce'
  'aggregate':       string;   // e.g., 'JournalEntry', 'Booking'
  'command':         string;   // e.g., 'PostJournalEntry' (for writes)
  'event_name':      string;   // e.g., 'JournalPosted' (for events)
  'trace_id':        UUID;     // End-to-end request trace
  'status':          'success' | 'error' | 'pending';
  'duration_ms':     number;
}
```

### 4.2 Trace Propagation Chain

A single user action flows through multiple services. The `trace_id` must be propagated at every boundary:

```
User Action (browser)
  │ X-Trace-Id: {uuid}
  ▼
Next.js BFF (API Route)
  │ OpenTelemetry: start root span, inject trace_id
  │ X-Trace-Id propagated to downstream calls
  ▼
Command Handler (Domain Layer)
  │ OpenTelemetry: child span 'domain.{command}'
  │ Attributes: tenant_id, actor_id, aggregate
  ▼
PostgreSQL (Database)
  │ pg_stat_statements: query logged with comment '/* trace_id={uuid} */'
  ▼
pg-boss (Event Queue)
  │ Job metadata includes trace_id
  ▼
Event Consumer (Worker)
  │ OpenTelemetry: new span 'consumer.{eventType}' linked to root trace_id
  ▼
Trigger.dev (Workflow)
  │ OpenTelemetry: span 'workflow.{workflowId}'
  ▼
End of chain: trace reconstructable end-to-end in Grafana/Jaeger
```

### 4.3 Structured Logging Standards

```typescript
// Canonical log format (all services must use this structure)
interface StructuredLog {
  timestamp:  string;    // ISO 8601 UTC
  level:      'debug' | 'info' | 'warn' | 'error' | 'fatal';
  service:    string;    // Service name
  trace_id:   UUID;      // End-to-end trace
  tenant_id:  UUID;      // Tenant context
  actor_id:   UUID;      // Actor (USER/AI_AGENT/SYSTEM)
  domain:     string;    // Business domain
  event:      string;    // What happened (e.g., 'booking.submitted')
  duration_ms?: number;  // Operation duration
  error?:     string;    // Sanitized error message (NO stack traces, NO PII)
  metadata?:  object;    // Additional structured context (NO secrets, NO PII)
}

// Example:
{
  "timestamp": "2026-06-25T14:30:00.123Z",
  "level": "info",
  "service": "sovereign-commerce",
  "trace_id": "7f3d8a42-6e1b-4c9e-a234-1f9c8b7e6a5d",
  "tenant_id": "a1b2c3d4-...",
  "actor_id": "e5f6g7h8-...",
  "domain": "commerce",
  "event": "access_pass.issued",
  "duration_ms": 245,
  "metadata": { "pass_id": "...", "event_id": "..." }
}

// ❌ FORBIDDEN in logs:
// - Stack traces (expose internal paths)
// - Email addresses, phone numbers (PII)
// - Payment card data (PCI)
// - API keys or tokens (L-10)
// - Full SQL queries with parameter values (may expose PII)
```

### 4.4 Alert Severity Levels

| Severity | Response Time | Examples | Page? |
|---------|--------------|---------|-------|
| **P1 — Critical** | 5 minutes | Data loss, financial corruption, cross-tenant leak, L-02 violation | Yes (PagerDuty) |
| **P2 — High** | 15 minutes | Payment gateway circuit open, DLQ > 50 items, p99 > 3x SLA | Yes (PagerDuty) |
| **P3 — Medium** | 1 hour | DLQ > 10 items, p95 > 2x SLA, AI budget 80% consumed | Yes (Slack #alerts-ops) |
| **P4 — Low** | Business hours | p95 trending up, dependency version drift, cert expiring in 30 days | No (Slack #alerts-low) |

---

## Part 5: Deployment Strategy

### 5.1 Zero-Downtime Deployment Requirements

[Authority: L-08 — Zero-Downtime Migration]

**Application Deployments (Vercel/Cloudflare):**
- Stateless edge functions deploy with instant cutover
- Traffic is shifted gradually via Vercel's rollout feature
- Rollback: revert to previous deployment in < 2 minutes

**Database Migrations (Expand and Contract):**
- Phase 1 (EXPAND): Deploy migration with new nullable column; deploy app that writes to both old and new
- Phase 2 (MIGRATE): Backfill; verify 100% migration
- Phase 3 (CUTOVER): Deploy app reading from new column only
- Phase 4 (CONTRACT): Drop old column; final migration

**Schema Migration CI Gate:**
```bash
# Runs before merge: blocks forbidden DDL
scripts/validate-migration.sh
# Checks for: RENAME COLUMN, ALTER TYPE (on data-bearing columns),
#             DROP COLUMN (without prior expand/contract)
#             DELETE FROM (on business tables)
```

### 5.2 Feature Flag Deployment

For high-risk features, use feature flags to decouple deployment from release:

```typescript
// Feature flag check (reads from remote config or DB table)
async function isFeatureEnabled(
  featureName: string,
  tenantId: UUID
): Promise<boolean> {
  const flag = await valkey.get(`feature:${featureName}:${tenantId}`);
  if (flag !== null) return flag === 'true';
  
  // Fallback to global flag
  const globalFlag = await valkey.get(`feature:${featureName}:global`);
  return globalFlag === 'true';
}

// Usage
if (await isFeatureEnabled('new_checkout_flow', tenantId)) {
  return newCheckoutHandler(req);
} else {
  return legacyCheckoutHandler(req);
}
```

### 5.3 Canary Rollout Protocol

For major features affecting financial or booking domains:
1. Deploy to 5% of tenants (canary group)
2. Monitor for 24 hours: error rate, latency, L-02 trigger fires
3. If clean: expand to 50% for 24 hours
4. If clean: expand to 100%
5. If issue detected: immediate rollback to previous version

---

## Part 6: On-Call Operations

### 6.1 On-Call Rotation

| Role | Rotation | Responsibility |
|------|----------|---------------|
| **Primary On-Call** | Weekly rotation (Mon–Mon) | First responder; within 5 min for P1/P2 |
| **Secondary On-Call** | Same week, different engineer | Backup if primary unresponsive > 10 min |
| **Domain Specialist** | As needed (finance, AI, security) | Paged for domain-specific P1 incidents |

### 6.2 Operational Runbooks

#### Runbook: Payment Gateway Circuit Breaker Open

**Trigger:** Circuit breaker on Xendit/Stripe/Midtrans opens (error rate > 15%)

**Steps:**
```bash
# 1. Verify circuit status
curl https://ops.sovereign-os.internal/health/circuit-breakers

# 2. Check payment gateway status page
# Xendit: https://status.xendit.co
# Stripe: https://status.stripe.com

# 3. Review recent webhook logs
psql $DATABASE_URL -c "
SELECT event_data, created_at
FROM domain_events
WHERE event_type = 'PaymentFailed'
  AND created_at > NOW() - INTERVAL '30 minutes'
ORDER BY created_at DESC
LIMIT 20;"

# 4. If gateway issue confirmed: activate graceful degradation
# (Show maintenance notice on payment page; queue PaymentInitiated for retry)
scripts/activate-payment-maintenance-mode.sh --gateway=xendit

# 5. Notify affected tenants with ETA
scripts/send-ops-notification.sh --template=payment_degraded --eta=30min

# 6. Monitor: circuit breaker should auto-close when gateway recovers (30s reset timeout)
```

**Resolution:** Circuit auto-closes. Verify by checking `circuit_breaker.closed` metric.  
**Escalate to:** Platform Engineering Lead if not resolved in 1 hour.

---

#### Runbook: Ledger Imbalance Alert

**Trigger:** `ABS(SUM(debit) - SUM(credit)) > 0.0001` for any ledger

**Severity:** P1 — CRITICAL

**Steps:**
```bash
# 1. IMMEDIATELY: block new journal postings for affected tenant
scripts/freeze-ledger.sh --tenant-id=${TENANT_ID}

# 2. Identify the imbalanced entry
psql $DATABASE_URL -c "
SELECT je.id, je.narration, je.posted_at, je.posted_by,
       SUM(CASE WHEN jl.type = 'debit' THEN jl.amount ELSE 0 END) AS total_debit,
       SUM(CASE WHEN jl.type = 'credit' THEN jl.amount ELSE 0 END) AS total_credit
FROM journal_entries je
JOIN journal_lines jl ON jl.journal_entry_id = je.id
WHERE je.ledger_id = '${LEDGER_ID}'
  AND je.status = 'posted'
GROUP BY je.id, je.narration, je.posted_at, je.posted_by
HAVING ABS(
  SUM(CASE WHEN jl.type = 'debit' THEN jl.amount ELSE 0 END) -
  SUM(CASE WHEN jl.type = 'credit' THEN jl.amount ELSE 0 END)
) > 0.0001;"

# 3. Identify the trace_id from domain_events for the imbalanced entry
psql $DATABASE_URL -c "
SELECT trace_id, event_data
FROM domain_events
WHERE event_data->>'journalEntryId' = '${ENTRY_ID}';"

# 4. DO NOT attempt manual correction — escalate immediately
# This is a CRITICAL incident requiring Finance Domain Lead review
echo "ESCALATE: Finance Domain Lead + Lead Architect required"
scripts/page-on-call.sh --severity=P1 --message="Ledger imbalance detected: ${ENTRY_ID}"
```

**Note:** This should be **theoretically impossible** due to `post_ledger_transaction()` stored procedure validation. A ledger imbalance indicates either a bug in the stored procedure or direct DML bypassing it. Treat as security incident.

---

#### Runbook: DLQ Overflow

**Trigger:** DLQ depth > 50 items in 1-hour window

**Steps:**
```bash
# 1. Identify job types in DLQ
psql $DATABASE_URL -c "
SELECT name, COUNT(*) as failed_count, MAX(failed_on) as last_failure
FROM pgboss.dead
WHERE created_on > NOW() - INTERVAL '1 hour'
GROUP BY name
ORDER BY failed_count DESC;"

# 2. Review sample failure reasons
psql $DATABASE_URL -c "
SELECT name, data, output AS error_output, failed_on
FROM pgboss.dead
WHERE name = '${JOB_TYPE}'
LIMIT 5;"

# 3. If financial domain job (JournalPosted, PaymentCaptured): P1 escalation
# If notification job (EmailDelivery, WhatsAppMessage): P3 — retry later

# 4. Replay after root cause fixed
psql $DATABASE_URL -c "
INSERT INTO pgboss.job (name, data, state)
SELECT name, data, 'created'
FROM pgboss.dead
WHERE name = '${JOB_TYPE}'
  AND created_on > NOW() - INTERVAL '2 hours';"
```

---

## Part 7: Incident Response

### 7.1 Incident Severity Matrix

| Severity | Definition | Response Time | War Room? | Post-Mortem? |
|---------|-----------|--------------|-----------|-------------|
| **P1 — Critical** | Revenue loss, data loss, security breach, cross-tenant leak | 5 min | Yes (immediate) | Yes (48h) |
| **P2 — High** | Service degraded, payment processing down, > 5 min downtime | 15 min | Yes (if > 30 min) | Yes (72h) |
| **P3 — Medium** | Non-critical service degraded, high error rates on non-financial routes | 1 hour | No | Yes (weekly) |
| **P4 — Low** | Performance degradation, non-urgent anomalies | Business hours | No | No (tracking only) |

### 7.2 Incident Response Protocol

```
DETECTION → TRIAGE → RESPONSE → RESOLUTION → POST-MORTEM

DETECTION (T+0):
  - Alert fired via PagerDuty / Grafana / customer report
  - On-call primary acknowledges within 5 minutes (P1/P2)

TRIAGE (T+0 to T+5):
  - Determine severity (P1–P4)
  - Identify affected tenants and services
  - Check: is this a known issue? (check Volume 10 risk register)
  - Open incident channel: #incident-{YYYYMMDD}-{ID}

RESPONSE (T+5 to resolution):
  - Incident Commander assigned (primary on-call or escalated lead)
  - War room opened if P1/P2
  - Runbook executed (this volume, Part 6)
  - Status page updated every 15 minutes
  - Affected tenants notified

RESOLUTION:
  - Service restored
  - Root cause identified
  - Temporary mitigation documented
  - Monitoring confirms SLA restored

POST-MORTEM:
  - Blameless post-mortem within 48h (P1) or 72h (P2)
  - Five Whys analysis
  - Action items with owners and deadlines
  - ADR filed if architectural change needed
  - Volume 10 risk register updated
```

---

## Part 8: Production Readiness Checklist

Before any new bounded context or major feature goes to production:

**Security**
- [ ] All secrets in Vault; zero hardcoded in code/env (L-10)
- [ ] `gitleaks` scan passes (no secrets in git history)
- [ ] Trivy container scan: no Critical or High CVEs
- [ ] SonarQube static analysis: no blocking issues

**Database**
- [ ] RLS enabled (`ENABLE ROW LEVEL SECURITY`) on all new tables
- [ ] `FORCE ROW LEVEL SECURITY` applied (includes table owner)
- [ ] Two-tenant isolation test written and passing (Volume 06, Part 6.3)
- [ ] No cross-context JOINs in any query (L-01 CI gate passes)
- [ ] Immutable triggers on financial tables if applicable (L-02)
- [ ] `deleted_at` + `deleted_by` columns on all business tables (L-03)
- [ ] `idempotency_key` UNIQUE constraint on financial mutation tables (L-04)

**API**
- [ ] OpenAPI spec published (contract-first)
- [ ] All mutating endpoints accept `X-Idempotency-Key` (L-04)
- [ ] All endpoints carry `X-Trace-Id` propagation
- [ ] Rate limiting configured per tenant + per user
- [ ] Error response follows taxonomy (Appendix B)

**Observability**
- [ ] OpenTelemetry spans on all Command Handlers and Adapters
- [ ] Mandatory span attributes present (Part 4.1)
- [ ] Structured logging enabled (Part 4.3)
- [ ] Health check endpoint `/health` returns `{ status: 'ok', version: '...' }`
- [ ] Alerts configured (Part 4.4) for new operations

**Domain**
- [ ] All State machines implemented and tested
- [ ] All Domain Events emitted to `domain_events` outbox table
- [ ] All Command Handlers flow through domain invariant validation (L-07)
- [ ] Idempotency tested (same key → same result)
- [ ] AI Safety: any new MCP tools registered in `mcp_tool_registry` with correct Level (L-06)

**Performance**
- [ ] Load tested to 2x expected peak load
- [ ] p95 latency within SLA targets (Part 1.2)
- [ ] Database indexes verified with EXPLAIN ANALYZE
- [ ] Connection pool sizing verified

**Deployment**
- [ ] Database migration follows Expand/Contract pattern (L-08)
- [ ] Migration rollback script prepared and tested
- [ ] Canary deployment plan ready for high-risk changes (Part 5.3)
- [ ] Runbook written for any new operational scenario

---

## Appendix A: Scaling Thresholds & Triggers

| Metric | Current Capacity | Alert Threshold | Action |
|--------|-----------------|-----------------|--------|
| API requests/sec | ~500 RPS (Vercel Edge) | 400 RPS sustained > 10 min | Scale horizontally; investigate traffic source |
| Database connections | 500 (via pgBouncer) | 400 active > 5 min | Increase pgBouncer pool or add read replica |
| Embedding vectors | 10M per tenant | 8M per tenant | Evaluate Qdrant migration (Volume 10 TD trigger) |
| Workflow instances/day | 100K/day (Trigger.dev) | 80K/day sustained | Begin Temporal migration planning (Volume 10) |
| pg-boss job queue | 10K/sec throughput | 8K/sec sustained | Evaluate NATS JetStream migration |
| AI token usage/tenant/day | 1M tokens/day | 800K/day | Raise budget alert; evaluate optimization |

---

**End of Volume 05**

*"Every failure is expected. Every failure must be observable. Every failure must be recoverable deterministically."*

*Build systems that fail gracefully, not systems that claim they won't fail.*

*[Constitution Parts 2.5, 18] [EPXA Part 6] [Volume 06, L-02, L-03, L-04] [Volume 10, Risk Register]*
