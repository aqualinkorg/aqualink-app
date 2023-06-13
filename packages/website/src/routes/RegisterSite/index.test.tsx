import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';
import Apply from '.';

const mockStore = configureStore([]);

jest.mock('common/NavBar', () => 'Mock-NavBar');
jest.mock('./LocationMap', () => 'Mock-LocationMap');

describe('Site registration page', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Router>
          <Apply />
        </Router>
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
