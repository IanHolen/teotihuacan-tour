'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer as LeafletMapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useMemo, useRef } from 'react';
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

/* ---------- Invalidate map size after mount (fixes flex container sizing) ---------- */
function MapReady() {
  const map = useMap();
  useEffect(() => {
    // Give the container a frame to settle, then tell Leaflet to recalculate
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

/* ---------- Fly to current stop when it changes ---------- */
function FlyToStop({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const isFirstRef = useRef(true);
  useEffect(() => {
    if (isFirstRef.current) {
      // On first mount, use setView (no animation) after a short delay
      isFirstRef.current = false;
      const timer = setTimeout(() => {
        map.setView([lat, lng], DEFAULT_ZOOM);
      }, 200);
      return () => clearTimeout(timer);
    }
    map.flyTo([lat, lng], DEFAULT_ZOOM, { duration: 0.8 });
  }, [map, lat, lng]);
  return null;
}

/* ---------- Props ---------- */
interface MapContainerProps {
  pois: PointOfInterest[];
  onPoiClick: (poi: PointOfInterest) => void;
}

export default function MapContainer({ pois, onPoiClick }: MapContainerProps) {
  const { position, accuracy } = useGeolocation();
  const { activeRoute, currentStopIndex, isNavigating, parking, parkingRoute } = useNavigation();

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

  /* Current stop POI for map centering */
  const currentStopPoi = useMemo(() => {
    if (!activeRoute || !isNavigating) return null;
    const stop = activeRoute.stops[currentStopIndex];
    if (!stop) return null;
    return pois.find((p) => p.slug === stop.poiSlug) ?? null;
  }, [activeRoute, currentStopIndex, isNavigating, pois]);

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

      {/* POI markers — only show route POIs when navigating */}
      {pois
        .filter((poi) => !isNavigating || activeSlugSet.has(poi.slug))
        .map((poi) => {
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

      {/* Center map on current stop */}
      {currentStopPoi && (
        <FlyToStop lat={currentStopPoi.coordinates.lat} lng={currentStopPoi.coordinates.lng} />
      )}

      {/* Parking route (walking directions from parking to first stop) */}
      {isNavigating && parkingRoute && parkingRoute.length >= 2 && (
        <Polyline
          positions={parkingRoute.map((c) => [c.lat, c.lng] as [number, number])}
          pathOptions={{
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8,
            dashArray: '8, 12',
          }}
        />
      )}

      {/* Parking marker */}
      {isNavigating && parking && (
        <Marker
          position={[parking.coordinates.lat, parking.coordinates.lng]}
          icon={L.divIcon({
            html: '<div style="width:32px;height:32px;border-radius:50%;background:#3b82f6;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.35);">P</div>',
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })}
        />
      )}

      {/* User GPS position */}
      {position && <UserMarker position={position} accuracy={accuracy} />}
    </LeafletMapContainer>
  );
}
