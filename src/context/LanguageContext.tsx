'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Language } from '@/types';
import { DEFAULT_LANGUAGE } from '@/lib/constants';
import esTranslations from '../../public/data/i18n/es.json';
import enTranslations from '../../public/data/i18n/en.json';
import ptTranslations from '../../public/data/i18n/pt.json';

const STORAGE_KEY = 'teotihuacan-tour-language';

const I18N: Record<Language, Record<string, string>> = {
  es: esTranslations,
  en: enTranslations,
  pt: ptTranslations,
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Look up a translation key. Returns the key itself as fallback. */
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  // Read stored language preference after mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'es' || stored === 'pt' || stored === 'en') {
        setLanguageState(stored);
      }
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  // Sync html lang attribute with selected language
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const translations = I18N[language];

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage may be unavailable (e.g. private browsing quota)
    }
  }, []);

  const t = useCallback(
    (key: string): string => translations[key] ?? key,
    [translations],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
