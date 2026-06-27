# SOVEREIGN OS

## PLATFORM CANONICAL MODEL & REFERENCE ARCHITECTURE

**Version 5.0.2 — Enterprise Constitution**
**Classification: Canonical Single Source of Truth (SSOT)**
**Status: RATIFIED (ARB Audit Harmonization)**
**Supersedes: v5.0.1**

---

**Panduan Penggunaan Dokumen Ini** Dokumen ini adalah **induk mutlak** dari seluruh artefak rekayasa dan produk Moventios. Setiap kontradiksi antara dokumen turunan dengan dokumen ini harus diselesaikan dengan mengacu pada dokumen ini. Perubahan hanya sah melalui proses **RFC (Request for Constitution Change)** yang disetujui oleh Lead Architect.

**Harmonization Notes (v5.0.1 → v5.0.2):**

- Resolved terminology drift (TicketType ↔ pass_tiers canonicalization)
- Completed Command & Event catalogs (Payment domain, AccessPass expiry)
- Clarified AI Safety Law enforcement mechanism (L-06)
- Formalized Command → Event mapping with guard conditions
- Aligned API contract expectations with Layer 3 (EPXA v5.1)

---

## DAFTAR ISI

| Bagian     | Judul                                                   |
| :--------- | :------------------------------------------------------ |
| Part 1     | Platform Manifesto                                      |
| Part 2     | Platform Principles                                     |
| Part 3     | Platform Ontology (UPDATED: Terminology Reconciliation) |
| Part 4     | Ubiquitous Language (Kamus Kanonikal) — UPDATED         |
| Part 5     | Platform Reference Model (Layer Architecture)           |
| Part 6     | Business Capability Model                               |
| Part 7     | Domain Model & Context Mapping                          |
| Part 8     | Enterprise Relationship Model                           |
| Part 9     | Enterprise Laws (Canonical Rules) — CLARIFIED           |
| Part 10    | Aggregate Design                                        |
| Part 11    | Value Objects                                           |
| Part 12    | State Machines (Lifecycles) — COMPLETE                  |
| Part 13    | Domain Event Catalog — COMPLETE                         |
| Part 13.5  | Command ↔ Event Mapping Table (NEW)                     |
| Part 14    | CQRS & Read Model Strategy                              |
| Part 15    | Security & Zero Trust Reference Model                   |
| Part 16    | AI Reference Architecture                               |
| Part 17    | Integration Landscape & Anti-Corruption Layers          |
| Part 18    | Observability & SLA Model                               |
| Part 19    | Data Governance & Compliance                            |
| Part 20    | Deployment Reference Architecture                       |
| Part 21    | Engineering Governance                                  |
| Part 22    | Architecture Decision Records (ADR) Manifest            |
| Part 23    | Document Dependency Graph                               |
| Appendix A | Canonical Naming Standards                              |
| Appendix B | Error Taxonomy                                          |
| Appendix C | Changelog                                               |

---

## PART 1: PLATFORM MANIFESTO

### 1.1 Vision

Menjadi sistem operasi enterprise terdistribusi yang menyatukan logistik fisik, niaga digital, kecerdasan kognitif, dan integritas finansial ke dalam satu ekosistem yang **otonom, presisi, dan nir-latensi (zero-latency)**.

### 1.2 Mission

Mendemokratisasi infrastruktur enterprise-grade dengan menyediakan fondasi lintas industri yang **immutable, vendor-agnostic, dan digerakkan oleh AI (AI-First)**. Moventios membebaskan organisasi dari beban utang teknis (technical debt), memungkinkan operasi dengan fidelitas audit absolut dan skalabilitas tanpa batas geografis.

### 1.3 Platform Philosophy — _The Stoic Ledger_

Platform berakar pada prinsip **Quiet Power (Kekuatan yang Tenang)**:

- **Menolak kebisingan sistemik.** Setiap state change adalah kebenaran absolut, bukan estimasi.
- **Determinisme di atas segalanya.** Alur kerja bersifat dapat direproduksi, diaudit, dan diverifikasi ulang kapan pun.
- **AI sebagai agen inti, bukan fitur pendamping.** AI menavigasi kompleksitas secara senyap di latar belakang; manusia membuat keputusan material akhir.
- **Ketenangan kognitif.** Antarmuka tidak memaksa pengguna berpikir keras. Kompleksitas disembunyikan di balik kesederhanaan yang terancang.

### 1.4 AI-First & Zero Trust Foundation

AI bertindak sebagai lapisan kognitif dasar yang merangkum event stream, membangun knowledge graph, mendeteksi anomali, dan menghasilkan rekomendasi. Namun, **tidak ada entitas — manusia maupun AI — yang memiliki akses implisit**. Setiap aksi material wajib melewati otorisasi eksplisit dan tercatat dalam Immutable Ledger.

### 1.5 Long-term Direction

Berevolusi dari sistem manajemen B2B SaaS menjadi **AI-Native Relationship Infrastructure** (Movent). Platform menyediakan reusable engines untuk identity, places, activation, dan governance — memungkinkan berbagai ekosistem (Moventios dan solusi vertikal masa depan) dibangun di atas fondasi yang sama.

---

## PART 2: PLATFORM PRINCIPLES

Kaidah ini adalah **hukum arsitektur tertinggi yang tidak dapat diganggu gugat**. Pelanggaran terhadap prinsip ini memerlukan ADR formal sebelum eksekusi.

### 2.1 Business Principles

- **Value-Friction Resolution:** Setiap kapabilitas wajib memecahkan satu dari tiga jenis friksi: menghasilkan pendapatan, menghemat biaya, atau memitigasi risiko. Kapabilitas tanpa justifikasi bisnis adalah utang teknis terselubung.
- **Tenant Sovereignty:** Setiap penyewa memiliki kedaulatan penuh atas data, logika bisnis, dan konfigurasi domain mereka. Platform tidak boleh mengambil keputusan bisnis atas nama Tenant tanpa izin eksplisit.

### 2.2 Engineering & Architecture Principles

- **Hexagonal Architecture (Ports & Adapters):** Logika bisnis inti (`core/domain`) diisolasi secara absolut dari detail infrastruktur (database, UI, API eksternal). Ketergantungan selalu mengarah ke dalam (inward dependency rule).
- **Domain-Driven Design (DDD):** Bounded Context mendefinisikan batas mutlak kepemilikan data dan logika. Tidak ada entitas yang hidup di dua Bounded Context secara bersamaan.
- **Event-Driven Architecture (EDA):** Komunikasi lintas domain dilakukan secara asinkron menggunakan Domain Events. RPC chain antar domain adalah anti-pattern yang dilarang.
- **API-First:** Semua kapabilitas terekspos via kontrak API yang terdefinisi (OpenAPI/GraphQL) sebelum implementasi dimulai. UI adalah konsumen API, bukan pemilik logika.
- **Offline-First:** Klien wajib mampu memuat antrian mutasi (mutation buffer) di IndexedDB saat koneksi terputus dan menyinkronkannya dengan resolusi konflik deterministik saat kembali online.
- **Stateless Compute:** Komponen komputasi tidak menyimpan state sesi di memori proses. State tersimpan di database atau distributed cache (Valkey).

