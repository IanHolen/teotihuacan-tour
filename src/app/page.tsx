'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigation } from '@/context/NavigationContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RouteSelector from '@/components/Navigation/RouteSelector';
import StartPointSelector from '@/components/Navigation/StartPointSelector';
import type { RouteDuration } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { routes, setActiveRoute, startNavigation } = useNavigation();
  const [selectedRoute, setSelectedRoute] = useState<RouteDuration | null>(null);
  const [startIndex, setStartIndex] = useState(0);

  function handleRouteSelect(duration: RouteDuration) {
    setSelectedRoute(duration);
    setStartIndex(0);
  }

  function handleStartTour() {
    if (!selectedRoute) return;
    setActiveRoute(selectedRoute);
    startNavigation(startIndex);
    router.push('/map');
  }

  return (
    <div className="flex flex-col flex-1 items-center px-5 py-8 bg-gradient-to-b from-[#1a1a2e] to-[#232342]">
      {/* Header */}
      <div className="w-full max-w-md flex justify-end mb-6">
        <LanguageSwitcher />
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-10 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-[#c4956a]/20 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-[#c4956a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 19h20L12 2z" />
            <path d="M12 2v17" />
            <path d="M7 12h10" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          Guia Teotihuacan
        </h1>
        <p className="text-base text-white/60 leading-relaxed">
          {language === 'es'
            ? 'Explora la ciudad de los dioses con audio guia, mapa interactivo y rutas personalizadas.'
            : language === 'pt'
              ? 'Explore a cidade dos deuses com audioguia, mapa interativo e rotas personalizadas.'
              : 'Explore the city of the gods with audio guide, interactive map and personalized routes.'}
        </p>
      </div>

      {/* Route selection */}
      <div className="w-full max-w-md mb-8">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
          {language === 'es'
            ? 'Elige tu ruta'
            : language === 'pt'
              ? 'Escolha sua rota'
              : 'Choose your route'}
        </h2>
        <RouteSelector onSelect={handleRouteSelect} />
      </div>

      {/* Start point selection */}
      {selectedRoute && routes[selectedRoute] && (
        <div className="w-full max-w-md mb-6">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
            {language === 'es'
              ? '¿Desde dónde empiezas?'
              : language === 'pt'
                ? 'De onde você começa?'
                : 'Where do you start?'}
          </h2>
          <StartPointSelector
            route={routes[selectedRoute]}
            selectedIndex={startIndex}
            onSelect={setStartIndex}
          />
        </div>
      )}

      {/* Start button */}
      <div className="w-full max-w-md mt-auto">
        <button
          onClick={handleStartTour}
          disabled={!selectedRoute}
          className="w-full h-14 rounded-xl bg-[#c4956a] text-white text-lg font-semibold transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {language === 'es'
            ? 'Iniciar Recorrido'
            : language === 'pt'
              ? 'Iniciar Tour'
              : 'Start Tour'}
        </button>
      </div>
    </div>
  );
}
