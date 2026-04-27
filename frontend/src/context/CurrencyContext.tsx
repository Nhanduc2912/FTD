import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (value: number, compact?: boolean) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('ftd_currency') || 'USD';
  });

  const setCurrency = (newCurrency: string) => {
    localStorage.setItem('ftd_currency', newCurrency);
    setCurrencyState(newCurrency);
  };

  const formatCurrency = useCallback((value: number, compact: boolean = false) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: compact || currency === 'VND' ? 0 : 2,
    }).format(value);
  }, [i18n.language, currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
