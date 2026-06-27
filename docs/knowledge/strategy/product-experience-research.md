# Industry-Grade Audience-Centric Product Experience Research
## Moventios

**Status:** Strategic Foundation Document  
**Version:** 1.0  
**Date:** June 2026  
**Authority:** Supplements docs/volumes/08-product.md | docs/strategy/*.md  
**Audience:** Product, Design, Content, Engineering, Marketing leads  

> **Canonical alignment:** This document extends the positioning defined in `positioning-statement.md`,  
> brand principles in `brand-canvas.md`, and the Stoic UX philosophy in `docs/volumes/08-product.md`.  
> When in conflict, the Layer hierarchy (L1 > L2 > L3 > Volumes) governs.

---

## EXECUTIVE SUMMARY

The platform's engineering foundation is mature. The next phase is **Product Experience** — how the platform educates, guides, converts, and retains users across every page, component, copy, and interaction.

This document synthesizes:
- **Internal**: All existing strategy, product, brand, and architecture docs
- **External**: Research on Stripe, Linear, Notion, Atlassian, Cvent, Bizzabo, Supabase, GitHub, and the global B2B SaaS benchmarks
- **Market**: Indonesia-specific context (Xendit, Mayar.id) + enterprise procurement psychology

**Core Thesis:** The gap between a good platform and a great one is not features — it is clarity, trust, and the ability to make users feel competent from Day 1.

---

# PART 1: WORLD-CLASS B2B SaaS EXPERIENCE BENCHMARK

## 1.1 Homepage Architecture — What World-Class Looks Like

### Stripe
- **IA Philosophy**: Evolved from "developer payment tool" to "economic engine of the internet"
- **Pattern**: "Bento box" modular card layout — showcases multiple features without overwhelming
- **Copy style**: Sharp, trust-first. GDP counter on homepage = proof, not marketing
- **Lesson for us**: Lead with *operational outcomes* (reliability, visibility, accountability), then support with architecture proof. Never lead with "immutable ledger" — lead with "no dropped balls."

### Linear
- **IA Philosophy**: "The product development system for teams and agents"
- **Pattern**: Dark mode, bold typography, extreme minimalism — premium feel without visual noise
- **Copy style**: Plain language, purpose-driven. Every word earns its place.
- **Lesson for us**: Opinionated UX is a feature. Don't be afraid to say "this is how professional ops teams work." Our Stoic UX is our Linear Aesthetic.

### Notion
- **IA Philosophy**: Flexible starting point, grows with you
- **Pattern**: Hero → Use cases → Templates → Customer stories → Pricing
- **Lesson for us**: Show users *what they'll build*, not just *what the product does*. Use templates and playbooks as conversion tools.

### Atlassian
- **IA Philosophy**: Suite of tools, unified by team outcomes
- **Pattern**: Solutions by team type (Engineering, IT, Business) — not by product name
- **Lesson for us**: Organize by *who needs it* + *what they're trying to do*, not by feature module names. COO thinks in outcomes, not in "AccessPass management."

### GitHub / Supabase / Vercel
- **IA Philosophy**: Developer-first, community-powered
- **Pattern**: Docs are a product. Search is primary. Code examples are first-class citizens.
- **Lesson for us**: The developer portal is a conversion surface. If our API docs are hard to navigate, we lose technical evaluators before they see value.

## 1.2 Page Purpose Matrix — World-Class B2B SaaS

| Page | Primary Audience | Education Role | Conversion Role | Onboarding Role |
|------|-----------------|----------------|-----------------|-----------------|
| **Homepage** | Unknown visitor | Problem framing | CTA to trial/demo | Introduction to platform identity |
| **Product page** | Solution-aware buyer | Feature depth | Sign-up / request demo | Sets expectation for activation |
| **Solutions page** | Problem-aware buyer | Maps problem to solution | Qualification | Pre-sells use case |
| **Industry page** | Vertical buyer (venues, universities) | Industry-specific proof | Industry-specific CTA | Reduces learning curve |
| **Feature page** | Deep evaluator | Technical depth | Builds confidence | Pre-trains on capability |
| **Pricing** | Decision-maker, finance | Package clarity | Tier selection | Anchors cost expectations |
| **Docs** | Developer + power user | Step-by-step | Reduces churn | Core activation surface |
| **Blog** | Problem-aware, SEO | Thought leadership | Top-of-funnel lead | Sets authority |
| **Academy / Learning** | New user, CSM-supported | Skill-building | Retention | Reduces churn, increases depth |
| **Templates** | Evaluator + new user | Shows real-world utility | Downloads = qualified leads | Accelerates activation |
| **Customer Stories** | Decision-maker | Social proof by industry | Breaks final objection | Validates ROI |
| **Changelog** | Power user | Shows momentum | Reduces churn | Keeps users informed |
| **Developer Portal** | Integration builder | API depth + DX quality | Expands platform adoption | Enables extensibility |
| **Trust Center** | Procurement, CISO | Security/compliance detail | Removes final barrier | Enables enterprise contract |
| **Status Page** | Operations team | Live reliability | Trust signal | Ongoing credibility |

---

# PART 2: EVENT & PROJECT MANAGEMENT PLATFORM BENCHMARK

## 2.1 Competitive Content & Education Analysis

### Cvent
- **Strength**: Deep feature documentation, certification programs (Cvent Academy)
- **Weakness**: UX complexity → learning curve → poor activation rates for non-enterprise
- **Content Pattern**: Formal whitepapers, ROI calculators, comparison guides
- **Gap we can exploit**: Cvent is hard to adopt. We can win on *time-to-first-value* and *clarity of onboarding*.

### Bizzabo
- **Strength**: Modern interface, B2B event focus, clean content marketing
- **Weakness**: Less depth in finance/operations than enterprise needs
- **Content Pattern**: Experience-focused messaging, data-driven event ROI content
- **Gap we can exploit**: No deep financial audit trail, no project management integration. We have both.

### Whova
- **Strength**: Easy to use, strong attendee engagement, quick adoption
- **Weakness**: Limited enterprise-grade finance, no project context, no spatial resource management
- **Content Pattern**: Simple, friendly UI-focused marketing

### Monday / Asana / Linear
- **Strength**: Superb task and project UX
- **Weakness**: No event commerce, no venue/resource spatial booking, no immutable financial ledger
- **Content Pattern**: Strong use-case and team-type pages

### Plane / OpenProject (OSS)
- **Strength**: Open-source credibility, developer communities
- **Weakness**: No commercial-grade support, no event-specific capabilities
- **Content Pattern**: GitHub presence, community-driven

## 2.2 Market Gap Summary (Our Opportunity)

The market has:
- Event tools without deep finance or project context
- Project tools without event commerce or spatial resource management
- ERPs without real-time spatial, AI guardrails, or modern UX

**Our unique position**: The only platform combining:
1. Event operations (scheduling, access passes, ticketing)
2. Project management (tasks, workflows, approvals)
3. Spatial resource management (conflict-free venue/room booking)
4. Immutable financial ledger (audit-grade)
5. AI assistance with human approval guardrails (L-06)
6. Multi-tenant enterprise architecture (data sovereignty)

---

# PART 3: ENTERPRISE-GRADE WEBSITE INFORMATION ARCHITECTURE

## 3.1 IA Design Principles

> Pages exist because **users need them**, not because competitors have them.

Every page answers:
1. **Why does this exist?** — What problem does it solve
2. **Who needs it?** — Specific persona
3. **When do they visit?** — Stage in journey
4. **What decision should they make afterward?** — Clear next action

## 3.2 Complete Website IA

```
Platform Website
├── / (Home)
│   ├── Hero: Problem → Platform → Proof
│   ├── Social proof bar (customer logos)
│   ├── Platform overview (3 main pillars)
│   ├── Feature highlights (bento grid)
│   ├── Customer stories (2–3 featured)
│   ├── Metrics / proof points
│   └── CTA: Start free trial / Request demo
│
├── /platform
│   ├── Platform overview
│   ├── Architecture overview (for technical evaluators)
│   ├── AI capabilities overview
│   └── Integrations overview
│
├── /features
│   ├── /features/event-operations
│   ├── /features/project-management
│   ├── /features/resource-scheduling
│   ├── /features/financial-management
│   ├── /features/approvals-workflows
│   ├── /features/ai-copilot
│   ├── /features/reporting-analytics
│   └── /features/access-control
│
├── /solutions
│   ├── /solutions/event-organizers
│   ├── /solutions/project-management-offices
│   ├── /solutions/venue-facility-managers
│   ├── /solutions/corporate-events
│   ├── /solutions/finance-teams
│   └── /solutions/operations-leaders
│
├── /industries
│   ├── /industries/corporate-events
│   ├── /industries/universities-campuses
│   ├── /industries/sports-entertainment
│   ├── /industries/government-public-sector
│   ├── /industries/hospitality-venues
│   └── /industries/professional-services
│
├── /use-cases
│   ├── /use-cases/conference-management
│   ├── /use-cases/venue-booking
│   ├── /use-cases/multi-event-portfolio
│   ├── /use-cases/project-coordination
│   ├── /use-cases/budget-tracking
│   └── /use-cases/compliance-audit
│
├── /pricing
│   ├── Pricing tiers (Free, Pro, Enterprise)
│   ├── Feature comparison table
│   ├── ROI calculator
│   ├── FAQ
│   └── Enterprise contact CTA
│
├── /resources
│   ├── /resources/blog
│   ├── /resources/guides
│   ├── /resources/playbooks
│   ├── /resources/templates
│   ├── /resources/case-studies
│   ├── /resources/industry-reports
│   ├── /resources/webinars
│   ├── /resources/changelog
│   └── /resources/roadmap
│
├── /docs
│   ├── Getting Started
│   ├── Concepts (Domain model, entities)
│   ├── Modules (by feature area)
│   ├── Workflows (step-by-step task guides)
│   ├── Integrations
│   ├── Self-hosting
│   ├── Release Notes
│   └── /docs/api (API Reference)
│
├── /developer
│   ├── API Reference
│   ├── SDKs & Libraries
│   ├── Webhooks
│   ├── Authentication
│   ├── Sandbox / Playground
│   ├── Sample Apps
│   └── Community Forum
│
├── /security
│   ├── Security overview
│   ├── Data encryption
│   ├── Access control
│   ├── Compliance certifications
│   ├── Penetration testing
│   └── Responsible disclosure
│
├── /trust
│   ├── Trust overview
│   ├── Data residency
│   ├── SLA
│   ├── SOC 2 summary (download with NDA)
│   ├── Privacy policy
│   ├── Uptime / Status link
│   └── Audit logs overview
│
├── /compliance
│   ├── GDPR
│   ├── ISO 27001
│   ├── Industry-specific (HIPAA if applicable)
│   └── Data processing agreements
│
├── /customers
│   ├── Customer stories
│   ├── Case studies
│   └── Reviews / testimonials
│
├── /partners
│   ├── Partner overview
│   ├── Partner program
│   ├── Become a partner
│   └── Partner portal (login)
│
├── /marketplace
│   ├── Integration directory
│   ├── Templates marketplace
│   └── Partner-built apps
│
├── /learning-center
│   ├── Academy (structured courses)
│   ├── Certification
│   ├── Quick-start guides
│   ├── Video library
│   ├── Webinar recordings
│   └── Glossary
│
├── /help (Help Center)
│   ├── Search
│   ├── Getting Started
│   ├── How-to articles (by feature)
│   ├── Troubleshooting
│   ├── Release notes
│   ├── Contact support
│   └── Community forum
│
├── /status (Status Page)
│   ├── Live system status
│   ├── Incident history
│   └── Subscribe to updates
│
├── /about
│   ├── Company
│   ├── Mission
│   ├── Team
│   ├── Press / Media
│   └── Open source contributions
│
├── /careers
├── /contact
└── /community
```

## 3.3 Navigation System

**Primary Nav (Top):** Platform | Solutions | Pricing | Resources | Docs | Sign in | Start Free

**Mega Menu — Platform:**
- Features (grid of 8 feature areas)
- Integrations
- Security & Trust
- Changelog

**Mega Menu — Solutions:**
- By Role (Ops Manager, Finance, Developer, IT Admin)
- By Industry (Venues, Corporate, University, Government)
- By Use Case (Event, Project, Venue, Audit)

**Footer:**
- Product, Solutions, Resources, Developers, Company, Legal
- System status indicator
- Language/region selector

---

# PART 4: CUSTOMER JOURNEY MAP

## 4.1 Full Journey — Stages, Questions, Content, CTA

### Stage 0: Unknown Visitor
- **Trigger**: Googled a pain point ("event management chaos"), saw LinkedIn post, referral
- **State of mind**: Curious but skeptical. Not looking for a platform yet.
- **Questions**: "Is this even for me? What is this platform?"
- **Pain points**: Too many tools; coordination chaos; audit failures
- **Content needed**: Homepage hero copy, blog on pain points, social proof
- **Best UI**: Clean homepage, fast LCP (<1.5s), zero friction to understand value
- **CTA**: "See how it works" (short demo video, no signup required)

### Stage 1: Problem Aware
- **Trigger**: Recurring coordination failures, upcoming compliance audit, growing event volume
- **State of mind**: Frustrated. Looking for diagnosis, not yet solution.
- **Questions**: "Why do our events always run over budget? Why can't teams see the same information?"
- **Pain points**: Manual reconciliation, missed communications, no audit trail
- **Content needed**: Blog articles, diagnostic guides, industry reports, problem-framing pages
- **Best UI**: SEO-optimized blog, pillar + cluster content, FAQ schema
- **CTA**: "Download the Operations Chaos Report" (gated lead magnet)

### Stage 2: Solution Aware
- **Trigger**: Researching categories — "event management software," "project operations platform"
- **State of mind**: Evaluating categories and approaches
- **Questions**: "What kind of tool do I need? ERP? Event tool? PM tool? Something else?"
- **Content needed**: Category definition page, compare pages, solution overview
- **Best UI**: Solutions page (by role + industry), comparison tables, testimonials
- **CTA**: "Compare platforms" → "Watch a 5-min demo"

### Stage 3: Product Aware
- **Trigger**: Found us through search, referral, or comparison site
- **State of mind**: Evaluating us specifically. Multi-stakeholder. Risk-averse.
- **Questions**: "Can this replace our current stack? How does pricing work? Is it secure? Can it integrate with our systems?"
- **Pain points**: Switching cost anxiety, data security concerns, internal buy-in
- **Content needed**: Feature pages, security/trust center, customer stories, pricing, ROI calculator
- **Best UI**: Detailed feature pages, trust signals prominent, pricing transparent
- **CTA**: "Request a demo" / "Start free trial" / "Talk to sales"

### Stage 4: Trial / Evaluation
- **Trigger**: Signed up, requested demo
- **State of mind**: Skeptical optimism. Want to see it work for their specific problem.
- **Questions**: "How do I get started? Will this actually work for our use case?"
- **Pain points**: Onboarding friction, blank slate syndrome, unclear first steps
- **Content needed**: Interactive onboarding, guided tours, sample data, templates
- **Best UI**: Onboarding checklist (like Linear's getting started), progress indicators, AI Copilot guidance
- **CTA**: "Create your first event / project" (guided)

### Stage 5: Activation (Aha! Moment)
- **Definition**: User has successfully run their first event or project with the platform and experienced the value
- **Target**: ≤ 72 hours from signup to first "real" activity
- **Aha! Moments by persona**:
  - Ops Manager: "I can see all events in one calendar with no conflicts" 
  - Finance: "Every transaction has an audit trail I can export"
  - Developer: "The API docs are actually clear and the sandbox works"
- **Content needed**: In-app tooltips, contextual help, success messages
- **Best UI**: Empty states with clear CTAs, progress celebrations, AI suggestions

### Stage 6: Daily Usage
- **State of mind**: Platform is part of workflow. Evaluating depth and ROI.
- **Questions**: "How do I do [advanced task]? Can I set up this workflow automatically?"
- **Content needed**: Advanced guides, video tutorials, keyboard shortcut references, API docs
- **Best UI**: Command palette (Cmd+K), contextual help sidebar, AI Copilot in context
- **CTA**: Upgrade prompts (usage-based), invite team members

### Stage 7: Expansion
- **Trigger**: Team grows, more events added, new departments interested
- **State of mind**: Looking to scale. Finance now involved in decision.
- **Questions**: "What's the enterprise plan? Can we get dedicated support? Can I invite my whole team?"
- **Content needed**: Enterprise page, partner program, volume pricing
- **Best UI**: Team management features, role-based access, admin console
- **CTA**: "Upgrade to Enterprise" / "Talk to sales"

### Stage 8: Advocate
- **Trigger**: Platform has become critical infrastructure. High satisfaction.
- **Content needed**: Case study request, referral program, community invitation
- **Best UI**: NPS survey in-app, "Share your story" CTA, referral dashboard
- **CTA**: "Share your story" / "Join our community" / "Refer a colleague"

---

# PART 5: AUDIENCE PERSONA MATRIX

## 5.1 Primary Personas

### Persona 1: Ops Manager / Event Director (Primary Buyer + User)
- **Role**: Runs 3–20 events/year or manages ongoing project portfolio
- **Goals**: Coordination without chaos, visibility across teams, reliable execution
- **Pains**: Dropped tasks, double-booked venues, unclear status, manual chasing
- **Platform entry**: Solutions/event-organizers, blog, testimonials
- **Decision power**: High (budget owner or strong influencer)
- **Language they use**: "coordination," "calendar," "team," "deadline," "vendor," "approval"
- **Success metric**: Events run without crises

### Persona 2: Finance / CFO (Economic Buyer for Enterprise)
- **Role**: Signs off on platform budget. Approves financial governance tools.
- **Goals**: Financial accuracy, audit trails, compliance, cost control
- **Pains**: Manual reconciliation, no audit trail, financial discrepancies, compliance gaps
- **Platform entry**: Trust Center, security page, ROI calculator
- **Decision power**: Veto power on enterprise deals
- **Language they use**: "audit trail," "compliance," "reconciliation," "journal entry," "immutable," "approval"
- **Success metric**: Clean audits, no financial errors

### Persona 3: IT Admin / CTO (Technical Evaluator)
- **Role**: Evaluates security, integration, infrastructure, and data governance
- **Goals**: Platform must integrate, be secure, support SSO, be maintainable
- **Pains**: Shadow IT, no API, vendor lock-in risk, security unknowns
- **Platform entry**: Developer portal, security/trust center, API docs
- **Decision power**: Veto power on security/compliance grounds
- **Language they use**: "API," "SSO," "RLS," "multi-tenant," "GDPR," "data residency," "self-hosting"
- **Success metric**: Passes internal security review

### Persona 4: Operations Team Lead / Project Manager (Power User)
- **Role**: Manages day-to-day within the platform. Creates events, assigns resources, tracks progress.
- **Goals**: Efficient task completion, clear workflows, no duplicate work
- **Pains**: Slow tools, clunky UI, hard to find information, no mobile access
- **Platform entry**: Feature pages, templates, documentation
- **Decision power**: Strong influencer; advocates internally
- **Language they use**: "task," "checklist," "calendar," "assign," "status," "workflow," "approval"
- **Success metric**: Can complete core operations without friction

### Persona 5: Developer / System Integrator (Technical User + Expansion Driver)
- **Role**: Builds integrations, customizes workflows, extends the platform
- **Goals**: Clean APIs, good docs, sandbox environment, extensibility
- **Pains**: Poor API docs, no sandbox, undocumented edge cases, slow support
- **Platform entry**: Developer portal, API reference, GitHub
- **Decision power**: Can become internal champion or blocker
- **Language they use**: "REST API," "webhook," "SDK," "authentication," "rate limits," "idempotency"
- **Success metric**: Integration working in under a day

---

# PART 6: CONTENT STRATEGY

## 6.1 Content Ecosystem

### Tier 1: Evergreen Foundation Content
- Platform category definition page (owned, SEO-optimized, AEO-ready)
- Feature pages (one per major capability)
- Solutions pages (one per persona + industry)
- Pricing page (transparent, with ROI calculator)
- Trust Center
- Documentation

### Tier 2: Lead Generation Content
- **Guides** (5,000+ words, gated): "The Complete Guide to Running Auditable Events," "Event Operations Playbook," "Finance Leader's Guide to Event ROI"
- **Templates**: Event planning checklist, venue booking template, budget tracker
- **Industry reports**: Annual State of Event Operations (original research)
- **Comparison pages**: "vs Cvent," "vs Monday," "vs Asana," "vs Eventbrite"
- **ROI calculators**: "How much does coordination chaos cost you per year?"

### Tier 3: Authority and SEO Content (Blog)
- Problem-aware articles: "Why your event always goes over budget" / "The hidden cost of fragmented ops tools"
- Solution-aware: "How to choose an event management platform" / "What event + project operations teams actually need"
- Thought leadership: "Why AI in operations needs a human approval layer"
- Instructional: "How to set up a zero-conflict booking system" / "Building an audit trail for events"

### Tier 4: Customer Education Content
- Knowledge Base articles (task-focused, how-to)
- Video tutorials (3–8 min per topic)
- Academy courses (structured, multi-lesson)
- Webinars (live + on-demand)
- Changelog (weekly updates)

### Tier 5: Social Proof Content
- Customer stories (narrative format, problem → solution → results)
- Testimonials (short quotes by persona)
- Case studies (detailed, metrics-driven)
- Community forum highlights

## 6.2 Content Calendar Framework

| Cadence | Format | Channel | Volume |
|---------|--------|---------|--------|
| Weekly | Blog post (SEO/problem-aware) | Blog, LinkedIn, email | 1–2/week |
| Bi-weekly | Tutorial video | YouTube, in-app | 1/2 weeks |
| Monthly | Webinar | Live + recording | 1/month |
| Quarterly | Industry report or guide | Gated, promoted | 1/quarter |
| Ongoing | Knowledge Base updates | Help center | As needed |
| Ad-hoc | Customer story | Website, LinkedIn, sales | 1/month |

---

# PART 7: COPYWRITING SYSTEM

## 7.1 Voice & Tone Framework

### Brand Voice
Inspired by Linear's clarity + Stripe's authority + Supabase's approachability

| Dimension | Description | Example |
|-----------|-------------|---------|
| **Confident** | We know what we're doing. Direct, no hedging. | "Run events without dropped balls." NOT "We try to help you..." |
| **Clear** | Simple language. Professionals want clarity, not jargon. | "See every booking conflict before it happens." NOT "Leverage our AI-powered spatial conflict engine." |
| **Human** | We talk like people, not corporations. | "Your team spent 3 hours reconciling that budget. You shouldn't have to." |
| **Trustworthy** | We prove claims with specifics, not adjectives. | "Every transaction has a timestamp, actor ID, and trace." NOT "Best-in-class audit capabilities." |
| **Focused** | We're for operations teams. Not everyone. | "Built for teams that run real operations." |

### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| **Homepage hero** | Confident, bold | "Run events and projects without the chaos." |
| **Feature page** | Explanatory, precise | "Bookings are stored with a GiST index that prevents conflicts at the database level." |
| **Error messages** | Calm, helpful, specific | "The venue is already booked from 10:00–12:00. Select a different time or choose another room." |
| **Success states** | Warm, brief | "Event created. Your team can now see it in the calendar." |
| **Empty states** | Encouraging, actionable | "No events yet. Create your first one to get started." |
| **Documentation** | Technical, precise, example-first | Lead with code/example, then explain |
| **Trust Center** | Formal, specific | "SOC 2 Type II certified. Annual penetration tests by [firm]." |
| **Onboarding** | Friendly, step-by-step | "Let's set up your first event. It takes about 3 minutes." |

## 7.2 Headline Formula Bank

### Problem-Frame Headlines
- "Your events run fine — until they don't."
- "[X] events coordinated by [Y] teams. Somehow, it all works."
- "The spreadsheet was fine until you had 47 of them."

### Solution Headlines
- "One system for every event, project, and the finance behind it."
- "From planning to audit, without switching tools."
- "The operations platform that actually shows you what's happening."

### Benefit Headlines
- "No more reconciling. No more chasing. No more surprises."
- "Run events the same way twice. Then a hundred times."
- "When the CFO asks, you'll have the answer."

### CTA Copy
| Context | CTA text |
|---------|---------|
| Primary homepage | Start free trial |
| Enterprise evaluation | Request a demo |
| Documentation entry | Read the docs |
| Template download | Get the template |
| Customer story | Read [Company]'s story |
| Learning center | Start learning |
| Trust Center | View security details |
| Status | Check system status |

## 7.3 UX Microcopy Standards

### Empty States
Formula: `[Entity icon] + [Short title] + [Context sentence] + [Action CTA]`
- "No events yet. Create your first event to bring your team together."
- "No access passes issued. Publish your event to start issuing passes."

### Error Messages
Formula: `[What happened] + [Why] + [What to do]`
- ✅ "Booking failed. Room A102 is unavailable from 10:00–12:00 on July 3. Select a different time or room."
- ❌ "An error occurred. Please try again."

### Success Messages
Formula: `[What happened] + [What happens next (optional)]`
- "Event created. Your team will receive a notification."
- "Payment captured. Receipt sent to customer's email."

### Loading States
Formula: `[Active verb]...`
- "Loading calendar..." NOT "Please wait..."
- "Saving..." NOT "Processing request..."

### Form Labels
Formula: `[Noun phrase, title case]` — Never questions, never jargon
- ✅ "Event Name" / "Start Date" / "Venue"
- ❌ "What do you want to call this event?" / "GeoCoordinate Location"

### Placeholders
- Use for format hints only, not instructions
- ✅ "YYYY-MM-DD" / "events@company.com"
- ❌ "Enter your event name here"

---

# PART 8: UX WRITING GUIDELINES

## 8.1 The Interface Test (Extended)
> "If an operations manager is solving a crisis at 11 PM, does this copy help or slow them down?"

## 8.2 Writing Principles

1. **Outcome-first** — Lead with what the user achieves, not what the system does
2. **Specific over vague** — "47 events coordinated" > "many events"
3. **Active voice** — "Create an event" > "An event can be created"
4. **Progressive disclosure** — Show simple first, reveal detail on demand
5. **Consistent terminology** — Use the Ubiquitous Language from Layer-1 (AccessPass, Booking, Supplier, Facility, TicketType, Workflow). Never improvise synonyms.

## 8.3 Forbidden Patterns
- **Never** use: "robust," "seamless," "powerful," "game-changing," "revolutionary," "innovative"
- **Never** expose internal architecture terms in UI copy: "immutable ledger," "hexagonal architecture," "DDD," "bounded context"
- **Never** write vague error messages: "Something went wrong"
- **Never** write empty empty states: just show a blank screen with no guidance

## 8.4 Terminology Reference (Mandatory — from Layer-1 Ubiquitous Language)
| ✅ Use | ❌ Never use |
|--------|------------|
| AccessPass | Ticket, Token, Pass |
| Booking | Reservation, Appointment, Order |
| Supplier | Vendor, Provider |
| Facility | Space, Location, Venue (unless geographic context) |
| TicketType | TicketTier, PassType |
| Workflow | Process, Flow |
| Tenant | Organization, Company, Client (in API context) |

---

# PART 9: COMPONENT LIBRARY (CONTENT)

## 9.1 Marketing Site Components

### Hero
- **Structure**: Eyebrow tag → H1 (Problem/outcome) → Supporting subhead → CTA pair → Social proof strip
- **Content rules**: H1 ≤ 8 words. Subhead ≤ 25 words. CTA pair = primary + secondary.
- **Example**: "Run Events Without the Chaos" / "One platform for event coordination, project management, finance, and audit — built for operations teams."

### Problem Section
- **Purpose**: Name the pain before showing the solution
- **Structure**: Problem statement + 3 pain pillars (icon + label + 1 sentence)
- **Tone**: Empathetic, not alarmist

### Benefits Grid (Bento)
- **Structure**: 2–3 column card grid, each card: icon + headline + 1–2 sentences + optional screenshot
- **Content rules**: Benefit-first (not feature-first). "See every conflict before it happens" not "GiST-indexed spatial booking."

### Comparison Table
- **Structure**: Feature rows × competitor columns
- **Content rules**: Be fair and accurate. Only compare on genuine differentiators.

### Workflow Diagram
- **Purpose**: Show how work actually flows through the platform
- **Format**: Step-by-step numbered flow or swimlane diagram

### Customer Story Card
- **Structure**: Logo + quote (25–40 words) + person name + role + company + industry tag
- **Rules**: Quote must be specific, outcome-focused ("We cut reconciliation time by 60%" > "We love the platform")

### Metrics / Proof Bar
- **Structure**: 3–4 key metrics in a horizontal strip
- **Example**: "500+ events coordinated / 99.9% uptime / 10,000+ bookings processed"

### FAQ Component
- **Structure**: Accordion, question-first
- **Content rules**: Write questions the way buyers actually ask them. Use schema markup.

### Pricing Table
- **Structure**: 3 tiers (Free/Pro/Enterprise), feature grid, CTA per tier
- **Rules**: Show value per tier clearly. Don't hide limits. Include ROI calculator link.

### Trust Banner
- **Structure**: Horizontal strip of security badges/certifications
- **Content**: SOC 2, GDPR-ready, ISO 27001 (when applicable), uptime %, encryption

### Compliance Badge
- **Per-badge tooltip**: Explains what each certification means in plain language

---

# PART 10: WEBSITE PAGE BLUEPRINTS

## 10.1 Homepage Blueprint

```
[HEADER: Nav + CTAs]
[HERO: Problem → Platform → Proof + CTA pair]
  - H1: "Run Events and Projects Without the Chaos"
  - Subhead: One coordinated platform for scheduling, resources, finance, and audit.
  - CTA: [Start Free] [Watch Demo]
[SOCIAL PROOF STRIP: Customer logos]
[PROBLEM SECTION: 3 pain points]
  - Fragmented tools → coordination chaos
  - No visibility → dropped balls
  - No audit trail → compliance risk
[PLATFORM OVERVIEW: 3 pillars with screenshots]
  - Plan & Coordinate
  - Execute & Track
  - Audit & Report
[FEATURE HIGHLIGHTS: Bento grid, 6 cards]
[CUSTOMER STORY: 1 featured quote + video]
[METRICS BAR: Social proof numbers]
[FINAL CTA: Start Free Trial / Request Demo]
[FOOTER]
```

## 10.2 Feature Page Blueprint (e.g., Financial Management)

```
[HEADER]
[HERO: Specific pain + specific solution]
  - "Every transaction. Full audit trail. No exceptions."
[FEATURE DETAIL: 3–4 sections, each: description + screenshot + proof point]
[HOW IT WORKS: Step-by-step workflow]
[COMPLIANCE CALLOUT: Audit-grade, immutable, exportable]
[CUSTOMER QUOTE: Finance-specific]
[RELATED FEATURES: Cross-links]
[CTA: Start trial / Request demo]
```

## 10.3 Pricing Page Blueprint

```
[HEADER]
[PRICING HEADLINE: Clear, honest]
  - "Simple pricing that grows with your operations"
[TIER CARDS: Free | Pro | Enterprise]
[FEATURE COMPARISON TABLE: Full matrix]
[ROI CALCULATOR: Interactive]
[FAQ: 6–8 pricing-specific questions]
[TRUST SIGNALS: Security + uptime]
[ENTERPRISE CTA: "Talk to our team"]
```

## 10.4 Trust Center Blueprint

```
[HEADER]
[TRUST HERO: "Security and compliance built into every layer"]
[CERTIFICATION BADGES: SOC 2, GDPR, ISO (with tooltips)]
[SECURITY PILLARS: 4 sections]
  - Data encryption (at rest + in transit)
  - Access control (RLS, tenant isolation)
  - Infrastructure (availability zones, backups)
  - Audit (immutable logs, export)
[DOWNLOAD CENTER: SOC 2 summary, DPA, security whitepaper]
[COMPLIANCE TABLE: By regulation / framework]
[CONTACT: "Talk to our security team"]
```

---

# PART 11: DOCUMENTATION BLUEPRINT

## 11.1 Documentation IA (Inspired by Stripe + Supabase)

```
/docs
├── Getting Started
│   ├── What is [Platform]?
│   ├── Core concepts (5-minute read)
│   ├── Quickstart (your first event in 5 steps)
│   └── Self-hosting setup
│
├── Concepts (Domain-first understanding)
│   ├── Platform overview
│   ├── Tenant model
│   ├── Event model (AccessPass, TicketType, Booking)
│   ├── Project model
│   ├── Resource / Facility model
│   ├── Financial model (Ledger, Journal)
│   ├── Workflow & Approval model
│   └── AI & Agents (L-06 governance)
│
├── Guides (Task-oriented, step-by-step)
│   ├── Create and publish an event
│   ├── Configure venue/facility
│   ├── Issue and manage access passes
│   ├── Set up approval workflows
│   ├── Financial reconciliation
│   ├── Run an audit report
│   └── Integrate with payment gateway
│
├── Modules (Feature reference)
│   ├── Events
│   ├── Projects
│   ├── Resources & Scheduling
│   ├── Finance & Ledger
│   ├── Approvals & Workflows
│   ├── AI Assistant
│   ├── Reports & Analytics
│   └── Administration
│
├── API Reference
│   ├── Authentication
│   ├── Endpoints (auto-generated from OpenAPI)
│   ├── Webhooks
│   ├── Rate limits
│   ├── Idempotency
│   └── Error codes
│
├── Integrations
│   ├── Payment gateways (Stripe, Midtrans, Xendit)
│   ├── Calendar sync
│   ├── HR systems
│   └── Custom webhooks
│
└── Self-hosting
    ├── Requirements
    ├── Docker setup
    ├── Environment variables
    ├── Database migrations
    └── Upgrading
```

## 11.2 Documentation UX Standards (Inspired by Stripe)

1. **Search as primary navigation** — Full-text, AI-powered, <30s time-to-answer
2. **Code examples in every guide** — Never describe without showing
3. **Language selector** — Code examples in TypeScript, Python, and cURL minimum
4. **"Try it" sandbox** — Every API endpoint has a live test widget
5. **Feedback per page** — "Was this helpful?" with GitHub edit link
6. **Breadcrumb navigation** — Always clear where you are
7. **Related articles** — Context-aware at page bottom
8. **Version selector** — For breaking changes / migrations
9. **`llms.txt` file** — Optimized for AI indexing (GEO strategy)

---

# PART 12: LEARNING CENTER BLUEPRINT

## 12.1 Academy Structure

```
Learning Center
├── Learning Paths (role-based, sequential)
│   ├── Operations Manager path (6 modules)
│   ├── Finance Team path (4 modules)
│   ├── Developer path (5 modules)
│   └── Admin path (4 modules)
│
├── Quick Start Videos (3–5 min each)
│   ├── Create your first event
│   ├── Set up your venue
│   ├── Invite your team
│   └── Run your first financial report
│
├── Deep Dives (15–30 min)
│   ├── Mastering the booking calendar
│   ├── Financial audit walkthrough
│   ├── Advanced approval workflows
│   └── API integration workshop
│
├── Webinar Library
│   ├── Live sessions (monthly)
│   └── Recordings (searchable)
│
├── Certification
│   ├── Platform Operator Certification
│   ├── Finance Specialist Certification
│   └── Developer Certification
│
└── Glossary
    └── All canonical terms with definitions
```

---

# PART 13: HELP CENTER BLUEPRINT

## 13.1 Help Center IA

```
Help Center
├── [Search bar - prominently above fold]
│
├── Getting Started (5–8 articles)
│   ├── Account setup
│   ├── Inviting team members
│   ├── Creating your first event
│   └── Understanding the dashboard
│
├── Features (organized by module)
│   ├── Events & Access Passes
│   ├── Projects & Tasks
│   ├── Scheduling & Resources
│   ├── Finance & Payments
│   ├── Approvals & Workflows
│   └── Reports & Exports
│
├── Troubleshooting
│   ├── Login issues
│   ├── Payment errors
│   ├── Calendar sync problems
│   └── Export issues
│
├── Account & Billing
│   ├── Plans and pricing
│   ├── Invoices
│   ├── Cancellation
│   └── Team permissions
│
├── Contact Support
│   ├── Chat (for Pro+)
│   ├── Email support form
│   └── Enterprise: dedicated CSM
│
└── Community Forum
    └── Link to community platform
```

---

# PART 14: BLOG STRATEGY

## 14.1 Content Pillars

| Pillar | Topics | SEO Intent | Persona |
|--------|--------|------------|---------|
| **Operations Intelligence** | How to run events without chaos, coordination best practices | Problem-aware | Ops Manager |
| **Finance & Compliance** | Audit trails, financial accuracy for events, compliance guides | Problem-aware | Finance |
| **AI in Operations** | Safe AI use, L-06 guardrails, practical AI for ops teams | Solution-aware | CTO, Ops Manager |
| **Industry Playbooks** | Corporate events, university events, venue operations | Solution-aware | Industry buyer |
| **Platform Education** | How-to articles, feature deep-dives, integration guides | Product-aware | All users |
| **Thought Leadership** | Future of event ops, industry trends, original research | Brand-building | All |

## 14.2 Blog Content Formats
- **Long-form guides** (2,500–5,000 words): Pillar content, evergreen, SEO-optimized
- **How-to articles** (800–1,500 words): Task-focused, instructional
- **Opinion / thought leadership** (1,000–2,000 words): Named author, original perspective
- **Data reports** (1,000–2,500 words + data visualizations): Original research, highly shareable

---

# PART 15: SEO / AEO / GEO STRATEGY

## 15.1 Integrated Discoverability Framework

### SEO (Search Engine Optimization)
- **Technical foundation**: Page speed (LCP <2s), mobile-first, structured data, canonical tags
- **Topical authority**: 5 content clusters (Event Operations, Project Management, Venue Management, Financial Audit, AI in Operations)
- **Pillar + cluster**: Each pillar page links to 8–12 supporting articles
- **Internal linking**: Every article links to relevant feature/solution pages

### AEO (Answer Engine Optimization)
- **FAQ schema** on all pricing, help, and feature pages
- **HowTo schema** on all guide/tutorial pages
- **SoftwareApplication schema** on product pages
- **Answer-first writing**: Lead every article with the direct answer in the first paragraph
- **Voice-friendly**: Short, specific answers (≤40 words) for featured snippets

### GEO (Generative Engine Optimization — LLM Optimization)
- **`llms.txt` file**: Structured summary of platform for AI crawlers
- **Entity consistency**: Platform name, feature names, and canonical terminology used consistently across all pages and third-party mentions
- **Authoritative data**: Publish original research and statistics (models prefer citing data)
- **Structured content**: Use HTML tables, numbered lists, and clear headings — LLMs synthesize structured content better
- **"Prompt Universe" coverage**: Answer the questions that buyers ask AI assistants before visiting websites
  - "What's the best platform for managing corporate events with financial tracking?"
  - "How do I build an audit-grade event management system?"
  - "Cvent vs alternatives for enterprise event operations"

## 15.2 Keyword Strategy

| Cluster | Primary Keywords | Supporting Keywords |
|---------|-----------------|-------------------|
| Event Operations | event operations platform, event management software enterprise | multi-event coordination, venue booking system, event audit trail |
| Project Management | project operations software, project event management | project coordination platform, operations project management |
| Financial Audit | event financial management, audit-grade operations, event budget tracking | event reconciliation software, event compliance platform |
| AI Operations | AI event management, AI project coordination | safe AI for operations, AI approval workflow |
| Venue/Facility | facility booking system, venue management software | resource scheduling software, conflict-free booking |

---

# PART 16: CONVERSION OPTIMIZATION REPORT

## 16.1 Enterprise Conversion Framework

### Trust Signals That Convert
1. **Compliance badges above fold** — SOC 2, GDPR immediately visible
2. **Named customer logos** — Real companies, not "customers include..."
3. **Specific metrics** — "99.9% uptime" not "highly reliable"
4. **Transparent pricing** — Enterprise anxiety peaks at hidden pricing
5. **Quick-response promise** — "Demo within 24 hours" reduces hesitation

### Objection Pre-emption Matrix

| Objection | Where they raise it | Content that resolves it |
|-----------|--------------------|-----------------------------|
| "Too expensive" | Pricing page | ROI calculator + cost-of-chaos comparison |
| "Too complex to implement" | Feature pages, demo | Implementation timeline guide, "up in 2 weeks" case study |
| "Not secure enough" | Security/Trust Center | SOC 2 summary, architecture diagram, penetration test summary |
| "We already have tools" | Solutions pages | "Replace your stack" comparison table + migration guide |
| "Team won't adopt it" | Onboarding, training pages | Guided onboarding timeline, Academy resources |
| "We can't migrate our data" | Implementation page | "How migration works" guide + data export formats |

### Pricing Psychology
- Use anchor pricing: Show Enterprise as aspirational, make Pro feel reasonable
- Show the cost of NOT having the platform (opportunity cost framing)
- "Free" tier removes risk from self-directed evaluation
- Annual pricing = 20% discount = natural upgrade incentive

---

# PART 17: TRUST & CREDIBILITY FRAMEWORK

## 17.1 Trust Ecosystem Architecture

### Layer 1: Technical Trust
- SOC 2 Type II certification (priority)
- ISO 27001 (roadmap)
- GDPR data processing agreements
- Penetration test results (summarized)
- 99.9% uptime SLA + live status page
- Data residency options

### Layer 2: Operational Trust
- Immutable audit trail (built into architecture — L-02)
- Role-based access control (RBAC)
- Tenant data isolation (RLS — L-05)
- AI approval workflow (L-06 — AI only proposes, human approves)
- Soft delete — no data loss (L-03)

### Layer 3: Social Trust
- Named customer stories with specific metrics
- Partner ecosystem (implementation partners)
- Open source contributions (if applicable — builds community trust)
- Transparent changelog and roadmap
- Responsive community and support

### Layer 4: Business Trust
- Clear pricing (no hidden fees)
- Data portability (export in standard formats)
- No vendor lock-in architecture (open standards)
- Clear cancellation policy
- Dedicated CSM for Enterprise

---

# PART 18: INFORMATION ARCHITECTURE (UPDATED)

## 18.1 IA Principles
1. **User-needs first** — Every section exists because a specific persona needs it at a specific journey stage
2. **Single source of truth** — No duplicate information across sections
3. **Progressive disclosure** — Simple overview → detail on demand
4. **Audience-segmented** — Different paths for Ops, Finance, Developer, IT Admin
5. **AI-optimized** — Structured for both human navigation and LLM indexing

## 18.2 Navigation System Design

### Primary Navigation (7 items max)
`Platform` | `Solutions` | `Pricing` | `Resources` | `Docs` | `[Sign in]` | `[Start Free]`

### Mega Menu Principles
- Organize by **outcome**, not by feature name
- Include visual thumbnails for major categories
- Show "Featured" items (most popular or contextually relevant)
- Include search within mega menu

### Breadcrumb System
- Full path: `Home > Solutions > Event Organizers`
- Schema markup for SEO
- Consistent across all pages

---

# PART 19: NAVIGATION SYSTEM

## 19.1 Navigation by User Type

### First-time visitor path
`Home → Solutions (by role/industry) → Feature page → Pricing → Request Demo`

### Returning evaluator path
`Direct link → Trust Center / Security → Customer story → Pricing → Start Trial`

### Developer evaluator path
`Home → Developer Portal → API Docs → Sandbox → Pricing`

### Existing user path (in-product)
`Dashboard → Docs → Help Center → Support`

---

# PART 20: DESIGN CONTENT PATTERNS

## 20.1 In-Product Experience

### Onboarding Checklist (inspired by Linear)
```
Getting Started (5 steps)
☐ Create your organization
☐ Set up your first event
☐ Configure your venue/facility  
☐ Invite your team
☐ Run your first report
```

### Empty State Pattern
```
[Contextual icon]
[Short title: "No events yet"]
[1-sentence context: "Events you create will appear here"]
[Primary CTA: "Create Event"]
[Secondary: "Browse templates"]
```

### AI Copilot Suggestions (L-06 compliant)
- Always show as "suggestion" not "action"
- Requires explicit human confirmation
- Shows confidence level + source
- "AI suggested this booking based on past patterns. Review and approve."

### Command Palette (Cmd+K)
- Search across all entities
- Quick create (new event, new booking, new task)
- Navigation shortcuts
- Recent items

---

# PART 21: PRODUCT MESSAGING FRAMEWORK

## 21.1 Core Message Architecture

### Primary Message (All audiences)
"Run events and projects without the chaos — with visibility, accountability, and audit built in."

### Audience-Specific Messages

| Persona | Message | Proof point |
|---------|---------|-------------|
| Ops Manager | "Coordinate every event and project from one place. No more chasing updates." | Calendar view, team notifications, approval flows |
| Finance / CFO | "Every transaction has an audit trail. Every approval is recorded. Always." | Immutable ledger, journal entries, export-ready reports |
| IT Admin / CTO | "Multi-tenant. RLS. SOC 2 aligned. API-first. Open standards." | Technical architecture, security docs, API reference |
| Developer | "Clean API. Real documentation. A sandbox that works." | API docs, sample apps, webhooks reference |
| Ops Team Lead | "See status, resources, and tasks in one view. Keyboard shortcuts and all." | Dashboard, Stoic UX, command palette |

## 21.2 Product Pillars (3 P's)
1. **Plan**: Event & project creation, scheduling, resource allocation
2. **Execute**: Team coordination, approvals, real-time status, AI assistance
3. **Prove**: Immutable audit trail, financial records, compliance-ready exports

---

# PART 22: BRAND MESSAGING FRAMEWORK

## 22.1 Brand Narrative
> The world's most reliable operations aren't managed by the most powerful software — they're managed by teams who can see everything, trust their tools, and prove what happened.

## 22.2 Brand Pillars
1. **Reliability** — "It works. Every time."
2. **Clarity** — "You always know what's happening."
3. **Accountability** — "Everything has a record."
4. **Intelligence** — "AI that helps without replacing judgment."

## 22.3 Tagline Options (for naming phase)
- "Operations, without the chaos."
- "Every event. Every project. Every record."
- "Run it. Track it. Prove it."
- "Operations teams deserve better tools."

---

# PART 23: ENTERPRISE MARKETING FRAMEWORK

## 23.1 Enterprise GTM Strategy

### Top-down Approach (Executive/Economic Buyer)
- Content: ROI calculators, compliance whitepapers, industry reports
- Channels: LinkedIn, industry events, direct outreach, partner referrals
- CTA: Request executive briefing / demo with leadership

### Bottom-up Approach (Practitioner/Power User)
- Content: Free tier, templates, documentation, community
- Channels: Product-led growth, SEO, developer community, word-of-mouth
- CTA: Start free trial

### Partner / Channel Approach
- Implementation partners (system integrators, consulting firms)
- Technology partners (payment gateways, HR systems, calendar providers)
- Partner program with co-marketing and revenue sharing

## 23.2 ABM (Account-Based Marketing) Framework
- Target: Top 100 enterprise accounts by industry
- Content: Personalized case studies by industry + company size
- Outreach: Multi-stakeholder engagement (Ops + Finance + IT)
- Sales assist: Security documentation, ROI calculator, reference customers

---

# PART 24: IMPLEMENTATION PRIORITIES

## 24.1 Phase 1 — Foundation (0–3 months)
**Goal**: Get the basics right. Convert evaluators who find us.

| Priority | Task | Owner |
|----------|------|-------|
| P0 | Homepage rewrite (this framework) | Product + Design |
| P0 | Documentation MVP (Getting Started + Concepts + Guides) | Engineering + Content |
| P0 | Trust Center (security page) | Product + Legal |
| P1 | 3 Customer stories (one per ICP) | Content |
| P1 | Pricing page with ROI calculator | Product + Design |
| P1 | Blog: 5 foundation articles (pillar content) | Content |
| P2 | Feature pages (6 core features) | Product + Design |
| P2 | Solutions pages (3 primary personas) | Product + Content |

## 24.2 Phase 2 — Education (3–6 months)
**Goal**: Reduce churn, increase activation, enable self-serve.

| Priority | Task | Owner |
|----------|------|-------|
| P0 | Help Center (50 core articles) | Content |
| P0 | In-product onboarding (guided tour) | Product + Engineering |
| P1 | Learning Center MVP (Getting Started path per persona) | Content |
| P1 | SEO content (20 blog articles across 5 pillars) | Content |
| P1 | Templates (5 core templates downloadable) | Product |
| P2 | Webinar series (monthly) | Marketing |
| P2 | API docs with interactive sandbox | Engineering + DX |

## 24.3 Phase 3 — Authority (6–12 months)
**Goal**: Become the topical authority in Event & Project Operations.

| Priority | Task | Owner |
|----------|------|-------|
| P0 | Annual State of Event Operations report (original research) | Marketing |
| P0 | Certification program (Platform Operator) | Learning |
| P1 | Academy courses (full per-persona paths) | Learning |
| P1 | Partner marketplace | Business Development |
| P1 | Community platform | Community |
| P2 | GEO strategy (llms.txt, entity optimization) | SEO |
| P2 | Compare pages (vs Cvent, vs Monday, vs Asana) | Content |
| P2 | Industry pages (6 verticals) | Product + Content |

---

## APPENDIX A: KEY DECISIONS REQUIRED

> These require team input before implementation:

1. **Platform name** — The current "neutral" approach needs a final brand name before Phase 1 homepage launch
2. **Self-host vs SaaS launch order** — Which goes first? Affects developer portal priority
3. **Free tier scope** — What's included? Determines bottom-up PLG effectiveness
4. **Indonesia vs global first** — Language, localization, and regional trust signals (Xendit/Midtrans integration vs Stripe)
5. **Certification timeline** — SOC 2 Type II needs months of preparation; drives Trust Center launch

## APPENDIX B: REFERENCE BENCHMARKS USED

| Company | What we studied |
|---------|----------------|
| Stripe | IA, copywriting, docs UX, trust signals, bento grid layout |
| Linear | Brand voice, opinionated UX, changelog format, messaging |
| Supabase | Developer docs, community building, open-source positioning |
| Vercel | Deployment UX, edge case handling, "try it now" sandbox |
| GitHub | Docs search, navigation, code-first documentation |
| Atlassian | Solution-by-team-type IA, enterprise trust content |
| Cvent | Event management depth, certification program, enterprise content |
| Bizzabo | Modern event UX, B2B event focus |
| Xendit | Indonesia B2B fintech credibility signals, API-first positioning |
| Mayar.id | Indonesia SMB UX, all-in-one simplicity |

---

*This document is the strategic foundation for the Product Experience phase. It aligns with and extends the existing brand, product, and strategy documents. All canonical terminology follows Layer-1 Ubiquitous Language. When in conflict with specific volume content, this document prevails only in marketing/product context — engineering implementation still follows Layer-1 > Layer-2 > Layer-3.*

*Next action: Create implementation task list in task.md and begin Phase 1 execution.*
