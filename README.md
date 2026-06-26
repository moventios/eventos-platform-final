# Event & Project Operations Platform

**Documentation and Knowledge Base**

This repository contains the documentation, strategy, architecture, and knowledge base for an Event & Project Operations Platform.

The platform helps organizations plan, coordinate, execute, monitor, and audit real-world operations involving events, venues, projects, teams, logistics, schedules, resources, assets, vendors, finance, payments, approvals, and documentation.

## What This Platform Solves

It reduces operational chaos, improves reliability, increases visibility and accountability, and provides strong auditability for teams running projects and events.

## Repository Structure

The content is organized to separate public-facing product and strategy information from internal engineering details.

## Repository Structure

```
.
├── README.md
├── .cursorrules                  # AI IDE rules + essential mapping (start here for agents)
├── docs/
│   ├── layers/                   # The 3 Canonical Layers (SSOT)
│   ├── volumes/                  # 10 Knowledge Volumes
│   ├── ai-ide/
│   └── architecture/             # ADRs and RFCs
└── archive/                      # Historical and superseded (never use)
```

## For Humans / Developers

- Start with the product strategy and category in `docs/strategy/`.
- Use `docs/volumes/` for detailed guidance on capabilities.
- Use `docs/layers/` only when you need the internal engineering architecture.
- Significant changes to product direction should be captured as decisions (see `docs/architecture/adr/`).

## For AI IDE Agents

**Load the fewest files possible.**

1. `.cursorrules` (contains rules + mapping)
2. `docs/ai-ide/EKB-AI-Agent-Instructions.md`
3. `docs/strategy/` files (for positioning, category, messaging)
4. Specific `docs/volumes/{relevant}.md` only when needed for domain details
5. `docs/layers/` only for deep architecture questions

**Never** load the entire `docs/volumes/` or `docs/layers/` folders blindly.

See `.cursorrules` for the current recommended context order.

## Structure Philosophy

Public/product content (strategy, positioning, how the platform helps run events and projects) lives in `docs/strategy/`.

Internal engineering and detailed knowledge lives in `docs/layers/` and `docs/volumes/`.

This separation keeps the product identity clear and the engineering foundation strong.