### 2.3 Data & Security Principles

- **Immutable Financial History:** Data pembukuan dan audit bersifat Append-Only. Tidak ada perintah `UPDATE` atau `DELETE` pada tabel finansial di lingkungan produksi.
- **Zero Cross-Context Join:** Operasi JOIN tabel antar Bounded Context dilarang di level database. Penggabungan dilakukan di lapisan aplikasi (BFF, CQRS Read Model, atau API Gateway).
- **Zero Trust:** Keamanan tidak pernah diasumsikan. Setiap aktor, servis, dan permintaan diotentikasi dan diotorisasi pada setiap batasan (network boundary, service boundary, data boundary).
- **Data Privacy by Design:** Klasifikasi PII wajib dilakukan sejak perancangan skema. Data sensitif (kartu kredit, secret) tidak boleh singgah di database Sovereign; wajib diteruskan ke Vault atau PSP.

### 2.4 AI & Operational Principles

- **AI Safety Law (L-06):** Agen AI memiliki akses `READ` terhadap pengetahuan bisnis. Aksi `WRITE` material (persetujuan kontrak, pencairan dana, perubahan kepemilikan) **selalu dicegat** dan dipaksa masuk ke status `Pending Human Approval` via Workflow Approval gate. Tidak ada bypass untuk AI, betapapun tinggi confidence score-nya.
- **Observability by Design:** Setiap transaksi memiliki `Trace-ID` yang merangkai Logs, Metrics, dan Distributed Traces dari ujung ke ujung (end-to-end).
- **Stoic UX:** Antarmuka mengikuti prinsip corporate-formal dengan efisiensi kognitif tinggi. Animasi berlebih, warna mencolok, dan elemen yang memicu kepanikan adalah anti-pattern desain.

### 2.5 Reliability & Scalability Principles

- **Horizontal Scalability:** Lapisan komputasi (Edge Functions, API Routes) bersifat stateless dan dapat diskalakan secara horizontal tanpa koordinasi. Database menggunakan strategi read-replica untuk skalabilitas baca.
- **Disaster Recovery:** Platform dirancang dengan topologi active-active untuk komponen kritikal (Ledger, IAM) dan active-passive untuk komponen pendukung. RTO \< 15 menit, RPO \< 5 menit.
- **Idempotency by Default:** Semua operasi mutasi (keuangan, reservasi, notifikasi) dirancang idempoten dan menerima `X-Idempotency-Key`.

---

## PART 3: PLATFORM ONTOLOGY

Definisi kanonikal objek fundamental Moventios. **Seluruh penamaan variabel, kelas, tabel database, dan dokumentasi wajib menggunakan nama-nama di bawah ini.**

### 3.1 Governance, Identity & CRM

| Canonical Name | Definition & Business Meaning                                                                                          | Owning Context      | Lifecycle States                                      |
| :------------- | :--------------------------------------------------------------------------------------------------------------------- | :------------------ | :---------------------------------------------------- |
| `Tenant`       | Entitas (Organization / Community) yang menjadi pemilik sub-graph dalam ekosistem. Bukan hanya "penyewa SaaS".         | Platform Governance | `Provisioning` → `Active` → `Frozen` → `Terminated`   |
| `Organization` | Badan usaha atau entitas legal di bawah satu Tenant. Satu Tenant dapat memiliki beberapa Organization.                 | Governance          | `Draft` → `Active` → `Archived`                       |
| `Department`   | Sub-divisi fungsional di dalam Organization (misal: Pemasaran, Keuangan, Operasional).                                 | Organization        | `Active` → `Inactive`                                 |
| `Workspace`    | Area kolaborasi logis dan batas isolasi proyek. Dikelola oleh Organization.                                            | Organization        | `Created` → `Active` → `Archived`                     |
| `User`         | Aktor manusia dengan identitas tunggal lintas Tenant. Satu User dapat terikat ke beberapa Tenant melalui `Membership`. | IAM                 | `Registered` → `Active` → `Suspended` → `Deactivated` |
| `Membership`   | Relasi eksplisit antara `User` dan `Tenant`, membawa peran (Role) dan izin (Permission).                               | IAM                 | `Invited` → `Active` → `Revoked`                      |
| `Customer`     | Klien eksternal pembeli jasa atau produk dari Tenant.                                                                  | CRM                 | `Lead` → `Active` → `Churned`                         |
| `Supplier`     | Pihak ketiga penyedia barang atau jasa logistik bagi Tenant.                                                           | CRM                 | `Draft` → `Approved` → `Suspended` → `Banned`         |

### 3.2 Spatial, Commerce & Operations

| Canonical Name | Definition & Business Meaning                                                                                                                                                                                      | Owning Context | Lifecycle States                                                                          |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- | :---------------------------------------------------------------------------------------- |
| `Facility`     | Aset properti fisik makro (Gedung, Area, Lahan) yang dikelola Tenant.                                                                                                                                              | Spatial        | `Draft` → `Active` → `Maintenance` → `Decommissioned`                                     |
| `Room`         | Sub-unit dari `Facility` yang dapat dipesan secara independen (Ruang rapat, Lapangan, Panggung).                                                                                                                   | Spatial        | `Available` → `Occupied` → `Maintenance`                                                  |
| `Asset`        | Unit properti fisik atau digital bernilai yang dapat dilacak dan diassign (Peralatan, Kendaraan, Lisensi).                                                                                                         | Spatial        | `Procured` → `Active` → `Retired`                                                         |
| `Booking`      | Klaim eksklusif atas dimensi spasial-temporal sebuah `Room` atau `Facility`.                                                                                                                                       | Spatial        | `Pending` → `UnderReview` → `Approved` → `Active` → `Completed` ↔ `Rejected` ↔ `Canceled` |
| `Project`      | Inisiatif kerja makro lintas fungsi dengan batas waktu dan ruang lingkup terdefinisi.                                                                                                                              | Workspace      | `Draft` → `Active` → `OnHold` → `Completed` → `Archived`                                  |
| `Event`        | Aktualisasi `Project` yang spasial dan melibatkan kumpulan massa pada titik waktu tertentu.                                                                                                                        | Commerce       | `Draft` → `Published` → `Live` → `Finished` → `Archived`                                  |
| `Campaign`     | Inisiatif pemasaran terstruktur untuk mendorong konversi komersial dari `Event` atau `Product`.                                                                                                                    | Commerce       | `Planned` → `Active` → `Concluded`                                                        |
| `Product`      | Barang atau jasa komersial yang diperdagangkan (SKU). Dapat berupa tiket, merchandise, atau layanan berlangganan.                                                                                                  | Inventory      | `Draft` → `Published` → `Discontinued`                                                    |
| `TicketType`   | Kategori atau tier dari hak masuk (AccessPass) yang dapat diterbitkan untuk suatu `Event`. Setiap TicketType memiliki kapasitas, harga, dan durasi validitas tersendiri. **Database mapping:** `pass_tiers` table. | Commerce       | `Draft` → `Active` → `Archived`                                                           |
| `AccessPass`   | Hak masuk (digital atau fisik) yang terverifikasi ke suatu `Facility` atau `Event`, diterbitkan untuk pemegang tertentu berdasarkan `TicketType`.                                                                  | Commerce       | `Pending` → `Issued` → `CheckedIn` → `Consumed` ↔ `Revoked` ↔ `Expired`                   |
| `InventoryLot` | Kuantitas stok spesifik dari sebuah `Product` pada lokasi fisik atau digital tertentu.                                                                                                                             | Inventory      | `Active` → `Locked` → `Reconciled` → `Depleted`                                           |

