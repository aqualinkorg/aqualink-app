import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';
import { SnackbarProvider } from 'notistack';
import { mockCollection } from 'mocks/mockCollection';
import MonthlyReport from '.';

const mockStore = configureStore([]);

describe('Monitoring MonthlyReport Page', () => {
  beforeAll(() => {
    rstest.useFakeTimers();
    rstest.setSystemTime(new Date('2023-11-23T12:00:00'));
  });

  afterAll(() => {
    rstest.useRealTimers();
  });

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

    element = render(
      <SnackbarProvider>
        <ReduxProvider store={store}>
          <BrowserRouter>
            <MonthlyReport />
          </BrowserRouter>
        </ReduxProvider>
      </SnackbarProvider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
