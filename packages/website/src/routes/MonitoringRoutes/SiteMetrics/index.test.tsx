import React from 'react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';
import { SnackbarProvider } from 'notistack';
import { mockCollection } from 'mocks/mockCollection';
import { advanceTo, clear } from 'jest-date-mock';
import { renderWithProviders } from 'utils/test-utils';
import SiteMetrics from '.';

const mockStore = configureStore([]);

describe('Monitoring SiteMetrics Page', () => {
  beforeAll(() => {
    advanceTo(new Date('2023-11-23T12:00:00'));
  });

  afterAll(() => {
    clear();
  });

  let element: HTMLElement;

  beforeAll(() => {
    advanceTo(new Date('2023-10-20T12:00:00'));
  });

  afterAll(() => {
    clear();
  });

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

    element = renderWithProviders(
      <SnackbarProvider>
        <SiteMetrics />
      </SnackbarProvider>,
      { store },
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
