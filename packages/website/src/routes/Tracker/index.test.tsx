import React from 'react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';

import { renderWithProviders } from 'utils/test-utils';
import Tracker from '.';

vi.mock('common/NavBar', () => ({ default: 'Mock-NavBar' }));
vi.mock('common/Footer', () => ({ default: 'Mock-Footer' }));

const mockStore = configureStore([]);
describe('Tracker', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
    });

    store.dispatch = vi.fn();

    element = renderWithProviders(<Tracker />, { store }).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
