# Peta Siklus Hidup Platform — Moventios (Movent)
**Planning → Development → Production → Operations → Maintenance**

> Dokumen ini adalah **peta sintetis** dari seluruh SEKB (Volume 00–10 + Layer 1–3).  
> Setiap kotak merujuk ke dokumen kanonikal yang menjadi sumber otoritasnya.  
> Baca ini sebagai kompas navigasi, bukan pengganti dokumen sumber.

---

## Ringkasan Eksekutif

```
PLANNING ──► DEVELOPMENT ──► STAGING ──► PRODUCTION ──► OPERATIONS ──► MAINTENANCE
   │               │              │            │               │              │
Strategy        Feature        CI/CD        Deploy         SRE/SLA       Quarterly
Principles      Lifecycle      Gates       Canary         Runbooks        Review
  L-01–10       FJD/ADR        8 Gates    Zero-DT       Incident       Roadmap
  SEKB v5.1     TDD           RFC/ADR    Rollback       Response       Tech Debt
```

---

## FASE 1 — PLANNING (Perencanaan Strategis)

> **Otoritas:** Layer-1 Constitution Parts 1–2, 6 | Volume 07 | Volume 00 | Volume 06

### 1.1 Visi & Misi Platform

| Dimensi | Definisi | Dokumen |
|---------|----------|---------|
| **Mission** | Membantu organisasi menjalankan event, proyek, dan operasi dengan koordinasi, visibilitas, akuntabilitas, dan catatan yang andal di skala besar | Vol 07 §1.1 |
| **Vision** | Organisasi semua ukuran dapat menjalankan event dan proyek kompleks tanpa fragmentasi atau kehilangan kontrol | Vol 07 §1.2 |
| **Ethos** | Sovereignty First · Deterministic over Clever · Financial Integrity · AI Under Control · Open Standards | Vol 07 §1.3 |

### 1.2 Prinsip Arsitektur (Tidak Dapat Dikompromikan)

```
9 SOVEREIGN PRINCIPLES (P-1 hingga P-9)

P-1  Value-Friction Resolution   → Setiap fitur harus skor ≥ 60/100 sebelum masuk development
P-2  Tenant Sovereignty          → Data tenant = milik tenant; ekspor kapan saja; isolasi penuh
P-3  Swiss-Standard Finance      → Double-entry; NUMERIC(19,4); tidak ada float untuk uang
P-4  Zero-Trust Security         → Semua layer diverifikasi; tidak ada komponen "trusted by default"
P-5  Open Source First           → Adopt → Configure → Extend → Compose → Replace → Build
P-6  AI-Augmented, Human-Decided → AI rekomendasi; manusia keputusan material (L-06)
P-7  Observability by Default    → Trace, log, meter dari inception
P-8  Scale Without Rewrite       → 10x tanpa perubahan struktur; 100x dengan evolution path
P-9  Boring to Maintain          → Engineer baru produktif dalam 1 minggu; SEKB adalah kenapa
```

### 1.3 Feature Planning Gate (FJD — Feature Justification Document)

**Wajib sebelum setiap fitur masuk sprint:**

```
LANGKAH 1: Value-Friction Analysis
─────────────────────────────────
  Revenue          (0–25)  → Apakah mendorong/melindungi revenue?
  Cost Saving      (0–25)  → Apakah mengurangi biaya operasional?
  Risk Reduction   (0–25)  → Apakah mengurangi risiko legal/keuangan/reputasi?
  Strategic Pos.   (0–25)  → Apakah menciptakan diferensiasi yang defensible?
  ─────────────────────────
  Total ≥ 60/100           → PROCEED
  Total < 60/100           → DEFER atau REJECT

LANGKAH 2: Bounded Context Owner
  □ IAM & Governance
  □ Spatial & Facility
  □ Commerce & Event
  □ Finance & Ledger
  □ Workflow & Operations
  □ AI & Knowledge

LANGKAH 3: Enterprise Law Impact Check
  □ Cross-context data?   → L-01: gunakan Read Model/CQRS
  □ Financial history?    → L-02: reversal pattern only
  □ Entity deletion?      → L-03: soft delete wajib
  □ Financial mutation?   → L-04: idempotency key wajib
  □ AI write action?      → L-06: Approval workflow wajib

LANGKAH 4: Architecture Owner Sign-off
  Lead Architect → APPROVE / DEFER / REJECT
```

**Kategori fitur & jalur approval:**

| Kategori | Definisi | Approval |
|----------|----------|----------|
| Tier 1 — Core | Financial integrity, tenant isolation, security | RFC → Lead Architect + EAB |
| Tier 2 — Competitive | Diferensiasi baru vs kompetitor | FJD + Volume Owner + Product Lead |
| Tier 3 — Enhancement | Perbaikan kapabilitas yang ada | FJD + Volume Owner |
| Tier 4 — UX/DX | Developer/user experience improvements | PR review saja |

### 1.4 Decision Records (ADR & RFC)

