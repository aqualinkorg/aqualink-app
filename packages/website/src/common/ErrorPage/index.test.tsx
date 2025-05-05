import React from 'react';
import configureStore from 'redux-mock-store';

import { mockUser } from 'mocks/mockUser';
import { mockCollection } from 'mocks/mockCollection';
import { renderWithProviders } from 'utils/test-utils';
import ErrorPage from '.';

const mockStore = configureStore([]);

describe('Error Page', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
      collection: {
        details: mockCollection,
        loading: false,
        error: null,
      },
    });

    store.dispatch = vi.fn();
    element = renderWithProviders(<ErrorPage />, { store }).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
