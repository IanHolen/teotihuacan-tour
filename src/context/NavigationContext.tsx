'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Route, RouteDuration } from '@/types';

interface NavigationContextValue {
  /** All available routes keyed by duration. */
  routes: Record<string, Route> | null;
  /** The currently selected route, or null if none. */
  activeRoute: Route | null;
  /** Select a route by its duration key. Pass null to deselect. */
  setActiveRoute: (duration: RouteDuration | null) => void;
  /** Zero-based index of the current stop within the active route. */
  currentStopIndex: number;
  /** Move to the next stop. No-op if already at the last stop. */
  advanceStop: () => void;
  /** Move to the previous stop. No-op if already at the first stop. */
  goBack: () => void;
  /** Whether a navigation session is in progress. */
  isNavigating: boolean;
  /** Begin a navigation session for the active route. */
  startNavigation: () => void;
  /** End the current navigation session. */
  stopNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [routes, setRoutes] = useState<Record<string, Route> | null>(null);
  const [activeDuration, setActiveDuration] = useState<RouteDuration | null>(
    null,
  );
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Load route data once on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/data/routes.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Record<string, Route> = await res.json();
        if (!cancelled) setRoutes(data);
      } catch {
        if (!cancelled) setRoutes(null);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeRoute = useMemo<Route | null>(() => {
    if (!routes || !activeDuration) return null;
    return routes[activeDuration] ?? null;
  }, [routes, activeDuration]);

  const setActiveRoute = useCallback((duration: RouteDuration | null) => {
    setActiveDuration(duration);
    setCurrentStopIndex(0);
    setIsNavigating(false);
  }, []);

  const advanceStop = useCallback(() => {
    if (!activeRoute) return;
    setCurrentStopIndex((prev) =>
      prev < activeRoute.stops.length - 1 ? prev + 1 : prev,
    );
  }, [activeRoute]);

  const goBack = useCallback(() => {
    setCurrentStopIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const startNavigation = useCallback(() => {
    if (activeRoute) {
      setCurrentStopIndex(0);
      setIsNavigating(true);
    }
  }, [activeRoute]);

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setCurrentStopIndex(0);
  }, []);

  const value = useMemo<NavigationContextValue>(
    () => ({
      routes,
      activeRoute,
      setActiveRoute,
      currentStopIndex,
      advanceStop,
      goBack,
      isNavigating,
      startNavigation,
      stopNavigation,
    }),
    [
      routes,
      activeRoute,
      setActiveRoute,
      currentStopIndex,
      advanceStop,
      goBack,
      isNavigating,
      startNavigation,
      stopNavigation,
    ],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return ctx;
}
