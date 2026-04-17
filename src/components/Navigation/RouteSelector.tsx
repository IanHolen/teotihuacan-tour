'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { Route, RouteDuration } from '@/types';
import routesData from '../../../public/data/routes.json';

interface RouteSelectorProps {
  onSelect: (duration: RouteDuration) => void;
}

const DURATION_ICONS: Record<RouteDuration, string> = {
  '1h': '1h',
  '2h': '2h',
  '3h': '3h',
  full: 'Full',
};

export default function RouteSelector({ onSelect }: RouteSelectorProps) {
  const { language, t } = useLanguage();
  const routes = routesData as Route[];
  const [selected, setSelected] = useState<RouteDuration | null>(null);

  function handleSelect(duration: RouteDuration) {
    setSelected(duration);
    onSelect(duration);
  }

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {routes.map((route) => {
        const isActive = selected === route.duration;
        return (
          <button
            key={route.duration}
            onClick={() => handleSelect(route.duration)}
            className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors ${
              isActive
                ? 'bg-[#c4956a]/20 border-[#c4956a]'
                : 'bg-[#16213e] border-white/10 hover:bg-[#1a2745]'
            }`}
          >
            <span className="text-2xl font-bold text-[#c4956a]">
              {DURATION_ICONS[route.duration]}
            </span>
            <span className="text-sm font-semibold text-white">
              {route.label[language]}
            </span>
            <span className="text-xs text-white/60">
              {route.totalStops} {t('stops')} &middot; {route.totalWalkingMinutes} min
            </span>
            <span className="text-xs text-white/50 line-clamp-2">
              {route.description[language]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
