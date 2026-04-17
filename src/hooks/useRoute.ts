'use client';

import { useMemo } from 'react';
import type { PointOfInterest } from '@/types';
import { useNavigation } from '@/context/NavigationContext';

interface RouteInfo {
  /** The resolved POI for the current stop, or null. */
  currentStopPoi: PointOfInterest | null;
  /** The resolved POI for the next stop, or null if at end. */
  nextStopPoi: PointOfInterest | null;
  /** Total number of stops in the active route. */
  totalStops: number;
  /** Zero-based index of the current stop. */
  currentIndex: number;
  /** Progress as a fraction between 0 and 1. */
  progress: number;
  /** Whether the user is on the last stop. */
  isLastStop: boolean;
}

/**
 * Route management hook that resolves POI data for the current navigation state.
 *
 * @param pois - Array of all available points of interest.
 */
export function useRoute(pois: PointOfInterest[]): RouteInfo {
  const { activeRoute, currentStopIndex } = useNavigation();

  const poiMap = useMemo(() => {
    const map = new Map<string, PointOfInterest>();
    for (const poi of pois) {
      map.set(poi.slug, poi);
    }
    return map;
  }, [pois]);

  return useMemo<RouteInfo>(() => {
    if (!activeRoute || activeRoute.stops.length === 0) {
      return {
        currentStopPoi: null,
        nextStopPoi: null,
        totalStops: 0,
        currentIndex: 0,
        progress: 0,
        isLastStop: true,
      };
    }

    const { stops } = activeRoute;
    const totalStops = stops.length;
    const currentStop = stops[currentStopIndex];
    const nextStop =
      currentStopIndex < totalStops - 1
        ? stops[currentStopIndex + 1]
        : undefined;

    return {
      currentStopPoi: currentStop
        ? poiMap.get(currentStop.poiSlug) ?? null
        : null,
      nextStopPoi: nextStop ? poiMap.get(nextStop.poiSlug) ?? null : null,
      totalStops,
      currentIndex: currentStopIndex,
      progress: totalStops > 1 ? currentStopIndex / (totalStops - 1) : 1,
      isLastStop: currentStopIndex >= totalStops - 1,
    };
  }, [activeRoute, currentStopIndex, poiMap]);
}
