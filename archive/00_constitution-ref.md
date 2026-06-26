# SOVEREIGN OS

## PLATFORM CANONICAL MODEL & REFERENCE ARCHITECTURE

**Version 5.0.1 — Enterprise Constitution** **Classification: Canonical Single Source of Truth (SSOT)** **Status: RATIFIED** **Supersedes: v3.0, v4.0**

---

**Panduan Penggunaan Dokumen Ini** Dokumen ini adalah **induk mutlak** dari seluruh artefak rekayasa dan produk Sovereign OS. Setiap kontradiksi antara dokumen turunan dengan dokumen ini harus diselesaikan dengan mengacu pada dokumen ini. Perubahan hanya sah melalui proses **RFC (Request for Constitution Change)** yang disetujui oleh Lead Architect.

---

## DAFTAR ISI

| Bagian | Judul |
| :---- | :---- |
| Part 1 | Platform Manifesto |
| Part 2 | Platform Principles |
| Part 3 | Platform Ontology |
| Part 4 | Ubiquitous Language (Kamus Kanonikal) |
| Part 5 | Platform Reference Model (Layer Architecture) |
| Part 6 | Business Capability Model |
| Part 7 | Domain Model & Context Mapping |
| Part 8 | Enterprise Relationship Model |
| Part 9 | Enterprise Laws (Canonical Rules) |
| Part 10 | Aggregate Design |
| Part 11 | Value Objects |
| Part 12 | State Machines (Lifecycles) |
| Part 13 | Domain Event Catalog |
| Part 14 | CQRS & Read Model Strategy |
| Part 15 | Security & Zero Trust Reference Model |
| Part 16 | AI Reference Architecture |
| Part 17 | Integration Landscape & Anti-Corruption Layers |
| Part 18 | Observability & SLA Model |
| Part 19 | Data Governance & Compliance |
| Part 20 | Deployment Reference Architecture |
| Part 21 | Engineering Governance |
| Part 22 | Architecture Decision Records (ADR) Manifest |
| Part 23 | Document Dependency Graph |
| Appendix A | Canonical Naming Standards |
| Appendix B | Error Taxonomy |
| Appendix C | Changelog |

---

## PART 1: PLATFORM MANIFESTO

### 1.1 Vision

Menjadi sistem operasi enterprise terdistribusi yang menyatukan logistik fisik, niaga digital, kecerdasan kognitif, dan integritas finansial ke dalam satu ekosistem yang **otonom, presisi, dan nir-latensi (zero-latency)**.

### 1.2 Mission

Mendemokratisasi infrastruktur enterprise-grade dengan menyediakan fondasi lintas industri yang **immutable, vendor-agnostic, dan digerakkan oleh AI (AI-First)**. Sovereign OS membebaskan organisasi dari beban utang teknis (technical debt), memungkinkan operasi dengan fidelitas audit absolut dan skalabilitas tanpa batas geografis.

### 1.3 Platform Philosophy — *The Stoic Ledger*

Platform berakar pada prinsip **Quiet Power (Kekuatan yang Tenang)**:

- **Menolak kebisingan sistemik.** Setiap state change adalah kebenaran absolut, bukan estimasi.  
- **Determinisme di atas segalanya.** Alur kerja bersifat dapat direproduksi, diaudit, dan diverifikasi ulang kapan pun.  
- **AI sebagai agen inti, bukan fitur pendamping.** AI menavigasi kompleksitas secara senyap di latar belakang; manusia membuat keputusan material akhir.  
- **Ketenangan kognitif.** Antarmuka tidak memaksa pengguna berpikir keras. Kompleksitas disembunyikan di balik kesederhanaan yang terancang.

### 1.4 AI-First & Zero Trust Foundation

AI bertindak sebagai lapisan kognitif dasar yang merangkum event stream, membangun knowledge graph, mendeteksi anomali, dan menghasilkan rekomendasi. Namun, **tidak ada entitas — manusia maupun AI — yang memiliki akses implisit**. Setiap aksi material wajib melewati otorisasi eksplisit dan tercatat dalam Immutable Ledger.

### 1.5 Long-term Direction

Berevolusi dari sistem manajemen B2B SaaS menjadi **AI-Native Distributed Ledger & Workflow Engine**. Platform bergerak menuju otonomi edge-computing di mana agen AI lokal mengeksekusi operasi bisnis berkat sinkronisasi data offline-first yang tangguh dan rekonsiliasi konflik yang deterministik.

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
- **Stateless Compute:** Komponen komputasi tidak menyimpan state sesi di memori proses. State tersimpan di database atau distributed cache (Redis).

### 2.3 Data & Security Principles

- **Immutable Financial History:** Data pembukuan dan audit bersifat Append-Only. Tidak ada perintah `UPDATE` atau `DELETE` pada tabel finansial di lingkungan produksi.  
- **Zero Cross-Context Join:** Operasi JOIN tabel antar Bounded Context dilarang di level database. Penggabungan dilakukan di lapisan aplikasi (BFF, CQRS Read Model, atau API Gateway).  
- **Zero Trust:** Keamanan tidak pernah diasumsikan. Setiap aktor, servis, dan permintaan diotentikasi dan diotorisasi pada setiap batasan (network boundary, service boundary, data boundary).  
- **Data Privacy by Design:** Klasifikasi PII wajib dilakukan sejak perancangan skema. Data sensitif (kartu kredit, secret) tidak boleh singgah di database Sovereign; wajib diteruskan ke Vault atau PSP.

### 2.4 AI & Operational Principles

- **AI Safety Law:** Agen AI memiliki akses `READ` terhadap pengetahuan bisnis. Aksi `WRITE` material (persetujuan kontrak, pencairan dana, perubahan kepemilikan) selalu dicegat dan dipaksa masuk ke status `Pending Human Approval`.  
- **Observability by Design:** Setiap transaksi memiliki `Trace-ID` yang merangkai Logs, Metrics, dan Distributed Traces dari ujung ke ujung (end-to-end).  
- **Stoic UX:** Antarmuka mengikuti prinsip corporate-formal dengan efisiensi kognitif tinggi. Animasi berlebih, warna mencolok, dan elemen yang memicu kepanikan adalah anti-pattern desain.

### 2.5 Reliability & Scalability Principles

- **Horizontal Scalability:** Lapisan komputasi (Edge Functions, API Routes) bersifat stateless dan dapat diskalakan secara horizontal tanpa koordinasi. Database menggunakan strategi read-replica untuk skalabilitas baca.  
- **Disaster Recovery:** Platform dirancang dengan topologi active-active untuk komponen kritikal (Ledger, IAM) dan active-passive untuk komponen pendukung. RTO \< 15 menit, RPO \< 5 menit.  
- **Idempotency by Default:** Semua operasi mutasi (keuangan, reservasi, notifikasi) dirancang idempoten dan menerima `X-Idempotency-Key`.

---

## PART 3: PLATFORM ONTOLOGY

Definisi kanonikal objek fundamental Sovereign OS. **Seluruh penamaan variabel, kelas, tabel database, dan dokumentasi wajib menggunakan nama-nama di bawah ini.**

### 3.1 Governance, Identity & CRM

| Canonical Name | Definition & Business Meaning | Owning Context | Lifecycle States |
| :---- | :---- | :---- | :---- |
| `Tenant` | Entitas penyewa B2B terisolasi yang menggunakan platform SaaS. Unit isolasi tertinggi. | Platform Governance | `Provisioning` → `Active` → `Frozen` → `Terminated` |
| `Organization` | Badan usaha atau entitas legal di bawah satu Tenant. Satu Tenant dapat memiliki beberapa Organization. | Governance | `Draft` → `Active` → `Archived` |
| `Department` | Sub-divisi fungsional di dalam Organization (misal: Pemasaran, Keuangan, Operasional). | Organization | `Active` → `Inactive` |
| `Workspace` | Area kolaborasi logis dan batas isolasi proyek. Dikelola oleh Organization. | Organization | `Created` → `Active` → `Archived` |
| `User` | Aktor manusia dengan identitas tunggal lintas Tenant. Satu User dapat terikat ke beberapa Tenant melalui `Membership`. | IAM | `Registered` → `Active` → `Suspended` → `Deactivated` |
| `Membership` | Relasi eksplisit antara `User` dan `Tenant`, membawa peran (Role) dan izin (Permission). | IAM | `Invited` → `Active` → `Revoked` |
| `Customer` | Klien eksternal pembeli jasa atau produk dari Tenant. | CRM | `Lead` → `Active` → `Churned` |
| `Supplier` | Pihak ketiga penyedia barang atau jasa logistik bagi Tenant. | CRM | `Draft` → `Approved` → `Suspended` → `Banned` |

### 3.2 Spatial, Commerce & Operations

