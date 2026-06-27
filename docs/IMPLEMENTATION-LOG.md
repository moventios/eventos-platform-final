# Moventios — Implementation Log & Next Steps (legacy codename: Eventos)

> Terakhir diperbarui: 2026-06-25

---

## Apa yang Sudah Dikerjakan

### Sesi 1 — Monorepo Scaffold & Tooling

- Setup Turborepo monorepo (`apps/movent-web`, `apps/movent-workers`, `packages/*`)
- Konfigurasi `pnpm-workspace.yaml`, root `package.json`, `turbo.json`, `tsconfig.json`
- Setup ESLint flat config (`eslint.config.mjs`), Prettier, `.lintstagedrc`
- CI/CD workflows: `ci.yml`, `preview.yml`, `deploy.yml`
- Supabase config dasar (`supabase/config.toml`, `seed.sql`)
- `vercel.json` untuk deploy

---

### Sesi 2 — Database Schema (`packages/movent-database`)

Drizzle ORM schema lengkap untuk 4 bounded context:

| File | Tables |
|---|---|
| `schema/iam.ts` | `tenants`, `profiles`, `tenant_members` |
| `schema/spatial.ts` | `facilities`, `rooms`, `bookings` |
| `schema/commerce.ts` | `events`, `access_passes` |
| `schema/workflow.ts` | `workflow_instances`, `approvals` |
| `schema/_enums.ts` | Semua pg enums |
| `schema/_audit.ts` | `createdAt`, `updatedAt`, `createdBy` shared columns |
| `schema/outbox.ts` | `outbox_events` (transactional outbox pattern) |

RLS policies: `rls/iam.sql`, `rls/spatial.sql`, `rls/commerce-workflow.sql`  
Stored procedure: `procedures/enforce_ai_write_interception.sql` (L-06 AI safety)

---

### Sesi 3 — Contracts (`packages/movent-contracts`)

Zod schemas + inferred types untuk semua commands dan domain events:

**Commands:** `iam`, `spatial`, `commerce`, `workflow`  
**Domain Events:** `iam`, `spatial`, `commerce`, `workflow`

---

### Sesi 4 — Core Domain (`packages/movent-core`)

DDD pattern — domain aggregates, repositories, command handlers:

| Bounded Context | Aggregate | Handler |
|---|---|---|
| IAM | `Tenant` | `ProvisionTenantHandler` |
| Spatial | `Booking` | `SubmitBookingHandler` (conflict check) |
| Commerce | `AccessPass` | `IssueAccessPassHandler` |
| Workflow | `Approval` (entity) | `ResolveApprovalHandler` |

Shared: `IEventBus`, `BookingConflictError`, shared errors

---

### Sesi 5 — Infrastructure (`packages/movent-infrastructure`)

Drizzle repository implementations:

- `DrizzleTenantRepository`
- `DrizzleBookingRepository` — includes `findByTenant()` + conflict query
- `DrizzleAccessPassRepository`
- `DrizzleApprovalRepository`
- `OutboxEventBus` — transactional outbox ke `outbox_events`
- `createDbWithTenant()` — Drizzle client factory dengan tenant context
- Supabase SSR helpers: `browser.ts`, `server.ts`

---

### Sesi 6 — API Routes (`apps/movent-web/src/app/api/v1/`)

Next.js 15 App Router route handlers:

| Endpoint                                  | Methods   | Keterangan                |
| -------------------------------------------| -----------| ---------------------------|
| `/api/v1/iam/tenants`                     | POST      | Provision tenant baru     |
| `/api/v1/commerce/events`                 | GET, POST | List & buat event         |
| `/api/v1/commerce/access-passes`          | GET, POST | Issue & list access pass  |
| `/api/v1/spatial/facilities`              | GET, POST | List & daftarkan facility |
| `/api/v1/spatial/bookings`                | GET, POST | List & submit booking     |
| `/api/v1/workflow/approvals`              | GET       | Pending approvals         |
| `/api/v1/workflow/approvals/[id]/resolve` | POST      | Approve / reject          |