**Harmonization Note (ARB Finding):** TicketType dalam ontologi Domain merepresentasikan konsep bisnis agregat (nama, harga, kapasitas, durasi); di Database Layer 2, ini dipetakan ke tabel `pass_tiers`. Keduanya mengacu pada entitas yang sama secara semantik. Kode aplikasi Layer 3 harus menggunakan `TicketType` dalam domain model dan `passTiers` dalam Drizzle ORM, dengan konversi ACL yang jelas di batas layer.

### 3.3 Finance & Accounting

| Canonical Name | Definition & Business Meaning                                                                                          | Owning Context | Lifecycle States                                                                                             |
| :------------- | :--------------------------------------------------------------------------------------------------------------------- | :------------- | :----------------------------------------------------------------------------------------------------------- |
| `Ledger`       | Buku besar akuntansi entri ganda (Double-Entry). Satu per Tenant.                                                      | Finance        | `Initialized` → `Active` → `Closed`                                                                          |
| `Account`      | Simpul Chart of Accounts (CoA) yang mengakumulasi saldo. Terklasifikasi: Aset, Liabilitas, Ekuitas, Pendapatan, Beban. | Finance        | `Draft` → `Active` → `Frozen` → `Closed`                                                                     |
| `JournalEntry` | Satu transaksi akuntansi yang terdiri dari dua atau lebih `JournalLine` yang wajib seimbang (∑ Debit \= ∑ Kredit).     | Finance        | `Draft` → `Posted` → `Voided`                                                                                |
| `JournalLine`  | Satu baris debit atau kredit pada sebuah `JournalEntry`. Bersifat immutable setelah Posted.                            | Finance        | _(tidak memiliki lifecycle independen; hidup dalam JournalEntry)_                                            |
| `Invoice`      | Dokumen penagihan komersial resmi yang diterbitkan kepada `Customer`.                                                  | Finance        | `Draft` → `Issued` → `PartiallyPaid` → `Paid` → `Settled` ↔ `Voided`                                         |
| `Expense`      | Catatan pengeluaran dana operasional yang diajukan oleh `User` atau dihasilkan sistem.                                 | Finance        | `Draft` → `Submitted` → `Approved` → `Reconciled` ↔ `Rejected`                                               |
| `Payment`      | Resolusi perpindahan likuiditas antara dua pihak, dipicu oleh `Invoice` atau `Booking`.                                | Finance        | `Initiated` → `Processing` → `Captured` → `Settled` → `Reconciled` ↔ `Failed` ↔ `Refunded` ↔ `RefundSettled` |
| `Escrow`       | Dana tertahan di rekening perantara yang menunggu pemicu pelepasan (release trigger) yang terdefinisi.                 | Finance        | `Locked` → `PendingRelease` → `Released` → `Settled` ↔ `Refunded`                                            |
| `Subscription` | Kontrak penagihan berulang yang mengikat `Customer` pada paket layanan dengan interval tertentu.                       | Billing        | `Active` → `PastDue` → `Paused` → `Canceled`                                                                 |

### 3.4 Work, Knowledge & AI

| Canonical Name     | Definition & Business Meaning                                                                                                                                                                                                                   | Owning Context | Lifecycle States                                                         |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- | :----------------------------------------------------------------------- |
| `Workflow`         | Mesin orkestrasi transisi status dengan topologi state machine yang terdefinisi dan immutable setelah Published.                                                                                                                                | Workspace      | `Draft` → `Published` → `Deprecated`                                     |
| `WorkflowInstance` | Satu jalannya eksekusi `Workflow` untuk sebuah entitas atau kejadian tertentu.                                                                                                                                                                  | Workspace      | `Running` → `PendingApproval` → `Completed` ↔ `Suspended` ↔ `Aborted`    |
| `Task`             | Unit kerja atomik yang dapat diassign ke `User` atau `AIAgent`. Lahir dari `WorkflowInstance` atau `Project`.                                                                                                                                   | Workspace      | `Backlog` → `Todo` → `InProgress` → `PendingReview` → `Done` ↔ `Blocked` |
| `Approval`         | Titik gerbang verifikasi Human-in-the-Loop di dalam `WorkflowInstance`. Tidak dapat dilewati oleh sistem. **Enforcement:** Semua WRITE actions dari AI Agents (L-06) harus menciptakan Approval dengan status `Pending` sebelum transisi state. | Workspace      | `Pending` → `Assigned` → `Reviewed` → `Approved` ↔ `Rejected`            |
| `KnowledgeBase`    | Repositori dokumen semantik yang diindeks AI untuk keperluan RAG dan pencarian semantik.                                                                                                                                                        | Knowledge      | `Initialized` → `Indexing` → `Active` → `Archived`                       |
| `Document`         | Artefak konten (PDF, Markdown, teks) yang disimpan di dalam `KnowledgeBase`.                                                                                                                                                                    | Knowledge      | `Draft` → `Published` → `Superseded` → `Archived`                        |
| `Embedding`        | Representasi vektor matematis dari sebuah `Document` atau chunk teks untuk semantic search (pgvector).                                                                                                                                          | AI             | `Generated` → `Synced` → `Stale` → `Re-indexed`                          |
| `AIAgent`          | Entitas komputasi otonom berbasis model bahasa (LLM) dengan set alat (tools) terdefinisi.                                                                                                                                                       | AI             | `Configured` → `Running` → `Idle` → `Disabled`                           |
| `Prompt`           | Templat kognitif instruksi LLM dengan manajemen versi ketat (mencegah prompt drift).                                                                                                                                                            | AI             | `Draft` → `Active` → `Deprecated`                                        |

---

## PART 4: UBIQUITOUS LANGUAGE (KAMUS KANONIKAL)

Kesepakatan absolut dalam penyebutan, percakapan, kode, dan dokumentasi. **Penggunaan nama yang deprecated/forbidden adalah pelanggaran standar teknis.**

### 4.1 Kamus Istilah (UPDATED)

