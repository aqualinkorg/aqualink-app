import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import { mockUser } from 'mocks/mockUser';

import SignInDialog from '.';

const mockStore = configureStore([]);

describe('SignInDialog', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
    });

    store.dispatch = rstest.fn();

    element = render(
      <Provider store={store}>
        <Router>
          <SignInDialog
            open
            handleRegisterOpen={rstest.fn()}
            handleSignInOpen={rstest.fn()}
          />
        </Router>
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
