# Design Document: Customer Support Contact Form

## Overview

This document describes the technical design for the Customer Support Contact Form feature on the SendSmiles Rakhi e-commerce website. The feature adds a `CustomerSupportSection` page section containing a `ContactForm` component that allows any visitor (guest or authenticated) to submit an enquiry. On submission the form payload is forwarded as an email to `support@thecodereflections.com` via AWS SES through a serverless Lambda + API Gateway backend.

### Key Design Decisions

**Backend approach — Lambda + API Gateway (not direct SDK from browser)**
Direct `@aws-sdk/client-ses` calls from the browser would require exposing SES IAM credentials in client-side code, which is a security anti-pattern. The project already uses `VITE_API_BASE_URL` / API Gateway for the newsletter flow (`dbService.saveNewsletterEmail`). The contact form follows the same pattern: a `POST /contact` endpoint backed by a Lambda function, keeping AWS credentials server-side. No new dependencies are needed — the frontend uses the native `fetch` API, and the Lambda uses the AWS SDK for SES already available in the Lambda runtime.

**State machine — explicit `SubmissionState` union type**
A discriminated union (`'idle' | 'submitting' | 'success' | 'error'`) is used to model form lifecycle. This makes impossible states impossible to represent and simplifies conditional rendering.

**Validation — synchronous, run on submit and on field-correction**
Validation runs eagerly on submit to surface all errors simultaneously. After a failed submission attempt, re-validation of each field runs on `onChange` (per-field) so corrections are reflected immediately without needing another submit click.

---

## Architecture

```
Browser (React + TypeScript)
│
├─ CustomerSupportSection          (section shell, layout, contact info)
│    └─ ContactForm                (controlled form, validation, state machine)
│         └─ contactService.ts     (fetch wrapper → API Gateway)
│
API Gateway  POST /contact
│
└─ Lambda: sendContactEmail
      └─ AWS SES  →  support@thecodereflections.com
```

The frontend is a pure client-side Vite/React app. The Lambda is deployed separately (same AWS account already used for Cognito/DynamoDB). Communication is over HTTPS REST — identical to the existing newsletter endpoint pattern.

### Data Flow

1. User fills form → client-side validation runs on submit.
2. If valid, `contactService.submitContactForm(payload)` is called.
3. `contactService` `POST`s JSON to `${VITE_API_BASE_URL}/contact`.
4. API Gateway routes to `sendContactEmail` Lambda.
5. Lambda constructs SES `SendEmailCommand` and sends.
6. Lambda returns `200` on success or `4xx/5xx` on error.
7. `ContactForm` transitions `SubmissionState` accordingly and updates UI.

---

## Components and Interfaces

### `CustomerSupportSection`

**File:** `src/components/CustomerSupportSection.tsx`

Renders the full page section including heading, supporting copy, inline contact details, FAQ anchor link, and the `ContactForm`. It is a layout/presentational wrapper — it holds no form state of its own.

```tsx
interface CustomerSupportSectionProps {
  // No props required; section is self-contained
}
```

Key DOM contract:
- Root element: `<section id="contact-section" …>`
- Heading: "Get In Touch" (h2, `font-serif`)
- FAQ anchor: `<a href="#faq-section">Browse our FAQ</a>`
- Support email displayed as `<a href="mailto:support@thecodereflections.com">`

### `ContactForm`

**File:** `src/components/ContactForm.tsx`

A fully controlled React form component that manages its own field state, validation errors, and `SubmissionState`.

```tsx
interface ContactFormProps {
  // No props — self-contained with its own service call
}

// Internal state shape
interface ContactFormState {
  name: string;
  email: string;
  message: string;
  errors: ValidationErrors;
  submissionState: SubmissionState;
}

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

interface ValidationErrors {
  name?: string;
  email?: string;
  message?: string;
}
```

Rendering rules by `SubmissionState`:

| State | Button | Indicators | Form fields |
|-------|--------|-----------|-------------|
| `idle` | Enabled, "Send Message" | — | Editable |
| `submitting` | Disabled + spinner | Loading indicator | Editable (read-only visually) |
| `success` | Hidden (replaced by confirmation card) | ✅ Success message | Cleared |
| `error` | Re-enabled, "Send Message" | ⚠️ Error banner with fallback email | Editable, previous values retained |

### `contactService.ts`

