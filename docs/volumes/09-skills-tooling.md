# Volume 9 — AI IDE Skills & Tooling Ecosystem

**Version:** 1.0  
**Date:** June 2026  
**Authority:** SEKB Layer-1 Constitution §12 (AI Governance) | docs/ai-ide/SEKB-AI-Agent-Instructions.md  
**Owner:** AI Platform + Engineering  
**Status:** Active — Implementation Ready

> This volume is the **canonical reference** for all AI IDE skills, external tools,  
> agent frameworks, and tooling integrations available to AI coding agents working  
> in this codebase. Read this volume before selecting tools for any task.

---

## 1. Purpose

This volume documents:

1. The **installed skill ecosystem** — what skills are available and when to use them
2. The **external tooling inventory** — 9 GitHub repositories researched and evaluated
3. **Adoption recommendations** — how to use each tool within platform constraints
4. **Asset mapping** — a complete inventory of all codebase asets
5. **Integration patterns** — how skills interact with the platform's architecture

AI coding agents must read this volume at session start when working on cross-cutting  
concerns: SEO, UI/UX, data pipelines, codebase exploration, or complex workflows.

---

## 2. Installed Plugin: `movent-skills`

Location: `/Users/mac/.gemini/config/plugins/movent-skills/`

A curated plugin bundle with 7 skills derived from 9 GitHub repositories.  
All skills are adapted for this platform's architectural constraints (Hexagonal + DDD + L-06).

### Skill Inventory

| Skill                                                                                                           | Trigger Keywords                                    | Primary Use                              |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------- |
| [`agentic-seo`](../../.gemini/config/plugins/movent-skills/skills/agentic-seo/SKILL.md)                         | seo audit, technical seo, GEO, AEO, sitemap, schema | SEO analysis and optimization            |
| [`ui-ux-pro-max`](../../.gemini/config/plugins/movent-skills/skills/ui-ux-pro-max/SKILL.md)                     | design system, build UI, colors, typography         | UI/UX design intelligence                |
| [`understand-codebase`](../../.gemini/config/plugins/movent-skills/skills/understand-codebase/SKILL.md)         | map architecture, where is X, what depends on Y     | Codebase exploration and impact analysis |
| [`ai-dataset-generator`](../../.gemini/config/plugins/movent-skills/skills/ai-dataset-generator/SKILL.md)       | generate training data, SFT, DPO, fine-tuning       | AI training dataset creation             |
| [`vibe-coder-workflow`](../../.gemini/config/plugins/movent-skills/skills/vibe-coder-workflow/SKILL.md)         | new feature, architecture review, code review       | Structured development workflow          |
| [`codymaster-workflow`](../../.gemini/config/plugins/movent-skills/skills/codymaster-workflow/SKILL.md)         | build end-to-end, chain skills, full pipeline       | Multi-skill coordinated execution        |
| [`antigravity-skill-vault`](../../.gemini/config/plugins/movent-skills/skills/antigravity-skill-vault/SKILL.md) | backend architect, security audit, kubernetes       | 300+ specialist skills access            |

### Skill Selection Guide

```
Task: "Analyze SEO of the platform homepage"
→ Use: agentic-seo (seo audit)

Task: "Design the event calendar component"
→ Use: ui-ux-pro-max + anti-ai-slop + modern-web-guidance

Task: "Where is the booking conflict check implemented?"
→ Use: understand-codebase

Task: "Build SFT training data for the onboarding chatbot"
→ Use: ai-dataset-generator

Task: "Build the access pass issuance feature end-to-end"
→ Use: vibe-coder-workflow (writing-plans → architecture-review → TDD)
   OR: codymaster-workflow (cm-planning → cm-tdd → cm-safe-deploy)

Task: "Security audit of the tenant isolation layer"
→ Use: antigravity-skill-vault (security-auditor) + understand-codebase

Task: "Implement Next.js server action for booking"
→ Use: antigravity-skill-vault (nextjs-app-router-patterns) + vibe-coder-workflow

Task: "Optimize LCP on the operations dashboard"
→ Use: agentic-seo (seo technical) + debug-optimize-lcp (existing skill)
```

---

## 3. External Repository Research Inventory

All 9 repositories researched and evaluated in June 2026:

