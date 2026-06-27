# Homepage Blueprint

## Moventios

**Version:** 1.0  
**Date:** June 2026  
**Authority:** product-experience-research.md Part 10 | copywriting-system.md  
**Owner:** Product + Design  
**Status:** Ready for design handoff

> This document is the **content wireframe** for the homepage.  
> It defines structure, copy, components, and decision points — not visual design.  
> For design tokens and component specs, see `docs/volumes/08-product.md`.

---

## Page Goal

Convert unknown visitors into:

1. **Engaged evaluators** → watch demo or read further
2. **Self-serve starters** → begin free trial
3. **Enterprise prospects** → request a demo

**Primary KPI:** Demo requests + Free trial signups  
**Secondary KPI:** Time-on-page, scroll depth, customer story CTR

---

## Section 1: HERO

**Component:** Full-viewport hero with CTA pair  
**Purpose:** Frame the problem, introduce the platform, drive first action  
**Audience:** All — unknown visitor

### Copy

```
[Eyebrow tag — small caps, accent color]
AI-Native Moventios

[H1 — bold, 6–8 words]
Run Events and Projects
Without the Chaos

[Subheadline — 20–25 words, lighter weight]
One coordinated system for scheduling, resources, teams,
finance, approvals, and audit — built for operations professionals.

[CTA pair]
[PRIMARY: Start Free →]    [SECONDARY: Watch 3-min demo ▶]

[Micro-trust line below CTAs]
No credit card required · Free for your first 2 events · Cancel anytime
```

### Design Notes

- H1: 2-line break creates visual rhythm (as above)
- Background: Deep onyx (`--color-bg-base: #09090b`) with subtle grid texture
- CTA Primary: Violet accent (`--color-accent: #7c3aed`)
- Optional: Subtle animated dashboard screenshot or product video (autoplay, muted) as background element
- Mobile: Stack CTAs vertically, reduce H1 to 1 line

---

## Section 2: SOCIAL PROOF STRIP

**Component:** Logo bar (customer logos + optional metrics)  
**Purpose:** Immediate trust signal — "real organizations use this"  
**Audience:** All

```
[Label in small caps, muted color]
TRUSTED BY OPERATIONS TEAMS AT

[Row of 5–8 customer logos — grayscale, high quality]
[Company 1]  [Company 2]  [Company 3]  [Company 4]  [Company 5]

[Optional metrics below logos]
500+ events coordinated  ·  99.9% uptime  ·  0 double-bookings
```

### Notes

- Logos: grayscale on hover → color (subtle animation)
- If no real customers yet: use metrics only, or placeholder with "Launch customers"
- Must be real companies — never generic silhouette logos

---

## Section 3: PROBLEM SECTION

**Component:** 3-column problem statement  
**Purpose:** Name the pain before presenting the solution. Creates emotional connection.  
**Audience:** Problem-aware visitor

### Headline

```
[H2]
Operations teams deserve better than this.
```

### 3 Pain Pillars

```
[Icon: broken chain / fragmented]
[Title] Fragmented tools, fragmented work
[Body] Your team uses one tool for events, another for projects,
       another for finance — and nothing talks to each other.
       Coordination happens in email threads and WhatsApp groups.

[Icon: eye with X / no visibility]
[Title] No one knows what's actually happening
[Body] Status lives in someone's head. Resource conflicts surface
       the day of the event. Budget overruns discovered too late.

[Icon: file with question mark / no audit]
[Title] No audit trail when things go wrong
[Body] When the CFO asks what happened to that payment, or the venue
       wants proof of the booking — you're digging through spreadsheets.
```

---

## Section 4: PLATFORM OVERVIEW (3 Pillars)

**Component:** 3-column feature overview with screenshots  
**Purpose:** Introduce the platform's value in 3 clear pillars  
**Audience:** Solution-aware visitor

### Headline

```
[H2]
One platform. Every stage of your operation.
```

### 3 Pillars

```
[Pillar 1 — with screenshot/illustration]
[Number/Icon] Plan & Coordinate
Schedule events and projects. Allocate resources and venues
without conflicts. Assign teams. Set budgets.
[→ See scheduling features]

[Pillar 2 — with screenshot/illustration]
[Number/Icon] Execute & Track
Run approvals, track progress, manage vendors and attendees,
and stay on top of issues — in real time.
[→ See execution features]

[Pillar 3 — with screenshot/illustration]
[Number/Icon] Audit & Report
Every action. Every transaction. Every approval. Recorded and
exportable — so you can always prove what happened.
[→ See audit & finance features]
```

---

## Section 5: FEATURE HIGHLIGHTS (BENTO GRID)

