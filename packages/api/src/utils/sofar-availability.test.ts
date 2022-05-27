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
  const point: [number, number] = [150.091, -5.432];
  const validPoint = getSofarNearestAvailablePoint(point);
  expect(validPoint).toEqual([150, -5]);
});

test('null island', () => {
  const point: [number, number] = [0, 0];
  const validPoint = getSofarNearestAvailablePoint(point);
  expect(validPoint).toEqual([0, 0]);
});
