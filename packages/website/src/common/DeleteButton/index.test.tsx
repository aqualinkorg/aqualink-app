import React from 'react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';
import { renderWithProviders } from 'utils/test-utils';
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

    store.dispatch = rstest.fn();

    const dummyFunc = () =>
      new Promise<void>((resolve) => {
        resolve();
      });

    element = renderWithProviders(
      <DeleteButton onConfirm={dummyFunc} header="some text" />,
      { store },
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
