'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import {
  TEOTIHUACAN_CENTER,
  TEOTIHUACAN_BOUNDS,
  DEFAULT_ZOOM,
  MAP_MIN_ZOOM,
  MAP_MAX_ZOOM,
} from '@/lib/constants';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { PointOfInterest } from '@/types';
import UserMarker from './UserMarker';
import POIMarker from './POIMarker';

/* ---------- Fix Leaflet default icon paths for webpack/Next.js ---------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ---------- Invalidate map size after mount (fixes flex container sizing) ---------- */
function MapReady() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

/* ---------- Props ---------- */
interface MapContainerProps {
  pois: PointOfInterest[];
  onPoiClick: (poi: PointOfInterest) => void;
}

export default function MapContainer({ pois, onPoiClick }: MapContainerProps) {
  const { position, accuracy } = useGeolocation();

  const bounds = L.latLngBounds(
    TEOTIHUACAN_BOUNDS[0] as [number, number],
    TEOTIHUACAN_BOUNDS[1] as [number, number],
  );

  return (
    <LeafletMapContainer
      center={[TEOTIHUACAN_CENTER.lat, TEOTIHUACAN_CENTER.lng]}
      zoom={DEFAULT_ZOOM}
      minZoom={MAP_MIN_ZOOM}
      maxZoom={MAP_MAX_ZOOM}
      maxBounds={bounds}
      maxBoundsViscosity={1.0}
      scrollWheelZoom
      className="h-full w-full z-0"
      style={{ height: '100%', width: '100%' }}
    >
      <MapReady />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* All POI markers */}
      {pois.map((poi) => (
        <POIMarker
          key={poi.slug}
          poi={poi}
          isActive={false}
          isVisited={false}
          onClick={() => onPoiClick(poi)}
        />
      ))}

      {/* User GPS position */}
      {position && <UserMarker position={position} accuracy={accuracy} />}
    </LeafletMapContainer>
  );
}
