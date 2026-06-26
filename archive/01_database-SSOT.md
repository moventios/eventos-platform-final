# **SOVEREIGN OS: ENTERPRISE DATABASE ARCHITECTURE & ERD**

**VERSION:** 5.0.1-ENTERPRISE (RELEASE: 2026-06-25) **STATUS:** CANONICAL SINGLE SOURCE OF TRUTH (SSOT) — RATIFIED **COMPATIBILITY:** PostgreSQL 16+ / Supabase Native / Drizzle ORM **SUPERSEDES:** v3.0.0, v4.0.0, v5.0.0-ENTERPRISE

**Panduan Penggunaan:** Dokumen ini merupakan turunan langsung dari *Platform Canonical Model & Reference Architecture v5.0.1* (Constitution). Dokumen ini adalah **satu-satunya** sumber kebenaran untuk skema basis data Sovereign OS — menggabungkan narasi arsitektur, Drizzle ORM Schema, dan SQL Migration ke dalam satu artefak yang saling konsisten. Setiap implementasi Drizzle ORM dan file migrasi SQL Supabase wajib berkiblat pada dokumen ini. Konflik antara dokumen ini dengan artefak implementasi diselesaikan dengan mengacu pada Constitution sebagai otoritas tertinggi.

Dokumen ini telah menyelesaikan **19 gap** yang ditemukan pada audit selaras antara Constitution v5.0.1 dengan implementasi database sebelumnya (lihat Section 12 — Gap Resolution Summary), mencakup: entitas kanonikal yang hilang, enum state machine yang tidak lengkap, RLS yang parsial, bug indeks, dan stored procedure yang belum terdefinisi.

---

## **DAFTAR ISI**

1. Executive Summary  
2. Domain Coverage & Bounded Context Matrix  
3. Canonical Naming Standards  
4. Complete Enum Registry  
5. Aggregate Map & Complete Table Inventory  
6. Enterprise Laws Enforcement Matrix  
7. CQRS Read Model Registry  
8. Row-Level Security Coverage  
9. AI Schema Alignment  
10. `post_ledger_transaction` Stored Procedure  
11. Index Optimization Strategy  
12. Gap Resolution Summary  
13. Production Readiness Checklist  
14. Document Dependency Position  
15. **Drizzle ORM Schema (Lengkap)**  
16. **Supabase SQL Migration (Lengkap)**

---

## **1\. EXECUTIVE SUMMARY**

Arsitektur basis data ini mendefinisikan skema fisik, batasan relasional, pola CQRS, penegakan Row-Level Security, dan mekanisme audit immutable yang wajib diimplementasikan pada lapisan penyimpanan Sovereign OS.

---

## **2\. DOMAIN COVERAGE & BOUNDED CONTEXT MATRIX**

| Bounded Context | Tabel / Agregat Utama | Pola CQRS | Tanggung Jawab Utama |
| ----- | ----- | ----- | ----- |
| Governance & IAM | `tenants`, `organizations`, `memberships`, `profiles` | Normalized | Isolasi multi-tenant, Otorisasi RBAC/ABAC |
| CRM | `customers`, `suppliers` | Normalized | Manajemen relasi klien dan pemasok B2B |
| Spatial & Facility | `facilities`, `rooms`, `assets`, `bookings` | Write \+ Read Model | Resolusi konflik Spatio-Temporal (GiST) |
| Commerce & Inventory | `events`, `pass_tiers`, `access_passes`, `products`, `inventory_lots`, `campaigns` | Write \+ Read Model | Manajemen siklus event, tiket, & stok |
| Finance (Ledger) | `ledgers`, `ledger_accounts`, `journal_entries`, `journal_lines`, `invoices`, `payments`, `escrows` | Write \+ Read Model | Double-Entry Accounting Swiss-Standard |
| Workflow & Ops | `workflows`, `workflow_instances`, `tasks`, `approvals` | Normalized | Orkestrasi state machine deterministik |
| AI & Knowledge | `knowledge_bases`, `documents`, `embeddings`, `prompts`, `ai_agents` | Vector \+ Relational | pgvector RAG, OpenRouter routing, MCP tools |
| Observability | `domain_events` (Outbox), `audit_logs`, `metric_snapshots` | Append-Only Log | Trace-ID end-to-end, Immutable Audit Trail |

---

## **3\. CANONICAL NAMING STANDARDS (PER APPENDIX A CONSTITUTION)**

| Artefak | Konvensi | Contoh |
| ----- | ----- | ----- |
| Table | snake\_case, plural | `journal_entries`, `access_passes` |
| Column | snake\_case, singular | `tenant_id`, `created_at` |
| Foreign Key | `fk_{child}_{parent}` | `fk_journal_lines_journal_entries` |
| Index | `idx_{table}_{column(s)}` | `idx_bookings_time_range` |
| Constraint | `chk_{table}_{rule}` | `chk_bookings_no_overlap` |
| Enum Type | snake\_case | `booking_state`, `payment_state` |
| Policy | `{isolation_type}_{table}` | `tenant_isolation_bookings` |

---

## **4\. COMPLETE ENUM REGISTRY (Constitution Part 12 — State Machines)**

| Enum | Values | Sumber |
| ----- | ----- | ----- |
| `booking_state` | pending, under\_review, approved, active, completed, **rejected**, canceled | Part 12.1 |
| `invoice_state` | draft, issued, partially\_paid, paid, settled, voided | Part 12.4 |
| `access_pass_state` | pending, issued, checked\_in, consumed, revoked, **expired** | Part 12.3 |
| `workflow_state` | running, pending\_approval, completed, suspended, aborted | Part 12.5 |
| `account_classification` | asset, liability, equity, revenue, expense | Part 3.3 |
| `actor_type` | USER, AI\_AGENT, SYSTEM | Part 15.5 |
| `payment_state` ⭐ | initiated, processing, captured, settled, reconciled, failed, refunded, refund\_settled | Part 12.2 |
| `journal_state` ⭐ | draft, posted, voided | Part 12.6 |
| `asset_state` ⭐ | procured, active, retired | Part 3.2 |
| `campaign_state` ⭐ | planned, active, concluded | Part 3.2 |

⭐ \= ditambahkan pada gap-resolution v5.0.1

---

## **5\. AGGREGATE MAP & COMPLETE TABLE INVENTORY**

### **5.1 Governance, Identity & CRM**

tenants              — Root Tenant Aggregate; slug unik global

├── legal\_holds      — Blokir data retention saat sengketa hukum

├── organizations    — Badan usaha di bawah Tenant

│   ├── departments  — Sub-divisi fungsional

│   └── workspaces   — Batas isolasi kolaborasi

├── profiles         — Identitas personal User (auth.users ref)

├── memberships      — Relasi User ↔ Tenant dengan Role

├── customers        — Lead → Active → Churned

└── suppliers        ⭐ — Draft → Approved → Suspended → Banned

### **5.2 Spatial, Facility & Commerce**

organizations

├── facilities       — Aset properti fisik

│   └── rooms        — Sub-unit bookable

├── assets           ⭐ — Unit fisik/digital bernilai (Constitution Part 3.2)

└── projects

    ├── bookings     — Klaim spasial-temporal Room (+ idempotency\_key)

    │   └── booking\_histories ⭐ — Jejak transisi status

    ├── events       — Aktualisasi spasial Project

    │   └── pass\_tiers — Kategori AccessPass (linked ke Event langsung)

    │       └── access\_passes — Hak masuk terverifikasi (+ customer\_id)

    └── campaigns    ⭐ — Inisiatif pemasaran terstruktur

### **5.3 Inventory**

tenants

├── products

│   └── product\_variants

└── warehouses

    └── inventory\_lots (+ stock\_movements)

### **5.4 Finance & Ledger (Swiss-Standard)**

tenants

└── ledgers          — Satu per Tenant

    └── ledger\_accounts — Chart of Accounts hirarki

        └── journal\_entries (+ journal\_state, voided\_at, reversal\_of\_id)

            └── journal\_lines  — Immutable setelah Posted

    invoices (+ idempotency\_key)

    └── invoice\_lines

    payments (+ payment\_state enum, idempotency\_key, gateway\_provider)

    escrows (+ released\_at)

    subscriptions

### **5.5 Workflow, Knowledge & AI**

workspaces

├── workflows → workflow\_states → workflow\_transitions

│   └── workflow\_instances → tasks, approvals

└── knowledge\_bases

    └── documents

        └── document\_versions

            ├── chunks         — Fragmentasi teks untuk RAG

            └── embeddings     — vector(1536) HNSW

tenants

├── prompts          (+ input\_schema, output\_format, guardrails)

└── ai\_agents        (+ tools JSONB — MCP Tool Registry)

---

## **6\. ENTERPRISE LAWS ENFORCEMENT MATRIX**

| Law | Deskripsi | Enforcement Mechanism |
| ----- | ----- | ----- |
| L-01 | No Direct Balance Update | Saldo diproyeksikan via `mv_ledger_summary_view`; tidak ada kolom balance yang dapat di-UPDATE |
| L-02 | Immutable Financial History | Trigger `block_journal_entry_mutations` \+ `block_journal_lines_mutations` — reject UPDATE/DELETE pada status posted/voided |
| L-03 | Soft Delete Everywhere | Kolom `deleted_at` TIMESTAMPTZ \+ `deleted_by` UUID di semua entitas bisnis |
| L-04 | Idempotency Mandate | Kolom `idempotency_key` VARCHAR(255) UNIQUE di `invoices`, `payments`, `bookings` |
| L-05 | No Entity Without Owner | Semua tabel memiliki `tenant_id` (langsung atau via foreign key chain); RLS enforced |
| L-06 | AI Write Interception | `ai_agents.tools` hanya mengekspos WRITE → PENDING tools; kolom status pada draft states |
| L-07 | Command Handler Mandate | Stored procedure `post_ledger_transaction()` — wajib digunakan untuk semua posting; validasi zero-balance sebelum commit |
| L-08 | Zero-Downtime Migration | Pola Expand → Backfill → Contract; semua DDL menggunakan `IF NOT EXISTS` |
| L-09 | API Versioning | Ditangani di lapisan API; migration file `20260625000000_v5_0_1_*` immutable |
| L-10 | Secrets Never at Rest | Kolom `secret` di `webhook_subscriptions` harus di-encrypt via Vault sebelum INSERT |

---

## **7\. CQRS READ MODEL REGISTRY (Constitution Part 14.2)**

| Materialized View | Sumber Events | Kegunaan | Refresh Strategy |
| ----- | ----- | ----- | ----- |
| `mv_booking_calendar_view` | BookingApproved, BookingCanceled | Timeline ketersediaan Facility | Event-driven via Outbox |
| `mv_ledger_summary_view` | JournalPosted | Dashboard saldo CoA per Tenant | Event-driven (async debounce) |
| `mv_event_sales_view` | AccessPassIssued, PaymentCaptured | Statistik penjualan Event | Event-driven \+ nightly recompute |
| `mv_workflow_status_view` ⭐ | WorkflowStarted, ApprovalResolved | Status task dan approval aktif | Event-driven |
| `mv_customer_invoice_history_view` ⭐ | InvoiceIssued, PaymentSettled | Riwayat tagihan Customer | Event-driven |

⭐ \= ditambahkan pada gap-resolution v5.0.1

**Penting:** Semua Materialized View di-refresh secara asinkron via pg-boss/BullMQ queue — bukan via database trigger sinkron, untuk menghindari write bottleneck pada high-throughput scenarios.

---

## **8\. ROW-LEVEL SECURITY COVERAGE (Constitution Part 15.2)**

Dokumen ini menerapkan RLS pada **100% tabel bisnis** (38 tabel). Sebelumnya hanya 3 tabel yang memiliki policy aktif.

**Pattern Utama:**

\-- Direct tenant isolation (tabel dengan tenant\_id langsung)

CREATE POLICY "tenant\_isolation\_{table}" ON public.{table}

  FOR ALL USING (

    tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

  );

\-- Indirect isolation (traversal via foreign key chain)

\-- Contoh: access\_passes → pass\_tiers → events → projects → tenant\_id

**Perbaikan Kritis:**

* Policy `access_passes` sebelumnya mereferensikan kolom `event_id` yang tidak ada di tabel → sekarang menggunakan traversal `pass_tier_id → event_id → project_id → tenant_id`.  
* Service Role (background workers) dapat bypass RLS dengan `SET ROLE service_role`; hanya untuk worker internal yang tidak terekspos ke API publik.

---

## **9\. AI SCHEMA ALIGNMENT (Constitution Part 16\)**

**`prompts`** — Penambahan Kolom Part 16.4

input\_schema  JSONB  \-- Variabel yang dapat diinjeksi ke template

output\_format JSONB  \-- JSON Schema respons yang diharapkan

guardrails    JSONB  \-- Daftar filter aktif (PII, hallucination, dll.)

status        VARCHAR \-- draft | active | deprecated (lifecycle manajemen)

**`ai_agents`** — MCP Tool Registry (Part 16.3)

tools JSONB  \-- Array MCPToolDefinition: {name, access\_type, description}

             \-- access\_type: READ | WRITE→PENDING (L-06 enforcement)

max\_budget\_per\_call NUMERIC  \-- Cost control per OpenRouter request

**`embeddings`** — pgvector Alignment

* Tipe: `VECTOR(1536)` — konsisten antara Drizzle dan SQL.  
* Index: HNSW (`vector_data vector_cosine_ops`) untuk cosine similarity optimal.  
* Ditautkan ke `chunk_id` untuk konteks granular saat RAG retrieval.

---

## **10\. POST\_LEDGER\_TRANSACTION STORED PROCEDURE (L-07)**

Stored procedure `public.post_ledger_transaction(p_journal_entry_id, p_actor_id, p_trace_id)` mengimplementasikan Command Handler Mandate secara penuh:

