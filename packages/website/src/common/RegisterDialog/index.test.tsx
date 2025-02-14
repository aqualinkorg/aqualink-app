import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';

import RegisterDialog from '.';

const mockStore = configureStore([]);

describe('RegisterDialog', () => {
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

    element = render(
      <Provider store={store}>
        <RegisterDialog
          open
          handleRegisterOpen={jest.fn}
          handleSignInOpen={jest.fn}
        />
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
