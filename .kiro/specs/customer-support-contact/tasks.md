# Implementation Plan: Customer Support Contact Form

## Overview

Implement the Customer Support Contact Form feature end-to-end: a frontend service layer, two React components (`ContactForm`, `CustomerSupportSection`), a Lambda handler for AWS SES email delivery, and navigation wiring in `App.tsx`. Unit tests, property-based tests, and component tests complete the implementation.

---

## Tasks

- [x] 1. Implement `contactService.ts` — types, validation, and fetch wrapper
  - [x] 1.1 Create `src/services/contactService.ts` with `ContactSubmission`, `ValidationErrors`, and `SubmissionState` types
    - Export `ContactSubmission` interface: `{ name: string; email: string; message: string }`
    - Export `ValidationErrors` interface: `{ name?: string; email?: string; message?: string }`
    - Export `type SubmissionState = 'idle' | 'submitting' | 'success' | 'error'`
    - _Requirements: 1.1–1.3, 2.1–2.5_

  - [x] 1.2 Implement `validateContactForm(values: Partial<ContactSubmission>): ValidationErrors`
    - `name`: required (non-empty, non-whitespace-only) → `"Name is required."`
    - `email`: required → `"Email address is required."`; format `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` → `"Please enter a valid email address."`
    - `message`: required → `"Message is required."`; trimmed length < 10 → `"Message must be at least 10 characters."`
    - Return empty object `{}` when all fields pass; return only keys that fail
    - _Requirements: 2.1–2.7_

  - [x] 1.3 Implement `submitContactForm(payload: ContactSubmission): Promise<{ ok: true }>`
    - POST JSON to `${import.meta.env.VITE_API_BASE_URL}/contact`
    - On network failure throw `"Unable to reach the server. Please check your connection."`
    - On `4xx` throw `"Your submission could not be processed. Please try again."`
    - On `5xx` throw `"A server error occurred. Please try again or email us directly."`
    - _Requirements: 3.1–3.4_

- [x] 2. Implement `ContactForm.tsx` — controlled form with SubmissionState machine
  - [x] 2.1 Create `src/components/ContactForm.tsx` with field state and `SubmissionState` machine
    - Controlled inputs for `name`, `email`, `message` with `useState`
    - `submissionState: SubmissionState` starts as `'idle'`
    - `errors: ValidationErrors` starts as `{}`
    - On `onChange` for each field: if a prior submit attempt has been made, re-run `validateContactForm` for that field only and update that field's error (clears on correction)
    - _Requirements: 1.1–1.4, 2.8_

  - [x] 2.2 Implement submit handler and state transitions
    - On submit: run full `validateContactForm`; if errors exist set them and abort (no fetch)
    - If valid: set `submissionState = 'submitting'`, call `submitContactForm`, on resolve set `'success'` and clear fields, on reject set `'error'`
    - Allowed transitions: `idle → submitting → success | error → submitting`
    - _Requirements: 3.5–3.8, 4.1–4.6_

  - [x] 2.3 Render form fields with accessibility attributes
    - Name: `<input id="name" name="name" maxLength={100} required aria-describedby="name-error" />`  with `<label htmlFor="name">Your Name</label>`
    - Email: `<input id="email" type="email" name="email" maxLength={254} required aria-describedby="email-error" />`  with `<label htmlFor="email">Email Address</label>`
    - Message: `<textarea id="message" name="message" maxLength={2000} required aria-describedby="message-error" />` with `<label htmlFor="message">Message</label>`
    - Each error rendered as `<p id="{field}-error" role="alert" className="...">` beneath the field
    - _Requirements: 1.1–1.3, 1.8, 2.1–2.5, 5.1–5.2_

  - [x] 2.4 Render submit button states, loading indicator, success card, and error banner
    - `idle` / `error`: button enabled, labelled "Send Message"
    - `submitting`: button disabled + spinner (Lucide `Loader2` with `animate-spin`); loading indicator visible
    - `success`: replace form with confirmation card; show message that enquiry received and reply expected within 24 hours; clear all fields
    - `error`: show error banner containing `support@thecodereflections.com` as fallback; re-enable button within 100 ms (state transition is synchronous so this is inherent)
    - `success` is terminal until page reload
    - Apply FAQSection styling: `bg-warm-cream`, `text-primary`, `font-serif`/`font-mono`/`font-sans`, `motion/react` for AnimatePresence on error/success panels, `lucide-react` icons
    - _Requirements: 1.4, 3.5–3.6, 4.1–4.6_

  - [ ]* 2.5 Write property-based test — Property 1: Name validation rejects blank-or-whitespace inputs
    - **Property 1: Name validation rejects blank-or-whitespace inputs**
    - Generator for blank: `fc.stringMatching(/^\s*$/)` → expect `errors.name === "Name is required."`
    - Generator for valid: `fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)` → expect no `name` key in result
    - **Validates: Requirements 2.1**
    - _File: `src/__tests__/contactService.pbt.test.ts`_

  - [ ]* 2.6 Write property-based test — Property 2: Email validation classifies valid vs. invalid emails
    - **Property 2: Email validation correctly classifies valid vs. invalid emails**
    - Valid generator: `fc.emailAddress()` → expect no `email` key
    - Invalid generators: strings without `@`; strings with `@` but no `.` in domain → expect `errors.email` set
    - **Validates: Requirements 2.2, 2.3**
    - _File: `src/__tests__/contactService.pbt.test.ts`_

  - [ ]* 2.7 Write property-based test — Property 3: Message validation enforces 10-character minimum
    - **Property 3: Message validation enforces the 10-character minimum**
    - Short generator: `fc.string({ maxLength: 9 })` (trimmed length 0–9) → expect `errors.message` set
    - Valid generator: `fc.string({ minLength: 10 })` with trim check → expect no `message` key
    - **Validates: Requirements 2.4, 2.5**
    - _File: `src/__tests__/contactService.pbt.test.ts`_

  - [ ]* 2.8 Write property-based test — Property 4: All applicable errors appear simultaneously
    - **Property 4: All applicable validation errors appear simultaneously**
    - Generator: `fc.record({ name: fc.string(), email: fc.string(), message: fc.string() })`
    - Classify each field value as valid or invalid; assert all invalid fields have corresponding keys in result
    - **Validates: Requirements 2.6**
    - _File: `src/__tests__/contactService.pbt.test.ts`_

  - [ ]* 2.9 Write property-based test — Property 5: Correcting a field clears its error
    - **Property 5: Correcting a field clears its validation error**
    - For each field: generate invalid value → run validate → generate valid replacement → re-run validate → assert error key absent; other fields unaffected
    - **Validates: Requirements 2.8**
    - _File: `src/__tests__/contactService.pbt.test.ts`_

