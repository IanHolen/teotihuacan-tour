import type { Language, Coordinates } from '@/types';

export const TEOTIHUACAN_CENTER: Coordinates = {
  lat: 19.6905,
  lng: -98.8441,
};

export const TEOTIHUACAN_BOUNDS: [[number, number], [number, number]] = [
  [19.680, -98.855],
  [19.702, -98.830],
];

/** Default proximity radius in meters when a POI doesn't specify one. */
export const DEFAULT_PROXIMITY_RADIUS = 40;

export const DEFAULT_LANGUAGE: Language = 'es';

export const DEFAULT_ZOOM = 16;
export const MAP_MIN_ZOOM = 14;
export const MAP_MAX_ZOOM = 18;
