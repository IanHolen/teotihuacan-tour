'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import { useMemo } from 'react';
import {
  TEOTIHUACAN_CENTER,
  TEOTIHUACAN_BOUNDS,
  DEFAULT_ZOOM,
  MAP_MIN_ZOOM,
  MAP_MAX_ZOOM,
} from '@/lib/constants';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNavigation } from '@/context/NavigationContext';
import type { PointOfInterest } from '@/types';
import UserMarker from './UserMarker';
import POIMarker from './POIMarker';
import RouteLine from './RouteLine';

/* ---------- Fix Leaflet default icon paths for webpack/Next.js ---------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ---------- Props ---------- */
interface MapContainerProps {
  pois: PointOfInterest[];
  onPoiClick: (poi: PointOfInterest) => void;
}

export default function MapContainer({ pois, onPoiClick }: MapContainerProps) {
  const { position, accuracy } = useGeolocation();
  const { activeRoute, currentStopIndex, isNavigating } = useNavigation();

  /* Build a set of active-route slugs and a slug->order map for numbering */
  const { activeSlugSet, slugToOrder } = useMemo(() => {
    const set = new Set<string>();
    const orderMap = new Map<string, number>();
    if (activeRoute) {
      for (const stop of activeRoute.stops) {
        set.add(stop.poiSlug);
        orderMap.set(stop.poiSlug, stop.order);
      }
    }
    return { activeSlugSet: set, slugToOrder: orderMap };
  }, [activeRoute]);

  /* Build the ordered coordinates list for the route polyline */
  const routeStopCoords = useMemo(() => {
    if (!activeRoute) return [];
    const poiMap = new Map(pois.map((p) => [p.slug, p]));
    return activeRoute.stops
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((stop) => {
        const poi = poiMap.get(stop.poiSlug);
        return poi ? { coordinates: poi.coordinates } : null;
      })
      .filter(Boolean) as { coordinates: { lat: number; lng: number } }[];
  }, [activeRoute, pois]);

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
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* POI markers */}
      {pois.map((poi) => {
        const order = slugToOrder.get(poi.slug);
        const isOnRoute = activeSlugSet.has(poi.slug);
        const isActive = isNavigating && isOnRoute && order === currentStopIndex + 1;
        const isVisited = isNavigating && isOnRoute && order != null && order < currentStopIndex + 1;

        return (
          <POIMarker
            key={poi.slug}
            poi={poi}
            isActive={isActive}
            isVisited={isVisited}
            stopNumber={isOnRoute ? order : undefined}
            onClick={() => onPoiClick(poi)}
          />
        );
      })}

      {/* Route polyline */}
      {isNavigating && routeStopCoords.length >= 2 && (
        <RouteLine stops={routeStopCoords} />
      )}

      {/* User GPS position */}
      {position && <UserMarker position={position} accuracy={accuracy} />}
    </LeafletMapContainer>
  );
}