### 3.1 Vibe Coder Kit

**Repository:** https://github.com/omergocmen/vibe-coder-kit  
**Category:** Development Workflow Framework  
**License:** MIT  
**Rating for adoption:** ★★★★☆

**What it is:** Configuration-driven agent framework with 4 specialist personas, 12 structured skills, and 3 mandatory rule sets. Designed for OpenCode and compatible AI assistants.

**Key contributions to platform:**

- Structured workflow methodology: `prompt-enhancer` → `brainstorming` → `writing-plans` → `architecture-review` → `test-driven-execution` → `code-review`
- 3 rule sets: `code-hygiene`, `code-quality`, `safety` (destructive command confirmation)
- Knowledge base across sessions: prevents repeating same mistakes
- 4 agent personas (Designer/Aria, Frontend/Felix, Backend/Bora, DevOps/Deva)

**Adaptation notes:**

- Rules are adopted as-is (aligned with Layer-1 laws)
- Agent personas map to our functional roles
- Integrated as `vibe-coder-workflow` skill

---

### 3.2 CodyMaster

**Repository:** https://github.com/tody-agent/codymaster  
**Category:** Agent Operating System (50+ chained skills)  
**License:** MIT | npm: `codymaster`  
**Version:** v7.0.2  
**Rating for adoption:** ★★★★★

**What it is:** An AI agent "operating system" — 50+ skills that chain automatically, share memory, and work like a real senior team (Developer, Designer, PM, DevOps, Tech Writer, Automation).

**Key contributions to platform:**

- Skill chaining: skills auto-chain based on context (e.g., build request → brainstorm → design → TDD → doc → deploy)
- Cross-session memory: project structure, known bugs, design decisions
- Multi-layer safety: tests → security scan → staging → production
- Design system extraction from existing sites
- v7.0.2 Browse Hybrid Bridge: browser automation with a11y snapshots

**Adoption path:**

1. Use `codymaster-workflow` skill for complex, multi-step tasks
2. Reference specific `cm-*` skill names in prompts
3. Install CodyMaster CLI optionally: `npm install -g codymaster && cm`

---

### 3.3 Understand Anything (Egonex AI)

**Repository:** https://github.com/Egonex-AI/Understand-Anything  
**Category:** Codebase Knowledge Graph  
**License:** MIT  
**Stars:** Trending  
**Rating for adoption:** ★★★★★

**What it is:** Analyzes codebases with a multi-agent pipeline, builds a knowledge graph of every file, function, class, and dependency, then provides interactive exploration with guided tours, diff impact analysis, and semantic search.

**Key features:**

- Structural graph: files, functions, classes, dependencies
- Domain/business logic view (maps code to business processes)
- Knowledge base analysis (Karpathy-pattern LLM wikis)
- Diff impact analysis before committing changes
- Persona-adaptive UI (junior dev, PM, power user)
- Layer visualization (API, Service, Data, UI, Utility)

**Extremely relevant for:**

- New team member onboarding
- Bounded context boundary enforcement
- Change impact analysis before large refactors
- Generating architecture documentation

**Installation:**

```bash
/plugin marketplace add Egonex-AI/Understand-Anything
/plugin install understand-anything
```

---

### 3.4 Antigravity Awesome Skills

**Repository:** https://github.com/sickn33/antigravity-awesome-skills  
**Category:** Skill Library (1,684+ skills)  
**License:** MIT  
**Stars:** 42,000+  
**Version:** v13.2.0  
**Rating for adoption:** ★★★★★

**What it is:** The largest installable skill library for AI coding assistants — 1,684+ `SKILL.md` playbooks covering development, testing, security, infrastructure, product, and marketing.

**Key specialized plugins relevant to this platform:**

| Plugin                          | Skills | Relevance                                |
| ------------------------------- | ------ | ---------------------------------------- |
| AAS Web App Builder             | 10     | Frontend, Next.js, Tailwind, performance |
| AAS Product Design Studio       | 10     | UI, brand, accessibility                 |
| AAS Security Engineer           | 10     | Auth, RLS, tenant isolation audit        |
| AAS QA & Test Automation        | 10     | Playwright, test suites                  |
| AAS API Platform Builder        | 10     | OpenAPI, REST design, security           |
| AAS SaaS Launch & Revenue       | 10     | Pricing, payments, SEO, lifecycle        |
| AAS AI Product & Evaluation Ops | 10     | AI evals, tracing, model quality         |
| AAS Agent & MCP Builder         | 10     | MCP tools, RAG, agentic systems          |

