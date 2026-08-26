import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
} from 'lucide-react';
import {
  validateContactForm,
  submitContactForm,
  type SubmissionState,
  type ValidationErrors,
} from '../services/contactService';

// ---------------------------------------------------------------------------
// ContactForm — controlled form with SubmissionState machine
// Sub-tasks 2.1–2.4
// ---------------------------------------------------------------------------

export default function ContactForm() {
  // 2.1 — Field state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // 2.1 — SubmissionState machine starts as 'idle'
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 2.1 — Validation errors start empty
  const [errors, setErrors] = useState<ValidationErrors>({});

  // 2.1 — Track whether submit has been attempted (drives onChange re-validation)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // -------------------------------------------------------------------------
  // 2.1 — Per-field onChange re-validation (only after first submit attempt)
  // -------------------------------------------------------------------------
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (hasAttemptedSubmit) {
      const result = validateContactForm({ name: val, email, message });
      setErrors((prev) => ({ ...prev, name: result.name }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (hasAttemptedSubmit) {
      const result = validateContactForm({ name, email: val, message });
      setErrors((prev) => ({ ...prev, email: result.email }));
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessage(val);
    if (hasAttemptedSubmit) {
      const result = validateContactForm({ name, email, message: val });
      setErrors((prev) => ({ ...prev, message: result.message }));
    }
  };

  // -------------------------------------------------------------------------
  // 2.2 — Submit handler and state transitions
  // idle → submitting → success | error → submitting
  // -------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationResult = validateContactForm({ name, email, message });
    const hasErrors = Object.keys(validationResult).length > 0;

    if (hasErrors) {
      // Show all errors, mark that a submit was attempted
      setErrors(validationResult);
      setHasAttemptedSubmit(true);
      return;
    }

    // Valid — transition to submitting
    setSubmissionState('submitting');
    setErrors({});
    setErrorMessage('');

    try {
      await submitContactForm({ name: name.trim(), email: email.trim(), message: message.trim() });
      // On success: clear fields and transition to terminal 'success' state
      setName('');
      setEmail('');
      setMessage('');
      setHasAttemptedSubmit(false);
      setSubmissionState('success');
    } catch (err) {
      // On failure: transition to 'error', store message for banner
      const msg =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.';
      setErrorMessage(msg);
      setSubmissionState('error');
    }
  };

  // -------------------------------------------------------------------------
  // 2.4 — Success state: replace form with confirmation card (terminal)
  // -------------------------------------------------------------------------
  if (submissionState === 'success') {
    return (
      <AnimatePresence>
        <motion.div
          key="success-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center space-y-4 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold italic text-primary">
              Message Sent!
            </h3>
            <p className="text-sm text-charcoal-text/80 font-sans leading-relaxed">
              Thank you! We'll get back to you within 24 hours.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-charcoal-text/60 font-mono pt-1">
            <Mail className="w-3.5 h-3.5" />
            <a
              href="mailto:support@thecodereflections.com"
              className="hover:text-primary transition-colors"
            >
              support@thecodereflections.com
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const isSubmitting = submissionState === 'submitting';

  // -------------------------------------------------------------------------
  // 2.3 & 2.4 — Form render (idle / submitting / error states)
  // -------------------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* 2.4 — Error banner (shown when submissionState === 'error') */}
      <AnimatePresence>
        {submissionState === 'error' && (
          <motion.div
            key="error-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-sans leading-relaxed">
              {errorMessage || 'Something went wrong. Please try again or email us at'}{' '}
              <a
                href="mailto:support@thecodereflections.com"
                className="font-bold underline hover:text-red-900 transition-colors"
              >
                support@thecodereflections.com
              </a>
              .
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2.3 — Name field */}
      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="text-xs font-bold uppercase tracking-wider text-primary font-mono block"
        >
          Your Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={handleNameChange}
          maxLength={100}
          required
          aria-describedby="name-error"
          aria-invalid={!!errors.name}
          disabled={isSubmitting}
          placeholder="Jane Smith"
          className="bg-white border border-stone-200/80 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary w-full disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        />
        {errors.name && (
          <p
            id="name-error"
            role="alert"
            className="text-red-600 text-xs mt-1 font-sans"
          >
            {errors.name}
          </p>
        )}
        {/* Always render the error container so aria-describedby is always present in the DOM */}
        {!errors.name && (
          <p id="name-error" role="alert" className="sr-only" aria-hidden="true" />
        )}
      </div>

      {/* 2.3 — Email field */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-xs font-bold uppercase tracking-wider text-primary font-mono block"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          maxLength={254}
          required
          aria-describedby="email-error"
          aria-invalid={!!errors.email}
          disabled={isSubmitting}
          placeholder="jane@example.com"
          className="bg-white border border-stone-200/80 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary w-full disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        />
        {errors.email && (
          <p
            id="email-error"
            role="alert"
            className="text-red-600 text-xs mt-1 font-sans"
          >
            {errors.email}
          </p>
        )}
        {!errors.email && (
          <p id="email-error" role="alert" className="sr-only" aria-hidden="true" />
        )}
      </div>

      {/* 2.3 — Message textarea */}
      <div className="space-y-1.5">
        <label
          htmlFor="message"
          className="text-xs font-bold uppercase tracking-wider text-primary font-mono block"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={message}
          onChange={handleMessageChange}
          maxLength={2000}
          required
          rows={5}
          aria-describedby="message-error"
          aria-invalid={!!errors.message}
          disabled={isSubmitting}
          placeholder="Tell us how we can help you…"
          className="bg-white border border-stone-200/80 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary w-full resize-none disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        />
        {errors.message && (
          <p
            id="message-error"
            role="alert"
            className="text-red-600 text-xs mt-1 font-sans"
          >
            {errors.message}
          </p>
        )}
        {!errors.message && (
          <p id="message-error" role="alert" className="sr-only" aria-hidden="true" />
        )}
      </div>

      {/* 2.4 — Submit button */}
      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold font-mono uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          aria-live="polite"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Message
            </>
          )}
        </button>
      </div>

    </form>
  );
}
