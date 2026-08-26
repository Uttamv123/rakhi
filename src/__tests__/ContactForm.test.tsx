// @vitest-environment jsdom
/**
 * Component tests for ContactForm.
 * Uses React Testing Library + jsdom environment.
 * Requirements: 5.1–5.2, 3.5–3.6, 4.1–4.6, 1.8
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '../components/ContactForm';
import * as contactService from '../services/contactService';

// Mock motion/react to avoid animation issues in jsdom
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock submitContactForm
vi.mock('../services/contactService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/contactService')>();
  return {
    ...actual,
    submitContactForm: vi.fn(),
  };
});

const mockSubmit = contactService.submitContactForm as ReturnType<typeof vi.fn>;

// Helper: fill all three fields with valid values
async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/your name/i), 'Jane Smith');
  await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
  await user.type(screen.getByLabelText(/message/i), 'Hello, I need help with my order please.');
}

// ---------------------------------------------------------------------------
// Task 8.2 — State machine UI tests
// ---------------------------------------------------------------------------
describe('ContactForm — state machine UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner and disabled button while submitting', async () => {
    // Never resolves — keeps form in submitting state
    mockSubmit.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const button = screen.getByRole('button', { name: /sending/i });
    expect(button).toBeDisabled();
    // Loader2 renders as an svg inside the button
    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('shows confirmation card and clears fields on successful submission', async () => {
    mockSubmit.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/24 hours/i)).toBeInTheDocument();
    // Form fields should be gone (replaced by success card)
    expect(screen.queryByLabelText(/your name/i)).not.toBeInTheDocument();
  });

  it('shows error banner with support email and re-enables button on failed submission', async () => {
    mockSubmit.mockRejectedValue(new Error('Server error'));
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/support@thecodereflections\.com/i)).toBeInTheDocument();
    });
    // Button should be re-enabled
    expect(screen.getByRole('button', { name: /send message/i })).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Task 8.4 — Accessibility attribute tests
// ---------------------------------------------------------------------------
describe('ContactForm — accessibility', () => {
  it('associates "Your Name" label with the name input via for/id pair', () => {
    render(<ContactForm />);
    const input = screen.getByLabelText(/your name/i);
    expect(input).toHaveAttribute('id', 'name');
  });

  it('associates "Email Address" label with the email input via for/id pair', () => {
    render(<ContactForm />);
    const input = screen.getByLabelText(/email address/i);
    expect(input).toHaveAttribute('id', 'email');
  });

  it('associates "Message" label with the message textarea via for/id pair', () => {
    render(<ContactForm />);
    const textarea = screen.getByLabelText(/message/i);
    expect(textarea).toHaveAttribute('id', 'message');
  });

  it('name input has aria-describedby="name-error"', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/your name/i)).toHaveAttribute('aria-describedby', 'name-error');
  });

  it('email input has aria-describedby="email-error"', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('message textarea has aria-describedby="message-error"', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/message/i)).toHaveAttribute('aria-describedby', 'message-error');
  });

  it('all three fields have the required attribute', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/your name/i)).toBeRequired();
    expect(screen.getByLabelText(/email address/i)).toBeRequired();
    expect(screen.getByLabelText(/message/i)).toBeRequired();
  });

  it('submitting an empty form shows all three inline validation error messages', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email address is required.')).toBeInTheDocument();
    expect(screen.getByText('Message is required.')).toBeInTheDocument();
  });
});
