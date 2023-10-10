import { createPoint } from './coordinates';
import {
  AVAILABLE_POINTS,
  getSofarNearestAvailablePoint,
} from './sofar-availability';

test('getting Sofar Wave Model availability zones', () => {
  expect(AVAILABLE_POINTS.type).toBe('FeatureCollection');
  expect(AVAILABLE_POINTS.features.length).toBeGreaterThanOrEqual(100);
});

test('snapping point to availability zones', () => {
  const point = createPoint(150.091, -5.432);
  const validPoint = getSofarNearestAvailablePoint(point);
  expect(validPoint).toEqual([150, -5]);
});

test('null island', () => {
  const point = createPoint(0, 0);
  const validPoint = getSofarNearestAvailablePoint(point);
  expect(validPoint).toEqual([0, 0]);
});
