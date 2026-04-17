'use client';

import { useMemo } from 'react';
import type { Coordinates } from '@/types';
import { haversineDistance } from '@/lib/geo';
import { APPROACHING_THRESHOLD, ARRIVED_THRESHOLD } from '@/lib/constants';

interface ProximityState {
  /** Distance in meters, or null if the user position is unknown. */
  distance: number | null;
  /** Whether the user is within the approaching threshold. */
  isApproaching: boolean;
  /** Whether the user is within the arrived threshold. */
  hasArrived: boolean;
}

/**
 * Calculates proximity between the user and a target coordinate.
 *
 * @param userPosition - Current user GPS coordinates, or null if unavailable.
 * @param targetPosition - The target POI coordinates.
 */
export function useProximity(
  userPosition: Coordinates | null,
  targetPosition: Coordinates | null,
): ProximityState {
  return useMemo<ProximityState>(() => {
    if (!userPosition || !targetPosition) {
      return { distance: null, isApproaching: false, hasArrived: false };
    }

    const distance = haversineDistance(userPosition, targetPosition);

    return {
      distance,
      isApproaching: distance <= APPROACHING_THRESHOLD,
      hasArrived: distance <= ARRIVED_THRESHOLD,
    };
  }, [userPosition, targetPosition]);
}
