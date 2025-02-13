import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';

import { renderWithProviders } from 'utils/test-utils';
import Buoy from '.';

jest.mock('common/NavBar', () => 'Mock-NavBar');
jest.mock('common/Footer', () => 'Mock-Footer');

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

    store.dispatch = jest.fn();

    element = renderWithProviders(<Buoy />).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
