# Volume 08: Product Experience

## Moventios

**UX Design System, Interface Standards & Product Specifications for Running Events and Projects**

**Version:** 5.1-ENTERPRISE  
**Status:** RATIFIED  
**Date:** June 25, 2026  
**Authority:** Constitution Part 2 (Stoic UX) | EPXA Part 3 (UI Design System Architecture)  
**Owner:** Design Lead + Frontend Engineering Lead

---

## Overview

> **Canonical Source:** Stoic UX philosophy ada di [Layer-1-Constitution-v5.0.2.md](../Layer-1-Constitution-v5.0.2.md) Part 2.3. Design system architecture ada di [Layer-3-EPXA-v5.1.md](../Layer-3-EPXA-v5.1.md) Part 3.  
> Volume ini menyediakan **design tokens, component specifications, accessibility checklist, dan performance budgets** — tidak ada di Layer-1 atau Layer-3. Bila ada konflik UX principle, Layer-1 menang.

Volume 08 defines the **complete product experience standard** for the Moventios. The interface is designed for professionals who run real operations: **data-dense, high signal, clear, and efficient** — so teams can focus on coordination and execution rather than fighting the tool.

This volume governs:

- Design language and token system
- Component specifications (shadcn/ui integration)
- Layout patterns and information architecture
- Accessibility requirements (WCAG 2.2 AA)
- Performance budgets (LCP, INP, CLS)
- Offline-first interaction patterns
- Error messaging and empty state design

---

## Part 1: Stoic UX Philosophy

[Authority: Constitution Part 2.3 — Stoic UX]

### 1.1 Core Tenets

| Tenet                         | Meaning                                          | Anti-Pattern                                                                  |
| ----------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| **Data-Dense**                | Show the maximum useful information per viewport | Excessive whitespace, large hero images, card-heavy layouts for tabular data  |
| **High Signal-to-Noise**      | Every pixel serves a purpose                     | Decorative dividers, gradient backgrounds for no reason, icon overuse         |
| **Maximum Contrast**          | Text is readable; state is unambiguous           | Low-contrast labels, subtle disabled states, unclear affordances              |
| **Zero Decorative Animation** | Motion communicates state, not delight           | Loading spinners with fancy effects, hover animations that add no information |
| **Keyboard-First**            | Power users never touch the mouse                | Modal focus traps that don't work, tab order that requires mouse correction   |
| **Error Recovery by Default** | Every error tells you exactly what to do next    | Generic "Something went wrong" messages with no path forward                  |

### 1.2 The Interface Test

Before shipping any UI feature, ask:

> "If a finance director was auditing a crisis at 11pm, would this interface help them or slow them down?"

If the answer is "slow them down" — redesign it.

---

## Part 2: Design Token System

### 2.1 Color Palette

[Authority: EPXA Part 3.2]

```css
/* Moventios Design Tokens — CSS Custom Properties */
:root {
  /* Background Scale */
  --color-bg-base: #09090b; /* Deep onyx — page background */
  --color-bg-elevated: #18181b; /* Elevated surfaces (cards, modals) */
  --color-bg-overlay: #27272a; /* Overlays, sidebars, popovers */
  --color-bg-muted: #3f3f46; /* Muted backgrounds (disabled states) */

  /* Text Scale */
  --color-text-primary: #fafafa; /* Primary text — maximum contrast */
  --color-text-secondary: #a1a1aa; /* Secondary labels, help text */
  --color-text-muted: #71717a; /* Tertiary: timestamps, metadata */
  --color-text-disabled: #52525b; /* Disabled field labels */

  /* Brand */
  --color-accent: #7c3aed; /* Primary action — violet */
  --color-accent-hover: #6d28d9; /* Hover state */
  --color-accent-muted: #3b0764; /* Accent background (badges) */

  /* Semantic */
  --color-success: #16a34a; /* Confirmed, active, issued states */
  --color-success-muted: #052e16; /* Success badge background */
  --color-warning: #d97706; /* Pending, hold, expiring soon */
  --color-warning-muted: #3b2000; /* Warning badge background */
  --color-destructive: #dc2626; /* Error, revoked, failed states */
  --color-destructive-muted: #7f1d1d; /* Destructive badge background */

  /* Border */
  --color-border: #27272a; /* Default border */
  --color-border-strong: #3f3f46; /* Emphasized border (active inputs) */
  --color-border-focus: #7c3aed; /* Focus ring */

  /* Finance-Specific */
  --color-debit: #f87171; /* Debit amounts (red-tinted) */
  --color-credit: #4ade80; /* Credit amounts (green-tinted) */
}
```

