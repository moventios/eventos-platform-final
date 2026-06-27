# Information Architecture — Enterprise Knowledge Base (EKB)

## Principles (from current Layers and best practices)

- Deterministic and traceable
- Layered authority (Layers > Volumes)
- AI-friendly (minimal context, clear map in .cursorrules)
- Human readable and navigable
- Single source with cross-references

## Current Structure (as of audit)

- Root: README (overview), .cursorrules (AI entry + map)
- docs/layers/ : Layer-1 (Constitution), Layer-2 (DB SSOT), Layer-3 (EPXA)
- docs/volumes/ : 00-10 Knowledge Volumes (practical extensions)
- docs/ai-ide/ : EKB-AI-Agent-Instructions.md
- docs/architecture/ : ADRs, RFCs, Templates
- archive/ : Historical

## Proposed Enhanced Structure

To support full enterprise (Product, Brand, Business, Marketing, Engineering, AI, Governance):

docs/
├── layers/ # SSOT (unchanged)
├── volumes/ # Existing + new
│ ├── 00-knowledge-architecture.md
│ ├── ... (existing)
│ ├── 11-brand.md (new)
│ ├── 12-marketing.md (new)
│ └── ...
├── brand/ # Brand specific
│ ├── brand-canvas.md
│ ├── brand-strategy.md
│ ├── brand-voice.md
│ └── brand.md (AI context file inspired by references)
├── business/ # Business strategy
│ ├── business-model-canvas.md
│ ├── lean-canvas.md
│ ├── go-to-market.md
│ └── ...
├── product/ # Product
│ ├── positioning-statement.md
│ ├── product-narrative.md
│ ├── messaging-framework.md
│ └── ...
├── marketing/ # Marketing
│ ├── content-strategy.md
│ ├── developer-marketing.md
│ └── ...
├── engineering/ # Engineering specifics (from Layer 3 + more)
├── ai/ # AI specific (expand Volume 04)
├── governance/ # Governance (expand Volume 06)
├── operations/
├── developer/ # Developer portal content
├── customer/
├── security/
├── compliance/
├── roadmap.md
├── glossary.md
├── architecture/ # ADRs etc.
├── ai-ide/ # AI agent instructions (this file + .cursorrules)
└── meta/ or archive/ for historical

## Cross-Reference System

Use consistent syntax:

- [Layer 1 Part 3.2]
- [Volume 07 Business Model]
- [Brand Canvas]
- [EPXA Part 5]

All documents must link to their authority source.

## Ownership & Governance

- Layers: Architecture Board
- Brand/Business/Product: Product + Brand lead (to be defined)
- Engineering volumes: Platform Engineering
- AI: AI Engineering Lead
- Marketing: To be assigned

Versioning: Follow current (minor for clarifications, major for RFC).

## AI IDE Optimization

- Primary: .cursorrules (rules + map)
- Secondary: docs/ai-ide/EKB-AI-Agent-Instructions.md
- Then specific Layer or Volume as directed by the map.

Never load entire volumes folder.

## Next Steps

- Implement new folders and documents from this audit.
- Update all existing volumes to use neutral language and link to new brand/business sections.
- Create brand.md following reference best practices.

This IA supports 10+ years of evolution and AI agent consumption.