**Installation for Antigravity:**

```bash
# Recommended: targeted install for most relevant categories
npx antigravity-awesome-skills --antigravity --category development,security,backend

# Specific plugin (e.g., Security Engineer)
npx antigravity-awesome-skills --antigravity --plugin security-engineer
```

**Token management:** Do NOT install all 1,684 skills — significant token cost at session start. Install only relevant categories.

---

### 3.5 Antigravity Skill Vault

**Repository:** https://github.com/rmyndharis/antigravity-skills  
**Category:** 300+ specialist skills (ported from Claude Code Agents)  
**License:** (inherited from source)  
**Rating for adoption:** ★★★★☆

**What it is:** 300+ skills ported from Claude Code Agents to Antigravity format. Three types: Domain Skills (specialized knowledge), Specialist Agents (persona-based), and Workflows (multi-step procedures).

**Priority installs for this platform:**

```bash
# Install via Antigravity Skill Vault
# Skills to prioritize:
nextjs-app-router-patterns    # Next.js 15 App Router
typescript-pro                # Full-stack TS
security-auditor              # Tenant isolation audit
api-design-principles         # API-first design
tdd-workflows-tdd-cycle       # TDD enforcement
c4-architecture-c4-architecture  # Architecture docs
incident-response-incident-response  # Production readiness
code-review-ai-ai-review      # Pre-commit quality
```

---

### 3.6 Agentic SEO Skill (Bhanunamikaze)

**Repository:** https://github.com/Bhanunamikaze/Agentic-SEO-Skill  
**Category:** LLM-First SEO Analysis  
**License:** MIT  
**Version:** Current  
**Rating for adoption:** ★★★★★

**What it is:** 16 specialized SEO sub-skills + 10 specialist agents + 89 automation scripts. Covers full technical SEO, content, GEO (AI search), AEO (featured snippets), schema validation, competitor pages, GitHub SEO, and strategic planning.

**Directly implements our SEO/AEO/GEO strategy from `docs/strategy/seo-aeo-geo-strategy.md`.**

**Installation:**

```bash
curl -fsSL https://raw.githubusercontent.com/Bhanunamikaze/Agentic-SEO-Skill/main/install.sh | bash -s -- --online --target claude
```

**Key sub-skills for immediate use:**

| Sub-Skill         | Platform Use Case                                          |
| ----------------- | ---------------------------------------------------------- |
| `seo geo`         | Optimize for ChatGPT/Perplexity/Gemini citations           |
| `seo aeo`         | Win featured snippets for "best event operations platform" |
| `seo technical`   | Core Web Vitals, `llms.txt` validation                     |
| `seo schema`      | `SoftwareApplication` schema on product pages              |
| `seo competitors` | /compare/vs-cvent, /compare/vs-monday pages                |
| `seo plan`        | Topical cluster planning (SaaS template)                   |
| `seo github`      | GitHub repository SEO for open-source component            |
| `seo article`     | Blog article optimization per publication                  |

---

### 3.7 Cinematic UI (akseolabs-seo)

**Repository:** https://github.com/akseolabs-seo/cinematic-ui  
**Status:** ⚠️ Repository not accessible (404 during research)  
**Rating for adoption:** ❌ Not evaluated

**Action:** Repository may be private, renamed, or deleted. Skip for now.  
For cinematic/premium UI effects, use `ui-ux-pro-max` + `anti-ai-slop` skills instead.

---

### 3.8 AI Dataset Generator (Bhanunamikaze)

**Repository:** https://github.com/Bhanunamikaze/AI-Dataset-Generator  
**Category:** LLM-First Dataset Generation  
**License:** MIT  
**Rating for adoption:** ★★★★☆

**What it is:** 14 specialized sub-skills + 19 pipeline scripts for generating SFT and DPO training datasets from topics, URLs, web research, or raw files. Includes coverage steering, drift detection, corpus auditing, and multi-format export.

**Platform use cases:**