```
RFC (Request for Comments)
  └─ Untuk: perubahan architecture, OSS replacement, breaking change
  └─ Proses: Propose → Discuss → Decision → ADR filed
  └─ Location: docs/architecture/rfc/

ADR (Architecture Decision Record)
  └─ Untuk: semua keputusan signifikan (immutable setelah merge)
  └─ Format: Context → Decision → Consequences → Status
  └─ Location: docs/architecture/adr/

RATIFIED ADRs (saat ini):
  ADR-001: Monorepo Turborepo + pnpm workspaces
  ADR-002: AI Safety L-06 MCP Tool Level enforcement
  ADR-003: Legacy engineering-kb.md archived
```

### 1.5 Bounded Context Ownership Map

```
6 CORE BOUNDED CONTEXTS + SUPPORTING DOMAINS

CORE (Competitive Advantage):
  ┌──────────────────────┐  ┌──────────────────────┐
  │  SPATIAL & FACILITY  │  │  COMMERCE & EVENT    │
  │  Collision-free book │◄─►  Ticketing, AccessPass│
  │  GiST exclusion      │  │  Campaign, TicketType │
  └──────────────────────┘  └──────────────────────┘
            │                          │
            └──────────┬───────────────┘
                       ▼
           ┌──────────────────────────┐
           │    FINANCE & LEDGER      │
           │  Double-entry accounting │
           │  Immutable; Swiss-std    │
           └──────────────────────────┘
  ┌──────────────────────┐  ┌──────────────────────┐
  │   AI & KNOWLEDGE     │  │  IAM & GOVERNANCE    │
  │  RAG, embeddings     │  │  Tenant isolation    │
  │  MCP tools, L-06     │  │  Supabase Auth+RLS   │
  └──────────────────────┘  └──────────────────────┘

SUPPORTING:
  Workflow & Operations (state machines, approvals)
  Notifications (Resend, Fonnte)
  Payment Gateway ACL (Xendit, Stripe, Midtrans)

ATURAN: Semua komunikasi antar-BC hanya via Domain Events
        TIDAK ADA RPC. TIDAK ADA cross-BC SQL JOIN.
```

---

## FASE 2 — DEVELOPMENT (Pengembangan)

> **Otoritas:** Volume 03 (Engineering Blueprint) | Layer-3 EPXA | Layer-1 Laws L-01–L-10

### 2.1 Technology Stack (Ratified — Perubahan Butuh RFC)

```
LAYER               TECHNOLOGY          VERSI     LISENSI   STATUS
─────────────────────────────────────────────────────────────────────
Edge / BFF          Next.js App Router  15+       MIT       ADOPT
Domain Services     Go                 1.22+     BSD       ADOPT (Finance)
Database            PostgreSQL         16+       PG        ADOPT
ORM / Migrations    Drizzle ORM        Latest    Apache    ADOPT
Caching / KV        Valkey             Latest    BSD-3     ADOPT
Workflow Engine     Trigger.dev        Latest    Apache    ADOPT
Job Queue/Outbox    pg-boss            Latest    MIT       ADOPT
Email               Resend             SaaS      MIT       ADOPT
WhatsApp            Fonnte             SaaS      —         ADOPT
IaC                 OpenTofu           Latest    MPL-2.0   ADOPT
Monorepo            Turborepo          Latest    MIT       ADOPT
Auth                Supabase Auth      Managed   MIT       ADOPT
AuthZ               Cerbos ABAC        Latest    Apache    EXTEND
Secrets             HashiCorp Vault    Latest    BSL       ADOPT
Vector Store        pgvector (HNSW)    —         PG        ADOPT
Lexical Search      Typesense          Latest    GPL*      ADOPT*
LLM Gateway         OpenRouter         SaaS      —         CONFIGURE
Agent Protocol      MCP (Anthropic)    Latest    MIT       ADOPT
Observability       OpenTelemetry      Latest    Apache    ADOPT
Payments            Xendit/Stripe/Mid  SaaS      —         EXTEND (ACL)

* Typesense GPL diisolasi di balik API boundary — tidak dalam core path
```

### 2.2 Monorepo Structure

```
movent/ (pnpm workspace + Turborepo)
├── apps/
│   ├── movent-web/   ← Next.js 15 App Router (BFF + Experience)
│   │   └── middleware.ts  ← ⚠️ KRITIS: JWT, tenant extract, rate limit
│   ├── admin/        ← Internal ops console
│   └── movent-workers/ ← Trigger.dev + Go workers
├── packages/
│   ├── movent-contracts/  ← Zod schemas, OpenAPI/AsyncAPI, shared types
│   ├── movent-core/       ← 🚫 ZERO infrastructure imports
│   │   ├── iam/      ← IAM domain logic
│   │   ├── spatial/  ← Facility, Booking
│   │   ├── commerce/ ← Event, AccessPass
│   │   ├── finance/  ← Ledger, JournalEntry
│   │   ├── workflow/ ← WorkflowInstance, Approval
│   │   └── ai/       ← KnowledgeBase, Embedding, Prompt
│   ├── movent-database/      ← Drizzle schemas + SQL migrations + RLS
│   ├── movent-ui/            ← @movent/ui component library
│   └── movent-infrastructure/ ← Adapters (pg, valkey, payment, notif, mcp)
├── supabase/         ← Migrations, edge functions
├── docs/             ← SEKB (canonical knowledge base)
└── infrastructure/   ← OpenTofu IaC modules
```