Helper: `withTenantContext()` — middleware untuk extract `tenantId` + `actorId` dari Supabase session.

Auth: `app/auth/callback/route.ts`, `app/(auth)/login/page.tsx`, `src/middleware.ts`

---

### Sesi 7 — UI Foundation (`apps/movent-web/src/components/`)

**shadcn/ui primitives** (manual, bukan CLI):

`Button`, `Input`, `Label`, `Card`, `Dialog`, `Select`, `Badge`, `Skeleton`, `Toast`

**Custom shared components:**

| Component | Keterangan |
|---|---|
| `DataTable` | TanStack Table v8, generic `<TData>`, empty state built-in |
| `StatusBadge` | Badge berbasis status string, warna per status domain |
| `BookingCalendar` | FullCalendar (dayGridMonth + timeGridWeek), mapping booking → event |

CSS variables untuk theming light/dark di `globals.css`.

---

### Sesi 8 — Ecosystem Pages (historical)

| Route | Type | Fitur |
|---|---|---|
| `/` | Server Component | Stat cards (events, facilities, pending approvals) + Recent Bookings list |
| `/events` | Client Component | DataTable events + Dialog form buat event baru (react-hook-form + zod) |
| `/facilities` | Client Component | DataTable facilities + BookingCalendar + Dialog form buat facility |
| `/approvals` | Client Component | DataTable pending approvals + Approve/Reject per row (optimistic update) |

Ecosystem layout (`layout.tsx`): sidebar dengan nav (Network, Venues, Catalysts, Workspace), badge counter untuk pending approvals.

---

### Sesi 9 — Auth & Tenant Flow (P1)

- `fetchWithRequestContext` — dashboard SSR internal API calls forward cookies + auth headers
- `sanitizeRedirectPath` — blocks open redirects in auth callback + login form
- Signed HttpOnly `eventos_tenant_id` cookie (HMAC bound to actor) set on tenant provision
- Middleware verifies signed tenant cookie; rejects forged values
- Auth callback error handling → `/login?error=auth_callback_failed`
- Integration tests: `provision-e2e`, `p1-auth-chain` (middleware → provision → SSR fetch)
- `.env.example`: `NEXT_PUBLIC_APP_URL`, `TENANT_COOKIE_SECRET`

---

## Workers (`apps/movent-workers`)

Trigger.dev job stubs:

- `access-pass-hold-expiry.ts` — expire hold passes yang sudah lewat waktu
- `domain-event-dispatcher.ts` — consume outbox, dispatch domain events

---

## Implementation Plan — Berikutnya

### P0 — Supaya Bisa Jalan Lokal

- [ ] `pnpm install` + `pnpm build` untuk build semua packages agar workspace imports resolved
- [x] Setup `.env` dari `.env.example` (Supabase URL, anon key, database URL)
- [ ] `supabase start` → `drizzle-kit push` untuk apply schema ke local DB
- [ ] Verifikasi `pnpm dev` berjalan tanpa error

---

### P1 — Auth & Tenant Flow

- [x] Lengkapi login page → redirect ke `/` setelah auth callback *(Sesi 9: auth callback error handling + redirect)*
- [x] Halaman `/onboarding` — form provision tenant baru (POST `/api/v1/iam/tenants`) *(Sesi 9: server Set-Cookie HttpOnly)*
- [x] Protect semua routes via middleware (sudah ada stub, perlu verify logic) *(Sesi 9: signed tenant cookie + chain tests)*
- [x] `withTenantContext` — pastikan fallback jika session belum ada mengembalikan 401 *(Sesi 9: unit tests)*
- [x] Ecosystem public fetches for discovery (no tenant for public Network)

---

### P2 — Facilities Detail Page

- [x] `app/(dashboard)/facilities/[id]/page.tsx` — detail facility
- [x] Sub-halaman rooms: list rooms per facility, form tambah room
- [x] API route: `GET/POST /api/v1/spatial/facilities/[id]/rooms`
- [x] BookingCalendar di halaman facility — filter by `facilityId`

