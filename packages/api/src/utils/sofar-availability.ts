import type { FeatureCollection, Point, Polygon } from 'geojson';
import { nearestPoint, booleanPointInPolygon } from '@turf/turf';
import availabilityPoints from './sofar-availability-points';

export const AVAILABLE_POINTS: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: availabilityPoints.map((coordinate) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coordinate,
    },
  })),
};

export function getSofarNearestAvailablePoint(point: Point): [number, number] {
  // deconstructing number[] into [number, number] in order to make typescript compiler happy
  const [longitude, latitude] = nearestPoint(point, AVAILABLE_POINTS).geometry
    .coordinates;

  const poly: Polygon = {
    type: 'Polygon',
    coordinates: [
      [
        [
          ((180 + longitude - 0.25) % 360) - 180,
          ((90 + latitude + 0.25) % 180) - 90,
        ],
        [
          ((180 + longitude - 0.25) % 360) - 180,
          ((90 + latitude - 0.25) % 180) - 90,
        ],
        [
          ((180 + longitude + 0.25) % 360) - 180,
          ((90 + latitude - 0.25) % 180) - 90,
        ],
        [
          ((180 + longitude + 0.25) % 360) - 180,
          ((90 + latitude + 0.25) % 180) - 90,
        ],

        // first again
        [
          ((180 + longitude - 0.25) % 360) - 180,
          ((90 + latitude + 0.25) % 180) - 90,
        ],
      ],
    ],
  };

  const pointCoordinates = point.coordinates;

  return booleanPointInPolygon(point, poly)
    ? (pointCoordinates as [number, number])
    : [longitude, latitude];
}
