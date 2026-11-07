/* eslint-disable fp/no-mutation */
import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { mockSite } from 'mocks/mockSite';
import { mockUser } from 'mocks/mockUser';
import { mockSurveyList } from 'mocks/mockSurveyList';
import { mockCollection } from 'mocks/mockCollection';
import { mockDataRange } from 'mocks/mockDataRange';
import { mockSurvey } from 'mocks/mockSurvey';
import { ThemeProvider } from '@mui/material';
import theme from 'layout/App/theme';
import Site from '.';

const mockStore = configureStore([]);

window.scrollTo = vi.fn();

vi.mock('common/SiteDetails/Map', () => ({ default: 'Mock-Map' }));
vi.mock('common/SiteDetails/FeaturedMedia', () => ({
  default: 'Mock-FeaturedMedia',
}));

vi.mock('common/Chart/MultipleSensorsCharts', () => ({
  default: 'Mock-MultipleSensorsCharts',
}));

vi.mock('common/HistoricalDatePicker', () => ({
  default: () => null,
}));

const createSitePageStore = (hasData: boolean) => {
  const store = mockStore({
    selectedSite: {
      details: hasData ? mockSite : { ...mockSite, dailyData: [] },
      timeSeriesDataRange: mockDataRange,
      loading: false,
      error: null,
    },
    user: {
      userInfo: mockUser,
      error: null,
      loading: false,
    },
    homepage: {
      siteOnMap: mockSite,
    },
    sitesList: {
      list: hasData ? [mockSite] : [],
      loading: false,
      error: null,
    },
    surveyList: {
      list: hasData ? [mockSurveyList] : [],
      loading: false,
      error: null,
    },
    survey: {
      selectedSurvey: {
        details: hasData ? mockSurvey : null,
      },
    },
    reefCheckSurveyList: {
      list: [],
    },
    collection: {
      details: mockCollection,
      loading: false,
      error: null,
    },
  });
  store.dispatch = vi.fn();
  return store;
};

const renderSiteRoute = (
  store: ReturnType<typeof createSitePageStore>,
  initialEntry = '/sites/1',
) =>
  render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Router initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/sites/:id" element={<Site />} />
          </Routes>
        </Router>
      </Provider>
    </ThemeProvider>,
  ).container;

describe('Site Detail Page', () => {
  let elementEmpty: HTMLElement;
  let elementFull: HTMLElement;

  beforeEach(() => {
    const emptyStore = createSitePageStore(false);
    const fullStore = createSitePageStore(true);

    elementEmpty = renderSiteRoute(emptyStore);
    elementFull = renderSiteRoute(fullStore);
  });

  it('should render with given state from Redux store', () => {
    expect(elementEmpty).toMatchSnapshot('snapshot-with-no-data');
  });

  it('should render with given state from Redux store', () => {
    expect(elementFull).toMatchSnapshot('snapshot-with-data');
  });

  it('hydrates historical date from URL query parameter on site route', () => {
    const store = createSitePageStore(true);
    renderSiteRoute(store, '/sites/1?date=2023-08-15');

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'sitesList/setSelectedDate',
        payload: '2023-08-15',
      }),
    );
  });
});
