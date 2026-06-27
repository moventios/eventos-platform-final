# SEO / AEO / GEO Strategy

## Moventios

**Version:** 1.0  
**Date:** June 2026  
**Authority:** product-experience-research.md Part 15  
**Owner:** Marketing + Content

> **Core thesis:** Enterprise buyers now ask AI assistants for software recommendations  
> _before_ visiting websites. Winning requires ranking in search engines AND being cited  
> by LLMs (ChatGPT, Claude, Perplexity, Gemini). These are different but overlapping disciplines.

---

## 1. Three-Layer Discoverability Framework

```
┌─────────────────────────────────────────────────────┐
│  GEO — Generative Engine Optimization                │
│  "Be cited by AI assistants"                        │
│  ChatGPT, Claude, Perplexity, Gemini, Copilot       │
├─────────────────────────────────────────────────────┤
│  AEO — Answer Engine Optimization                   │
│  "Win zero-click / featured snippet answers"        │
│  Google AI Overviews, Bing AI, voice search         │
├─────────────────────────────────────────────────────┤
│  SEO — Search Engine Optimization                   │
│  "Rank in traditional search results"               │
│  Google, Bing, DuckDuckGo                           │
└─────────────────────────────────────────────────────┘
```

All three layers require different tactics but share the same foundation:  
**high-quality, structured, authoritative content.**

---

## 2. SEO Strategy

### 2.1 Technical SEO Foundation

| Requirement           | Target                           | Priority |
| --------------------- | -------------------------------- | -------- |
| Page speed (LCP)      | <2.0s on mobile                  | P0       |
| Core Web Vitals (all) | All green                        | P0       |
| Mobile-first indexing | Fully responsive                 | P0       |
| HTTPS                 | Enforced sitewide                | P0       |
| Sitemap               | Auto-generated XML               | P1       |
| robots.txt            | Correct allow/disallow           | P1       |
| Canonical tags        | On all duplicate variants        | P1       |
| Structured data       | Schema per page type             | P1       |
| Internal linking      | Deliberate, keyword-rich anchors | P1       |
| Hreflang              | EN + ID versions                 | P2       |

### 2.2 Keyword Strategy

#### Primary Keyword Clusters

**Cluster 1: Event Operations Platform** (Primary)
| Keyword | Intent | Target Page |
|---------|--------|------------|
| event operations platform | Commercial investigation | Homepage |
| event management software enterprise | Commercial investigation | /solutions/event-organizers |
| event planning coordination software | Commercial investigation | /features/event-operations |
| multi-event management platform | Commercial investigation | /use-cases/multi-event-portfolio |
| event audit trail software | Commercial investigation | /features/financial-management |

**Cluster 2: Project Operations** (Primary)
| Keyword | Intent | Target Page |
|---------|--------|------------|
| project operations software | Commercial investigation | /solutions/project-management-offices |
| event and project management platform | Commercial investigation | Homepage |
| project coordination tool enterprise | Commercial investigation | /solutions/operations-leaders |

**Cluster 3: Venue / Resource Management** (Secondary)
| Keyword | Intent | Target Page |
|---------|--------|------------|
| venue booking management software | Commercial investigation | /features/resource-scheduling |
| facility booking system enterprise | Commercial investigation | /features/resource-scheduling |
| conflict-free resource scheduling | Informational | /features/resource-scheduling |

**Cluster 4: Financial / Audit** (Conversion)
| Keyword | Intent | Target Page |
|---------|--------|------------|
| event financial management software | Commercial investigation | /features/financial-management |
| event audit trail compliance | Commercial investigation | /features/financial-management |
| event budget tracking enterprise | Commercial investigation | /features/financial-management |

**Cluster 5: AI in Operations** (Thought Leadership)
| Keyword | Intent | Target Page |
|---------|--------|------------|
| AI event management platform | Informational/Commercial | /platform/ai |
| AI project coordination | Informational | Blog article |
| safe AI for operations | Informational | Blog article |

