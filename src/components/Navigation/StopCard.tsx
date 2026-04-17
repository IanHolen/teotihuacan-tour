'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { PointOfInterest } from '@/types';

interface StopCardProps {
  poi: PointOfInterest;
  isActive: boolean;
  stopNumber: number;
  onNavigate: () => void;
  onPlayAudio: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  pyramid: 'bg-amber-600/20 text-amber-400',
  temple: 'bg-purple-600/20 text-purple-400',
  palace: 'bg-blue-600/20 text-blue-400',
  museum: 'bg-teal-600/20 text-teal-400',
  plaza: 'bg-green-600/20 text-green-400',
  mural: 'bg-rose-600/20 text-rose-400',
  gate: 'bg-gray-600/20 text-gray-400',
};

export default function StopCard({
  poi,
  isActive,
  stopNumber,
  onNavigate,
  onPlayAudio,
}: StopCardProps) {
  const { language, t } = useLanguage();

  const categoryStyle = CATEGORY_COLORS[poi.category] ?? 'bg-white/10 text-white/60';

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isActive
          ? 'bg-[#16213e] border-[#c4956a]'
          : 'bg-[#16213e] border-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#c4956a]">#{stopNumber}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryStyle}`}>
              {poi.category}
            </span>
          </div>
          <h3 className="text-base font-semibold text-white truncate">
            {poi.name[language]}
          </h3>
        </div>
      </div>

      <p className="text-sm text-white/70 mb-3 line-clamp-2">
        {poi.shortDescription[language]}
      </p>

      <div className="flex items-center gap-3 text-xs text-white/50 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {poi.estimatedVisitMinutes} min
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
          {Math.ceil(poi.audioDurationSeconds / 60)} min
        </span>
        {poi.elevation != null && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 21l4-11 4 11" />
              <path d="M2 21h20" />
            </svg>
            {poi.elevation}m
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onNavigate}
          className="flex-1 h-9 rounded-lg bg-[#c4956a] text-white text-sm font-medium transition-opacity hover:opacity-90"
        >
          {t('navigate')}
        </button>
        <button
          onClick={onPlayAudio}
          className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center transition-colors hover:bg-white/20"
          aria-label={t('playAudio')}
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
