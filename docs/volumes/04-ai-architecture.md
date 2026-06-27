# Volume 04: AI Architecture

## Moventios Enterprise Knowledge Base

**LLM Agent Governance, MCP Tool Registry, RAG Pipeline & Safety Enforcement**

**Version:** 5.1-ENTERPRISE  
**Status:** RATIFIED  
**Date:** June 25, 2026  
**Authority:** Constitution Part 16 (AI Reference Architecture) | EPXA Parts 5, 10 | ADR-002  
**Owner:** AI Engineering Lead

---

## Overview

> **Canonical Source:** L-06 AI Safety Law ada di [Layer-1-Constitution-v5.0.2.md](../Layer-1-Constitution-v5.0.2.md) Part 9. Enforcement architecture diputuskan via [ADR-002](../architecture/adr/ADR-002-ai-safety-l06-enforcement.md).  
> Volume ini menyediakan **implementation details**: MCP registry, RAG pipeline, semantic cache, prompt management, cost metering — yang tidak ada di Layer-1. Bila ada konflik L-06 definition, Layer-1 + ADR-002 menang.

Volume 04 defines the **complete AI architecture** of Moventios — from the cognitive safety model (L-06) down to the embedding vector dimensions and semantic cache TTL values.

AI in Moventios is **not a chatbot feature**. It is a background cognitive routing engine operating under strict guardrails that make it mathematically incapable of directly mutating material state. Every AI capability is designed around three axioms:

1. **AI reads, humans decide**: AI agents have unrestricted READ access to business knowledge. Any WRITE that matters requires explicit human approval.
2. **Deterministic over probabilistic**: Prompt drift, model version changes, and hallucination risks are mitigated through versioned prompts, evaluation harnesses, and approval gates.
3. **Tenant-isolated cognition**: Every AI call carries `tenant_id` from JWT context. AI agents cannot cross tenant boundaries.

[Authority: Constitution Part 16, L-06, ADR-002]

---

## Part 1: AI Safety Architecture (L-06 Implementation)

### 1.1 The AI Safety Principle

From Constitution Part 9 (L-06):

> "AI agents never directly write to financial tables, ownership records, or critical workflows. All WRITE actions must create an `Approval` row with status `Pending` that waits for human confirmation **BEFORE** any state transition."

There is **no confidence score threshold** that bypasses this. An AI agent with 100% certainty still goes through Approval for material writes.

### 1.2 MCP Tool Registry (Complete)

The **Model Context Protocol (MCP)** is the exclusive interface between AI agents and Moventios. No AI agent may interact with business data through any other channel.

[Authority: ADR-002, Constitution Part 16.1]

#### Level 0 — FORBIDDEN (Not in AI Registry)

These tools do not exist in the AI-callable registry. They are internal Command Handlers accessible only to authenticated human actors.

| Command                      | Reason Blocked                                  |
| ---------------------------- | ----------------------------------------------- |
| `PostJournalEntry` (direct)  | Immutable financial state (L-02); no AI posting |
| `CapturePayment` (direct)    | Irreversible fund movement                      |
| `IssueInvoice` (direct)      | Creates financial obligation                    |
| `TransferAssetOwnership`     | Legal ownership change                          |
| `DeleteRecord` (hard)        | Violates L-03                                   |
| `PurgeData`                  | GDPR compliance requires human sign-off         |
| `ChangeAccountOwner`         | Ownership transfer                              |
| `GrantMembership` (elevated) | Security-critical IAM change                    |

---

#### Level 1 — WRITE→PENDING (AI Callable; Creates Approval)

