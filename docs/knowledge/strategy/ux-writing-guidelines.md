# UX Writing Guidelines

## Moventios

**Version:** 1.0  
**Date:** June 2026  
**Authority:** product-experience-research.md Part 8 | docs/volumes/08-product.md Part 8  
**Owner:** Product Design + Frontend Engineering

> **The Interface Test:** "If a finance director was auditing a crisis at 11 PM,  
> would this copy help them or slow them down?"  
> If it slows them down — rewrite it. — _Volume 08 Part 1.2_

---

## 1. Core UX Writing Principles

1. **Outcome-first** — Lead with what the user achieves, not what the system does
2. **Specific over vague** — "47 events coordinated" > "many events"
3. **Active voice** — "Create an event" > "An event can be created"
4. **Progressive disclosure** — Show simple first, reveal detail on demand
5. **Consistent terminology** — Use Layer-1 Ubiquitous Language exclusively (see Section 9)
6. **Calm under pressure** — Error states must be calmer and more helpful than the user's frustration

---

## 2. Empty States

Every list, table, or container that can be empty **must** have a purposeful empty state.  
Never show a blank screen with no guidance.

### Formula

```
[Contextual icon — aria-hidden]
[Short title: "No [Entity] yet"]
[1-sentence context: why it's empty + what it means]
[Primary CTA: what to do first]
[Optional secondary: alternative path]
```

### Examples by Entity

| Entity          | Title            | Context                                                   | CTA             |
| --------------- | ---------------- | --------------------------------------------------------- | --------------- |
| Events          | No events yet    | Events you create will appear here.                       | Create Event    |
| Bookings        | No bookings      | Bookings will appear when your event is published.        | Publish Event   |
| AccessPasses    | No access passes | Passes are issued after a booking is approved.            | View Bookings   |
| Approvals       | All caught up    | No pending approvals at this time.                        | —               |
| Journal Entries | No transactions  | Financial entries will appear when payments are captured. | —               |
| Team Members    | No team members  | Invite your team to collaborate on this event.            | Invite Team     |
| Tasks           | No tasks         | Add tasks to track what needs to get done.                | Add Task        |
| Reports         | No reports yet   | Generate your first report to see analytics.              | Generate Report |

### Anti-patterns (never do this)

- ❌ Blank white space with no text
- ❌ "No data available"
- ❌ "There are no items to display"
- ❌ Generic icon (folder, box) with no context

---

## 3. Error Messages

### Formula

```
[What happened — specific]
[Why it happened — one sentence, if helpful]
[What to do next — actionable instruction]
[Optional: action button or link]
```

### Quality Standard (from Volume 08 Part 8.2)

Every error message must:

1. Describe **what happened** — not just "Error occurred"
2. Explain **why** — "The booking was rejected because the room is unavailable"
3. Tell the user **what to do** — "Select a different time or check the room calendar"
4. Provide **an action** — "View available times →"

### Error Examples by Category

#### Form Validation Errors (inline, below field)

| Scenario             | Error text                                              |
| -------------------- | ------------------------------------------------------- |
| Required field empty | "Event name is required."                               |
| Date in the past     | "Start date must be in the future."                     |
| End before start     | "End time must be after start time."                    |
| Invalid email        | "Enter a valid email address (e.g. name@company.com)."  |
| Amount invalid       | "Enter a valid amount greater than 0."                  |
| Capacity exceeded    | "Quantity cannot exceed the available capacity of [N]." |

#### Business Logic Errors (form-level or toast)

| Scenario                 | Error text                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Booking conflict         | "Booking conflict: Room A102 is already reserved from 10:00–12:00 on July 3. Choose a different time or select another room." |
| Payment failed           | "Payment failed. The card was declined. Ask the cardholder to check their details or use a different payment method."         |
| Insufficient permissions | "You don't have permission to approve bookings. Contact your administrator to update your role."                              |
| Duplicate idempotency    | "This action was already submitted. Refresh the page to see the current status."                                              |
| Tenant not found         | "This organization could not be found. You may have lost access or the link has expired."                                     |

#### System / Infrastructure Errors

