import React from 'react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';

import { renderWithProviders } from 'utils/test-utils';
import Buoy from '.';

rstest.mock('common/NavBar', () => ({ default: 'Mock-NavBar' }));
rstest.mock('common/Footer', () => ({ default: 'Mock-Footer' }));

const mockStore = configureStore([]);
describe('Buoy', () => {
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

    element = renderWithProviders(<Buoy />).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