```typescript
// MCP Tool Handler Pattern for Level 1 Tools
class MCPToolHandler {
  async handleLevel1Tool(
    toolName: string,
    agentId: UUID,
    proposedAction: object,
    traceId: UUID,
  ): Promise<{ approvalId: UUID; status: 'pending'; message: string }> {
    // 1. Validate agent is active and not disabled
    const agent = await this.aiAgentRepo.getById(agentId);
    if (agent.status !== 'running') throw new Error('Agent not active');

    // 2. Create Approval record (no state mutation)
    const approvalId = await this.db.execute('SELECT create_ai_approval_pending($1, $2, $3, $4)', [
      agentId,
      toolName,
      JSON.stringify(proposedAction),
      traceId,
    ]);

    // 3. Emit event (for notification to approver)
    await this.eventBus.publish({
      type: 'ApprovalRequested',
      payload: { approvalId, agentId, toolName, traceId },
    });

    // 4. Return pending status to LLM — NO mutation has occurred
    return {
      approvalId,
      status: 'pending',
      message: `Action "${toolName}" has been submitted for human review. Approval ID: ${approvalId}`,
    };
  }
}
```

| Tool Name                  | Proposed Action                                 | Approval Assignee  | Timeout |
| -------------------------- | ----------------------------------------------- | ------------------ | ------- |
| `draft_journal_entry`      | Creates JournalEntry (status=draft; not posted) | `finance:auditor`  | 24h     |
| `issue_access_pass`        | Issues AccessPass (Pending Approval status)     | `commerce:manager` | 1h      |
| `cancel_booking`           | Proposes booking cancellation                   | `tenant:admin`     | 4h      |
| `revoke_access_pass`       | Proposes pass revocation                        | `commerce:manager` | 2h      |
| `create_approval_request`  | Creates generic approval                        | `tenant:admin`     | 24h     |
| `initiate_refund`          | Proposes refund                                 | `finance:auditor`  | 8h      |
| `update_ticket_type_price` | Proposes price change for TicketType            | `commerce:manager` | 4h      |
| `apply_discount`           | Proposes discount application to Invoice        | `finance:auditor`  | 4h      |
| `suspend_user_membership`  | Proposes Membership suspension                  | `tenant:admin`     | 2h      |

---

#### Level 2 — ALLOWED (Read-Only; No Approval)

| Tool Name                | SQL Access                                           | Returns                            |
| ------------------------ | ---------------------------------------------------- | ---------------------------------- |
| `search_knowledge_base`  | `SELECT` on `chunks`, `embeddings` (RLS enforced)    | Ranked document chunks             |
| `get_ledger_balance`     | `SELECT` on `ledger_summary_view` (RLS)              | Account balances                   |
| `get_booking_status`     | `SELECT` on `bookings` (RLS)                         | Booking state + details            |
| `get_event_availability` | `SELECT` on `pass_tiers` (RLS)                       | Capacity + issued count            |
| `get_invoice_summary`    | `SELECT` on `invoices` + `invoice_lines` (RLS)       | Invoice + line items               |
| `get_payment_status`     | `SELECT` on `payments` (RLS)                         | Payment state + gateway ref        |
| `get_workflow_instance`  | `SELECT` on `workflow_instances` + `approvals` (RLS) | Instance state + pending approvals |
| `list_pending_approvals` | `SELECT` on `approvals WHERE status='pending'` (RLS) | Approval queue for user            |
| `get_tenant_summary`     | `SELECT` on `tenants` + `organizations` (RLS)        | Tenant metadata                    |
| `get_event_sales`        | `SELECT` on `event_sales_view` (RLS)                 | Sales analytics                    |
| `get_access_pass`        | `SELECT` on `access_passes` (RLS)                    | Pass state + QR validity           |
| `get_occupancy_metrics`  | `SELECT` on `booking_calendar_view` (RLS)            | Facility utilization               |
| `get_customer_history`   | `SELECT` on `customer_invoice_history_view` (RLS)    | Customer invoice + payment history |

### 1.3 MCP Tool Registry Table (Database)