### 2.3 Development Workflow

```
SIKLUS PENGEMBANGAN FITUR
─────────────────────────

1. IDEASI (FJD)
   └─ Buat Feature Justification Document
   └─ Score ≥ 60? → lanjut | < 60? → defer/reject

2. ARCHITECTURE REVIEW
   └─ Identifikasi BC owner
   └─ Periksa Enterprise Laws (L-01–L-10)
   └─ Tulis Traceability Record (template Vol 03 §6)
   └─ RFC jika butuh perubahan arsitektur

3. TEST-DRIVEN DEVELOPMENT (TDD)
   └─ Tulis unit test (domain invariant) SEBELUM kode
   └─ Tulis contract test (API schema adapter stubs)
   └─ Tulis E2E test (happy + failure path, Playwright)

4. IMPLEMENTATION (Hexagonal Architecture)
   └─ Domain logic → packages/movent-core/{domain}/
   └─ API route → apps/movent-web/app/api/v1/{domain}/
   └─ Adapter → packages/movent-infrastructure/
   └─ TIDAK ADA business logic di middleware atau API route

5. TRACEABILITY CHAIN (Wajib)
   Setiap fitur HARUS memiliki dokumen:
   Business Goal → Screen (SCR_DOMAIN_PURPOSE_SEQ) →
   API (Method + path) → Command → Aggregate → Invariant →
   Persistence (SQL + RLS) → Domain Event → Workflow →
   AI Context → Analytics → Observability (OTel span + SLA)

6. CODE REVIEW (Checklist)
   □ No cross-context imports/JOINs (L-01)
   □ Financial mutations via Command Handler (L-02, L-07)
   □ New tables: RLS + soft delete + audit columns (L-03, L-05)
   □ Idempotency key on financial mutations (L-04)
   □ AI tools: correct access level (L-06)
   □ Expand/Contract for schema changes (L-08)
   □ No secrets in code/env/DB (L-10)
   □ Traceability record documented
   □ OTel spans on Command Handlers
```

### 2.4 Enterprise Laws (L-01 hingga L-10)

```
L-01  No Cross-BC SQL JOINs         → Compose di application layer (BFF)
L-02  Financial history append-only  → Hanya reversal entries; NO UPDATE/DELETE pada journal_entries
L-03  Soft delete wajib              → deleted_at + deleted_by pada semua business entities
L-04  Idempotency key                → UNIQUE(tenant_id, idempotency_key) pada financial/booking mutations
L-05  Tenant ownership              → EVERY entity punya tenant_id; FORCE ROW LEVEL SECURITY
L-06  AI WRITE→PENDING only          → Buat Approval record; TIDAK PERNAH langsung mutasi state
L-07  Command Handlers              → Semua mutasi via Command Handler; NO raw DB writes di API routes
L-08  Zero-downtime migrations       → Expand/Contract; NO RENAME COLUMN atau breaking DDL
L-09  OpenTelemetry mandatory        → Span di setiap Command Handler + Adapter
L-10  No secrets in code             → HashiCorp Vault SAJA
```

### 2.5 Pola API (BFF Pattern)

```typescript
// TEMPLATE: API Route yang benar
// apps/movent-web/app/api/v1/{domain}/{resource}/route.ts

export const POST = withTracing(
  withTenantContext(
    withIdempotency(
      async (req, { tenantId, actorId, traceId }) => {
        // 1. Parse + validate (Zod dari packages/movent-contracts)
        const body = CommandSchema.parse(await req.json());
        // 2. Build command (dengan tenantId, actorId, traceId)
        const command = { ...body, tenantId, actorId, traceId,
                          idempotencyKey: req.headers.get('X-Idempotency-Key') };
        // 3. Execute via Command Handler (packages/movent-core)
        const result = await handler.execute(command);
        // 4. Return
        return NextResponse.json(result, { status: 201 });
      }
    )
  )
);

// Required headers:
// X-Idempotency-Key (semua mutating endpoints)
// X-Trace-Id (propagated end-to-end)
// Authorization: Bearer <jwt>
```

### 2.6 AI Safety dalam Development (L-06)

```
MCP TOOL LEVELS (wajib untuk setiap tool baru)

Level 0 — FORBIDDEN
  Tidak ada di registry. Internal Command Handler saja.
  Contoh: PostJournalEntry, CapturePayment, PurgeData

Level 1 — WRITE→PENDING (Butuh Approval Manusia)
  Tool dipanggil AI → membuat Approval record → TIDAK ada mutasi
  Contoh: draft_journal_entry, issue_access_pass, cancel_booking
  Timeout: 1–24 jam per tool (konfigurasi per-tool)

Level 2 — ALLOWED (Read-Only; langsung dieksekusi)
  SELECT dengan RLS enforced. Tidak ada state change.
  Contoh: search_knowledge_base, get_ledger_balance, get_booking_status

DAFTARKAN di mcp_tool_registry table saat membuat tool baru.
```

