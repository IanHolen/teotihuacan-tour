export type Language = 'es' | 'pt' | 'en';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GalleryImage {
  src: string;
  alt: string;
  author: string;
  license: string;
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
  gallery?: GalleryImage[];
  proximityRadius?: number;
}

export interface Destination {
  slug: string;
  name: Record<Language, string>;
  image: string;
  description: Record<Language, string>;
  poiSlugs: string[];
}
