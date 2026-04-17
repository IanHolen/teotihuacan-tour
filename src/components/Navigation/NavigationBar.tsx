'use client';

import { useLanguage } from '@/context/LanguageContext';
import { formatDistance } from '@/lib/geo';
import type { PointOfInterest } from '@/types';

interface NavigationBarProps {
  currentPoi: PointOfInterest | null;
  nextPoi: PointOfInterest | null;
  distance: number | null;
  progress: number;
  totalStops: number;
  currentIndex: number;
  onSkip: () => void;
  onBack: () => void;
  onPlayAudio: () => void;
}

export default function NavigationBar({
  currentPoi,
  nextPoi,
  distance,
  progress,
  totalStops,
  currentIndex,
  onSkip,
  onBack,
  onPlayAudio,
}: NavigationBarProps) {
  const { language, t } = useLanguage();

  if (!currentPoi) return null;

  const progressPercent = totalStops > 0 ? (currentIndex / totalStops) * 100 : 0;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 bg-[#16213e]/95 backdrop-blur-sm border-t border-white/10 px-4 py-3">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full mb-3">
        <div
          className="h-full bg-[#c4956a] rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Back button */}
        <button
          onClick={onBack}
          disabled={currentIndex === 0}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30 transition-opacity"
          aria-label={t('back')}
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Current stop info */}
        <div className="flex-1 min-w-0 text-center">
          <p className="text-xs text-[#c4956a] font-medium">
            {t('stop')} {currentIndex + 1} / {totalStops}
          </p>
          <p className="text-sm font-semibold text-white truncate">
            {currentPoi.name[language]}
          </p>
          {distance !== null && (
            <p className="text-xs text-white/60">{formatDistance(distance)}</p>
          )}
        </div>

        {/* Play audio button */}
        <button
          onClick={onPlayAudio}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-[#c4956a] flex items-center justify-center transition-opacity hover:opacity-90"
          aria-label={t('playAudio')}
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        {/* Skip button */}
        <button
          onClick={onSkip}
          disabled={currentIndex >= totalStops - 1}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30 transition-opacity"
          aria-label={t('skip')}
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Next stop preview */}
      {nextPoi && (
        <p className="text-xs text-white/40 text-center mt-2 truncate">
          {t('next')}: {nextPoi.name[language]}
        </p>
      )}
    </div>
  );
}
