import { describe, it, expect } from 'vitest';
import { haversineDistance, bearingBetween, formatDistance } from './geo';
import type { Coordinates } from '@/types';
import poisData from '../../public/data/pois.json';

// Hardcoded values matching constants.ts (avoids transitive import issues in vitest)
const TEOTIHUACAN_BOUNDS: [[number, number], [number, number]] = [
  [19.680, -98.855],
  [19.702, -98.830],
];
const ARRIVED_THRESHOLD = 30;
const APPROACHING_THRESHOLD = 100;

// ----- POI data typed for tests -----
interface TestPoi {
  slug: string;
  coordinates: Coordinates;
  name: { es: string; en: string };
  proximityRadius?: number;
}
const pois = poisData as TestPoi[];

function poiBySlug(slug: string): TestPoi {
  const poi = pois.find((p) => p.slug === slug);
  if (!poi) throw new Error(`POI "${slug}" not found in pois.json`);
  return poi;
}

/** Get the effective proximity radius for a POI. Falls back to ARRIVED_THRESHOLD. */
function radiusOf(poi: TestPoi): number {
  return poi.proximityRadius ?? ARRIVED_THRESHOLD;
}

// =====================================================================
// 1. UNIT TESTS — haversineDistance
// =====================================================================
describe('haversineDistance', () => {
  it('returns 0 for the same point', () => {
    const p: Coordinates = { lat: 19.6905, lng: -98.8441 };
    expect(haversineDistance(p, p)).toBe(0);
  });

  it('calculates a known distance (Mexico City ↔ Puebla ≈ 108 km)', () => {
    const cdmx: Coordinates = { lat: 19.4326, lng: -99.1332 };
    const puebla: Coordinates = { lat: 19.0414, lng: -98.2063 };
    const d = haversineDistance(cdmx, puebla);
    expect(d).toBeGreaterThan(95_000);
    expect(d).toBeLessThan(115_000);
  });

  it('is symmetric: dist(A,B) === dist(B,A)', () => {
    const a = poiBySlug('ciudadela').coordinates;
    const b = poiBySlug('piramide-sol').coordinates;
    expect(haversineDistance(a, b)).toBeCloseTo(haversineDistance(b, a), 6);
  });

  // Real POI pair distances — ranges verified against satellite imagery
  describe('real POI pair distances', () => {
    it('Ciudadela ↔ Templo Quetzalcóatl (within La Ciudadela complex, ~100-200 m)', () => {
      const d = haversineDistance(
        poiBySlug('ciudadela').coordinates,
        poiBySlug('templo-quetzalcoatl').coordinates,
      );
      expect(d).toBeGreaterThan(80);
      expect(d).toBeLessThan(250);
    });

    it('Plaza Luna ↔ Pirámide Luna (~250-350 m)', () => {
      const d = haversineDistance(
        poiBySlug('plaza-luna').coordinates,
        poiBySlug('piramide-luna').coordinates,
      );
      expect(d).toBeGreaterThan(200);
      expect(d).toBeLessThan(400);
    });

    it('Plaza Luna ↔ Palacio Quetzalpapálotl (~80-200 m)', () => {
      const d = haversineDistance(
        poiBySlug('plaza-luna').coordinates,
        poiBySlug('palacio-quetzalpapalotl').coordinates,
      );
      expect(d).toBeGreaterThan(50);
      expect(d).toBeLessThan(250);
    });

    it('Murales Puma ↔ Palacio Quetzalpapálotl (~200-350 m)', () => {
      const d = haversineDistance(
        poiBySlug('murales-puma').coordinates,
        poiBySlug('palacio-quetzalpapalotl').coordinates,
      );
      expect(d).toBeGreaterThan(150);
      expect(d).toBeLessThan(400);
    });

    it('Puerta 1 ↔ Pirámide Luna (~1.5-2.1 km, full site span)', () => {
      const d = haversineDistance(
        poiBySlug('puerta-1').coordinates,
        poiBySlug('piramide-luna').coordinates,
      );
      expect(d).toBeGreaterThan(1_400);
      expect(d).toBeLessThan(2_200);
    });
  });
});

