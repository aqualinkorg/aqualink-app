import type { Coord } from '@turf/helpers';
import type { FeatureCollection, Point } from 'geojson';
import nearestPoint from '@turf/nearest-point';
import availabilityPoints from './sofar-availability-points';

const geojson: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: availabilityPoints.map((coordinate) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coordinate,
    },
  })),
};

export function getSofarNearestAvailablePoint(point: Coord): [number, number] {
  const availablePoints = geojson;
  // deconstructing number[] into [number, number] in order to make typescript compiler happy
  const [longitude, latitude] = nearestPoint(point, availablePoints).geometry
    .coordinates;
  return [longitude, latitude];
}