- [x] 3. Write unit tests for `contactService.ts`
  - [x] 3.1 Create `src/__tests__/contactService.test.ts` with example-based tests for `validateContactForm`
    - All-empty input → all three error keys present with correct messages
    - Valid name + malformed email (missing `@`) → only `email` error
    - Valid name + valid email + message with 8 chars → only `message` error
    - All valid → empty object `{}`
    - Subject string literal equals `"New Contact Form Submission – SendSmiles"`
    - _Requirements: 2.1–2.7_

- [x] 4. Checkpoint — service layer complete
  - Run `npm test` and confirm all service unit tests and PBT tests pass before proceeding to components.
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement `CustomerSupportSection.tsx`
  - [x] 5.1 Create `src/components/CustomerSupportSection.tsx`
    - Root element: `<section id="contact-section" …>` with `bg-warm-cream/50 border-t border-stone-200/80 py-16 px-margin-mobile md:px-gutter` matching FAQSection
    - Heading: `<h2 className="font-serif …">Get In Touch</h2>` (Requirement 1.5)
    - Support email: `<a href="mailto:support@thecodereflections.com">support@thecodereflections.com</a>` visible in DOM (Requirement 1.6)
    - FAQ anchor: `<a href="#faq-section">Browse our FAQ</a>` (Requirement 1.7)
    - Render `<ContactForm />` inside the section
    - Match FAQSection visual style: badge strip, `font-mono` sub-labels, icon from `lucide-react` (e.g. `MessageSquare`)
    - _Requirements: 1.5–1.7, 6.3_

  - [ ]* 5.2 Write property-based test — Property 6: Email template includes all fields and correct Reply-To
    - **Property 6: Email template includes all submission fields and correct Reply-To**
    - Generator: `fc.record({ name: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), email: fc.emailAddress(), message: fc.string({ minLength: 10 }) })`
    - Import and call `buildEmailParams` from Lambda (or extract to shared helper); assert HTML and text bodies contain `name`, `email`, `message`; assert `ReplyToAddresses[0] === email`; assert `Subject === "New Contact Form Submission – SendSmiles"`
    - **Validates: Requirements 3.2, 3.3, 3.4**
    - _File: `src/__tests__/contactService.pbt.test.ts`_

- [x] 6. Implement Lambda `sendContactEmail`
  - [x] 6.1 Create `lambda/sendContactEmail/index.mjs` with `buildEmailParams` helper and handler
    - Import `{ SESClient, SendEmailCommand }` from `@aws-sdk/client-ses` (available in Lambda runtime, no install needed in Lambda zip)
    - Export `buildEmailParams(payload)` function that returns the full `SendEmailCommand` input:
      - `Source: "noreply@thecodereflections.com"`
      - `Destination.ToAddresses: ["support@thecodereflections.com"]`
      - `ReplyToAddresses: [payload.email]`
      - `Message.Subject.Data: "New Contact Form Submission – SendSmiles"`
      - HTML body: inline-styled, warm-cream background, primary `#700016` heading, name/email/message, ISO timestamp
      - Plain-text body: readable fallback
    - Handler: parse body JSON; validate `name`, `email`, `message` present and non-empty; return `400` if missing; call SES; return `200 { ok: true }` on success; return `500 { error: "..." }` on SES failure
    - Include CORS headers (`Access-Control-Allow-Origin: *`) consistent with other API Gateway Lambda functions in the project
    - _Requirements: 3.1–3.4_

