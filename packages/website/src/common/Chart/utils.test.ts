import { calculateAxisLimits } from './utils';

test('empty visible range does not produce Infinity y-axis', () => {
  const { yAxisMin, yAxisMax } = calculateAxisLimits(
    [
      {
        label: 'HWO',
        data: [{ timestamp: '2020-01-01T00:00:00.000Z', value: 10 }],
        type: 'line',
        unit: 'CFU/100 mL',
        curveColor: '#000',
        displayData: true,
        considerForXAxisLimits: true,
      },
    ],
    '2026-01-01T00:00:00.000Z',
    '2026-02-01T00:00:00.000Z',
    null,
  );

  expect(Number.isFinite(yAxisMin)).toBe(true);
  expect(Number.isFinite(yAxisMax)).toBe(true);
  expect(yAxisMax).toBeGreaterThan(yAxisMin);
});

test('y-axis does not expand to include dohThreshold', () => {
  const { yAxisMax } = calculateAxisLimits(
    [
      {
        label: 'HWO',
        data: [{ timestamp: '2026-01-15T00:00:00.000Z', value: 10 }],
        type: 'line',
        unit: 'CFU/100 mL',
        curveColor: '#000',
        displayData: true,
        considerForXAxisLimits: true,
        dohThreshold: 130,
      },
    ],
    '2026-01-01T00:00:00.000Z',
    '2026-02-01T00:00:00.000Z',
    null,
  );

  // Healthy-site data stays zoomed; DOH value is shown via the header badge.
  expect(yAxisMax).toBeLessThan(130);
});
