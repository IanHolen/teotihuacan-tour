'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { Language } from '@/types';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            language === code
              ? 'bg-[#c4956a] text-white'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