**Component:** Bento-style card grid (2×3 or asymmetric)  
**Purpose:** Show feature depth without overwhelming  
**Audience:** Evaluator (feature-curious)

### Headline

```
[H2]
Everything your operations team needs.
Nothing they don't.
```

### 6 Feature Cards

```
[Card 1 — Large, top-left]
Zero Booking Conflicts
[Icon: calendar lock]
Every venue, room, and resource booking is checked against the
calendar at creation. Double-bookings are structurally impossible.
[Screenshot: conflict warning UI]

[Card 2 — Medium, top-right]
Full Audit Trail
[Icon: shield + checkmark]
Every transaction, approval, and state change is timestamped
and attributed to an actor. Export-ready at any time.

[Card 3 — Medium, mid-left]
AI That Assists — You Decide
[Icon: AI + human icon]
AI suggestions for scheduling, resource allocation, and
document extraction — with mandatory human approval on every change.

[Card 4 — Small, mid-right]
Real-Time Team Visibility
[Icon: eye]
Everyone sees the same calendar, the same status, the same numbers.

[Card 5 — Small, bottom-left]
Financial Integrity
[Icon: ledger]
Double-entry accounting for events. Immutable records.
No retroactive edits — ever.

[Card 6 — Large, bottom-right]
Built to Scale
[Icon: building / enterprise]
Multi-tenant architecture. Role-based permissions. SSO.
Data isolation per organization. From 10 to 10,000 users.
```

---

## Section 6: CUSTOMER STORY

**Component:** Featured customer story  
**Purpose:** Social proof with specific outcomes  
**Audience:** Late-stage evaluator

### Structure

```
[H2 — eyebrow]
Real teams. Real results.

[Story card]
[Customer logo]
[Photo + name + role + company]

[Quote — 40–60 words]
"Before this platform, reconciling our event budgets took the
finance team 3 full days after every event. Now it's done in
real time — and when auditors ask for records, we have everything
in one export. We couldn't go back."

— Reza Firmansyah, CFO, Artha Events

[Tag: Corporate Events | 200+ events/year]

[CTA: Read Artha Events' story →]
```

---

## Section 7: METRICS BAR

**Component:** Horizontal metrics strip  
**Purpose:** Quantified social proof  
**Audience:** All

```
[Metric 1]          [Metric 2]         [Metric 3]         [Metric 4]
500+                99.9%              0                   2 weeks
Events              Uptime SLA         Double-bookings     Average time
coordinated                            ever                to full setup
```

_Update with real metrics as they become available. Placeholder is acceptable during launch._

---

## Section 8: FINAL CTA (CONVERSION)

**Component:** Full-width CTA block  
**Purpose:** Final push to trial or demo  
**Audience:** All who reached this far

```
[H2]
Ready to run operations without the chaos?

[Supporting line]
Start free. No credit card required.
Set up your first event in under 10 minutes.

[CTA pair]
[PRIMARY: Start Free →]    [SECONDARY: Talk to our team →]

[Micro-trust row]
[🔒 Secure]  [🇮🇩 Indonesia-ready]  [📋 SOC 2 aligned]  [🌐 Self-hostable]
```

---

## Section 9: FOOTER

See `docs/strategy/website-ia.md` Section 3 for full footer structure.

---

## Performance Requirements

| Metric     | Target | Notes                             |
| ---------- | ------ | --------------------------------- |
| LCP        | <1.5s  | Marketing page — static/SSG       |
| INP        | <100ms | No heavy interactivity above fold |
| CLS        | <0.05  | Reserve space for images / logos  |
| Hero image | <200KB | WebP format, priority loading     |
| JS bundle  | <100KB | Minimal above-fold JS             |

---

## SEO Metadata

```html
<title>Moventios — Run Operations Without Chaos</title>
<meta
  name="description"
  content="The AI-native platform for coordinating events, projects, venues, and finance — with full audit trail. Built for operations teams. Start free."
/>
<meta property="og:title" content="Moventios" />
<meta
  property="og:description"
  content="One coordinated system for scheduling, resources, teams, finance, approvals, and audit."
/>
```

**Primary keyword target:** event operations platform, project operations software  
**Secondary:** event management enterprise, audit-grade event software

---

## AEO Schema

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "[Platform Name]",
  "applicationCategory": "BusinessApplication",
  "description": "AI-native Moventios for coordinating events, projects, venues, and finance with full audit trail.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "IDR",
    "description": "Free tier available"
  }
}
```

---

## Related Pages

- [Feature: Resource Scheduling](../website-ia.md)
- [Customer Stories](../website-ia.md)
- [Pricing](../website-ia.md)
- [Trust Center](../website-ia.md)