**File:** `src/services/contactService.ts`

Thin fetch wrapper that mirrors the pattern of `dbService.saveNewsletterEmail`.

```typescript
export interface ContactSubmission {
  name: string;      // max 100 chars
  email: string;     // max 254 chars, RFC 5321
  message: string;   // min 10, max 2000 chars
}

export interface ContactServiceResult {
  ok: true;
}

/**
 * POST the contact submission to the API Gateway /contact endpoint.
 * Throws an Error with a user-facing message on any non-2xx response.
 */
export async function submitContactForm(
  payload: ContactSubmission
): Promise<ContactServiceResult>;
```

Error handling:
- Network failure → throws `"Unable to reach the server. Please check your connection."`
- `4xx` response → throws `"Your submission could not be processed. Please try again."` (or server-provided message)
- `5xx` response → throws `"A server error occurred. Please try again or email us directly."`

### `validateContactForm` (pure validation utility)

**File:** `src/services/contactService.ts` (co-located for simplicity)

```typescript
export function validateContactForm(
  values: Partial<ContactSubmission>
): ValidationErrors;
```

Returns a `ValidationErrors` object. Empty object `{}` means all fields are valid. Each key is populated only when that field fails.

Rules:
- `name`: required (non-empty, non-whitespace-only). Error: `"Name is required."`
- `email`:
  - required check first. Error: `"Email address is required."`
  - format check: must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Error: `"Please enter a valid email address."`
- `message`:
  - required check. Error: `"Message is required."`
  - minimum length: trimmed length ≥ 10. Error: `"Message must be at least 10 characters."`

### Lambda: `sendContactEmail`

**File:** `lambda/sendContactEmail/index.mjs` (new, separate from frontend build)

Receives JSON body: `{ name, email, message }`. Constructs and sends a SES email.

```javascript
// Pseudocode
const command = new SendEmailCommand({
  Source: "noreply@thecodereflections.com",   // SES-verified sender
  Destination: { ToAddresses: ["support@thecodereflections.com"] },
  ReplyToAddresses: [payload.email],           // Customer's email as Reply-To
  Message: {
    Subject: { Data: "New Contact Form Submission – SendSmiles" },
    Body: {
      Html: { Data: buildHtmlBody(payload) },
      Text: { Data: buildTextBody(payload) },
    },
  },
});
```

Returns `200 { ok: true }` on success, `500 { error: "..." }` on SES failure.
Includes basic server-side validation (reject if fields missing/empty) to return `400` for malformed requests.

---

## Data Models

### `ContactSubmission`

```typescript
interface ContactSubmission {
  name: string;       // 1–100 chars, trimmed
  email: string;      // 1–254 chars, valid RFC 5321 format
  message: string;    // 10–2000 chars, trimmed
}
```

This is the canonical data transfer object (DTO) flowing from browser → API Gateway → Lambda → SES. It is never persisted — the feature is stateless (no DynamoDB writes).

### `ValidationErrors`

```typescript
interface ValidationErrors {
  name?: string;     // Present only when name is invalid
  email?: string;    // Present only when email is invalid
  message?: string;  // Present only when message is invalid
}
```

Absence of a key means that field is valid. This design allows rendering all errors simultaneously by iterating known keys.

### `SubmissionState` (discriminated union)

```typescript
type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';
```

Allowed transitions:

```
idle ──(submit valid form)──► submitting
submitting ──(SES success)──► success
submitting ──(SES failure)──► error
error ──(resubmit)──────────► submitting
success ──(no transition)──► (terminal until page reload)
```

`success` is a terminal state within a single page session. The form is cleared and replaced by a confirmation card. The user must reload or navigate away to submit again.

### Email Template Data

The Lambda `buildHtmlBody` function takes a `ContactSubmission` and returns an HTML string matching the site's design language (warm-cream background, primary red `#700016` heading, serif font, matching the existing order confirmation email style in `App.tsx`):

