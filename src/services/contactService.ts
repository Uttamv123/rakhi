/**
 * Types and interfaces for the Customer Support Contact Form feature.
 *
 * - ContactSubmission  — the data transfer object sent to the /contact endpoint
 * - ValidationErrors   — per-field error messages produced by the client-side validator
 * - SubmissionState    — discriminated union modelling the form lifecycle state machine
 */

/** The payload submitted by the customer via the Contact Us form. */
export interface ContactSubmission {
  /** Customer's display name. 1–100 characters, trimmed. */
  name: string;
  /** Customer's email address. 1–254 characters, valid RFC 5321 format. */
  email: string;
  /** Customer's enquiry message. 10–2000 characters, trimmed. */
  message: string;
}

/**
 * Per-field validation error messages.
 * A key is present only when the corresponding field fails validation.
 * An empty object `{}` means all fields are valid.
 */
export interface ValidationErrors {
  name?: string;
  email?: string;
  message?: string;
}

/**
 * Discriminated union representing the current state of a contact form submission.
 *
 * Allowed transitions:
 *   idle ──(submit valid form)──► submitting
 *   submitting ──(success)──────► success
 *   submitting ──(failure)──────► error
 *   error ──(resubmit)──────────► submitting
 *   success ────────────────────► (terminal until page reload)
 */
export type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Validates the contact form values against the required rules.
 *
 * Rules:
 * - name: required (non-empty, non-whitespace-only)
 * - email: required; must match basic email format
 * - message: required; trimmed length must be at least 10 characters
 *
 * Returns an empty object `{}` when all fields are valid.
 * Returns only the keys that fail validation.
 */
export function validateContactForm(
  values: Partial<ContactSubmission>
): ValidationErrors {
  const errors: ValidationErrors = {};

  // name validation
  if (!values.name || values.name.trim().length === 0) {
    errors.name = 'Name is required.';
  }

  // email validation
  if (!values.email || values.email.trim().length === 0) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  // message validation
  if (!values.message || values.message.trim().length === 0) {
    errors.message = 'Message is required.';
  } else if (values.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  }

  return errors;
}

/**
 * Submits the contact form payload to the API Gateway /contact endpoint.
 *
 * - On network failure (fetch rejects) → throws with a user-facing connection message.
 * - On 4xx response → throws with a user-facing "could not be processed" message.
 * - On 5xx response → throws with a user-facing server error message.
 * - On success (2xx) → resolves with `{ ok: true }`.
 */
export async function submitContactForm(
  payload: ContactSubmission
): Promise<{ ok: true }> {
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL ?? '';

  let response: Response;

  try {
    response = await fetch(`${apiBase}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Unable to reach the server. Please check your connection.');
  }

  if (response.status >= 400 && response.status < 500) {
    throw new Error('Your submission could not be processed. Please try again.');
  }

  if (response.status >= 500) {
    throw new Error(
      'A server error occurred. Please try again or email us directly.'
    );
  }

  return { ok: true };
}
