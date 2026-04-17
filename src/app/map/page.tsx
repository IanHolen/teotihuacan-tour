'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DynamicMap from '@/components/Map';
import AudioPlayer from '@/components/AudioPlayer/AudioPlayer';
import NavigationBar from '@/components/Navigation/NavigationBar';
import StopCard from '@/components/Navigation/StopCard';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigation } from '@/context/NavigationContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useProximity } from '@/hooks/useProximity';
import { useRoute } from '@/hooks/useRoute';
import type { PointOfInterest } from '@/types';
import poisData from '../../../public/data/pois.json';

export default function MapPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const navigation = useNavigation();
  const geolocation = useGeolocation();

  const pois = poisData as PointOfInterest[];
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState('');

  const routeInfo = useRoute(pois);
  const proximity = useProximity(
    geolocation.position ?? null,
    routeInfo.currentStopPoi?.coordinates ?? null
  );

  const arrivedRef = useRef(false);

  // Auto-play audio on arrival
  useEffect(() => {
    if (proximity.hasArrived && routeInfo.currentStopPoi && !arrivedRef.current) {
      arrivedRef.current = true;
      const poi = routeInfo.currentStopPoi;
      setAudioUrl(`/audio/${language}/${poi.audioFile}`);
      setAudioTitle(poi.name[language]);
    }
    if (!proximity.hasArrived) {
      arrivedRef.current = false;
    }
  }, [proximity.hasArrived, routeInfo.currentStopPoi, language]);

  const handlePoiClick = useCallback(
    (poi: PointOfInterest) => {
      setSelectedPoi(poi);
    },
    []
  );

  const handlePlayAudio = useCallback(
    (poi?: PointOfInterest | null) => {
      const target = poi ?? routeInfo.currentStopPoi;
      if (target) {
        setAudioUrl(`/audio/${language}/${target.audioFile}`);
        setAudioTitle(target.name[language]);
      }
    },
    [routeInfo.currentStopPoi, language]
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
        onClick={() => {
          navigation.stopNavigation();
          router.push('/');
        }}
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
      <div className="flex-1">
        <DynamicMap pois={pois} onPoiClick={handlePoiClick} />
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

      {/* Navigation bar */}
      {navigation.isNavigating && (
        <NavigationBar
          currentPoi={routeInfo.currentStopPoi}
          nextPoi={routeInfo.nextStopPoi}
          distance={proximity.distance}
          totalStops={routeInfo.totalStops}
          currentIndex={routeInfo.currentIndex}
          onSkip={navigation.advanceStop}
          onBack={navigation.goBack}
          onPlayAudio={() => handlePlayAudio()}
        />
      )}

      {/* Audio player */}
      <AudioPlayer audioUrl={audioUrl} title={audioTitle} />
    </div>
  );
}
