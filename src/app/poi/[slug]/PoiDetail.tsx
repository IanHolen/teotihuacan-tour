'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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

interface GalleryImage {
  src: string;
  alt: string;
  author: string;
  license: string;
}

interface PoiWithExtras extends PointOfInterest {
  audioScript?: Record<string, string>;
  gallery?: GalleryImage[];
}

export default function PoiDetail() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();

  const fromDestination = searchParams.get('from');

  const poi = useMemo<PoiWithExtras | null>(
    () => (poisData as PoiWithExtras[]).find((p) => p.slug === params.slug) ?? null,
    [params.slug],
  );

  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const backPath = fromDestination ? `/destination/${fromDestination}` : '/';

  if (!poi) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-[#1a1a2e] px-5 gap-4">
        <p className="text-white/60 text-lg">
          {language === 'es'
            ? 'Punto no encontrado'
            : language === 'pt'
              ? 'Ponto não encontrado'
              : 'Point not found'}
        </p>
        <button
          onClick={() => router.push(backPath)}
          className="px-6 py-2 rounded-lg bg-[#c4956a] text-white text-sm font-medium"
        >
          {language === 'es' ? 'Volver' : language === 'pt' ? 'Voltar' : 'Back'}
        </button>
      </div>
    );
  }

  const categoryStyle = CATEGORY_COLORS[poi.category] ?? 'bg-white/10 text-white/60';
  const transcript = poi.audioScript?.[language] ?? '';
  const paragraphs = transcript.split('\n\n').filter((p) => p.trim());
  const gallery = poi.gallery ?? [];

  // Calculate where to insert gallery images (after every 2-3 paragraphs)
  const imageAfter: Map<number, GalleryImage> = new Map();
  if (gallery.length > 0 && paragraphs.length > 1) {
    const interval = Math.max(2, Math.floor(paragraphs.length / (gallery.length + 1)));
    gallery.forEach((img, i) => {
      const pos = Math.min((i + 1) * interval - 1, paragraphs.length - 1);
      imageAfter.set(pos, img);
    });
  }

  return (
    <div className="flex flex-col flex-1 bg-[#1a1a2e] pb-24">
      {/* Hero image */}
      <div className="relative w-full h-48 bg-[#16213e] overflow-hidden">
        <img
          src={poi.image}
          alt={poi.name[language]}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/40 to-transparent" />

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => router.push(backPath)}
            className="w-10 h-10 rounded-full bg-[#16213e]/80 backdrop-blur-sm border border-white/10 flex items-center justify-center"
            aria-label="Back"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 -mt-6 relative z-10 max-w-prose mx-auto w-full">
        {/* Title + category */}
        <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium mb-2 ${categoryStyle}`}>
          {poi.category}
        </span>
        <h1 className="text-2xl font-bold text-white mb-1">
          {poi.name[language]}
        </h1>
        <p className="text-sm text-white/50 mb-4">
          {poi.shortDescription[language]}
        </p>

        {/* Audio player - prominent */}
        <div className="bg-[#16213e] rounded-xl border border-white/10 p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {Math.ceil(poi.audioDurationSeconds / 60)} min
            </div>
            {poi.elevation != null && (
              <div className="flex items-center gap-1 text-xs text-white/40">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 19h20L12 2z" />
                </svg>
                {poi.elevation}m
              </div>
            )}
          </div>
          <button
            onClick={() => setAudioUrl(`/audio/${language}/${poi.audioFile}`)}
            className="w-full h-14 rounded-xl bg-[#c4956a] text-white text-lg font-semibold flex items-center justify-center gap-3 transition-opacity hover:opacity-90"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            {language === 'es'
              ? 'Escuchar Audio Guía'
              : language === 'pt'
                ? 'Ouvir Áudio Guia'
                : 'Listen to Audio Guide'}
          </button>
        </div>

        {/* Transcript article with gallery images as block elements */}
        {paragraphs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
              {language === 'es'
                ? 'Transcripción'
                : language === 'pt'
                  ? 'Transcrição'
                  : 'Transcript'}
            </h2>

            <article>
              {paragraphs.map((paragraph, i) => {
                const galleryImg = imageAfter.get(i);

                return (
                  <div key={i}>
                    <p className={`text-base text-white/80 leading-7 mb-5${i === 0 ? ' first-letter:text-3xl first-letter:font-bold first-letter:text-[#c4956a] first-letter:float-left first-letter:mr-1 first-letter:leading-none' : ''}`}>
                      {paragraph}
                    </p>

                    {/* Gallery image as block between paragraph groups */}
                    {galleryImg && (
                      <figure className="my-8 rounded-lg overflow-hidden border border-white/10 bg-[#1a2744] max-w-[680px] mx-auto">
                        <img
                          src={galleryImg.src}
                          alt={galleryImg.alt}
                          className="w-full h-auto max-h-[400px] object-cover"
                        />
                        <figcaption className="px-4 py-3">
                          <p className="text-sm text-white/60 leading-relaxed">{galleryImg.alt}</p>
                          <p className="text-xs text-white/30 mt-1">
                            {galleryImg.author} &middot; {galleryImg.license}
                          </p>
                        </figcaption>
                      </figure>
                    )}
                  </div>
                );
              })}
            </article>
          </div>
        )}

        {/* Accessibility notes */}
        {poi.accessibilityNotes && poi.accessibilityNotes[language] && (
          <div className="bg-amber-900/20 rounded-xl border border-amber-600/20 p-4 mb-6">
            <p className="text-xs text-amber-400 mb-1 uppercase tracking-wider font-semibold">
              {language === 'es'
                ? 'Accesibilidad'
                : language === 'pt'
                  ? 'Acessibilidade'
                  : 'Accessibility'}
            </p>
            <p className="text-sm text-white/70">{poi.accessibilityNotes[language]}</p>
          </div>
        )}

        {/* Back to destination */}
        <button
          onClick={() => router.push(backPath)}
          className="w-full h-12 rounded-xl bg-white/5 text-white/60 text-sm font-medium flex items-center justify-center gap-2 border border-white/10 transition-colors hover:bg-white/10"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {language === 'es'
            ? 'Volver a puntos de interés'
            : language === 'pt'
              ? 'Voltar aos pontos de interesse'
              : 'Back to points of interest'}
        </button>
      </div>

      {/* Audio player (fixed bottom bar) */}
      <AudioPlayer audioUrl={audioUrl} title={poi.name[language]} />
    </div>
  );
}
