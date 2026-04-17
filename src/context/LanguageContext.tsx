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

const STORAGE_KEY = 'teotihuacan-tour-language';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Look up a translation key. Returns the key itself as fallback. */
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'es' || stored === 'pt' || stored === 'en') return stored;
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Hydrate from localStorage on mount
  useEffect(() => {
    setLanguageState(getInitialLanguage());
  }, []);

  // Fetch translations whenever language changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/data/i18n/${language}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Record<string, string> = await res.json();
        if (!cancelled) setTranslations(data);
      } catch {
        if (!cancelled) setTranslations({});
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [language]);

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
