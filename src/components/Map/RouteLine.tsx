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
    <>
      {/* Shadow line for contrast */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#000000',
          weight: 6,
          opacity: 0.3,
        }}
      />
      {/* Main route line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#c4956a',
          weight: 4,
          opacity: 0.9,
          dashArray: '12, 8',
        }}
      />
    </>
  );
}
