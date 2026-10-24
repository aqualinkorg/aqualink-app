import { DateTime } from 'luxon-extensions';
import { convertToLocalTime } from 'helpers/dates';
import {
  calculateCardMetrics,
  getHistoricalRangeStartDate,
  getZonedDateBounds,
} from './helpers';

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

describe('getZonedDateBounds', () => {
  it('keeps the selected day in positive-offset site timezones', () => {
    const bounds = getZonedDateBounds(
      '2025-01-01',
      '2025-01-01',
      'Pacific/Auckland',
    );

    expect(bounds).toEqual({
      start: '2024-12-31T11:00:00.000Z',
      end: '2025-01-01T10:59:59.999Z',
    });
    expect(
      DateTime.fromISO(bounds.end).setZone('Pacific/Auckland').toISODate(),
    ).toBe('2025-01-01');
    const chartEndDate = convertToLocalTime(bounds.end, 'Pacific/Auckland');
    expect(
      DateTime.fromISO(chartEndDate)
        .setZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
        .toISODate(),
    ).toBe('2025-01-01');
  });

  it('keeps UTC site bounds on the selected day', () => {
    expect(getZonedDateBounds('2025-01-01', '2025-01-01', 'UTC')).toEqual({
      start: '2025-01-01T00:00:00.000Z',
      end: '2025-01-01T23:59:59.999Z',
    });
  });
});

describe('getHistoricalRangeStartDate', () => {
  it('uses the selected historical end date for preset ranges', () => {
    expect(
      getHistoricalRangeStartDate(
        '2025-01-01',
        'one_year',
        undefined,
        'Pacific/Auckland',
      ),
    ).toBe('2024-01-01');
    expect(
      getHistoricalRangeStartDate(
        '2025-01-01',
        'max',
        '2021-01-01T12:00:00.000Z',
        'Pacific/Auckland',
      ),
    ).toBe('2021-01-02');
  });
});