| Use Case                              | Timeline                      |
| ------------------------------------- | ----------------------------- |
| Event operations Q&A dataset (SFT)    | Phase 2 — AI Copilot training |
| Booking conflict resolution dataset   | Phase 2                       |
| Onboarding chatbot training data      | Phase 2                       |
| AI suggestion quality evaluator (DPO) | Phase 3                       |
| Support ticket classifier             | Phase 3                       |

**Installation:**

```bash
curl -fsSL https://raw.githubusercontent.com/Bhanunamikaze/AI-Dataset-Generator/main/install.sh | bash -s -- --online --target claude
```

---

### 3.9 UI UX Pro Max (nextlevelbuilder)

**Repository:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill  
**Category:** AI Design Intelligence  
**License:** MIT  
**Version:** v2.0  
**Rating for adoption:** ★★★★★

**What it is:** 161 reasoning rules + 67 UI styles + design system generator. Given a product description, generates a complete design system: color palette, typography, layout pattern, key effects, anti-patterns, and pre-delivery checklist. Covers 161 product categories, 24 landing page patterns, 57 font combinations.

**Platform adaptation:** Apply with "Stoic UX" filter for data-dense, operator-focused interfaces.

**Installation:**

```bash
npm install -g uipro-cli && uipro install
# OR
npx uipro-cli install
```

---

## 4. Asset Mapping — Complete Codebase Inventory

### 4.1 Project Structure

```
/Users/mac/Downloads/PROYEK/MOVENT/
│
├── apps/
│   ├── web/                          # Next.js 15 App Router frontend
│   │   └── src/
│   │       ├── app/                  # Page routes (App Router)
│   │       ├── components/           # React components
│   │       └── middleware.ts         # ⚠️ CRITICAL: tenant isolation, auth guard
│   └── workers/                      # Background job workers
│
├── packages/
│   ├── contracts/                    # Shared types, DTOs, domain event schemas
│   ├── core/                         # Business logic (Hexagonal Architecture)
│   │   └── src/
│   │       ├── domain/               # Aggregates, entities, value objects
│   │       ├── application/          # Use cases, ports (interfaces)
│   │       └── infrastructure/       # Adapters (DB, payment, email)
│   ├── database/                     # Supabase migrations, RLS policies, seeds
│   ├── infrastructure/               # Shared infrastructure adapters
│   └── ui/                           # Shared React component library
│
├── supabase/
│   ├── migrations/                   # SQL migrations (append-only)
│   └── functions/                    # Edge functions
│
├── docs/
│   ├── layers/                       # ⚠️ IMMUTABLE: Layer 1-3 SSOT
│   │   ├── Layer-1-Constitution-v5.0.2.md  # Architectural laws
│   │   ├── Layer-2-Database-SSOT.md        # DB schema + RLS
│   │   └── Layer-3-EPXA.md                 # Event + bounded context map
│   ├── volumes/                      # SEKB Knowledge Base (this file = Vol 9)
│   │   ├── 00-knowledge-architecture.md
│   │   ├── 01-foundations.md
│   │   ├── 02-enterprise-architecture.md
│   │   ├── 03-engineering.md
│   │   ├── 04-ai-architecture.md
│   │   ├── 05-operations.md
│   │   ├── 06-governance.md
│   │   ├── 07-business.md
│   │   ├── 08-product.md
│   │   ├── 09-skills-tooling.md      # THIS FILE
│   │   └── 10-remediation-roadmap.md
│   ├── strategy/                     # Product & business strategy
│   │   ├── product-experience-research.md
│   │   ├── copywriting-system.md
│   │   ├── ux-writing-guidelines.md
│   │   ├── messaging-framework.md
│   │   ├── website-ia.md
│   │   ├── homepage-blueprint.md
│   │   ├── content-strategy.md
│   │   ├── seo-aeo-geo-strategy.md
│   │   ├── brand-canvas.md
│   │   ├── positioning-statement.md
│   │   └── [25+ additional strategy documents]
│   └── ai-ide/
│       └── SEKB-AI-Agent-Instructions.md  # Agent operating instructions
│
├── SEKB/                             # Sovereign Enterprise Knowledge Base
│   ├── 01-foundations.md
│   ├── 02-architecture.md
│   └── 03-engineering.md
│
├── archive/                          # Archived (legacy) documents
├── .cursorrules                      # IDE-level agent instructions
├── package.json                      # Monorepo root (pnpm workspaces + Turbo)
├── pnpm-workspace.yaml
└── turbo.json
```