### 2.2 Typography Scale

```css
/* Font: Inter (primary), JetBrains Mono (code/numeric data) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

:root {
  /* Font Families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Type Scale */
  --text-xs: 0.75rem; /* 12px — timestamps, badges */
  --text-sm: 0.875rem; /* 14px — table cells, secondary labels */
  --text-base: 1rem; /* 16px — body text, form labels */
  --text-lg: 1.125rem; /* 18px — section headers */
  --text-xl: 1.25rem; /* 20px — page titles */
  --text-2xl: 1.5rem; /* 24px — modal headers */
  --text-3xl: 1.875rem; /* 30px — empty state titles */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Letter Spacing */
  --tracking-tight: -0.025em; /* Large headings */
  --tracking-normal: 0em;
  --tracking-wide: 0.025em; /* Badge labels, metadata */
  --tracking-widest: 0.1em; /* ALL CAPS status labels */
}
```

### 2.3 Spacing & Layout Tokens

```css
:root {
  /* Spacing Scale (4px base grid) */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */

  /* Border Radius */
  --radius-sm: 0.25rem; /* 4px — badges, tags */
  --radius-md: 0.375rem; /* 6px — buttons, inputs */
  --radius-lg: 0.5rem; /* 8px — cards, modals */
  --radius-xl: 0.75rem; /* 12px — popover, dropdown panels */

  /* Shadow Scale */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-modal: 0 25px 50px rgba(0, 0, 0, 0.7);
}
```

---

## Part 3: Component Standards

[Authority: EPXA Part 3.2 — Component Foundation: shadcn/ui + Radix Primitives]

### 3.1 Component Architecture

**Rule:** Components are owned in `packages/ui/` and imported. **Never** duplicated in feature directories.

```
packages/ui/
  ├── primitives/        # Radix-based: Dialog, Popover, DropdownMenu, etc.
  ├── data-display/      # Table, Badge, Stat, Avatar, Timeline
  ├── forms/             # Input, Select, DatePicker, FileUpload, Combobox
  ├── feedback/          # Toast, Alert, Skeleton, Empty, Progress
  ├── layout/            # Sidebar, Header, PageShell, Card
  └── finance/           # LedgerTable, AmountDisplay, JournalEntry
```

### 3.2 Status Badge System

Every entity with a state machine must render status with the canonical badge mapping:

```typescript
// Canonical badge configuration for all state machines
const STATUS_BADGE_CONFIG = {
  // Booking States
  pending: { label: 'Pending', color: 'warning', dot: true },
  approved: { label: 'Approved', color: 'success', dot: true },
  active: { label: 'Active', color: 'success', dot: false },
  cancelled: { label: 'Cancelled', color: 'muted', dot: false },
  rejected: { label: 'Rejected', color: 'destructive', dot: false },

  // Access Pass States
  issued: { label: 'Issued', color: 'success', dot: false },
  scanned: { label: 'Checked In', color: 'accent', dot: false },
  revoked: { label: 'Revoked', color: 'destructive', dot: false },
  expired: { label: 'Expired', color: 'muted', dot: false },

  // Payment States
  initiated: { label: 'Initiated', color: 'warning', dot: true },
  processing: { label: 'Processing', color: 'warning', dot: true },
  captured: { label: 'Captured', color: 'success', dot: false },
  settled: { label: 'Settled', color: 'success', dot: false },
  failed: { label: 'Failed', color: 'destructive', dot: false },
  refunded: { label: 'Refunded', color: 'muted', dot: false },

  // Journal States
  draft: { label: 'Draft', color: 'muted', dot: false },
  posted: { label: 'Posted', color: 'success', dot: false },
  voided: { label: 'Voided', color: 'muted', dot: false },
} as const;
```

### 3.3 Amount Display Standard

```typescript
// AmountDisplay component — mandatory for ALL currency values
interface AmountDisplayProps {
  amount: Decimal; // Never use number; always Decimal
  currency: string; // ISO 4217: 'IDR', 'USD', 'EUR'
  type?: 'debit' | 'credit' | 'neutral';
  showSign?: boolean; // Show + or -
}

// Renders as:
// Debit: -Rp 1.500.000 (in --color-debit, i.e., red-tinted)
// Credit: +Rp 1.500.000 (in --color-credit, i.e., green-tinted)
// Neutral: Rp 1.500.000 (in --color-text-primary)

// NEVER render raw numbers as: "1500000" or "$1500.00000001" (float!)
// ALWAYS: use Intl.NumberFormat with correct locale and currency
const formatted = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(amount.toNumber());
```