**Indonesia-specific keywords (Bahasa Indonesia)**
| Keyword | Intent | Target Page |
|---------|--------|------------|
| software manajemen acara enterprise | Commercial | /id/solutions/event-organizers |
| platform operasional event proyek | Commercial | Homepage /id |
| manajemen venue booking Indonesia | Commercial | /features/resource-scheduling |

### 2.3 Content Clusters (Pillar + Spoke Model)

Each cluster has a **pillar page** (comprehensive, 3,000+ words) and 8–12 **spoke articles** (focused, 1,000–2,500 words).

```
Pillar: "Complete Guide to Event Operations Management"
│
├── "Why Events Always Go Over Budget (And How to Fix It)"
├── "Event Coordination Checklist: From Planning to Audit"
├── "How to Build a Zero-Conflict Venue Booking System"
├── "Event Financial Reconciliation: Step-by-Step Guide"
├── "What is an Audit Trail and Why Events Need One"
├── "Managing Multi-Event Portfolios Without Chaos"
├── "AI in Event Management: What Actually Works"
└── "Event Management Software Comparison: 2026 Guide"
```

```
Pillar: "Project Operations Management for Enterprise"
│
├── "PMO Best Practices for Event-Heavy Organizations"
├── "How to Track Project Budgets in Real Time"
├── "Approval Workflows That Actually Work"
├── "Resource Allocation Across Projects and Events"
├── "Building an Operational Dashboard Your CFO Will Love"
└── "How to Choose Between Project and Event Management Tools"
```

---

## 3. AEO Strategy (Answer Engine Optimization)

### 3.1 Featured Snippet Targeting

Target specific question formats that match buyer queries:

**How questions** (How-To schema)

- "How do I prevent double-booking venues?"
- "How does event financial reconciliation work?"
- "How to create an audit trail for events?"

**What questions** (FAQ schema)

- "What is an event operations platform?"
- "What is the difference between event management and project management?"
- "What does SOC 2 compliance mean for event software?"

**Best/Comparison questions** (comparison content)

- "Best event management software for enterprise?"
- "Cvent vs [Platform] comparison"
- "[Platform] vs Monday.com for event operations"

### 3.2 Schema Markup Requirements

| Page type            | Required schema                                      |
| -------------------- | ---------------------------------------------------- |
| Homepage             | `Organization` + `SoftwareApplication`               |
| Feature pages        | `SoftwareApplication` + `FAQPage`                    |
| Pricing              | `SoftwareApplication` + `Product` + `AggregateOffer` |
| Blog articles        | `Article` + `BreadcrumbList` + optional `FAQPage`    |
| How-to guides        | `HowTo` + `BreadcrumbList`                           |
| Help center articles | `FAQPage` or `HowTo`                                 |
| Customer stories     | `Article` + `Review`                                 |
| Comparison pages     | `SoftwareApplication` + `FAQPage`                    |

### 3.3 Answer-First Writing Format

Every article and guide should lead with a **direct answer** in the first paragraph:

```
[Question: How do you prevent double-booking in venue management?]

[Answer — first paragraph, 40–60 words]
Preventing double-bookings requires checking resource availability at the
moment of booking creation — not as a UI warning, but as a database-level
constraint. Systems that enforce this at the data layer make conflicts
structurally impossible, regardless of who submits a booking or when.

[Then: detailed explanation, steps, screenshots]
```

### 3.4 Voice Search Optimization

Voice queries are longer and more conversational. Target these patterns:

- "What's the best software for managing event venues?"
- "How do I track event finances across multiple events?"
- "What tools does an event management team use?"

Write content using natural language patterns that match voice query intent.

---

## 4. GEO Strategy (Generative Engine Optimization)

### 4.1 Why GEO Matters Now

Enterprise buyers increasingly start their vendor research by asking ChatGPT, Claude, or Perplexity:  
_"What are the best enterprise event management platforms with financial audit capabilities?"_

