# ADR-003: SEKB Documentation Cleanup & Harmonization

**Status:** ACCEPTED  
**Date:** 2026-06-25  
**Deciders:** Architecture Board (EAB)  
**Triggered by:** `00-SEKB-AUDIT-MAPPING-CLEANUP-PLAN.md` (Grok audit, 421 lines, 20KB)

---

## Context

Following a systematic audit of the SEKB workspace, the following structural problems were identified and measured:

### Quantified Problems at Time of Audit

| Problem                                     | Measurement                                     |
| ------------------------------------------- | ----------------------------------------------- |
| Total active workspace                      | 27 files, 18,194 lines                          |
| Legacy bloat (active, not archived)         | 4 files + 1 deprecated = **308 KB**             |
| Enterprise Laws L-01..L-10 found in         | **20 of 27 files**                              |
| Files claiming "RATIFIED CANONICAL SSOT"    | **7 different files** (authority conflict)      |
| Broken folder references in AI instructions | **5 references** to non-existent paths          |
| `.cursorrules` completeness                 | 13 lines — missing L-01..L-10, no loading order |

### Root Cause

The SEKB workspace evolved iteratively without a cleanup pass. Old canonical documents (`01_database-SSOT.md` v5.0.1, `00_constitution-ref.md` v5.0.1) remained active alongside their replacements (`Layer-2-Database-SSOT-v5.0.2.md`, `Layer-1-Constitution-v5.0.2.md`), causing AI agents and engineers to encounter conflicting authority claims.

The `docs/ai-ide/SEKB-AI-Agent-Instructions.md` referenced folder paths (`layers/`, `artifacts/SEKB/`) that did not exist at the time, making the AI loading order instructions incorrect. (Paths have since been standardized to `docs/layers/`, `docs/volumes/`, etc.)

---

## Decision

Execute a four-phase cleanup as documented in `00-SEKB-AUDIT-MAPPING-CLEANUP-PLAN.md`:

### Phase 1 — Archive Legacy Bloat (Executed 2026-06-25)

Move 5 files to `archive/` (not delete — git history preserved):

| File                                              | Lines | Superseded By                                                                   |
| ------------------------------------------------- | ----- | ------------------------------------------------------------------------------- |
| `01_database-SSOT.md`                             | 4,219 | `Layer-2-Database-SSOT-v5.0.2.md`                                               |
| `00_constitution-ref.md`                          | 1,523 | `Layer-1-Constitution-v5.0.2.md`                                                |
| `SEKB-v1.0-Complete.md`                           | 822   | All `volumes/00..10-*.md` volumes (folder previously named SEKB/, now volumes/) |
| `03-engineering.md` (root)                        | 758   | `volumes/03-engineering.md` (folder previously named SEKB/)                     |
| `volumes/02_engineering-kb.md` (previously SEKB/) | 1,004 | `volumes/03-engineering.md` (folder previously named SEKB/)                     |

### Phase 2 — Fix AI Agent Instructions (Executed 2026-06-25)

- Rewrite `docs/ai-ide/SEKB-AI-Agent-Instructions.md` v5.1.1 with correct folder structure
- Expand `.cursorrules` from 13 to ~80 lines with full L-01..L-10 table, loading order, DB rules
- Update `README.md` to fix stale filename references and add loading order callout

### Phase 3 — Authority Headers in SEKB Volumes (Executed 2026-06-25)

Add "Canonical Source" blockquote to Overview of volumes: 01, 02, 03, 04, 06, 07, 08.  
Pattern: Each volume declares which Layer section is the definition source, and that the volume adds implementation detail only.

### Phase 4 — Structural Governance

Create `archive/README.md` with:

- Explicit "DO NOT LOAD" warning for AI agents
- Archived file manifest with supersession mapping
- Canonical replacement pointers

---

## Consequences

### Positive

- **-45% workspace lines**: 18,194 → ~9,942 active lines
- **-58% active size**: ~530 KB → ~220 KB
- **0 broken folder references** in AI instructions (was: 5)
- **0 authority conflicts**: Only Layer-1/2/3 may claim "RATIFIED SSOT"
- **SEKB volumes now declare their authority source** — clear hierarchy for AI agents
- **`.cursorrules` complete**: AI agents get L-01..L-10 + loading order on fresh context

### Neutral

- `archive/` directory created — adds minor workspace noise but provides historical reference
- Git history preserves all content of archived files

### Non-Goals (Out of Scope for this ADR)

- Slimming SEKB volume content line-by-line (P2 in plan — deferred to next cleanup cycle)
- Reconciling any substantive content differences between archived and live documents
- Changing any Enterprise Law definitions

---

## Alternatives Considered

| Alternative                       | Rejected Because                                            |
| --------------------------------- | ----------------------------------------------------------- |
| Delete legacy files entirely      | Git history loss; forensic value lost; unnecessary risk     |
| Keep all files, just add warnings | Agents still load all files; context window bloat continues |
| Merge all into one giant file     | Opposite of the Layered SSOT goal; kills selective loading  |

---

## Review

This ADR does not change any Enterprise Law, architectural principle, or canonical ontology.  
It is a **structural cleanup** and requires no RFC per Volume 06 Part 3.1.

**Approved by:** Architecture Board  
**Effective:** 2026-06-25

---

_References:_  
_`00-SEKB-AUDIT-MAPPING-CLEANUP-PLAN.md` | `ADR-001` (foundation) | `ADR-002` (L-06)_