### 3.4 Data Table Standard

Every data table in the platform **must** use **TanStack Table** with:

```typescript
// Mandatory table configuration
const tableConfig = {
  // Server-side operations (not client-side filtering/sorting)
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,

  // URL state (search params as SSOT)
  // Filters, sort, and page are stored in URL search params
  // so pages are shareable and bookmarkable

  // Required: all table state in URL
  // /bookings?page=2&sort=created_at:desc&status=pending
};

// Required columns for financial tables
const FINANCIAL_TABLE_REQUIRED_COLS = [
  'created_at', // Always shown; sortable
  'status', // Status badge
  'amount', // AmountDisplay component
  'actor', // Who created/modified
  'trace_id', // Clickable link to trace viewer
];
```

### 3.5 Form Standards

```typescript
// Every form must:
// 1. Use Zod schema from packages/contracts (not ad-hoc validation)
// 2. Use react-hook-form with zodResolver
// 3. Show inline errors (not toast errors) for field-level validation
// 4. Disable submit button after click (prevent double-submit)
// 5. Generate idempotency_key client-side before submit (for financial forms)

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IssueAccessPassSchema } from '@sovereign/contracts';
import { generateIdempotencyKey } from '@sovereign/core';

const form = useForm({
  resolver: zodResolver(IssueAccessPassSchema),
  defaultValues: {
    idempotencyKey: generateIdempotencyKey(), // UUID v4 generated client-side
  },
});
```

---

## Part 4: Layout Patterns

### 4.1 Application Shell

```
┌─────────────────────────────────────────────────┐
│  HEADER: Tenant name | Org selector | User menu  │
├─────────────┬───────────────────────────────────┤
│             │  BREADCRUMB: Section > Page        │
│  SIDEBAR    │  PAGE TITLE + Action buttons       │
│             ├───────────────────────────────────┤
│  Navigation │                                    │
│  items      │  PAGE CONTENT                     │
│             │  (Table, Form, Detail, Analytics)  │
│  Context    │                                    │
│  info       │                                    │
│             │                                    │
└─────────────┴───────────────────────────────────┘
```

**Sidebar width:** 240px (collapsed: 64px icon-only mode)
**Content max-width:** 1280px (centered on wide viewports)
**Header height:** 56px

### 4.2 Modal / Dialog Pattern

For confirmations, forms, and detail views:

```
┌─────────────────────────────────────────┐
│ Dialog Title          [×] Close button  │
├─────────────────────────────────────────┤
│                                         │
│  Content (form / detail / confirmation) │
│                                         │
│  ⚠️  Warning callout if destructive     │
│                                         │
├─────────────────────────────────────────┤
│  [Cancel]              [Primary Action] │
└─────────────────────────────────────────┘
```

**Rules:**

- Focus moves to first interactive element on open (accessibility)
- Escape key closes; clicking overlay closes (unless form is dirty)
- Destructive actions (Cancel Booking, Revoke Pass) require two-step confirmation
- Financial action dialogs show idempotency key in small text below (for debug)

### 4.3 Page Patterns by Type

| Page Type              | Primary Component                    | Key UX Rule                                                  |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------ |
| **List / Index**       | TanStack Table with filters          | URL-synced filters; sticky headers                           |
| **Detail / Show**      | Two-column layout (info + activity)  | Status badge prominent; action buttons top-right             |
| **Create / Edit Form** | Centered single-column form          | Full validation before submit; idempotency key pre-generated |
| **Analytics**          | Metric cards + charts                | Numbers first, charts second; no 3D charts                   |
| **Financial Ledger**   | Full-width table with frozen columns | Debit/Credit color coding mandatory                          |
| **Approval Queue**     | Card list with action buttons        | SLA countdown visible; oldest first                          |

---

## Part 5: Accessibility Standards (WCAG 2.2 AA)

[Authority: EPXA Part 5.1 — WCAG 2.2 AA requirement]

### 5.1 Minimum Requirements (Mandatory)