// =====================================================================
// 2. UNIT TESTS — Proximity detection
// =====================================================================
describe('proximity detection', () => {
  // Simulate useProximity logic without React hooks
  function checkProximity(user: Coordinates, target: Coordinates) {
    const distance = haversineDistance(user, target);
    return {
      distance,
      isApproaching: distance <= APPROACHING_THRESHOLD,
      hasArrived: distance <= ARRIVED_THRESHOLD,
    };
  }

  it('detects arrival when user is at the exact center of each POI', () => {
    for (const poi of pois) {
      const result = checkProximity(poi.coordinates, poi.coordinates);
      expect(result.hasArrived).toBe(true);
      expect(result.distance).toBe(0);
    }
  });

  it('detects arrival when user is 1 m inside the arrival radius', () => {
    const poi = poiBySlug('piramide-sol');
    const metersInside = ARRIVED_THRESHOLD - 1;
    const latOffset = metersInside / 111_320;
    const user: Coordinates = {
      lat: poi.coordinates.lat + latOffset,
      lng: poi.coordinates.lng,
    };
    const result = checkProximity(user, poi.coordinates);
    expect(result.hasArrived).toBe(true);
  });

  it('does NOT detect arrival when user is 1 m outside the arrival radius', () => {
    const poi = poiBySlug('piramide-sol');
    const metersOutside = ARRIVED_THRESHOLD + 1;
    const latOffset = metersOutside / 111_320;
    const user: Coordinates = {
      lat: poi.coordinates.lat + latOffset,
      lng: poi.coordinates.lng,
    };
    const result = checkProximity(user, poi.coordinates);
    expect(result.hasArrived).toBe(false);
  });

  it('detects approaching but not arrived at mid-range distance', () => {
    const poi = poiBySlug('piramide-luna');
    // Place user ~60 m away (between arrived=30 and approaching=100)
    const latOffset = 60 / 111_320;
    const user: Coordinates = {
      lat: poi.coordinates.lat + latOffset,
      lng: poi.coordinates.lng,
    };
    const result = checkProximity(user, poi.coordinates);
    expect(result.isApproaching).toBe(true);
    expect(result.hasArrived).toBe(false);
  });

  it('user equidistant between 2 distant POIs gets roughly equal distances', () => {
    const poiA = poiBySlug('piramide-sol');
    const poiB = poiBySlug('piramide-luna');
    const midpoint: Coordinates = {
      lat: (poiA.coordinates.lat + poiB.coordinates.lat) / 2,
      lng: (poiA.coordinates.lng + poiB.coordinates.lng) / 2,
    };
    const distA = haversineDistance(midpoint, poiA.coordinates);
    const distB = haversineDistance(midpoint, poiB.coordinates);
    expect(Math.abs(distA - distB)).toBeLessThan(10);
  });

  it('user far outside all POIs gets no arrival/approaching', () => {
    const farUser: Coordinates = { lat: 19.69, lng: -98.87 };
    for (const poi of pois) {
      const result = checkProximity(farUser, poi.coordinates);
      expect(result.hasArrived).toBe(false);
      expect(result.isApproaching).toBe(false);
    }
  });
});

// =====================================================================
// 3. UNIT TESTS — Overlap verification (using per-POI proximityRadius)
// =====================================================================
describe('POI overlap verification', () => {
  it('all POIs have a valid proximityRadius (> 0 and < 200m)', () => {
    for (const poi of pois) {
      const r = radiusOf(poi);
      expect(r, `${poi.slug} radius`).toBeGreaterThan(0);
      expect(r, `${poi.slug} radius`).toBeLessThan(200);
    }
  });

  it('no two POIs have proximity radii that overlap (radius_A + radius_B < distance)', () => {
    const overlaps: string[] = [];

    for (let i = 0; i < pois.length; i++) {
      for (let j = i + 1; j < pois.length; j++) {
        const dist = haversineDistance(pois[i].coordinates, pois[j].coordinates);
        const minSafe = radiusOf(pois[i]) + radiusOf(pois[j]);
        if (dist < minSafe) {
          overlaps.push(
            `${pois[i].slug}(r=${radiusOf(pois[i])}) ↔ ${pois[j].slug}(r=${radiusOf(pois[j])}): distance=${dist.toFixed(1)}m < ${minSafe}m`,
          );
        }
      }
    }

    if (overlaps.length > 0) {
      throw new Error(
        `POI proximity radius overlaps detected:\n${overlaps.join('\n')}`,
      );
    }
  });

  it('approaching radii overlap report (informational)', () => {
    const overlaps: string[] = [];

    for (let i = 0; i < pois.length; i++) {
      for (let j = i + 1; j < pois.length; j++) {
        const dist = haversineDistance(pois[i].coordinates, pois[j].coordinates);
        if (dist < APPROACHING_THRESHOLD * 2) {
          overlaps.push(
            `${pois[i].slug} ↔ ${pois[j].slug}: distance=${dist.toFixed(1)}m`,
          );
        }
      }
    }

    if (overlaps.length > 0) {
      console.warn(
        `Approaching radius overlaps (informational):\n${overlaps.join('\n')}`,
      );
    }
    expect(true).toBe(true);
  });
});

