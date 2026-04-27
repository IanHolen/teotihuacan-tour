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
    <div className="flex items-center gap-1 rounded-full bg-[#F0EBE3] p-1">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            language === code
              ? 'bg-[#C4956A] text-white'
              : 'text-[#6B6B6B] hover:text-[#2D2D2D]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
