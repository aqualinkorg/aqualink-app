import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { mockSite } from 'mocks/mockSite';
import { mockUser } from 'mocks/mockUser';

import { mockSurveyList } from 'mocks/mockSurveyList';
import { mockDataRange } from 'mocks/mockDataRange';
import { mockCollection } from 'mocks/mockCollection';
import theme from 'layout/App/theme';
import { ThemeProvider } from '@mui/material/styles';
import SurveyPoint from '.';

rstest.mock('./InfoCard/Map', () => ({ default: 'Mock-Map' }));

window.scrollTo = rstest.fn();

const mockStore = configureStore([]);

describe('Survey Point Detail Page', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      selectedSite: {
        hoboDataRange: mockDataRange,
        details: mockSite,
        loading: false,
        error: null,
      },
      sitesList: {
        list: [mockSite],
        loading: false,
        error: null,
      },
      user: {
        userInfo: mockUser,
        error: null,
        loading: false,
      },
      surveyList: {
        list: [mockSurveyList],
      },
      collection: {
        details: mockCollection,
        loading: false,
        error: null,
      },
    });

    store.dispatch = rstest.fn();

    element = render(
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <Router initialEntries={['/sites/1/points/1']}>
            <Routes>
              <Route
                path="/sites/:id/points/:pointId"
                element={<SurveyPoint />}
              />
            </Routes>
          </Router>
        </Provider>
      </ThemeProvider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot('snapshot');
  });
});
