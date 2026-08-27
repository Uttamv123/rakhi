# Requirements Document

## Introduction

This feature adds a **Customer Support** section to the SendSmiles Rakhi e-commerce website. It provides a "Contact Us" form that allows customers (both guests and signed-in users) to submit enquiries directly from the website. On submission, the form message is delivered to the support team via email using AWS SES (Simple Email Service), consistent with the project's existing AWS infrastructure (Cognito, DynamoDB). The form collects the customer's name, email address, and message, and sends the content to `support@thecodereflections.com`.

---

## Glossary

- **ContactForm**: The React component that renders the customer-facing "Contact Us" form with Name, Email, and Message fields.
- **ContactSubmission**: The data object representing a single form submission, containing `name`, `email`, `message`, and `submittedAt` fields.
- **EmailService**: The backend integration (AWS SES or AWS Lambda + SES) responsible for forwarding a `ContactSubmission` to the support inbox.
- **SupportEmail**: The designated recipient email address `support@thecodereflections.com` that receives all forwarded submissions.
- **Validator**: The client-side logic that checks `ContactSubmission` fields before allowing form submission.
- **CustomerSupportSection**: The full page section housing the `ContactForm` alongside supporting text, contact details, and a link to the FAQ section.
- **SubmissionState**: The current status of a form submission, one of: `idle`, `submitting`, `success`, or `error`.

---

## Requirements

### Requirement 1: Contact Form Rendering

**User Story:** As a customer visiting the SendSmiles website, I want to see a clearly labelled "Contact Us" form, so that I know where to send my enquiry.

#### Acceptance Criteria

1. THE `ContactForm` SHALL render a text input field labelled "Your Name" with a maximum of 100 characters.
2. THE `ContactForm` SHALL render an email input field labelled "Email Address" with a maximum of 254 characters.
3. THE `ContactForm` SHALL render a multi-line textarea field labelled "Message" with a maximum of 2000 characters.
4. THE `ContactForm` SHALL render a submit button labelled "Send Message".
5. THE `CustomerSupportSection` SHALL display a heading of "Contact Us" or "Get In Touch".
6. THE `CustomerSupportSection` SHALL display the support email address `support@thecodereflections.com` in the rendered DOM where it is visible to a sighted user in a default browser viewport.
7. THE `CustomerSupportSection` SHALL include an anchor link with `href="#faq-section"` that navigates the customer to the FAQ section for self-service answers.
8. THE `ContactForm` SHALL mark the Name, Email Address, and Message fields as required so that browsers and assistive technologies can identify them as mandatory.

---

### Requirement 2: Client-Side Input Validation

**User Story:** As a customer filling in the Contact Us form, I want to be told immediately if I have left a required field blank or entered an invalid email, so that I can correct mistakes before submitting.

#### Acceptance Criteria

1. WHEN the customer clicks "Send Message" with an empty Name field, THE `Validator` SHALL display an inline error message "Name is required." directly below the Name input field.
2. WHEN the customer clicks "Send Message" with an empty Email Address field, THE `Validator` SHALL display an inline error message "Email address is required." directly below the Email Address input field.
3. WHEN the customer clicks "Send Message" with a malformed email address (not matching the pattern `local@domain.tld`), THE `Validator` SHALL display an inline error message "Please enter a valid email address." directly below the Email Address input field.
4. WHEN the customer clicks "Send Message" with an empty Message field, THE `Validator` SHALL display an inline error message "Message is required." directly below the Message textarea.
5. WHEN the customer clicks "Send Message" with a Message field containing fewer than 10 characters, THE `Validator` SHALL display an inline error message "Message must be at least 10 characters." directly below the Message textarea.
6. WHEN the customer clicks "Send Message" and multiple fields are invalid simultaneously, THE `Validator` SHALL display all applicable error messages at the same time, one per field.
7. WHEN all fields are valid, THE `Validator` SHALL automatically trigger the form submission to the server without requiring any additional user action.
8. WHEN the customer corrects a field that previously showed a validation error, THE `Validator` SHALL clear that field's error message.

---

### Requirement 3: Form Submission and Email Delivery

**User Story:** As a customer who has filled in the Contact Us form, I want my message to be sent to the support team when I click "Send Message", so that I receive assistance with my enquiry.

#### Acceptance Criteria

