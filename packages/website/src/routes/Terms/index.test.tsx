import React from 'react';
import configureStore from 'redux-mock-store';

import { mockUser } from 'mocks/mockUser';
import { mockCollection } from 'mocks/mockCollection';
import { renderWithProviders } from 'utils/test-utils';
import Terms from '.';

const mockStore = configureStore([]);

describe('Terms page', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
      collection: {
        details: mockCollection,
        loading: false,
        error: null,
      },
    });

    element = renderWithProviders(<Terms />, { store }).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
