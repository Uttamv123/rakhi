import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, Truck, MapPin, Sparkles, Clock, Package, MessageSquare } from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'shipping' | 'custom' | 'ordering';
  question: string;
  answer: string;
  highlight?: string;
  icon: React.ElementType;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'shipping-time',
    category: 'shipping',
    question: 'What are your delivery times across the UK?',
    answer: 'We dispatch all festive hampers and sacred thread orders directly from our UK distribution hub. Our guaranteed express delivery timeframe is 24 to 72 hours across England, Scotland, Wales, and Northern Ireland. Sweets are freshly sealed prior to dispatch to ensure pristine quality upon arrival.',
    highlight: '24–72 Hours Express Delivery',
    icon: Clock,
  },
  {
    id: 'delivery-locations',
    category: 'shipping',
    question: 'Which locations do you deliver to and can international customers order?',
    answer: 'We deliver to every doorstep and residential or office address in the United Kingdom. Relatives and siblings living anywhere in the world—including India, USA, Canada, Australia, UAE, and Europe—can place orders on our website in their preferred currency (INR, USD, AED, GBP) to be delivered straight to UK recipients.',
    highlight: 'UK-Wide Coverage & Global Access',
    icon: MapPin,
  },
  {
    id: 'custom-thread-requests',
    category: 'custom',
    question: 'How do custom thread & crate requests work?',
    answer: 'You can design a bespoke gift box using our interactive Crate Customizer! Select your choice of artisanal threads (such as 24K Gold Ganesha, Zardosi, Sandalwood, Lumba sets, or cartoon Rakhi threads for kids), add gourmet sweets or chocolates, and write a personalized gift card. For special bulk or custom thread arrangements, our support team is happy to assist.',
    highlight: 'Interactive Crate Builder & Custom Threads',
    icon: Sparkles,
  },
  {
    id: 'sweets-freshness',
    category: 'ordering',
    question: 'How do you guarantee the freshness of sweets in transit?',
    answer: 'All traditional Indian mithai (Silver Kaju Katli, Saffron Motichoor Laddus, Besan Barfi) are handcrafted in small batches, vacuum-sealed in food-grade protective containers, and cushioned inside pine wood wool padding inside our sturdy crates to preserve taste and texture.',
    highlight: 'Vacuum-Sealed Food-Grade Packaging',
    icon: Package,
  },
  {
    id: 'order-tracking',
    category: 'ordering',
    question: 'How do I track my delivery status?',
    answer: 'As soon as your crate is assembled and dispatched, you can track its journey in real time. Simply click "Shipment Tracker" in the top navigation bar to view your live courier status, tracking code, and timeline updates.',
    highlight: 'Live Real-Time Courier Tracking',
    icon: Truck,
  },
];

interface FAQSectionProps {
  onOpenCrateBuilder?: () => void;
  onOpenTracker?: () => void;
}

export default function FAQSection({ onOpenCrateBuilder, onOpenTracker }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>('shipping-time');
  const [activeCategory, setActiveCategory] = useState<'all' | 'shipping' | 'custom' | 'ordering'>('all');

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaqs = FAQ_DATA.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <section className="bg-warm-cream/50 border-t border-stone-200/80 py-16 px-margin-mobile md:px-gutter text-charcoal-text" id="faq-section">
      <div className="max-w-container-max mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3.5 py-1.5 rounded-full shadow-xs">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="font-bold text-[10px] uppercase tracking-widest font-mono">Got Questions?</span>
          </div>
          
          <h2 className="font-serif text-3xl md:text-4xl font-black italic text-primary">
            Frequently Asked Questions
          </h2>
          
          <p className="text-xs md:text-sm text-charcoal-text/80 leading-relaxed font-sans">
            Find quick answers regarding our UK delivery turnaround, global order access, custom thread combinations, and sweet freshness guarantees.
          </p>

          {/* Quick Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left font-mono">
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/60 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">Fast Delivery</span>
                <span className="text-xs font-black text-charcoal-text">24 - 72 Hours</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200/60 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">Coverage</span>
                <span className="text-xs font-black text-charcoal-text">All UK Postcodes</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200/60 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">Custom Threads</span>
                <span className="text-xs font-black text-charcoal-text">Personalized Crates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center gap-2 font-mono text-xs flex-wrap">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              activeCategory === 'all'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
            }`}
          >
            All Questions ({FAQ_DATA.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('shipping')}
            className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              activeCategory === 'shipping'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
            }`}
          >
            Shipping &amp; Delivery (2)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('custom')}
            className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              activeCategory === 'custom'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
            }`}
          >
            Custom Threads &amp; Crates (1)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('ordering')}
            className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              activeCategory === 'ordering'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
            }`}
          >
            Freshness &amp; Tracking (2)
          </button>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3">
          {filteredFaqs.map((item) => {
            const isOpen = openId === item.id;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-stone-200/80 shadow-xs hover:border-stone-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full text-left p-5 md:p-6 flex justify-between items-center gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-xl transition-colors shrink-0 ${isOpen ? 'bg-primary text-white' : 'bg-warm-cream text-primary'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm md:text-base font-bold text-primary leading-snug">
                        {item.question}
                      </h3>
                      {item.highlight && (
                        <span className="inline-block mt-1 font-mono text-[10px] text-primary/80 font-semibold uppercase tracking-wider">
                          • {item.highlight}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`p-1.5 rounded-full transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 bg-primary/10 text-primary' : 'text-stone-400'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-6 pt-1 md:px-6 text-xs md:text-sm text-charcoal-text/80 leading-relaxed font-sans border-t border-dashed border-stone-100">
                        <p>{item.answer}</p>
                        
                        {/* Action buttons if applicable */}
                        {item.id === 'custom-thread-requests' && onOpenCrateBuilder && (
                          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={onOpenCrateBuilder}
                              className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-secondary-gold" />
                              Open Crate Customizer
                            </button>
                          </div>
                        )}

                        {item.id === 'order-tracking' && onOpenTracker && (
                          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={onOpenTracker}
                              className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                              <Truck className="w-3.5 h-3.5 text-white" />
                              Open Shipment Tracker
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer Contact Note */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 max-w-2xl mx-auto text-center space-y-2 shadow-xs">
          <div className="flex items-center justify-center gap-2 text-primary">
            <MessageSquare className="w-4 h-4" />
            <span className="font-serif font-bold text-sm italic">Have a unique or bulk custom thread requirement?</span>
          </div>
          <p className="text-xs text-charcoal-text/75 font-sans">
            Our UK support team is available 24/7 to help arrange customized hampers, special threads, or scheduled delivery dates for your family.
          </p>
        </div>

      </div>
    </section>
  );
}