```sql
CREATE TABLE mcp_tool_registry (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name         VARCHAR(100) UNIQUE NOT NULL,
  access_level      SMALLINT    NOT NULL CHECK (access_level IN (0, 1, 2)),
  -- 0=FORBIDDEN, 1=PENDING, 2=ALLOWED
  description       TEXT        NOT NULL,
  assigned_approver VARCHAR(100),  -- e.g., 'finance:auditor' (Level 1 only)
  approval_timeout_hours INT,      -- Hours before auto-reject (Level 1 only)
  input_schema      JSONB       NOT NULL,  -- JSON Schema for tool inputs
  output_schema     JSONB       NOT NULL,  -- JSON Schema for tool outputs
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Part 2: Prompt Management System

### 2.1 Prompt Governance Principles

1. **No hardcoded prompts**: All prompts are stored in `prompts` table, versioned, and loaded at runtime.
2. **Prompt drift prevention**: Version number increments on any template change; old version archived.
3. **Evaluation gate**: Prompts must pass automated evaluation before promotion to `active`.
4. **Guardrails as first-class citizens**: PII detection, hallucination reduction, and jailbreak prevention are configured per prompt.

### 2.2 Prompt Entity (From Volume 01 Part 2.6)

```sql
CREATE TABLE prompts (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID        NOT NULL REFERENCES tenants(id),
  name           VARCHAR(200) NOT NULL,
  version        INTEGER     NOT NULL DEFAULT 1,
  template       TEXT        NOT NULL,       -- Template with {{variable}} placeholders
  input_schema   JSONB       NOT NULL,       -- JSON Schema for injectable variables
  output_format  JSONB       NOT NULL,       -- JSON Schema for structured output
  target_model   VARCHAR(100) NOT NULL,      -- e.g., 'claude-3-5-sonnet', 'gpt-4o'
  guardrails     JSONB       NOT NULL DEFAULT '[]',  -- Active safety filters
  eval_score     NUMERIC(4,3),              -- 0.000–1.000 (must be >= 0.85 to activate)
  status         VARCHAR(20) NOT NULL DEFAULT 'draft',  -- draft | active | deprecated
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (tenant_id, name, version)
);
```

### 2.3 Guardrail Types

| Guardrail                   | Type                        | Effect                                                                             |
| --------------------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| `pii_detection`             | Pre/Post filter             | Masks PII in inputs/outputs before logging                                         |
| `hallucination_reduction`   | Temperature + system prompt | Forces citation of sources; `temperature ≤ 0.3`                                    |
| `jailbreak_prevention`      | System prompt injection     | Prepends constitutional constraint to every message                                |
| `output_schema_enforcement` | Post-generation validation  | Forces JSON Schema conformance; rejects malformed output                           |
| `financial_conservatism`    | System prompt + post-filter | Adds disclaimer to any financial projection; blocks dollar amounts without caveats |
| `tenant_boundary`           | Context injection           | Injects `tenant_id` and `tenant_context` to prevent cross-tenant reasoning         |

### 2.4 Prompt Lifecycle

```
[Draft] → [Evaluation Running] → [Active]
                                      └──► [Deprecated] (when new version activated)
