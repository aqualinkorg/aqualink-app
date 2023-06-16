import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';

import { mockUser } from 'mocks/mockUser';
import { mockSurveyList } from 'mocks/mockSurveyList';
import { mockSite } from 'mocks/mockSite';
import Surveys from '.';

const mockStore = configureStore([]);

describe('Surveys', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      surveyList: {
        list: [mockSurveyList],
        loading: false,
        error: null,
      },
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Router>
          <Surveys site={mockSite} />
        </Router>
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