- [x] 7. Wire `CustomerSupportSection` into `App.tsx`
  - [x] 7.1 Add "Contact" navigation link in `App.tsx` secondary nav bar (Row 2)
    - Import `CustomerSupportSection` at the top of `App.tsx`
    - Add a nav link in the Row 2 nav strip after the existing "FAQ" link and before "Shipment Tracker":
      ```tsx
      <a
        href="#contact-section"
        className="text-charcoal-text/85 hover:text-primary transition-colors text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
      >
        <MessageSquare className="w-3.5 h-3.5 text-primary" />
        Contact
      </a>
      ```
    - Import `MessageSquare` from `lucide-react` (already available)
    - _Requirements: 6.1_

  - [x] 7.2 Render `<CustomerSupportSection />` in the page layout after `<FAQSection />`
    - Place `<CustomerSupportSection />` immediately after `<FAQSection … />` in the JSX return
    - The `href="#contact-section"` nav link uses native browser smooth scroll (CSS `scroll-behavior: smooth` already provided by Tailwind's `html` base; if not, add `onClick` → `scrollIntoView({ behavior: 'smooth' })`)
    - _Requirements: 6.2–6.4_

- [x] 8. Write component tests for `ContactForm.tsx`
  - [x] 8.1 Create `src/__tests__/ContactForm.test.tsx` using `@testing-library/react`
    - Install `@testing-library/react` and `@testing-library/jest-dom` if not present (add to `devDependencies`)
    - Update `vite.config.ts` `test.environment` to `'jsdom'` and add `setupFiles` referencing `@testing-library/jest-dom/vitest`
    - _Requirements: 5.1–5.2_

  - [x] 8.2 Write state machine UI tests
    - Mock `submitContactForm` to return a pending promise; render `<ContactForm />`; fill valid values; click "Send Message"; assert button is disabled and loading indicator is visible (`submitting` state)
    - Resolve mock with `{ ok: true }`; assert confirmation card visible and form fields cleared (`success` state)
    - Reject mock with an Error; assert error banner visible, button re-enabled, and banner text contains `support@thecodereflections.com` (`error` state)
    - _Requirements: 3.5–3.6, 4.1–4.6_

  - [ ]* 8.3 Write property-based test — Property 7: Error state → resubmit transitions to submitting
    - **Property 7: Error state → resubmit transitions back to submitting and clears error UI**
    - Generator: `fc.record({ name: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), email: fc.emailAddress(), message: fc.string({ minLength: 10 }) })`
    - Simulate: fill form with valid values, reject first submit (→ `error`), submit again; assert error banner absent and loading indicator visible (→ `submitting`)
    - **Validates: Requirements 4.6**
    - _File: `src/__tests__/contactService.pbt.test.ts`_

  - [x] 8.4 Write accessibility attribute tests
    - Assert `<label htmlFor="name">` targets `id="name"`, and equivalents for `email` and `message`
    - Assert each input has `aria-describedby` referencing `"name-error"`, `"email-error"`, `"message-error"` respectively
    - Assert all three fields have `required` attribute
    - Submit empty form; assert all three error elements are in the DOM with correct messages
    - _Requirements: 5.1–5.2, 1.8_

- [x] 9. Final checkpoint — full feature complete
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP iteration.
- The Lambda (`task 6`) and the service layer (`task 1`) are fully independent — they can be implemented in parallel.
- `@testing-library/react` and `@testing-library/jest-dom` are not currently in `devDependencies`; task 8.1 adds them and updates `vite.config.ts` to use `jsdom` environment (currently set to `node`).
- The `buildEmailParams` export from the Lambda (task 6.1) enables Property 6 (task 5.2) to import and test it directly; if the Lambda file is outside the Vitest include path, extract `buildEmailParams` into a separate `lambda/sendContactEmail/emailParams.mjs` and import from there in the PBT test.
- All property tests live in a single file `src/__tests__/contactService.pbt.test.ts` for cohesion.
- Validation runs on submit (eager), and per-field on `onChange` after the first submit attempt (reactive correction feedback) — aligns with design section "Validation — synchronous, run on submit and on field-correction".
- `success` is a terminal state within a session; the user must reload to submit again — no "send another message" button needed unless added as an enhancement.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "6.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "3.1"] },
    { "id": 3, "tasks": ["2.2", "2.3"] },
    { "id": 4, "tasks": ["2.4", "2.5", "2.6", "2.7", "2.8", "2.9"] },
    { "id": 5, "tasks": ["5.1"] },
    { "id": 6, "tasks": ["5.2", "7.1", "8.1"] },
    { "id": 7, "tasks": ["7.2", "8.2"] },
    { "id": 8, "tasks": ["8.3", "8.4"] }
  ]
}
```
