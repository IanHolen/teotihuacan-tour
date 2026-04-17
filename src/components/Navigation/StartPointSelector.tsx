'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { PointOfInterest, Route } from '@/types';
import poisData from '../../../public/data/pois.json';

interface StartPointSelectorProps {
  route: Route;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const allPois = poisData as PointOfInterest[];

export default function StartPointSelector({
  route,
  selectedIndex,
  onSelect,
}: StartPointSelectorProps) {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {route.stops.map((stop, index) => {
        const poi = allPois.find((p) => p.slug === stop.poiSlug);
        if (!poi) return null;
        const isSelected = index === selectedIndex;

        return (
          <button
            key={stop.poiSlug}
            onClick={() => onSelect(index)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
              isSelected
                ? 'bg-[#c4956a]/20 border border-[#c4956a]'
                : 'bg-[#16213e]/60 border border-transparent hover:bg-[#1a2745]'
            }`}
          >
            <span
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isSelected
                  ? 'bg-[#c4956a] text-white'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {stop.order}
            </span>
            <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-white/70'}`}>
              {poi.name[language]}
            </span>
            {isSelected && (
              <span className="ml-auto text-xs text-[#c4956a] font-medium">
                {language === 'es' ? 'Inicio' : language === 'pt' ? 'Início' : 'Start'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
