# Recommended Engineering Architecture

**Platform**: AI-Native Project & Event Operations Platform

## Core (Align with Current Layers)

- DDD with bounded contexts: Events, Projects, Resources, Finance, AI.
- Hexagonal + CQRS + Event Sourcing (for auditability, from Layer 2/3).
- Workflow: Trigger.dev/n8n + Temporal for complex (inspired by OSS).
- Multi-tenant: RLS + isolation.
- Extensibility: Plugin/API-first.

## AI Layer

- RAG with pgvector.
- Agents for ops (using LangGraph etc.).

See OSS map and stack for sources (Pretix, Plane, n8n, Supabase patterns).

This supports the platform without over-engineering.