```

**Promotion Rules:**

- `eval_score >= 0.85` (RAGAS-style evaluation: faithfulness, answer relevance, context precision)
- Human review completed (AI Engineering Lead sign-off)
- Guardrails configured (at minimum: `pii_detection` + `output_schema_enforcement`)
- A/B test against current active version if change is >10% template alteration

### 2.5 Prompt Template Example

Prompts are stored in the `prompts` table (never hardcoded in code or AI context).

Example structure (full templates loaded at runtime via MCP or application):

- `name`: e.g. `booking_recommendation_v2`
- `template`: Uses `{{variables}}` placeholders. Must be tenant-scoped.
- `input_schema`: JSON Schema for injectable vars.
- `guardrails`: Array (e.g. `['pii_detection', 'hallucination_reduction']`)
- `eval_score`: Must be >= 0.85 for promotion.
- `status`: draft | active | deprecated

See `prompts` table schema in Layer-2 and Volume 01 for canonical definition. Actual production templates are managed via the Prompt Management UI / API (not embedded here).

---

## Part 3: RAG Pipeline Architecture

### 3.1 Pipeline Overview

**Ingestion:**

- Upload → Text extraction → Recursive chunking (512 tokens, 64 overlap)
- Embed with text-embedding-3-large (1536 dims)
- Store in `chunks` + `embeddings` (pgvector HNSW, tenant-isolated via RLS)
- Emit `KnowledgeIndexed` event

**Retrieval:**

- Parallel: pgvector (semantic) + Typesense BM25 (lexical)
- Top-K candidates → Rerank (cross-encoder or LLM)
- Inject top context into prompt with strict tenant filter

Full implementation details and chunking strategy are in the application code (packages/ai/rag). This volume only defines the architecture contract.
▼
Merge & Deduplicate (Reciprocal Rank Fusion - RRF)
└─ Formula: RRF(d) = Σ 1 / (k + rank(d)) where k=60
│
▼
Reranking (Cohere Rerank or cross-encoder)
└─ Rerank top-20 merged candidates
└─ Final output: top-5 chunks (configurable per use case)
│
▼
Context Assembly
└─ Inject chunks into prompt template
└─ Include metadata: source document, chunk_index, relevance_score
│
▼
LLM Inference (via OpenRouter)
│
▼
Guardrail Post-Processing
└─ Schema validation (output_format JSON Schema)
└─ PII redaction from output
└─ Hallucination check (source grounding verification)
│
▼
Return structured response + citations

````

### 3.2 Embedding Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Model | `text-embedding-3-large` | 1536 dimensions; best accuracy for multilingual content |
| Dimensions | 1536 | Matches pgvector HNSW index configuration |
| Batch Size | 100 chunks per API call | Rate limit management; cost optimization |
| Index Type | HNSW | Faster approximate nearest-neighbor than IVFFlat for < 1M vectors |
| HNSW `m` | 16 | Build time/quality tradeoff (more connections = better recall) |
| HNSW `ef_construction` | 64 | Search recall during build; higher = better accuracy |
| Distance Function | Cosine similarity | Normalized embeddings; direction not magnitude |
| Chunk Size | 512 tokens | Balances context sufficiency vs. retrieval precision |
| Chunk Overlap | 64 tokens | Prevents sentence splits losing context at boundaries |

### 3.3 Database Schema (AI & Knowledge)

```sql
-- Chunks table (split document content)
CREATE TABLE chunks (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_version_id UUID        NOT NULL REFERENCES document_versions(id),
  chunk_index         INTEGER     NOT NULL,
  text_content        TEXT        NOT NULL,
  token_count         INTEGER     NOT NULL,
  metadata            JSONB       NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (document_version_id, chunk_index)
);

-- Embeddings table (vector representations)
CREATE TABLE embeddings (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id       UUID        NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  vector_data    vector(1536) NOT NULL,
  model_version  VARCHAR(100) NOT NULL,  -- e.g., 'text-embedding-3-large'
  status         VARCHAR(20)  NOT NULL DEFAULT 'generated',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE (chunk_id)  -- One embedding per chunk
);

