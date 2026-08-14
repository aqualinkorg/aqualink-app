import { calculateCardMetrics } from './helpers';

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