| Canonical Term     | ✅ Allowed Usage                                                             | ❌ Deprecated / Forbidden                   | Alasan Pelarangan                                                                                       |
| :----------------- | :--------------------------------------------------------------------------- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------ |
| `TicketType`       | Domain ontology: "Event menawarkan tiga TicketType: Gold, Silver, Bronze."   | Tier (ambiguous), Category                  | Jelas terkait `AccessPass`; bukan generic "tier".                                                       |
| `pass_tiers`       | Database schema only: Tabel SQL yang merepresentasikan TicketType.           | tier (pada domain language)                 | Reserved untuk Database layer. Konversi di ACL boundary.                                                |
| `AccessPass`       | "Guest menebus AccessPassnya di pintu masuk."                                | Tiket, Wristband, Pass, EntryCode, QRTicket | "Tiket" adalah jenis `Product`. `AccessPass` adalah klaim hak masuk. Keduanya berbeda secara ontologis. |
| `JournalEntry`     | "Sistem menerbitkan JournalEntry reversal untuk membatalkan transaksi."      | Mutasi, Transaction, LedgerLog, Entry       | Menghindari tumpang tindih dengan istilah "Transaction" di konteks database atau payment.               |
| `Workspace`        | "Project ini dikelompokkan di dalam Workspace Departemen Pemasaran."         | Folder, Group, Space, Team, Channel         | Memastikan satu istilah tunggal untuk batas isolasi kolaborasi.                                         |
| `Booking`          | "Booking pada Facility ditolak karena konflik waktu."                        | Reservation, Rent, Order, Appointment       | "Order" digunakan di konteks Commerce. "Booking" khusus untuk klaim spasial-temporal.                   |
| `Supplier`         | "Supplier baru telah disetujui oleh Procurement."                            | Vendor, Provider, Partner                   | `Vendor` digunakan secara umum; `Supplier` adalah istilah domain spesifik untuk penyedia B2B.           |
| `Membership`       | "User memiliki Membership di dua Tenant berbeda."                            | Role, Account Link, Access                  | `Membership` adalah relasi eksplisit yang membawa Role, bukan sekadar akses.                            |
| `WorkflowInstance` | "WorkflowInstance untuk Booking \#123 sedang dalam status PendingApproval."  | Process, Job, Run                           | Membedakan template (`Workflow`) dari eksekusinya (`WorkflowInstance`).                                 |
| `Facility`         | "Venue utama didaftarkan sebagai Facility baru."                             | Venue, Location, Place, Site                | Konsistensi dengan Aggregate root di Spatial Domain.                                                    |
| `Approval`         | "Payment memerlukan Approval dari tenant:finance sebelum posting ke Ledger." | Authorisation, Sign-off, Gate               | Spesifik untuk titik verifikasi di dalam Workflow; `Approval` adalah entitas persistable.               |

### 4.2 Prinsip Penamaan Umum

- Gunakan **bahasa lampau (past tense)** untuk Domain Events: `BookingApproved`, bukan `BookingApprove`.
- Gunakan **bahasa perintah (imperative)** untuk Commands: `ApproveBooking`, bukan `BookingApproved`.
- **Hindari abbreviasi** dalam nama entitas domain: gunakan `JournalEntry`, bukan `JE` atau `Journal`.

---

## PART 12: STATE MACHINES (LIFECYCLES) — COMPLETE

Seluruh transisi status bersifat **deterministik dan diaudit**. Tidak ada transisi yang terjadi tanpa pemicu domain event. **[ARB Harmonization]** State machines yang tidak lengkap (Payment, Invoice) telah diperlengkapi dengan transisi guard conditions.

### 12.1 Booking (Constitution Part 12.1)

```
[Pending] ──► [UnderReview] ──► [Approved] ──► [Active] ──► [Completed]
    │               │               │
    └──► [Rejected] └──► [Rejected] └──► [Canceled]
```

_Triggers: `BookingSubmitted`, `BookingApproved`, `BookingRejected`, `BookingActivated`, `BookingCompleted`, `BookingCanceled`_

**Guard Conditions:**

- Pending → UnderReview: Only if Room capacity available and no time overlap (GiST constraint check).
- UnderReview → Approved: Only if approver role exists and facility status \= Active.
- UnderReview → Rejected: No conditions.
- Active → Completed: Only if current time \>= booking end time.
- Active → Canceled: Allowed anytime by booking owner or admin; triggers refund workflow if payment captured.

### 12.2 Payment (Constitution Part 12.2) — COMPLETE

```
[Initiated] ──► [Processing] ──► [Captured] ──► [Settled] ──► [Reconciled]
                     │               │
                 [Failed]        [Refunded] ──► [RefundSettled]
```

_Triggers: `PaymentInitiated`, `PaymentProcessing` [NEW], `PaymentCaptured`, `PaymentFailed`, `PaymentSettled`, `PaymentReconciled`, `RefundInitiated`, `RefundSettled`_

**Guard Conditions (ARB Resolution):**

- Initiated → Processing: Payment gateway provider selected and idempotency key verified.
- Processing → Captured: Gateway webhook signature valid; amount matches.
- Processing → Failed: Gateway returns error code; automatic retry logic exhausted (exponential backoff, 5 attempts max).
- Captured → Settled: Only after payment processor confirms final settlement (typically 1-2 business days).
- Settled → Reconciled: Reconciliation process triggered manually or scheduled nightly; amount reconciled against bank statement.
- Captured → Refunded: Refund amount ≤ captured amount; original invoice is voided or marked partial.
- Refunded → RefundSettled: Refund status confirmed by processor.

### 12.3 AccessPass (Constitution Part 12.3)

```
[Pending] ──► [Issued] ──► [CheckedIn] ──► [Consumed]
    │              └──► [Revoked]
    │
    └──► [Expired]
```

_Triggers: `AccessPassIssued`, `AccessPassScanned` (CheckedIn), `AccessPassRevoked`, `AccessPassExpired`, `AccessPassConsumed`_

**Guard Conditions (ARB Resolution):**

- Pending → Issued: Payment captured or pre-authorized; idempotency key confirmed.
- Pending → Expired: Hold timer (15 minutes default, configurable) elapsed without PaymentCaptured event.
- Issued → CheckedIn: QR code scanned at facility; timestamp recorded.
- CheckedIn → Consumed: Only after event completion or pass expiry time.
- Issued/CheckedIn → Revoked: Revocation code provided; triggers refund workflow if applicable.

### 12.4 Invoice (Constitution Part 12.4)

```
[Draft] ──► [Issued] ──► [PartiallyPaid] ──► [Paid] ──► [Settled]
    │                                                       │
    └──► [Voided] ◄────────────────────────────────────────┘
```

_Triggers: `InvoiceIssued`, `PaymentCaptured` (PartiallyPaid/Paid), `InvoiceVoided`_

**Guard Conditions:**

- Draft → Issued: Customer exists; line items total \> 0; due date \> issue date.
- Issued → PartiallyPaid: Payment amount \> 0 AND \< total amount.
- PartiallyPaid → Paid: Cumulative payments \= total amount (within rounding tolerance, ±1 unit smallest currency).
- Paid → Settled: Settlement process confirmed (e.g., customer receipt acknowledged or time-based).
- Any → Voided: Admin action with reversal JournalEntry created; triggers refund if payments captured.

### 12.5 WorkflowInstance (Constitution Part 12.5)

```
[Running] ──► [PendingApproval] ──► [Running] ──► [Completed]
    │                │
    └──► [Suspended] └──► [Aborted]
```

_Triggers: `WorkflowStarted`, `ApprovalRequested`, `ApprovalResolved`, `WorkflowCompleted`, `WorkflowSuspended`, `WorkflowAborted`_

**Guard Conditions:**