-- HNSW index for fast approximate nearest neighbor search
CREATE INDEX idx_embeddings_hnsw_vector_cosine_ops
  ON embeddings USING hnsw (vector_data vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- RLS: Tenant isolation via document → knowledge_base → tenant
CREATE POLICY tenant_isolation_embeddings ON embeddings
  FOR ALL USING (
    chunk_id IN (
      SELECT c.id FROM chunks c
      JOIN document_versions dv ON c.document_version_id = dv.id
      JOIN documents d ON dv.document_id = d.id
      JOIN knowledge_bases kb ON d.knowledge_base_id = kb.id
      WHERE kb.tenant_id = auth.jwt()->>'tenant_id'::uuid
    )
  );
````

### 3.4 Hybrid Search Implementation

```typescript
// Hybrid search using Reciprocal Rank Fusion
async function hybridSearch(
  query: string,
  tenantId: UUID,
  knowledgeBaseId: UUID,
  topK: number = 5,
): Promise<SearchResult[]> {
  // Generate query embedding
  const queryVector = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: query,
  });

  // Parallel retrieval
  const [vectorResults, lexicalResults] = await Promise.all([
    // pgvector HNSW cosine similarity (top-20)
    db.execute(
      `
      SELECT c.id, c.text_content, c.metadata,
             (e.vector_data <=> $1) as distance
      FROM embeddings e
      JOIN chunks c ON e.chunk_id = c.id
      JOIN document_versions dv ON c.document_version_id = dv.id
      JOIN documents d ON dv.document_id = d.id
      WHERE d.knowledge_base_id = $2
      ORDER BY distance ASC
      LIMIT 20
    `,
      [JSON.stringify(queryVector.data[0].embedding), knowledgeBaseId],
    ),

    // Typesense BM25 lexical search (top-20)
    typesense
      .collections('chunks')
      .documents()
      .search({
        q: query,
        query_by: 'text_content',
        filter_by: `tenant_id:=${tenantId} && knowledge_base_id:=${knowledgeBaseId}`,
        num_results: 20,
      }),
  ]);

  // Reciprocal Rank Fusion (k=60)
  const k = 60;
  const scores = new Map<string, number>();

  vectorResults.rows.forEach((doc, rank) => {
    scores.set(doc.id, (scores.get(doc.id) || 0) + 1 / (k + rank + 1));
  });
  lexicalResults.hits.forEach((hit, rank) => {
    scores.set(hit.document.id, (scores.get(hit.document.id) || 0) + 1 / (k + rank + 1));
  });

  // Sort by RRF score, take top-20 for reranking
  const candidates = [...scores.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([id]) => findChunkById(id, vectorResults, lexicalResults));

  // Rerank (Cohere or cross-encoder)
  const reranked = await cohere.rerank({
    model: 'rerank-multilingual-v3.0',
    query,
    documents: candidates.map((c) => c.text_content),
    top_n: topK,
  });

  return reranked.results.map((r) => candidates[r.index]);
}
```

---

## Part 4: Semantic Caching Strategy

### 4.1 Cache Architecture (3-Layer)

```
L1 Cache: In-Process (Node.js Map / Go sync.Map)
  └─ TTL: 60 seconds
  └─ Scope: Single server process
  └─ Use: Identical query within same request batch

L2 Cache: Valkey (Redis-compatible)
  └─ TTL: 300 seconds (5 minutes)
  └─ Scope: All instances of same service
  └─ Use: Repeated read queries across requests
  └─ Key: hash(tenant_id + normalized_query)

L3 Cache: Semantic Similarity Cache (Valkey + pgvector)
  └─ TTL: 3600 seconds (1 hour)
  └─ Scope: Semantically similar queries (cosine similarity > 0.95)
  └─ Use: Equivalent queries with different phrasing
  └─ Strategy: Cache response if query embedding within 0.05 of cached query
```

### 4.2 Semantic Cache Implementation

```typescript
async function semanticCacheLookup(query: string, tenantId: UUID): Promise<CachedResponse | null> {
  const queryEmbedding = await generateEmbedding(query);

  // Check L2 Valkey exact match first (faster)
  const exactKey = `semantic:${tenantId}:${hashQuery(query)}`;
  const exactHit = await valkey.get(exactKey);
  if (exactHit) return JSON.parse(exactHit);

  // Check L3 semantic similarity
  const semanticHit = await db.execute(
    `
    SELECT cached_response, similarity
    FROM semantic_cache
    WHERE tenant_id = $1
      AND (query_embedding <=> $2) < 0.05  -- cosine distance threshold
      AND expires_at > NOW()
    ORDER BY (query_embedding <=> $2) ASC
    LIMIT 1
  `,
    [tenantId, JSON.stringify(queryEmbedding)],
  );

  if (semanticHit.rows.length > 0) {
    // Warm L2 cache for next hit (same query)
    await valkey.setex(exactKey, 300, semanticHit.rows[0].cached_response);
    return JSON.parse(semanticHit.rows[0].cached_response);
  }

  return null;
}
```

### 4.3 Cache Invalidation Rules

| Trigger                    | Cache Layer Invalidated                  | Reason                                 |
| -------------------------- | ---------------------------------------- | -------------------------------------- |
| `KnowledgeIndexed` event   | L2 + L3 for affected `knowledge_base_id` | New document changes retrieval results |
| `DocumentPublished` event  | L2 + L3 for affected `knowledge_base_id` | Content updated                        |
| `EmbeddingGenerated` event | L3 only (vectors changed)                | Re-indexed content has new embeddings  |
| Tenant deletion            | All layers for `tenant_id`               | Data no longer accessible              |

---

## Part 5: Agent Execution Flow

### 5.1 Complete Agent Request Lifecycle

```
User Input / Trigger
        │
        ▼
AIAgent Entity Loaded (status must be 'running', not 'disabled')
        │
        ▼
Budget Check
  └─ Check: daily_token_usage < max_daily_token_budget
  └─ If exceeded: return degraded response + emit BudgetExceeded event
        │
        ▼
Context Assembly
  └─ Inject: tenant_id, user context, conversation history (windowed)
  └─ Load: Active Prompt template from prompts table
  └─ RAG: hybridSearch() for relevant knowledge (if knowledge_base configured)
        │
        ▼
Semantic Cache Check (L1 → L2 → L3)
  └─ Cache HIT: return cached response (skip LLM call)
  └─ Cache MISS: proceed to LLM inference
        │
        ▼
LLM Inference (via OpenRouter)
  └─ Model: per agent configuration (claude-3-5-sonnet, gpt-4o, etc.)
  └─ Fallback: if primary model unavailable → configured fallback model
  └─ Timeout: 30s (configurable per agent)
  └─ OpenTelemetry span: 'ai.llm_inference'
        │
        ▼
Output Post-Processing
  └─ Schema validation (output_format JSON Schema)
  └─ PII redaction
  └─ Hallucination check (are citations present and valid?)
        │
        ▼
Tool Call? (function calling / tool use)
  ├─ Level 0: REJECT — log attempted forbidden tool call
  ├─ Level 1: handleLevel1Tool() → create Approval → return pending status
  └─ Level 2: execute read-only query → return data
        │
        ▼
Response Assembly
  └─ Final answer + citations + approval_id (if Level 1 tool was called)
        │
        ▼
Usage Tracking
  └─ Increment: ai_agents.daily_token_usage
  └─ Emit: AIRecommendationGenerated event (for analytics)
  └─ Write: to semantic cache (if cacheable)
        │
        ▼
OpenTelemetry Span Closed
  └─ Attributes: tenant_id, agent_id, model, token_usage, cost_usd, trace_id
  └─ Duration: logged for SLA tracking
```

### 5.2 OpenRouter Integration

```typescript
// Canonical OpenRouter client (not model-specific)
class OpenRouterLLMAdapter implements ILLMAdapter {
  async generate(req: LLMRequest): Promise<LLMResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await vault.read('secret/system/openrouter_key')}`,
        'X-Title': 'Moventios',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: req.model, // e.g., 'anthropic/claude-3-5-sonnet'
        messages: req.messages,
        temperature: req.temperature ?? 0.3,
        max_tokens: req.maxTokens ?? 2048,
        response_format: req.outputSchema ? { type: 'json_object' } : undefined,
      }),
    });

    const data = await response.json();

    // Fallback on model unavailability
    if (data.error?.code === 'model_unavailable') {
      return this.generate({ ...req, model: req.fallbackModel ?? 'openai/gpt-4o' });
    }

    return {
      content: data.choices[0].message.content,
      tokenUsage: data.usage,
      model: data.model,
      costUsd: this.calculateCost(data.usage, data.model),
    };
  }
}
```

### 5.3 Fallback Model Chain

```
Primary Model (per agent config)
  └─ Failure / unavailability
         ▼
