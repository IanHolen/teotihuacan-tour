export type Language = 'es' | 'pt' | 'en';
export type RouteDuration = '1h' | '2h' | '3h' | 'full';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PointOfInterest {
  slug: string;
  coordinates: Coordinates;
  category: 'pyramid' | 'temple' | 'palace' | 'museum' | 'plaza' | 'mural' | 'gate';
  name: Record<Language, string>;
  shortDescription: Record<Language, string>;
  audioFile: string;
  audioDurationSeconds: number;
  estimatedVisitMinutes: number;
  image: string;
  elevation?: number;
  accessibilityNotes?: Record<Language, string>;
}

export interface RouteStop {
  poiSlug: string;
  order: number;
  walkingMinutesFromPrevious: number;
}

export interface Route {
  duration: RouteDuration;
  label: Record<Language, string>;
  description: Record<Language, string>;
  totalWalkingMinutes: number;
  totalStops: number;
  stops: RouteStop[];
}

export interface Parking {
  id: string;
  coordinates: Coordinates;
  name: Record<Language, string>;
}
