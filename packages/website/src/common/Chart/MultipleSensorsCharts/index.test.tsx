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
import MultipleSensorsCharts from '.';

const mockStore = configureStore([]);

describe('MultipleSensorsCharts', () => {
  let element: HTMLElement;
  beforeEach(() => {
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
    });

    store.dispatch = jest.fn();

    jest.useFakeTimers();

    (jest as any).setSystemTime(new Date('2023-06-28T21:00:00.000Z'));

    element = render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/sites/1', search: '?start=2022-05-28&end=2022-06-28' },
        ]}
      >
        <SnackbarProvider>
          <Provider store={store}>
            <MultipleSensorsCharts
              site={mockSite}
              disableGutters
              displayOceanSenseCharts
              surveysFiltered={false}
            />
          </Provider>
        </SnackbarProvider>
      </MemoryRouter>,
    ).container;

    jest.useRealTimers();
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
