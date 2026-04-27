'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { haversineDistance } from '@/lib/geo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Destination, PointOfInterest } from '@/types';
import destinationsData from '../../../../public/data/destinations.json';
import poisData from '../../../../public/data/pois.json';

const destinations = destinationsData as Destination[];
const pois = poisData as PointOfInterest[];

const CATEGORY_COLORS: Record<string, string> = {
  pyramid: 'bg-amber-100 text-amber-800',
  temple: 'bg-purple-100 text-purple-800',
  palace: 'bg-blue-100 text-blue-800',
  museum: 'bg-teal-100 text-teal-800',
  plaza: 'bg-green-100 text-green-800',
  mural: 'bg-rose-100 text-rose-800',
  gate: 'bg-stone-100 text-stone-800',
};

function formatDuration(seconds: number): string {
  const mins = Math.ceil(seconds / 60);
  return `${mins} min`;
}

export default function DestinationDetail() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { language } = useLanguage();
  const { position } = useGeolocation();

  const PROXIMITY_THRESHOLD = 50; // meters

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

  const nearbyPois = useMemo(() => {
    if (!position) return new Set<string>();
    const nearby = new Set<string>();
    for (const poi of destinationPois) {
      const dist = haversineDistance(position, poi.coordinates);
      if (dist <= PROXIMITY_THRESHOLD) nearby.add(poi.slug);
    }
    return nearby;
  }, [position, destinationPois]);

  if (!destination) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-[#FAF7F2] px-5 gap-4">
        <p className="text-[#6B6B6B] text-lg">
          {language === 'es'
            ? 'Destino no encontrado'
            : language === 'pt'
              ? 'Destino não encontrado'
              : 'Destination not found'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 rounded-lg bg-[#C4956A] text-white text-sm font-medium"
        >
          {language === 'es' ? 'Volver' : language === 'pt' ? 'Voltar' : 'Back'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-[#FAF7F2]">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-full bg-white border border-[#E8E2D9] shadow-sm flex items-center justify-center"
            aria-label="Back"
          >
            <svg className="w-5 h-5 text-[#2D2D2D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <LanguageSwitcher />
        </div>

        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">
          {destination.name[language]}
        </h1>
        <p className="text-sm text-[#6B6B6B] leading-relaxed mb-1">
          {destination.description[language]}
        </p>
        <p className="text-xs text-[#C4956A] font-medium">
          {destinationPois.length} {language === 'es' ? 'puntos de interés' : language === 'pt' ? 'pontos de interesse' : 'points of interest'}
        </p>
      </div>

      {/* POI list */}
      <div className="px-5 pb-8">
        <h2 className="text-sm font-semibold text-[#9B9B9B] uppercase tracking-wider mb-4">
          {language === 'es'
            ? 'Puntos de interés'
            : language === 'pt'
              ? 'Pontos de interesse'
              : 'Points of interest'}
        </h2>

        <div className="flex flex-col gap-3">
          {destinationPois.map((poi) => {
            const categoryStyle = CATEGORY_COLORS[poi.category] ?? 'bg-stone-100 text-stone-800';
            const isNearby = nearbyPois.has(poi.slug);
            return (
              <button
                key={poi.slug}
                onClick={() => router.push(`/poi/${poi.slug}?from=${destination.slug}`)}
                className={`group w-full rounded-xl bg-white border shadow-sm p-3 text-left transition-all hover:shadow-md hover:border-[#C4956A]/30 active:scale-[0.98] ${isNearby ? 'proximity-pulse' : 'border-[#E8E2D9]'}`}
              >
                <div className="flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-[#F0EBE3]">
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
                      <span className="text-[10px] text-[#9B9B9B] flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        {formatDuration(poi.audioDurationSeconds)}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#2D2D2D] truncate">
                      {poi.name[language]}
                    </h3>
                    {isNearby && (
                      <p className="text-[10px] text-[#C4956A] font-medium mt-0.5">
                        {language === 'es' ? 'Estás cerca' : language === 'pt' ? 'Você está perto' : "You're nearby"}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg className="flex-shrink-0 w-4 h-4 text-[#E8E2D9] group-hover:text-[#C4956A] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