### 4.2 Strategy Documents Index

| Document                         | Purpose                                | Status           |
| -------------------------------- | -------------------------------------- | ---------------- |
| `product-experience-research.md` | 24-deliverable research synthesis      | ✅ Complete      |
| `copywriting-system.md`          | Brand voice, tone, headlines, CTAs     | ✅ Complete      |
| `ux-writing-guidelines.md`       | Empty states, errors, forms, AI UX     | ✅ Complete      |
| `messaging-framework.md`         | Value prop, 3 P's, objection handling  | ✅ Complete v2.0 |
| `website-ia.md`                  | Full IA, navigation, llms.txt template | ✅ Complete      |
| `homepage-blueprint.md`          | 9-section wireframe + full copy        | ✅ Complete      |
| `content-strategy.md`            | 5-tier ecosystem, 6 pillars, calendar  | ✅ Complete      |
| `seo-aeo-geo-strategy.md`        | SEO/AEO/GEO 3-layer framework          | ✅ Complete      |
| `brand-canvas.md`                | Brand identity, personality, promise   | ✅ Existing      |
| `positioning-statement.md`       | Category positioning                   | ✅ Existing      |
| `trust-framework.md`             | 4-layer trust ecosystem                | ⏳ Phase 1D      |
| `conversion-optimization.md`     | Pricing psychology, objections         | ⏳ Phase 1D      |
| `documentation-blueprint.md`     | /docs IA and UX standards              | ⏳ Phase 1E      |
| `persona-matrix.md`              | 5 personas with content mapping        | ⏳ Phase 1F      |

### 4.3 Volume Index

| Volume | Title                   | Domain                            |
| ------ | ----------------------- | --------------------------------- |
| 00     | Knowledge Architecture  | Meta — how SEKB is organized      |
| 01     | Foundations             | Core principles, constitution     |
| 02     | Enterprise Architecture | System design, bounded contexts   |
| 03     | Engineering             | Code standards, patterns          |
| 04     | AI Architecture         | AI integration, L-06, Copilot     |
| 05     | Operations              | Deployment, monitoring            |
| 06     | Governance              | Compliance, audit, security       |
| 07     | Business                | Market, business model            |
| 08     | Product                 | UX, design tokens, components     |
| **09** | **Skills & Tooling**    | **AI IDE skills, tool ecosystem** |
| 10     | Remediation Roadmap     | Tech debt, gaps, roadmap          |

---

## 5. Skill Usage Decision Matrix

Use this matrix to select the right skill for each task type:

| Task Category                     | Primary Skill                                | Supporting Skills                     |
| --------------------------------- | -------------------------------------------- | ------------------------------------- |
| **SEO analysis / GEO / AEO**      | `agentic-seo`                                | `modern-web-guidance`                 |
| **UI component design**           | `ui-ux-pro-max`                              | `anti-ai-slop`, `modern-web-guidance` |
| **Codebase exploration / impact** | `understand-codebase`                        | —                                     |
| **New feature development**       | `vibe-coder-workflow`                        | `antigravity-skill-vault`             |
| **Complex multi-step build**      | `codymaster-workflow`                        | `vibe-coder-workflow`                 |
| **Security audit**                | `antigravity-skill-vault` (security-auditor) | `understand-codebase`                 |
| **AI training dataset**           | `ai-dataset-generator`                       | —                                     |
| **Performance / LCP**             | `agentic-seo` (seo technical)                | `debug-optimize-lcp`                  |
| **Accessibility audit**           | `a11y-debugging`                             | `ui-ux-pro-max`                       |
| **Architecture documentation**    | `understand-codebase`                        | C4 from skill vault                   |
| **Content writing / copy**        | `copywriting-system.md` rules                | `anti-ai-slop`                        |
| **Firebase / Supabase**           | `firebase-*` skills                          | —                                     |

---

## 6. Platform Constraints (Apply to All Skills)

All skills must respect these non-negotiable constraints:

### Architecture Laws (Layer-1)

