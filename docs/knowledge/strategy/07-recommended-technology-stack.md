# Recommended Technology Stack

**Platform**: AI-Native Project & Event Operations Platform

## Core Stack (Build on Current EKB Layers)
- **Backend**: PostgreSQL + pgvector (for RAG/AI), Supabase or custom (auth, realtime, storage). Inspired by Supabase, Pretix (Postgres-heavy).
- **Frontend**: Next.js/React, shadcn/ui or similar (dense enterprise tables, calendars from FullCalendar patterns, Kanban from Plane).
- **Workflow/Orchestration**: Trigger.dev or n8n (visual + code workflows for approvals, scheduling). Temporal for complex durable execution.
- **AI**: LangGraph or CrewAI for agents (scheduling optimization, resource suggestion, document extraction). RAG with pgvector on event/project docs/knowledge.
- **Scheduling/Resource**: Custom with GiST for conflict detection (as in current spatial), inspired by Cal.com embed patterns + OpenProject Gantt.
- **Finance**: Custom immutable ledger (as in Layer 2), double-entry, inspired by ERPNext/Akaunting but focused.
- **Extensibility**: API-first + plugin system (like Strapi/Directus or ERPNext modules).

## Why This
- Matches OSS successes: Postgres for reliability (ERPNext, Supabase), modern React for UX (Plane, Cal.com), workflow tools for ops (n8n, Trigger).
- AI-native: pgvector + agent frameworks directly support RAG and agents.
- Scalable, self-host friendly, audit-grade.

## Build vs Buy
- Build: Core event/project model, AI agents, unified audit.
- Buy/Integrate: Auth (if not Supabase), payments (Stripe adapters), basic calendar libs.

See build-vs-buy-matrix.md for details.