import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import { mockSite } from 'mocks/mockSite';
import { mockDataRange } from 'mocks/mockDataRange';
import { mockTimeSeries } from 'mocks/mockTimeSeries';
import { mockGranularDailyData } from 'mocks/mockGranularDailyData';
import { MemoryRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { mockSurveyList } from 'mocks/mockSurveyList';
import { mockSurvey } from 'mocks/mockSurvey';
import ThemeProvider from '@mui/styles/ThemeProvider';
import theme from 'layout/App/theme';
import MultipleSensorsCharts from '.';

const mockStore = configureStore([]);

describe('MultipleSensorsCharts', () => {
  it('should render with given state from Redux store', () => {
    const store = mockStore({
      selectedSite: {
        details: { ...mockSite },
        oceanSenseData: undefined,
        granularDailyData: mockGranularDailyData,
        timeSeriesDataRange: mockDataRange,
        timeSeriesData: mockTimeSeries,
        timeSeriesDataRangeLoading: false,
        loading: false,
        error: null,
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
      user: {
        userInfo: null,
        loading: false,
        loadingCollection: false,
        error: null,
      },
    });

    store.dispatch = vi.fn();

    vi.useFakeTimers();

    vi.setSystemTime(new Date('2023-06-28T21:00:00.000Z'));

    const element = render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/sites/1', search: '?start=2022-05-28&end=2022-06-28' },
        ]}
      >
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <Provider store={store}>
              <MultipleSensorsCharts
                site={mockSite}
                disableGutters
                displayOceanSenseCharts
                surveysFiltered={false}
                hasAdditionalSensorData={false}
              />
            </Provider>
          </SnackbarProvider>
        </ThemeProvider>
      </MemoryRouter>,
    ).container;

    vi.useRealTimers();

    expect(element).toMatchSnapshot();
  });
});
