import { Provider as ReduxProvider } from 'react-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';
import { SnackbarProvider } from 'notistack';
import { mockCollection } from 'mocks/mockCollection';
import { advanceTo, clear } from 'jest-date-mock';
import SurveysReport from '.';

const mockStore = configureStore([]);

describe('Monitoring SurveysReport Page', () => {
  beforeAll(() => {
    advanceTo(new Date('2023-11-23T12:00:00'));
  });

  afterAll(() => {
    clear();
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

    store.dispatch = jest.fn();

    element = render(
      <SnackbarProvider>
        <ReduxProvider store={store}>
          <SurveysReport />
        </ReduxProvider>
      </SnackbarProvider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
