import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  PreCuratedGift,
  StandaloneThreadItem,
  RakhiThread,
  PremiumTreat,
  CrateBoxStyle,
} from '../types';
import { fetchProducts } from '../services/productService';
import { mapProducts } from '../services/productMapper';
import {
  PRE_CURATED_GIFTS,
  STANDALONE_THREADS,
  RAKHI_THREADS,
  PREMIUM_TREATS,
  CRATE_BOX_STYLES,
} from '../data';

export interface UseProductsReturn {
  preCuratedGifts: PreCuratedGift[];
  standaloneThreads: StandaloneThreadItem[];
  rakhiThreads: RakhiThread[];
  premiumTreats: PremiumTreat[];
  crateBoxStyles: CrateBoxStyle[];
  isLoading: boolean;
  error: string | null;
  isFallback: boolean;
  retry: () => void;
}

export function useProducts(): UseProductsReturn {
  const [preCuratedGifts, setPreCuratedGifts] = useState<PreCuratedGift[]>([]);
  const [standaloneThreads, setStandaloneThreads] = useState<StandaloneThreadItem[]>([]);
  const [rakhiThreads, setRakhiThreads] = useState<RakhiThread[]>([]);
  const [premiumTreats, setPremiumTreats] = useState<PremiumTreat[]>([]);
  const [crateBoxStyles, setCrateBoxStyles] = useState<CrateBoxStyle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadFallbackData = useCallback(() => {
    setPreCuratedGifts(PRE_CURATED_GIFTS);
    setStandaloneThreads(STANDALONE_THREADS);
    setRakhiThreads(RAKHI_THREADS);
    setPremiumTreats(PREMIUM_TREATS);
    setCrateBoxStyles(CRATE_BOX_STYLES);
    setIsFallback(true);
    setError(null);
    setIsLoading(false);
  }, []);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    setIsFallback(false);

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const apiProducts = await fetchProducts();

        // Check if aborted before updating state
        if (signal.aborted) return;

        const mapped = mapProducts(apiProducts);

        setPreCuratedGifts(mapped.preCuratedGifts);
        setStandaloneThreads(mapped.standaloneThreads);
        setRakhiThreads(mapped.rakhiThreads);
        setPremiumTreats(mapped.premiumTreats);
        setCrateBoxStyles(mapped.crateBoxStyles);
        setIsLoading(false);
        return; // Success — exit
      } catch (err: unknown) {
        if (signal.aborted) return;
        attempts++;

        if (attempts >= maxAttempts) {
          // Both attempts failed — fall back to static data
          loadFallbackData();
          return;
        }
        // First failure — retry immediately (loop continues)
      }
    }
  }, [loadFallbackData]);

  const retry = useCallback(() => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchData(controller.signal);
  }, [fetchData]);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetchData(controller.signal);

    return () => {
      controller.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    preCuratedGifts,
    standaloneThreads,
    rakhiThreads,
    premiumTreats,
    crateBoxStyles,
    isLoading,
    error,
    isFallback,
    retry,
  };
}
