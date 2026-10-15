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
vi.mock('common/Chart/MultipleSensorsCharts', () => ({
  default: 'Mock-MultipleSensorsCharts',
}));
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

  it('shows no historical notice without a date', () => {
    renderSite(`/sites/${mockSite.id}`);
    expect(screen.queryByText(/Data on/)).toBeNull();
  });
});
