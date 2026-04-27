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
    <div className="flex flex-col flex-1 items-center px-5 py-8 bg-[#FAF7F2]">
      {/* Header */}
      <div className="w-full max-w-md flex justify-end mb-6">
        <LanguageSwitcher />
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-10 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-[#C4956A]/10 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-[#C4956A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 19h20L12 2z" />
            <path d="M12 2v17" />
            <path d="M7 12h10" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#2D2D2D] mb-3 tracking-tight">
          {language === 'es'
            ? 'Audio Guías'
            : language === 'pt'
              ? 'Áudio Guias'
              : 'Audio Guides'}
        </h1>
        <p className="text-base text-[#6B6B6B] leading-relaxed">
          {language === 'es'
            ? 'Elige un destino y explora sus puntos de interés con audioguía interactiva.'
            : language === 'pt'
              ? 'Escolha um destino e explore seus pontos de interesse com audioguia interativo.'
              : 'Choose a destination and explore its points of interest with an interactive audio guide.'}
        </p>
      </div>

      {/* Destinations grid */}
      <div className="w-full max-w-md">
        <h2 className="text-sm font-semibold text-[#9B9B9B] uppercase tracking-wider mb-4">
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
              className="group relative w-full rounded-2xl overflow-hidden border border-[#E8E2D9] bg-white text-left transition-all hover:shadow-md active:scale-[0.98] shadow-sm"
            >
              {/* Destination hero image */}
              <div className="relative w-full h-40 bg-[#F0EBE3] overflow-hidden">
                <img
                  src="/images/pois/piramide-sol.jpg"
                  alt={dest.name[language]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <h3 className="absolute bottom-3 left-4 text-xl font-bold text-white">
                  {dest.name[language]}
                </h3>
              </div>

              <div className="p-4">
                <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
                  {dest.description[language]}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#C4956A] font-medium bg-[#C4956A]/10 px-3 py-1 rounded-full">
                    {dest.poiSlugs.length} {language === 'es' ? 'puntos' : language === 'pt' ? 'pontos' : 'points'}
                  </span>
                  <span className="text-xs text-[#9B9B9B] flex items-center gap-1 group-hover:text-[#C4956A] transition-colors">
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
      <div className="w-full max-w-md mt-8 pt-4 border-t border-[#E8E2D9] text-center">
        <button
          onClick={() => router.push('/credits')}
          className="text-xs text-[#9B9B9B] hover:text-[#6B6B6B] transition-colors"
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