Fallback Model 1 (same capability tier)
  └─ Failure
         ▼
Fallback Model 2 (lower tier, guaranteed available)
  └─ Failure
         ▼
Graceful Degradation (cached response or "service temporarily unavailable")
```

**Default Chains:**

| Primary                       | Fallback 1                    | Fallback 2                 |
| ----------------------------- | ----------------------------- | -------------------------- |
| `anthropic/claude-3-5-sonnet` | `openai/gpt-4o`               | `openai/gpt-4o-mini`       |
| `openai/gpt-4o`               | `anthropic/claude-3-5-sonnet` | `openai/gpt-4o-mini`       |
| `deepseek/deepseek-r1`        | `openai/gpt-4o-mini`          | `anthropic/claude-3-haiku` |

---

## Part 6: Knowledge Graph Construction

### 6.1 Knowledge Graph Events

Every significant business event is ingested into the knowledge graph for temporal reasoning and cross-entity understanding:

| Domain Event        | Knowledge Graph Entry                                         | Purpose                               |
| ------------------- | ------------------------------------------------------------- | ------------------------------------- |
| `BookingApproved`   | Node: Booking + edges to: Customer, Facility, Room, TimeRange | Occupancy patterns; customer behavior |
| `AccessPassIssued`  | Node: AccessPass + edges to: Customer, Event, TicketType      | Ticket demand patterns                |
| `PaymentCaptured`   | Node: Payment + edges to: Invoice, Customer, Event            | Revenue attribution                   |
| `JournalPosted`     | Node: JournalEntry + edges to: Ledger, Accounts               | Financial graph                       |
| `KnowledgeIndexed`  | Node: Document + edges to: KnowledgeBase, Tenant              | Content graph                         |
| `WorkflowCompleted` | Node: WorkflowInstance + edges to: Entity, Approvers          | Process patterns                      |

### 6.2 Graph Storage

The knowledge graph is stored as structured JSONB in `documents` table within the AI & Knowledge context, indexed for vector similarity search. Heavy graph queries use dedicated read models.

---

## Part 7: Anomaly Detection

### 7.1 Financial Anomaly Detection

| Anomaly                                               | Detection Method                                       | Threshold      | Action                                                     |
| ----------------------------------------------------- | ------------------------------------------------------ | -------------- | ---------------------------------------------------------- |
| Ledger imbalance                                      | `ABS(SUM(debit) - SUM(credit)) > 0.0001`               | Zero tolerance | Immediate alert + block further postings                   |
| Unusual transaction volume                            | Z-score > 3.0 on rolling 7-day average                 | 3σ deviation   | Alert + create Approval for human review                   |
| Duplicate payment attempt (different idempotency key) | Same (tenant_id, amount, customer_id) within 5 minutes | 2 attempts     | Flag for fraud review                                      |
| High-value reversal                                   | Reversal amount > `tenant.avg_transaction * 10`        | 10x average    | Automatic Approval creation + finance:auditor notification |

### 7.2 Operational Anomaly Detection

| Anomaly                  | Threshold                                   | Action                                |
| ------------------------ | ------------------------------------------- | ------------------------------------- |
| Booking conflict spike   | > 5 conflicts in 1 minute for same facility | Circuit breaker activation; ops alert |
| AccessPass issuance rate | > 1000 passes/minute per tenant             | Rate limit + scale signal             |
| LLM cost spike           | Daily cost > 150% of 7-day average          | Budget alert + degraded mode          |
| Approval queue backlog   | > 50 pending Approvals per tenant           | Escalation to tenant:admin            |

### 7.3 AI-Specific Anomaly Detection

| Anomaly                            | Detection                                   | Action                                   |
| ---------------------------------- | ------------------------------------------- | ---------------------------------------- |
| Level 0 tool call attempt          | Tool name lookup fails in AI registry       | Log attempt; alert security team         |
| Repeated similar Level 1 proposals | Same tool + same entity > 3 times in 1 hour | Flag potential AI loop; pause agent      |
| High hallucination rate            | Output schema validation failure rate > 20% | Alert AI Engineering Lead; review prompt |
| Token budget exhaustion rate       | Reaching budget limit before 6pm UTC        | Alert; consider budget increase RFC      |

---

## Part 8: Cost Metering & Budget Enforcement

### 8.1 Cost Attribution Model

Every LLM inference is attributed to a tenant and tracked:

```sql
CREATE TABLE ai_usage_records (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID        NOT NULL REFERENCES tenants(id),
  agent_id     UUID        REFERENCES ai_agents(id),
  model        VARCHAR(100) NOT NULL,
  prompt_tokens    INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens     INTEGER NOT NULL,
  cost_usd     NUMERIC(10,6) NOT NULL,  -- Cost at time of inference
  trace_id     UUID        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cost reporting
CREATE INDEX idx_ai_usage_tenant_date ON ai_usage_records (tenant_id, created_at);
```

### 8.2 Budget Enforcement

```typescript
interface AIBudgetConfig {
  tenant_id: UUID;
  daily_token_limit: number; // e.g., 1_000_000 tokens/day
  daily_usd_limit: Decimal; // e.g., $50.00/day
  monthly_usd_limit: Decimal; // e.g., $500.00/month
  alert_threshold_pct: number; // Alert when 80% consumed
  hard_limit_behavior: 'block' | 'degrade';
}

// Middleware: Budget guard runs before every LLM call
async function enforceBudget(tenantId: UUID, estimatedCost: Decimal): Promise<void> {
  const usage = await getDailyUsage(tenantId);
  const budget = await getBudgetConfig(tenantId);

  if (usage.totalUsd.plus(estimatedCost).gt(budget.daily_usd_limit)) {
    if (budget.hard_limit_behavior === 'block') {
      throw new BudgetExhaustedException('Daily AI budget exhausted');
    } else {
      // Degrade to cheaper model (gpt-4o-mini)
      return useDegradedModel();
    }
  }

  // Alert at threshold
  const usagePct = usage.totalUsd.div(budget.daily_usd_limit).mul(100);
  if (usagePct.gte(budget.alert_threshold_pct)) {
    await notifications.send('budget_alert', { tenantId, usagePct });
  }
}
```

---

## Part 9: AI Observability & Tracing

### 9.1 Mandatory OpenTelemetry Attributes (All AI Spans)

Every MCP tool call and LLM inference **must** emit an OpenTelemetry span with:

```typescript
// Mandatory span attributes for all AI operations
const AI_SPAN_ATTRIBUTES = {
  'ai.tenant_id': tenantId,
  'ai.agent_id': agentId,
  'ai.model': modelName,
  'ai.tool_name': toolName, // For MCP tool calls
  'ai.access_level': accessLevel, // 0, 1, or 2
  'ai.token_usage': totalTokens,
  'ai.cost_usd': costUsd,
  'ai.trace_id': traceId,
  'ai.approval_id': approvalId, // If Level 1 created Approval
  'ai.cache_hit': cacheHit, // L1/L2/L3/miss
  'ai.latency_ms': latencyMs,
};
```

### 9.2 AI SLA Targets

| Operation                     | p50   | p95    | p99    |
| ----------------------------- | ----- | ------ | ------ |
| Semantic cache hit (L2)       | 2ms   | 10ms   | 25ms   |
| RAG retrieval (hybrid search) | 80ms  | 200ms  | 400ms  |
| LLM inference (cached prompt) | 400ms | 1500ms | 3000ms |
| LLM inference (full context)  | 800ms | 2500ms | 5000ms |
| Level 1 Approval creation     | 50ms  | 150ms  | 300ms  |
| Level 2 tool execution (read) | 20ms  | 80ms   | 200ms  |

---

## Appendix A: AI Architecture Quick Reference

```
MCP Tool Levels:
  Level 0 (FORBIDDEN) → Not in registry
  Level 1 (PENDING)   → Creates Approval; no mutation
  Level 2 (ALLOWED)   → Read-only; executes immediately

RAG Parameters:
  Embedding: text-embedding-3-large (1536 dims)
  Chunk: 512 tokens / 64 overlap
  HNSW: m=16, ef_construction=64, cosine
  Retrieval: hybrid (pgvector + Typesense) + RRF + Cohere rerank
  Top-K final: 5 chunks

Prompt Rules:
  eval_score >= 0.85 to activate
  Minimum guardrails: pii_detection + output_schema_enforcement
  temperature ≤ 0.3 for factual tasks

Cache:
  L1: 60s in-process
  L2: 300s Valkey exact
  L3: 3600s Valkey semantic (cosine < 0.05)
```

---

**End of Volume 04**

_AI in Moventios is powerful precisely because it is constrained. The MCP Tool Level system makes it mathematically impossible for an AI agent to mutate material state without human approval — not by policy, but by architecture._

_[Constitution Part 16] [ADR-002] [Volume 06, L-06] [Volume 02, Context 6 — AI & Knowledge]_
