# Recommended UX Architecture

**Platform**: AI-Native Project & Event Operations Platform

## Core Principles
- Stoic/dense: High information density, low noise (inspired by current Stoic UX and enterprise tools like Linear/Plane).
- Ops-first: Designed for coordinators, not consumers.
- AI-augmented: Contextual AI in views (suggestions, insights) without taking control.
- Mobile/field friendly.

## Key Views (from benchmarks)
- Dashboard: Mission control with KPIs, alerts, AI insights (like Glean dashboards + ops boards).
- Timeline/Calendar: Combined Gantt + calendar for events/projects (OpenProject + Cal.com).
- Resource Allocator: Visual with conflict detection (custom or inspired by booking tools).
- Kanban/Boards: Tasks with event/project context (Plane style).
- Finance Ledger: Immutable view with projections.
- AI Copilot: Sidebar or modal for planning/optimization.

## Components
- Dense tables (TanStack Table like in current).
- Forms with validation for bookings, resources.
- Real-time updates.

See research for details.