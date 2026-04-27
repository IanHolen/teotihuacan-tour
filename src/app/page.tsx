'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Destination } from '@/types';
import destinationsData from '../../public/data/destinations.json';

const destinations = destinationsData as Destination[];

export default function HomePage() {
  const router = useRouter();
  const { language } = useLanguage();

  return (
    <div className="flex flex-col flex-1 items-center px-5 py-8 bg-gradient-to-b from-[#1a1a2e] to-[#232342]">
      {/* Header */}
      <div className="w-full max-w-md flex justify-end mb-6">
        <LanguageSwitcher />
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-10 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-[#c4956a]/20 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-[#c4956a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 19h20L12 2z" />
            <path d="M12 2v17" />
            <path d="M7 12h10" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          {language === 'es'
            ? 'Audio Guías'
            : language === 'pt'
              ? 'Áudio Guias'
              : 'Audio Guides'}
        </h1>
        <p className="text-base text-white/60 leading-relaxed">
          {language === 'es'
            ? 'Elige un destino y explora sus puntos de interés con audioguía interactiva.'
            : language === 'pt'
              ? 'Escolha um destino e explore seus pontos de interesse com audioguia interativo.'
              : 'Choose a destination and explore its points of interest with an interactive audio guide.'}
        </p>
      </div>

      {/* Destinations grid */}
      <div className="w-full max-w-md">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
          {language === 'es'
            ? 'Destinos disponibles'
            : language === 'pt'
              ? 'Destinos disponíveis'
              : 'Available destinations'}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {destinations.map((dest) => (
            <button
              key={dest.slug}
              onClick={() => router.push(`/destination/${dest.slug}`)}
              className="group relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#16213e] text-left transition-all hover:border-[#c4956a]/40 hover:shadow-lg hover:shadow-[#c4956a]/10 active:scale-[0.98]"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-orange-800/20 to-[#16213e] opacity-60 group-hover:opacity-80 transition-opacity" />

              {/* Icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-20 h-20 text-[#c4956a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                  <path d="M12 2L2 19h20L12 2z" />
                  <path d="M12 2v17" />
                  <path d="M7 12h10" />
                </svg>
              </div>

              <div className="relative p-5">
                <h3 className="text-xl font-bold text-white mb-2">
                  {dest.name[language]}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-4">
                  {dest.description[language]}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#c4956a] font-medium bg-[#c4956a]/10 px-3 py-1 rounded-full">
                    {dest.poiSlugs.length} {language === 'es' ? 'puntos' : language === 'pt' ? 'pontos' : 'points'}
                  </span>
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    {language === 'es'
                      ? 'Explorar'
                      : language === 'pt'
                        ? 'Explorar'
                        : 'Explore'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md mt-8 pt-4 border-t border-white/5 text-center">
        <button
          onClick={() => router.push('/credits')}
          className="text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          {language === 'es'
            ? 'Créditos de imágenes'
            : language === 'pt'
              ? 'Créditos de imagens'
              : 'Image credits'}
        </button>
      </div>
    </div>
  );
}