---

## FASE 3 — CI/CD & STAGING GATE

> **Otoritas:** Volume 03 §7 (Production Readiness Gate) | Volume 05 §5 | Volume 06

### 3.1 CI/CD Gates (8 Gate Otomatis — Wajib Lulus Semua)

```bash
# Gate 1: Type checking
pnpm tsc --noEmit

# Gate 2: Lint (termasuk architecture boundary check)
pnpm eslint . --max-warnings 0

# Gate 3: Unit tests dengan coverage
pnpm test --coverage

# Gate 4: Database migration validation (L-08)
scripts/validate-migration.sh
# Cek: RENAME COLUMN, ALTER TYPE, DROP COLUMN tanpa expand/contract, DELETE FROM business tables

# Gate 5: Terminology check (L-01 / ubiquitous language)
scripts/check-terminology.sh
# grep untuk: "ticket" (→ AccessPass), "venue" (→ Facility), "reservation" (→ Booking)

# Gate 6: Secret scan (L-10)
gitleaks detect --source . --no-git

# Gate 7: OSS license check
npx license-checker --production --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;PostgreSQL"

# Gate 8: Build verification
pnpm build
```

### 3.2 Code Review Checklist (Human Gate)

```
Sebelum merge ke main — checklist reviewer:

□ No cross-context imports atau JOINs (L-01)
□ Financial mutations: Command Handler + stored procedure (L-02, L-07)
□ Tabel baru: RLS enabled + FORCE RLS + soft delete + audit columns (L-03, L-05)
□ Idempotency key pada financial mutations (L-04)
□ MCP tool baru: access level benar + registered in mcp_tool_registry (L-06)
□ Schema change: Expand/Contract pattern (L-08)
□ Tidak ada secrets (L-10)
□ Traceability record terdokumentasi (Vol 03 §6 template)
□ OTel spans pada semua Command Handler baru
□ E2E test: happy path + failure path (Playwright)
□ Two-tenant isolation test untuk tabel baru
```

### 3.3 Staging Environment

```
STAGING CHECKLIST (sebelum promosi ke production):

Security:
□ Semua secrets di Vault; nol hardcoded (L-10)
□ gitleaks scan pass (tidak ada secrets di git history)
□ Trivy container scan: tidak ada CVE Critical/High
□ SonarQube: tidak ada blocking issue

Database:
□ RLS: ENABLE + FORCE ROW LEVEL SECURITY pada semua tabel baru
□ Two-tenant isolation test: passing
□ Tidak ada cross-context JOINs (L-01 CI gate pass)
□ Immutable triggers pada tabel finansial (L-02)
□ deleted_at + deleted_by pada semua business tables (L-03)
□ idempotency_key UNIQUE constraint (L-04)

API:
□ OpenAPI spec published (contract-first)
□ Semua mutating endpoints: X-Idempotency-Key
□ X-Trace-Id propagation pada semua endpoints
□ Rate limiting per tenant + per user
□ Error response mengikuti taxonomy (400/401/403/404/409/422/429/500)

Observability:
□ OTel spans: semua Command Handlers + Adapters
□ Mandatory span attributes present
□ Structured logging enabled
□ /health endpoint returns { status: 'ok', version: '...' }
□ Alerts dikonfigurasi untuk operasi baru

Domain:
□ Semua state machines diimplementasi dan ditest
□ Domain Events: semua di-emit ke domain_events outbox table
□ Command Handlers: invariant validation (L-07)
□ Idempotency test: same key → same result

Performance:
□ Load test: 2x expected peak load
□ p95 latency dalam SLA target
□ EXPLAIN ANALYZE untuk semua query baru
□ Connection pool sizing verified
```

---

## FASE 4 — PRODUCTION DEPLOYMENT

> **Otoritas:** Volume 05 §5 (Deployment Strategy) | Layer-1 L-08

### 4.1 Zero-Downtime Deployment

```
APPLICATION DEPLOYMENT (Vercel/Cloudflare Edge):
─────────────────────────────────────────────────
  Stateless edge functions → instant cutover
  Gradual traffic shift via Vercel rollout feature
  Rollback: revert ke previous deployment < 2 menit

DATABASE MIGRATION — Expand & Contract (L-08):
────────────────────────────────────────────────
  Phase 1 (EXPAND)   → Deploy migration: nullable column baru
                        Deploy app: write ke old AND new column
  Phase 2 (MIGRATE)  → Backfill; verify 100% migrated
  Phase 3 (CUTOVER)  → Deploy app: read dari new column only
  Phase 4 (CONTRACT) → Drop old column; final migration

FORBIDDEN DDL (CI gate akan block):
  ✗ RENAME COLUMN (breaking)
  ✗ ALTER TYPE pada data-bearing column
  ✗ DROP COLUMN tanpa prior expand/contract
  ✗ DELETE FROM pada business tables
```

### 4.2 Feature Flag Deployment

