import React from 'react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';
import { renderWithProviders } from 'utils/test-utils';
import Apply from '.';

const mockStore = configureStore([]);

vi.mock('common/NavBar', () => ({ default: 'Mock-NavBar' }));
vi.mock('./LocationMap', () => ({ default: 'Mock-LocationMap' }));

describe('Site registration page', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
    });

    store.dispatch = vi.fn();

    element = renderWithProviders(<Apply />, { store }).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
