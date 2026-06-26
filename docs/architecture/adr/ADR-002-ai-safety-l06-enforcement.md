# ADR-002: AI Safety Law (L-06) — MCP Tool Level Enforcement Mechanism

**Status:** ACCEPTED  
**Date:** June 25, 2026  
**Decision Makers:** Lead Architect, AI Engineering Lead, Security Architect  
**Authority:** Constitution Part 16 (AI Reference Architecture), Constitution Part 9 (L-06)

---

## Context

The AI Safety Law (L-06) states:

> "AI agents cannot directly write to financial tables, ownership records, or critical workflows. All WRITE actions must create an `Approval` row with status `Pending` and go through human review **BEFORE** any state transition."

The question that required a formal decision was: **How exactly is L-06 enforced at the MCP tool boundary?**

Without a precise enforcement mechanism, L-06 becomes an honor system — AI agents (or their implementors) could inadvertently bypass it. The platform needed a deterministic, code-enforceable model.

## Decision Drivers

- **L-06 is non-bypassable**: "No bypass based on confidence score or model capability" (Constitution Part 9, L-06).
- **MCP (Model Context Protocol)** is the exclusive interface for AI agents to interact with Sovereign OS (Layer 3 EPXA Part 10, Constitution Part 16.1).
- **Zero trust principle**: Every action, including AI actions, must be authenticated, authorized, and auditable at every boundary.
- **Immutable audit trail**: All AI actions must be traceable via `trace_id` and appear in the `approvals` table.

## Considered Options

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: Application-level trust** | AI agent code checks role before writing | Simple to implement | Bypassable; no database-level enforcement |
| **B: RLS-only enforcement** | Database RLS blocks AI agent user from mutating sensitive tables | Database-native | Too coarse; can't distinguish AI from human intent dynamically |
| **C: MCP Tool Levels (Chosen)** | Three access tiers enforced in MCP tool handler code + Approval stored procedure | Explicit, auditable, deterministic, cannot be bypassed from LLM context | Requires careful tool implementation |

## Decision

**Chosen Option:** C — Three-Tier MCP Tool Access Level system enforced at the tool handler boundary.

### The Three Levels

#### Level 0 — FORBIDDEN (Never callable by AI agents)
Direct financial mutations, ownership transfers, and permanent data destruction.

| Tool / Action | Reason |
|--------------|--------|
| `PostJournalEntry` (direct) | Financial state is immutable L-02; AI must never post directly |
| `CapturePayment` (direct) | Fund capture has irreversible financial consequences |
| `IssueInvoice` (direct) | Creates financial obligation; requires human intent |
| `TransferAssetOwnership` | Ownership change is a legal act |
| `DeleteRecord` (hard delete) | Violates L-03 (Soft Delete Everywhere) |
| `PurgeData` | Data destruction; GDPR compliance requires human sign-off |

**Enforcement**: MCP tool registry does not expose these as callable tools. They exist only as internal Command Handlers accessible to authenticated human actors.

---

#### Level 1 — WRITE→PENDING (AI callable; automatically creates Approval)
Material writes that are permitted to be proposed by AI, but require explicit human confirmation before state transition occurs.

| Tool | Effect | Approval Assignee |
|------|--------|------------------|
| `draft_journal_entry` | Creates JournalEntry with status=`draft` (not posted) | `finance:auditor` |
| `issue_access_pass` (AI actor) | Creates AccessPass with status=`pending` (Approval blocks issuance) | `commerce:manager` |
| `cancel_booking` (AI actor) | Creates cancellation Approval; booking remains active until approved | `tenant:admin` |
| `revoke_access_pass` (AI actor) | Creates revocation Approval | `commerce:manager` |
| `create_approval_request` | Creates any custom Approval record | `tenant:admin` |
| `initiate_refund` (AI actor) | Creates refund Approval; payment not touched until approved | `finance:auditor` |

**Enforcement**: MCP tool handler calls `create_ai_approval_pending()` stored procedure:
```sql
-- Called automatically by Level 1 MCP tool handlers
CREATE OR REPLACE FUNCTION create_ai_approval_pending(
  p_agent_id UUID,
  p_tool_name VARCHAR,
  p_proposed_action JSONB,
  p_trace_id UUID
) RETURNS UUID AS $$
DECLARE
  v_approval_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO approvals (
    id, workflow_instance_id, assigned_to, status, context, created_at
  ) VALUES (
    v_approval_id,
    NULL, -- standalone approval, no workflow instance
    (SELECT assigned_approver FROM mcp_tool_registry WHERE tool_name = p_tool_name),
    'pending',
    jsonb_build_object(
      'agent_id', p_agent_id,
      'tool', p_tool_name,
      'proposed_action', p_proposed_action,
      'trace_id', p_trace_id,
      'created_at', NOW()
    ),
    NOW()
  );
  RETURN v_approval_id;
END;
$$ LANGUAGE plpgsql STRICT;
```

