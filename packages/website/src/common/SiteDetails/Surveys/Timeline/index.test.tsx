import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';

import { mockSurveyList } from 'mocks/mockSurveyList';
import Timeline from '.';

const mockStore = configureStore([]);

describe('SiteRoutes Surveys', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      surveyList: {
        list: [mockSurveyList],
        loading: false,
        error: null,
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Router>
          <Timeline
            isAdmin={false}
            siteId={0}
            observation="any"
            pointId={0}
            pointName="Test Point"
            addNewButton
          />
        </Router>
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