- Running → PendingApproval: Workflow definition specifies approval gate at this state.
- PendingApproval → Running: Approval resolved as "Approved"; all required approvers signed off.
- PendingApproval → Aborted: Approval resolved as "Rejected".
- Running → Completed: All tasks done and no pending approvals remain.
- Running → Suspended: Manual suspend by actor with admin role.
- Suspended → Running: Manual resume by original actor or admin.

### 12.6 JournalEntry (Constitution Part 12.6) — COMPLETE

```
[Draft] ──► [Posted]
               └──► [Voided] (creates Reversal JournalEntry)
```

_Triggers: `JournalPosted`, `JournalVoided`_

**Guard Conditions (ARB Resolution):**

- Draft → Posted: ∑ Debit \= ∑ Credit (to penny); all account IDs valid; Ledger is Active (not Closed).
- Posted → Voided: Only via stored procedure `post_ledger_transaction()` with reversal flag; creates new JournalEntry with all debits ↔ credits reversed, linked via `reversal_of_id`.
- Original entry immutable once Posted: Cannot UPDATE or DELETE; must use Voided path.

---

## PART 13: DOMAIN EVENT CATALOG — COMPLETE

Domain Events adalah **fakta bisnis yang telah terjadi**, bersifat immutable, dan menjadi backbone komunikasi asinkron lintas domain. Format: `PascalCase`, past tense.

### 13.1 Identity & Governance

| Event               | Payload Kunci                                                 | Konsumen                           |
| :------------------ | :------------------------------------------------------------ | :--------------------------------- |
| `TenantProvisioned` | `tenantId`, `slug`, `plan`, `traceId`                         | Ledger, KnowledgeBase (init), CRM  |
| `TenantFrozen`      | `tenantId`, `reason`, `frozenBy`, `frozenAt`                  | All Contexts (block new mutations) |
| `UserRegistered`    | `userId`, `tenantId`, `email`, `traceId`                      | CRM, Notification, AI              |
| `MembershipGranted` | `userId`, `tenantId`, `role`, `scope`, `grantedBy`, `traceId` | IAM, Audit, Notification           |
| `RoleAssigned`      | `userId`, `role`, `scope`, `assignedBy`, `traceId`            | IAM, Audit                         |

### 13.2 Spatial & Booking

| Event                     | Payload Kunci                                                             | Konsumen                                             |
| :------------------------ | :------------------------------------------------------------------------ | :--------------------------------------------------- |
| `FacilityRegistered`      | `facilityId`, `organizationId`, `traceId`                                 | Spatial, AI                                          |
| `BookingSubmitted`        | `bookingId`, `facilityId`, `roomId`, `timeRange`, `customerId`, `traceId` | Workflow (approval gate)                             |
| `BookingApproved`         | `bookingId`, `approvedBy`, `approvedAt`, `traceId`                        | Commerce, Notification, Ledger (if payment required) |
| `BookingRejected`         | `bookingId`, `reason`, `rejectedBy`, `rejectedAt`, `traceId`              | Notification                                         |
| `BookingConflictDetected` | `bookingId`, `conflictingBookingId`, `timeRange`, `traceId`               | Workflow, Notification, Analytics                    |
| `BookingCanceled`         | `bookingId`, `canceledBy`, `reason`, `traceId`                            | Ledger (refund), Notification                        |

### 13.3 Commerce & Access (COMPLETE)

| Event                  | Payload Kunci                                                                                     | Konsumen                                             | Notes                                             |
| :--------------------- | :------------------------------------------------------------------------------------------------ | :--------------------------------------------------- | :------------------------------------------------ |
| `EventPublished`       | `eventId`, `projectId`, `publishedAt`, `traceId`                                                  | Notification, Commerce, Analytics                    | Event moves to Live state                         |
| `AccessPassIssued`     | `passId`, `eventId`, `ticketTypeId`, `customerId`, `holderName`, `expiresAt`, `qrHash`, `traceId` | Commerce, Notification, Workflow (hold timer starts) | Replaces `AccessPassReserved`                     |
| `AccessPassScanned`    | `passId`, `scannedAt`, `facilityId`, `scannedBy`, `traceId`                                       | Commerce (CheckedIn state), Analytics                | QR validation result embedded                     |
| `AccessPassRevoked`    | `passId`, `reason`, `revokedBy`, `revokedAt`, `traceId`                                           | Notification, Ledger (refund)                        | Triggers refund workflow if payment captured      |
| `AccessPassExpired`    | `passId`, `expiredAt`, `traceId`                                                                  | Notification, Ledger (reserve release)               | 15-min hold timer elapsed without PaymentCaptured |
| `AccessPassConsumed`   | `passId`, `consumedAt`, `traceId`                                                                 | Analytics, Commerce                                  | Post-event state transition                       |
| `ProductStockDepleted` | `productId`, `inventoryLotId`, `traceId`                                                          | Notification, Commerce, AI                           | Low inventory alert                               |

### 13.4 Finance & Ledger (COMPLETE)

| Event               | Payload Kunci                                                                                             | Konsumen                                                             | Notes                                                  |
| :------------------ | :-------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- | :----------------------------------------------------- |
| `InvoiceIssued`     | `invoiceId`, `customerId`, `amount`, `dueDate`, `issuedAt`, `traceId`                                     | Notification, Ledger, Workflow                                       | Creates AR account entry                               |
| `PaymentInitiated`  | `paymentId`, `invoiceId`, `amount`, `gateway`, `gatewayReference`, `initiatedAt`, `traceId`               | Payment processor, Ledger                                            | Begins processing state                                |
| `PaymentProcessing` | `paymentId`, `invoiceId`, `amount`, `gateway`, `processingAt`, `traceId`                                  | Ledger (holds AR), Analytics                                         | NEW (ARB Resolution): Mid-state event for long polling |
| `PaymentCaptured`   | `paymentId`, `invoiceId`, `amount`, `capturedAt`, `gatewayConfirmation`, `traceId`                        | Ledger (posts JE), Notification, Workflow (releases AccessPass hold) | Funds secured; JournalEntry posted                     |
| `PaymentFailed`     | `paymentId`, `invoiceId`, `reason`, `errorCode`, `failedAt`, `traceId`                                    | Notification, Workflow (retry logic), Analytics                      | Error logged for diagnosis                             |
| `PaymentSettled`    | `paymentId`, `invoiceId`, `settledAt`, `traceId`                                                          | Ledger (finalizes), Notification, Reporting                          | 1-2 business days post-capture                         |
| `PaymentReconciled` | `paymentId`, `invoiceId`, `reconciledAt`, `reconciledBy`, `traceId`                                       | Audit, Reporting                                                     | Bank statement matched                                 |
| `RefundInitiated`   | `refundId`, `paymentId`, `refundAmount`, `reason`, `initiatedAt`, `traceId`                               | Payment processor, Ledger                                            | NEW (ARB Resolution): Explicit refund event            |
| `RefundSettled`     | `refundId`, `paymentId`, `refundAmount`, `settledAt`, `traceId`                                           | Ledger (posts reversal JE), Notification                             | Funds returned to customer                             |
| `JournalPosted`     | `journalEntryId`, `ledgerId`, `narration`, `totalDebit`, `totalCredit`, `postedAt`, `postedBy`, `traceId` | Audit, Reporting, Analytics                                          | Double-entry posted; immutable thereafter              |
| `JournalVoided`     | `journalEntryId`, `reversalJournalId`, `reason`, `voidedAt`, `voidedBy`, `traceId`                        | Audit, Ledger (auto-posts reversal), Reporting                       | Original entry marked voided; reversal entry linked    |
| `EscrowReleased`    | `escrowId`, `releasedTo`, `amount`, `releasedAt`, `releasedBy`, `traceId`                                 | Ledger (posts), Notification                                         | Trigger condition met                                  |

