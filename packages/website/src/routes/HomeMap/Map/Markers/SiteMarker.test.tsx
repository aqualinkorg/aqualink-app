import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockSite } from 'mocks/mockSite';
import { CircleSiteMarker, SensorSiteMarker } from './SiteMarker';

const historicalDate = vi.hoisted(() => ({
  value: '2020-03-01' as string | undefined,
}));
vi.mock('hooks/useHistoricalDate', () => ({
  useHistoricalDate: () => historicalDate.value,
}));

vi.mock('react-redux', () => ({ useSelector: () => false }));
vi.mock('store/hooks', () => ({ useAppDispatch: () => vi.fn() }));
vi.mock('../Popup', () => ({ default: () => null }));
// Only replace Leaflet's rendering boundary; production marker and icon helpers run.
vi.mock('react-leaflet', () => ({
  useMap: () => null,
  CircleMarker: ({
    pathOptions,
    fillColor,
  }: {
    pathOptions?: { fillColor: string };
    fillColor?: string;
  }) => (
    <span
      data-testid="circle"
      data-color={pathOptions?.fillColor ?? fillColor}
    />
  ),
  Marker: ({ icon }: { icon: { options: { html: string } } }) => (
    <span data-testid="sensor" data-icon={icon.options.html} />
  ),
}));

describe('map markers with historical summaries', () => {
  beforeEach(() => {
    historicalDate.value = '2020-03-01';
  });
  it('preserves live marker colors when returning from history', () => {
    const site = { ...mockSite, collectionData: undefined };
    const { rerender } = render(<CircleSiteMarker site={site} />);
    expect(screen.getAllByTestId('circle')[0]).toHaveAttribute(
      'data-color',
      '#767676',
    );
    historicalDate.value = undefined;
    rerender(<CircleSiteMarker site={{ ...site }} />);
    expect(screen.getAllByTestId('circle')[0]).toHaveAttribute(
      'data-color',
      '#C6E5FA',
    );
  });
  it.each([
    [0, '#C6E5FA'],
    [1, '#FFF200'],
    [2, '#F8AB00'],
    [3, '#EF0000'],
    [4, '#940000'],
  ] as const)('renders measured level %s', (level, color) => {
    render(
      <CircleSiteMarker
        site={{ ...mockSite, collectionData: { tempWeeklyAlert: level } }}
      />,
    );
    screen
      .getAllByTestId('circle')
      .forEach((marker) => expect(marker).toHaveAttribute('data-color', color));
  });
  it.each([
    ['absent collection', undefined],
    ['empty history', {}],
    // Exercise a null runtime payload even though the API type declares numbers.
    ['null alert', { tempWeeklyAlert: null as unknown as number }],
    // API removes expired NOAA values, even when other metrics remain fresh.
    ['expired alert with another metric', { satelliteTemperature: 26 }],
  ])('distinguishes %s from a measured zero', (_, collectionData) => {
    const site = { ...mockSite, hasHobo: true, collectionData };
    const { rerender } = render(
      <>
        <CircleSiteMarker site={site} />
        <SensorSiteMarker site={site} />
      </>,
    );
    const missingColor = screen
      .getAllByTestId('circle')[0]
      .getAttribute('data-color');
    const missingIcon = screen
      .getAllByTestId('sensor')[0]
      .getAttribute('data-icon');
    rerender(
      <>
        <CircleSiteMarker
          site={{ ...site, collectionData: { tempWeeklyAlert: 0 } }}
        />
        <SensorSiteMarker
          site={{ ...site, collectionData: { tempWeeklyAlert: 0 } }}
        />
      </>,
    );
    expect(screen.getAllByTestId('circle')[0]).not.toHaveAttribute(
      'data-color',
      missingColor,
    );
    expect(screen.getAllByTestId('sensor')[0]).not.toHaveAttribute(
      'data-icon',
      missingIcon,
    );
    expect(screen.getAllByTestId('circle')).toHaveLength(3);
    expect(screen.getAllByTestId('sensor')).toHaveLength(3);
  });
});
