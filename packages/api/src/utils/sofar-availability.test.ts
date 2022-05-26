import {
  getSofarWaveModelAvailability,
  getSofarNearestAvailablePoint,
} from './sofar-availability';

test('getting Sofar Wave Model availability zones', () => {
  const geojson = getSofarWaveModelAvailability();
  expect(geojson.type).toBe('FeatureCollection');
  expect(geojson.features.length).toBeGreaterThanOrEqual(100);
});

test('snapping point to availability zones', () => {
  const point = [150.091, -5.432];
  const validPoint = getSofarNearestAvailablePoint(point as [number, number]);
  expect(validPoint).toEqual([150, -5]);
});

test('null island', () => {
  const point = [0, 0];
  const validPoint = getSofarNearestAvailablePoint(point as [number, number]);
  expect(validPoint).toEqual([0, 0]);
});