### 13.5 Workflow & AI (COMPLETE)

| Event                       | Payload Kunci                                                                                       | Konsumen                                        | Notes                                    |
| :-------------------------- | :-------------------------------------------------------------------------------------------------- | :---------------------------------------------- | :--------------------------------------- |
| `WorkflowStarted`           | `instanceId`, `workflowId`, `entityId`, `startedAt`, `startedBy`, `traceId`                         | Workflow engine, Notification                   | Template instantiated                    |
| `ApprovalRequested`         | `approvalId`, `assignedTo`, `context`, `requiredApprovals`, `requestedAt`, `traceId`                | Notification, Workflow (blocks), AI (no bypass) | Human gate activated; AI cannot override |
| `ApprovalResolved`          | `approvalId`, `resolution` (Approved \| Rejected), `resolvedBy`, `resolvedAt`, `traceId`            | Workflow (unblock or abort), Notification       | Approval completed                       |
| `WorkflowCompleted`         | `instanceId`, `completedAt`, `completedBy`, `traceId`                                               | Analytics, Notification, Event bus              | All states and approvals done            |
| `WorkflowSuspended`         | `instanceId`, `suspendedAt`, `suspendedBy`, `reason`, `traceId`                                     | Notification                                    | Manual pause; can resume                 |
| `WorkflowAborted`           | `instanceId`, `abortedAt`, `abortedBy`, `reason`, `traceId`                                         | Notification, Ledger (if refund needed)         | Terminal state; cleanup triggered        |
| `KnowledgeIndexed`          | `documentId`, `knowledgeBaseId`, `chunkCount`, `indexedAt`, `traceId`                               | AI, Analytics                                   | Ingestion complete                       |
| `EmbeddingGenerated`        | `embeddingId`, `documentId`, `chunkId`, `model`, `dimensions`, `generatedAt`, `traceId`             | AI (RAG retrieval), Analytics                   | Vector ready for similarity search       |
| `AIRecommendationGenerated` | `recommendationId`, `agentId`, `entityId`, `confidence`, `recommendation`, `generatedAt`, `traceId` | Workflow (creates Approval), Notification       | Routed through Approval gate (L-06)      |
| `NotificationDelivered`     | `notificationId`, `channel`, `recipient`, `deliveredAt`, `status`, `traceId`                        | Audit, Analytics                                | Omni-channel delivery confirmed          |

---

## PART 13.5: COMMAND ↔ EVENT MAPPING TABLE (NEW)

[Requires ADR] This table provides exhaustive mappings between Commands (imperative requests) and Domain Events (historical facts). It resolves ARB Finding: "Command Taxonomy Incompleteness."

| Domain           | Command (Imperative)     | Preconditions                                                                                             | Aggregate Invariant           | Domain Event(s) Emitted                 | Postcondition                                     |
| :--------------- | :----------------------- | :-------------------------------------------------------------------------------------------------------- | :---------------------------- | :-------------------------------------- | :------------------------------------------------ |
| **Booking**      | `SubmitBooking`          | Room available; Facility Active; no time overlap (GiST)                                                   | `booking.status \= Draft`     | `BookingSubmitted`                      | status \= Pending; awaits approval                |
|                  | `ApproveBooking`         | booking.status \= Pending; approver role; facility accessible                                             | booking valid                 | `BookingApproved`                       | status \= Approved; workflow unblocks             |
|                  | `RejectBooking`          | booking.status \= Pending \| UnderReview                                                                  | any                           | `BookingRejected`                       | status \= Rejected; terminal                      |
|                  | `ActivateBooking`        | booking.status \= Approved; current time ≤ booking start                                                  | booking valid                 | `BookingActivated`                      | status \= Active                                  |
|                  | `CompleteBooking`        | booking.status \= Active; current time ≥ booking end                                                      | booking valid                 | `BookingCompleted`                      | status \= Completed; terminal                     |
|                  | `CancelBooking`          | booking.status \= Pending \| Approved \| Active; actor is owner \| admin                                  | booking valid                 | `BookingCanceled`                       | status \= Canceled; triggers refund               |
| **Payment**      | `InitiatePayment`        | Invoice exists; amount \> 0; gateway provider configured                                                  | payment.gateway configured    | `PaymentInitiated`                      | status \= Initiated; ready for processing         |
|                  | `ProcessPayment`         | payment.status \= Initiated; idempotency key valid; gateway reachable                                     | payment.gateway reachable     | `PaymentProcessing`                     | status \= Processing; gateway async               |
|                  | `CapturePayment`         | payment.status \= Processing; gateway webhook signature valid; amount matches                             | amount diff \= 0              | `PaymentCaptured`                       | status \= Captured; funds secured                 |
|                  | `FailPayment`            | payment.status \= Processing; gateway error \| timeout; max retries exhausted                             | retry exhausted               | `PaymentFailed`                         | status \= Failed; alert issued                    |
|                  | `SettlePayment`          | payment.status \= Captured; settlement time arrived (1-2 business days)                                   | time gate passed              | `PaymentSettled`                        | status \= Settled; final                          |
|                  | `ReconcilePayment`       | payment.status \= Settled; bank statement reconciliation done                                             | bank match                    | `PaymentReconciled`                     | status \= Reconciled; complete                    |
|                  | `InitiateRefund`         | payment.status \= Captured; refund amount ≤ captured amount                                               | refund \≤ original            | `RefundInitiated`                       | refund.status \= Initiated                        |
|                  | `SettleRefund`           | refund.status \= Initiated; gateway confirmation received                                                 | gateway confirm               | `RefundSettled`                         | refund.status \= Settled; reversal JE posted      |
| **AccessPass**   | `IssueAccessPass`        | TicketType capacity available (issued \< capacity); payment captured \| hold valid; idempotency key valid | capacity \≤ limit; time valid | `AccessPassIssued`                      | status \= Issued; QR generated; hold timer starts |
|                  | `ScanAccessPass`         | pass.status \= Issued \| CheckedIn; QR hash valid; facility location confirmed                            | QR hash valid                 | `AccessPassScanned`                     | status \= CheckedIn; timestamp recorded           |
|                  | `RevokeAccessPass`       | pass.status \= Issued \| CheckedIn; actor is owner \| admin; reason provided                              | any                           | `AccessPassRevoked`                     | status \= Revoked; refund triggered               |
|                  | `ConsumeAccessPass`      | pass.status \= CheckedIn \| Issued; event end time passed \| manual consume                               | consumption valid             | `AccessPassConsumed`                    | status \= Consumed; final                         |
| **Invoice**      | `IssueInvoice`           | Customer exists; line items \> 0; due date valid                                                          | line total \> 0               | `InvoiceIssued`                         | status \= Issued; AR posted to Ledger             |
|                  | `RecordPayment`          | invoice.status \= Issued \| PartiallyPaid; payment amount \> 0; matches Payment domain event              | amount match                  | `InvoicePartiallyPaid` \| `InvoicePaid` | status transitions; AR reduced                    |
|                  | `VoidInvoice`            | invoice.status \= Draft \| Issued; reason provided                                                        | issuer can void               | `InvoiceVoided`                         | status \= Voided; reversal JE created             |
| **JournalEntry** | `PostJournalEntry`       | entry.status \= Draft; ∑Debit \= ∑Credit; all accounts valid; ledger Active                               | balance \= 0                  | `JournalPosted`                         | status \= Posted; immutable                       |
|                  | `VoidJournalEntry`       | entry.status \= Posted; reason provided; actor is ledger:admin                                            | original Posted               | `JournalVoided`                         | status \= Voided; reversal entry created          |
| **Workflow**     | `StartWorkflow`          | Workflow template published; entity valid (Booking, Invoice, etc.)                                        | template valid                | `WorkflowStarted`                       | instance.status \= Running                        |
|                  | `RequestApproval`        | instance.status \= Running; gate defined in template; approvers configured                                | gate exists                   | `ApprovalRequested`                     | approval.status \= Pending; blocks workflow       |
|                  | `ResolveApproval`        | approval.status \= Pending; approver authenticated; decision (Approve \| Reject)                          | approver valid                | `ApprovalResolved`                      | approval.status \= Approved \| Rejected           |
|                  | `CompleteWorkflow`       | instance.status \= Running; no pending approvals; all tasks done                                          | cleanup valid                 | `WorkflowCompleted`                     | instance.status \= Completed; terminal            |
|                  | `SuspendWorkflow`        | instance.status \= Running; actor is admin; reason provided                                               | admin only                    | `WorkflowSuspended`                     | instance.status \= Suspended                      |
|                  | `ResumeWorkflow`         | instance.status \= Suspended; actor is original starter \| admin                                          | suspended only                | `WorkflowResumed`                       | instance.status \= Running                        |
|                  | `AbortWorkflow`          | instance.status \= Running \| Suspended; actor is admin; reason provided                                  | admin only                    | `WorkflowAborted`                       | instance.status \= Aborted; cleanup triggered     |
| **AI**           | `GenerateRecommendation` | AIAgent configured; knowledge base indexed; entity context valid                                          | agent enabled                 | `AIRecommendationGenerated`             | creates Approval (L-06; no direct write)          |
|                  | `IndexDocument`          | document uploaded; knowledge base active; format recognized                                               | doc valid                     | `KnowledgeIndexed`                      | document status \= Indexed; chunks created        |
|                  | `GenerateEmbedding`      | chunk valid; embedding model configured; pgvector dimension matches                                       | model available               | `EmbeddingGenerated`                    | embedding.status \= Generated; vector stored      |

