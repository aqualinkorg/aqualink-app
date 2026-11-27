import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { mockSite } from 'mocks/mockSite';
import { mockUser } from 'mocks/mockUser';
import { mockDataRange } from 'mocks/mockDataRange';
import siteServices from 'services/siteServices';
import theme from 'layout/App/theme';
import Site from '.';

window.scrollTo = vi.fn();

vi.mock('common/SiteDetails/Map', () => ({ default: 'Mock-Map' }));
vi.mock('common/SiteDetails/FeaturedMedia', () => ({
  default: 'Mock-FeaturedMedia',
}));
// Like the real charts, reads its window from the URL once, when it mounts.
vi.mock('common/Chart/MultipleSensorsCharts', async () => {
  const { useQueryParam } = await import('hooks/useQueryParams');
  return {
    default: function MockMultipleSensorsCharts() {
      const [start] = useQueryParam('start');
      const [end] = useQueryParam('end');
      return <div data-testid="sensor-charts-window">{`${start} ${end}`}</div>;
    },
  };
});
vi.mock('common/AiChatWidget', () => ({ default: 'Mock-AiChatWidget' }));

const renderSite = (url: string) => {
  const store = configureStore([])({
    selectedSite: {
      details: { ...mockSite, dailyData: [] },
      timeSeriesDataRange: mockDataRange,
      loading: false,
      error: null,
    },
    user: { userInfo: mockUser, error: null, loading: false },
    homepage: { siteOnMap: mockSite },
    sitesList: { list: [mockSite], loading: false, error: null },
    surveyList: { list: [], loading: false, error: null },
    reefCheckSurveyList: { list: [] },
    survey: { selectedSurvey: { details: null } },
    collection: { details: null, loading: false, error: null },
  });
  store.dispatch = vi.fn();

  render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Router initialEntries={[url]}>
          <Routes>
            <Route path="/sites/:id" element={<Site />} />
          </Routes>
        </Router>
      </Provider>
    </ThemeProvider>,
  );
};

describe('Site page on a past day', () => {
  it("shows that day's satellite values with a way back to the latest data", async () => {
    const getSiteDailyData = vi
      .spyOn(siteServices, 'getSiteDailyData')
      .mockResolvedValue({
        data: [
          {
            date: '2024-03-15T23:59:59.000Z',
            satelliteTemperature: 30.4,
            degreeHeatingDays: 63,
            weeklyAlertLevel: 4,
          },
        ],
      } as any);

    renderSite(`/sites/${mockSite.id}?date=2024-03-15`);

    expect(await screen.findByText(/Data on Mar 15, 2024/)).toBeTruthy();
    expect(screen.getByText('Show latest')).toBeTruthy();
    expect(screen.getAllByText(/30\.4/).length).toBeGreaterThan(0);
    expect(getSiteDailyData).toHaveBeenCalledWith(
      String(mockSite.id),
      '2024-03-02T00:00:00.000Z',
      '2024-03-15T23:59:59.999Z',
    );
  });

  it('opens the sensor charts on the month ending on that day', async () => {
    vi.spyOn(siteServices, 'getSiteDailyData').mockResolvedValue({
      data: [],
    } as any);

    renderSite(`/sites/${mockSite.id}?date=2024-03-15`);

    expect(
      (await screen.findByTestId('sensor-charts-window')).textContent,
    ).toBe('2024-02-15 2024-03-15');
  });

  it('keeps a chart window that is already in the URL', async () => {
    vi.spyOn(siteServices, 'getSiteDailyData').mockResolvedValue({
      data: [],
    } as any);

    renderSite(
      `/sites/${mockSite.id}?date=2024-03-15&start=2023-01-01&end=2023-06-30`,
    );

    expect(
      (await screen.findByTestId('sensor-charts-window')).textContent,
    ).toBe('2023-01-01 2023-06-30');
  });

  it('shows no historical notice without a date', () => {
    renderSite(`/sites/${mockSite.id}`);
    expect(screen.queryByText(/Data on/)).toBeNull();
  });
});
