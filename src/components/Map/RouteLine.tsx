'use client';

import { Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { Coordinates } from '@/types';

interface RouteLineProps {
  stops: { coordinates: Coordinates }[];
}

function getArrowIcon(angle: number): L.DivIcon {
  return L.divIcon({
    html: `<div style="transform:rotate(${angle}deg);color:#c4956a;font-size:18px;font-weight:bold;text-shadow:0 1px 3px rgba(0,0,0,0.5);">&#9654;</div>`,
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function getMidpoint(
  a: [number, number],
  b: [number, number],
): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function getBearing(a: [number, number], b: [number, number]): number {
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360 - 90;
}

export default function RouteLine({ stops }: RouteLineProps) {
  if (stops.length < 2) return null;

  const positions: [number, number][] = stops.map((stop) => [
    stop.coordinates.lat,
    stop.coordinates.lng,
  ]);

  // Direction arrows at midpoints between stops
  const arrows = positions.slice(0, -1).map((pos, i) => {
    const next = positions[i + 1];
    const mid = getMidpoint(pos, next);
    const angle = getBearing(pos, next);
    return { position: mid, angle, key: i };
  });

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
      {/* Direction arrows */}
      {arrows.map(({ position, angle, key }) => (
        <Marker
          key={key}
          position={position}
          icon={getArrowIcon(angle)}
          interactive={false}
        />
      ))}
    </>
  );
}
