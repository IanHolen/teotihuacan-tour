import type { Language, Coordinates } from '@/types';

export const TEOTIHUACAN_CENTER: Coordinates = {
  lat: 19.6925,
  lng: -98.844,
};

export const TEOTIHUACAN_BOUNDS: [[number, number], [number, number]] = [
  [19.684, -98.855],
  [19.7, -98.83],
];

/** Distance in meters at which the user is considered to have arrived. */
export const ARRIVED_THRESHOLD = 30;

/** Distance in meters at which the user is approaching a POI. */
export const APPROACHING_THRESHOLD = 100;

export const DEFAULT_LANGUAGE: Language = 'es';

export const DEFAULT_ZOOM = 16;
export const MAP_MIN_ZOOM = 14;
export const MAP_MAX_ZOOM = 18;
