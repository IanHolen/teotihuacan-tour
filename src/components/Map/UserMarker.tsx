'use client';

import { CircleMarker, Circle } from 'react-leaflet';
import type { Coordinates } from '@/types';

interface UserMarkerProps {
  position: Coordinates;
  accuracy: number | null;
}

export default function UserMarker({ position, accuracy }: UserMarkerProps) {
  return (
    <>
      {/* Accuracy radius circle */}
      {accuracy != null && accuracy > 0 && (
        <Circle
          center={[position.lat, position.lng]}
          radius={accuracy}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.08,
            weight: 1,
          }}
        />
      )}

      {/* Pulsing blue dot */}
      <CircleMarker
        center={[position.lat, position.lng]}
        radius={8}
        pathOptions={{
          color: '#ffffff',
          fillColor: '#3b82f6',
          fillOpacity: 1,
          weight: 3,
        }}
        className="user-marker-pulse"
      />
    </>
  );
}