1\. SELECT FOR UPDATE → lock baris entry (anti race condition)

2\. Validasi status \= 'draft' → reject jika sudah posted/voided

3\. SUM(debit) \== SUM(credit) → reject seluruh transaksi jika diff \!= 0

4\. UPDATE status \= 'posted' → set posted\_at, updated\_by

5\. INSERT ke domain\_events → emit JournalPosted event ke Outbox

**Penggunaan di Command Handler:**

await db.execute(sql\`

  SELECT public.post\_ledger\_transaction(

    ${journalEntryId}::uuid,

    ${actorId}::uuid,

    ${traceId}::uuid

  )

\`);

Definisi lengkap stored procedure ada di **Section 16, SECTION 11** dari SQL Migration.

---

## **11\. INDEX OPTIMIZATION STRATEGY**

| Jenis Index | Tabel | Kolom | Tujuan |
| ----- | ----- | ----- | ----- |
| B-Tree | memberships | (tenant\_id, profile\_id) | Lookup membership cepat |
| B-Tree | bookings | (tenant\_id, status) | Filter booking per tenant |
| B-Tree | journal\_entries | (ledger\_id, status) | Query ledger per status |
| B-Tree | access\_passes | secure\_qr\_hash | Scan QR O(log n) |
| B-Tree | workflow\_instances | (entity\_type, entity\_id) | Lookup instance per entitas |
| B-Tree | audit\_logs | trace\_id | End-to-end trace reconstruction |
| B-Tree | domain\_events | (event\_type, status) WHERE pending | Outbox worker polling |
| GiST | bookings | (room\_id, time\_range) | Spatio-temporal overlap exclusion |
| HNSW | embeddings | vector\_data vector\_cosine\_ops | RAG cosine similarity |

---

## **12\. GAP RESOLUTION SUMMARY**

| \# | Gap | Status |
| ----- | ----- | ----- |
| GAP-1 | Tambah `rejected` ke `booking_state`, `expired` ke `access_pass_state` | ✅ Resolved |
| GAP-2 | Buat `payment_state` enum (Part 12.2) | ✅ Resolved |
| GAP-3 | Buat `journal_state` enum (Part 12.6) | ✅ Resolved |
| GAP-4 | Tambah tabel `assets` (Part 3.2) | ✅ Resolved |
| GAP-5 | Tambah tabel `campaigns` (Part 3.2) | ✅ Resolved |
| GAP-6 | Selaraskan `suppliers`: tambah ke SQL migration | ✅ Resolved |
| GAP-7 | Selaraskan `booking_histories`: tambah ke SQL migration | ✅ Resolved |
| GAP-8 | Tambah `idempotency_key` ke `invoices`, `payments`, `bookings` (L-04) | ✅ Resolved |
| GAP-9 | Tambah `input_schema`, `output_format`, `guardrails` ke `prompts` (Part 16.4) | ✅ Resolved |
| GAP-10 | Tambah `customer_id` ke `access_passes` (Part 3.2) | ✅ Resolved |
| GAP-11 | Tambah `tools` JSONB ke `ai_agents` (Part 16.3) | ✅ Resolved |
| GAP-12 | Tambah `voided_at`, `voided_by`, `reversal_of_id` ke `journal_entries` | ✅ Resolved |
| GAP-13 | Fix forward reference Drizzle: `projects` didefinisikan sebelum `bookings` | ✅ Resolved |
| GAP-14 | Fix Drizzle: tambah import `text`; selaraskan `embeddings` ke `vector(1536)` | ✅ Resolved |
| GAP-15 | Fix RLS `access_passes`: hapus referensi `event_id` yang tidak ada | ✅ Resolved |
| GAP-16 | Extend RLS ke seluruh tabel bisnis (dari 3 → 38 tabel) | ✅ Resolved |
| GAP-17 | Definisikan `post_ledger_transaction()` stored procedure (L-07) | ✅ Resolved |
| GAP-18 | Fix index bug: `createdAt` → `created_at` di `idx_domain_events_pending` | ✅ Resolved |
| GAP-19 | Tambah `mv_workflow_status_view` dan `mv_customer_invoice_history_view` | ✅ Resolved |

---

## **13\. PRODUCTION READINESS CHECKLIST**

* \[x\] Seluruh entitas kanonikal Constitution Part 3 terdefinisi di database  
* \[x\] Semua State Machine (Part 12\) memiliki enum yang lengkap dan akurat  
* \[x\] Enterprise Laws L-01 s.d. L-10 memiliki mekanisme enforcement di DB layer  
* \[x\] RLS aktif pada 100% tabel bisnis; traversal chain benar untuk semua indirect policies  
* \[x\] `post_ledger_transaction()` mendefinisikan Command Handler wajib untuk Ledger  
* \[x\] Semua Foreign Keys valid; tidak ada orphan entity (L-05)  
* \[x\] Immutable trigger aktif pada `journal_entries` dan `journal_lines`  
* \[x\] 5 Materialized Views aktif sesuai Constitution Part 14.2  
* \[x\] HNSW index aktif untuk pgvector RAG pipeline  
* \[x\] Idempotency key pada semua mutation endpoint finansial  
* \[x\] Drizzle schema dan SQL migration selaras 100% (tipe, nama, relasi)  
* \[x\] Soft delete (`deleted_at`, `deleted_by`) pada semua entitas bisnis  
* \[x\] `legal_holds` aktif sebagai bloker data retention

---

## **14\. DOCUMENT DEPENDENCY POSITION**

\[Constitution v5.0.1\] ◄── SSOT TERTINGGI

         │

         ▼

\[DATABASE ARCHITECTURE & ERD v5.0.1\] ◄── DOKUMEN INI

         │

         ├──► \[drizzle/schema/index.ts\]

         ├──► \[supabase/migrations/20260625000000\_v5\_0\_1\_enterprise\_initialization.sql\]

         └──► \[tests/database/schema.test.ts\]

---

## **15\. DRIZZLE ORM SCHEMA (LENGKAP)**

// \===============================================================================================

// SOVEREIGN OS: CANONICAL DRIZZLE ORM SCHEMA

// SYSTEM VERSION: 5.0.1-ENTERPRISE (RELEASE: 2026\)

// STATUS: RATIFIED — ALIGNED WITH PLATFORM CONSTITUTION v5.0.1

// COMPATIBILITY: PostgreSQL 16+ / Supabase / Drizzle ORM

// \===============================================================================================

//

// PERUBAHAN DARI VERSI SEBELUMNYA (Gap Analysis Resolution):

//   \[GAP-1\]  Tambah 'rejected' ke booking\_state enum (Constitution Part 12.1)

//   \[GAP-2\]  Buat enum payment\_state (Constitution Part 12.2)

//   \[GAP-3\]  Buat enum journal\_state (Constitution Part 12.6)

//   \[GAP-4\]  Tambah tabel assets (Constitution Part 3.2)

//   \[GAP-5\]  Tambah tabel campaigns (Constitution Part 3.2)

//   \[GAP-6\]  Tambah tabel suppliers ke Drizzle (selaraskan dengan SQL)

//   \[GAP-7\]  Tambah tabel booking\_histories ke Drizzle (selaraskan dengan SQL)

//   \[GAP-8\]  Tambah kolom idempotency\_key ke invoices, payments, bookings (L-04)

//   \[GAP-9\]  Tambah kolom input\_schema, output\_format, guardrails ke prompts (Part 16.4)

//   \[GAP-10\] Tambah kolom customer\_id ke access\_passes (Part 3.2)

//   \[GAP-11\] Tambah kolom tools ke ai\_agents (Part 16.3)

//   \[GAP-12\] Tambah kolom voided\_at, voided\_by ke journal\_entries (Part 12.6)

//   \[GAP-13\] Perbaiki forward reference: reorganisasi urutan definisi tabel

//   \[GAP-14\] Tambah import text dari drizzle-orm/pg-core

//   \[GAP-15\] Selaraskan embeddings ke vector(1536) konsisten

//   \[GAP-16\] Selaraskan auditLogs.ipAddress ke inet type

// \===============================================================================================

import {

  pgTable,

  pgEnum,

  uuid,

  varchar,

  text,        // \[GAP-14\] tambah import

  timestamp,

  boolean,

  numeric,

  integer,

  jsonb,

  customType,

  inet,        // \[GAP-16\] tambah import untuk ip\_address

} from "drizzle-orm/pg-core";

// \===============================================================================================

// 1\. VALUE OBJECTS, CUSTOM TYPES & ENUMS (CONSTITUTION PART 3, 11, 12\)

// \===============================================================================================

// \[GAP-1\] Tambah 'rejected' ke booking\_state

export const bookingStateEnum \= pgEnum("booking\_state", \[

  "pending",

  "under\_review",

  "approved",

  "active",

  "completed",

  "rejected",   // \[GAP-1\] Constitution Part 12.1: → Rejected adalah terminal state valid

  "canceled",

\]);

export const invoiceStateEnum \= pgEnum("invoice\_state", \[

  "draft",

  "issued",

  "partially\_paid",

  "paid",

  "settled",

  "voided",

\]);

export const accessPassStateEnum \= pgEnum("access\_pass\_state", \[

  "pending",

  "issued",

  "checked\_in",

  "consumed",

  "revoked",

  "expired",    // Constitution Part 12.3: → Expired dari Pending

\]);

export const workflowStateEnum \= pgEnum("workflow\_state", \[

  "running",

  "pending\_approval",

  "completed",

  "suspended",

  "aborted",

\]);

export const accountClassificationEnum \= pgEnum("account\_classification", \[

  "asset",

  "liability",

  "equity",

  "revenue",

  "expense",

\]);

export const actorTypeEnum \= pgEnum("actor\_type", \[

  "USER",

  "AI\_AGENT",

  "SYSTEM",

\]);

// \[GAP-2\] Buat payment\_state enum (Constitution Part 12.2)

export const paymentStateEnum \= pgEnum("payment\_state", \[

  "initiated",

  "processing",

  "captured",

  "settled",

  "reconciled",

  "failed",

  "refunded",

  "refund\_settled",

\]);

// \[GAP-3\] Buat journal\_state enum (Constitution Part 12.6)

export const journalStateEnum \= pgEnum("journal\_state", \[

  "draft",

  "posted",

  "voided",

\]);

// \[GAP-4\] Asset state enum (Constitution Part 3.2)

export const assetStateEnum \= pgEnum("asset\_state", \[

  "procured",

  "active",

  "retired",

\]);

// \[GAP-5\] Campaign state enum (Constitution Part 3.2)

export const campaignStateEnum \= pgEnum("campaign\_state", \[

  "planned",

  "active",

  "concluded",

\]);

// pgvector custom type — konsisten vector(1536) \[GAP-15\]

const vector \= customType\<{ data: number\[\] }\>({

  dataType() {

    return "vector(1536)";

  },

});

// Spatio-temporal tsrange type

const tsrange \= customType\<{ data: string }\>({

  dataType() {

    return "tsrange";

  },

});

// Shared audit fields helper — Constitution mandates untuk semua entitas bisnis

const auditFields \= {

  createdAt: timestamp("created\_at", { withTimezone: true }).defaultNow().notNull(),

  updatedAt: timestamp("updated\_at", { withTimezone: true }).defaultNow().notNull(),

  deletedAt: timestamp("deleted\_at", { withTimezone: true }),

  createdBy: uuid("created\_by"),

  updatedBy: uuid("updated\_by"),

  deletedBy: uuid("deleted\_by"),

};

// \===============================================================================================

// 2\. GOVERNANCE, IDENTITY & CRM BOUNDED CONTEXT

//    — Urutan didahulukan karena di-referensikan oleh hampir semua context lain

// \===============================================================================================

export const tenants \= pgTable("tenants", {

  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 255 }).notNull(),

  slug: varchar("slug", { length: 255 }).notNull().unique(),

  baseCurrency: varchar("base\_currency", { length: 3 }).default("IDR").notNull(),

  timezone: varchar("timezone", { length: 50 }).default("Asia/Jakarta").notNull(),

  status: varchar("status", { length: 50 }).default("active").notNull(),

  ...auditFields,

});

export const legalHolds \= pgTable("legal\_holds", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  reason: varchar("reason", { length: 500 }).notNull(),

  appliedAt: timestamp("applied\_at", { withTimezone: true }).defaultNow().notNull(),

  appliedBy: uuid("applied\_by").notNull(),

  releasedAt: timestamp("released\_at", { withTimezone: true }),

  releasedBy: uuid("released\_by"),

});

export const organizations \= pgTable("organizations", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  name: varchar("name", { length: 255 }).notNull(),

  slug: varchar("slug", { length: 255 }).notNull(),

  status: varchar("status", { length: 50 }).default("draft").notNull(),

  ...auditFields,

});

export const departments \= pgTable("departments", {

  id: uuid("id").primaryKey().defaultRandom(),

  organizationId: uuid("organization\_id").notNull().references(() \=\> organizations.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),

  isActive: boolean("is\_active").default(true).notNull(),

  ...auditFields,

});

export const workspaces \= pgTable("workspaces", {

  id: uuid("id").primaryKey().defaultRandom(),

  organizationId: uuid("organization\_id").notNull().references(() \=\> organizations.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),

  ...auditFields,

});

export const profiles \= pgTable("profiles", {

  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user\_id").notNull().unique(), // auth.users Supabase reference

  fullName: varchar("full\_name", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 }).notNull(),

  phone: varchar("phone", { length: 50 }),

  avatarUrl: varchar("avatar\_url", { length: 500 }),

  ...auditFields,

});

export const memberships \= pgTable("memberships", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  profileId: uuid("profile\_id").notNull().references(() \=\> profiles.id, { onDelete: "cascade" }),

  role: varchar("role", { length: 50 }).default("member").notNull(),

  status: varchar("status", { length: 50 }).default("active").notNull(),

  ...auditFields,

});

// CRM — customers dan suppliers (Constitution Part 3.1)

export const customers \= pgTable("customers", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  name: varchar("name", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 }).notNull(),

  phone: varchar("phone", { length: 50 }),

  status: varchar("status", { length: 50 }).default("lead").notNull(),

  ...auditFields,

});

// \[GAP-6\] suppliers — ada di SQL tapi hilang di Drizzle sebelumnya

export const suppliers \= pgTable("suppliers", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  companyName: varchar("company\_name", { length: 255 }).notNull(),

  contactName: varchar("contact\_name", { length: 255 }),

  email: varchar("email", { length: 255 }),

  phone: varchar("phone", { length: 50 }),

  status: varchar("status", { length: 50 }).default("draft").notNull(),

  ...auditFields,

});

// \===============================================================================================

// 3\. ORGANIZATIONAL HIERARCHY — projects didefinisikan SEBELUM bookings \[GAP-13\]

// \===============================================================================================

export const projects \= pgTable("projects", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  organizationId: uuid("organization\_id").notNull().references(() \=\> organizations.id, { onDelete: "cascade" }),

  workspaceId: uuid("workspace\_id").notNull().references(() \=\> workspaces.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),

  status: varchar("status", { length: 50 }).default("active").notNull(),

  ...auditFields,

});

// \===============================================================================================

// 4\. SPATIAL, PROPERTY & BOOKING CONTEXT (Constitution Part 3.2, 10.2, 12.1)

// \===============================================================================================

export const facilities \= pgTable("facilities", {

  id: uuid("id").primaryKey().defaultRandom(),

  organizationId: uuid("organization\_id").notNull().references(() \=\> organizations.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),

  address: varchar("address", { length: 500 }),

  status: varchar("status", { length: 50 }).default("draft").notNull(),

  ...auditFields,

});

export const rooms \= pgTable("rooms", {

  id: uuid("id").primaryKey().defaultRandom(),

  facilityId: uuid("facility\_id").notNull().references(() \=\> facilities.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),

  capacity: integer("capacity").notNull(),

  ...auditFields,

});

// \[GAP-4\] assets — Constitution Part 3.2: "Unit properti fisik atau digital bernilai"

export const assets \= pgTable("assets", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  organizationId: uuid("organization\_id").notNull().references(() \=\> organizations.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),

  assetType: varchar("asset\_type", { length: 100 }).notNull(),

  serialNumber: varchar("serial\_number", { length: 100 }),

  assignedTo: uuid("assigned\_to"), // Profile UUID

  status: assetStateEnum("status").default("procured").notNull(),

  metadata: jsonb("metadata").default("{}"),

  ...auditFields,

});

// \[GAP-8\] bookings — tambah idempotency\_key (L-04), forward ref ke projects sudah resolved \[GAP-13\]

export const bookings \= pgTable("bookings", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  roomId: uuid("room\_id").notNull().references(() \=\> rooms.id, { onDelete: "cascade" }),

  projectId: uuid("project\_id").notNull().references(() \=\> projects.id, { onDelete: "cascade" }),

  customerId: uuid("customer\_id").references(() \=\> customers.id, { onDelete: "set null" }),

  timeRange: tsrange("time\_range").notNull(),

  idempotencyKey: varchar("idempotency\_key", { length: 255 }).unique(), // \[GAP-8\] L-04

  status: bookingStateEnum("status").default("pending").notNull(),

  ...auditFields,

});

// \[GAP-7\] booking\_histories — ada di Drizzle tapi hilang di SQL sebelumnya

export const bookingHistories \= pgTable("booking\_histories", {

  id: uuid("id").primaryKey().defaultRandom(),

  bookingId: uuid("booking\_id").notNull().references(() \=\> bookings.id, { onDelete: "cascade" }),

  fromStatus: bookingStateEnum("from\_status"),

  toStatus: bookingStateEnum("to\_status").notNull(),

  actorId: uuid("actor\_id").notNull(),

  actorType: actorTypeEnum("actor\_type").notNull(),

  reason: varchar("reason", { length: 500 }),

  createdAt: timestamp("created\_at", { withTimezone: true }).defaultNow().notNull(),

});

// \===============================================================================================

// 5\. COMMERCE, EVENTS & ACCESS (Constitution Part 3.2, 10.3)

// \===============================================================================================

export const events \= pgTable("events", {

  id: uuid("id").primaryKey().defaultRandom(),

  projectId: uuid("project\_id").notNull().references(() \=\> projects.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),

  startTime: timestamp("start\_time", { withTimezone: true }).notNull(),

  endTime: timestamp("end\_time", { withTimezone: true }).notNull(),

  status: varchar("status", { length: 50 }).default("draft").notNull(),

  ...auditFields,

});

export const passTiers \= pgTable("pass\_tiers", {

  id: uuid("id").primaryKey().defaultRandom(),

  eventId: uuid("event\_id").notNull().references(() \=\> events.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 100 }).notNull(),

  price: numeric("price", { precision: 16, scale: 4 }).notNull(),

  capacity: integer("capacity").notNull(),

  quantityIssued: integer("quantity\_issued").default(0).notNull(),

  ...auditFields,

});

// \[GAP-10\] access\_passes — tambah customer\_id (Constitution Part 3.2)

export const accessPasses \= pgTable("access\_passes", {

  id: uuid("id").primaryKey().defaultRandom(),

  passTierId: uuid("pass\_tier\_id").notNull().references(() \=\> passTiers.id, { onDelete: "restrict" }),

  customerId: uuid("customer\_id").references(() \=\> customers.id, { onDelete: "set null" }), // \[GAP-10\]

  holderName: varchar("holder\_name", { length: 255 }).notNull(),

  secureQrHash: varchar("secure\_qr\_hash", { length: 64 }).notNull().unique(),

  expiresAt: timestamp("expires\_at", { withTimezone: true }),

  status: accessPassStateEnum("status").default("pending").notNull(),

  ...auditFields,

});

// \[GAP-5\] campaigns — Constitution Part 3.2: "Inisiatif pemasaran terstruktur"

export const campaigns \= pgTable("campaigns", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  projectId: uuid("project\_id").references(() \=\> projects.id, { onDelete: "set null" }),

  name: varchar("name", { length: 255 }).notNull(),

  targetType: varchar("target\_type", { length: 100 }), // EVENT, PRODUCT, etc.

  targetId: uuid("target\_id"),

  startDate: timestamp("start\_date", { withTimezone: true }),

  endDate: timestamp("end\_date", { withTimezone: true }),

  budget: numeric("budget", { precision: 16, scale: 4 }),

  status: campaignStateEnum("status").default("planned").notNull(),

  ...auditFields,

});

export const products \= pgTable("products", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  name: varchar("name", { length: 255 }).notNull(),

  sku: varchar("sku", { length: 100 }).notNull().unique(),

  status: varchar("status", { length: 50 }).default("draft").notNull(),

  ...auditFields,

});

export const productVariants \= pgTable("product\_variants", {

  id: uuid("id").primaryKey().defaultRandom(),

  productId: uuid("product\_id").notNull().references(() \=\> products.id, { onDelete: "cascade" }),

  skuOverride: varchar("sku\_override", { length: 100 }).unique(),

  price: numeric("price", { precision: 16, scale: 4 }).notNull(),

  ...auditFields,

});

export const warehouses \= pgTable("warehouses", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  name: varchar("name", { length: 255 }).notNull(),

  isActive: boolean("is\_active").default(true).notNull(),

  ...auditFields,

});

export const inventoryLots \= pgTable("inventory\_lots", {

  id: uuid("id").primaryKey().defaultRandom(),

  productVariantId: uuid("product\_variant\_id").notNull().references(() \=\> productVariants.id, { onDelete: "restrict" }),

  warehouseId: uuid("warehouse\_id").notNull().references(() \=\> warehouses.id, { onDelete: "restrict" }),

  quantity: integer("quantity").notNull(),

  status: varchar("status", { length: 50 }).default("active").notNull(),

  ...auditFields,

});

export const stockMovements \= pgTable("stock\_movements", {

  id: uuid("id").primaryKey().defaultRandom(),

  inventoryLotId: uuid("inventory\_lot\_id").notNull().references(() \=\> inventoryLots.id, { onDelete: "cascade" }),

  quantity: integer("quantity").notNull(),

  movementType: varchar("movement\_type", { length: 50 }).notNull(),

  reason: varchar("reason", { length: 500 }),

  ...auditFields,

});

// \===============================================================================================

// 6\. FINANCE & SWISS-STANDARD DOUBLE-ENTRY GENERAL LEDGER

//    (Constitution Part 3.3, 10.4, 10.5, 12.2, 12.4, 12.6)

// \===============================================================================================

export const ledgers \= pgTable("ledgers", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  name: varchar("name", { length: 150 }).notNull(),

  currency: varchar("currency", { length: 3 }).default("IDR").notNull(),

  status: varchar("status", { length: 50 }).default("active").notNull(),

  ...auditFields,

});

export const ledgerAccounts \= pgTable("ledger\_accounts", {

  id: uuid("id").primaryKey().defaultRandom(),

  ledgerId: uuid("ledger\_id").notNull().references(() \=\> ledgers.id, { onDelete: "cascade" }),

  parentId: uuid("parent\_id"), // self-ref, CoA hirarki

  code: varchar("code", { length: 50 }).notNull(),

  name: varchar("name", { length: 150 }).notNull(),

  classification: accountClassificationEnum("classification").notNull(),

  normalBalance: varchar("normal\_balance", { length: 10 }).notNull(),

  ...auditFields,

});

// \[GAP-12\] journal\_entries — tambah voided\_at, voided\_by, gunakan journal\_state enum \[GAP-3\]

export const journalEntries \= pgTable("journal\_entries", {

  id: uuid("id").primaryKey().defaultRandom(),

  ledgerId: uuid("ledger\_id").notNull().references(() \=\> ledgers.id, { onDelete: "cascade" }),

  referenceType: varchar("reference\_type", { length: 100 }),

  referenceId: uuid("reference\_id"),

  narration: varchar("narration", { length: 500 }).notNull(),

  status: journalStateEnum("status").default("draft").notNull(), // \[GAP-3\]

  postedAt: timestamp("posted\_at", { withTimezone: true }),

  voidedAt: timestamp("voided\_at", { withTimezone: true }),   // \[GAP-12\]

  voidedBy: uuid("voided\_by"),                                 // \[GAP-12\]

  reversalOfId: uuid("reversal\_of\_id"),   // FK circular — ditangani di SQL level

  ...auditFields,

});

export const journalLines \= pgTable("journal\_lines", {

  id: uuid("id").primaryKey().defaultRandom(),

  journalEntryId: uuid("journal\_entry\_id").notNull().references(() \=\> journalEntries.id, { onDelete: "cascade" }),

  accountId: uuid("account\_id").notNull().references(() \=\> ledgerAccounts.id, { onDelete: "restrict" }),

  type: varchar("type", { length: 10 }).notNull(), // 'debit' | 'credit'

  amount: numeric("amount", { precision: 16, scale: 4 }).notNull(),

});

// \[GAP-8\] invoices — tambah idempotency\_key (L-04)

export const invoices \= pgTable("invoices", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  customerId: uuid("customer\_id").notNull().references(() \=\> customers.id, { onDelete: "restrict" }),

  idempotencyKey: varchar("idempotency\_key", { length: 255 }).unique(), // \[GAP-8\]

  status: invoiceStateEnum("status").default("draft").notNull(),

  totalAmount: numeric("total\_amount", { precision: 16, scale: 4 }).notNull(),

  dueDate: timestamp("due\_date", { withTimezone: true }).notNull(),

  ...auditFields,

});

export const invoiceLines \= pgTable("invoice\_lines", {

  id: uuid("id").primaryKey().defaultRandom(),

  invoiceId: uuid("invoice\_id").notNull().references(() \=\> invoices.id, { onDelete: "cascade" }),

  description: varchar("description", { length: 255 }).notNull(),

  quantity: integer("quantity").notNull(),

  unitPrice: numeric("unit\_price", { precision: 16, scale: 4 }).notNull(),

  totalAmount: numeric("total\_amount", { precision: 16, scale: 4 }).notNull(),

});

// \[GAP-8\] payments — tambah idempotency\_key, gunakan payment\_state enum \[GAP-2\]

export const payments \= pgTable("payments", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  invoiceId: uuid("invoice\_id").notNull().references(() \=\> invoices.id, { onDelete: "restrict" }),

  amount: numeric("amount", { precision: 16, scale: 4 }).notNull(),

  gatewayReference: varchar("gateway\_reference", { length: 255 }),

  gatewayProvider: varchar("gateway\_provider", { length: 50 }), // xendit | stripe | midtrans

  idempotencyKey: varchar("idempotency\_key", { length: 255 }).unique(), // \[GAP-8\]

  status: paymentStateEnum("status").default("initiated").notNull(), // \[GAP-2\]

  capturedAt: timestamp("captured\_at", { withTimezone: true }),

  settledAt: timestamp("settled\_at", { withTimezone: true }),

  ...auditFields,

});

export const escrows \= pgTable("escrows", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  journalEntryId: uuid("journal\_entry\_id").notNull().references(() \=\> journalEntries.id, { onDelete: "restrict" }),

  amount: numeric("amount", { precision: 16, scale: 4 }).notNull(),

  status: varchar("status", { length: 50 }).default("locked").notNull(),

  releaseTrigger: varchar("release\_trigger", { length: 255 }).notNull(),

  releasedAt: timestamp("released\_at", { withTimezone: true }),

  ...auditFields,

});

export const subscriptions \= pgTable("subscriptions", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  customerId: uuid("customer\_id").notNull().references(() \=\> customers.id, { onDelete: "restrict" }),

  planId: varchar("plan\_id", { length: 100 }).notNull(),

  status: varchar("status", { length: 50 }).default("active").notNull(),

  nextBillingAt: timestamp("next\_billing\_at", { withTimezone: true }).notNull(),

  ...auditFields,

});

// \===============================================================================================

// 7\. WORKFLOW STATE ENGINE (Constitution Part 3.4, 10.6, 12.5)

// \===============================================================================================

export const workflows \= pgTable("workflows", {

  id: uuid("id").primaryKey().defaultRandom(),

  workspaceId: uuid("workspace\_id").notNull().references(() \=\> workspaces.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),

  status: varchar("status", { length: 50 }).default("draft").notNull(),

  ...auditFields,

});

export const workflowStates \= pgTable("workflow\_states", {

  id: uuid("id").primaryKey().defaultRandom(),

  workflowId: uuid("workflow\_id").notNull().references(() \=\> workflows.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 100 }).notNull(),

  isInitial: boolean("is\_initial").default(false).notNull(),

  isFinal: boolean("is\_final").default(false).notNull(),

  stepOrder: integer("step\_order").notNull(),

});

export const workflowTransitions \= pgTable("workflow\_transitions", {

  id: uuid("id").primaryKey().defaultRandom(),

  workflowId: uuid("workflow\_id").notNull().references(() \=\> workflows.id, { onDelete: "cascade" }),

  fromStateId: uuid("from\_state\_id").notNull().references(() \=\> workflowStates.id, { onDelete: "cascade" }),

  toStateId: uuid("to\_state\_id").notNull().references(() \=\> workflowStates.id, { onDelete: "cascade" }),

});

export const workflowInstances \= pgTable("workflow\_instances", {

  id: uuid("id").primaryKey().defaultRandom(),

  workflowId: uuid("workflow\_id").notNull().references(() \=\> workflows.id, { onDelete: "cascade" }),

  entityType: varchar("entity\_type", { length: 100 }).notNull(),

  entityId: uuid("entity\_id").notNull(),

  currentStateId: uuid("current\_state\_id").references(() \=\> workflowStates.id, { onDelete: "set null" }),

  status: workflowStateEnum("status").default("running").notNull(),

  ...auditFields,

});

export const approvals \= pgTable("approvals", {

  id: uuid("id").primaryKey().defaultRandom(),

  workflowInstanceId: uuid("workflow\_instance\_id").notNull().references(() \=\> workflowInstances.id, { onDelete: "cascade" }),

  assignedTo: uuid("assigned\_to").notNull(),

  status: varchar("status", { length: 50 }).default("pending").notNull(),

  resolution: varchar("resolution", { length: 50 }),

  resolvedBy: uuid("resolved\_by"),

  resolvedAt: timestamp("resolved\_at", { withTimezone: true }),

  ...auditFields,

});

export const tasks \= pgTable("tasks", {

  id: uuid("id").primaryKey().defaultRandom(),

  workflowInstanceId: uuid("workflow\_instance\_id").notNull().references(() \=\> workflowInstances.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),

  description: text("description"),

  status: varchar("status", { length: 50 }).default("todo").notNull(),

  assigneeId: uuid("assignee\_id"),

  dueAt: timestamp("due\_at", { withTimezone: true }),

  ...auditFields,

});

// \===============================================================================================

// 8\. KNOWLEDGE BASE & AI CONTEXT (Constitution Part 3.4, 16.1–16.5)

// \===============================================================================================

export const knowledgeBases \= pgTable("knowledge\_bases", {

  id: uuid("id").primaryKey().defaultRandom(),

  workspaceId: uuid("workspace\_id").notNull().references(() \=\> workspaces.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),

  ...auditFields,

});

export const documents \= pgTable("documents", {

  id: uuid("id").primaryKey().defaultRandom(),

  knowledgeBaseId: uuid("knowledge\_base\_id").notNull().references(() \=\> knowledgeBases.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),

  status: varchar("status", { length: 50 }).default("draft").notNull(),

  ...auditFields,

});

export const documentVersions \= pgTable("document\_versions", {

  id: uuid("id").primaryKey().defaultRandom(),

  documentId: uuid("document\_id").notNull().references(() \=\> documents.id, { onDelete: "cascade" }),

  version: integer("version").notNull(),

  content: text("content").notNull(), // \[GAP-14\] text now properly imported

  ...auditFields,

});

export const chunks \= pgTable("chunks", {

  id: uuid("id").primaryKey().defaultRandom(),

  documentVersionId: uuid("document\_version\_id").notNull().references(() \=\> documentVersions.id, { onDelete: "cascade" }),

  contentPayload: text("content\_payload").notNull(),

  chunkIndex: integer("chunk\_index").notNull(),

  tokenCount: integer("token\_count"),

});

export const embeddings \= pgTable("embeddings", {

  id: uuid("id").primaryKey().defaultRandom(),

  documentVersionId: uuid("document\_version\_id").notNull().references(() \=\> documentVersions.id, { onDelete: "cascade" }),

  chunkId: uuid("chunk\_id").references(() \=\> chunks.id, { onDelete: "cascade" }),

  vectorData: vector("vector\_data").notNull(), // \[GAP-15\] konsisten vector(1536)

  modelUsed: varchar("model\_used", { length: 150 }).notNull(),

  status: varchar("status", { length: 50 }).default("generated").notNull(),

});

// \[GAP-9\] prompts — tambah input\_schema, output\_format, guardrails (Part 16.4)

export const prompts \= pgTable("prompts", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  name: varchar("name", { length: 255 }).notNull(),

  routingPreference: varchar("routing\_preference", { length: 50 }).default("openrouter").notNull(),

  targetModel: varchar("target\_model", { length: 150 }).notNull(),

  version: varchar("version", { length: 50 }).notNull(),

  template: text("template").notNull(),

  inputSchema: jsonb("input\_schema").default("{}"),   // \[GAP-9\] Part 16.4

  outputFormat: jsonb("output\_format").default("{}"), // \[GAP-9\] Part 16.4

  guardrails: jsonb("guardrails").default("\[\]"),      // \[GAP-9\] Part 16.4

  status: varchar("status", { length: 50 }).default("draft").notNull(),

  ...auditFields,

});

// \[GAP-11\] ai\_agents — tambah tools JSONB (Part 16.3 MCP Tool Registry)

export const aiAgents \= pgTable("ai\_agents", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  name: varchar("name", { length: 255 }).notNull(),

  promptId: uuid("prompt\_id").notNull().references(() \=\> prompts.id, { onDelete: "restrict" }),

  tools: jsonb("tools").default("\[\]"),  // \[GAP-11\] MCP tool definitions array

  maxBudgetPerCall: numeric("max\_budget\_per\_call", { precision: 10, scale: 6 }),

  status: varchar("status", { length: 50 }).default("configured").notNull(),

  ...auditFields,

});

// \===============================================================================================

// 9\. OBSERVABILITY, EVENT-DRIVEN OUTBOX & AUDIT ENGINE

//    (Constitution Part 13, 15.5, 18\)

// \===============================================================================================

export const domainEvents \= pgTable("domain\_events", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").references(() \=\> tenants.id, { onDelete: "cascade" }),

  eventType: varchar("event\_type", { length: 150 }).notNull(),

  aggregateType: varchar("aggregate\_type", { length: 100 }),

  aggregateId: uuid("aggregate\_id"),

  payload: jsonb("payload").notNull(),

  traceId: uuid("trace\_id").notNull(),

  status: varchar("status", { length: 50 }).default("pending").notNull(),

  processedAt: timestamp("processed\_at", { withTimezone: true }),

  createdAt: timestamp("created\_at", { withTimezone: true }).defaultNow().notNull(),

});

// \[GAP-16\] auditLogs — ipAddress sekarang menggunakan inet type

export const auditLogs \= pgTable("audit\_logs", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "cascade" }),

  actorId: uuid("actor\_id").notNull(),

  actorType: actorTypeEnum("actor\_type").notNull(),

  action: varchar("action", { length: 150 }).notNull(),

  entityType: varchar("entity\_type", { length: 100 }).notNull(),

  entityId: uuid("entity\_id").notNull(),

  oldState: jsonb("old\_state"),

  newState: jsonb("new\_state"),

  traceId: uuid("trace\_id").notNull(),

  ipAddress: inet("ip\_address"), // \[GAP-16\] inet type — konsisten dengan SQL

  createdAt: timestamp("created\_at", { withTimezone: true }).defaultNow().notNull(),

});

export const metricSnapshots \= pgTable("metric\_snapshots", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "cascade" }),

  metricName: varchar("metric\_name", { length: 150 }).notNull(),

  value: numeric("value", { precision: 16, scale: 4 }).notNull(),

  dimensions: jsonb("dimensions").default("{}").notNull(),

  recordedAt: timestamp("recorded\_at", { withTimezone: true }).defaultNow().notNull(),

});

export const webhookSubscriptions \= pgTable("webhook\_subscriptions", {

  id: uuid("id").primaryKey().defaultRandom(),

  tenantId: uuid("tenant\_id").notNull().references(() \=\> tenants.id, { onDelete: "restrict" }),

  targetUrl: varchar("target\_url", { length: 500 }).notNull(),

  events: jsonb("events").default("\[\]").notNull(),

  secret: varchar("secret", { length: 255 }).notNull(),

  isActive: boolean("is\_active").default(true).notNull(),

  ...auditFields,

});

export const webhookDeliveries \= pgTable("webhook\_deliveries", {

  id: uuid("id").primaryKey().defaultRandom(),

  subscriptionId: uuid("subscription\_id").notNull().references(() \=\> webhookSubscriptions.id, { onDelete: "cascade" }),

  eventId: uuid("event\_id").notNull().references(() \=\> domainEvents.id, { onDelete: "cascade" }),

  status: varchar("status", { length: 50 }).notNull(),

  responseCode: integer("response\_code"),

  responseBody: text("response\_body"),

  attemptCount: integer("attempt\_count").default(0).notNull(),

  nextRetryAt: timestamp("next\_retry\_at", { withTimezone: true }),

  createdAt: timestamp("created\_at", { withTimezone: true }).defaultNow().notNull(),

});

---

## **16\. SUPABASE SQL MIGRATION (LENGKAP)**

\-- \===============================================================================================

\-- SOVEREIGN OS: CANONICAL DATABASE DDL & INITIALIZATION

\-- SYSTEM VERSION: 5.0.1-ENTERPRISE (RELEASE: 2026-06-25)

\-- STATUS: RATIFIED — ALIGNED WITH PLATFORM CONSTITUTION v5.0.1

\-- COMPATIBILITY: PostgreSQL 16+ / Supabase Native

\--

\-- PERUBAHAN DARI VERSI SEBELUMNYA (Gap Analysis Resolution):

\--   \[GAP-1\]  Tambah 'rejected','expired' ke enum booking\_state & access\_pass\_state

\--   \[GAP-2\]  Buat enum payment\_state (Constitution Part 12.2)

\--   \[GAP-3\]  Buat enum journal\_state (Constitution Part 12.6)

\--   \[GAP-4\]  Tambah tabel assets (Constitution Part 3.2)

\--   \[GAP-5\]  Tambah tabel campaigns (Constitution Part 3.2)

\--   \[GAP-6\]  Tambah tabel suppliers (selaraskan Drizzle ↔ SQL)

\--   \[GAP-7\]  Tambah tabel booking\_histories (selaraskan Drizzle ↔ SQL)

\--   \[GAP-8\]  Tambah idempotency\_key ke invoices, payments, bookings (L-04)

\--   \[GAP-9\]  Tambah input\_schema, output\_format, guardrails ke prompts (Part 16.4)

\--   \[GAP-10\] Tambah customer\_id ke access\_passes (Part 3.2)

\--   \[GAP-11\] Tambah tools JSONB ke ai\_agents (Part 16.3)

\--   \[GAP-12\] Tambah voided\_at, voided\_by ke journal\_entries; gunakan journal\_state enum

\--   \[GAP-13\] Perbaiki urutan DDL: projects sebelum bookings

\--   \[GAP-14\] Tambah pgvector extension; selaraskan embeddings ke vector(1536)

\--   \[GAP-15\] Perbaiki RLS access\_passes (hapus referensi event\_id yang tidak ada)

\--   \[GAP-16\] Extend RLS ke seluruh tabel bisnis (Constitution Part 15.2)

\--   \[GAP-17\] Tambah post\_ledger\_transaction stored procedure (L-07)

\--   \[GAP-18\] Perbaiki index bug: createdAt → created\_at di idx\_outbox\_pending

\--   \[GAP-19\] Tambah CQRS views: mv\_workflow\_status\_view, mv\_customer\_invoice\_history\_view

\-- \===============================================================================================

BEGIN;

\-- \===============================================================================================

\-- SECTION 1: EXTENSIONS & DOMAIN TYPES

\-- \===============================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "btree\_gist";

CREATE EXTENSION IF NOT EXISTS "pg\_trgm";

CREATE EXTENSION IF NOT EXISTS "vector";      \-- \[GAP-14\] pgvector

\-- Enum types — idempotent wrapper

DO $$

BEGIN

  \-- \[GAP-1\] booking\_state: tambah 'rejected'

  IF NOT EXISTS (SELECT 1 FROM pg\_type WHERE typname \= 'booking\_state') THEN

    CREATE TYPE public.booking\_state AS ENUM (

      'pending', 'under\_review', 'approved', 'active',

      'completed', 'rejected', 'canceled'

    );

  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg\_type WHERE typname \= 'invoice\_state') THEN

    CREATE TYPE public.invoice\_state AS ENUM (

      'draft', 'issued', 'partially\_paid', 'paid', 'settled', 'voided'

    );

  END IF;

  \-- \[GAP-1\] access\_pass\_state: tambah 'expired'

  IF NOT EXISTS (SELECT 1 FROM pg\_type WHERE typname \= 'access\_pass\_state') THEN

    CREATE TYPE public.access\_pass\_state AS ENUM (

      'pending', 'issued', 'checked\_in', 'consumed', 'revoked', 'expired'

    );

  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg\_type WHERE typname \= 'workflow\_state') THEN

    CREATE TYPE public.workflow\_state AS ENUM (

      'running', 'pending\_approval', 'completed', 'suspended', 'aborted'

    );

  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg\_type WHERE typname \= 'account\_classification') THEN

    CREATE TYPE public.account\_classification AS ENUM (

      'asset', 'liability', 'equity', 'revenue', 'expense'

    );

  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg\_type WHERE typname \= 'actor\_type') THEN

    CREATE TYPE public.actor\_type AS ENUM ('USER', 'AI\_AGENT', 'SYSTEM');

  END IF;

  \-- \[GAP-2\] payment\_state enum — Constitution Part 12.2

  IF NOT EXISTS (SELECT 1 FROM pg\_type WHERE typname \= 'payment\_state') THEN

    CREATE TYPE public.payment\_state AS ENUM (

      'initiated', 'processing', 'captured', 'settled',

      'reconciled', 'failed', 'refunded', 'refund\_settled'

    );

  END IF;

  \-- \[GAP-3\] journal\_state enum — Constitution Part 12.6

  IF NOT EXISTS (SELECT 1 FROM pg\_type WHERE typname \= 'journal\_state') THEN

    CREATE TYPE public.journal\_state AS ENUM ('draft', 'posted', 'voided');

  END IF;

  \-- \[GAP-4\] asset\_state enum — Constitution Part 3.2

  IF NOT EXISTS (SELECT 1 FROM pg\_type WHERE typname \= 'asset\_state') THEN

    CREATE TYPE public.asset\_state AS ENUM ('procured', 'active', 'retired');

  END IF;

  \-- \[GAP-5\] campaign\_state enum — Constitution Part 3.2

  IF NOT EXISTS (SELECT 1 FROM pg\_type WHERE typname \= 'campaign\_state') THEN

    CREATE TYPE public.campaign\_state AS ENUM ('planned', 'active', 'concluded');

  END IF;

END

$$;

\-- \===============================================================================================

\-- SECTION 2: GOVERNANCE, IDENTITY & CRM

\-- \===============================================================================================

CREATE TABLE IF NOT EXISTS public.tenants (

  id             UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  name           VARCHAR(255) NOT NULL,

  slug           VARCHAR(255) NOT NULL UNIQUE,

  base\_currency  VARCHAR(3)   NOT NULL DEFAULT 'IDR',

  timezone       VARCHAR(50)  NOT NULL DEFAULT 'Asia/Jakarta',

  status         VARCHAR(50)  NOT NULL DEFAULT 'active',

  created\_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at     TIMESTAMPTZ,

  created\_by     UUID,

  updated\_by     UUID,

  deleted\_by     UUID,

  CONSTRAINT chk\_tenants\_slug CHECK (slug \~\* '^\[a-z0-9\\-\]+$')

);

CREATE TABLE IF NOT EXISTS public.legal\_holds (

  id          UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id   UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  reason      VARCHAR(500) NOT NULL,

  applied\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  applied\_by  UUID         NOT NULL,

  released\_at TIMESTAMPTZ,

  released\_by UUID

);

CREATE TABLE IF NOT EXISTS public.organizations (

  id            UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id     UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  name          VARCHAR(255) NOT NULL,

  slug          VARCHAR(255) NOT NULL,

  status        VARCHAR(50)  NOT NULL DEFAULT 'draft',

  created\_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at    TIMESTAMPTZ,

  created\_by    UUID,

  updated\_by    UUID,

  deleted\_by    UUID,

  UNIQUE (tenant\_id, slug)

);

CREATE TABLE IF NOT EXISTS public.departments (

  id              UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  organization\_id UUID         NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name            VARCHAR(255) NOT NULL,

  is\_active       BOOLEAN      NOT NULL DEFAULT TRUE,

  created\_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at      TIMESTAMPTZ,

  created\_by      UUID,

  updated\_by      UUID,

  deleted\_by      UUID

);

CREATE TABLE IF NOT EXISTS public.workspaces (

  id              UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  organization\_id UUID         NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name            VARCHAR(255) NOT NULL,

  created\_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at      TIMESTAMPTZ,

  created\_by      UUID,

  updated\_by      UUID,

  deleted\_by      UUID

);

CREATE TABLE IF NOT EXISTS public.profiles (

  id          UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  user\_id     UUID         NOT NULL UNIQUE,

  full\_name   VARCHAR(255) NOT NULL,

  email       VARCHAR(255) NOT NULL,

  phone       VARCHAR(50),

  avatar\_url  VARCHAR(500),

  created\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at  TIMESTAMPTZ

);

CREATE TABLE IF NOT EXISTS public.memberships (

  id          UUID        PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id   UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  profile\_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  role        VARCHAR(50) NOT NULL DEFAULT 'member',

  status      VARCHAR(50) NOT NULL DEFAULT 'active',

  created\_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  deleted\_at  TIMESTAMPTZ,

  created\_by  UUID,

  updated\_by  UUID,

  deleted\_by  UUID,

  UNIQUE (tenant\_id, profile\_id)

);

CREATE TABLE IF NOT EXISTS public.customers (

  id          UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id   UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  name        VARCHAR(255) NOT NULL,

  email       VARCHAR(255) NOT NULL,

  phone       VARCHAR(50),

  status      VARCHAR(50)  NOT NULL DEFAULT 'lead',

  created\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at  TIMESTAMPTZ,

  created\_by  UUID,

  updated\_by  UUID,

  deleted\_by  UUID

);

\-- \[GAP-6\] suppliers — selaraskan SQL dengan Drizzle schema

CREATE TABLE IF NOT EXISTS public.suppliers (

  id            UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id     UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  company\_name  VARCHAR(255) NOT NULL,

  contact\_name  VARCHAR(255),

  email         VARCHAR(255),

  phone         VARCHAR(50),

  status        VARCHAR(50)  NOT NULL DEFAULT 'draft',

  created\_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at    TIMESTAMPTZ,

  created\_by    UUID,

  updated\_by    UUID,

  deleted\_by    UUID

);

\-- \===============================================================================================

\-- SECTION 3: ORGANIZATIONAL HIERARCHY

\--            projects didefinisikan SEBELUM bookings \[GAP-13\]

\-- \===============================================================================================

CREATE TABLE IF NOT EXISTS public.projects (

  id              UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id       UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  organization\_id UUID         NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  workspace\_id    UUID         NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,

  title           VARCHAR(255) NOT NULL,

  status          VARCHAR(50)  NOT NULL DEFAULT 'active',

  created\_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at      TIMESTAMPTZ,

  created\_by      UUID

);

\-- \===============================================================================================

\-- SECTION 4: SPATIAL, PROPERTY & BOOKING CONTEXT

\-- \===============================================================================================

CREATE TABLE IF NOT EXISTS public.facilities (

  id              UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  organization\_id UUID         NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name            VARCHAR(255) NOT NULL,

  address         VARCHAR(500),

  status          VARCHAR(50)  NOT NULL DEFAULT 'draft',

  created\_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at      TIMESTAMPTZ,

  created\_by      UUID,

  updated\_by      UUID,

  deleted\_by      UUID

);

CREATE TABLE IF NOT EXISTS public.rooms (

  id          UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  facility\_id UUID         NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,

  name        VARCHAR(255) NOT NULL,

  capacity    INT          NOT NULL,

  created\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at  TIMESTAMPTZ,

  created\_by  UUID,

  updated\_by  UUID,

  deleted\_by  UUID

);

\-- \[GAP-4\] assets — Constitution Part 3.2: "Aset fisik atau digital bernilai"

CREATE TABLE IF NOT EXISTS public.assets (

  id              UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id       UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  organization\_id UUID         NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name            VARCHAR(255) NOT NULL,

  asset\_type      VARCHAR(100) NOT NULL,

  serial\_number   VARCHAR(100),

  assigned\_to     UUID,

  status          public.asset\_state NOT NULL DEFAULT 'procured',

  metadata        JSONB        DEFAULT '{}'::jsonb,

  created\_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at      TIMESTAMPTZ,

  created\_by      UUID,

  updated\_by      UUID,

  deleted\_by      UUID

);

\-- \[GAP-8\] bookings — tambah idempotency\_key

CREATE TABLE IF NOT EXISTS public.bookings (

  id               UUID                    PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id        UUID                    NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  room\_id          UUID                    NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,

  project\_id       UUID                    NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  customer\_id      UUID                    REFERENCES public.customers(id) ON DELETE SET NULL,

  time\_range       TSRANGE                 NOT NULL,

  idempotency\_key  VARCHAR(255)            UNIQUE,  \-- \[GAP-8\] L-04

  status           public.booking\_state    NOT NULL DEFAULT 'pending',

  created\_at       TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

  updated\_at       TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

  deleted\_at       TIMESTAMPTZ,

  created\_by       UUID,

  updated\_by       UUID,

  deleted\_by       UUID,

  \-- Spatio-temporal exclusion constraint (Constitution Part 10.2)

  CONSTRAINT chk\_bookings\_no\_overlap EXCLUSION USING gist (

    room\_id WITH \=, time\_range WITH &&

  ) WHERE (status IN ('approved', 'active'))

);

\-- \[GAP-7\] booking\_histories — selaraskan SQL dengan Drizzle

CREATE TABLE IF NOT EXISTS public.booking\_histories (

  id          UUID                   PRIMARY KEY DEFAULT gen\_random\_uuid(),

  booking\_id  UUID                   NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,

  from\_status public.booking\_state,

  to\_status   public.booking\_state   NOT NULL,

  actor\_id    UUID                   NOT NULL,

  actor\_type  public.actor\_type      NOT NULL,

  reason      VARCHAR(500),

  created\_at  TIMESTAMPTZ            NOT NULL DEFAULT NOW()

);

\-- \===============================================================================================

\-- SECTION 5: COMMERCE, EVENTS & ACCESS PASSES

\-- \===============================================================================================

CREATE TABLE IF NOT EXISTS public.events (

  id          UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  project\_id  UUID         NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  title       VARCHAR(255) NOT NULL,

  start\_time  TIMESTAMPTZ  NOT NULL,

  end\_time    TIMESTAMPTZ  NOT NULL,

  status      VARCHAR(50)  NOT NULL DEFAULT 'draft',

  created\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at  TIMESTAMPTZ,

  created\_by  UUID,

  updated\_by  UUID,

  deleted\_by  UUID

);

CREATE TABLE IF NOT EXISTS public.pass\_tiers (

  id              UUID             PRIMARY KEY DEFAULT gen\_random\_uuid(),

  event\_id        UUID             NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,

  name            VARCHAR(100)     NOT NULL,

  price           NUMERIC(16,4)    NOT NULL,

  capacity        INT              NOT NULL,

  quantity\_issued INT              NOT NULL DEFAULT 0,

  created\_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  updated\_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  deleted\_at      TIMESTAMPTZ,

  created\_by      UUID,

  updated\_by      UUID,

  deleted\_by      UUID

);

\-- \[GAP-10\] access\_passes — tambah customer\_id dan expires\_at

CREATE TABLE IF NOT EXISTS public.access\_passes (

  id             UUID                       PRIMARY KEY DEFAULT gen\_random\_uuid(),

  pass\_tier\_id   UUID                       NOT NULL REFERENCES public.pass\_tiers(id) ON DELETE RESTRICT,

  customer\_id    UUID                       REFERENCES public.customers(id) ON DELETE SET NULL,  \-- \[GAP-10\]

  holder\_name    VARCHAR(255)               NOT NULL,

  secure\_qr\_hash VARCHAR(64)               NOT NULL UNIQUE,

  expires\_at     TIMESTAMPTZ,

  status         public.access\_pass\_state   NOT NULL DEFAULT 'pending',

  created\_at     TIMESTAMPTZ                NOT NULL DEFAULT NOW(),

  updated\_at     TIMESTAMPTZ                NOT NULL DEFAULT NOW(),

  deleted\_at     TIMESTAMPTZ,

  created\_by     UUID,

  updated\_by     UUID,

  deleted\_by     UUID

);

\-- \[GAP-5\] campaigns — Constitution Part 3.2

CREATE TABLE IF NOT EXISTS public.campaigns (

  id          UUID                    PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id   UUID                    NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  project\_id  UUID                    REFERENCES public.projects(id) ON DELETE SET NULL,

  name        VARCHAR(255)            NOT NULL,

  target\_type VARCHAR(100),

  target\_id   UUID,

  start\_date  TIMESTAMPTZ,

  end\_date    TIMESTAMPTZ,

  budget      NUMERIC(16,4),

  status      public.campaign\_state   NOT NULL DEFAULT 'planned',

  created\_at  TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

  deleted\_at  TIMESTAMPTZ,

  created\_by  UUID,

  updated\_by  UUID,

  deleted\_by  UUID

);

CREATE TABLE IF NOT EXISTS public.products (

  id          UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id   UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  name        VARCHAR(255) NOT NULL,

  sku         VARCHAR(100) NOT NULL UNIQUE,

  status      VARCHAR(50)  NOT NULL DEFAULT 'draft',

  created\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at  TIMESTAMPTZ,

  created\_by  UUID,

  updated\_by  UUID,

  deleted\_by  UUID

);

CREATE TABLE IF NOT EXISTS public.product\_variants (

  id           UUID          PRIMARY KEY DEFAULT gen\_random\_uuid(),

  product\_id   UUID          NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,

  sku\_override VARCHAR(100)  UNIQUE,

  price        NUMERIC(16,4) NOT NULL,

  created\_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  updated\_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  deleted\_at   TIMESTAMPTZ,

  created\_by   UUID,

  updated\_by   UUID,

  deleted\_by   UUID

);

CREATE TABLE IF NOT EXISTS public.warehouses (

  id          UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id   UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  name        VARCHAR(255) NOT NULL,

  is\_active   BOOLEAN      NOT NULL DEFAULT TRUE,

  created\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at  TIMESTAMPTZ

);

CREATE TABLE IF NOT EXISTS public.inventory\_lots (

  id                  UUID          PRIMARY KEY DEFAULT gen\_random\_uuid(),

  product\_variant\_id  UUID          NOT NULL REFERENCES public.product\_variants(id) ON DELETE RESTRICT,

  warehouse\_id        UUID          NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,

  quantity            INT           NOT NULL DEFAULT 0,

  status              VARCHAR(50)   NOT NULL DEFAULT 'active',

  created\_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  updated\_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  deleted\_at          TIMESTAMPTZ,

  CONSTRAINT chk\_inventory\_lots\_quantity\_non\_negative CHECK (quantity \>= 0\)

);

CREATE TABLE IF NOT EXISTS public.stock\_movements (

  id                UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  inventory\_lot\_id  UUID         NOT NULL REFERENCES public.inventory\_lots(id) ON DELETE CASCADE,

  quantity          INT          NOT NULL,

  movement\_type     VARCHAR(50)  NOT NULL,

  reason            VARCHAR(500),

  created\_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()

);

\-- \===============================================================================================

\-- SECTION 6: FINANCE & SWISS-STANDARD DOUBLE-ENTRY LEDGER

\--            (Constitution Part 3.3, 10.4, 12.2, 12.4, 12.6)

\-- \===============================================================================================

CREATE TABLE IF NOT EXISTS public.ledgers (

  id          UUID        PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id   UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  name        VARCHAR(150) NOT NULL,

  currency    VARCHAR(3)  NOT NULL DEFAULT 'IDR',

  status      VARCHAR(50) NOT NULL DEFAULT 'active',

  created\_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  deleted\_at  TIMESTAMPTZ,

  created\_by  UUID,

  updated\_by  UUID,

  deleted\_by  UUID

);

CREATE TABLE IF NOT EXISTS public.ledger\_accounts (

  id             UUID                        PRIMARY KEY DEFAULT gen\_random\_uuid(),

  ledger\_id      UUID                        NOT NULL REFERENCES public.ledgers(id) ON DELETE CASCADE,

  parent\_id      UUID                        REFERENCES public.ledger\_accounts(id) ON DELETE SET NULL,

  code           VARCHAR(50)                 NOT NULL,

  name           VARCHAR(150)                NOT NULL,

  classification public.account\_classification NOT NULL,

  normal\_balance VARCHAR(10)                 NOT NULL,

  created\_at     TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),

  updated\_at     TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),

  deleted\_at     TIMESTAMPTZ,

  UNIQUE (ledger\_id, code),

  CONSTRAINT chk\_ledger\_accounts\_normal\_balance CHECK (normal\_balance IN ('debit', 'credit'))

);

\-- \[GAP-12\] journal\_entries — gunakan journal\_state enum, tambah voided\_at/voided\_by/reversal\_of\_id

CREATE TABLE IF NOT EXISTS public.journal\_entries (

  id              UUID                   PRIMARY KEY DEFAULT gen\_random\_uuid(),

  ledger\_id       UUID                   NOT NULL REFERENCES public.ledgers(id) ON DELETE CASCADE,

  reference\_type  VARCHAR(100),

  reference\_id    UUID,

  narration       VARCHAR(500)           NOT NULL,

  status          public.journal\_state   NOT NULL DEFAULT 'draft',  \-- \[GAP-12\]

  posted\_at       TIMESTAMPTZ,

  voided\_at       TIMESTAMPTZ,           \-- \[GAP-12\]

  voided\_by       UUID,                  \-- \[GAP-12\]

  reversal\_of\_id  UUID                   REFERENCES public.journal\_entries(id) ON DELETE RESTRICT,

  created\_at      TIMESTAMPTZ            NOT NULL DEFAULT NOW(),

  updated\_at      TIMESTAMPTZ            NOT NULL DEFAULT NOW(),

  deleted\_at      TIMESTAMPTZ,

  created\_by      UUID,

  updated\_by      UUID,

  deleted\_by      UUID

);

\-- Immutable: journal\_lines tidak boleh diubah setelah entry Posted

CREATE TABLE IF NOT EXISTS public.journal\_lines (

  id               UUID          PRIMARY KEY DEFAULT gen\_random\_uuid(),

  journal\_entry\_id UUID          NOT NULL REFERENCES public.journal\_entries(id) ON DELETE CASCADE,

  account\_id       UUID          NOT NULL REFERENCES public.ledger\_accounts(id) ON DELETE RESTRICT,

  type             VARCHAR(10)   NOT NULL,

  amount           NUMERIC(16,4) NOT NULL,

  CONSTRAINT chk\_journal\_lines\_positive CHECK (amount \> 0.0000),

  CONSTRAINT chk\_journal\_lines\_type     CHECK (type IN ('debit', 'credit'))

);

\-- \[GAP-8\] invoices — tambah idempotency\_key

CREATE TABLE IF NOT EXISTS public.invoices (

  id               UUID                  PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id        UUID                  NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  customer\_id      UUID                  NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,

  idempotency\_key  VARCHAR(255)          UNIQUE,  \-- \[GAP-8\] L-04

  status           public.invoice\_state  NOT NULL DEFAULT 'draft',

  total\_amount     NUMERIC(16,4)         NOT NULL,

  due\_date         TIMESTAMPTZ           NOT NULL,

  created\_at       TIMESTAMPTZ           NOT NULL DEFAULT NOW(),

  updated\_at       TIMESTAMPTZ           NOT NULL DEFAULT NOW(),

  deleted\_at       TIMESTAMPTZ,

  created\_by       UUID,

  updated\_by       UUID,

  deleted\_by       UUID

);

CREATE TABLE IF NOT EXISTS public.invoice\_lines (

  id           UUID          PRIMARY KEY DEFAULT gen\_random\_uuid(),

  invoice\_id   UUID          NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,

  description  VARCHAR(255)  NOT NULL,

  quantity     INT           NOT NULL,

  unit\_price   NUMERIC(16,4) NOT NULL,

  total\_amount NUMERIC(16,4) NOT NULL

);

\-- \[GAP-2\] \[GAP-8\] payments — gunakan payment\_state enum, tambah idempotency\_key

CREATE TABLE IF NOT EXISTS public.payments (

  id                UUID                  PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id         UUID                  NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  invoice\_id        UUID                  NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,

  amount            NUMERIC(16,4)         NOT NULL,

  gateway\_reference VARCHAR(255),

  gateway\_provider  VARCHAR(50),          \-- xendit | stripe | midtrans

  idempotency\_key   VARCHAR(255)          UNIQUE,  \-- \[GAP-8\] L-04

  status            public.payment\_state  NOT NULL DEFAULT 'initiated',  \-- \[GAP-2\]

  captured\_at       TIMESTAMPTZ,

  settled\_at        TIMESTAMPTZ,

  created\_at        TIMESTAMPTZ           NOT NULL DEFAULT NOW(),

  updated\_at        TIMESTAMPTZ           NOT NULL DEFAULT NOW(),

  deleted\_at        TIMESTAMPTZ,

  created\_by        UUID,

  updated\_by        UUID,

  deleted\_by        UUID

);

CREATE TABLE IF NOT EXISTS public.escrows (

  id               UUID          PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id        UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  journal\_entry\_id UUID          NOT NULL REFERENCES public.journal\_entries(id) ON DELETE RESTRICT,

  amount           NUMERIC(16,4) NOT NULL,

  status           VARCHAR(50)   NOT NULL DEFAULT 'locked',

  release\_trigger  VARCHAR(255)  NOT NULL,

  released\_at      TIMESTAMPTZ,

  created\_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  updated\_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  deleted\_at       TIMESTAMPTZ,

  created\_by       UUID,

  updated\_by       UUID,

  deleted\_by       UUID

);

CREATE TABLE IF NOT EXISTS public.subscriptions (

  id              UUID          PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id       UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  customer\_id     UUID          NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,

  plan\_id         VARCHAR(100)  NOT NULL,

  status          VARCHAR(50)   NOT NULL DEFAULT 'active',

  next\_billing\_at TIMESTAMPTZ   NOT NULL,

  created\_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  updated\_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  deleted\_at      TIMESTAMPTZ,

  created\_by      UUID,

  updated\_by      UUID,

  deleted\_by      UUID

);

\-- \===============================================================================================

\-- SECTION 7: WORKFLOW STATE ENGINE

\-- \===============================================================================================

CREATE TABLE IF NOT EXISTS public.workflows (

  id           UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  workspace\_id UUID         NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,

  name         VARCHAR(255) NOT NULL,

  status       VARCHAR(50)  NOT NULL DEFAULT 'draft',

  created\_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at   TIMESTAMPTZ,

  created\_by   UUID,

  updated\_by   UUID,

  deleted\_by   UUID

);

CREATE TABLE IF NOT EXISTS public.workflow\_states (

  id           UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  workflow\_id  UUID         NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,

  name         VARCHAR(100) NOT NULL,

  is\_initial   BOOLEAN      NOT NULL DEFAULT FALSE,

  is\_final     BOOLEAN      NOT NULL DEFAULT FALSE,

  step\_order   INT          NOT NULL

);

CREATE TABLE IF NOT EXISTS public.workflow\_transitions (

  id             UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  workflow\_id    UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,

  from\_state\_id  UUID NOT NULL REFERENCES public.workflow\_states(id) ON DELETE CASCADE,

  to\_state\_id    UUID NOT NULL REFERENCES public.workflow\_states(id) ON DELETE CASCADE

);

CREATE TABLE IF NOT EXISTS public.workflow\_instances (

  id               UUID                   PRIMARY KEY DEFAULT gen\_random\_uuid(),

  workflow\_id      UUID                   NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,

  entity\_type      VARCHAR(100)           NOT NULL,

  entity\_id        UUID                   NOT NULL,

  current\_state\_id UUID                   REFERENCES public.workflow\_states(id) ON DELETE SET NULL,

  status           public.workflow\_state  NOT NULL DEFAULT 'running',

  created\_at       TIMESTAMPTZ            NOT NULL DEFAULT NOW(),

  updated\_at       TIMESTAMPTZ            NOT NULL DEFAULT NOW(),

  deleted\_at       TIMESTAMPTZ,

  created\_by       UUID,

  updated\_by       UUID,

  deleted\_by       UUID

);

CREATE TABLE IF NOT EXISTS public.approvals (

  id                   UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  workflow\_instance\_id UUID         NOT NULL REFERENCES public.workflow\_instances(id) ON DELETE CASCADE,

  assigned\_to          UUID         NOT NULL,

  status               VARCHAR(50)  NOT NULL DEFAULT 'pending',

  resolution           VARCHAR(50),

  resolved\_by          UUID,

  resolved\_at          TIMESTAMPTZ,

  created\_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at           TIMESTAMPTZ,

  created\_by           UUID,

  updated\_by           UUID,

  deleted\_by           UUID

);

CREATE TABLE IF NOT EXISTS public.tasks (

  id                   UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  workflow\_instance\_id UUID         NOT NULL REFERENCES public.workflow\_instances(id) ON DELETE CASCADE,

  title                VARCHAR(255) NOT NULL,

  description          TEXT,

  status               VARCHAR(50)  NOT NULL DEFAULT 'todo',

  assignee\_id          UUID,

  due\_at               TIMESTAMPTZ,

  created\_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at           TIMESTAMPTZ,

  created\_by           UUID,

  updated\_by           UUID,

  deleted\_by           UUID

);

\-- \===============================================================================================

\-- SECTION 8: KNOWLEDGE BASE, PROMPTS & AI INTEGRATION

\--            (Constitution Part 3.4, 16.1–16.5)

\-- \===============================================================================================

CREATE TABLE IF NOT EXISTS public.knowledge\_bases (

  id           UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  workspace\_id UUID         NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,

  name         VARCHAR(255) NOT NULL,

  created\_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at   TIMESTAMPTZ,

  created\_by   UUID,

  updated\_by   UUID,

  deleted\_by   UUID

);

CREATE TABLE IF NOT EXISTS public.documents (

  id               UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  knowledge\_base\_id UUID        NOT NULL REFERENCES public.knowledge\_bases(id) ON DELETE CASCADE,

  title            VARCHAR(255) NOT NULL,

  status           VARCHAR(50)  NOT NULL DEFAULT 'draft',

  created\_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at       TIMESTAMPTZ,

  created\_by       UUID,

  updated\_by       UUID,

  deleted\_by       UUID

);

CREATE TABLE IF NOT EXISTS public.document\_versions (

  id          UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  document\_id UUID         NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,

  version     INT          NOT NULL,

  content     TEXT         NOT NULL,

  created\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at  TIMESTAMPTZ,

  UNIQUE (document\_id, version)

);

CREATE TABLE IF NOT EXISTS public.chunks (

  id                  UUID  PRIMARY KEY DEFAULT gen\_random\_uuid(),

  document\_version\_id UUID  NOT NULL REFERENCES public.document\_versions(id) ON DELETE CASCADE,

  content\_payload     TEXT  NOT NULL,

  chunk\_index         INT   NOT NULL,

  token\_count         INT

);

\-- \[GAP-14\] embeddings — vector(1536) dengan pgvector

CREATE TABLE IF NOT EXISTS public.embeddings (

  id                  UUID          PRIMARY KEY DEFAULT gen\_random\_uuid(),

  document\_version\_id UUID          NOT NULL REFERENCES public.document\_versions(id) ON DELETE CASCADE,

  chunk\_id            UUID          REFERENCES public.chunks(id) ON DELETE CASCADE,

  vector\_data         VECTOR(1536)  NOT NULL,  \-- \[GAP-14\] pgvector native

  model\_used          VARCHAR(150)  NOT NULL,

  status              VARCHAR(50)   NOT NULL DEFAULT 'generated'

);

\-- \[GAP-9\] prompts — tambah input\_schema, output\_format, guardrails (Part 16.4)

CREATE TABLE IF NOT EXISTS public.prompts (

  id                  UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id           UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  name                VARCHAR(255) NOT NULL,

  routing\_preference  VARCHAR(50)  NOT NULL DEFAULT 'openrouter',

  target\_model        VARCHAR(150) NOT NULL,

  version             VARCHAR(50)  NOT NULL,

  template            TEXT         NOT NULL,

  input\_schema        JSONB        DEFAULT '{}'::jsonb,  \-- \[GAP-9\] Part 16.4

  output\_format       JSONB        DEFAULT '{}'::jsonb,  \-- \[GAP-9\] Part 16.4

  guardrails          JSONB        DEFAULT '\[\]'::jsonb,  \-- \[GAP-9\] Part 16.4

  status              VARCHAR(50)  NOT NULL DEFAULT 'draft',

  created\_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at          TIMESTAMPTZ,

  created\_by          UUID,

  updated\_by          UUID,

  deleted\_by          UUID

);

\-- \[GAP-11\] ai\_agents — tambah tools JSONB (Part 16.3 MCP Tool Registry)

CREATE TABLE IF NOT EXISTS public.ai\_agents (

  id                  UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id           UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  name                VARCHAR(255) NOT NULL,

  prompt\_id           UUID         NOT NULL REFERENCES public.prompts(id) ON DELETE RESTRICT,

  tools               JSONB        DEFAULT '\[\]'::jsonb,  \-- \[GAP-11\] MCP tool definitions

  max\_budget\_per\_call NUMERIC(10,6),

  status              VARCHAR(50)  NOT NULL DEFAULT 'configured',

  created\_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at          TIMESTAMPTZ,

  created\_by          UUID,

  updated\_by          UUID,

  deleted\_by          UUID

);

\-- \===============================================================================================

\-- SECTION 9: EVENT-DRIVEN OUTBOX, OBSERVABILITY & METRICS

\-- \===============================================================================================

CREATE TABLE IF NOT EXISTS public.domain\_events (

  id             UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id      UUID         REFERENCES public.tenants(id) ON DELETE CASCADE,

  event\_type     VARCHAR(150) NOT NULL,

  aggregate\_type VARCHAR(100),

  aggregate\_id   UUID,

  payload        JSONB        NOT NULL,

  trace\_id       UUID         NOT NULL,

  status         VARCHAR(50)  NOT NULL DEFAULT 'pending',

  processed\_at   TIMESTAMPTZ,

  created\_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()

);

CREATE TABLE IF NOT EXISTS public.audit\_logs (

  id           UUID               PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id    UUID               NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  actor\_id     UUID               NOT NULL,

  actor\_type   public.actor\_type  NOT NULL,

  action       VARCHAR(150)       NOT NULL,

  entity\_type  VARCHAR(100)       NOT NULL,

  entity\_id    UUID               NOT NULL,

  old\_state    JSONB,

  new\_state    JSONB,

  trace\_id     UUID               NOT NULL,

  ip\_address   INET,              \-- \[GAP-16\] INET type

  created\_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW()

);

CREATE TABLE IF NOT EXISTS public.metric\_snapshots (

  id           UUID          PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id    UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  metric\_name  VARCHAR(150)  NOT NULL,

  value        NUMERIC(16,4) NOT NULL,

  dimensions   JSONB         NOT NULL DEFAULT '{}'::jsonb,

  recorded\_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()

);

CREATE TABLE IF NOT EXISTS public.webhook\_subscriptions (

  id          UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  tenant\_id   UUID         NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,

  target\_url  VARCHAR(500) NOT NULL,

  events      JSONB        NOT NULL DEFAULT '\[\]'::jsonb,

  secret      VARCHAR(255) NOT NULL,

  is\_active   BOOLEAN      NOT NULL DEFAULT TRUE,

  created\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  deleted\_at  TIMESTAMPTZ,

  created\_by  UUID,

  updated\_by  UUID,

  deleted\_by  UUID

);

CREATE TABLE IF NOT EXISTS public.webhook\_deliveries (

  id              UUID         PRIMARY KEY DEFAULT gen\_random\_uuid(),

  subscription\_id UUID         NOT NULL REFERENCES public.webhook\_subscriptions(id) ON DELETE CASCADE,

  event\_id        UUID         NOT NULL REFERENCES public.domain\_events(id) ON DELETE CASCADE,

  status          VARCHAR(50)  NOT NULL,

  response\_code   INT,

  response\_body   TEXT,

  attempt\_count   INT          NOT NULL DEFAULT 0,

  next\_retry\_at   TIMESTAMPTZ,

  created\_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()

);

\-- \===============================================================================================

\-- SECTION 10: IMMUTABILITY TRIGGERS (Enterprise Law L-02)

\-- \===============================================================================================

\-- Trigger: block UPDATE/DELETE pada ledger tables yang sudah Posted

CREATE OR REPLACE FUNCTION public.block\_immutable\_journal\_changes()

RETURNS TRIGGER AS $$

BEGIN

  \-- Boleh mengubah draft; yang diproteksi hanya posted/voided

  IF OLD.status IN ('posted', 'voided') THEN

    RAISE EXCEPTION

      '\[L-02 VIOLATION\] Operasi dilarang: JournalEntry/Line yang sudah Posted bersifat immutable. '

      'Gunakan Reversal JournalEntry untuk koreksi. trace\_id: %',

      current\_setting('app.trace\_id', true);

  END IF;

  RETURN NULL;

END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER block\_journal\_entry\_mutations

  BEFORE UPDATE OR DELETE ON public.journal\_entries

  FOR EACH ROW EXECUTE FUNCTION public.block\_immutable\_journal\_changes();

\-- Trigger: journal\_lines selalu immutable setelah entry Posted

CREATE OR REPLACE FUNCTION public.block\_immutable\_journal\_lines()

RETURNS TRIGGER AS $$

DECLARE

  entry\_status TEXT;

BEGIN

  SELECT status INTO entry\_status

  FROM public.journal\_entries

  WHERE id \= OLD.journal\_entry\_id;

  IF entry\_status IN ('posted', 'voided') THEN

    RAISE EXCEPTION

      '\[L-02 VIOLATION\] JournalLine immutable: parent entry status=%. '

      'Gunakan Reversal JournalEntry.',

      entry\_status;

  END IF;

  RETURN NULL;

END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER block\_journal\_lines\_mutations

  BEFORE UPDATE OR DELETE ON public.journal\_lines

  FOR EACH ROW EXECUTE FUNCTION public.block\_immutable\_journal\_lines();

\-- \===============================================================================================

\-- SECTION 11: POST\_LEDGER\_TRANSACTION STORED PROCEDURE (L-07)

\-- \===============================================================================================

\-- \[GAP-17\] Stored procedure wajib untuk Command Handler Mandate (L-07)

\-- Memvalidasi zero-balance invariant SEBELUM posting

\-- \===============================================================================================

CREATE OR REPLACE FUNCTION public.post\_ledger\_transaction(

  p\_journal\_entry\_id UUID,

  p\_actor\_id         UUID,

  p\_trace\_id         UUID

)

RETURNS VOID

LANGUAGE plpgsql

AS $$

DECLARE

  v\_total\_debit  NUMERIC(16,4);

  v\_total\_credit NUMERIC(16,4);

  v\_balance\_diff NUMERIC(16,4);

  v\_entry\_status TEXT;

BEGIN

  \-- 1\. Lock baris entry untuk mencegah race condition (Constitution Part 10.4)

  SELECT status INTO v\_entry\_status

  FROM public.journal\_entries

  WHERE id \= p\_journal\_entry\_id

  FOR UPDATE;

  IF v\_entry\_status IS NULL THEN

    RAISE EXCEPTION '\[DOMAIN\_001\] JournalEntry % tidak ditemukan.', p\_journal\_entry\_id;

  END IF;

  IF v\_entry\_status \!= 'draft' THEN

    RAISE EXCEPTION '\[DOMAIN\_004\] JournalEntry % sudah dalam status %. Hanya Draft yang dapat di-post.',

      p\_journal\_entry\_id, v\_entry\_status;

  END IF;

  \-- 2\. Validasi keseimbangan Swiss-Standard (∑ Debit \== ∑ Kredit)

  SELECT

    SUM(CASE WHEN type \= 'debit'  THEN amount ELSE 0 END),

    SUM(CASE WHEN type \= 'credit' THEN amount ELSE 0 END)

  INTO v\_total\_debit, v\_total\_credit

  FROM public.journal\_lines

  WHERE journal\_entry\_id \= p\_journal\_entry\_id;

  v\_balance\_diff := COALESCE(v\_total\_debit, 0\) \- COALESCE(v\_total\_credit, 0);

  IF v\_balance\_diff \!= 0 THEN

    RAISE EXCEPTION

      '\[DOMAIN\_003\] JournalEntry tidak seimbang: debit=% kredit=% diff=%. '

      'Seluruh transaksi dibatalkan.',

      v\_total\_debit, v\_total\_credit, v\_balance\_diff;

  END IF;

  IF COALESCE(v\_total\_debit, 0\) \= 0 THEN

    RAISE EXCEPTION '\[DOMAIN\_001\] JournalEntry % tidak memiliki JournalLine.', p\_journal\_entry\_id;

  END IF;

  \-- 3\. Post entry

  UPDATE public.journal\_entries

  SET

    status     \= 'posted',

    posted\_at  \= NOW(),

    updated\_at \= NOW(),

    updated\_by \= p\_actor\_id

  WHERE id \= p\_journal\_entry\_id;

  \-- 4\. Emit domain event ke outbox (Outbox Pattern)

  INSERT INTO public.domain\_events (tenant\_id, event\_type, aggregate\_type, aggregate\_id, payload, trace\_id, status)

  SELECT

    l.tenant\_id,

    'JournalPosted',

    'JournalEntry',

    p\_journal\_entry\_id,

    jsonb\_build\_object(

      'journalEntryId', p\_journal\_entry\_id,

      'ledgerId', je.ledger\_id,

      'totalDebit', v\_total\_debit,

      'totalCredit', v\_total\_credit,

      'actorId', p\_actor\_id

    ),

    p\_trace\_id,

    'pending'

  FROM public.journal\_entries je

  JOIN public.ledgers l ON l.id \= je.ledger\_id

  WHERE je.id \= p\_journal\_entry\_id;

END;

$$;

\-- \===============================================================================================

\-- SECTION 12: ROW LEVEL SECURITY — ALL BUSINESS TABLES (Constitution Part 15.2)

\-- \[GAP-16\] Extend RLS ke seluruh tabel bisnis; \[GAP-15\] Fix access\_passes policy

\-- \===============================================================================================

\-- Helper macro: semua tenant-scoped tables menggunakan pattern yang sama

\-- Pattern: tenant\_id \= current user's tenant claim dari JWT

ALTER TABLE public.tenants                ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organizations          ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.departments            ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.workspaces             ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.memberships            ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.customers              ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.suppliers              ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.assets                 ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.projects               ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.facilities             ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.rooms                  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.bookings               ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.booking\_histories      ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.events                 ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.pass\_tiers             ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.access\_passes          ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.campaigns              ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.products               ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.product\_variants       ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.warehouses             ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.inventory\_lots         ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.ledgers                ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.ledger\_accounts        ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.journal\_entries        ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.invoices               ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.payments               ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.escrows                ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.subscriptions          ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.workflows              ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.workflow\_instances     ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.approvals              ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tasks                  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.knowledge\_bases        ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.documents              ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.prompts                ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.ai\_agents              ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.domain\_events          ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.audit\_logs             ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.metric\_snapshots       ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.webhook\_subscriptions  ENABLE ROW LEVEL SECURITY;

\-- Direct tenant\_id isolation (tabel dengan tenant\_id langsung)

DO $$

DECLARE

  tbl TEXT;

  tables TEXT\[\] := ARRAY\[

    'organizations', 'memberships', 'customers', 'suppliers', 'assets', 'projects',

    'bookings', 'campaigns', 'products', 'warehouses', 'ledgers', 'invoices',

    'payments', 'escrows', 'subscriptions', 'prompts', 'ai\_agents',

    'domain\_events', 'audit\_logs', 'metric\_snapshots', 'webhook\_subscriptions'

  \];

BEGIN

  FOREACH tbl IN ARRAY tables LOOP

    EXECUTE format(

      'CREATE POLICY "tenant\_isolation\_%s" ON public.%I

       FOR ALL USING (

         tenant\_id \= (auth.jwt() \-\> ''user\_metadata'' \-\>\> ''tenant\_id'')::uuid

       )',

      tbl, tbl

    );

  END LOOP;

END

$$;

\-- Tabel dengan relasi indirect ke tenant melalui parent

CREATE POLICY "tenant\_isolation\_facilities" ON public.facilities

  FOR ALL USING (

    organization\_id IN (

      SELECT id FROM public.organizations

      WHERE tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_departments" ON public.departments

  FOR ALL USING (

    organization\_id IN (

      SELECT id FROM public.organizations

      WHERE tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_workspaces" ON public.workspaces

  FOR ALL USING (

    organization\_id IN (

      SELECT id FROM public.organizations

      WHERE tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_rooms" ON public.rooms

  FOR ALL USING (

    facility\_id IN (

      SELECT f.id FROM public.facilities f

      JOIN public.organizations o ON o.id \= f.organization\_id

      WHERE o.tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_booking\_histories" ON public.booking\_histories

  FOR ALL USING (

    booking\_id IN (

      SELECT id FROM public.bookings

      WHERE tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_events" ON public.events

  FOR ALL USING (

    project\_id IN (

      SELECT id FROM public.projects

      WHERE tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_pass\_tiers" ON public.pass\_tiers

  FOR ALL USING (

    event\_id IN (

      SELECT e.id FROM public.events e

      JOIN public.projects p ON p.id \= e.project\_id

      WHERE p.tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

\-- \[GAP-15\] access\_passes — FIX: tidak referensikan event\_id yang tidak ada

\-- Traversal: access\_passes → pass\_tiers → events → projects → tenant

CREATE POLICY "tenant\_isolation\_access\_passes" ON public.access\_passes

  FOR ALL USING (

    pass\_tier\_id IN (

      SELECT pt.id FROM public.pass\_tiers pt

      JOIN public.events e ON e.id \= pt.event\_id

      JOIN public.projects p ON p.id \= e.project\_id

      WHERE p.tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_product\_variants" ON public.product\_variants

  FOR ALL USING (

    product\_id IN (

      SELECT id FROM public.products

      WHERE tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_inventory\_lots" ON public.inventory\_lots

  FOR ALL USING (

    warehouse\_id IN (

      SELECT id FROM public.warehouses

      WHERE tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_ledger\_accounts" ON public.ledger\_accounts

  FOR ALL USING (

    ledger\_id IN (

      SELECT id FROM public.ledgers

      WHERE tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_journal\_entries" ON public.journal\_entries

  FOR ALL USING (

    ledger\_id IN (

      SELECT id FROM public.ledgers

      WHERE tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_workflows" ON public.workflows

  FOR ALL USING (

    workspace\_id IN (

      SELECT ws.id FROM public.workspaces ws

      JOIN public.organizations o ON o.id \= ws.organization\_id

      WHERE o.tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_workflow\_instances" ON public.workflow\_instances

  FOR ALL USING (

    workflow\_id IN (

      SELECT wf.id FROM public.workflows wf

      JOIN public.workspaces ws ON ws.id \= wf.workspace\_id

      JOIN public.organizations o ON o.id \= ws.organization\_id

      WHERE o.tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_approvals" ON public.approvals

  FOR ALL USING (

    workflow\_instance\_id IN (

      SELECT wi.id FROM public.workflow\_instances wi

      JOIN public.workflows wf ON wf.id \= wi.workflow\_id

      JOIN public.workspaces ws ON ws.id \= wf.workspace\_id

      JOIN public.organizations o ON o.id \= ws.organization\_id

      WHERE o.tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_tasks" ON public.tasks

  FOR ALL USING (

    workflow\_instance\_id IN (

      SELECT wi.id FROM public.workflow\_instances wi

      JOIN public.workflows wf ON wf.id \= wi.workflow\_id

      JOIN public.workspaces ws ON ws.id \= wf.workspace\_id

      JOIN public.organizations o ON o.id \= ws.organization\_id

      WHERE o.tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_knowledge\_bases" ON public.knowledge\_bases

  FOR ALL USING (

    workspace\_id IN (

      SELECT ws.id FROM public.workspaces ws

      JOIN public.organizations o ON o.id \= ws.organization\_id

      WHERE o.tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

CREATE POLICY "tenant\_isolation\_documents" ON public.documents

  FOR ALL USING (

    knowledge\_base\_id IN (

      SELECT kb.id FROM public.knowledge\_bases kb

      JOIN public.workspaces ws ON ws.id \= kb.workspace\_id

      JOIN public.organizations o ON o.id \= ws.organization\_id

      WHERE o.tenant\_id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

    )

  );

\-- tenants: hanya bisa READ tenant sendiri; write oleh superadmin saja

CREATE POLICY "self\_tenant\_isolation" ON public.tenants

  FOR SELECT USING (

    id \= (auth.jwt() \-\> 'user\_metadata' \-\>\> 'tenant\_id')::uuid

  );

\-- \===============================================================================================

\-- SECTION 13: ENTERPRISE PERFORMANCE INDEXES

\-- \===============================================================================================

\-- B-Tree: FK lookups

CREATE INDEX IF NOT EXISTS idx\_memberships\_tenant\_user    ON public.memberships    (tenant\_id, profile\_id);

CREATE INDEX IF NOT EXISTS idx\_bookings\_tenant\_status     ON public.bookings       (tenant\_id, status);

CREATE INDEX IF NOT EXISTS idx\_bookings\_room\_id           ON public.bookings       (room\_id);

CREATE INDEX IF NOT EXISTS idx\_journal\_entries\_ledger     ON public.journal\_entries (ledger\_id, status);

CREATE INDEX IF NOT EXISTS idx\_journal\_lines\_entry        ON public.journal\_lines  (journal\_entry\_id);

CREATE INDEX IF NOT EXISTS idx\_invoices\_tenant\_status     ON public.invoices       (tenant\_id, status);

CREATE INDEX IF NOT EXISTS idx\_payments\_invoice           ON public.payments       (invoice\_id);

CREATE INDEX IF NOT EXISTS idx\_access\_passes\_qr           ON public.access\_passes  (secure\_qr\_hash);

CREATE INDEX IF NOT EXISTS idx\_access\_passes\_tier\_status  ON public.access\_passes  (pass\_tier\_id, status);

CREATE INDEX IF NOT EXISTS idx\_workflow\_instances\_entity  ON public.workflow\_instances (entity\_type, entity\_id);

CREATE INDEX IF NOT EXISTS idx\_audit\_logs\_trace           ON public.audit\_logs     (trace\_id);

CREATE INDEX IF NOT EXISTS idx\_audit\_logs\_entity          ON public.audit\_logs     (entity\_type, entity\_id);

CREATE INDEX IF NOT EXISTS idx\_domain\_events\_type\_status  ON public.domain\_events  (event\_type, status);

\-- GiST: Spatio-temporal overlap exclusion

CREATE INDEX IF NOT EXISTS idx\_bookings\_time\_range ON public.bookings USING gist (room\_id, time\_range);

\-- \[GAP-18\] PERBAIKI BUG: camelCase → snake\_case

CREATE INDEX IF NOT EXISTS idx\_domain\_events\_pending

  ON public.domain\_events (created\_at)

  WHERE status \= 'pending';  \-- \[GAP-18\] FIX: bukan "createdAt"

\-- HNSW: pgvector cosine similarity

CREATE INDEX IF NOT EXISTS idx\_embeddings\_vector

  ON public.embeddings USING hnsw (vector\_data vector\_cosine\_ops);

\-- \===============================================================================================

\-- SECTION 14: CQRS MATERIALIZED VIEWS (Constitution Part 14.2)

\-- \[GAP-19\] Tambah mv\_workflow\_status\_view dan mv\_customer\_invoice\_history\_view

\-- \===============================================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv\_booking\_calendar\_view AS

SELECT

  f.id           AS facility\_id,

  f.name         AS facility\_name,

  r.id           AS room\_id,

  r.name         AS room\_name,

  b.id           AS booking\_id,

  b.tenant\_id,

  b.time\_range,

  b.status       AS booking\_status

FROM public.facilities f

JOIN public.rooms    r ON r.facility\_id \= f.id

JOIN public.bookings b ON b.room\_id     \= r.id

WHERE b.status IN ('approved', 'active')

  AND b.deleted\_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx\_mv\_booking\_calendar\_uniq

  ON public.mv\_booking\_calendar\_view (booking\_id);

\-- \-----------------------------------------------------------------------

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv\_ledger\_summary\_view AS

SELECT

  la.id             AS account\_id,

  la.ledger\_id,

  la.code,

  la.name           AS account\_name,

  la.classification,

  la.normal\_balance,

  COALESCE(SUM(CASE WHEN jl.type \= 'debit'  THEN jl.amount ELSE 0 END), 0\) AS total\_debit,

  COALESCE(SUM(CASE WHEN jl.type \= 'credit' THEN jl.amount ELSE 0 END), 0\) AS total\_credit,

  COALESCE(SUM(

    CASE

      WHEN la.normal\_balance \= 'debit'  AND jl.type \= 'debit'  THEN  jl.amount

      WHEN la.normal\_balance \= 'debit'  AND jl.type \= 'credit' THEN \-jl.amount

      WHEN la.normal\_balance \= 'credit' AND jl.type \= 'credit' THEN  jl.amount

      WHEN la.normal\_balance \= 'credit' AND jl.type \= 'debit'  THEN \-jl.amount

      ELSE 0

    END

  ), 0\) AS net\_balance

FROM public.ledger\_accounts la

LEFT JOIN public.journal\_lines   jl ON jl.account\_id      \= la.id

LEFT JOIN public.journal\_entries je ON je.id               \= jl.journal\_entry\_id

                                    AND je.status          \= 'posted'

GROUP BY la.id, la.ledger\_id, la.code, la.name, la.classification, la.normal\_balance;

CREATE UNIQUE INDEX IF NOT EXISTS idx\_mv\_ledger\_summary\_uniq

  ON public.mv\_ledger\_summary\_view (account\_id);

\-- \-----------------------------------------------------------------------

\-- mv\_event\_sales\_view — FIX: hapus referensi event\_id dari access\_passes

\-- Traversal bersih: events → pass\_tiers → access\_passes

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv\_event\_sales\_view AS

SELECT

  e.id                AS event\_id,

  e.title             AS event\_title,

  pt.id               AS pass\_tier\_id,

  pt.name             AS tier\_name,

  COUNT(ap.id)        AS tickets\_sold,

  COALESCE(SUM(pt.price) FILTER (WHERE ap.id IS NOT NULL), 0\) AS gross\_revenue

FROM public.events      e

JOIN public.pass\_tiers  pt ON pt.event\_id     \= e.id   \-- \[GAP-15\] FIX traversal

LEFT JOIN public.access\_passes ap ON ap.pass\_tier\_id \= pt.id

                                  AND ap.status \!= 'revoked'

                                  AND ap.deleted\_at IS NULL

GROUP BY e.id, e.title, pt.id, pt.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx\_mv\_event\_sales\_uniq

  ON public.mv\_event\_sales\_view (pass\_tier\_id);

\-- \-----------------------------------------------------------------------

\-- \[GAP-19\] mv\_workflow\_status\_view — Constitution Part 14.2

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv\_workflow\_status\_view AS

SELECT

  wi.id               AS instance\_id,

  wi.workflow\_id,

  wf.name             AS workflow\_name,

  wi.entity\_type,

  wi.entity\_id,

  ws\_cur.name         AS current\_state\_name,

  wi.status           AS instance\_status,

  COUNT(t.id)         AS open\_tasks,

  COUNT(a.id) FILTER (WHERE a.status \= 'pending') AS pending\_approvals,

  wi.created\_at,

  wi.updated\_at

FROM public.workflow\_instances wi

JOIN public.workflows       wf     ON wf.id     \= wi.workflow\_id

LEFT JOIN public.workflow\_states ws\_cur ON ws\_cur.id \= wi.current\_state\_id

LEFT JOIN public.tasks      t      ON t.workflow\_instance\_id \= wi.id

                                   AND t.status NOT IN ('done', 'canceled')

                                   AND t.deleted\_at IS NULL

LEFT JOIN public.approvals  a      ON a.workflow\_instance\_id \= wi.id

                                   AND a.deleted\_at IS NULL

WHERE wi.deleted\_at IS NULL

GROUP BY wi.id, wi.workflow\_id, wf.name, wi.entity\_type, wi.entity\_id,

         ws\_cur.name, wi.status, wi.created\_at, wi.updated\_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx\_mv\_workflow\_status\_uniq

  ON public.mv\_workflow\_status\_view (instance\_id);

\-- \-----------------------------------------------------------------------

\-- \[GAP-19\] mv\_customer\_invoice\_history\_view — Constitution Part 14.2

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv\_customer\_invoice\_history\_view AS

SELECT

  c.id              AS customer\_id,

  c.tenant\_id,

  c.name            AS customer\_name,

  inv.id            AS invoice\_id,

  inv.status        AS invoice\_status,

  inv.total\_amount,

  inv.due\_date,

  inv.created\_at    AS issued\_at,

  p.id              AS payment\_id,

  p.status          AS payment\_status,

  p.amount          AS paid\_amount,

  p.settled\_at

FROM public.customers c

JOIN public.invoices  inv ON inv.customer\_id  \= c.id AND inv.deleted\_at IS NULL

LEFT JOIN public.payments p ON p.invoice\_id   \= inv.id AND p.deleted\_at IS NULL

WHERE c.deleted\_at IS NULL;

CREATE INDEX IF NOT EXISTS idx\_mv\_customer\_invoice\_tenant

  ON public.mv\_customer\_invoice\_history\_view (tenant\_id, customer\_id);

\-- \===============================================================================================

\-- SECTION 15: INTEGRITY VERIFICATION QUERIES (Constitution Database Graph Point 2\)

\-- Jalankan setelah migrasi untuk memverifikasi invariant bisnis aktif

\-- \===============================================================================================

\-- Verifikasi: tidak boleh ada journal entry yang tidak seimbang

\-- HARUS mengembalikan 0 baris. Jika ada baris, migrasi perlu diaudit.

\-- SELECT journal\_entry\_id, SUM(CASE WHEN type='debit' THEN amount ELSE \-amount END) AS diff

\-- FROM public.journal\_lines

\-- GROUP BY journal\_entry\_id

\-- HAVING SUM(CASE WHEN type='debit' THEN amount ELSE \-amount END) \!= 0;

COMMIT;

---

© Sovereign OS — Dokumen ini merupakan turunan dari *Platform Constitution v5.0.1*. Perubahan hanya sah melalui RFC yang disetujui Lead Architect.

