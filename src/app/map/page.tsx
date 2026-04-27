'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DynamicMap from '@/components/Map';
import AudioPlayer from '@/components/AudioPlayer/AudioPlayer';
import StopCard from '@/components/Navigation/StopCard';
import { useLanguage } from '@/context/LanguageContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { PointOfInterest } from '@/types';
import poisData from '../../../public/data/pois.json';

export default function MapPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const geolocation = useGeolocation();

  const pois = poisData as PointOfInterest[];
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState('');

  const handlePoiClick = useCallback(
    (poi: PointOfInterest) => {
      setSelectedPoi(poi);
    },
    []
  );

  const handlePlayAudio = useCallback(
    (poi: PointOfInterest) => {
      setAudioUrl(`/audio/${language}/${poi.audioFile}`);
      setAudioTitle(poi.name[language]);
    },
    [language]
  );

  const handleNavigateToPoi = useCallback(
    (poi: PointOfInterest) => {
      setSelectedPoi(null);
      router.push(`/poi/${poi.slug}`);
    },
    [router]
  );

  return (
    <div className="relative flex flex-col flex-1 h-screen bg-[#1a1a2e]">
      {/* Floating back button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-[#16213e]/90 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-colors hover:bg-[#1a2745]"
        aria-label="Back to home"
      >
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Simulated location indicator */}
      {geolocation.isSimulated && (
        <div className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm">
          <span className="text-xs font-medium text-amber-400">DEV: GPS simulado</span>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          <DynamicMap pois={pois} onPoiClick={handlePoiClick} />
        </div>
      </div>

      {/* Selected POI overlay */}
      {selectedPoi && (
        <div className="absolute bottom-28 left-4 right-4 z-30">
          <div className="relative">
            <button
              onClick={() => setSelectedPoi(null)}
              className="absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full bg-[#16213e] border border-white/20 flex items-center justify-center"
              aria-label="Close"
            >
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <StopCard
              poi={selectedPoi}
              isActive
              stopNumber={
                pois.findIndex((p) => p.slug === selectedPoi.slug) + 1
              }
              onNavigate={() => handleNavigateToPoi(selectedPoi)}
              onPlayAudio={() => handlePlayAudio(selectedPoi)}
            />
          </div>
        </div>
      )}

      {/* Audio player */}
      <AudioPlayer audioUrl={audioUrl} title={audioTitle} />
    </div>
  );
}
