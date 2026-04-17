'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigation } from '@/context/NavigationContext';
import AudioPlayer from '@/components/AudioPlayer/AudioPlayer';
import type { PointOfInterest } from '@/types';
import poisData from '../../../../public/data/pois.json';

const CATEGORY_COLORS: Record<string, string> = {
  pyramid: 'bg-amber-600/20 text-amber-400',
  temple: 'bg-purple-600/20 text-purple-400',
  palace: 'bg-blue-600/20 text-blue-400',
  museum: 'bg-teal-600/20 text-teal-400',
  plaza: 'bg-green-600/20 text-green-400',
  mural: 'bg-rose-600/20 text-rose-400',
  gate: 'bg-gray-600/20 text-gray-400',
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  pyramid: 'from-amber-900/80 via-orange-800/60 to-[#16213e]',
  temple: 'from-purple-900/80 via-violet-800/60 to-[#16213e]',
  palace: 'from-blue-900/80 via-indigo-800/60 to-[#16213e]',
  museum: 'from-teal-900/80 via-cyan-800/60 to-[#16213e]',
  plaza: 'from-green-900/80 via-emerald-800/60 to-[#16213e]',
  mural: 'from-rose-900/80 via-pink-800/60 to-[#16213e]',
  gate: 'from-gray-800/80 via-slate-700/60 to-[#16213e]',
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

export default function PoiDetail() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { language, t } = useLanguage();
  const { startNavigation } = useNavigation();

  const poi = useMemo<PointOfInterest | null>(
    () => (poisData as PointOfInterest[]).find((p) => p.slug === params.slug) ?? null,
    [params.slug],
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  if (!poi) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-[#1a1a2e] px-5 gap-4">
        <p className="text-white/60 text-lg">
          {language === 'es'
            ? 'Punto no encontrado'
            : language === 'pt'
              ? 'Ponto nao encontrado'
              : 'Point not found'}
        </p>
        <button
          onClick={() => router.push('/map')}
          className="px-6 py-2 rounded-lg bg-[#c4956a] text-white text-sm font-medium"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  const categoryStyle = CATEGORY_COLORS[poi.category] ?? 'bg-white/10 text-white/60';

  return (
    <div className="flex flex-col flex-1 bg-[#1a1a2e] pb-24">
      {/* Header image area */}
      <div className="relative w-full h-56 bg-[#16213e] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[poi.category] ?? 'from-slate-800 to-[#16213e]'}`} />
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg className="w-24 h-24 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            {(CATEGORY_ICONS[poi.category] ?? '').split(' M').map((d, i) => (
              <path key={i} d={i === 0 ? d : `M${d}`} />
            ))}
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.push('/map')}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-[#16213e]/80 backdrop-blur-sm border border-white/10 flex items-center justify-center"
          aria-label="Back"
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-5 -mt-8 relative z-10">
        {/* Category badge */}
        <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium mb-3 ${categoryStyle}`}>
          {poi.category}
        </span>

        <h1 className="text-2xl font-bold text-white mb-2">
          {poi.name[language]}
        </h1>

        <p className="text-base text-white/70 leading-relaxed mb-6">
          {poi.shortDescription[language]}
        </p>

        {/* Info grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#16213e] rounded-xl border border-white/10 p-3 text-center">
            <p className="text-xs text-white/40 mb-1">
              {language === 'es' ? 'Visita' : language === 'pt' ? 'Visita' : 'Visit'}
            </p>
            <p className="text-lg font-bold text-[#c4956a]">{poi.estimatedVisitMinutes}</p>
            <p className="text-xs text-white/40">min</p>
          </div>
          <div className="bg-[#16213e] rounded-xl border border-white/10 p-3 text-center">
            <p className="text-xs text-white/40 mb-1">Audio</p>
            <p className="text-lg font-bold text-[#c4956a]">
              {Math.ceil(poi.audioDurationSeconds / 60)}
            </p>
            <p className="text-xs text-white/40">min</p>
          </div>
          {poi.elevation != null && (
            <div className="bg-[#16213e] rounded-xl border border-white/10 p-3 text-center">
              <p className="text-xs text-white/40 mb-1">
                {language === 'es' ? 'Elevacion' : language === 'pt' ? 'Elevacao' : 'Elevation'}
              </p>
              <p className="text-lg font-bold text-[#c4956a]">{poi.elevation}</p>
              <p className="text-xs text-white/40">m</p>
            </div>
          )}
        </div>

        {/* Accessibility notes */}
        {poi.accessibilityNotes && poi.accessibilityNotes[language] && (
          <div className="bg-[#16213e] rounded-xl border border-white/10 p-4 mb-6">
            <p className="text-xs text-white/40 mb-1 uppercase tracking-wider font-semibold">
              {language === 'es'
                ? 'Accesibilidad'
                : language === 'pt'
                  ? 'Acessibilidade'
                  : 'Accessibility'}
            </p>
            <p className="text-sm text-white/70">{poi.accessibilityNotes[language]}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setAudioUrl(`/audio/${language}/${poi.audioFile}`);
            }}
            className="flex-1 h-12 rounded-xl bg-[#c4956a] text-white text-base font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            {language === 'es'
              ? 'Escuchar Audio'
              : language === 'pt'
                ? 'Ouvir Audio'
                : 'Listen to Audio'}
          </button>
          <button
            onClick={() => {
              startNavigation();
              router.push('/map');
            }}
            className="h-12 px-5 rounded-xl bg-white/10 text-white text-base font-medium flex items-center justify-center gap-2 border border-white/10 transition-colors hover:bg-white/15"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
            {t('navigate')}
          </button>
        </div>
      </div>

      {/* Audio player */}
      <AudioPlayer audioUrl={audioUrl} title={poi.name[language]} />
    </div>
  );
}
