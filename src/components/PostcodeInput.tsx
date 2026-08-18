import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface PostcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function PostcodeInput({
  value,
  onChange,
  placeholder = 'e.g. SW1A 1AA',
  className = '',
  required = false,
}: PostcodeInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [error, setError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch suggestions from Postcodes.io ────────────────────────────────────
  const fetchSuggestions = useCallback(async (query: string) => {
    const q = query.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `https://api.postcodes.io/postcodes?q=${encodeURIComponent(q)}&limit=5`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.result && data.result.length > 0) {
        const postcodes: string[] = data.result.map((item: any) => item.postcode as string);
        setSuggestions(postcodes);
        setOpen(true);
        setActiveIdx(-1);
      } else {
        setSuggestions([]);
        setOpen(false);
      }
    } catch (err) {
      setError('Could not load suggestions.');
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Debounce on input change ────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true); // show spinner immediately
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(trimmed);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Select a suggestion ────────────────────────────────────────────────────
  const selectPostcode = (postcode: string) => {
    onChange(postcode);
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
  };

  // ── Keyboard navigation ────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < suggestions.length) {
        selectPostcode(suggestions[activeIdx]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input with icon */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading
            ? <Loader2 className="w-4 h-4 text-primary animate-spin" />
            : <MapPin className="w-4 h-4 text-stone-400" />
          }
        </span>
        <input
          type="text"
          required={required}
          value={value}
          onChange={e => onChange(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={`w-full pl-10 pr-4 py-3 border border-stone-200/70 rounded-lg text-xs text-charcoal-text focus:border-primary focus:outline-none bg-warm-cream uppercase font-mono ${className}`}
        />
      </div>

      {/* Error hint */}
      {error && !open && (
        <p className="text-[10px] text-red-500 mt-1 font-sans">{error}</p>
      )}

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden text-xs font-mono"
        >
          {suggestions.map((pc, idx) => (
            <li
              key={pc}
              role="option"
              aria-selected={idx === activeIdx}
              onMouseDown={(e) => { e.preventDefault(); selectPostcode(pc); }}
              onMouseEnter={() => setActiveIdx(idx)}
              className={`px-4 py-2.5 cursor-pointer flex items-center gap-2 transition-colors ${
                idx === activeIdx
                  ? 'bg-primary text-white'
                  : 'text-charcoal-text hover:bg-warm-cream'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${idx === activeIdx ? 'text-white' : 'text-primary'}`} />
              {pc}
            </li>
          ))}
        </ul>
      )}

      {/* No results hint */}
      {open && suggestions.length === 0 && !loading && value.trim().length >= 3 && !error && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg px-4 py-3 text-xs text-stone-400 font-sans">
          No postcodes found for &ldquo;{value.trim()}&rdquo;
        </div>
      )}
    </div>
  );
}