| Canonical Name | Definition & Business Meaning | Owning Context | Lifecycle States |
| :---- | :---- | :---- | :---- |
| `Facility` | Aset properti fisik makro (Gedung, Area, Lahan) yang dikelola Tenant. | Spatial | `Draft` → `Active` → `Maintenance` → `Decommissioned` |
| `Room` | Sub-unit dari `Facility` yang dapat dipesan secara independen (Ruang rapat, Lapangan, Panggung). | Spatial | `Available` → `Occupied` → `Maintenance` |
| `Asset` | Unit properti fisik atau digital bernilai yang dapat dilacak dan diassign (Peralatan, Kendaraan, Lisensi). | Spatial | `Procured` → `Active` → `Retired` |
| `Booking` | Klaim eksklusif atas dimensi spasial-temporal sebuah `Room` atau `Facility`. | Spatial | `Pending` → `UnderReview` → `Approved` → `Active` → `Completed` ↔ `Rejected` ↔ `Canceled` |
| `Project` | Inisiatif kerja makro lintas fungsi dengan batas waktu dan ruang lingkup terdefinisi. | Workspace | `Draft` → `Active` → `OnHold` → `Completed` → `Archived` |
| `Event` | Aktualisasi `Project` yang spasial dan melibatkan kumpulan massa pada titik waktu tertentu. | Commerce | `Draft` → `Published` → `Live` → `Finished` → `Archived` |
| `Campaign` | Inisiatif pemasaran terstruktur untuk mendorong konversi komersial dari `Event` atau `Product`. | Commerce | `Planned` → `Active` → `Concluded` |
| `Product` | Barang atau jasa komersial yang diperdagangkan (SKU). Dapat berupa tiket, merchandise, atau layanan berlangganan. | Inventory | `Draft` → `Published` → `Discontinued` |
| `InventoryLot` | Kuantitas stok spesifik dari sebuah `Product` pada lokasi fisik atau digital tertentu. | Inventory | `Active` → `Locked` → `Reconciled` → `Depleted` |
| `AccessPass` | Hak masuk (digital atau fisik) yang terverifikasi ke suatu `Facility` atau `Event`. | Commerce | `Pending` → `Issued` → `CheckedIn` → `Consumed` ↔ `Revoked` |

### 3.3 Finance & Accounting

| Canonical Name | Definition & Business Meaning | Owning Context | Lifecycle States |
| :---- | :---- | :---- | :---- |
| `Ledger` | Buku besar akuntansi entri ganda (Double-Entry). Satu per Tenant. | Finance | `Initialized` → `Active` → `Closed` |
| `Account` | Simpul Chart of Accounts (CoA) yang mengakumulasi saldo. Terklasifikasi: Aset, Liabilitas, Ekuitas, Pendapatan, Beban. | Finance | `Draft` → `Active` → `Frozen` → `Closed` |
| `JournalEntry` | Satu transaksi akuntansi yang terdiri dari dua atau lebih `JournalLine` yang wajib seimbang (∑ Debit \= ∑ Kredit). | Finance | `Draft` → `Posted` → `Voided` |
| `JournalLine` | Satu baris debit atau kredit pada sebuah `JournalEntry`. Bersifat immutable setelah Posted. | Finance | *(tidak memiliki lifecycle independen; hidup dalam JournalEntry)* |
| `Invoice` | Dokumen penagihan komersial resmi yang diterbitkan kepada `Customer`. | Finance | `Draft` → `Issued` → `PartiallyPaid` → `Paid` → `Settled` ↔ `Voided` |
| `Expense` | Catatan pengeluaran dana operasional yang diajukan oleh `User` atau dihasilkan sistem. | Finance | `Draft` → `Submitted` → `Approved` → `Reconciled` ↔ `Rejected` |
| `Payment` | Resolusi perpindahan likuiditas antara dua pihak, dipicu oleh `Invoice` atau `Booking`. | Finance | `Initiated` → `Processing` → `Captured` → `Settled` → `Reconciled` ↔ `Failed` ↔ `Refunded` |
| `Escrow` | Dana tertahan di rekening perantara yang menunggu pemicu pelepasan (release trigger) yang terdefinisi. | Finance | `Locked` → `PendingRelease` → `Released` → `Settled` ↔ `Refunded` |
| `Subscription` | Kontrak penagihan berulang yang mengikat `Customer` pada paket layanan dengan interval tertentu. | Billing | `Active` → `PastDue` → `Paused` → `Canceled` |

### 3.4 Work, Knowledge & AI

| Canonical Name | Definition & Business Meaning | Owning Context | Lifecycle States |
| :---- | :---- | :---- | :---- |
| `Workflow` | Mesin orkestrasi transisi status dengan topologi state machine yang terdefinisi dan immutable setelah Published. | Workspace | `Draft` → `Published` → `Deprecated` |
| `WorkflowInstance` | Satu jalannya eksekusi `Workflow` untuk sebuah entitas atau kejadian tertentu. | Workspace | `Running` → `PendingApproval` → `Completed` ↔ `Suspended` ↔ `Aborted` |
| `Task` | Unit kerja atomik yang dapat diassign ke `User` atau `AIAgent`. Lahir dari `WorkflowInstance` atau `Project`. | Workspace | `Backlog` → `Todo` → `InProgress` → `PendingReview` → `Done` ↔ `Blocked` |
| `Approval` | Titik gerbang verifikasi Human-in-the-Loop di dalam `WorkflowInstance`. Tidak dapat dilewati oleh sistem. | Workspace | `Pending` → `Assigned` → `Reviewed` → `Approved` ↔ `Rejected` |
| `KnowledgeBase` | Repositori dokumen semantik yang diindeks AI untuk keperluan RAG dan pencarian semantik. | Knowledge | `Initialized` → `Indexing` → `Active` → `Archived` |
| `Document` | Artefak konten (PDF, Markdown, teks) yang disimpan di dalam `KnowledgeBase`. | Knowledge | `Draft` → `Published` → `Superseded` → `Archived` |
| `Embedding` | Representasi vektor matematis dari sebuah `Document` atau chunk teks untuk semantic search (pgvector). | AI | `Generated` → `Synced` → `Stale` → `Re-indexed` |
| `AIAgent` | Entitas komputasi otonom berbasis model bahasa (LLM) dengan set alat (tools) terdefinisi. | AI | `Configured` → `Running` → `Idle` → `Disabled` |
| `Prompt` | Templat kognitif instruksi LLM dengan manajemen versi ketat (mencegah prompt drift). | AI | `Draft` → `Active` → `Deprecated` |

---

## PART 4: UBIQUITOUS LANGUAGE (KAMUS KANONIKAL)

Kesepakatan absolut dalam penyebutan, percakapan, kode, dan dokumentasi. **Penggunaan nama yang deprecated/forbidden adalah pelanggaran standar teknis.**

### 4.1 Kamus Istilah

| Canonical Term | ✅ Allowed Usage | ❌ Deprecated / Forbidden | Alasan Pelarangan |
| :---- | :---- | :---- | :---- |
| `AccessPass` | "Guest menebus AccessPass-nya di pintu masuk." | Tiket, Wristband, Pass, EntryCode, QRTicket | "Tiket" adalah jenis `Product`. `AccessPass` adalah klaim hak masuk. Keduanya berbeda secara ontologis. |
| `JournalEntry` | "Sistem menerbitkan JournalEntry reversal untuk membatalkan transaksi." | Mutasi, Transaction, LedgerLog, Entry | Menghindari tumpang tindih dengan istilah "Transaction" di konteks database atau payment. |
| `Workspace` | "Project ini dikelompokkan di dalam Workspace Departemen Pemasaran." | Folder, Group, Space, Team, Channel | Memastikan satu istilah tunggal untuk batas isolasi kolaborasi. |
| `Booking` | "Booking pada Facility ditolak karena konflik waktu." | Reservation, Rent, Order, Appointment | "Order" digunakan di konteks Commerce. "Booking" khusus untuk klaim spasial-temporal. |
| `Supplier` | "Supplier baru telah disetujui oleh Procurement." | Vendor, Provider, Partner | "Vendor" digunakan secara umum; `Supplier` adalah istilah domain spesifik untuk penyedia B2B. |
| `Membership` | "User memiliki Membership di dua Tenant berbeda." | Role, Account Link, Access | `Membership` adalah relasi eksplisit yang membawa Role, bukan sekadar akses. |
| `WorkflowInstance` | "WorkflowInstance untuk Booking \#123 sedang dalam status PendingApproval." | Process, Job, Run | Membedakan template (`Workflow`) dari eksekusinya (`WorkflowInstance`). |
| `Facility` | "Venue utama didaftarkan sebagai Facility baru." | Venue, Location, Place, Site | Konsistensi dengan Aggregate root di Spatial Domain. |

### 4.2 Prinsip Penamaan Umum

- Gunakan **bahasa lampau (past tense)** untuk Domain Events: `BookingApproved`, bukan `BookingApprove`.  
- Gunakan **bahasa perintah (imperative)** untuk Commands: `ApproveBooking`, bukan `BookingApproved`.  
- **Hindari abbreviasi** dalam nama entitas domain: gunakan `JournalEntry`, bukan `JE` atau `Journal`.

---

## PART 5: PLATFORM REFERENCE MODEL

Model konseptual aliran nilai lintas lapisan arsitektural. Data mengalir dari atas ke bawah; visibilitas dan kecerdasan mengalir dari bawah ke atas.

╔══════════════════════════════════════════════════════════════════════════════════╗

║            \[ PLATFORM GOVERNANCE LAYER \]                                         ║

║   SaaS Admin · Multi-Tenant Provisioning · Platform Billing · Compliance        ║

╠══════════════════════════════════════════════════════════════════════════════════╣

║            \[ IDENTITY & ORGANIZATION LAYER \]                                     ║

║   Unified Auth (SSO/OIDC) · RBAC/ABAC · Membership · Workspace · CRM           ║

╠══════════════════════════════════════════════════════════════════════════════════╣

║            \[ OPERATIONAL & SPATIAL LAYER \]                                       ║

║   Projects · Events · Facilities · Bookings · Tasks · Workflows                 ║

╠══════════════════════╦═══════════════════════════════════════════════════════════╣

║  \[ COMMERCE LAYER \]  ║          \[ KNOWLEDGE & AI LAYER \]                         ║

║  Products · Campaigns║  Embeddings · RAG · AI Agents · Prompts · Workflow Engine ║

║  Promotions · Pricing║                                                            ║

╠══════════════════════╩═══════════════════════════════════════════════════════════╣

