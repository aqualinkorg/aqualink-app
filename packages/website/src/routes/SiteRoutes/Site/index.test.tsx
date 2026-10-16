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

describe('Site Detail Page', () => {
  let elementEmpty: HTMLElement;
  let elementFull: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-28T12:00:00Z'));

    const datedMockSite = {
      ...mockSite,
      dailyData: mockSite.dailyData.map((dailyData) => ({
        ...dailyData,
        date: '2026-05-28T11:55:00.000Z',
      })),
    };

    const emptyStore = mockStore({
      selectedSite: {
        details: { ...mockSite, dailyData: [] },
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
        list: [],
        loading: false,
        error: null,
      },
      surveyList: {
        list: [],
        loading: false,
        error: null,
      },
      survey: {
        selectedSurvey: {
          details: null,
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

    const fullStore = mockStore({
      selectedSite: {
        details: datedMockSite,
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
        siteOnMap: datedMockSite,
      },
      sitesList: {
        list: [datedMockSite],
        loading: false,
        error: null,
      },
      surveyList: {
        list: [mockSurveyList],
        loading: false,
        error: null,
      },
      reefCheckSurveyList: {
        list: [],
      },
      survey: {
        selectedSurvey: {
          details: mockSurvey,
        },
      },
      collection: {
        details: mockCollection,
        loading: false,
        error: null,
      },
    });

    emptyStore.dispatch = vi.fn();
    fullStore.dispatch = vi.fn();

    elementEmpty = render(
      <ThemeProvider theme={theme}>
        <Provider store={emptyStore}>
          <Router initialEntries={['/sites/1']}>
            <Routes>
              <Route path="/sites/:id" element={<Site />} />
            </Routes>
          </Router>
        </Provider>
      </ThemeProvider>,
    ).container;

    elementFull = render(
      <ThemeProvider theme={theme}>
        <Provider store={fullStore}>
          <Router initialEntries={['/sites/1']}>
            <Routes>
              <Route path="/sites/:id" element={<Site />} />
            </Routes>
          </Router>
        </Provider>
      </ThemeProvider>,
    ).container;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with given state from Redux store', () => {
    expect(elementEmpty).toMatchSnapshot('snapshot-with-no-data');
  });

  it('should render with given state from Redux store', () => {
    expect(elementFull).toMatchSnapshot('snapshot-with-data');
  });
});
