import React, { createContext, useContext, useState } from 'react';

export type CurrencyCode = 'GBP' | 'INR' | 'USD' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // rate from base (GBP) to this currency — GBP is always 1
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  GBP: { code: 'GBP', symbol: '£', rate: 1,   label: 'GBP (£)' },
  INR: { code: 'INR', symbol: '₹', rate: 110,  label: 'INR (₹)' },
  USD: { code: 'USD', symbol: '$', rate: 1.35, label: 'USD ($)' },
  AED: { code: 'AED', symbol: 'AED ', rate: 5.0, label: 'AED (د.إ)' },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceInGbp: number) => string;
  convertPrice: (priceInGbp: number) => number;
  currentCurrencyConfig: CurrencyConfig;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('rakhi_crate_currency');
    return (saved as CurrencyCode) || 'GBP';
  });

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem('rakhi_crate_currency', code);
  };

  const currentCurrencyConfig = CURRENCIES[currency];

  const convertPrice = (priceInGbp: number): number => {
    return priceInGbp * currentCurrencyConfig.rate;
  };

  const formatPrice = (priceInGbp: number): string => {
    const converted = convertPrice(priceInGbp);
    if (currency === 'GBP') {
      return `£${converted.toFixed(2)}`;
    }
    if (currency === 'INR') {
      return `${currentCurrencyConfig.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
    }
    if (currency === 'AED') {
      return `${currentCurrencyConfig.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${currentCurrencyConfig.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice, currentCurrencyConfig }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