| Scenario        | Error text                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| API unavailable | "We're having trouble connecting. Check your connection and try again. If this continues, visit our status page." |
| Timeout         | "This is taking longer than expected. Refresh the page — your data has been saved."                               |
| 404             | "This page doesn't exist. It may have been moved or deleted. [Go to Network →]"                                   |
| Unauthorized    | "You need to sign in to access this page. [Sign in →]"                                                            |

### Anti-patterns (never write this)

- ❌ "An error occurred."
- ❌ "Something went wrong. Please try again."
- ❌ "Error code: 500"
- ❌ "Oops! Something unexpected happened."
- ❌ Technical stack traces in user-facing UI

---

## 4. Success & Confirmation Messages

### Formula

```
[What happened — past tense, specific]
[What happens next — only if relevant and helpful]
```

Keep success messages **brief**. Don't over-celebrate routine actions.

### Success Examples

| Action              | Success message                                                                 |
| ------------------- | ------------------------------------------------------------------------------- |
| Event created       | "Event created. Your team can now see it in the shared calendar."               |
| Booking approved    | "Booking approved. The requester has been notified."                            |
| Booking rejected    | "Booking rejected. The requester has been notified with your reason."           |
| AccessPass issued   | "Access pass issued. The pass code has been sent to the attendee's email."      |
| Payment captured    | "Payment captured. Receipt sent to [email]."                                    |
| File uploaded       | "File uploaded successfully."                                                   |
| Settings saved      | "Settings saved."                                                               |
| Team member invited | "Invitation sent to [email]."                                                   |
| Report exported     | "Report exported. Download starting now."                                       |
| Password changed    | "Password updated. You'll need to use your new password next time you sign in." |

### Confirmation Dialogs (Destructive Actions)

Destructive actions (cancel booking, revoke pass, delete event) require two-step confirmation.

**Format:**

```
[Dialog title: verb phrase]
[Body: What will happen + consequences]
[Warning if irreversible]
[Cancel] [Confirm — red/destructive button]
```

**Example — Revoke Access Pass:**

> **Revoke Access Pass**  
> This will immediately invalidate pass #APX-0042 for Budi Santoso. They will not be able to scan in at the event.  
> ⚠️ This action cannot be undone.  
> [Cancel] [**Revoke Pass**]

**Example — Cancel Booking:**

> **Cancel This Booking**  
> Cancelling this booking will release Room A102 for July 3, 10:00–12:00 and notify all attendees.  
> Any payments will need to be manually refunded.  
> [Cancel] [**Cancel Booking**]

---

## 5. Loading States

Use active verb phrases. Never "Please wait..."

| Context     | Loading text              |
| ----------- | ------------------------- |
| Generic     | "Loading..."              |
| Calendar    | "Loading calendar..."     |
| Report      | "Generating report..."    |
| Export      | "Preparing export..."     |
| Payment     | "Processing payment..."   |
| Save        | "Saving..."               |
| Search      | "Searching..."            |
| AI response | "Thinking..."             |
| File upload | "Uploading [filename]..." |

**Rule:** Loading states that take >3 seconds should include a progress indicator, not just a spinner.

---

## 6. Form Labels & Placeholders

### Labels

- **Format:** Title Case noun phrases. No questions. No verbs.
- Never end with a colon in the UI (CSS handles spacing).

| ✅ Correct     | ❌ Wrong                             |
| -------------- | ------------------------------------ |
| Event Name     | What do you want to call this event? |
| Start Date     | Enter start date                     |
| Venue          | Select a venue...                    |
| Attendee Count | How many attendees?                  |
| Amount (IDR)   | Enter amount in rupiah               |

### Placeholders

- Use **only** for format hints — never for instructions
- Placeholders disappear when users type — don't put critical info here

| ✅ Correct                | ❌ Wrong                     |
| ------------------------- | ---------------------------- |
| `YYYY-MM-DD`              | `Enter the event start date` |
| `events@company.com`      | `Your email address`         |
| `Rp 0`                    | `Enter the payment amount`   |
| (empty — let label speak) | `Type event name here`       |

### Helper Text (below field)

Use for context that isn't obvious from the label.

- ✅ "This will be shown on the attendee's access pass."
- ✅ "Maximum 500 attendees for this venue."
- ❌ "Please enter the name of your event."

---

## 7. Notifications & Toasts

### Toast Hierarchy

