import type { Coord } from '@turf/helpers';
import type { FeatureCollection, Point } from 'geojson';
import nearestPoint from '@turf/nearest-point';
import availabilityPoints from './sofar-availability-points';

let geojson;
export function getSofarWaveModelAvailability(): FeatureCollection<Point> {
  if (!geojson) {
    // eslint-disable-next-line fp/no-mutation
    geojson = {
      type: 'FeatureCollection',
      features: availabilityPoints.map((coordinate) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinate,
        },
      })),
    };
  }
  return geojson;
}

export function getSofarNearestAvailablePoint(point: Coord): [number, number] {
  const availablePoints = getSofarWaveModelAvailability();
  // deconstructing number[] into [number, number] in order to make typescript compiler happy
  const [longitude, latitude] = nearestPoint(point, availablePoints).geometry
    .coordinates;
  return [longitude, latitude];
}
