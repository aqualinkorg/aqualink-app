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

window.scrollTo = jest.fn();

jest.mock('common/SiteDetails/Map', () => 'Mock-Map');
jest.mock('common/SiteDetails/FeaturedMedia', () => 'Mock-FeaturedMedia');

jest.mock(
  'common/Chart/MultipleSensorsCharts',
  () => 'Mock-MultipleSensorsCharts',
);

describe('Site Detail Page', () => {
  let elementEmpty: HTMLElement;
  let elementFull: HTMLElement;
  beforeEach(() => {
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
      collection: {
        details: mockCollection,
        loading: false,
        error: null,
      },
    });

    const fullStore = mockStore({
      selectedSite: {
        details: mockSite,
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
        list: [mockSite],
        loading: false,
        error: null,
      },
      surveyList: {
        list: [mockSurveyList],
        loading: false,
        error: null,
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

    emptyStore.dispatch = jest.fn();
    fullStore.dispatch = jest.fn();

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

  it('should render with given state from Redux store', () => {
    expect(elementEmpty).toMatchSnapshot('snapshot-with-no-data');
  });

  it('should render with given state from Redux store', () => {
    expect(elementFull).toMatchSnapshot('snapshot-with-data');
  });
});
