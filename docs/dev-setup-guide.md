# Panduan Pengembangan Lokal (Localhost Dev Setup & Status)
**Moventios Platform (internal: Movent)**

Dokumen ini menjelaskan status pengembangan platform saat ini, tingkat kesiapan produksi, serta instruksi langkah-demi-langkah untuk menjalankan platform ini secara lokal di `localhost`.

---

## 1. Status Pengembangan Saat Ini (Current Dev Status)

Platform **Moventios** (internal: Movent) menggunakan arsitektur monorepo berbasis **Turborepo** dan **pnpm workspaces** dengan pendekatan **Hexagonal Architecture + DDD (Domain-Driven Design)**.

### A. Struktur Kode & Modul
*   **`apps/movent-web`**: Aplikasi frontend utama berbasis **Next.js 15 (App Router)** yang berfungsi sebagai BFF (Backend-for-Frontend) dan antarmuka pengguna.
*   **`apps/movent-workers`**: Background workers berbasis **Trigger.dev** untuk menangani tugas asinkron.
*   **`packages/movent-core`**: Logika bisnis murni (domain logic) untuk sub-sistem (IAM, Commerce, Spatial, Workflow). Bebas dari dependensi infrastruktur/database.
*   **`packages/movent-database`**: Skema basis data menggunakan **Drizzle ORM** dan aturan keamanan Row-Level Security (RLS) PostgreSQL/Supabase.
*   **`packages/movent-infrastructure`**: Adapter luar (database client, email client, payment gateway client).

### B. Status Kesiapan Produksi (Production Readiness)
Platform saat ini berada di fase **Pre-alpha / Development lokal**. 
*   **Arsitektur & Skema**: **100% Siap**. Desain modular, multi-tenant dengan isolasi data via RLS, dan model data double-entry ledger keuangan telah didefinisikan secara matang.
*   **Kode Domain & API**: **Sedang Berjalan (In-Progress)**. Struktur API route Next.js dan interceptor middleware (JWT, tenant verification) telah terpasang, namun beberapa handler integrasi riil masih menggunakan mock/stub.
*   **Kesiapan Deploy**: Memerlukan konfigurasi production credentials (Supabase Cloud, HashiCorp Vault, Resend, dll.) sebelum didorong ke Vercel/Cloudflare Edge.

---

## 2. Persyaratan Sistem (Prerequisites)

Untuk menjalankan platform secara lokal, pastikan perangkat Anda memiliki:
1.  **Node.js**: Versi `>= 20.0.0`
2.  **pnpm**: Versi `>= 9.0.0`
3.  **Docker Desktop**: Harus aktif (digunakan oleh Supabase CLI untuk menjalankan database PostgreSQL, Auth, S3 Storage secara lokal).

---

## 3. Langkah-Langkah Menjalankan di Localhost

Ikuti langkah berikut untuk mengaktifkan environment pengembangan lokal:

### Langkah 1: Kloning & Instalasi Dependensi
Jalankan perintah berikut di root workspace untuk menginstal paket yang dibutuhkan:
```bash
pnpm install
```

### Langkah 2: Konfigurasi Environment Variables
Salin file template `.env.example` ke file `.env` di root direktori (dan opsional `.env.local` di `apps/movent-web/` jika diperlukan override spesifik):
```bash
cp .env.example .env
```
*Catatan: Nilai-nilai default di `.env` sudah dikonfigurasi untuk langsung kompatibel dengan Supabase CLI lokal.*

### Langkah 3: Jalankan Docker & Supabase Local
1.  Buka aplikasi **Docker Desktop** di perangkat Anda dan pastikan daemon Docker telah berjalan.
2.  Inisialisasi dan jalankan kontainer database lokal Supabase menggunakan Supabase CLI terintegrasi:
    ```bash
    npx supabase start
    ```
3.  Setelah proses selesai, ketik perintah berikut untuk memverifikasi status dan melihat dashboard database (Studio):
    ```bash
    npx supabase status
    ```
    *Anda dapat mengakses Supabase Studio di `http://127.0.0.1:54323` untuk memantau data secara visual.*

### Langkah 4: Sinkronisasi Skema Database
Dorong skema Drizzle ORM yang didefinisikan di `packages/movent-database` ke instance database lokal Supabase:
```bash
pnpm --filter @movent/database db:push
```
Perintah ini akan membuat semua tabel (termasuk pemicu/trigger audit dan aturan RLS) di PostgreSQL.

### Langkah 5: Jalankan Server Pengembangan (Dev Server)
Jalankan Turborepo untuk menjalankan Next.js frontend dan Background Workers secara bersamaan:
```bash
pnpm dev
```
Output terminal akan menunjukkan status kompilasi. Aplikasi web Next.js dapat langsung diakses di:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 4. Troubleshooting & FAQ

#### 1. Masalah: `Cannot connect to the Docker daemon` saat menjalankan `supabase start`
*   **Penyebab**: Docker Desktop belum aktif.
*   **Solusi**: Buka aplikasi Docker Desktop secara manual di sistem operasi macOS Anda, tunggu hingga statusnya berubah menjadi *Running*, lalu jalankan ulang `npx supabase start`.

#### 2. Masalah: Port konflik (misal port 3000 atau 54321 sudah terpakai)
*   **Solusi**: Ubah konfigurasi port pada `apps/movent-web/package.json` untuk dev server (contoh: `next dev -p 3001`) atau ubah port db di `supabase/config.toml`.
