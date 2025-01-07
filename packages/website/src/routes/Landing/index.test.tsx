import configureStore from 'redux-mock-store';

import { mockUser } from 'mocks/mockUser';
import { mockCollection } from 'mocks/mockCollection';
import { renderWithProviders } from 'utils/test-utils';
import LandingPage from '.';

const mockStore = configureStore([]);

describe('Landing Page', () => {
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

    store.dispatch = jest.fn();

    element = renderWithProviders(<LandingPage />, { store }).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
