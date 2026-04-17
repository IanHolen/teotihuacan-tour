'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Coordinates, Parking, Route, RouteDuration } from '@/types';
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
  /** Selected parking lot, if any. */
  parking: Parking | null;
  /** Set the selected parking lot. */
  setParking: (parking: Parking | null) => void;
  /** Walking route from parking to first stop (OSRM GeoJSON coordinates). */
  parkingRoute: Coordinates[] | null;
  /** Distance in meters from parking to first stop. */
  parkingDistance: number | null;
  /** Walking time in minutes from parking to first stop. */
  parkingDuration: number | null;
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

  // Parking state
  const [parking, setParkingState] = useState<Parking | null>(null);
  const [parkingRoute, setParkingRoute] = useState<Coordinates[] | null>(null);
  const [parkingDistance, setParkingDistance] = useState<number | null>(null);
  const [parkingDuration, setParkingDuration] = useState<number | null>(null);

  const setParking = useCallback((p: Parking | null) => {
    setParkingState(p);
    setParkingRoute(null);
    setParkingDistance(null);
    setParkingDuration(null);
  }, []);

  // Fetch OSRM walking route when parking + route are both set
  useEffect(() => {
    if (!parking || !effectiveRoute || !isNavigating) {
      setParkingRoute(null);
      return;
    }
    const firstStop = effectiveRoute.stops[0];
    if (!firstStop) return;

    // Find the POI coordinates for the first stop
    // We import poisData here to resolve coordinates
    import('../../public/data/pois.json').then((mod) => {
      const pois = mod.default as Array<{ slug: string; coordinates: Coordinates }>;
      const poi = pois.find((p) => p.slug === firstStop.poiSlug);
      if (!poi) return;

      const url = `https://router.project-osrm.org/route/v1/foot/${parking.coordinates.lng},${parking.coordinates.lat};${poi.coordinates.lng},${poi.coordinates.lat}?overview=full&geometries=geojson`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 'Ok' && data.routes?.[0]) {
            const route = data.routes[0];
            const coords: Coordinates[] = route.geometry.coordinates.map(
              (c: [number, number]) => ({ lat: c[1], lng: c[0] }),
            );
            setParkingRoute(coords);
            setParkingDistance(Math.round(route.distance));
            setParkingDuration(Math.round(route.duration / 60));
          }
        })
        .catch(() => {});
    });
  }, [parking, effectiveRoute, isNavigating]);

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
      parking,
      setParking,
      parkingRoute,
      parkingDistance,
      parkingDuration,
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
      parking,
      setParking,
      parkingRoute,
      parkingDistance,
      parkingDuration,
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
