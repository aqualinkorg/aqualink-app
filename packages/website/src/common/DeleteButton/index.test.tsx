import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';
import DeleteButton from '.';

const mockStore = configureStore([]);

describe('Delete Button', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
    });

    store.dispatch = jest.fn();

    const dummyFunc = () => new Promise<void>((resolve) => resolve());

    element = render(
      <Provider store={store}>
        <DeleteButton onConfirm={dummyFunc} header="some text" />
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