The MCP tool handler returns the `approval_id` to the LLM context. The LLM informs the user that an Approval has been created and is pending human review. **No state is mutated.**

---

#### Level 2 — ALLOWED (AI callable; no approval required)
Read-only operations and status queries.

| Tool | Effect |
|------|--------|
| `search_knowledge_base` | Returns document chunks from KnowledgeBase |
| `get_ledger_balance` | Returns Account balances (read-only) |
| `get_booking_status` | Returns Booking current state |
| `get_event_availability` | Returns pass tier capacity and availability |
| `get_invoice_summary` | Returns Invoice + Payment status |
| `get_workflow_instance` | Returns WorkflowInstance state |
| `get_payment_status` | Returns Payment current state |
| `list_pending_approvals` | Returns pending Approvals for a user |
| `get_tenant_summary` | Returns tenant metadata |
| `get_event_sales` | Returns sales analytics |
| `get_access_pass` | Returns AccessPass state + QR validity |

**Enforcement**: MCP tool handler executes read-only SQL with RLS in force (tenant_id from AI agent's JWT claim). No INSERT/UPDATE/DELETE permitted.

---

### Enforcement Architecture

```
AI Agent (LLM Context)
        │
        │ calls MCP tool via JSON-RPC
        ▼
MCP Tool Handler (application layer)
        │
        ├─ Level 0? → REJECT immediately (tool not in registry for AI actors)
        │
        ├─ Level 1? → call create_ai_approval_pending()
        │              → return { approval_id, status: 'pending', message: 'Awaiting human approval' }
        │              → NO state mutation
        │
        └─ Level 2? → execute read-only SQL query via RLS-enforced connection
                      → return results
                      → NO state mutation

Human Actor (web UI / admin console)
        │
        │ reviews Approval in WorkflowStatusView
        │
        ├─ APPROVE → ResolveApproval command → ApprovalResolved event
        │            → actual state mutation executes
        │
        └─ REJECT → ApprovalResolved (rejected) → proposal discarded, AI notified
```

## Consequences

### Positive
- **Mathematically non-bypassable**: The LLM never receives a tool that can mutate material state directly. The tool level is enforced in server-side tool handler code, not in the prompt.
- **Complete audit trail**: Every AI proposal creates a row in `approvals` with `agent_id`, `tool`, `proposed_action`, and `trace_id`.
- **Human sovereignty preserved**: No AI action takes effect without explicit human resolution.
- **Confidence-score-independent**: Even a 99.9% confident recommendation still goes through Approval.

### Negative / Trade-offs
- **Latency for Level 1 actions**: Human approval introduces asynchronous delay. *Mitigation: Approval dashboard with real-time notifications; SLA targets for approval response time defined in Volume 05.*
- **Implementation burden**: Every MCP tool handler must correctly enforce the level. *Mitigation: Shared MCP tool middleware that reads level from `mcp_tool_registry` table; Level enforcement is not hand-coded per tool.*

### Neutral
- AI agents operating at Level 2 (read-only) experience no additional friction. The majority of AI agent interactions are read-only.

## Enterprise Laws Impacted

| Law | Impact | Enforcement |
|-----|--------|-------------|
| L-06: AI Write Interception | This ADR defines the implementation | MCP tool handler code + `create_ai_approval_pending()` stored procedure |
| L-02: Immutable Financial History | Level 0 prevents AI from ever touching financial mutation commands | Tool not in AI-callable registry |
| L-04: Idempotency Mandate | Level 1 approval proposals carry `trace_id`; same proposal idempotent if same `trace_id` | Unique constraint on `(agent_id, tool_name, trace_id)` in approvals |
| L-07: Command Handler Mandate | Level 1 tools create Approvals; actual Command execution only happens post-approval | No DML from LLM context; Command Handler executes after ApprovalResolved |

## Cross-References

- [Constitution Part 9, L-06]: The law being implemented
- [Constitution Part 16.1]: MCP Tool Safety Levels (source for this ADR)
- [Volume 04]: Full AI Architecture specification derived from this ADR
- [Volume 06]: Enterprise Law enforcement documentation referencing this ADR
- [Volume 02, Context 5]: Workflow & Operations context — Approval entity

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2026-06-25 | AI Engineering Lead + Lead Architect | Initial draft — accepted unanimously |

---

*This ADR is immutable. Any change to MCP Tool Level boundaries requires a new RFC → EAB vote → ADR.*
