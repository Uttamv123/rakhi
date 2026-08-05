import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ShoppingBag, Sparkles, Filter, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, PreCuratedGift, StandaloneThreadItem, RakhiThread, PremiumTreat, CrateBoxStyle } from '../types';

interface SearchBarProps {
  formatPrice: (priceInGbp: number) => string;
  onAddToCart: (item: CartItem) => void;
  onOpenCrateBuilder?: () => void;
  preCuratedGifts: PreCuratedGift[];
  standaloneThreads: StandaloneThreadItem[];
  rakhiThreads?: RakhiThread[];
  premiumTreats?: PremiumTreat[];
  crateBoxStyles?: CrateBoxStyle[];
}

export type SearchCategory = 'all' | 'rakhis' | 'sweets' | 'crates';

export interface SearchResultItem {
  id: string;
  category: 'rakhis' | 'sweets' | 'crates';
  categoryLabel: string;
  title: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
  originalItem: any;
}

export default function SearchBar({ formatPrice, onAddToCart, onOpenCrateBuilder, preCuratedGifts, standaloneThreads, rakhiThreads = [], premiumTreats = [], crateBoxStyles = [] }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Escape to close)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Gather all items from datasets (using props)
  const allItems: SearchResultItem[] = [
    // Standalone Threads
    ...standaloneThreads.map((t) => ({
      id: `standalone-${t.id}`,
      category: 'rakhis' as const,
      categoryLabel: 'Sacred Thread',
      title: t.name,
      description: t.description,
      price: t.price,
      image: t.image,
      badge: t.badge || 'Handmade',
      originalItem: { type: 'standalone' as const, data: t },
    })),
    // Rakhi Threads
    ...rakhiThreads.map((r) => ({
      id: `rakhi-${r.id}`,
      category: 'rakhis' as const,
      categoryLabel: 'Rakhi Thread',
      title: r.name,
      description: r.description,
      price: r.price,
      image: r.image,
      badge: r.relationTags?.[0] ? r.relationTags[0].toUpperCase() : 'THREAD',
      originalItem: { type: 'rakhi' as const, data: r },
    })),
    // Gourmet Sweets & Treats
    ...premiumTreats.map((s) => ({
      id: `treat-${s.id}`,
      category: 'sweets' as const,
      categoryLabel: s.category === 'sweets' ? 'Mithai / Sweet' : s.category === 'dry-fruits' ? 'Dry Fruits' : 'Chocolates',
      title: `${s.name} ${s.weightGrams ? `(${s.weightGrams}g)` : ''}`,
      description: s.description,
      price: s.price,
      image: s.image,
      badge: s.category.toUpperCase(),
      originalItem: { type: 'treat' as const, data: s },
    })),
    // Pre-curated Hampers
    ...preCuratedGifts.map((g) => ({
      id: `precurated-${g.id}`,
      category: 'crates' as const,
      categoryLabel: 'Festive Hamper Crate',
      title: g.name,
      description: `${g.description} • Includes: ${g.rakhiName} + ${g.sweetsName}`,
      price: g.price,
      image: g.image,
      badge: g.badge || 'CURATED',
      originalItem: { type: 'precurated' as const, data: g },
    })),
    // Crate Box Styles
    ...crateBoxStyles.map((c) => ({
      id: `cratestyle-${c.id}`,
      category: 'crates' as const,
      categoryLabel: 'Empty Crate Box',
      title: c.name,
      description: c.description,
      price: c.price,
      image: c.image,
      badge: 'BOX STYLE',
      originalItem: { type: 'cratestyle' as const, data: c },
    })),
  ];

  // Filter items based on query and category
  const filteredItems = allItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q))
    );
  });

  const handleItemAddToCart = (item: SearchResultItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    let cartItem: CartItem;

    if (item.originalItem.type === 'precurated') {
      const g = item.originalItem.data;
      cartItem = {
        id: `precurated-${g.id}`,
        type: 'pre-curated',
        title: g.name,
        price: g.price,
        image: g.image,
        description: g.description,
        details: {
          rakhiName: g.rakhiName,
          treatsNames: [g.sweetsName],
        },
        quantity: 1,
      };
    } else if (item.originalItem.type === 'standalone') {
      const t = item.originalItem.data;
      cartItem = {
        id: `standalone-${t.id}`,
        type: 'standalone-thread',
        title: t.name,
        price: t.price,
        image: t.image,
        description: t.description,
        details: {
          rakhiName: t.name,
        },
        quantity: 1,
      };
    } else if (item.originalItem.type === 'treat') {
      const tr = item.originalItem.data;
      cartItem = {
        id: `treat-${tr.id}`,
        type: 'standalone-thread',
        title: item.title,
        price: tr.price,
        image: tr.image,
        description: tr.description,
        details: {
          treatsNames: [tr.name],
        },
        quantity: 1,
      };
    } else if (item.originalItem.type === 'rakhi') {
      const r = item.originalItem.data;
      cartItem = {
        id: `rakhi-${r.id}`,
        type: 'standalone-thread',
        title: r.name,
        price: r.price,
        image: r.image,
        description: r.description,
        details: {
          rakhiName: r.name,
        },
        quantity: 1,
      };
    } else {
      const c = item.originalItem.data;
      cartItem = {
        id: `cratestyle-${c.id}`,
        type: 'standalone-thread',
        title: c.name,
        price: c.price,
        image: c.image,
        description: c.description,
        details: {
          crateBoxName: c.name,
        },
        quantity: 1,
      };
    }

    onAddToCart(cartItem);

    // Show temporary checked indicator
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1800);
  };

  const POPULAR_SEARCH_TAGS = [
    'Kaju Katli',
    'Gold Ganesha',
    'Lumba Set',
    'Heritage Crate',
    'Sandalwood',
    'Kid Cartoon',
    'Motichoor Laddu',
    'Dry Fruits',
  ];

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md" ref={searchRef}>
      {/* Search Input Control */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search Rakhis, Sweets, Crates..."
          className="w-full pl-9 pr-8 py-2 bg-stone-50 hover:bg-stone-100/80 focus:bg-white text-xs font-sans text-charcoal-text placeholder-stone-400 rounded-full border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-xs"
          aria-label="Search Rakhi, sweets, or crates"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-600 rounded-full cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="hidden sm:inline-block absolute right-3 font-mono text-[10px] text-stone-400 bg-stone-200/60 px-1.5 py-0.5 rounded">
            /
          </span>
        )}
      </div>

      {/* Floating Interactive Results Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200/90 z-50 overflow-hidden max-h-[75vh] flex flex-col min-w-[320px] sm:min-w-[420px] -right-12 sm:right-0"
          >
            {/* Header Controls & Filters */}
            <div className="p-3.5 bg-warm-cream/40 border-b border-stone-100 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3 h-3 text-primary" />
                  Filter Search Results ({filteredItems.length})
                </span>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs flex items-center gap-1 font-mono cursor-pointer"
                >
                  Close <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 font-mono text-[10px] overflow-x-auto pb-0.5 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-full font-bold uppercase transition-all whitespace-nowrap cursor-pointer border ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  All ({allItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('rakhis')}
                  className={`px-2.5 py-1 rounded-full font-bold uppercase transition-all whitespace-nowrap cursor-pointer border ${
                    selectedCategory === 'rakhis'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  Rakhis ({allItems.filter((i) => i.category === 'rakhis').length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('sweets')}
                  className={`px-2.5 py-1 rounded-full font-bold uppercase transition-all whitespace-nowrap cursor-pointer border ${
                    selectedCategory === 'sweets'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  Gourmet Sweets ({allItems.filter((i) => i.category === 'sweets').length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('crates')}
                  className={`px-2.5 py-1 rounded-full font-bold uppercase transition-all whitespace-nowrap cursor-pointer border ${
                    selectedCategory === 'crates'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  Hampers ({allItems.filter((i) => i.category === 'crates').length})
                </button>
              </div>
            </div>

            {/* Popular Quick Tags when Query is Empty */}
            {!query.trim() && (
              <div className="px-4 py-3 bg-stone-50/70 border-b border-stone-100 space-y-2">
                <span className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-secondary-gold" /> Popular Search Keywords:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="bg-white hover:bg-primary/10 hover:text-primary text-stone-600 border border-stone-200/80 rounded-lg px-2.5 py-1 text-[11px] font-sans transition-all cursor-pointer shadow-2xs"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="overflow-y-auto p-2 space-y-1.5 divide-y divide-stone-100 max-h-[50vh]">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isAdded = !!addedItemIds[item.id];

                  return (
                    <div
                      key={item.id}
                      className="pt-1.5 first:pt-0 p-2 hover:bg-warm-cream/50 rounded-xl transition-colors flex items-center justify-between gap-3 group"
                    >
                      {/* Left Thumbnail & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200/60 relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                              {item.categoryLabel}
                            </span>
                            {item.badge && (
                              <span className="font-mono text-[9px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded uppercase tracking-wider truncate">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <h4 className="font-serif text-xs font-bold text-charcoal-text truncate group-hover:text-primary transition-colors mt-0.5">
                            {item.title}
                          </h4>

                          <p className="text-[11px] text-stone-500 line-clamp-1 font-sans">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Price & Add Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs font-bold text-primary">
                          {formatPrice(item.price)}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleItemAddToCart(item, e)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-primary text-white hover:bg-primary/90'
                          }`}
                          title="Add item to shopping bag"
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Added
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              +Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-charcoal-text">No items found for "{query}"</h4>
                    <p className="text-xs text-stone-500 font-sans mt-1">
                      Try searching for "Kaju", "Ganesha", "Wooden Crate", or "Lumba".
                    </p>
                  </div>

                  {onOpenCrateBuilder && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenCrateBuilder();
                      }}
                      className="inline-flex items-center gap-1.5 bg-primary text-white px-3.5 py-2 rounded-xl text-xs font-mono font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs mt-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-secondary-gold" />
                      Build Custom Crate Box
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Note */}
            <div className="p-2.5 bg-stone-50 border-t border-stone-100 text-center font-mono text-[10px] text-stone-500">
              ⚡ Express 24-72 hrs UK Delivery on all items
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
