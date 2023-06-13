import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { mockSite } from 'mocks/mockSite';
import { mockUser } from 'mocks/mockUser';

import { mockSurveyList } from 'mocks/mockSurveyList';
import { mockDataRange } from 'mocks/mockDataRange';
import { mockCollection } from 'mocks/mockCollection';
import SurveyPoint from '.';

jest.mock('./InfoCard/Map', () => 'Mock-Map');

window.scrollTo = jest.fn();

const mockMatch = {
  isExact: true,
  params: {
    id: '1',
    pointId: '1',
  },
  path: '/sites/:id/points/:pointId',
  url: '/sites/1/points/1',
};

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

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Router>
          <SurveyPoint
            match={mockMatch}
            location={{} as any}
            history={{} as any}
          />
        </Router>
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot('snapshot');
  });
});