║            \[ FINANCIAL & LEDGER LAYER \]                                          ║

║   Double-Entry Journals · Invoices · Escrows · Payments · Subscriptions         ║

╠══════════════════════════════════════════════════════════════════════════════════╣

║            \[ INTEGRATION & COMMUNICATION LAYER \]                                 ║

║   Payment Gateways · Webhooks · WhatsApp/Email · ERP Connectors · Edge Fn       ║

╠══════════════════════════════════════════════════════════════════════════════════╣

║            \[ INFRASTRUCTURE & OBSERVABILITY LAYER \]                              ║

║   PostgreSQL \+ pgvector · Edge CDN · Object Storage · Logs · Metrics · Traces  ║

╚══════════════════════════════════════════════════════════════════════════════════╝

**Aturan aliran data antar layer:**

- Layer yang lebih tinggi **boleh memanggil** layer di bawahnya.  
- Layer yang lebih rendah **tidak boleh memanggil** layer di atasnya (hanya boleh menerbitkan events).  
- Komunikasi **lintas layer non-adjacent** harus melewati layer di antaranya atau menggunakan Domain Events.

---

## PART 6: BUSINESS CAPABILITY MODEL

Peta fungsional hierarkis kapabilitas enterprise Sovereign OS.

Sovereign OS

├── 1\. Governance & Identity

│   ├── Tenant Provisioning & Lifecycle Management

│   ├── Identity & Access Management (SSO, OIDC, MFA)

│   ├── Role-Based & Attribute-Based Access Control (RBAC/ABAC)

│   ├── Compliance, Audit Trail & Legal Hold

│   └── Platform Billing & Subscription Management

│

├── 2\. CRM & Organization

│   ├── Customer 360 & Lifecycle Management (Lead → Churned)

│   ├── Supplier & Procurement Management

│   ├── Department & Organizational Structuring

│   └── Asset Tracking & Management

│

├── 3\. Spatial & Facility Management

│   ├── Facility & Room Registration

│   ├── Spatio-Temporal Booking Resolution (GIST Constraint)

│   ├── Conflict Detection & Waitlist Management

│   └── Occupancy Analytics

│

├── 4\. Commerce & Event Management

│   ├── Event Lifecycle (Draft → Published → Live → Finished)

│   ├── Product & SKU Management

│   ├── Access Pass (Ticketing) Issuance & Validation

│   ├── Dynamic Pricing, Promotions & Coupons

│   ├── Inventory & Fulfillment (Stock Movement, Warehouse Routing)

│   └── Campaign Management

│

├── 5\. Finance & Accounting

│   ├── Double-Entry General Ledger (Swiss-Standard)

│   ├── Chart of Accounts (CoA) Management

│   ├── Invoice Generation & Management

│   ├── Payment Processing & Gateway Routing

│   ├── Escrow & Settlement Management

│   ├── Expense Tracking & Reconciliation

│   ├── Subscription Billing (Recurring)

│   └── Tax Computation & Reporting

│

├── 6\. Workflow & Operations

│   ├── State Machine Orchestration (Workflow Engine)

│   ├── Multi-tier Human Approval Gates

│   ├── Task Assignment & Tracking

│   └── Crew & Resource Management

│

├── 7\. AI & Knowledge

│   ├── Document Management & Versioning

│   ├── Semantic Search (Vector Similarity)

│   ├── Retrieval-Augmented Generation (RAG)

│   ├── LLM Agent Orchestration (MCP)

│   ├── Prompt Registry & Version Management

│   └── AI Anomaly Detection & Recommendations

│

└── 8\. Integration & Communication

    ├── Omni-Channel Notification (WhatsApp, Email, Push)

    ├── Webhook Management & Event Routing

    ├── Payment Gateway Adapters (Xendit, Stripe, Midtrans)

    └── Business Intelligence & Reporting

---

## PART 7: DOMAIN MODEL & CONTEXT MAPPING

### 7.1 Domain Classification

**Core Domains** *(Competitive Advantage — sumber diferensiasi utama)*

- **Ledger & Finance:** Double-entry accounting dengan fidelitas Swiss-Standard.  
- **Facility & Spatial:** Resolusi spasial-temporal dengan jaminan zero-conflict.  
- **Event Commerce:** Manajemen siklus hidup event end-to-end dengan ticketing terintegrasi.  
- **AI & Knowledge:** RAG pipeline berbasis pgvector dan LLM agent orchestration.

**Supporting Domains** *(Business Enablers — penting tapi tidak unik)*

- Workflow & Approvals  
- CRM (Customer & Supplier Management)  
- Inventory & Fulfillment  
- Document Management

**Generic Domains** *(Commoditized Utilities — gunakan solusi pihak ketiga bila mungkin)*

- IAM (Identity & Access Management) → Supabase Auth  
- Communication (Notifications) → Fonnte, Resend  
- Payment Integration → Xendit, Stripe, Midtrans

### 7.2 Context Mapping (Inter-Domain Relationships)

┌─────────────────────────────────────────────────────────────────────────┐

│                     CONTEXT MAP SOVEREIGN OS                            │

│                                                                         │

│  \[IAM\] ──── Open Host Service (OHS) ────► \[ALL CONTEXTS\]               │

│          "Provides user\_id as reference; semua domain                   │

│           consume tanpa menduplikasi data profil"                       │

│                                                                         │

│  \[GOVERNANCE\] ──── Upstream/Downstream ────► \[SPATIAL\] \[COMMERCE\]      │

│          "Mendefinisikan Tenant & Organization boundary"                 │

│                                                                         │

│  \[SPATIAL\] ──── Customer/Supplier ────► \[COMMERCE\]                     │

│          "Event (Customer) meminta alokasi Room dari Facility (Supplier)"│

│                                                                         │

│  \[COMMERCE\] ──── Conformist ────► \[LEDGER\]                             │

│          "Commerce wajib mematuhi skema Double-Entry Ledger;            │

│           Ledger tidak beradaptasi ke Commerce"                         │

│                                                                         │

│  \[PAYMENT GATEWAY\] ──── Anti-Corruption Layer (ACL) ────► \[LEDGER\]     │

│          "Respons mentah Xendit/Stripe dibungkus ACL sebelum            │

│           memicu JournalEntry. Struktur eksternal tidak meracuni model" │

│                                                                         │

│  \[AI\] ──── Shared Kernel ────► \[KNOWLEDGE\]                             │

│          "Berbagi definisi Embedding, Document Metadata,                │

│           dan abstraksi Vector Store"                                   │

│                                                                         │

│  \[ALL CONTEXTS\] ──── Feed Events ────► \[AI & KNOWLEDGE ENGINE\]         │

│          "Domain Events dari semua konteks mengalimentasi               │

│           Knowledge Graph dan AI Anomaly Detection"                     │

└─────────────────────────────────────────────────────────────────────────┘

---

## PART 8: ENTERPRISE RELATIONSHIP MODEL

Kardinalitas absolut dan ketergantungan lifecycle antar Aggregate. Notasi:

- `◄◇─` : Composition (lifecycle child tergantung parent; parent dihapus → child ikut)  
- `◄──` : Aggregation (child dapat eksis independen, tapi logikanya terikat)  
- `───►` : Reference / Dependency (relasi lemah, hanya ID yang disimpan)

\[Platform\] ◄◇─ \[Tenant\] ◄◇─ \[Organization\] ◄◇─ \[Department\]

                                     │

                         ┌───────────┴──────────────┐

                         ▼                          ▼

                  \[Workspace\] ◄◇─ \[Project\]     \[Facility\] ◄◇─ \[Room\]

                         │              │               │

                    \[KnowledgeBase\] \[Event\]          \[Booking\] ───► \[Payment\]

                         │         ◄◇─ │

                    \[Document\]  \[AccessPass\] ───► \[Invoice\]

                         │

                    \[Embedding\]

\[Tenant\] ◄◇─ \[Ledger\] ◄◇─ \[Account\]

                   │

             \[JournalEntry\] ◄◇─ \[JournalLine\]

                   ▲

\[Payment\] ── (Triggers) ──────────────┘

\[Project\] ◄◇─ \[WorkflowInstance\] ◄◇─ \[Task\]

                          │

                      \[Approval\] ───► \[User\]

\[Tenant\] ◄◇─ \[KnowledgeBase\] ◄◇─ \[Document\] ◄◇─ \[Embedding\]

\[Tenant\] ◄◇─ \[AIAgent\] ───► \[Prompt\]

---

## PART 9: ENTERPRISE LAWS (CANONICAL RULES)

**Ini adalah konstanta operasional platform yang tidak boleh dilanggar tanpa ADR yang diratifikasi.**

