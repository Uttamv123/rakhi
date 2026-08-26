import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Mail, HelpCircle } from 'lucide-react';
import ContactForm from './ContactForm';

// ---------------------------------------------------------------------------
// CustomerSupportSection — full page section wrapping ContactForm
// Requirements 1.5–1.7, 6.3
// ---------------------------------------------------------------------------

export default function CustomerSupportSection() {
  return (
    <motion.section
      id="contact-section"
      className="bg-warm-cream/50 border-t border-stone-200/80 py-16 px-margin-mobile md:px-gutter text-charcoal-text"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="max-w-container-max mx-auto space-y-10">

        {/* Header — mirrors FAQSection badge + heading pattern */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          {/* Badge strip */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3.5 py-1.5 rounded-full shadow-xs">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="font-bold text-[10px] uppercase tracking-widest font-mono">Need Help?</span>
          </div>

          {/* Heading — Requirement 1.5 */}
          <h2 className="font-serif text-3xl md:text-4xl font-black italic text-primary">
            Get In Touch
          </h2>

          <p className="text-xs md:text-sm text-charcoal-text/80 leading-relaxed font-sans">
            Our UK support team is available 24/7. Send us a message and we'll get back to you within 24 hours.
          </p>

          {/* Quick info cards — warm-cream palette, mono sub-labels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-left font-mono">

            {/* Support email card — Requirement 1.6 */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/60 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">Email Us</span>
                <a
                  href="mailto:support@thecodereflections.com"
                  className="text-xs font-black text-charcoal-text hover:text-primary transition-colors truncate block"
                >
                  support@thecodereflections.com
                </a>
              </div>
            </div>

            {/* FAQ anchor card — Requirement 1.7 */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/60 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">Self-Service</span>
                <a
                  href="#faq-section"
                  className="text-xs font-black text-charcoal-text hover:text-primary transition-colors"
                >
                  Browse our FAQ
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Contact form — Requirement 1.5 (ContactForm rendered inside section) */}
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-serif font-bold text-sm italic text-primary">Send us a message</span>
            </div>
            <ContactForm />
          </div>
        </div>

      </div>
    </motion.section>
  );
}