```
High-risk features: decouple deployment dari release

  Feature flag check (Valkey):
  key = feature:{featureName}:{tenantId}   → tenant-specific
  key = feature:{featureName}:global        → semua tenant

  Alur:
  Deploy → Flag OFF → Test di staging → Flag ON untuk internal
       → Monitor 24h → Flag ON 5% → Monitor → Flag ON 100%
```

### 4.3 Canary Rollout Protocol (Financial/Booking Domain)

```
WAJIB untuk perubahan yang menyentuh financial atau booking domain:

  Step 1: Deploy ke 5% tenant (canary group)
  Step 2: Monitor 24 jam:
          □ Error rate per financial route < 0.1%
          □ L-02 trigger fires = 0
          □ p99 latency dalam SLA
  Step 3: Jika clean → expand ke 50% (24 jam monitoring)
  Step 4: Jika clean → expand ke 100%
  Step 5: Jika ada masalah → immediate rollback ke previous version
```

### 4.4 SLA Targets (Production)

| Operasi | p50 | p95 | p99 | Error Budget |
|---------|-----|-----|-----|-------------|
| Booking submit | 80ms | 200ms | 500ms | 0.1%/bulan |
| Payment capture (webhook) | 150ms | 400ms | 1000ms | 0.01%/bulan |
| Journal post | 100ms | 250ms | 600ms | 0.01%/bulan |
| Access pass issuance | 120ms | 300ms | 700ms | 0.1%/bulan |
| API read | 50ms | 150ms | 400ms | 0.5%/bulan |
| RAG search | 80ms | 200ms | 400ms | 1%/bulan |
| LLM inference | 800ms | 2500ms | 5000ms | 2%/bulan |
| **Platform uptime** | — | — | — | **99.9% (8.77 jam/tahun)** |

---

## FASE 5 — OPERATIONS (Operasional Produksi)

> **Otoritas:** Volume 05 (Operations & Reliability) | Layer-1 Parts 2.5, 18

### 5.1 Observability Stack

```
TRACE PROPAGATION CHAIN (setiap user action menghasilkan jejak lengkap):

  User Action (browser)
    │  X-Trace-Id: {uuid}
    ▼
  Next.js BFF (API Route)
    │  OTel: root span; inject trace_id
    ▼
  Command Handler (Domain Layer)
    │  OTel: child span 'domain.{command}'
    │  Attributes: tenant_id, actor_id, aggregate
    ▼
  PostgreSQL
    │  pg_stat_statements: query logged '/* trace_id={uuid} */'
    ▼
  pg-boss (Event Queue)
    │  Job metadata: trace_id included
    ▼
  Event Consumer (Worker)
    │  OTel: span 'consumer.{eventType}'
    ▼
  Trigger.dev (Workflow)
    │  OTel: span 'workflow.{workflowId}'
    ▼
  → Fully reconstructable di Grafana/Jaeger
```

**Golden Signals (RED Method):**

| Signal | Metric | Alert |
|--------|--------|-------|
| **Rate** | Requests per second | > 200% dari 7-day p95 baseline |
| **Errors** | Error rate (4xx+5xx/total) | > 0.5% financial; > 2% read |
| **Duration** | Latency p50/p95/p99 | p95 > 2x SLA target |

### 5.2 Alert Severity Levels