| \# | Law Name | Deskripsi & Enforcement |
| :---- | :---- | :---- |
| **L-01** | No Cross-Context Join | Kueri database **dilarang** melakukan `JOIN` lintas Bounded Context di level SQL. Penggabungan data dilakukan di lapisan aplikasi (CQRS Read Model atau BFF). *Pelanggaran: Review wajib sebelum merge.* |
| **L-02** | Immutable Financial History | Tabel Ledger, JournalEntry, JournalLine bersifat **Append-Only**. Dilarang `UPDATE` atau `DELETE`. Pembatalan menggunakan `Reversal JournalEntry` dengan referensi ke entry asal. |
| **L-03** | Soft Delete Everywhere | Penghapusan fisik (`DELETE`) **dilarang** di lingkungan produksi untuk semua entitas bisnis. Gunakan `deleted_at TIMESTAMPTZ` \+ `deleted_by UUID`. Arsip periodik ke Cold Storage. |
| **L-04** | Idempotency Mandate | Semua API mutasi (keuangan, booking, notifikasi) **wajib** menerima dan memvalidasi `X-Idempotency-Key`. Response harus identik untuk key yang sama. |
| **L-05** | No Entity Without Owner | Tidak boleh ada *orphan entity*. Setiap record wajib memiliki `tenant_id` (dan relevan: `organization_id`, `workspace_id`) yang terhubung langsung ke Aggregate Root. |
| **L-06** | AI Write Interception | Agen AI **tidak pernah** langsung menulis ke tabel finansial, kepemilikan, atau kontrak. Semua aksi material AI menghasilkan `Approval` dengan status `Pending` yang menunggu konfirmasi manusia. |
| **L-07** | Command Handler Mandate | Semua mutasi data material **wajib** melalui Command Handler atau Stored Procedure yang memvalidasi domain invariants. Mutasi langsung dari UI/API tanpa melewati validasi domain adalah pelanggaran arsitektur. |
| **L-08** | Zero-Downtime Migration | Perubahan skema database **wajib** menggunakan pola *Expand and Contract*: tambah kolom baru → migrasi data → hapus kolom lama. Tidak boleh ada rename atau drop kolom langsung di satu migration. |
| **L-09** | API Versioning | API publik **tidak boleh** mengalami Breaking Change tanpa menerbitkan versi baru (v1 → v2) dan memberikan sunset notice minimal 3 bulan kepada konsumen yang terdaftar. |
| **L-10** | Secrets Never at Rest in App DB | Kunci API eksternal, secret OAuth, dan kredensial PSP **tidak boleh** disimpan di tabel database Sovereign. Wajib menggunakan Vault (dienkripsi AES-256) dengan rotasi otomatis. |

---

## PART 10: AGGREGATE DESIGN

Aggregate adalah batas konsistensi transaksional. Mutasi **hanya** terjadi melalui Aggregate Root. Tidak ada entitas di dalam aggregate yang dapat diakses atau dimodifikasi dari luar tanpa melewati Root.

### 10.1 Tenant Aggregate

- **Root:** `Tenant`  
- **Anak:** `Organization`, `Settings`, `BillingProfile`  
- **Invariant:** Slug Tenant harus unik secara global. Tenant yang `Frozen` tidak dapat membuat entitas baru.

### 10.2 Facility Aggregate

- **Root:** `Facility`  
- **Anak:** `Room`, `OperationalSchedule`, `PricingRule`  
- **Invariant:** `Booking` tidak boleh tumpang tindih waktu pada `Room` yang sama (penegakan via PostgreSQL GIST Constraint pada kolom `TimeRange`).

### 10.3 Event Aggregate

- **Root:** `Event`  
- **Anak:** `TicketType`, `AccessPass`, `EventScheduleSlot`  
- **Invariant:** Jumlah `AccessPass` yang `Issued` tidak boleh melebihi kapasitas `TicketType`. Event yang `Finished` tidak dapat menerbitkan `AccessPass` baru.

### 10.4 Ledger Aggregate *(Kritikal — Transaksi Terkunci)*

- **Root:** `Ledger`  
- **Anak:** `Account`, `JournalEntry`, `JournalLine`  
- **Invariant:** ∑ Debit semua `JournalLine` dalam satu `JournalEntry` wajib sama persis dengan ∑ Kredit. Perbedaan satu satuan terkecil (cent) harus menolak seluruh transaksi.  
- **Locking Strategy:** Operasi posting `JournalEntry` menggunakan `SELECT FOR UPDATE` pada baris `Ledger` terkait untuk mencegah race condition.

### 10.5 Invoice Aggregate

- **Root:** `Invoice`  
- **Anak:** `InvoiceLineItem`, `TaxLine`, `Discount`  
- **Invariant:** `Invoice.totalAmount` harus sama dengan ∑ `InvoiceLineItem.subtotal` \+ ∑ `TaxLine.amount` \- ∑ `Discount.amount`. Presisi numerik menggunakan `NUMERIC(19,4)`.

### 10.6 Workflow Aggregate

- **Root:** `Workflow` (template) / `WorkflowInstance` (eksekusi)  
- **Anak:** `Task`, `Approval`, `StateTransitionLog`  
- **Invariant:** Transisi status tidak boleh melawan topologi State Machine yang telah dipublikasikan. `Workflow` yang `Deprecated` tidak dapat diinstansiasi baru.

---

## PART 11: VALUE OBJECTS

Struktur data immutable yang dinilai dari propertinya, bukan dari identitas uniknya. Dua Value Object dengan properti identik dianggap sama.

### 11.1 Financial

| Value Object | Komposisi | Aturan |
| :---- | :---- | :---- |
| `Money` | `amount: NUMERIC(19,4)`, `currency: ISO 4217` | Operasi aritmatika antar `Money` berbeda currency dilarang tanpa konversi eksplisit. |
| `Percentage` | `value: NUMERIC(5,4)`, `basis: enum(FLAT, COMPOUND)` | Nilai antara 0.0000 dan 1.0000. |
| `TaxRate` | `code: string`, `percentage: Percentage`, `jurisdiction: string` |  |
| `LedgerBalance` | `debit: Money`, `credit: Money`, `net: Money` | Net \= Debit \- Credit (untuk akun Normal Debit). |

### 11.2 Spatial & Temporal

| Value Object | Komposisi | Aturan |
| :---- | :---- | :---- |
| `TimeRange` | `start: TIMESTAMPTZ`, `end: TIMESTAMPTZ` | `end` wajib lebih besar dari `start`. Digunakan dengan PostgreSQL GIST untuk deteksi tumpang tindih. |
| `GeoCoordinate` | `latitude: FLOAT8`, `longitude: FLOAT8` | Validasi rentang: lat \[-90, 90\], lng \[-180, 180\]. |
| `Address` | `street`, `city`, `state`, `postalCode`, `countryCode: ISO 3166-1 alpha-2` |  |
| `CoordinatePolygon` | `points: GeoCoordinate[]` | Minimum 3 titik. Digunakan untuk batas Facility. |

### 11.3 Identity & Network

| Value Object | Komposisi |
| :---- | :---- |
| `IdentityReference` | `id: UUID`, `type: enum(USER, AI_AGENT, SYSTEM)` |
| `Email` | `address: string` (tervalidasi RFC 5321\) |
| `Phone` | `number: string` (format E.164), `countryCode: string` |
| `IPAddress` | `value: string` (IPv4 atau IPv6) |

### 11.4 Integrity & Cryptography

| Value Object | Komposisi |
| :---- | :---- |
| `AuditStamp` | `actorId: IdentityReference`, `timestamp: TIMESTAMPTZ`, `ipAddress: IPAddress`, `traceId: UUID` |
| `SecureQRCode` | `payload: EncryptedPayload`, `checksum: Hash`, `expiresAt: TIMESTAMPTZ` |
| `Hash` | `algorithm: enum(SHA256, SHA512)`, `value: string` |

---

## PART 12: STATE MACHINES (LIFECYCLES)

Seluruh transisi status bersifat **deterministik dan diaudit**. Tidak ada transisi yang terjadi tanpa pemicu domain event.

### 12.1 Booking

\[Pending\] ──► \[UnderReview\] ──► \[Approved\] ──► \[Active\] ──► \[Completed\]

    │               │               │

    └──► \[Rejected\] └──► \[Rejected\] └──► \[Canceled\]

*Triggers: `BookingSubmitted`, `BookingApproved`, `BookingRejected`, `BookingActivated`, `BookingCompleted`, `BookingCanceled`*

### 12.2 Payment

\[Initiated\] ──► \[Processing\] ──► \[Captured\] ──► \[Settled\] ──► \[Reconciled\]

                     │               │

                 \[Failed\]        \[Refunded\] ──► \[RefundSettled\]

*Triggers: `PaymentInitiated`, `PaymentCaptured`, `PaymentFailed`, `PaymentSettled`, `RefundInitiated`*

### 12.3 AccessPass

\[Pending\] ──► \[Issued\] ──► \[CheckedIn\] ──► \[Consumed\]

    │              └──► \[Revoked\]

    └──► \[Expired\]

*Triggers: `AccessPassIssued`, `AccessPassScanned`, `AccessPassRevoked`, `AccessPassExpired`*

### 12.4 Invoice

\[Draft\] ──► \[Issued\] ──► \[PartiallyPaid\] ──► \[Paid\] ──► \[Settled\]

    │                                                        │

    └──► \[Voided\]                                       \[Voided\]\*

*\*Void setelah Settled memerlukan Reversal JournalEntry*

### 12.5 WorkflowInstance

\[Running\] ──► \[PendingApproval\] ──► \[Running\] ──► \[Completed\]

    │                │

    └──► \[Suspended\] └──► \[Aborted\]

### 12.6 JournalEntry

\[Draft\] ──► \[Posted\]

                └──► \[Voided\] (menghasilkan Reversal JournalEntry baru)

*JournalEntry yang `Posted` tidak pernah dihapus. Pembatalan menghasilkan entry baru dengan debit/kredit terbalik.*

---

## PART 13: DOMAIN EVENT CATALOG

Domain Events adalah **fakta bisnis yang telah terjadi**, bersifat immutable, dan menjadi backbone komunikasi asinkron lintas domain. Format: `PascalCase`, past tense.

### 13.1 Identity & Governance

| Event | Payload Kunci | Konsumen |
| :---- | :---- | :---- |
| `TenantProvisioned` | `tenantId`, `slug`, `plan` | Ledger, KnowledgeBase (init) |
| `TenantFrozen` | `tenantId`, `reason` | All Contexts |
| `UserRegistered` | `userId`, `tenantId`, `email` | CRM, Notification |
| `MembershipGranted` | `userId`, `tenantId`, `role` | IAM |
| `RoleAssigned` | `userId`, `role`, `scope` | IAM, Audit |

