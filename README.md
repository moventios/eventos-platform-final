# Movent

**Relationship Infrastructure** (public ecosystem: Moventios)

**Documentation and Knowledge Base**

This repository contains the documentation, strategy, architecture, and knowledge base for **Movent** — the reusable Relationship Infrastructure.

**Movent** is the underlying platform engine:

- Graph infrastructure
- Identity engine
- Place engine
- Activation engine
- Governance / workflow engine
- Trust and activity engine

**Moventios** is the first public ecosystem built on Movent:

- A Relationship, Activation and Collaboration Network
- Public discovery of people, organizations, communities, places, events, projects and opportunities
- Public-first: relationships and reputation before private workspace

Solutions (Events, Projects, Communities, etc.) are vertical implementations built on this infrastructure.

The monorepo provides the reusable Movent engines (packages) and the first Moventios implementation (apps).

## What Movent Solves

Movent provides the reusable infrastructure for building relationship-driven ecosystems. It enables discovery, trust, activation, governance, and collaboration across identities, places, and opportunities — without tying the foundation to any single vertical (events, projects, communities, etc.).

## Repository Structure

The content separates the reusable **Movent** infrastructure (layers, core engines) from the **Moventios** ecosystem experience and future Solutions.

```
.
├── README.md
├── .cursorrules                  # AI IDE rules + essential mapping (start here for agents)
├── docs/
│   ├── layers/                   # The 3 Canonical Layers (SSOT for Movent infrastructure)
│   ├── volumes/                  # Knowledge Volumes
│   ├── ai-ide/
│   └── architecture/             # ADRs and RFCs
├── apps/
│   └── movent-*                  # Moventios implementation + workers
├── packages/
│   └── movent-*                  # Reusable Movent engines (contracts, core, database, infrastructure, ui)
└── archive/                      # Historical and superseded (never use)
```

## For Humans / Developers

- Start with `docs/layers/` for the **Movent** infrastructure (the reusable engines).
- Use `docs/volumes/` and relevant strategy for the **Moventios** ecosystem experience and how to build Solutions on top.
- `docs/architecture/adr/` for decisions that affect the reusable infrastructure.
- `apps/movent-*` contain the first public Moventios implementation.

## For AI IDE Agents

**Load the fewest files possible.**

1. `.cursorrules` (rules + mapping)
2. `docs/ai-ide/EKB-AI-Agent-Instructions.md`
3. `docs/layers/` (for **Movent** infrastructure)
4. Specific `docs/volumes/` only when working on **Moventios** ecosystem or a Solution

**Never** load entire `docs/strategy/` or `docs/volumes/` by default.

See `.cursorrules` for the current recommended context order.

## Structure Philosophy

- `docs/layers/` + `packages/movent-*` = **Movent** (reusable relationship infrastructure)
- `docs/strategy/`, `apps/movent-web`, public surfaces = **Moventios** (first ecosystem built on Movent)
- Future vertical Solutions reuse the same engines.

This separation keeps the reusable infrastructure distinct from any one ecosystem.

## Current State

This repository implements **Movent** (the reusable Relationship Infrastructure — Identity, Place, Activation, and Governance Engines) and the first **Moventios** (public Relationship, Activation & Collaboration Network).

See `docs/IMPLEMENTATION-LOG.md` for the detailed history of the transition from earlier Event/Project platform framing to the current infrastructure + ecosystem model.

Documentation Freeze Mode is active.

- [x] Removed leftover old dirs (apps/web)
- [x] Created docs/core, build, operate, knowledge structure + moved representative existing files
- [x] Rewrote AI context loading + 4-layer model in .cursorrules + EKB-AI instructions
- [x] Embedded full restructuring audit + 10 deliverables into IMPLEMENTATION-LOG.md
- [ ] Full verification build + test after all renames
- [ ] Continue incremental doc moves from legacy volumes/strategy/ into new layers
- [ ] Update any external Vercel/Trigger/Git remote names

### Notes

- Historical references in `archive/` must remain untouched.
- ADR historical references must remain untouched.
- "Tenant Sovereignty" and principle names are kept (they are not product names).
- Only edit existing files. No new planning docs.

Run `pnpm install` after structural renames. Use incremental commits.
