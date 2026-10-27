import React from 'react';
import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
import Chart from 'common/Chart';
import { historicalDayRange } from 'helpers/historicalDate';
import HistoricalSiteSummary from '.';

vi.hoisted(() => {
  // Simulate the actual non-UTC browser zone before date helpers initialize.
  vi.stubEnv('TZ', 'America/Phoenix');
});
vi.mock('common/Chart', () => ({
  default: vi.fn(() => <div>Historical chart</div>),
}));

it('keeps the selected UTC day final observation inside Phoenix chart bounds', () => {
  expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
    'America/Phoenix',
  );
  const observation = '2024-01-02T23:59:59.999Z';
  renderWithProviders(
    <HistoricalSiteSummary
      site={{
        ...mockSite,
        historicalDate: '2024-01-02',
        historicalObservedAt: observation,
        timezone: 'Pacific/Auckland',
        dailyData: [{ ...mockSite.dailyData[0], date: observation }],
      }}
    />,
  );
  const { datasets, startDate, endDate } = vi.mocked(Chart).mock.calls[0][0];
  const lastObservation = datasets![0].data[0].timestamp;
  expect(lastObservation).toBe('2024-01-03T06:59:59.000Z');
  expect(endDate).toBe('2024-01-03T06:59:59.000Z');
  expect(Date.parse(lastObservation)).toBeGreaterThanOrEqual(
    Date.parse(startDate!),
  );
  expect(Date.parse(lastObservation)).toBeLessThanOrEqual(Date.parse(endDate!));
  // API bounds remain real UTC values, not the chart's display conversion.
  expect(historicalDayRange('2024-01-02').end).toBe(observation);
  vi.unstubAllEnvs();
});
