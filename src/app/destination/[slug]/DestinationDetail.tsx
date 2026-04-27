'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Destination, PointOfInterest } from '@/types';
import destinationsData from '../../../../public/data/destinations.json';
import poisData from '../../../../public/data/pois.json';

const destinations = destinationsData as Destination[];
const pois = poisData as PointOfInterest[];

const CATEGORY_COLORS: Record<string, string> = {
  pyramid: 'bg-amber-600/20 text-amber-400',
  temple: 'bg-purple-600/20 text-purple-400',
  palace: 'bg-blue-600/20 text-blue-400',
  museum: 'bg-teal-600/20 text-teal-400',
  plaza: 'bg-green-600/20 text-green-400',
  mural: 'bg-rose-600/20 text-rose-400',
  gate: 'bg-gray-600/20 text-gray-400',
};

const CATEGORY_ICONS: Record<string, string> = {
  pyramid: 'M12 2L2 19h20L12 2z M12 2v17 M7 12h10',
  temple: 'M3 21h18 M5 21V7l7-4 7 4v14 M9 21v-6h6v6',
  palace: 'M3 21h18 M9 21V12h6v9 M12 3L2 9h20L12 3z',
  museum: 'M4 21h16 M4 10h16 M12 3l8 7H4l8-7z M8 10v7 M16 10v7 M12 10v7',
  plaza: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M12 3v18 M3 12h18',
  mural: 'M4 4h16v16H4V4z M4 12h16 M12 4v16 M8 4v8 M16 12v8',
  gate: 'M3 21h18 M7 21V10l5-7 5 7v11 M10 21v-4h4v4',
};

function formatDuration(seconds: number): string {
  const mins = Math.ceil(seconds / 60);
  return `${mins} min`;
}

export default function DestinationDetail() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { language } = useLanguage();

  const destination = useMemo(
    () => destinations.find((d) => d.slug === params.slug) ?? null,
    [params.slug],
  );

  const destinationPois = useMemo(() => {
    if (!destination) return [];
    const poiMap = new Map(pois.map((p) => [p.slug, p]));
    return destination.poiSlugs
      .map((slug) => poiMap.get(slug))
      .filter((p): p is PointOfInterest => p != null);
  }, [destination]);

  if (!destination) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-[#1a1a2e] px-5 gap-4">
        <p className="text-white/60 text-lg">
          {language === 'es'
            ? 'Destino no encontrado'
            : language === 'pt'
              ? 'Destino não encontrado'
              : 'Destination not found'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 rounded-lg bg-[#c4956a] text-white text-sm font-medium"
        >
          {language === 'es' ? 'Volver' : language === 'pt' ? 'Voltar' : 'Back'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-b from-[#1a1a2e] to-[#232342]">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-full bg-[#16213e]/80 border border-white/10 flex items-center justify-center"
            aria-label="Back"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <LanguageSwitcher />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {destination.name[language]}
        </h1>
        <p className="text-sm text-white/60 leading-relaxed mb-1">
          {destination.description[language]}
        </p>
        <p className="text-xs text-[#c4956a] font-medium">
          {destinationPois.length} {language === 'es' ? 'puntos de interés' : language === 'pt' ? 'pontos de interesse' : 'points of interest'}
        </p>
      </div>

      {/* POI list */}
      <div className="px-5 pb-8">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
          {language === 'es'
            ? 'Puntos de interés'
            : language === 'pt'
              ? 'Pontos de interesse'
              : 'Points of interest'}
        </h2>

        <div className="flex flex-col gap-3">
          {destinationPois.map((poi) => {
            const categoryStyle = CATEGORY_COLORS[poi.category] ?? 'bg-white/10 text-white/60';
            return (
              <button
                key={poi.slug}
                onClick={() => router.push(`/poi/${poi.slug}?from=${destination.slug}`)}
                className="group w-full rounded-xl bg-[#16213e] border border-white/10 p-3 text-left transition-all hover:border-[#c4956a]/30 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-[#0f1629]">
                    <img
                      src={poi.image}
                      alt={poi.name[language]}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryStyle}`}>
                        {poi.category}
                      </span>
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        {formatDuration(poi.audioDurationSeconds)}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate">
                      {poi.name[language]}
                    </h3>
                  </div>

                  {/* Arrow */}
                  <svg className="flex-shrink-0 w-4 h-4 text-white/20 group-hover:text-[#c4956a] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