**Enforcement Notes:**

- Every Command MUST have at least one corresponding Domain Event.
- Every state transition MUST be guarded by preconditions checked before Command execution.
- Events are immutable; Commands can be retried with idempotency checks.
- [Requires ADR] Payment domain "Processing" state and explicit "ReconcilePayment" command added per ARB Resolution.

---

## PART 9: ENTERPRISE LAWS (CANONICAL RULES) — CLARIFIED

**Ini adalah konstanta operasional platform yang tidak boleh dilanggar tanpa ADR yang diratifikasi.**

| \#       | Law Name                          | Deskripsi & Enforcement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :------- | :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **L-01** | No Cross-Context Join             | Kueri database **dilarang** melakukan `JOIN` lintas Bounded Context di level SQL. Penggabungan data dilakukan di lapisan aplikasi (CQRS Read Model atau BFF). _Pelanggaran: Review wajib sebelum merge._ **Enforcement:** Automated static analysis in CI pipeline flags cross-context JOINs.                                                                                                                                                                                                                                      |
| **L-02** | Immutable Financial History       | Tabel Ledger, JournalEntry, JournalLine bersifat **Append-Only**. Dilarang `UPDATE` atau `DELETE`. Pembatalan menggunakan `Reversal JournalEntry` dengan referensi ke entry asal. **Enforcement:** Immutable triggers (`block_journal_entry_mutations`) reject UPDATE/DELETE on Posted/Voided status.                                                                                                                                                                                                                              |
| **L-03** | Soft Delete Everywhere            | Penghapusan fisik (`DELETE`) **dilarang** di lingkungan produksi untuk semua entitas bisnis. Gunakan `deleted_at TIMESTAMPTZ` \+ `deleted_by UUID`. Arsip periodik ke Cold Storage. **Enforcement:** Migration linter prevents `DROP COLUMN` or raw `DELETE` statements.                                                                                                                                                                                                                                                           |
| **L-04** | Idempotency Mandate               | Semua API mutasi (keuangan, booking, notifikasi) **wajib** menerima dan memvalidasi `X-Idempotency-Key`. Response harus identik untuk key yang sama. Stored di Valkey dengan 24h TTL. **Enforcement:** Request validation middleware rejects mutations without valid idempotency key. Database UNIQUE constraint on idempotency_key columns.                                                                                                                                                                                       |
| **L-05** | No Entity Without Owner           | Tidak boleh ada _orphan entity_. Setiap record wajib memiliki `tenant_id` (dan relevan: `organization_id`, `workspace_id`) yang terhubung langsung ke Aggregate Root. **Enforcement:** RLS policies block any query missing tenant context. Foreign key constraints prevent orphan creation.                                                                                                                                                                                                                                       |
| **L-06** | AI Write Interception (CLARIFIED) | Agen AI **tidak pernah** langsung menulis ke tabel finansial, kepemilikan, atau kontrak. Semua aksi material AI menghasilkan `Approval` dengan status `Pending` yang menunggu konfirmasi manusia **SEBELUM state transition**. Tidak ada bypass berdasarkan confidence score atau model capability. **Enforcement:** MCP tools expose only READ access for data; WRITE tools immediately create `Approval` rows via stored procedure and transition workflow to `PendingApproval` state. No direct DML execution from LLM context. |
| **L-07** | Command Handler Mandate           | Semua mutasi data material **wajib** melalui Command Handler atau Stored Procedure yang memvalidasi domain invariants. Mutasi langsung dari UI/API tanpa melewati validasi domain adalah pelanggaran arsitektur. **Enforcement:** Stored procedure `post_ledger_transaction()` mandatory for journal postings. Application Command handlers validate invariants before persistence.                                                                                                                                                |
| **L-08** | Zero-Downtime Migration           | Perubahan skema database **wajib** menggunakan pola _Expand and Contract_: tambah kolom baru → migrasi data → hapus kolom lama. Tidak boleh ada rename atau drop kolom langsung di satu migration. **Enforcement:** Migration CI pipeline flags breaking DDL; Expand/Contract pattern required in git history.                                                                                                                                                                                                                     |
| **L-09** | API Versioning                    | API publik **tidak boleh** mengalami Breaking Change tanpa menerbitkan versi baru (v1 → v2) dan memberikan sunset notice minimal 3 bulan kepada konsumen yang terdaftar. **Enforcement:** OpenAPI linter detects breaking changes. Deprecation headers mandatory on sunset path.                                                                                                                                                                                                                                                   |
| **L-10** | Secrets Never at Rest in App DB   | Kunci API eksternal, secret OAuth, dan kredensial PSP **tidak boleh** disimpan di tabel database Sovereign. Wajib menggunakan Vault (dienkripsi AES-256) dengan rotasi otomatis. **Enforcement:** Secret scan in CI blocks commits with hardcoded API keys. Vault integration mandatory in all adapter layers.                                                                                                                                                                                                                     |