- **L-01**: No cross-bounded-context joins in data queries
- **L-02**: No business logic in middleware or transport layer
- **L-03**: All financial records are immutable (append-only)
- **L-06**: AI mutations follow WRITE→PENDING→COMMITTED (human approval required)
- **L-07**: Commands = imperative (`IssueAccessPass`), Events = past tense (`AccessPassIssued`)

### Terminology Laws

All code, UI, and content must use canonical names from Layer-1:

- ✅ `AccessPass` not "ticket" or "entry card"
- ✅ `Booking` not "reservation" or "slot"
- ✅ `Facility` not "venue" or "location"
- ✅ `Supplier` not "vendor" or "contractor"
- ✅ `Ledger` not "ledger entry" or "finance record"

### UI Laws (Stoic UX)

- Data-dense, no decorative elements
- Keyboard-first navigation
- No emoji as icons (use SVG: Heroicons/Lucide)
- No hype copy in UI (no "powerful", "seamless", "revolutionary")

---

## 7. Implementation Roadmap for Skill Adoption

### Immediate (This Week)

- [x] `movent-skills` plugin created with 7 skills
- [ ] Install `agentic-seo` scripts: `curl ... | bash -s -- --online --target claude`
- [ ] Install `ui-ux-pro-max` CLI: `npm install -g uipro-cli && uipro install`
- [ ] Install `Understand Anything`: `/plugin install understand-anything`

### Short-term (Next 2 Weeks)

- [ ] Run `seo audit` on platform homepage (when live)
- [ ] Run `seo github` on repository (when public)
- [ ] Use `understand-codebase` to generate bounded context map for documentation
- [ ] Use `ui-ux-pro-max` for next UI component (event calendar, booking form)

### Medium-term (1–3 Months)

- [ ] Install AAS Security Engineer plugin for tenant isolation audit
- [ ] Generate first AI training dataset with `ai-dataset-generator` (onboarding Q&A)
- [ ] Implement `llms.txt` (from `website-ia.md` template) and validate with `seo technical`
- [ ] Set up `seo geo` monitoring (monthly cadence from `seo-aeo-geo-strategy.md`)

### Long-term (3–6 Months)

- [ ] Fine-tune AI Copilot on event operations domain dataset
- [ ] Full `seo aeo` implementation: FAQ schema, HowTo schema, Answer-First format
- [ ] Annual State of Event Operations research (generate dataset → publish report)

---

## 8. AI Agent Instructions for Skills

When an AI agent reads this volume, it should:

1. **Before starting any significant task**: Check which skill applies (Section 5 matrix)
2. **Before any UI work**: Read `docs/strategy/copywriting-system.md` + use `ui-ux-pro-max`
3. **Before any SEO work**: Reference `docs/strategy/seo-aeo-geo-strategy.md` for context
4. **Before any domain logic**: Read relevant bounded context in Layer-1 and Layer-3
5. **For all code**: Apply Layer-1 laws (L-01, L-02, L-06, L-07) — no exceptions
6. **For all copy**: No hype words, use canonical terminology, follow Stoic UX

**Session start checklist for AI agents:**

```
1. Read .cursorrules
2. Read docs/ai-ide/SEKB-AI-Agent-Instructions.md
3. Identify the task type → select skill (Section 5)
4. Check relevant Volume for domain context
5. Verify architectural constraints (Section 6) apply
6. Execute with vibe-coder-workflow or codymaster-workflow discipline
```

---

## 9. Internal References

| Document                                           | Role                                       |
| -------------------------------------------------- | ------------------------------------------ |
| `docs/layers/Layer-1-Constitution-v5.0.2.md`       | Canonical laws — never violate             |
| `docs/layers/Layer-3-EPXA.md`                      | Event architecture and bounded context map |
| `docs/volumes/04-ai-architecture.md`               | AI Copilot design, L-06 compliance         |
| `docs/volumes/08-product.md`                       | Design tokens, component standards         |
| `docs/strategy/seo-aeo-geo-strategy.md`            | Full SEO/GEO strategy context              |
| `docs/ai-ide/SEKB-AI-Agent-Instructions.md`        | Agent operating instructions               |
| `.cursorrules`                                     | IDE-level rules (read every session)       |
| `/Users/mac/.gemini/config/plugins/movent-skills/` | Installed skill files                      |