| Type                | Use for                   | Duration                   |
| ------------------- | ------------------------- | -------------------------- |
| **Success** (green) | Completed actions         | 4 seconds                  |
| **Info** (blue)     | Neutral system updates    | 6 seconds                  |
| **Warning** (amber) | Action needed, not urgent | Persistent until dismissed |
| **Error** (red)     | Failed action             | Persistent until dismissed |

### Toast Copy Rules

- Max **2 lines** of text
- Include an action link when relevant ("View booking →")
- Don't toast for every minor action (checkbox check, field autosave)
- **Do** toast for: form submissions, file uploads, state changes, sent emails

---

## 8. Navigation & Wayfinding

### Breadcrumbs

- Always show full path: `Network > Catalysts > Tech Conference 2026 > Participation`
- Use the canonical entity name (not truncated)
- Last item = current page (non-linked)

### Page Titles (browser tab)

Format: `[Page Name] — [Entity] — [Platform Name]`

- `Bookings — Tech Conference 2026 — Platform`
- `Financial Ledger — Artha Corp — Platform`
- `Approval Queue — Platform`

### Sidebar Navigation Labels

- Use nouns, not verbs: "Events" not "Manage Events"
- Be specific: "Access Passes" not "Passes"
- Canonical names from Layer-1 only

---

## 9. Canonical Terminology (Mandatory — from Layer-1)

Always use these exact terms in all UI copy. No synonyms. No improvisation.

| ✅ Use this       | ❌ Never use                                   |
| ----------------- | ---------------------------------------------- |
| **AccessPass**    | Ticket, Token, Pass, QR Pass                   |
| **Booking**       | Reservation, Appointment, Order, Request       |
| **Supplier**      | Vendor, Provider, Partner                      |
| **Facility**      | Space, Location, Venue (unless geographic)     |
| **TicketType**    | TicketTier, PassType, Category                 |
| **Workflow**      | Process, Flow, Pipeline                        |
| **Tenant**        | Organization, Company, Client (in API context) |
| **Event**         | Show, Conference (as generic term)             |
| **Approval**      | Sign-off, Authorization                        |
| **Journal Entry** | Transaction log, Ledger record                 |

---

## 10. Accessibility Writing Requirements

- All icon-only buttons **must** have `aria-label` with descriptive text
  - ✅ `aria-label="Delete booking"` not `aria-label="Delete"`
- All status indicators **must** not rely on color alone — include text or icon
  - ✅ "● Active" (green dot + text) not just a green dot
- Error messages **must** use `aria-live="polite"` for field errors
- Required fields: mark with `*` AND add `aria-required="true"`
- Image alt text: describe the content, not the aesthetics
  - ✅ `alt="Bar chart showing 340 bookings in June, up 12% from May"`
  - ❌ `alt="Chart"` or `alt="Graph image"`

---

## 11. AI Copilot UX Writing (L-06 Compliance)

Per **Enterprise Law L-06**: AI may only propose — never directly mutate state.  
All AI-generated suggestions must be clearly marked as suggestions, not actions.

### AI Suggestion Labels

- "AI suggested" — for content/data suggestions
- "Based on past events, AI recommends..." — for scheduling suggestions
- "AI drafted this — review before sending" — for generated communications

### AI Approval Prompts

Format: `[What AI proposes] + [Confidence / reasoning] + [Approve / Edit / Dismiss]`

**Example:**

> **AI Suggestion:** Book Room A102 on July 10, 09:00–17:00  
> _Based on your last 3 team events with similar headcount (45 people) and duration._  
> [**Approve**] [Edit] [Dismiss]

**Rules:**

- Never auto-approve AI suggestions without explicit user action
- Always show source/reasoning ("based on past patterns")
- "Approve" is always the primary button (green); "Edit" is secondary; "Dismiss" is tertiary
- Log all approvals and rejections — they feed the audit trail

---

## Internal Reference

| Document                                              | Role                                 |
| ----------------------------------------------------- | ------------------------------------ |
| `docs/layers/Layer-1-Constitution-v5.0.2.md` Part 3–4 | Canonical entity names               |
| `docs/volumes/08-product.md` Part 8                   | Error taxonomy, empty state template |
| `docs/strategy/copywriting-system.md`                 | Brand voice, headline formulas       |
| `docs/strategy/product-experience-research.md` Part 8 | Full UX writing framework (source)   |