---

## PART 14: CQRS & READ MODEL STRATEGY

Moventios menerapkan CQRS (Command Query Responsibility Segregation) untuk memisahkan jalur tulis dari jalur baca.

### 14.1 Prinsip CQRS

- **Command Side (Write):** Semua mutasi melalui Command Handlers yang memvalidasi invariant domain dan menerbitkan Domain Events. Menulis ke normalized PostgreSQL tables.
- **Query Side (Read):** Semua query yang kompleks (multi-join, agregasi, laporan) menggunakan Read Models yang didenormalisasi dan diperbarui secara asinkron oleh event handlers.

### 14.2 Read Model Registry (COMPLETE)

| Read Model                   | Sumber Events                                                         | Kegunaan                                | Refresh Strategy                             | SLA                              |
| :--------------------------- | :-------------------------------------------------------------------- | :-------------------------------------- | :------------------------------------------- | :------------------------------- |
| `BookingCalendarView`        | `BookingApproved`, `BookingCanceled`, `BookingCompleted`              | Tampilan kalender ketersediaan Facility | Event-driven (real-time)                     | \< 100ms p95                     |
| `LedgerSummaryView`          | `JournalPosted`, `JournalVoided`, `EscrowReleased`                    | Dashboard saldo CoA per Tenant          | Event-driven (async debounce 5s)             | \< 500ms p95                     |
| `CustomerInvoiceHistoryView` | `InvoiceIssued`, `PaymentCaptured`, `PaymentSettled`, `InvoiceVoided` | Riwayat tagihan Customer                | Event-driven                                 | \< 200ms p95                     |
| `EventSalesView`             | `AccessPassIssued`, `PaymentCaptured`, `AccessPassRevoked`            | Statistik penjualan Event               | Event-driven \+ nightly recompute (0200 UTC) | \< 300ms p95 live; \< 5min batch |
| `WorkflowStatusView`         | `WorkflowStarted`, `ApprovalResolved`, `TaskCompleted`                | Status task dan approval aktif          | Event-driven                                 | \< 150ms p95                     |
| `TenantAnalyticsView`        | Multiple (daily aggregation)                                          | BI dashboard ringkasan Tenant           | Scheduled (nightly batch 0300 UTC)           | \< 30min batch window            |

**Refresh Strategy Clarification (ARB Resolution):**

- Event-driven views use pg-boss queue to process events asynchronously without blocking Command execution.
- Async debounce (5s) applied to high-frequency events (e.g., payment state changes) to prevent materialized view thrashing.
- Nightly batch recompute provides data integrity checkpoint; detects and corrects event processing anomalies.

---

## PART 16: AI REFERENCE ARCHITECTURE (CLARIFIED)

AI in Moventios operates under **strict guardrails defined by L-06 (AI Write Interception)**.

### 16.1 MCP Tool Safety Levels

**Level 0 — FORBIDDEN (Never callable by AI)**

- Direct financial mutations: `PostJournalEntry`, `CapturePayment`, `IssueInvoice`.
- Ownership changes: `TransferAsset`, `ChangeAccountOwner`.
- Permanent deletes: `DeleteRecord`, `PurgeData`.

**Level 1 — PENDING (AI callable; auto-creates Approval)**

- Material writes: `IssueAccessPass`, `CancelBooking`, `DraftJournalEntry`, `RevokeAccessPass`.
- Behavioral: Callable by AI; immediately creates `Approval` row with status `Pending`; blocks Workflow until human approves.
- Enforcement: MCP tool handler checks permission level; for Level 1, calls stored procedure to create Approval before returning success to LLM.

**Level 2 — ALLOWED (AI callable; no approval)**

- Read-only: `GetLedgerBalance`, `SearchKnowledgeBase`, `ListBookings`, `GetEventStatus`.
- Status queries: `GetPaymentStatus`, `GetWorkflowInstance`, `GetInvoiceSummary`.

**Caller Responsibility:** Every MCP tool endpoint implementation **MUST** enforce these levels. Violation is production incident.

---

## PART 17: INTEGRATION LANDSCAPE & ANTI-CORRUPTION LAYERS

[Placeholder for complete integration taxonomy — see Layer 3 Part 2 for detailed OSS stack alignment.]

---

## PART 18: OBSERVABILITY & SLA MODEL

### 18.1 Observability Contract

Every Command Handler, Domain Service, and Adapter **MUST** emit OpenTelemetry spans with:

- `trace_id` (unique per user request; propagated end-to-end)
- `span_id` (unique per operation)
- `tenant_id` (from JWT or context)
- `actor_id` (User or AIAgent)
- `actor_type` (from `actor_type` enum)
- Structured attributes: `domain`, `aggregate`, `event_name`, `status`
- Duration (ms)

**SLA Targets:**
| Operation | p50 | p95 | p99 |
| :---- | :---- | :---- | :---- |
| Booking submit | 80ms | 200ms | 500ms |
| Payment capture | 150ms | 400ms | 1000ms |
| Journal post | 100ms | 250ms | 600ms |
| Access pass issuance | 120ms | 300ms | 700ms |

---

## APPENDIX C: CHANGELOG

### v5.0.2 (2026-06-25) — ARB Audit Harmonization

**Additions:**

- Part 13.5: Complete Command ↔ Event Mapping Table (resolves ARB Finding: Command Taxonomy Incompleteness).
- Part 12.2: Payment state machine expanded with guard conditions; explicit `PaymentProcessing` event added.
- Part 12.3: AccessPass lifecycle clarified with explicit expiry timing and revocation refund flow.
- Part 16.1: MCP Tool Safety Levels (Level 0/1/2) formalized (resolves ARB Finding: AI Safety Law Enforcement Missing).
- Part 9 clarifications: L-06 enforcement mechanism detailed; no bypass for high confidence; Approval gate mandatory.
- Part 3: TicketType ↔ pass_tiers canonicalization (resolves ARB Finding: Terminology Drift).

**Corrections:**

- Part 4: Ubiquitous Language expanded with TicketType clarification.
- Part 3.4: Approval entity definition clarified; references L-06 enforcement mechanism.
- Part 13.3 & 13.4: AccessPassExpired and RefundInitiated / RefundSettled events added (previously missing).

**Impact on Layer 2 & 3:**

- Requires update to Database SSOT (payment_state enum, journal_state enum, approval enforcement, RefundInitiated/RefundSettled event handling).
- Requires Layer 3 EPXA traceability chains for new Command → Event sequences (especially Refund and Payment Processing).

---

**End of Layer 1 — Constitution v5.0.2**
