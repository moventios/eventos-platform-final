# ADR-001: SEKB — Evolution from Three SSOTs to Enterprise Knowledge Base

**Status:** ACCEPTED  
**Date:** June 25, 2026  
**Decision Makers:** Lead Architect, Enterprise Architecture Review Board (EAB)  
**Authority:** Volume 00 Section 2, Constitution Part 1 (Platform Manifesto)

---

## Context

Moventios previously operated with three canonical source documents:
- **Layer 1:** Platform Constitution — Governance, principles, ontology, laws, state machines
- **Layer 2:** Enterprise Database SSOT — Physical schema, RLS, stored procedures, enums
- **Layer 3:** EPXA (Enterprise Product Experience Architecture) — Technology stack, bounded contexts, traceability, DX rules

While these three documents established a solid canonical foundation, they were insufficient to serve as the complete operational brain of Moventios for the following reasons:

1. **Coverage gaps**: Architecture, engineering, product, operations, governance, business, and AI agents each required specialized documentation that the three SSOTs did not provide at the depth needed.
2. **AI consumption friction**: The three-document model was not optimally structured for AI IDE agents (Cursor, Claude, Copilot, Antigravity) to efficiently load targeted context.
3. **10-15 year horizon**: A three-document foundation could not absorb the evolution of a platform targeting a decade of operation without becoming a monolithic, unmaintainable blob.
4. **No ADR/RFC governance**: Architectural decisions were embedded in documents without formal immutable decision records.
5. **Missing operational depth**: SRE runbooks, compliance procedures, business capability models, and product experience standards had no authoritative home.

## Decision Drivers

- **10-15 year reliability requirement**: Knowledge base must outlive individual engineers, teams, and AI models.
- **AI-first consumption**: Context loading must be deterministic and volume-targeted (Volume 00 → Layer 1 → Relevant Volume, as specified in Volume 00 Section 5.1).
- **Enterprise Law L-05 (No Orphan Entities)**: No documentation topic should be orphaned without an authoritative owner and volume.
- **Governance completeness**: Enterprise Laws (L-01 through L-10) require dedicated enforcement documentation.
- **Audit readiness**: External auditors and regulators must be able to navigate without tribal knowledge.

## Considered Options

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: Three SSOTs only** | Maintain Layer 1/2/3 as sole documentation | Simple, minimal overhead | Cannot cover governance, ops, product, business depth; AI context loading inefficient |
| **B: Single mega-document** | Merge all documentation into one canonical document | Single file to load | Unmaintainable; update cadences conflict; AI token limits exceeded |
| **C: 10-Volume SEKB (Chosen)** | Structured knowledge base with defined volumes, living catalogs, and immutable foundation | Scalable, audience-targeted, AI-optimized, maintainable | Higher initial authoring effort; requires volume ownership governance |

## Decision

**Chosen Option:** C — 10-Volume Enterprise Knowledge Base (SEKB) built on top of the three immutable canonical foundation layers.

The SEKB structure provides:
- **Volume 00**: Meta-architecture (how to use the SEKB itself)
- **Volumes 01–10**: Specialized domains with clear ownership and update cadences
- **Living Catalogs**: Event Catalog, API Catalog, MCP Tool Registry, Prompt Registry, ADR Repository, RFC Repository, Runbook Catalog
- **Immutable Foundation**: Layers 1–3 remain the absolute authority; no volume may contradict them

Conflicts between volumes are resolved by referring to Layer 1 as the highest authority.

## Consequences

### Positive
- AI agents can load exactly the context relevant to their task without reading the entire knowledge base.
- Each volume has a defined owner, update cadence, and approval process (Volume 00 Section 4.1).
- Architectural decisions are now immutably recorded in ADRs; no more knowledge embedded only in individuals.
- External auditors and regulators can navigate by volume without tribal knowledge.
- Terminology enforcement is centralized in Volume 01 with CI/CD gates.
- The SEKB can absorb 10+ years of platform evolution through versioning, deprecation, and RFC governance.

### Negative / Trade-offs
- **Higher authoring effort**: Building 10 volumes requires significant upfront investment. *Mitigation: Phased delivery per Volume 00 Section 6 roadmap.*
- **Governance overhead**: Volume ownership and approval processes add coordination cost. *Mitigation: Lightweight approval for minor patches; RFC only for structural changes.*
- **Synchronization risk**: Volumes may drift from foundation layers over time. *Mitigation: CI/CD terminology gates + quarterly ARB review via Volume 10.*

### Neutral
- The three foundation layers (Layer 1/2/3) remain unchanged in authority and structure; SEKB builds on top of them without modifying them.

## Enterprise Laws Impacted

| Law | Impact | Enforcement |
|-----|--------|-------------|
| L-05: No Entity Without Owner | Every volume now has an explicit owner (Volume 00, Table 3.1) | Volume ownership table enforced at PR review |
| L-06: AI Write Interception | SEKB instructs AI agents explicitly; Volume 04 details MCP enforcement | AI agent instructions in `docs/ai-ide/SEKB-AI-Agent-Instructions.md` |
| L-09: API Versioning | Volume versioning follows semantic versioning with 90-day deprecation notices | Volume 00 Section 4.2 |

## Cross-References

- [Volume 00, Section 2]: Strategic evolution from three SSOTs to SEKB
- [Volume 00, Section 3]: SEKB document taxonomy (10 volumes + living catalogs)
- [Volume 00, Section 4]: Knowledge governance model
- [Constitution Part 1]: Platform manifesto and direction

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2026-06-25 | Lead Architect + EAB | Initial draft — accepted by EAB vote |

---

*This ADR is immutable. Future structural changes to the SEKB taxonomy require a new RFC → ADR process.*
