'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Route, RouteDuration } from '@/types';
import routesData from '../../public/data/routes.json';

interface NavigationContextValue {
  /** All available routes keyed by duration. */
  routes: Record<string, Route>;
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
  /** Begin a navigation session for the active route, optionally starting at a specific stop. */
  startNavigation: (startIndex?: number) => void;
  /** End the current navigation session. */
  stopNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [routes] = useState<Record<string, Route>>(() => {
    const record: Record<string, Route> = {};
    for (const route of routesData as Route[]) {
      record[route.duration] = route;
    }
    return record;
  });
  const [activeDuration, setActiveDuration] = useState<RouteDuration | null>(
    null,
  );
  const [activeRoute, setActiveRouteState] = useState<Route | null>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  // Sync activeRoute with duration selection (before navigation starts)
  const baseRoute = useMemo<Route | null>(() => {
    if (!routes || !activeDuration) return null;
    return routes[activeDuration] ?? null;
  }, [routes, activeDuration]);

  const setActiveRoute = useCallback((duration: RouteDuration | null) => {
    setActiveDuration(duration);
    setActiveRouteState(null);
    setCurrentStopIndex(0);
    setIsNavigating(false);
  }, []);

  // Use the reordered route if navigating, otherwise the base route
  const effectiveRoute = activeRoute ?? baseRoute;

  const advanceStop = useCallback(() => {
    if (!effectiveRoute) return;
    setCurrentStopIndex((prev) =>
      prev < effectiveRoute.stops.length - 1 ? prev + 1 : prev,
    );
  }, [effectiveRoute]);

  const goBack = useCallback(() => {
    setCurrentStopIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const startNavigation = useCallback((startIndex?: number) => {
    if (!baseRoute) return;
    const idx = startIndex ?? 0;
    if (idx === 0) {
      // No reordering needed
      setActiveRouteState(baseRoute);
    } else {
      // Reorder stops starting from the selected index
      const original = baseRoute.stops;
      const reordered = [
        ...original.slice(idx),
        ...original.slice(0, idx),
      ].map((stop, i) => ({ ...stop, order: i + 1 }));
      setActiveRouteState({
        ...baseRoute,
        stops: reordered,
      });
    }
    setCurrentStopIndex(0);
    setIsNavigating(true);
  }, [baseRoute]);

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setActiveRouteState(null);
    setCurrentStopIndex(0);
  }, []);

  const value = useMemo<NavigationContextValue>(
    () => ({
      routes,
      activeRoute: effectiveRoute,
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
      effectiveRoute,
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