### 13.2 Spatial & Booking

| Event | Payload Kunci | Konsumen |
| :---- | :---- | :---- |
| `FacilityRegistered` | `facilityId`, `organizationId` | Spatial, AI |
| `BookingSubmitted` | `bookingId`, `facilityId`, `timeRange` | Workflow |
| `BookingApproved` | `bookingId`, `approvedBy` | Commerce, Notification, Ledger |
| `BookingRejected` | `bookingId`, `reason` | Notification |
| `BookingConflictDetected` | `bookingId`, `conflictingBookingId` | Workflow, Notification |

### 13.3 Commerce & Access

| Event | Payload Kunci | Konsumen |
| :---- | :---- | :---- |
| `EventPublished` | `eventId`, `projectId` | Notification, Commerce |
| `AccessPassIssued` | `passId`, `eventId`, `customerId` | Commerce, Notification |
| `AccessPassScanned` | `passId`, `scannedAt`, `facilityId` | Commerce, Analytics |
| `AccessPassRevoked` | `passId`, `reason` | Notification |
| `ProductStockDepleted` | `productId`, `inventoryLotId` | Notification, Commerce |

### 13.4 Finance & Ledger

| Event | Payload Kunci | Konsumen |
| :---- | :---- | :---- |
| `InvoiceIssued` | `invoiceId`, `customerId`, `amount` | Notification, Ledger |
| `PaymentInitiated` | `paymentId`, `invoiceId`, `gateway` | Payment, Ledger |
| `PaymentCaptured` | `paymentId`, `gatewayRef`, `amount` | Ledger |
| `PaymentSettled` | `paymentId`, `settledAt` | Ledger, Notification |
| `PaymentFailed` | `paymentId`, `reason` | Notification, Workflow |
| `JournalPosted` | `journalEntryId`, `ledgerId`, `totalDebit` | Audit, Reporting |
| `EscrowReleased` | `escrowId`, `releasedTo`, `amount` | Ledger, Notification |
| `RefundInitiated` | `paymentId`, `refundAmount`, `reason` | Ledger, Notification |

### 13.5 Workflow & AI

| Event | Payload Kunci | Konsumen |
| :---- | :---- | :---- |
| `WorkflowStarted` | `instanceId`, `workflowId`, `entityId` | Workflow |
| `ApprovalRequested` | `approvalId`, `assignedTo`, `context` | Notification, Workflow |
| `ApprovalResolved` | `approvalId`, `resolution`, `resolvedBy` | Workflow |
| `KnowledgeIndexed` | `documentId`, `knowledgeBaseId` | AI |
| `EmbeddingGenerated` | `embeddingId`, `documentId`, `model` | AI |
| `AIRecommendationGenerated` | `agentId`, `recommendation`, `confidence` | Workflow (Pending Approval) |
| `NotificationDelivered` | `notificationId`, `channel`, `recipient` | Audit |

---

## PART 14: CQRS & READ MODEL STRATEGY

Sovereign OS menerapkan CQRS (Command Query Responsibility Segregation) untuk memisahkan jalur tulis dari jalur baca.

### 14.1 Prinsip CQRS

- **Command Side (Write):** Semua mutasi melalui Command Handlers yang memvalidasi invariant domain dan menerbitkan Domain Events. Menulis ke normalized PostgreSQL tables.  
- **Query Side (Read):** Semua query yang kompleks (multi-join, agregasi, laporan) menggunakan Read Models yang didenormalisasi dan diperbarui secara asinkron oleh event handlers.

### 14.2 Read Model Registry

| Read Model | Sumber Events | Kegunaan | Refresh Strategy |
| :---- | :---- | :---- | :---- |
| `BookingCalendarView` | `BookingApproved`, `BookingCanceled` | Tampilan kalender ketersediaan Facility | Event-driven (real-time) |
| `LedgerSummaryView` | `JournalPosted`, `EscrowReleased` | Dashboard saldo CoA per Tenant | Event-driven |
| `CustomerInvoiceHistoryView` | `InvoiceIssued`, `PaymentSettled` | Riwayat tagihan Customer | Event-driven |
| `EventSalesView` | `AccessPassIssued`, `PaymentCaptured` | Statistik penjualan Event | Event-driven \+ nightly recompute |
| `WorkflowStatusView` | `WorkflowStarted`, `ApprovalResolved` | Status task dan approval aktif | Event-driven |
| `TenantAnalyticsView` | Multiple | BI dashboard ringkasan Tenant | Scheduled (nightly batch) |

### 14.3 BFF (Backend for Frontend) Pattern

Setiap antarmuka klien memiliki BFF yang:

1. Menggabungkan data dari beberapa Read Model atau domain tanpa JOIN di database.  
2. Memformat respons sesuai kebutuhan spesifik UI (mobile vs web vs API partner).  
3. Menerapkan otorisasi kontekstual (ABAC) sebelum mengirim data ke klien.

---

## PART 15: SECURITY & ZERO TRUST REFERENCE MODEL

### 15.1 Authentication Stack

- **Protocol:** OIDC (OpenID Connect) di atas OAuth 2.0  
- **Provider:** Supabase Auth (JWT RS256)  
- **MFA:** TOTP (Time-based OTP) wajib untuk aksi finansial dan admin  
- **Session:** Access Token (15 menit) \+ Refresh Token (30 hari, rotasi per penggunaan)

### 15.2 Authorization Model (Defense in Depth)

Lapisan 1: API Gateway

└── Validasi JWT signature & expiry

    └── Rate limiting per tenant\_id

Lapisan 2: Application Middleware

└── RBAC: Periksa role User dalam konteks Tenant

    └── ABAC: Periksa kepemilikan objek (misal: hanya creator Draft yang bisa edit)

Lapisan 3: Database (Row-Level Security)

└── Setiap tabel memiliki RLS policy:

    "tenant\_id \= auth.jwt() \-\>\> 'tenant\_id'"

    └── Semua kueri secara otomatis di-filter oleh tenant\_id

        (bahkan jika lapisan aplikasi gagal)

### 15.3 Role Taxonomy

| Role | Scope | Deskripsi |
| :---- | :---- | :---- |
| `platform:superadmin` | Platform | Akses penuh ke semua Tenant. Hanya untuk internal Sovereign OS. |
| `tenant:owner` | Tenant | Kontrol penuh atas Tenant, termasuk billing dan user management. |
| `tenant:admin` | Tenant | Kelola Organization, User, dan konfigurasi dalam Tenant. |
| `org:manager` | Organization | Kelola Workspace, Facility, dan resource di Organization. |
| `workspace:member` | Workspace | Akses ke Project dan resource dalam Workspace yang ditugaskan. |
| `finance:auditor` | Tenant | Akses READ-ONLY ke semua data finansial (Ledger, Invoice, Payment). |
| `ai:agent` | Tenant | Akses READ ke Knowledge Base; aksi WRITE selalu masuk Pending Approval. |

### 15.4 Secret & Key Management

- Kunci API eksternal (Xendit, Stripe, OpenAI) disimpan di Vault terenkripsi AES-256.  
- Rotasi otomatis kunci dilakukan setiap 90 hari atau segera setelah indikasi kebocoran.  
- Tidak ada secret yang di-log, bahkan dalam mode debug. Penggunaan `[REDACTED]` dalam structured logs untuk field sensitif.

### 15.5 Audit Trail

Semua aksi `INSERT`, `UPDATE` (soft delete), dan transisi status diinterepsi oleh **database trigger** dan dicatat ke tabel `audit_logs` dengan struktur:

audit\_logs

├── id: UUID

├── tenant\_id: UUID

├── actor\_id: UUID (dari JWT)

├── actor\_type: enum(USER, AI\_AGENT, SYSTEM)

├── action: string (format: "ENTITY.ACTION", misal: "BOOKING.APPROVED")

├── entity\_type: string

├── entity\_id: UUID

├── old\_state: JSONB (nullable)

├── new\_state: JSONB

├── trace\_id: UUID

├── ip\_address: INET

└── created\_at: TIMESTAMPTZ

---

## PART 16: AI REFERENCE ARCHITECTURE

### 16.1 Pipeline Ingesti Pengetahuan (Knowledge Ingestion)

\[Document Upload\]

     │

     ▼

\[Text Extraction\] (PDF, DOCX, MD)

     │

     ▼

\[Chunking\] (ukuran: 512 token, overlap: 64 token)

     │

     ▼

\[Embedding Model\] (via OpenRouter → openai/text-embedding-3-small

                   atau OpenAI Direct → text-embedding-3-large untuk batch)

     │

     ▼

\[pgvector Store\] (PostgreSQL — terisolasi per tenant\_id)

     │

     ▼

\[KnowledgeIndexed Event diterbitkan\]

### 16.2 RAG (Retrieval-Augmented Generation) Pipeline

\[User Query\]

     │

     ▼

\[Query Embedding\] (Ubah query ke vektor)

     │

     ▼

\[Vector Similarity Search\] (pgvector cosine similarity, top-K \= 5\)

     │ Filter: tenant\_id \= current\_tenant

     ▼

\[Context Assembly\] (Gabungkan chunks relevan \+ metadata)

     │

     ▼

\[Prompt Construction\] (System Prompt \+ Context \+ User Query)

     │ (dari Prompt Registry — versioned)

     ▼

\[LLM Inference\] (via OpenRouter — model dipilih berdasarkan Routing Decision Matrix)

     │

     ▼

\[AI Guardrails\] (PII filter, hallucination scorer, output validator)

     │

     ▼