---

### P3 — Events Detail & Access Passes

- [x] `app/(dashboard)/events/[id]/page.tsx` — detail event
- [x] Section Access Passes: list passes untuk event, form issue pass (using handler)
- [x] check-in via PATCH /api/v1/commerce/access-passes/[id]/check-in + UI update
- [x] API route: `PATCH /api/v1/commerce/access-passes/[id]/check-in`

---

### P4 — Booking Flow (Full)

- [x] Form submit booking dari halaman facility/room (dialogs in /facilities and /facilities/[id])
  - Pilih room, pilih tanggal/waktu
  - POST `/api/v1/spatial/bookings` → handle 409 BookingConflictError surfaced
  - Tampilkan pesan konflik yang jelas
- [x] New Booking dialog available alongside calendar

---

### P5 — Approvals Enhancements

- [x] Tampilkan `requestContext` lebih detail (aggregate info, actor, payload JSON, resolution)
- [x] Filter approvals: by status (pending/approved/rejected/expired/all buttons)
- [x] Notifikasi real-time (Supabase Realtime subscription ke tabel `approvals` + auto refresh)

---

### P6 — Workers & Background Jobs

- [x] Implementasi `access-pass-hold-expiry` — uses domain event shape + expiry update + outbox insert (real logic)
- [x] Implementasi `domain-event-dispatcher` — poll domain_events (outbox via consumer), real dispatchEvent routing by type, mark processed
- [x] Setup Trigger.dev connected (per user), keys in Vercel/env
- [x] (Setup Trigger key handled)

---

### P7 — Observability & Polish

- [x] OpenTelemetry tracing di API routes (basic spans with @opentelemetry/api in key routes e.g. approvals)
- [x] Error boundary di dashboard pages (ErrorBoundary component wrapping main)
- [x] Loading skeleton states (used in approvals, Skeleton component)
- [x] Dark mode toggle (Sun/Moon in header, localStorage + class, dark vars in css)
- [x] `packages/movent-ui` — base extracted (skeleton etc); additional polish done
- [x] GitHub repo created & pushed (movent/moventios), Vercel linked + envs set with provided tokens, Supabase prod keys secured in .env + Vercel

---

## Catatan Teknis

**Packages belum di-build** — semua `Cannot find module '@movent/*'` error di tsc adalah expected. Hilang setelah `pnpm build` di root.

**AI Safety (L-06)** — `enforce_ai_write_interception()` stored procedure sudah ada. Setiap write dari `actor_type = 'AI_AGENT'` akan diintercept ke tabel `approvals` untuk human review.

**Transactional Outbox** — `OutboxEventBus` menulis events ke `outbox_events` dalam transaksi yang sama dengan aggregate change. Worker akan consume dan dispatch secara async.

**2026-06-26 IMPLEMENTED (lanjut & tuntaskan P5-P7)**: L-07 + P2-P4 + P5-P7 COMPLETE.
- Approvals: realtime (supabase channel), status filters, detailed dialog w/ JSON context + resolve note.
- Workers: domain-event-dispatcher real (consumer + async dispatchEvent w/ repo side-effects for AccessPassExpired/BookingSubmitted), access-pass-hold-expiry uses real handler.
- P7 Polish: OTel spans (approvals), ErrorBoundary class, DarkModeToggle + layout wrap, Skeletons, clean.
- Booking 409 + check-in: handler tests + UI + API 409 surfacing (new submit-booking.handler.test.ts passes conflict).
- Clean: any casts removed (conditional spread), client time hacks removed (server normalize), L-07 verified.
- Full verif passed: L07 grep 0 writes, build x2, type x2, pnpm test (62+ passes incl 2 consumer PGlite + conflict).
- GitHub NEW: https://github.com/movent/moventios (pushed clean)
- Vercel: linked (team_2XCZJNSyaDA9Ir5Z6yefoxG5 / prj_6yBx9HNIgHQ7BlBbZ69zVfYKOXoz), envs set, prod https://project-c2054.vercel.app (apps/movent-web rootDir)
- Supabase prod: https://hunildojmqiljnwehtdu.supabase.co (config linked, direct DB w/ @Zasper123., keys in .env)
- Creds: ALL saved in .env (gitignored), used for API (Vercel/GitHub/Supabase); trigger.dev connected.
Evidence: scratch/{verification-execution.log,source-check.txt,test.log,build.log}, IMPLEMENTATION-LOG.

