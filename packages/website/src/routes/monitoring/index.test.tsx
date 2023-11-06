import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';
import { SnackbarProvider } from 'notistack';
import { mockCollection } from 'mocks/mockCollection';
import { advanceTo, clear } from 'jest-date-mock';
import MonitoringPage from '.';

const mockStore = configureStore([]);

jest.mock('@material-ui/pickers', () => ({
  __esModule: true,
  KeyboardDatePicker: 'mock-KeyboardDatePicker',
  KeyboardDatePickerProps: 'mock-KeyboardDatePickerProps',
  MuiPickersUtilsProvider: 'mock-MuiPickersUtilsProvider',
}));

describe('Landing Page', () => {
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

    element = render(
      <SnackbarProvider>
        <ReduxProvider store={store}>
          <BrowserRouter>
            <MonitoringPage />
          </BrowserRouter>
        </ReduxProvider>
      </SnackbarProvider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