1. WHEN the customer submits a valid `ContactSubmission`, THE `EmailService` SHALL forward the submission to `support@thecodereflections.com` within 30 seconds.
2. WHEN the customer submits a valid `ContactSubmission`, THE `EmailService` SHALL include the customer's Name, Email, and Message in the forwarded email body.
3. WHEN the customer submits a valid `ContactSubmission`, THE `EmailService` SHALL set the email subject to `"New Contact Form Submission – SendSmiles"`.
4. WHEN the customer submits a valid `ContactSubmission`, THE `EmailService` SHALL set the Reply-To header of the forwarded email to the customer's submitted email address.
5. WHILE the submission is in the `submitting` `SubmissionState`, THE `ContactForm` SHALL disable the "Send Message" button; WHEN the `SubmissionState` exits `submitting` (to either `success` or `error`), THE `ContactForm` SHALL re-enable the button unless the state has transitioned to `success`.
6. WHILE the submission is in the `submitting` `SubmissionState`, THE `ContactForm` SHALL display a loading indicator on or near the "Send Message" button.
7. WHEN the `EmailService` fails to deliver the email (network error or service error), THE `ContactForm` SHALL transition the `SubmissionState` to `error` so the customer receives visible feedback.
8. WHEN the `EmailService` successfully delivers the email, THE `ContactForm` SHALL transition the `SubmissionState` to `success` and clear all input field values.

---

### Requirement 4: Submission Feedback to the Customer

**User Story:** As a customer who has submitted the Contact Us form, I want to see a clear confirmation or error message, so that I know whether my message was sent successfully.

#### Acceptance Criteria

1. WHEN the `EmailService` returns a success response, THE `ContactForm` SHALL transition the `SubmissionState` to `success` and display a confirmation message communicating that the enquiry was received and a response will follow within 24 hours.
2. WHEN the `SubmissionState` is `success`, THE `ContactForm` SHALL clear all input field values and reset the form to its initial `idle` state layout.
3. WHEN the `EmailService` returns an error response, THE `ContactForm` SHALL transition the `SubmissionState` to `error` and display an error message that includes the support email address `support@thecodereflections.com` as a fallback contact option.
4. WHEN the `SubmissionState` transitions from `submitting` to `error`, THE `ContactForm` SHALL re-enable the "Send Message" button within 100ms so the customer can retry.
5. WHILE the `SubmissionState` is `success`, THE `ContactForm` SHALL display the confirmation message until the customer navigates away or reloads the page.
6. WHEN the customer submits the form again after a previous `error` state, THE `ContactForm` SHALL clear the error message and transition back to `submitting` state.

---

### Requirement 5: Accessibility and Responsive Layout

**User Story:** As a customer on any device or using assistive technology, I want the Contact Us form to be fully usable and readable, so that I can submit my enquiry regardless of device or ability.

#### Acceptance Criteria

1. THE `ContactForm` SHALL associate every input field with its label using matching `for`/`id` attribute pairs so that activating the label programmatically focuses the corresponding input.
2. THE `ContactForm` SHALL set `aria-describedby` on each input to reference the `id` of that field's error message element, so that screen readers announce the error text when the field receives focus after a failed submission attempt or after the field loses focus with an invalid value.
3. THE `CustomerSupportSection` SHALL render without any element's `scrollWidth` exceeding the viewport width at 320px, 375px, 768px, and 1440px widths.
4. THE `ContactForm` SHALL expose a visible focus indicator (outline or highlight) on each interactive element when navigated by keyboard, and SHALL NOT trap keyboard focus inside the form.
5. WHERE the customer's device has the `prefers-reduced-motion: reduce` media query active, THE `CustomerSupportSection` SHALL not play any CSS transition or animation on decorative elements.

---

### Requirement 6: Integration with Existing Site Navigation

**User Story:** As a customer browsing the SendSmiles website, I want to be able to reach the Contact Us section easily from the existing navigation, so that I can find support without searching.

#### Acceptance Criteria

1. THE `App` SHALL include a navigation link labelled "Contact" in the secondary navigation bar (Row 2 of the existing header) that, when clicked, scrolls the viewport to the `CustomerSupportSection`.
2. WHEN the customer clicks the "Contact" navigation link, THE `App` SHALL invoke `scrollIntoView` with `behavior: "smooth"` (or an equivalent CSS `scroll-behavior: smooth`) targeting the element with `id="contact-section"`.
3. THE `CustomerSupportSection` root element SHALL have the attribute `id="contact-section"` to serve as the scroll target for the navigation link.
4. THE `CustomerSupportSection` SHALL be placed in the page layout after the existing `FAQSection` component (i.e., rendered after the element with `id="faq-section"`).