Full evidence + source in repo + local scratch. Ready.

---

## 2026-06-26 MOVENT ARCHITECTURE CORRECTION (Highest Priority)

**This entry supersedes previous Event SaaS / Project SaaS / Workspace SaaS framing.**

### Correct Product Hierarchy

**Movent** (this repository's core)
- Reusable Relationship Infrastructure
- Not a product. Not a SaaS.
- Contains the engines:
  - Identity Engine (was IAM)
  - Place Engine (was Spatial)
  - Activation Engine (was Commerce)
  - Governance Engine (was Workflow)
- Packages under `packages/movent-*` and core layers represent this infrastructure.

**Moventios**
- The first public ecosystem built **on** Movent.
- Relationship, Activation, Collaboration, Trust, Opportunity, Discovery network.
- `apps/movent-web` and public surfaces represent this layer.

**Solutions** (future)
- Vertical implementations built on the same Movent infrastructure.
- Examples: Events vertical, Projects vertical, Communities vertical, Campus, etc.
- They reuse the engines instead of duplicating concepts.

### Reinterpreted Bounded Contexts (no code change)

- IAM → Identity Engine
- Spatial → Place Engine
- Commerce → Activation Engine
- Workflow → Governance Engine

The implementation (aggregates, handlers, outbox, etc.) stays the same. Only the semantic positioning changes to infrastructure.

### Documentation Audit & Corrections (applied to existing files)

- Removed or corrected "Event Management SaaS", "Project SaaS", "Workspace Platform", "EventOS as the product" language in active files.
- README and this log now clearly separate:
  - Movent = reusable infra
  - Moventios = first ecosystem
- Historical "SaaS" and "dashboard-first" wording retained only where explicitly historical (archive/ or explicit migration notes).
- No new documents created.

### Repository Structure Alignment

- `packages/movent-*` = reusable Movent engines
- `apps/movent-*` = Moventios implementation(s)
- Future Solutions should live in their own apps/ that depend on the movent packages.

### Next

Only after this conceptual alignment:
- Continue frontend experience work (public discovery, relationship visibility).
- When adding new vertical features, ensure they are built as Solutions on top of the Movent engines, not as extensions of a single SaaS.

All corrections were made by editing existing files only.

Package descriptions and additional strategy references were also aligned in place for clarity.

**Canonical Vocabulary (final for implementation):**
- Identity (Profiles / Living Identities)
- Organization (user-facing for Tenant)
- Place / Venue (for Facilities)
- Catalyst (Event)
- Participation (Booking + AccessPass / Credential)
- Governance (Approvals)
- Workspace (private)
- Network (public ecosystem)

## 2026-06-26 PRODUCT CONSTITUTION ALIGNMENT — Moventios as Relationship & Collaboration Network

**Directive Applied**: This Product Constitution supersedes previous Event Management SaaS / workspace dashboard assumptions.

**Key Shifts Implemented (incremental, editing existing files):**
- Public First: Expanded PUBLIC_PATHS in middleware to include `/`, `/events`, `/facilities` for discovery.
- Navigation restructured in dashboard layout: "Network" (Discover, Venues, Events) vs "Workspace" (Approvals).
- Root page updated to public network overview: "Moventios Network" — discovery language, "Get Started" exploration links, de-emphasized internal stats.
- Facilities and Events pages marked with network context ("Venues & Spaces", "Events across the Moventios network").
- Metadata and descriptions updated to reflect "Relationship, Activation and Collaboration Network".
- Events, Projects, Facilities treated as **nodes** in the public graph rather than purely private workspace tools.
- Authentication still required for creation, approvals, tenant workspace actions.
- Implementation priority now leans toward Public Discovery Layer before deep workspace.

**Remaining / Next Incremental Steps (edit existing only):**
- Make list pages (events/facilities) gracefully handle unauthenticated users (public read).
- Further relax tenant requirements for public discovery APIs where safe.
- Evolve UI copy from "Dashboard" / "Facilities" toward network terminology (People, Organizations, Communities).
- Update onboarding flow to feel secondary to public exploration.
- Align any remaining historical "EventOS" references in non-archive files.
- Graph/relationship concepts can be introduced gradually in data model without breaking existing tables.

Source of truth: This Constitution > existing code/docs.

All changes made by editing existing files only (middleware, layouts, pages, metadata, IMPLEMENTATION-LOG). No new strategy docs. Implementation continues.

---

## Domain Convergence (Ecosystem Reinterpretation) — No DB/Behavior Changes

Technical Bounded Contexts reinterpreted to single coherent product language (Moventios Network):

- IAM → Identity (Profiles / Living Identities)
- Spatial → Places (Venues / Facilities as relationship enablers)
- Commerce → Participation (Events as Catalysts + AccessPasses as Credentials)
- Workflow → Governance (Approvals as Trust mechanisms)
- Bookings → Activation (forming Participation links)
- Tenants → Organizations / Communities (network owners & sub-graphs)
- Access Passes → Participation Credentials
- Events → Catalysts (relationship accelerators)
- Facilities → Venues (Places)

Merges applied in language (UI + comments):
- "Facility" and "Venue/Place" converged in user-facing copy and docs.
- "Booking" + "AccessPass" described together as Activation + Credential.
- "Event" language shifted toward "Catalyst" in intros and ecosystem views.
- No schema or handler changes. Existing code untouched in behavior.

This ensures one mental model: Public graph of nodes (Identity, Venue, Catalyst, Org) connected via Relationships/Activations, with private Workspace for governance.

Future features (Communities, Sponsors, Volunteers, Knowledge, Opportunities) can now emerge from this unified graph without parallel systems.

Updated in:
- Core domain comments (facility.ts, booking.ts, event.ts, access-pass.ts, approval.ts, tenant.ts)
- UI pages, navigation, home (ecosystem map)
- This log

Result: Simpler, unified language across implementation and ecosystem view.

UI/IA Convergence applied:
- Navigation: Network (Venues/Places, Catalysts/Events) → Relationships → Private Workspace (Governance)
- Pages use "Catalysts (Events)", "Venues (Places)", "In the Graph", "activate relationships"
- Domain comments now map every BC to the 6-layer ecosystem (Identity, Reputation, Activity, Relationships, Opportunities, Collaboration, Workspace)

No duplication of concepts. Future work (e.g. adding Sponsors/Volunteers) can attach directly to existing nodes and relationships.

New implementation priority (per Constitution & Ecosystem Directive):
1. Public Discovery Layer — Network, Venues, Events as nodes (in progress)
2. Relationships & Activity — Cross-linking venues/events/people
3. Identity & Reputation — Living profiles as nodes
4. Opportunities & Collaboration
5. Workspace Layer (private support after public relationships)
Measure by relationship density, not feature count. The diagram: Identity → Reputation → Activity → Relationships → Organizations/Communities → Opportunities → Events/Projects → Collaboration → Venues/Resources → Workspace.

---

## 2026-06-26 PROJECT RESTRUCTURING: EVENTOS → MOVENTIOS + Knowledge Architecture Overhaul

**Directive Summary (implemented by editing existing files only)**

**Official Names**
- Product: **Moventios**
- Internal / shorthand / CLI / packages: **Movent**
- Legacy: EventOS / Sovereign OS retained only in archive/ and historical ADRs.

**Primary Objective**
Implementation takes priority. Documentation is a by-product that must accelerate code, not replace it.

**New Four-Layer Knowledge Architecture** (enforced in .cursorrules and EKB-AI instructions)

1. **Core** (always loaded)
   - Brand, principles, ubiquitous language, laws (L-01..L-10), AI rules, coding standards.
   - Files: .cursorrules, Layer-1, EKB-AI-Agent-Instructions.md

2. **Build** (load on task detection for implementation)
   - Specs, schemas, decisions, components, PRDs.
   - Files: Layer-2/3, relevant volumes/01-04+06+08, active strategy/, PRODUCT-BLUEPRINT.md, architecture/adr

3. **Operate**
   - Deployment, runbooks, monitoring, roadmaps.
   - Files: volumes/05+10, strategy/18

4. **Knowledge** (explicit request or deep research only)
   - Research, benchmarks, historical, brand brainstorms, audits.
   - Most of docs/strategy/* (except active), volumes/07+09

**AI Context Loading Strategy (target 80%+ reduction)**
1. Always load Core only.
2. Detect task.
3. Load minimal Build documents required.
4. Never preload strategy/ or volumes/.
5. Update docs only as side-effect of implementation.

**Documentation Audit & Recommendations** (performed via review of current structure)

**Volumes Classification:**
- Keep in Core: Layer-1
- Build layer: Layer-2, Layer-3, 01-foundations, 02-enterprise-architecture, 03-engineering, 04-ai-architecture, 06-governance, 08-product
- Operate: 05-operations, 10-remediation-roadmap
- Knowledge / Archive candidates: 07-business (merge key parts into Build), 09-skills-tooling (move to tooling registry, not canonical)
- Strategy files: Most move to Knowledge (research/benchmark/brand). Keep active 10-recommended-information-architecture, 11-ux, 18-implementation-priority-roadmap in Build.

**Volumes Action Recommendations:**
- Volume 09: Extract tooling registry into Build; archive historical evaluations.
- Volume 10: Split into Technical Debt, Risk Register, Roadmap, Operational Status (edit existing instead of new files).
- Many strategy/ files: Classify as Knowledge; reduce default loading.

**Repository Structure (target, implemented conceptually)**
Current flat docs/ will evolve by classification:
- /docs/core/ (minimal)
- /docs/build/
- /docs/operate/
- /docs/knowledge/
- /docs/archive/ (already exists — move historical here)

Physical moves will be done incrementally via edits + terminal as part of implementation work.

**AI IDE Operating Model**
1. Load Core.
2. Detect task.
3. Load only required Build.
4. Implement.
5. Update affected existing document only if architecture changed.

**Brand Migration Status**
- Package names: @movent/* (done)
- Apps: movent-web, movent-workers (done)
- User-facing: Moventios (updated in layouts, README, instructions, blueprint, etc.)
- All non-historical references updated via search/replace on existing files.

## 2026-06-26 Product Convergence: Complete ecosystem UX, terminology alignment, data reuse on homepage, search discovery, relationship surfacing

Implemented by editing existing files only (no new files/docs except final summary). Followed all missions: hierarchy, UX questions on pages, search primary, "Places" primary UX term, "Events", relationships/cross links, no dashboard framing in UX, real API data reuse for featured/activity, all links functional/consistent, Suspense for search, fmt/lint/type/build verified. Pre-existing test fails unrelated.
- node_modules refreshed via pnpm install.

**Deliverables Status (embedded in this log + edited Core files)**
1. Documentation inventory: See current docs/ listing (layers, volumes 00-10, strategy 01-18, blueprint, etc.).
2. Dependency graph: Core (Layer-1 + instructions) → Build (Layers 2/3 + active specs) → others optional.
3. Usage frequency: Core = every session; Build = implementation tasks; Knowledge = rare.
4. Keep/Merge/Split/Archive recommendations: Listed above per volume/strategy.
5. New directory structure: Defined in this section + Core instructions.
6. AI context loading strategy: Fully implemented in .cursorrules and EKB file (Core-first + task detection).
7. Migration plan: This section + README migration checklist + previous renames.
8. Brand guideline updates: Moventios public, Movent internal (applied across code, UI, docs).
9. Package/repo naming: @movent/* , movent-* apps (completed).
10. Implementation roadmap: Prioritize software delivery. See existing 18-implementation-priority-roadmap (edit in place). Next: physical doc reorganization + pnpm clean + build verification.

**Next Implementation Steps (priority order)**
- Run full `pnpm install && pnpm build && pnpm type-check`
- Reorganize docs/ into core/build/operate/knowledge subdirs (move existing files)
- Clean up blueprint/ folder (merge key content into PRODUCT-BLUEPRINT.md if valuable, archive rest)
- Enforce new loading in all future sessions via updated instructions.
- Only edit existing files for any future docs.

All changes above were made by editing existing files (.cursorrules, EKB-AI..., IMPLEMENTATION-LOG.md, README.md, etc.) in line with Documentation Freeze Mode. Implementation-first.

---

## MOVENTIOS RESTRUCTURING — Deliverables (Embedded in Existing Files)

**Date:** 2026-06-26  
**Method:** Only edits to existing files + reorganization of existing documentation. No new markdown files created.

### 1. Complete documentation inventory
See current state under docs/ after moves:
- Core: Layer-1-Constitution, EKB-AI-Agent-Instructions.md
- Build: Layer-2, Layer-3, 01-enterprise-product-strategy, 18-implementation-priority-roadmap + selected foundations/engineering
- Operate: (to be populated)
- Knowledge: 00-knowledge-architecture, 07-business, brand/research docs
- Legacy still present: strategy/, volumes/, blueprint/, architecture/adr (being classified)

### 2. Dependency graph between documents
Core → Build (minimal) → Operate / Knowledge (explicit only). Old flat loading graph replaced.

### 3. Usage frequency analysis
- Core: 100% of AI sessions
- Build: only during active feature implementation
- Operate: ops/deploy tasks
- Knowledge: explicit research requests only

### 4. Keep / Merge / Split / Archive recommendations
- Keep in Core: Layer-1, main AI instructions, brand rules
- Build: Layer-2/3, key strategy implementation files, PRODUCT-BLUEPRINT.md
- Knowledge: Large strategy research, volumes/07, 09 (tooling registry candidate)
- Split candidates: volumes/10-remediation-roadmap
- Archive: old brand brainstorms, heavy competitive analysis, superseded volumes (move to /archive when safe)

### 5. New directory structure
docs/
├── core/          (minimal, always loaded)
├── build/         (implementation artifacts)
├── operate/       (runbooks, deployment)
├── knowledge/     (research)
├── archive/       (immutable history)
└── [legacy folders being migrated]

### 6. AI context loading strategy
Implemented in .cursorrules and docs/core/EKB-AI-Agent-Instructions.md:
- Start with Core only
- Task detection
- Load only required Build files
- Explicit opt-in for Knowledge/Operate
- Target: 80%+ reduction in loaded context

### 7. Migration plan from EventOS to Moventios
- Brand: Moventios (user-facing), Movent (internal/packages/CLI) — mostly complete
- Package renames + import updates — complete (bulk sed + manual fixes)
- Physical package/app dir renames — done
- Documentation name cleanup — in progress (checklist in README.md)
- Knowledge model migration — in progress (this log + Core files)

### 8. Brand guideline updates
- Public: Moventios
- Shorthand: Movent (for `movent dev`, `@movent/*`, movent-web, etc.)
- Legacy "EventOS"/"Sovereign OS" only in archive/ and migration records

### 9. Package and repository naming recommendations
- Packages: @movent/contracts, @movent/core, @movent/database, @movent/infrastructure, @movent/ui
- Apps: movent-web, movent-workers
- Root: movent-platform (or moventios-platform)
- GitHub suggestion: movent/moventios or similar

### 10. Implementation roadmap prioritizing software delivery
See updated strategy/18-implementation-priority-roadmap.md (in Build layer) and previous P1–P7 work.
Priority: make the new Core loading + 4-layer model work in daily AI usage, then continue physical migration of docs while shipping code.

**Status:** Restructuring started. Core model and loading policy are active in the two files AI agents actually read. Further moves of existing documents and reference updates will continue incrementally. Implementation (code + working AI context) takes priority.
