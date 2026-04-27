'use client';

import { useMemo } from 'react';
import type { Coordinates } from '@/types';
import { haversineDistance } from '@/lib/geo';
import { DEFAULT_PROXIMITY_RADIUS } from '@/lib/constants';

interface ProximityState {
  /** Distance in meters, or null if the user position is unknown. */
  distance: number | null;
  /** Whether the user is within the proximity radius. */
  isNearby: boolean;
}

/**
 * Calculates proximity between the user and a target coordinate.
 *
 * @param userPosition - Current user GPS coordinates, or null if unavailable.
 * @param targetPosition - The target POI coordinates.
 * @param radius - Custom proximity radius in meters. Defaults to DEFAULT_PROXIMITY_RADIUS.
 */
export function useProximity(
  userPosition: Coordinates | null,
  targetPosition: Coordinates | null,
  radius: number = DEFAULT_PROXIMITY_RADIUS,
): ProximityState {
  return useMemo<ProximityState>(() => {
    if (!userPosition || !targetPosition) {
      return { distance: null, isNearby: false };
    }

    const distance = haversineDistance(userPosition, targetPosition);

    return {
      distance,
      isNearby: distance <= radius,
    };
  }, [userPosition, targetPosition, radius]);
}
