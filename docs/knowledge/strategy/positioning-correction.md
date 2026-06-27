# Architectural Correction — Product Positioning Reset

**Date:** 2026-06-25  
**Status:** Applied

## What Changed

The platform positioning had drifted toward a generic "Enterprise Operating System" / "Enterprise Knowledge Base" framing with heavy emphasis on internal engineering philosophy (sovereignty, constitution, immutable as brand story, Quiet Power, Stoic Ledger as public identity).

This correction resets the public product category and external messaging to the original operational focus:

**Moventios**

The customer buys help running events, projects, venues, and related operations — not an "OS", not a philosophy, not an immutable universe.

## What Stays Internal

- Layer 1, Layer 2, Layer 3 (engineering SSOT)
- Technical terms like immutability, RLS, event sourcing, sovereignty as architectural principle, Stoic as internal UX philosophy
- These belong in `docs/layers/`, architecture docs, and internal volumes.

## What Moves to External / Strategy

- Focus on operational outcomes: easier coordination, reliable execution, visibility, accountability, auditability.
- Category: Moventios.
- Messaging leads with how the platform helps run real events and projects.

## Files Updated in This Pass

- README.md (public entry point)
- docs/ai-ide/EKB-AI-Agent-Instructions.md (AI agent guidance — see separate review)
- docs/strategy/02-category-definition.md
- docs/strategy/01-enterprise-product-strategy.md
- docs/strategy/positioning-statement.md
- docs/strategy/messaging-framework.md
- docs/strategy/brand-canvas.md (public-facing parts)
- docs/strategy/lean-canvas.md (problem / UVP sections)
- docs/strategy/06-value-proposition-canvas.md
- docs/volumes/07-business.md and 08-product.md (product-facing volume headers and intros)

Other strategy files were reviewed; further updates can continue in the same direction.

## Ongoing Rule

Before publishing or expanding any brand, product, or marketing document, ask:

> "Does this make it clearer how the platform helps run events and projects easier, faster, safer, or more profitably?"

If the answer is primarily about internal architecture or philosophy, move it to the appropriate internal section.

This correction supersedes prior "Enterprise OS" explorations for public positioning.

Internal engineering work (Layers, volumes focused on implementation) continues unchanged.
