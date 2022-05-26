import type { Coord } from '@turf/helpers';
import type { FeatureCollection, Point } from 'geojson';
import nearestPoint from '@turf/nearest-point';
import availabilityPoints from './sofar-availability-points';

let geojson;
export function getSofarWaveModelAvailability(): FeatureCollection<Point> {
  if (!geojson) {
    geojson = {
      type: 'FeatureCollection',
      features: availabilityPoints.map((coordinate) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinate as Coord,
        },
      })),
    };
  }
  return geojson;
}

export function getSofarNearestAvailablePoint(point: Coord): Coord {
  const geojson = getSofarWaveModelAvailability();
  return nearestPoint(point, geojson).geometry.coordinates as Coord;
}