| Severity | Waktu Respons | Contoh | Paged? |
|---------|--------------|--------|--------|
| **P1 — Critical** | 5 menit | Data loss, financial corruption, cross-tenant leak, L-02 violation | Ya (PagerDuty) |
| **P2 — High** | 15 menit | Payment gateway circuit open, DLQ > 50, p99 > 3x SLA | Ya (PagerDuty) |
| **P3 — Medium** | 1 jam | DLQ > 10, p95 > 2x SLA, AI budget 80% | Ya (Slack #alerts-ops) |
| **P4 — Low** | Business hours | p95 trending up, cert expiring 30 hari | Tidak (Slack #alerts-low) |

### 5.3 Circuit Breakers (Semua External Integration)

```
Threshold per integrasi:

  Xendit / Stripe / Midtrans (PSP)
    Error threshold: 15%  |  Reset: 30s  |  Timeout: 10s

  OpenRouter (LLM)
    Error threshold: 20%  |  Reset: 60s  |  Timeout: 30s

  Resend (Email) / Fonnte (WhatsApp)
    Error threshold: 25%  |  Reset: 120s |  Timeout: 5s

  Typesense (Search)
    Error threshold: 30%  |  Reset: 30s  |  Timeout: 3s

Events emitted: circuit_breaker.opened → OTel + alerting.fire('IntegrationDegraded')
```

### 5.4 Resilience Patterns

```
RETRY POLICY:
  Financial: 5 attempts; exponential backoff (1s → 2s → 4s → 8s → 16s; max 30s)
  Notification: 3 attempts; linear 5s
  Analytics: 2 attempts; linear 10s

DEAD LETTER QUEUE (DLQ — pg-boss):
  Alert: DLQ depth > 10 dalam 5 menit
  Eskalasi: Financial domain jobs (JournalPosted, PaymentCaptured) → P1 immediate
  Replay: scripts/replay-dlq-jobs.sh --job-type={type} --since={timestamp}

IDEMPOTENCY REGISTRY (Valkey):
  TTL: 24 jam
  Key: idempotency:{tenantId}:{key}
  Atomic check-and-set (mencegah race condition)
```

### 5.5 Disaster Recovery

```
RECOVERY OBJECTIVES:
  RTO (Recovery Time): < 15 menit
  RPO (Recovery Point): < 5 menit data loss

BACKUP STRATEGY:
  PostgreSQL: WAL archiving continuous + daily full backup 03:00 UTC
              PITR window: 30 hari; cross-region replica
  Valkey:     RDB snapshot setiap 60s untuk financial-adjacent data
              AOF enabled untuk idempotency registry

SKENARIO KEGAGALAN:

  Scenario 1: Database Primary Failure
  T+0:  Alert fires (connection refused)
  T+2:  Supabase auto-promotes read replica
  T+5:  Health checks detect new primary
  T+7:  Connection pools re-established
  T+15: Full validation (SELECT 1 semua 38 tabel; RLS check)
  T+20: Post-incident report

  Scenario 2: Full Region Failure
  T+0:  Alert fires (semua health checks fail)
  T+2:  Incident Commander paged
  T+5:  Decision: failover ke DR region
  T+8:  DNS cutover
  T+10: Verify PITR recovery (< 5 menit data loss)
  T+15: Service restored
  T+60: Post-mortem scheduled

  Scenario 3: L-02 Violation Attempt
  T+0:  Immutable trigger fires; transaction rolled back
        Alert fires: "L-02 VIOLATION ATTEMPT on journal_entries"
  T+2:  Security team paged
  T+5:  Audit log: actor_id + trace_id identified
  T+10: Actor session terminated; credentials rotated
  T+30: Security incident report filed
  T+48: Post-mortem + security review; ADR if needed
```

---

## FASE 6 — INCIDENT RESPONSE

> **Otoritas:** Volume 05 §7 | Volume 10 §3 (Risk Register)

### 6.1 Severity Matrix

| Severity | Definisi | Waktu | War Room? | Post-Mortem? |
|---------|---------|-------|-----------|-------------|
| **P1** | Revenue loss, data loss, security breach, cross-tenant leak | 5 mnt | Ya (immediate) | Ya (48 jam) |
| **P2** | Service degraded, payment down, > 5 mnt downtime | 15 mnt | Ya (jika > 30 mnt) | Ya (72 jam) |
| **P3** | Non-critical degraded, high error rate (non-financial) | 1 jam | Tidak | Ya (mingguan) |
| **P4** | Performance degradation, non-urgent anomaly | Business hours | Tidak | Tidak |

### 6.2 Incident Protocol

```
DETECTION (T+0)
  → Alert via PagerDuty / Grafana / customer report
  → On-call primary acknowledge ≤ 5 menit (P1/P2)

TRIAGE (T+0 – T+5)
  → Tentukan severity (P1–P4)
  → Identifikasi tenant dan layanan yang terdampak
  → Cek: apakah ini known issue? (Vol 10 Risk Register)
  → Buka incident channel: #incident-{YYYYMMDD}-{ID}

RESPONSE (T+5 – resolved)
  → Incident Commander ditugaskan
  → War room opened (P1/P2)
  → Jalankan runbook (Vol 05 §6)
  → Status page diupdate setiap 15 menit
  → Notify tenant yang terdampak

RESOLUTION
  → Layanan pulih
  → Root cause diidentifikasi
  → Mitigasi sementara didokumentasikan
  → Monitoring konfirmasi SLA restored

POST-MORTEM
  → Blameless, dalam 48 jam (P1) atau 72 jam (P2)
  → Five Whys analysis
  → Action items dengan owner dan deadline
  → ADR filed jika butuh perubahan arsitektur
  → Volume 10 Risk Register diupdate
```

### 6.3 Active Risk Register

| ID | Risiko | Severity | Mitigasi |
|----|--------|----------|----------|
| R-001 | Server Actions error leakage | HIGH | `safeAction` HOC + sanitize errors |
| R-002 | pgvector HNSW blocks concurrent writes | MEDIUM | Async batch ingestion 02:00–06:00 UTC |
| R-003 | Webhook delivery failure (payment) | HIGH | HTTP 200 ACK immediate + pg-boss retry + DLQ |
| R-004 | AI prompt injection/jailbreak | HIGH | Constitutional system prompt + jailbreak guardrail |
| R-005 | Cross-tenant RLS misconfiguration | **CRITICAL** | Two-tenant test di CI; quarterly RLS audit |
| R-006 | Trigger.dev scale limit | MEDIUM | Monitor; plan Temporal migration at 500K/day |
| R-007 | Supabase JWT token size | LOW | Minimal claims; Cerbos untuk complex permissions |
| R-008 | OpenRouter rate limiting | MEDIUM | Multi-model fallback; semantic cache |

---

## FASE 7 — MAINTENANCE (Pemeliharaan Berkelanjutan)

> **Otoritas:** Volume 10 (Remediation & Roadmap) | Volume 05 §5 | Volume 06 §3

### 7.1 Quarterly Review Cadence

```
QUARTERLY REVIEW (Jumat terakhir tiap kuartal — Q1 Mar, Q2 Jun, Q3 Sep, Q4 Des)
Durasi: 3 jam
Peserta: Lead Architect, Volume Owners, Security Architect, AI Engineering Lead, Product Lead

AGENDA:

Architecture Health:
  □ Review semua open technical debt (Vol 10 §2)
  □ Review risk register (Vol 10 §3) — ada yang eskalasi?
  □ Cek OSS replacement triggers (Vol 10 §4) — ada threshold yang dilanggar?
  □ Review ADR manifest — ada keputusan yang perlu direvisi?

Compliance Health:
  □ RLS audit — ada tabel baru yang missing RLS?
  □ Secret rotation — semua secrets dalam jadwal rotasi?
  □ L-06 audit — review Approval creation logs; anomali?
  □ Enterprise Law CI gates — semua pass? Ada false positive?

Performance Health:
  □ Review SLA attainment kuartal lalu (Vol 05 metrics)
  □ Identifikasi operasi trending di atas p95 target
  □ Aktifkan optimization backlog item jika diperlukan

AI Health:
  □ Prompt eval score — ada prompt di bawah 0.85?
  □ LLM cost trend — dalam budget?
  □ Token usage growth — perlu budget adjustment?
  □ Level 1 Approval resolution time — dalam SLA?

Roadmap:
  □ Update 12-month roadmap (Vol 10 §7) dengan progress aktual
  □ Reprioritize technical debt backlog
  □ Plan deliverables kuartal berikutnya
```

### 7.2 Technical Debt Backlog (Aktif)

| ID | Item | Impact | Effort | Prioritas | Target |
|----|------|--------|--------|-----------|--------|
| TD-002 | Traceability chains: 5 dari 6 full-stack chains belum didokumentasi | H | M | **P1** | v5.2 |
| TD-003 | EventCatalog integration (auto-generate dari code) belum diimplementasi | H | H | **P2** | v5.2 |
| TD-004 | OpenAPI specs untuk 6 BC APIs belum generated | H | M | **P2** | v5.2 |
| TD-005 | Cerbos ABAC policies hanya partial; RLS-only untuk simple flows | M | M | **P2** | v5.2 |
| TD-006 | `semantic_cache` table schema belum di Layer 2 SSOT | M | L | **P3** | v5.1.2 |
| TD-007 | `mcp_tool_registry` table schema belum di Layer 2 SSOT | M | L | **P3** | v5.1.2 |
| TD-008 | `ai_usage_records` table schema belum di Layer 2 SSOT | M | L | **P3** | v5.1.2 |
| TD-009 | Runbook catalog (Vol 05 §6) merujuk runbook yang belum ada | H | M | **P1** | v5.1.1 |

### 7.3 Dependency Management

```
UPGRADE POLICY:

  Critical Security     → 24 jam      (emergency patch; bypass standard PR)
  High Security         → 1 minggu    (expedited PR review)
  Medium Security       → 2 minggu    (standard PR review)
  Feature / Minor       → Bulanan     (batched Dependabot PRs)
  Major Version         → Kuartalan   (RFC jika breaking changes)

LICENSE SCANNING (setiap PR):
  npx license-checker --production --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;PostgreSQL"
  Exception: typesense (GPL — isolated via API boundary)
```

### 7.4 OSS Replacement Horizon

```
Ini adalah penggantian KONDISIONAL — bukan action sekarang.
Masing-masing memiliki trigger condition yang mengaktifkan rencana penggantian.

TEKNOLOGI          PENGGANTI          TRIGGER                          EFFORT
──────────────────────────────────────────────────────────────────────────────
Trigger.dev     → Temporal.io        > 1M workflow instances/day       8–12 minggu
Supabase Auth   → Keycloak/Ory       > 5 SAML enterprise requests     12–16 minggu
Vercel compute  → Go + K8s/Fly.io    API cost > 40% revenue           16–24 minggu
pgvector        → Qdrant/Milvus      > 50M vectors/tenant             8–12 minggu
Typesense       → Meilisearch        GPL license issue di core path   4–6 minggu
OpenRouter      → LiteLLM           SLA < 99.5% / cost > 60% AI $   4–8 minggu
pg-boss         → NATS JetStream     > 10K events/detik sustained     8–10 minggu
Drizzle ORM     → Raw pg / SQLx      Go microservice migration needed 6–8 minggu

PROSES PENGGANTIAN:
  1. Vol 10 quarterly review flags condition
  2. RFC filed (docs/architecture/rfc/)
  3. 2-week engineering spike
  4. ADR created: proceed atau defer
  5. Migration plan (phased + rollback strategy)
  6. Execution via Expand/Contract (L-08)
```

### 7.5 Performance Optimization Backlog

| Optimisasi | State Sekarang | Target | Expected Gain | Prioritas |
|------------|---------------|--------|---------------|-----------|
| pgBouncer transaction mode | Session mode | Transaction mode | 3x connection efficiency | **P1** |
| Materialized view debounce | 5s | 2s | 60% latency reduction | P2 |
| HNSW ef_search tuning | 40 (default) | 80 | 15% recall, +20% latency | P2 |
| Valkey semantic cache warm-up | Cold on deploy | Pre-loaded | 30% cache hit rate | P2 |
| Embedding batch size | 100 chunks/call | 500 chunks/call | 5x ingestion throughput | P3 |
| Go microservice (Finance) | Next.js edge | Go service | Sub-ms validation | P2 (post-scale) |

---

## FASE 8 — ROADMAP 12 BULAN

> **Otoritas:** Volume 10 §7

```
Q2 2026 (Juni) — SEKB v5.1 Foundation ✅
  ✅ Semua 10 Volumes selesai (Vol 00–10)
  ✅ Layer 1/2/3 harmonized ke v5.0.2
  ✅ ADR-001, ADR-002, ADR-003
  ✅ Strategy docs: copywriting, SEO/AEO/GEO, IA, homepage blueprint
  ✅ Plugin eventos-skills: 7 AI IDE skills

Q3 2026 (Juli–September) — SEKB v5.1.1: Engineering Blueprint
  🔲 03-engineering.md clean v5.1 (clean slate dari legacy kb)
  🔲 EventCatalog integration — TD-003 partial
  🔲 OpenAPI specs untuk 6 BC APIs — TD-004
  🔲 Layer 2: tambah mcp_tool_registry, ai_usage_records, semantic_cache — TD-006/7/8
  🔲 Production runbook library — TD-009
  🔲 gitleaks di CI pipeline — L-10
  🔲 FORCE RLS semua tabel — R-005

Q4 2026 (Oktober–Desember) — SEKB v5.2: Living Catalogs
  🔲 Automated Event Catalog (generated dari code + AsyncAPI)
  🔲 MCP Tool Registry UI (admin console)
  🔲 Prompt Registry UI (version management + eval harness)
  🔲 5 full-stack traceability chains tambahan — TD-002
  🔲 CI/CD SEKB gates (terminology, cross-reference, enum audit)
  🔲 Cerbos ABAC policy — complete specification TD-005

Q1 2027 (Januari–Maret) — SEKB v5.2.1: AI-Native Optimization
  🔲 Structured JSONB exports untuk AI agent knowledge ingestion
  🔲 Prompt evaluation harness (RAGAS-style auto scoring)
  🔲 Agent memory patterns (conversation history windowing)
  🔲 AI cost attribution dashboard
  🔲 Performance: pgBouncer transaction mode + HNSW tuning

Q2 2027 (April–Juni) — SEKB v6.0: Autonomous Agent Ready
  🔲 Full agentic loop (multi-step reasoning + Approval orchestration)
  🔲 Architecture review: scaling threshold assessment
  🔲 Go microservice PoC untuk Finance domain (jika skala perlu)
  🔲 SEKB v6.0 ratification — 10-year horizon review
```

---

## Referensi Cepat — Mana Dokumen untuk Apa?

| Kebutuhan | Dokumen |
|-----------|---------|
| Prinsip arsitektur, laws L-01–L-10, ubiquitous language | `docs/layers/Layer-1-Constitution-v5.0.2.md` |
| Schema DB, RLS, enums, stored procedures | `docs/layers/Layer-2-Database-SSOT-v5.0.2.md` |
| Tech stack, monorepo, traceability, DX | `docs/layers/Layer-3-EPXA-v5.1.md` |
| Meta-struktur SEKB, volume index | `docs/volumes/00-knowledge-architecture.md` |
| Entity, state machine, domain events | `docs/volumes/01-foundations.md` |
| Bounded contexts, context map, repositories | `docs/volumes/02-enterprise-architecture.md` |
| Technology stack, BFF pattern, cursorrules | `docs/volumes/03-engineering.md` |
| AI safety, MCP tools, RAG, prompt management | `docs/volumes/04-ai-architecture.md` |
| SRE, SLA, deployment, disaster recovery | `docs/volumes/05-operations.md` |
| Governance, compliance, ADR/RFC process | `docs/volumes/06-governance.md` |
| Business capabilities, feature evaluation, use cases | `docs/volumes/07-business.md` |
| UX, design tokens, component standards | `docs/volumes/08-product.md` |
| AI IDE skills, tooling ecosystem, skill selection | `docs/volumes/09-skills-tooling.md` |
| Tech debt, risks, OSS horizon, 12-month roadmap | `docs/volumes/10-remediation-roadmap.md` |
| Agent operating instructions | `docs/ai-ide/SEKB-AI-Agent-Instructions.md` |
| IDE-level rules (baca setiap sesi) | `.cursorrules` |

---

*Dokumen ini adalah sintesis dari seluruh SEKB v5.1. Untuk detail implementasi, selalu merujuk ke dokumen sumber yang tercantum. Jika ada konflik: Layer-1 > Layer-2 > Layer-3 > Volumes.*