```
Subject:   New Contact Form Submission – SendSmiles
From:      noreply@thecodereflections.com
To:        support@thecodereflections.com
Reply-To:  {customer email}
Body HTML:
  Heading:    New Customer Enquiry
  Name:       {name}
  Email:      {email}  (linked as mailto:)
  Message:    {message}  (in a styled blockquote)
  Timestamp:  {ISO 8601 UTC}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The project already has `fast-check` installed (`devDependencies`) and Vitest configured. Properties are implemented as Vitest tests using `fast-check`'s `fc.assert` / `fc.property`.

#### Prework Consolidation

Before listing properties, we consolidate overlapping prework items:

- **2.1 (empty name) + 2.2 (empty email) + 2.4 (empty message)** are all edge cases of the general validation properties for each field. They are subsumed by Properties 1–3 below — the generators include empty/whitespace-only strings.
- **2.6 (simultaneous errors)** is separate from individual-field properties — it tests the multi-error display behaviour and is kept as Property 4.
- **2.8 (error clearing on correction)** is a round-trip property across all three fields — kept as Property 5.
- **3.2 (email body contains all fields) + 3.4 (Reply-To equals submitted email)** are both about the email construction function — combined into Property 6 (email template completeness) which covers both concerns.
- **4.6 (error → resubmit → submitting)** is a state machine round-trip — Property 7.

---

### Property 1: Name validation rejects blank-or-whitespace inputs

*For any* string consisting entirely of whitespace characters (or the empty string), calling `validateContactForm` with that value as `name` SHALL return a `ValidationErrors` object containing a `name` error equal to `"Name is required."`. Conversely, *for any* string containing at least one non-whitespace character, `validateContactForm` SHALL return a `ValidationErrors` object with no `name` key.

**Validates: Requirements 2.1**

---

### Property 2: Email validation correctly classifies valid vs. invalid emails

*For any* string that does not match the pattern `local@domain.tld` (i.e., does not contain `@` separating non-empty local and domain parts, or has no `.` in the domain), `validateContactForm` SHALL return a `ValidationErrors` object with an `email` error. *For any* string matching `local@domain.tld`, `validateContactForm` SHALL return a `ValidationErrors` object with no `email` key.

**Validates: Requirements 2.2, 2.3**

---

### Property 3: Message validation enforces the 10-character minimum

*For any* string whose trimmed length is between 0 and 9 (inclusive), `validateContactForm` SHALL return a `ValidationErrors` object containing a `message` error. *For any* string whose trimmed length is 10 or more, `validateContactForm` SHALL return a `ValidationErrors` object with no `message` key.

**Validates: Requirements 2.4, 2.5**

---

### Property 4: All applicable validation errors appear simultaneously

*For any* combination of simultaneously-invalid field values (any subset of name, email, message being invalid), calling `validateContactForm` with all those values at once SHALL return a `ValidationErrors` object that contains an error key for every invalid field. No error for an invalid field is ever suppressed by another field's invalidity.

**Validates: Requirements 2.6**

---

### Property 5: Correcting a field clears its validation error

*For any* field (name, email, or message), given that `validateContactForm` returns an error for that field when given an invalid value, changing that field's value to a valid value and re-calling `validateContactForm` SHALL return a `ValidationErrors` object that does NOT contain an error for that field. Other fields' error states are unaffected.

**Validates: Requirements 2.8**

---

### Property 6: Email template includes all submission fields and correct Reply-To

*For any* valid `ContactSubmission` (name, email, message all satisfying validation), the email template builder function `buildEmailParams` SHALL return a params object where:
- The HTML and plain-text body both contain the `name`, `email`, and `message` values from the submission.
- The `ReplyToAddresses` array contains exactly the submitted `email` value.
- The `Subject` equals `"New Contact Form Submission – SendSmiles"`.

**Validates: Requirements 3.2, 3.3, 3.4**

---

### Property 7: Error state → resubmit transitions back to submitting and clears error UI

*For any* valid `ContactSubmission`, after the `ContactForm` has entered the `error` state (due to a failed submission), submitting the form again SHALL transition `SubmissionState` to `submitting` and the error message banner SHALL no longer be visible in the rendered output.

**Validates: Requirements 4.6**

---

## Error Handling

### Client-Side Errors

| Scenario | Behaviour |
|---|---|
| One or more fields invalid on submit | All validation errors displayed simultaneously; no network call made |
| Field corrected after failed submit | That field's error cleared immediately on change |
| Network unavailable (fetch rejects) | `SubmissionState → error`; banner shown with support email fallback |
| API returns `4xx` (bad request) | `SubmissionState → error`; display server error message or generic fallback |
| API returns `5xx` (server error) | `SubmissionState → error`; display generic server error with support email |
| Submission while already `submitting` | Button is disabled; no duplicate requests possible |

### Server-Side (Lambda) Errors

| Scenario | Behaviour |
|---|---|
| Missing required fields in body | Return `400 { error: "Invalid request" }` |
| SES send failure (e.g., unverified sender) | Return `500 { error: "Failed to send email" }`; log error to CloudWatch |
| SES throttle / rate limit | Return `500`; Lambda should not retry automatically (API Gateway timeout is 29s) |
| Cold start latency | API Gateway timeout is 29 seconds — well within the 30-second SLA in Requirement 3.1 |

### Accessibility Error Handling

Error messages are rendered as `<p id="{field}-error" role="alert">` elements. Each input has `aria-describedby="{field}-error"` so screen readers announce errors on focus. The `role="alert"` ensures immediate announcement when errors appear dynamically.

---

## Testing Strategy

### Unit Tests (Example-Based)

Implemented with Vitest in `src/__tests__/`.

**`contactService.test.ts`** — tests `validateContactForm`:
- Renders with all empty fields → all three errors present
- Valid name, invalid email (missing `@`) → only email error
- Valid name, valid email, message too short → only message error
- All fields valid → empty error object `{}`
- Subject string equals exact expected value
- `SubmissionState` transitions (idle → submitting → success / error) via mocked `submitContactForm`

**`CustomerSupportSection.test.tsx`** — rendering checks:
- Section has `id="contact-section"`
- FAQ link has `href="#faq-section"`
- Support email address is present in the DOM
- Navigation link text is "Contact"

**`ContactForm.test.tsx`** — state machine and UI:
- Button disabled in `submitting` state
- Loading indicator visible in `submitting` state
- Confirmation message visible in `success` state; form fields cleared
- Error banner visible in `error` state; button re-enabled; contains support email
- All fields have `required` attribute and matching `for`/`id` pairs
- `aria-describedby` references correct error element `id`s

### Property-Based Tests (fast-check)

Implemented with Vitest + fast-check in `src/__tests__/contactService.pbt.test.ts`.

Minimum **100 iterations** per property (fast-check default; can be raised with `{ numRuns: 500 }`).

Each test is tagged with a comment referencing the design property:
```
// Feature: customer-support-contact, Property 1: Name validation rejects blank-or-whitespace inputs
```

**Property 1** — Generators: `fc.stringMatching(/^\s*$/)` for blank inputs, `fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)` for valid names.

**Property 2** — Generators: `fc.emailAddress()` for valid emails; `fc.string()` filtered to exclude `@` for invalid emails. Also include strings with `@` but no `.` in domain.

**Property 3** — Generators: `fc.string({ maxLength: 9 })` for too-short messages; `fc.string({ minLength: 10 })` for valid messages.

**Property 4** — Generators: `fc.record({ name: fc.string(), email: fc.string(), message: fc.string() })` generating arbitrary combinations; classify each field as valid/invalid; assert all invalid fields produce errors.

**Property 5** — Generator: for each field, generate an invalid value (per field-specific strategy), run validate, then generate a valid replacement; run validate again; assert the corrected field has no error.

**Property 6** — Generator: `fc.record({ name: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), email: fc.emailAddress(), message: fc.string({ minLength: 10 }) })`; run through `buildEmailParams`; assert all fields present in body and Reply-To matches email.

**Property 7** — Generator: generate valid `ContactSubmission`, simulate error state, resubmit, assert state is `submitting` and error UI is absent.

### Integration Tests

- Manual / CI integration test: POST to `${API_BASE_URL}/contact` with a test payload; assert `200 { ok: true }` response.
- Lambda unit test: mock `SESClient.send`; assert `SendEmailCommand` is constructed with correct `To`, `Subject`, `ReplyToAddresses`, and that body contains submission data.

### Testing Tools

| Tool | Purpose |
|---|---|
| Vitest | Test runner (already configured in `vite.config.ts`) |
| fast-check | Property-based testing (already in `devDependencies`) |
| React Testing Library | Component rendering + interaction (to be added: `@testing-library/react`) |

> Note: `@testing-library/react` is the standard choice for testing React 19 components and is not currently in `devDependencies`. It is the only dependency addition that may be needed for component tests. All property and service tests use only Vitest + fast-check.
