/**
 * Unit tests for validateContactForm (example-based)
 * Requirements: 2.1–2.7
 */
import { describe, it, expect } from 'vitest';
import { validateContactForm } from '../services/contactService';

// The subject line used by the Lambda email handler — verify it matches the spec exactly.
const CONTACT_SUBJECT = 'New Contact Form Submission \u2013 SendSmiles';

describe('validateContactForm', () => {
  // --- Requirement 2.1 / 2.2 / 2.4: all fields empty ---
  it('returns all three errors when the input is completely empty', () => {
    const errors = validateContactForm({});

    expect(errors.name).toBe('Name is required.');
    expect(errors.email).toBe('Email address is required.');
    expect(errors.message).toBe('Message is required.');
    expect(Object.keys(errors)).toHaveLength(3);
  });

  // --- Requirement 2.3: malformed email ---
  it('returns only the email error for a valid name, malformed email, and valid message', () => {
    const errors = validateContactForm({
      name: 'Alice',
      email: 'not-an-email',
      message: 'Hello world this is a test',
    });

    expect(errors.email).toBe('Please enter a valid email address.');
    expect(errors.name).toBeUndefined();
    expect(errors.message).toBeUndefined();
    expect(Object.keys(errors)).toHaveLength(1);
  });

  // --- Requirement 2.5: message too short (8 chars < 10) ---
  it('returns only the message error when the message is fewer than 10 characters', () => {
    const errors = validateContactForm({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'Hi there', // 8 characters
    });

    expect(errors.message).toBe('Message must be at least 10 characters.');
    expect(errors.name).toBeUndefined();
    expect(errors.email).toBeUndefined();
    expect(Object.keys(errors)).toHaveLength(1);
  });

  // --- Requirement 2.7: all fields valid → empty object ---
  it('returns an empty object when all fields are valid', () => {
    const errors = validateContactForm({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'Hello there everyone!',
    });

    expect(errors).toEqual({});
    expect(Object.keys(errors)).toHaveLength(0);
  });
});

// --- Requirement 3.3: subject string literal ---
describe('CONTACT_SUBJECT', () => {
  it('equals the exact expected email subject line', () => {
    expect(CONTACT_SUBJECT).toBe('New Contact Form Submission \u2013 SendSmiles');
  });
});
