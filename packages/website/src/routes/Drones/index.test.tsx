import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';

import Drones from '.';

jest.mock('common/NavBar', () => 'Mock-NavBar');
jest.mock('common/Footer', () => 'Mock-Footer');

const mockStore = configureStore([]);
describe('Drones', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
      sitesList: {
        list: [],
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Drones />
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
