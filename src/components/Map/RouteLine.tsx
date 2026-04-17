'use client';

import { Polyline } from 'react-leaflet';
import type { Coordinates } from '@/types';

interface RouteLineProps {
  stops: { coordinates: Coordinates }[];
}

export default function RouteLine({ stops }: RouteLineProps) {
  if (stops.length < 2) return null;

  const positions: [number, number][] = stops.map((stop) => [
    stop.coordinates.lat,
    stop.coordinates.lng,
  ]);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: '#c4956a',
        weight: 3,
        dashArray: '10, 10',
        opacity: 0.85,
      }}
    />
  );
}