// =====================================================================
// 4. INTEGRATION TESTS — Coordinate validation
// =====================================================================
describe('POI coordinate validation', () => {
  const [[minLat, minLng], [maxLat, maxLng]] = TEOTIHUACAN_BOUNDS;

  it('all POI coordinates are within TEOTIHUACAN_BOUNDS', () => {
    for (const poi of pois) {
      const { lat, lng } = poi.coordinates;
      expect(lat, `${poi.slug} lat`).toBeGreaterThanOrEqual(minLat);
      expect(lat, `${poi.slug} lat`).toBeLessThanOrEqual(maxLat);
      expect(lng, `${poi.slug} lng`).toBeGreaterThanOrEqual(minLng);
      expect(lng, `${poi.slug} lng`).toBeLessThanOrEqual(maxLng);
    }
  });

  it('all POIs have valid latitude and longitude (not zero, not NaN)', () => {
    for (const poi of pois) {
      expect(poi.coordinates.lat).not.toBeNaN();
      expect(poi.coordinates.lng).not.toBeNaN();
      expect(poi.coordinates.lat).not.toBe(0);
      expect(poi.coordinates.lng).not.toBe(0);
    }
  });

  it('no two POIs share the exact same coordinates', () => {
    const seen = new Set<string>();
    for (const poi of pois) {
      const key = `${poi.coordinates.lat},${poi.coordinates.lng}`;
      expect(seen.has(key), `duplicate coordinates for ${poi.slug}`).toBe(false);
      seen.add(key);
    }
  });

  it('there are at least 2 POIs in the dataset', () => {
    expect(pois.length).toBeGreaterThanOrEqual(2);
  });
});

// =====================================================================
// 5. UNIT TESTS — bearingBetween and formatDistance
// =====================================================================
describe('bearingBetween', () => {
  it('returns ~0° (north) when B is directly north of A', () => {
    const a: Coordinates = { lat: 19.69, lng: -98.84 };
    const b: Coordinates = { lat: 19.70, lng: -98.84 };
    const bearing = bearingBetween(a, b);
    expect(bearing % 360).toBeLessThan(5);
  });

  it('returns ~90° (east) when B is directly east of A', () => {
    const a: Coordinates = { lat: 19.69, lng: -98.85 };
    const b: Coordinates = { lat: 19.69, lng: -98.84 };
    const bearing = bearingBetween(a, b);
    expect(bearing).toBeGreaterThan(85);
    expect(bearing).toBeLessThan(95);
  });

  it('returns ~180° (south) when B is directly south of A', () => {
    const a: Coordinates = { lat: 19.70, lng: -98.84 };
    const b: Coordinates = { lat: 19.69, lng: -98.84 };
    const bearing = bearingBetween(a, b);
    expect(bearing).toBeGreaterThan(175);
    expect(bearing).toBeLessThan(185);
  });
});

describe('formatDistance', () => {
  it('formats distances under 1000m as meters', () => {
    expect(formatDistance(50)).toBe('50m');
    expect(formatDistance(999)).toBe('999m');
  });

  it('formats distances >= 1000m as kilometers', () => {
    expect(formatDistance(1000)).toBe('1.0km');
    expect(formatDistance(1500)).toBe('1.5km');
    expect(formatDistance(10500)).toBe('10.5km');
  });

  it('rounds meters to nearest integer', () => {
    expect(formatDistance(50.7)).toBe('51m');
    expect(formatDistance(50.3)).toBe('50m');
  });
});