\[Response\] → jika aksi WRITE: \[Approval.Pending\] → \[Human Review\]

### 16.3 Model Context Protocol (MCP)

Seluruh interaksi AI dengan sistem Sovereign menggunakan MCP. Tools yang diekspos ke AI Agent:

| Tool Name | Jenis Akses | Deskripsi |
| :---- | :---- | :---- |
| `search_knowledge_base` | READ | Semantic search dalam KnowledgeBase Tenant |
| `get_booking_status` | READ | Ambil status Booking berdasarkan ID |
| `get_invoice_summary` | READ | Ambil ringkasan Invoice Customer |
| `get_workflow_status` | READ | Ambil status WorkflowInstance |
| `create_approval_request` | WRITE → PENDING | Buat Approval baru yang memerlukan konfirmasi manusia |
| `draft_journal_entry` | WRITE → PENDING | Draftkan JournalEntry untuk direview Finance |

### 16.4 Prompt Registry

Setiap Prompt memiliki:

- `version`: Semantic version (misal: `1.2.0`)  
- `model_target`: Model LLM yang dituju  
- `input_schema`: Variabel yang dapat diinjeksi  
- `output_format`: JSON Schema respons yang diharapkan  
- `guardrails`: Daftar filter yang aktif

### 16.5 AI Safety Hierarchy

Level 0: Tidak boleh (NEVER)

  └── Mutasi finansial langsung

  └── Perubahan kepemilikan entitas

  └── Penghapusan data permanen

  └── Pengiriman komunikasi massal tanpa review

Level 1: Butuh Approval (PENDING)

  └── Draft JournalEntry / Invoice

  └── Rekomendasi tindakan Workflow

  └── Pembuatan Booking baru

  └── Penonaktifan User

Level 2: Dapat langsung (ALLOWED READ)

  └── Pencarian Knowledge Base

  └── Pembacaan status entitas

  └── Generasi laporan analitik

  └── Indexing dokumen baru

---

## PART 17: INTEGRATION LANDSCAPE & ANTI-CORRUPTION LAYERS

### 17.1 Payment Service Providers (PSP)

| PSP | Wilayah Primer | Adapter Name | Transaksi Maks |
| :---- | :---- | :---- | :---- |
| Xendit | Indonesia, PH, VN, MY | `XenditPaymentAdapter` | IDR, PHP, VND, MYR |
| Stripe | Global | `StripePaymentAdapter` | USD, EUR, \+ 135 mata uang |
| Midtrans | Indonesia | `MidtransPaymentAdapter` | IDR |

**ACL Contract:** Semua adapter mengimplementasikan interface `IPaymentAdapter`:

interface IPaymentAdapter {

  initiateCharge(command: InitiateChargeCommand): Promise\<ChargeReference\>

  capturePayment(ref: ChargeReference): Promise\<PaymentCapturedResult\>

  initiateRefund(command: InitiateRefundCommand): Promise\<RefundReference\>

  handleWebhook(rawPayload: unknown, signature: string): Promise\<DomainEvent\>

}

`handleWebhook` adalah titik masuk ACL: ia menerima payload mentah PSP dan mengubahnya menjadi Domain Event internal (`PaymentCaptured`, `PaymentFailed`, dst.) sebelum dipublikasikan.

### 17.2 Communication Gateways

| Channel | Provider | Gateway Name |
| :---- | :---- | :---- |
| WhatsApp Business | Fonnte | `FonnteWhatsAppGateway` |
| Email Transaksional | Resend / SendGrid | `TransactionalEmailGateway` |
| Push Notification | FCM / APNs | `PushNotificationGateway` |

### 17.3 AI Providers

Sovereign OS mengadopsi **dua jalur akses model** yang saling melengkapi:

- **OpenRouter (Jalur Primer — Unified Gateway):** Satu API key untuk mengakses ratusan model dari berbagai provider. Digunakan sebagai routing layer utama untuk fleksibilitas, fallback otomatis, dan pengendalian biaya.  
- **Direct Provider (Jalur Sekunder — Dedicated):** Koneksi langsung ke provider tertentu untuk kebutuhan SLA ketat, model eksklusif, atau fitur yang belum tersedia di OpenRouter (misal: fine-tuned model, Batch API OpenAI).

#### 17.3.1 AI Routing Layer (OpenRouter)

| Adapter | Endpoint | Kegunaan |
| :---- | :---- | :---- |
| `OpenRouterAIAdapter` | `https://openrouter.ai/api/v1` | **Default gateway** untuk semua inferensi LLM di production |

**Model yang diakses via OpenRouter:**

| Model | Provider Asal | Kegunaan dalam Sovereign OS |
| :---- | :---- | :---- |
| `anthropic/claude-sonnet-4-5` | Anthropic | Tugas reasoning kompleks, analitik domain bisnis |
| `google/gemini-2.0-flash-001` | Google | Inferensi cepat berbiaya rendah, notifikasi cerdas |
| `deepseek/deepseek-chat-v3-0324` | DeepSeek | Alternatif biaya rendah untuk analitik & summarisasi |
| `meta-llama/llama-3.3-70b-instruct` | Meta (via Groq) | Volume tinggi, latency rendah |
| `openai/gpt-4o` | OpenAI | Fallback untuk tugas multimodal (vision, structured output) |

**Keunggulan OpenRouter sebagai unified gateway:**

- **Model Fallback Otomatis:** Jika provider primer down, OpenRouter secara otomatis merutekan ke model alternatif yang ekuivalen tanpa perubahan kode.  
- **Cost Routing:** Konfigurasi batas harga per-request (`max_price`) untuk menghindari model mahal pada tugas sederhana.  
- **Single API Contract:** Seluruh AI Engine cukup mengimplementasikan satu interface; perpindahan atau penambahan model tidak mengubah kode bisnis.  
- **Usage Analytics:** Dashboard terpusat untuk memantau token usage per model per Tenant.

**ACL Contract — `IAIModelAdapter`:**

interface IAIModelAdapter {

  // Inferensi teks (chat completion)

  complete(request: AICompletionRequest): Promise\<AICompletionResult\>

  // Generasi embedding untuk Vector Store

  embed(request: AIEmbedRequest): Promise\<AIEmbedResult\>

  // Stream inferensi untuk UX real-time

  stream(request: AICompletionRequest): AsyncIterable\<AIStreamChunk\>

}

interface AICompletionRequest {

  model: string           // misal: "anthropic/claude-sonnet-4-5"

  messages: ChatMessage\[\]

  tools?: MCPToolDefinition\[\]

  maxTokens?: number

  traceId: string         // wajib — untuk observabilitas

  tenantId: string        // wajib — untuk usage tracking & cost allocation

}

#### 17.3.2 Direct Provider (Dedicated — Jalur Sekunder)

| Provider | Adapter | Kegunaan Eksklusif |
| :---- | :---- | :---- |
| OpenAI | `OpenAIDirectAdapter` | Batch Embedding API (volume besar, biaya 50% lebih rendah), Fine-tuned models |
| Groq | `GroqDirectAdapter` | Latensi sub-100ms untuk use case real-time (misal: live event scanning) |

#### 17.3.3 Routing Decision Matrix

| Skenario | Jalur | Model Default |
| :---- | :---- | :---- |
| Reasoning & analitik bisnis | OpenRouter | `anthropic/claude-sonnet-4-5` |
| Generasi teks bervolume tinggi | OpenRouter | `deepseek/deepseek-chat-v3-0324` |
| Embedding dokumen (batch) | OpenAI Direct | `text-embedding-3-large` |
| Embedding query real-time | OpenRouter | `openai/text-embedding-3-small` |
| Live event / response \< 200ms | Groq Direct | `llama-3.3-70b-8192` |
| Fallback jika semua provider down | OpenRouter | Auto-select lowest latency available |

*Konfigurasi routing disimpan di **Prompt Registry** dan dapat diubah per Tenant tanpa deployment ulang.*

### 17.4 Storage & Infrastructure

| Servis | Provider | Kegunaan |
| :---- | :---- | :---- |
| Relational DB | Supabase (PostgreSQL 16+) | Semua data transaksional |
| Vector Store | pgvector (extension) | Embeddings dalam PostgreSQL |
| Object Storage | Supabase S3 / Cloudflare R2 | File, dokumen, media |
| CDN | Cloudflare | Asset statis, edge caching |
| Maps & Geo | Google Maps Platform | Validasi alamat, tampilan Facility |
| Secret Vault | Doppler / HashiCorp Vault | Manajemen kunci API |
| AI Gateway | OpenRouter | Unified LLM routing, fallback, & cost control |

---

## PART 18: OBSERVABILITY & SLA MODEL

### 18.1 Tiga Pilar Observabilitas

**Logs** (Structured JSON)

- Setiap Server Action dan Command Handler memancarkan log terstruktur.  
- Format wajib: `{ timestamp, level, traceId, tenantId, actorId, action, durationMs, metadata }`  
- Field PII (email, nama) di-mask otomatis oleh log sink.

**Metrics**

- RPS (Requests Per Second) per endpoint  
- P50/P95/P99 Latency per endpoint  
- Error Rate (5xx) per domain  
- Queue depth untuk background jobs  
- AI Token usage per Tenant

**Traces** (Distributed Tracing)

- Semua request diberi `Trace-ID` (W3C Trace Context) dari edge hingga ke kueri SQL.  
- Setiap Domain Event yang diterbitkan menyertakan `Trace-ID` asal untuk reconstructibility.

### 18.2 SLA Targets

