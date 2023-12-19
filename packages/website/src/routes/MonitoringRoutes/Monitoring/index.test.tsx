import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { mockAdminUser } from 'mocks/mockUser';
import { Provider } from 'react-redux';
import Monitoring from '.';

const mockStore = configureStore([]);

describe('Monitoring Page', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockAdminUser,
        loading: false,
        error: null,
      },
    });

    element = render(
      <Provider store={store}>
        <BrowserRouter>
          <Monitoring />
        </BrowserRouter>
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
