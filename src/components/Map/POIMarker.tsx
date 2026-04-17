'use client';

import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '@/context/LanguageContext';
import type { PointOfInterest } from '@/types';

const CATEGORY_COLORS: Record<PointOfInterest['category'], string> = {
  pyramid: '#e94560',
  temple: '#c4956a',
  palace: '#8b5cf6',
  museum: '#3b82f6',
  plaza: '#4ade80',
  mural: '#f59e0b',
  gate: '#6b7280',
};

interface POIMarkerProps {
  poi: PointOfInterest;
  isActive: boolean;
  isVisited: boolean;
  stopNumber?: number;
  onClick: () => void;
}

function createPOIIcon(
  category: PointOfInterest['category'],
  isActive: boolean,
  isVisited: boolean,
  stopNumber?: number,
): L.DivIcon {
  const color = CATEGORY_COLORS[category];
  const size = isActive ? 36 : 28;
  const opacity = isVisited ? 0.6 : 1;
  const label = stopNumber != null ? String(stopNumber) : '';
  const fontSize = isActive ? 14 : 12;
  const borderWidth = isActive ? 3 : 2;

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background-color: ${color};
      border: ${borderWidth}px solid #ffffff;
      opacity: ${opacity};
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: ${fontSize}px;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      transition: transform 0.2s ease;
      ${isActive ? 'transform: scale(1.15);' : ''}
    ">${label}</div>
  `;

  return L.divIcon({
    html,
    className: 'poi-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function POIMarker({
  poi,
  isActive,
  isVisited,
  stopNumber,
  onClick,
}: POIMarkerProps) {
  const { language } = useLanguage();
  const icon = createPOIIcon(poi.category, isActive, isVisited, stopNumber);

  return (
    <Marker
      position={[poi.coordinates.lat, poi.coordinates.lng]}
      icon={icon}
      eventHandlers={{ click: onClick }}
    >
      <Tooltip direction="top" offset={[0, -16]} opacity={0.95}>
        <span className="font-semibold text-sm">{poi.name[language]}</span>
      </Tooltip>
    </Marker>
  );
}