| Criterion               | Requirement                                                   | Implementation                                                     |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Color Contrast**      | Text: ≥4.5:1; Large text: ≥3:1                                | `--color-text-primary` (#fafafa on #09090b = 19.5:1 ✅)            |
| **Focus Visible**       | Keyboard focus indicator visible on all interactive elements  | `outline: 2px solid var(--color-border-focus)` on `:focus-visible` |
| **Keyboard Navigation** | All interactive elements reachable via Tab + Enter/Space      | Test coverage required for every new interactive component         |
| **Screen Reader**       | All images have alt text; decorative images use `aria-hidden` | Code review checklist                                              |
| **Form Labels**         | Every input has associated `<label>` or `aria-label`          | Required in form component contract                                |
| **Error Announcement**  | Validation errors announced via `aria-live="polite"`          | Built into form component                                          |
| **Target Size**         | Interactive elements ≥ 24×24px (WCAG 2.2 new criterion)       | Component design constraint                                        |

### 5.2 Keyboard Navigation Map

| Context     | Key           | Action                    |
| ----------- | ------------- | ------------------------- |
| Table       | `↑↓`          | Navigate rows             |
| Table       | `Enter`       | Open detail / row action  |
| Table       | `Shift+Click` | Multi-select rows         |
| Modal       | `Escape`      | Close (if form not dirty) |
| Dropdown    | `↑↓`          | Navigate options          |
| Dropdown    | `Enter`       | Select option             |
| Dropdown    | `Escape`      | Close without selecting   |
| Date Picker | Arrow keys    | Navigate calendar         |
| Form        | `Ctrl+Enter`  | Submit form               |

### 5.3 Skip Navigation

```html
<!-- Required on every page for keyboard users -->
<a href="#main-content" class="skip-link"> Skip to main content </a>
<main id="main-content" tabindex="-1">
  <!-- Page content -->
</main>
```

---

## Part 6: Performance Budgets

[Authority: EPXA Part 5.1 — Performance Budget]

### 6.1 Core Web Vitals Targets

| Metric                              | Target  | Measurement Context         |
| ----------------------------------- | ------- | --------------------------- |
| **LCP** (Largest Contentful Paint)  | < 2.0s  | On 4G connection; page load |
| **INP** (Interaction to Next Paint) | < 150ms | On mid-range mobile device  |
| **CLS** (Cumulative Layout Shift)   | < 0.1   | Full page lifecycle         |
| **TTFB** (Time to First Byte)       | < 600ms | Server response             |
| **FCP** (First Contentful Paint)    | < 1.2s  | Initial render              |

### 6.2 Performance Budget by Route Type

| Route Type             | LCP Target         | Bundle Size Budget (JS) | Notes                                   |
| ---------------------- | ------------------ | ----------------------- | --------------------------------------- |
| Landing / Marketing    | < 1.5s             | < 100KB                 | Mostly static; heavy image optimization |
| Dashboard (list views) | < 2.0s             | < 250KB                 | Table data from server                  |
| Detail pages           | < 1.8s             | < 200KB                 | SSR with RSC streaming                  |
| Financial ledger       | < 2.5s             | < 300KB                 | Complex table; data virtualization      |
| Checkout modal         | < 1.0s (INP)       | < 50KB                  | Critical path; Stripe Elements isolated |
| AI search results      | < 2.0s for results | < 150KB                 | Streaming response from RAG             |

### 6.3 Image Optimization Requirements

```tsx
// MANDATORY: Use next/image for ALL images
import Image from 'next/image';

// ✅ CORRECT
<Image
  src="/event-banner.jpg"
  alt="Event banner for {event.title}"  // Descriptive alt text required
  width={1200}
  height={400}
  priority={isAboveFold}  // priority for LCP images
  sizes="(max-width: 768px) 100vw, 1200px"
/>

// ❌ FORBIDDEN
<img src="/event-banner.jpg" />  // No optimization; bad LCP
```

### 6.4 Table Virtualization (Large Datasets)

For tables with > 100 rows (e.g., ledger journal entries, large event attendance lists):

```tsx
// Use TanStack Virtual for row virtualization
import { useVirtualizer } from '@tanstack/react-virtual';

// Mandatory for: journal_entries tables, access_pass large lists (> 500 rows)
// Prevents DOM size explosion and maintains smooth scrolling
```

---

## Part 7: Offline-First UX Patterns

[Authority: EPXA Part 5.1 — Offline-first patterns]

### 7.1 Offline Capability Map

| Feature                       | Offline Behavior                                             |
| ----------------------------- | ------------------------------------------------------------ |
| Check-In (AccessPass QR Scan) | MUST work offline; sync when reconnected                     |
| Booking Calendar View         | Show cached data with "Last updated" indicator               |
| Financial Dashboard           | Show cached summary; indicate stale data                     |
| New Booking Creation          | Buffer in IndexedDB; submit on reconnect with conflict check |
| Payment Processing            | Cannot proceed offline; show clear error with reconnect CTA  |

### 7.2 Offline Mutation Buffer

For operations that can buffer offline:

```typescript
// IndexedDB schema for offline mutation buffer
interface OfflineMutation {
  id: string; // Client-generated UUID
  type: string; // e.g., 'CheckInAccessPass'
  payload: object; // Command payload
  idempotencyKey: string; // Pre-generated before offline
  timestamp: number; // When mutation was created
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'conflict';
}

// On reconnect: replay mutations in order
// On conflict (e.g., capacity depleted): show conflict resolution UI
```

### 7.3 Connection Status Indicator

```tsx
// Mandatory: visible connection status on all critical operational pages
// (Check-in dashboard, booking calendar, financial operations)
const ConnectionBanner = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div role="alert" aria-live="assertive" className="connection-banner--offline">
      <OfflineIcon aria-hidden="true" />
      <span>Offline — changes will sync when reconnected</span>
    </div>
  );
};
```

---

## Part 8: Error Messaging Standards

[Authority: Volume 01 Appendix A — Error Taxonomy]

### 8.1 Error Display Hierarchy

| Error Type               | Display Location      | Component         |
| ------------------------ | --------------------- | ----------------- |
| Field validation         | Inline below field    | `<FieldError>`    |
| Form-level error         | Top of form           | `<FormAlert>`     |
| Page-level error         | Banner below header   | `<PageAlert>`     |
| Operation confirmation   | Toast (bottom-right)  | `<Toast>`         |
| Destructive confirmation | Dialog                | `<ConfirmDialog>` |
| System unavailability    | Full-page error state | `<ErrorPage>`     |

### 8.2 Error Message Quality Standards

Every error message must:

1. **Describe what happened** — not just "Error occurred"
2. **Explain why** — "The booking was rejected because the room is unavailable for this time range"
3. **Tell the user what to do** — "Select a different time or check the room calendar"
4. **Provide an action** — "View available times →"

```tsx
// ✅ CORRECT: Actionable error message
<FormAlert
  type="error"
  title="Booking Conflict Detected"
  description="Room A102 is already booked from 10:00 to 12:00 on June 30. Choose a different time or select another room."
  action={{ label: "View Room Calendar", href: `/rooms/${roomId}/calendar` }}
/>

// ❌ FORBIDDEN: Unhelpful error message
<FormAlert type="error" title="Booking failed" description="An error occurred." />
```

### 8.3 Empty State Design

Every list/table must handle the empty state with purpose:

```tsx
// Empty state template (mandatory)
const EmptyState = ({ entityType, action }) => (
  <div className="empty-state">
    <EntityIcon aria-hidden="true" />
    <h3>No {entityType} yet</h3>
    <p>
      {entityType === 'AccessPass'
        ? 'Access passes will appear here once your event goes live.'
        : `Create your first ${entityType.toLowerCase()} to get started.`}
    </p>
    {action && <Button onClick={action.handler}>{action.label}</Button>}
  </div>
);
```

---

## Appendix A: Screen ID Convention

All screens follow the ID convention: `SCR_{DOMAIN}_{PURPOSE}_{SEQ}`

| Screen ID                          | Name                  | Domain   |
| ---------------------------------- | --------------------- | -------- |
| `SCR_COMMERCE_CHECKOUT_001`        | Access Pass Checkout  | Commerce |
| `SCR_COMMERCE_EVENT_LIST_001`      | Event List / Index    | Commerce |
| `SCR_FINANCE_LEDGER_001`           | Ledger Journal View   | Finance  |
| `SCR_FINANCE_INVOICE_DETAIL_001`   | Invoice Detail        | Finance  |
| `SCR_SPATIAL_BOOKING_CALENDAR_001` | Booking Calendar      | Spatial  |
| `SCR_SPATIAL_ROOM_LIST_001`        | Room List             | Spatial  |
| `SCR_IAM_MEMBER_LIST_001`          | Member Management     | IAM      |
| `SCR_WORKFLOW_APPROVAL_QUEUE_001`  | Approval Queue        | Workflow |
| `SCR_AI_KNOWLEDGE_SEARCH_001`      | Knowledge Base Search | AI       |
| `SCR_OPS_DASHBOARD_001`            | Operations Dashboard  | Platform |

---

**End of Volume 08**

_The Moventios interface is not beautiful because it has gradients. It is useful because every pixel earns its place. The finance director at 11pm will thank you for choosing data density over decoration._

_[Constitution Part 2.3] [EPXA Part 3] [Volume 01, Part 4 — Value Objects: Money] [Volume 06, L-04 — Idempotency in forms]_