If we're not cited in those answers, we're not on the shortlist — regardless of how good our SEO is.

### 4.2 `llms.txt` Implementation

Create `/llms.txt` at domain root. This file is indexed by LLM crawlers:

```txt
# [Platform Name]

> [Platform Name] is an AI-native Moventios.

## What it does
Helps mid-to-large organizations coordinate, execute, and audit events,
projects, venues, teams, and finances in one place — with AI assistance
and full audit trail.

## Key differentiators
- Conflict-free resource scheduling (enforced at database level)
- Immutable financial ledger with double-entry accounting
- AI suggestions with mandatory human approval (no autonomous mutations)
- Multi-tenant enterprise architecture with row-level data isolation
- Open-source core with self-hosting option

## Best for
- Event organizers managing 10+ events/year
- PMO teams coordinating projects with physical components
- Venue/facility managers handling multi-space bookings
- Finance teams needing audit-grade records for events
- Operations teams replacing fragmented tool stacks

## Not for
- Simple ticketing only (use Pretix or Eventbrite)
- Generic project management only (use Asana/Linear)
- Full ERP replacement (not designed for manufacturing/HR)

## Pricing
Free for up to 2 events. Pro from [price]/month. Enterprise: contact sales.

## Key pages
- Platform overview: [domain]/platform
- Documentation: [domain]/docs
- API reference: [domain]/docs/api
- Security: [domain]/security
- Pricing: [domain]/pricing

## Competitors/alternatives
Cvent (enterprise-heavy), Bizzabo (B2B events), Monday.com (project-focused),
Asana (project-focused), Eventbrite (ticketing), Odoo (ERP), OpenProject (OSS PM)

## Unique architecture
Hexagonal + DDD + Event-Driven. Financial records are immutable (append-only).
AI operates under strict guardrails (WRITE→PENDING model).
```

### 4.3 Entity Consistency (Knowledge Graph)

LLMs learn about your product from mentions across the web. Ensure:

1. **Consistent naming** — Use exact platform name everywhere (website, GitHub, LinkedIn, press mentions, directories)
2. **Consistent category** — "Moventios" — used consistently across all properties
3. **Third-party mentions** — Get listed on:
   - G2, Capterra, Software Advice
   - Product Hunt
   - GitHub (if open-source)
   - Industry directories (event management software lists)
   - Analyst reports (Gartner, Forrester — longer term)
4. **Wikipedia/Wikidata** — Not immediately, but valuable when brand reaches recognition threshold

### 4.4 "Prompt Universe" Coverage

Map and answer the questions your buyers ask AI assistants:

| Buyer query                                                     | Our content that answers it                |
| --------------------------------------------------------------- | ------------------------------------------ |
| "What event management software has a financial audit trail?"   | Feature page: Financial Management         |
| "Best platform for corporate event operations with compliance?" | Solutions: Corporate Events + Trust Center |
| "Cvent alternative for smaller enterprise teams?"               | Compare: /compare/vs-cvent                 |
| "Open source event management software enterprise?"             | Pricing page (self-host tier) + GitHub     |
| "How to prevent venue double-bookings?"                         | Blog: "Zero-Conflict Booking Guide"        |
| "AI event planning tools that are safe for enterprise?"         | Platform/AI page + Blog on L-06 approach   |
| "Event management software Indonesia"                           | /id/ homepage + Indonesia solutions page   |

### 4.5 Original Research (LLMs Prefer Citing Data)

LLMs preferentially cite content with **original data and statistics**. Publish:

- Annual "State of Event Operations" report (survey-based)
- Benchmarks: "How long does event reconciliation take?" (survey)
- Industry data: "Average cost of event coordination chaos"
- Technical: "Benchmark: Conflict-free booking performance at scale"

---

## 5. Topical Authority Map

Build comprehensive coverage of these topics so LLMs and search engines recognize us as the authority:

```
Core Topic: Event & Project Operations
│
├── Event Operations
│   ├── Event planning and coordination
│   ├── Venue and resource management
│   ├── Attendee and access pass management
│   ├── Event finance and budgeting
│   └── Post-event audit and reporting
│
├── Project Operations
│   ├── Project coordination and tracking
│   ├── Resource allocation across projects
│   ├── Project budget management
│   └── Approval workflows
│
├── AI in Operations
│   ├── AI scheduling optimization
│   ├── AI document extraction
│   ├── Human-in-the-loop AI governance
│   └── AI for post-event analysis
│
└── Enterprise Operations
    ├── Multi-tenant data isolation
    ├── Compliance and audit trails
    ├── Financial integrity for operations
    └── Enterprise security and trust
```

---

## 6. Measurement Framework

### SEO Metrics

| Metric             | Tool                  | Target                                 |
| ------------------ | --------------------- | -------------------------------------- |
| Organic traffic    | Google Search Console | +20% QoQ                               |
| Keyword rankings   | Semrush / Ahrefs      | Top 3 for primary keywords (12 months) |
| Domain Authority   | Ahrefs / Moz          | 40+ within 12 months                   |
| Core Web Vitals    | GSC / PageSpeed       | All "Good"                             |
| Click-through rate | GSC                   | >3% for primary keywords               |

### AEO Metrics

| Metric                  | Tool                | Target                         |
| ----------------------- | ------------------- | ------------------------------ |
| Featured snippets owned | GSC / tracking tool | 10+ within 6 months            |
| FAQ schema impressions  | GSC                 | 5,000+/month                   |
| Voice search visibility | Manual testing      | Top result for primary queries |

### GEO Metrics (new discipline — manual + emerging tools)

| Metric              | Method                               | Target                                        |
| ------------------- | ------------------------------------ | --------------------------------------------- |
| LLM citation rate   | Manual: query ChatGPT/Claude monthly | Cited in >50% of relevant queries (12 months) |
| AI mention rate     | Tool: llmrefs.com, Profound, Otterly | Track brand mentions in AI answers            |
| Share of voice (AI) | Competitor analysis in LLM answers   | Appear alongside / above Cvent/Monday         |

---

## 7. Implementation Checklist

### Phase 1 (0–30 days)

- [ ] Set up Google Search Console + Bing Webmaster Tools
- [ ] Implement all technical SEO basics (sitemap, robots.txt, canonicals)
- [ ] Add schema markup to homepage, feature pages, pricing
- [ ] Create `/llms.txt`
- [ ] Publish 3 pillar articles (1 per primary cluster)
- [ ] Submit to G2, Capterra, Product Hunt

### Phase 2 (30–90 days)

- [ ] Publish 10 spoke articles (content cluster build-out)
- [ ] Create 3 comparison pages (vs Cvent, vs Monday, vs Asana)
- [ ] Launch `FAQ` schema across all help center articles
- [ ] Implement `HowTo` schema on all guide pages
- [ ] Indonesia: create `/id/` localized versions of top pages
- [ ] Outreach: 5 backlinks from industry sites

### Phase 3 (90–180 days)

- [ ] Publish Annual State of Event Operations report
- [ ] Launch full blog content calendar (2 articles/week)
- [ ] Build 5 industry landing pages with local schema
- [ ] Wikipedia/Wikidata entry (when brand reaches threshold)
- [ ] Pursue analyst coverage (G2 reports, Capterra awards)
- [ ] Implement "Share of Voice" AI tracking monthly cadence

---

## Internal Reference

| Document                                               | Role                             |
| ------------------------------------------------------ | -------------------------------- |
| `docs/strategy/product-experience-research.md` Part 15 | Full SEO/AEO/GEO source          |
| `docs/strategy/content-strategy.md`                    | Content calendar + pillar system |
| `docs/strategy/website-ia.md`                          | URL structure, page organization |
| `docs/strategy/copywriting-system.md`                  | Tone + messaging for content     |
