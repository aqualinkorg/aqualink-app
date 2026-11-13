import { calculateCardMetrics, generateTempAnalysisDatasets } from './helpers';

const points = [
  { timestamp: '2026-01-01T00:00:00.000Z', value: 0 },
  { timestamp: '2026-01-02T00:00:00.000Z', value: 4 },
  { timestamp: '2026-01-03T00:00:00.000Z', value: 16 },
];

test('mean is arithmetic', () => {
  const rows = calculateCardMetrics(
    '2026-01-01T00:00:00.000Z',
    '2026-01-03T00:00:00.000Z',
    points,
    'test',
  );
  const mean = rows.find((row) => row.key === 'test-mean')?.value;
  expect(mean).toBeCloseTo(20 / 3);
});

test('NOAA SURFACE chart consumes satellite temperature time-series values', () => {
  const surface = generateTempAnalysisDatasets(points).find(
    (dataset) => dataset.label === 'SURFACE' && dataset.source === 'noaa',
  );

  expect(surface?.metric).toBe('satelliteTemperature');
  expect(surface?.data).toEqual(points);
  expect(surface?.displayData).toBe(true);
  expect(surface?.displayCardColumn).toBe(true);
});

test('NOAA SURFACE chart is hidden when satellite observations are missing', () => {
  const surface = generateTempAnalysisDatasets().find(
    (dataset) => dataset.label === 'SURFACE' && dataset.source === 'noaa',
  );

  expect(surface?.data).toEqual([]);
  expect(surface?.displayData).toBe(false);
  expect(surface?.displayCardColumn).toBe(false);
});