| Metrik | Target | Pengukuran |
| :---- | :---- | :---- |
| API Availability | ≥ 99.9% | Per bulan kalender |
| API Latency (P95, bukan DB hit) | \< 100ms | Per endpoint |
| Mutation Response (P95) | \< 500ms | Inklusif DB write |
| Background Queue Processing | \< 30 detik | Dari event publish ke handler |
| RTO (Recovery Time Objective) | \< 15 menit | Incident Severity 1 |
| RPO (Recovery Point Objective) | \< 5 menit | Data loss window |
| Incident Reconstructibility | \< 5 menit | Waktu untuk trace dari Log/Metrics/Trace |

### 18.3 Alerting Thresholds

- Error Rate \> 1% selama 5 menit → PagerDuty alert ke On-Call Engineer.  
- P99 Latency \> 2 detik selama 3 menit → Auto-scale trigger \+ alert.  
- Payment failure rate \> 5% selama 10 menit → Immediate escalation ke Lead \+ payment team.  
- AI hallucination score \> 15% dalam satu jam → AI Agent di-suspend otomatis, human review diminta.

---

## PART 19: DATA GOVERNANCE & COMPLIANCE

### 19.1 Data Classification Matrix

| Kelas | Contoh Data | Storage Rule | Access Rule |
| :---- | :---- | :---- | :---- |
| `PII-Sensitive` | NIK, Nomor Paspor, Biometrik | Wajib dienkripsi kolom (AES-256) | Perlu justifikasi bisnis eksplisit per akses |
| `PII-Standard` | Nama, Email, Nomor HP | Enkripsi at-rest (Supabase default) | Akses via Role `data:pii_reader` |
| `Financial` | Nomor rekening, nominal transaksi | Immutable \+ Vault untuk secrets | Akses via Role `finance:auditor` minimum |
| `Operational` | Status Booking, Event data | Standard PostgreSQL RLS | Akses via Membership yang valid |
| `AI/ML` | Embeddings, Model outputs | Terisolasi per tenant\_id di pgvector | Akses via AI Agent dengan scope terdefinisi |
| `Public` | Nama Event, harga tiket publik | Standard PostgreSQL | Read-only publik diizinkan |

### 19.2 Data Retention Policy

| Entitas | Periode Aktif | Arsip ke Cold Storage | Penghapusan Permanen |
| :---- | :---- | :---- | :---- |
| `JournalEntry`, `Payment` | Selamanya (Immutable) | Setelah 7 tahun | Tidak pernah |
| `AccessPass`, `Booking` | 2 tahun setelah Completed | Tahun 2-5 | Tahun ke-5+ (jika diizinkan hukum) |
| `AuditLog` | 1 tahun hot | 1-5 tahun cold | Setelah 5 tahun |
| `Embedding` | Selama Document aktif | Bersama Document | Saat Document dihapus permanen |
| `Notification` | 90 hari | Tidak diarsip | Setelah 90 hari |

### 19.3 Legal Hold

Fitur penguncian data Tenant yang mencegah penghapusan atau arsip jika:

- Terdapat sengketa hukum aktif yang ditandai oleh `tenant:owner`.  
- Sedang dalam proses audit eksternal yang diminta regulator.  
- Pelanggaran terdeteksi dan dalam investigasi internal.

Legal Hold memblokir semua proses data retention otomatis hingga dikonfirmasi dicabut oleh `platform:superadmin`.

### 19.4 GDPR & Regulasi Privasi Global

- **Right to Access:** API `GET /api/v1/me/data-export` menghasilkan export JSON seluruh data User.  
- **Right to Erasure:** Pseudonymisasi data PII (bukan penghapusan) untuk mematuhi integritas Immutable Ledger. Nama dan kontak diganti placeholder; transaksi finansial tetap utuh.  
- **Data Portability:** Export dalam format JSON-LD atau CSV standar.

---

## PART 20: DEPLOYMENT REFERENCE ARCHITECTURE

### 20.1 Topology Stack

┌─────────────────────────────────────────────────────────────────────┐

│                         CLIENT LAYER                                │

│   Progressive Web App (Next.js 15 App Router)                       │

│   IndexedDB (Offline Buffer) · Service Worker (Background Sync)     │

│   Edge Cache (Cloudflare CDN)                                       │

└──────────────────────────┬──────────────────────────────────────────┘

                           │

┌──────────────────────────▼──────────────────────────────────────────┐

│                       APPLICATION LAYER                              │

│   Next.js Server (Node.js 22+ / Edge Runtime)                       │

│   Server Actions · API Routes · React Server Components             │

│   BFF Adapters · Domain Command Handlers · Event Publishers         │

└──────────────────────────┬──────────────────────────────────────────┘

                           │

┌──────────────────────────▼──────────────────────────────────────────┐

│                    QUEUE & BACKGROUND LAYER                          │

│   Webhook Processors · Email/WA Dispatch · AI Embedding Jobs        │

│   Redis Queue (BullMQ) / In-DB Queue (pg-boss)                      │

└──────────────────────────┬──────────────────────────────────────────┘

                           │

┌──────────────────────────▼──────────────────────────────────────────┐

│                  DATABASE & STORAGE LAYER                            │

│   Supabase PostgreSQL 16+ (Primary \+ Read Replicas)                 │

│   pgvector (Embeddings) · pgBouncer (Connection Pooling)            │

│   Supabase S3 / Cloudflare R2 (Object Storage)                      │

└─────────────────────────────────────────────────────────────────────┘

### 20.2 Environment Strategy

| Environment | Tujuan | Data Policy |
| :---- | :---- | :---- |
| `production` | Live traffic | Data nyata; akses terbatas tim inti |
| `staging` | Pre-release validation | Data anonim (snapshot produksi dianonimkan) |
| `preview` | Per-PR deployment (Vercel) | Data sintetis; terisolasi |
| `development` | Pengembangan lokal | Data lokal; Supabase lokal via Docker |

### 20.3 CI/CD Pipeline

\[Git Push\] → \[Lint \+ Type Check\] → \[Unit Tests\] → \[Integration Tests\]

    → \[Build\] → \[Preview Deploy\] → \[E2E Tests on Preview\]

        → \[Manual Approval (untuk main)\] → \[Production Deploy\]

            → \[Smoke Tests\] → \[Observability Dashboard Check\]

---

## PART 21: ENGINEERING GOVERNANCE

### 21.1 Versioning

- **Semantic Versioning (SemVer):** `MAJOR.MINOR.PATCH` untuk semua API publik dan library domain.  
- **Breaking Change:** Hanya boleh di MAJOR version. Wajib sunset notice minimum 3 bulan.  
- **Database Schema:** Versi via migrasi berurutan (Flyway/Supabase migrations). Nomor migrasi sequential dan immutable.

### 21.2 Feature Flags

- Rilis fitur dipisahkan dari rilis kode (Dark Launching).  
- Flag dikelola di level `Tenant` (untuk rollout bertahap) atau `User` (untuk beta tester).  
- Flag lama (lebih dari 90 hari setelah full rollout) wajib dihapus dari codebase.

### 21.3 Testing Pyramid

| Level | Fokus | Tools | Target Coverage |
| :---- | :---- | :---- | :---- |
| Unit Tests | Core Domain Logic, Value Objects, Invariants | Vitest / Jest | \> 90% domain logic |
| Integration Tests | Adapter (DB, API External), RLS Policies | Supabase local \+ Testcontainers | Semua adapters & RLS |
| E2E Tests | Critical user journeys (Payment, Booking, AccessPass) | Playwright | Top 20 critical flows |
| Contract Tests | API contracts antar tim/layanan | Pact | Semua public API |

### 21.4 Code Ownership

| Domain | Modul | Code Owner |
| :---- | :---- | :---- |
| Finance / Ledger | `core/domains/ledger` | Lead Architect \+ Finance Engineer |
| IAM | `core/domains/identity` | Security Lead |
| AI / Knowledge | `core/domains/ai` | AI Lead |
| Semua domain | Breaking change pada `core/` | Lead Architect review wajib |

### 21.5 Pull Request Standards

- Setiap PR harus merujuk pada ADR atau Issue yang terdefinisi.  
- Tidak ada PR yang mengubah `core/domains/` tanpa unit test untuk setiap kasus yang dimodifikasi.  
- PR yang memperkenalkan raw SQL cross-context join akan otomatis ditolak oleh linter.

---

## PART 22: ARCHITECTURE DECISION RECORDS (ADR) MANIFEST

Setiap ADR adalah keputusan desain yang signifikan dan dokumentasinya bersifat immutable (append-only: hanya bisa di-*supersede* dengan ADR baru).

