import React from 'react';
import configureStore from 'redux-mock-store';

import { mockUser } from 'mocks/mockUser';
import { mockCollection } from 'mocks/mockCollection';
import { renderWithProviders } from 'utils/test-utils';
import HomePageNavBar from '.';

rstest.mock('../RegisterDialog', () => ({ default: 'Mock-RegisterDialog' }));
rstest.mock('../SignInDialog', () => ({ default: 'Mock-SignInDialog' }));
rstest.mock('../Search', () => ({ default: 'Mock-Search' }));
rstest.mock('../MenuDrawer', () => ({ default: 'Mock-MenuDrawer' }));

const mockStore = configureStore([]);

describe('NavBar with routeButtons', () => {
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

    store.dispatch = rstest.fn();

    element = renderWithProviders(
      <HomePageNavBar routeButtons searchLocation={false} />,
      { store },
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});

describe('NavBar without routeButtons', () => {
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

    store.dispatch = rstest.fn();

    element = renderWithProviders(<HomePageNavBar searchLocation={false} />, {
      store,
    }).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
