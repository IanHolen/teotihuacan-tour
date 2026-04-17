import type { Coordinates } from '@/types';

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate the great-circle distance between two coordinates using the
 * Haversine formula.
 * @returns Distance in meters.
 */
export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);

  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLng = Math.sin(dLng / 2);

  const h =
    sinHalfLat * sinHalfLat +
    Math.cos(toRadians(a.lat)) *
      Math.cos(toRadians(b.lat)) *
      sinHalfLng *
      sinHalfLng;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

/**
 * Calculate the initial bearing from point `a` to point `b`.
 * @returns Bearing in degrees (0-360, where 0 = north, 90 = east).
 */
export function bearingBetween(a: Coordinates, b: Coordinates): number {
  const aLatRad = toRadians(a.lat);
  const bLatRad = toRadians(b.lat);
  const dLngRad = toRadians(b.lng - a.lng);

  const y = Math.sin(dLngRad) * Math.cos(bLatRad);
  const x =
    Math.cos(aLatRad) * Math.sin(bLatRad) -
    Math.sin(aLatRad) * Math.cos(bLatRad) * Math.cos(dLngRad);

  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/**
 * Format a distance in meters to a human-readable string.
 * Distances under 1 000 m are shown in meters; otherwise in kilometres.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
