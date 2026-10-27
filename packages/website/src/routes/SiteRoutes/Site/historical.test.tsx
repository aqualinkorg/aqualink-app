import React from 'react';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
import { Site as SiteType } from 'store/Sites/types';
import Site from '.';

vi.mock('common/NavBar', () => ({ default: () => <nav>Site navigation</nav> }));
vi.mock('common/Footer', () => ({ default: () => <footer /> }));
vi.mock('common/SiteDetails', () => ({
  default: () => <div data-testid="live-details">Live details</div>,
}));
vi.mock('./SiteInfo', () => ({
  default: () => <div>Live site information</div>,
}));
vi.mock('common/Chart', () => ({ default: () => <div>Historical chart</div> }));

const mockStore = configureStore([]);
const snapshot: SiteType = {
  ...mockSite,
  name: 'Historical site A',
  historicalDate: '2024-01-02',
  historicalObservedAt: '2024-01-02T23:59:59.999Z',
  collectionData: { satelliteTemperature: 0, dhw: 0, tempWeeklyAlert: 0 },
  dailyData: [{ ...mockSite.dailyData[0], date: '2024-01-02T23:59:59.999Z' }],
};

function renderSite(path: string, details?: SiteType, loading = false) {
  window.history.replaceState({}, '', path);
  const store = mockStore({
    selectedSite: { details, loading, error: null },
    user: { userInfo: null },
    surveyList: { list: [] },
  });
  store.dispatch = vi.fn();
  return renderWithProviders(
    <Routes>
      <Route path="/sites/:id" element={<Site />} />
    </Routes>,
    { store },
  );
}

describe('historical site page', () => {
  afterEach(() => window.history.replaceState({}, '', '/'));

  it('shows the selected daily snapshot and measured zero without the live branch', () => {
    renderSite('/sites/1?date=2024-01-02', snapshot);
    expect(
      screen.getByText('Daily snapshot: 2024-01-02 (UTC)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Historical site A')).toBeInTheDocument();
    expect(screen.getByText('0.0 °C')).toBeInTheDocument();
    expect(screen.getByText('0.0 DHW')).toBeInTheDocument();
    expect(screen.getByText('no alert')).toBeInTheDocument();
    expect(screen.queryByTestId('live-details')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to historical map' }),
    ).toHaveAttribute('href', '/map?date=2024-01-02');
  });

  it('shows no data instead of current or zero values for an empty day', () => {
    renderSite('/sites/1?date=2024-01-02', {
      ...snapshot,
      historicalObservedAt: null,
      collectionData: {},
      dailyData: [],
    });
    expect(screen.getAllByText('No data')).toHaveLength(3);
    expect(
      screen.getByText(/No daily observation is available for this date/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /No daily temperature observations in this 90-day period/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('live-details')).not.toBeInTheDocument();
    expect(screen.queryByText('0.0 °C')).not.toBeInTheDocument();
  });

  it('does not show site A while site B is loading for the same date', () => {
    renderSite('/sites/2?date=2024-01-02', snapshot, true);
    expect(screen.queryByText('Historical site A')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading historical observations',
    );
    expect(screen.queryByTestId('live-details')).not.toBeInTheDocument();
  });

  it('does not show a live cached site while its historical snapshot is loading', () => {
    renderSite('/sites/1?date=2024-01-02', mockSite, true);
    expect(
      screen.queryByText('Daily snapshot: 2024-01-02 (UTC)'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading historical observations',
    );
    expect(screen.queryByTestId('live-details')).not.toBeInTheDocument();
  });

  it('shows a bracket-date URL error without silently rendering live content', () => {
    renderSite('/sites/1?date%5B%5D=2024-01-02', mockSite);
    expect(
      screen.getByText(
        'Choose one valid calendar date on or before today (UTC).',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('live-details')).not.toBeInTheDocument();
    expect(screen.queryByText('Historical site A')).not.toBeInTheDocument();
  });
});