| ADR \# | Judul | Status | Deskripsi Singkat |
| :---- | :---- | :---- | :---- |
| ADR-001 | Domain-Driven Design for Bounded Contexts | ACCEPTED | Penetapan Core/Supporting/Generic domain dan Context Mapping |
| ADR-002 | Hexagonal Architecture (Ports & Adapters) | ACCEPTED | Isolasi logika bisnis dari infrastruktur |
| ADR-003 | PostgreSQL Row-Level Security for Multi-Tenant | ACCEPTED | RLS sebagai lapisan keamanan terakhir di database |
| ADR-004 | Double-Entry Ledger with Append-Only Invariant | ACCEPTED | Immutability finansial dengan Reversal Journal pattern |
| ADR-005 | Event-Driven Async Communication via Pub/Sub | ACCEPTED | Domain Events sebagai backbone komunikasi lintas domain |
| ADR-006 | Offline-First PWA with IndexedDB Mutation Buffer | ACCEPTED | Command buffering \+ Background Sync untuk offline resilience |
| ADR-007 | AI Integration via Model Context Protocol (MCP) | ACCEPTED | Tool Registry untuk membatasi aksi AI yang diizinkan |
| ADR-008 | Next.js Server Actions for Mutation Layer | ACCEPTED | Server Actions sebagai Command entry point, bukan REST endpoint |
| ADR-009 | CQRS with Denormalized Read Models | ACCEPTED | Pemisahan write model (normalized) dari read model (denormalized) |
| ADR-010 | pgvector for Tenant-Isolated Embeddings | ACCEPTED | Penyimpanan vektor dalam PostgreSQL dengan RLS per tenant |
| ADR-011 | Idempotency Key Mandate for Financial APIs | ACCEPTED | Pencegahan duplicate charge via X-Idempotency-Key |
| ADR-012 | Soft Delete \+ Periodic Archive (No Hard Delete) | ACCEPTED | `deleted_at` \+ Cold Storage archival, tidak ada DELETE produksi |
| ADR-013 | BFF (Backend for Frontend) per Client Type | ACCEPTED | BFF menggabungkan data tanpa cross-context DB join |
| ADR-014 | Anti-Corruption Layer for All External PSP | ACCEPTED | Payment adapter membungkus respons PSP mentah |
| ADR-015 | Semantic Versioning \+ 3-Month Sunset Policy | PROPOSED | API versioning dan kebijakan deprecation |
| ADR-016 | OpenRouter as Unified AI Gateway | ACCEPTED | OpenRouter sebagai default routing layer untuk semua LLM inference; Direct Provider hanya untuk kebutuhan eksklusif (Batch API, sub-100ms SLA) |

---

## PART 23: DOCUMENT DEPENDENCY GRAPH

Dokumen ini menduduki posisi puncak dalam hierarki dokumentasi Sovereign OS. Seluruh dokumen turunan wajib konsisten dengan dokumen ini.

┌─────────────────────────────────────────────────────────────┐

│         (1) SOVEREIGN OS CONSTITUTION v5.0  ◄── DOKUMEN INI │

│                    (Platform SSOT)                           │

└──────────────────────────┬──────────────────────────────────┘

                           │

         ┌─────────────────┼──────────────────┐

         ▼                 ▼                  ▼

  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐

  │ (2) ADR     │  │ (3) Capability│ │ (4) Canonical ERD & │

  │ Collection  │  │ & Domain     │ │ Database Schema Spec │

  └─────────────┘  │ Models       │ │ (Tables, RLS, Index) │

                   └─────────────┘  └─────────────────────┘

                           │

         ┌─────────────────┼──────────────────┐

         ▼                 ▼                  ▼

  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐

  │ (5) Product │  │ (6) API Spec│  │ (7) Backend &        │

  │ Requirements│  │ (OpenAPI/   │  │ Security Spec        │

  │ (PRD)       │  │  GraphQL)   │  │ (Hexagonal Domains)  │

  └─────────────┘  └─────────────┘  └─────────────────────┘

                           │

         ┌─────────────────┼──────────────────┐

         ▼                 ▼                  ▼

  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐

  │ (8) UI/UX & │  │ (9) AI &    │  │ (10) DevOps &        │

  │ Frontend    │  │ Knowledge   │  │ Deployment Manuals   │

  │ Spec (PWA)  │  │ Spec        │  │ (CI/CD, DR)          │

  └─────────────┘  └─────────────┘  └─────────────────────┘

**Aturan hierarki:**

- Dokumen lebih rendah tidak boleh mendefinisikan entitas baru yang tidak ada di dokumen ini.  
- Dokumen lebih rendah boleh memperluas definisi (menambah kolom, properti) selama tidak melanggar invariant yang ditetapkan di sini.  
- Konflik antara dokumen turunan diselesaikan dengan mengacu pada dokumen ini sebagai otoritas tertinggi.

---

## APPENDIX A: CANONICAL NAMING STANDARDS

### A.1 Database

| Artefak | Konvensi | Contoh |
| :---- | :---- | :---- |
| Table | `snake_case`, plural | `journal_entries`, `access_passes` |
| Column | `snake_case`, singular | `tenant_id`, `created_at`, `deleted_at` |
| Index | `idx_{table}_{column(s)}` | `idx_bookings_facility_id_time_range` |
| Foreign Key | `fk_{child_table}_{parent_table}` | `fk_journal_lines_journal_entries` |
| Constraint | `chk_{table}_{rule}` | `chk_journal_entries_balanced` |
| Enum Type | `snake_case` dengan prefix domain | `booking_status`, `payment_state` |

### A.2 API Endpoints

| Jenis | Konvensi | Contoh |
| :---- | :---- | :---- |
| Resource URL | Kebab-case, plural, noun | `/api/v1/journal-entries` |
| Nested Resource | Resource berbasis hierarki | `/api/v1/facilities/{id}/bookings` |
| Action Endpoint | POST dengan path verb | `/api/v1/bookings/{id}/approve` |
| Query Parameter | `camelCase` | `?startDate=2025-01-01&tenantId=xxx` |

### A.3 Kode (TypeScript/JavaScript)

| Artefak | Konvensi | Contoh |
| :---- | :---- | :---- |
| Domain Event | `PascalCase`, past tense | `BookingApproved`, `JournalPosted` |
| Command | `PascalCase`, imperative noun | `ApproveBookingCommand` |
| Aggregate | `PascalCase`, singular | `Ledger`, `AccessPass` |
| Value Object | `PascalCase`, singular | `Money`, `TimeRange` |
| DTO/Response | `PascalCase` \+ suffix | `CreateBookingCommand`, `BookingResponse` |
| Repository Interface | `I` prefix \+ `Repository` suffix | `IBookingRepository` |
| Event Handler | `On` prefix \+ Event name | `OnBookingApproved` |
| Service | Domain noun \+ `Service` | `LedgerService`, `AccessPassService` |

---

## APPENDIX B: ERROR TAXONOMY

Sistem error bersifat hierarkis dan dapat dilacak via `Trace-ID`.

| Error Code | Kategori | HTTP Status | Deskripsi |
| :---- | :---- | :---- | :---- |
| `AUTH_001` | Authentication | 401 | Token JWT tidak valid atau kedaluwarsa |
| `AUTH_002` | Authentication | 401 | Refresh token tidak valid |
| `AUTHZ_001` | Authorization | 403 | Role tidak memiliki izin untuk aksi ini |
| `AUTHZ_002` | Authorization | 403 | User bukan anggota Tenant yang dimaksud |
| `DOMAIN_001` | Domain Violation | 422 | Invariant Aggregate dilanggar (detail di `errors[]`) |
| `DOMAIN_002` | Domain Violation | 409 | Booking conflict: waktu tumpang tindih |
| `DOMAIN_003` | Domain Violation | 409 | JournalEntry tidak seimbang (debit ≠ kredit) |
| `DOMAIN_004` | Domain Violation | 422 | Transisi state machine tidak valid |
| `IDEM_001` | Idempotency | 200 | Request sudah diproses (response cache dikembalikan) |
| `IDEM_002` | Idempotency | 409 | Idempotency key bentrok dengan payload berbeda |
| `INTG_001` | Integration | 502 | PSP gateway tidak merespons |
| `INTG_002` | Integration | 504 | Timeout pada layanan eksternal |
| `RATE_001` | Rate Limiting | 429 | Batas request per menit terlampaui |
| `DATA_001` | Data | 404 | Entitas dengan ID tersebut tidak ditemukan |
| `DATA_002` | Data | 410 | Entitas telah diarsip (soft-deleted) |

**Format error response standar:**

{

  "error": {

    "code": "DOMAIN\_002",

    "message": "Booking conflict: waktu yang dipilih bertumpang tindih dengan Booking \#xyz",

    "traceId": "01JXXXXXXXXXXXXXXXXXXXXXXX",

    "details": {

      "conflictingBookingId": "uuid-of-conflicting-booking",

      "requestedRange": { "start": "...", "end": "..." }

    }

  }

}

---

## APPENDIX C: CHANGELOG

| Versi | Tanggal | Perubahan Utama | Author |
| :---- | :---- | :---- | :---- |
| **v5.0.1** | 2025-Q3 | Penambahan OpenRouter sebagai AI Unified Gateway (Part 17.3). Refaktor AI Provider menjadi dua jalur: OpenRouter (primer) & Direct Provider (sekunder). Penambahan `IAIModelAdapter` interface, Routing Decision Matrix, dan ADR-016. Update pipeline diagram 16.1 & 16.2. | Sovereign OS Arch Team |
| **v5.0** | 2025-Q3 | Konsolidasi v3.0 & v4.0. Penambahan: Part 14 (CQRS), Part 17 (Integration), Part 18 (SLA), Appendix A & B. Unifikasi Ontologi (3.1–3.4). Penyempurnaan Enterprise Laws (+L-07 s.d L-10). Penambahan `WorkflowInstance`, `Membership`, `InventoryLot`, `JournalLine` sebagai entitas kanonikal. Revisi lengkap State Machines & Domain Event Catalog. | Sovereign OS Arch Team |
| v4.0 | 2025-Q1 | Refaktor arsitektur UX Principles, penambahan Part 15–17, konsolidasi Data Governance | Sovereign OS Arch Team |
| v3.0 | 2024-Q3 | Versi publik pertama. Penetapan 26 Parts dasar, Ontologi awal, Enterprise Laws (L-01 s.d. L-06) | Sovereign OS Arch Team |

---

*© Sovereign OS — Dokumen ini adalah intellectual property eksklusif. Dilarang didistribusikan ke pihak eksternal tanpa izin tertulis dari Platform Owner.*

*Untuk mengusulkan perubahan pada dokumen ini, ajukan RFC (Request for Constitution Change) melalui repositori internal dan dapatkan persetujuan dari Lead Architect.*

