import React from 'react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';

import { renderWithProviders } from 'utils/test-utils';
import NewSurveyPointDialog from '.';

const mockStore = configureStore([]);

describe('NewSurveyPointDialog', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
    });

    store.dispatch = vi.fn();

    element = renderWithProviders(
      <NewSurveyPointDialog open siteId={1} onClose={vi.fn()} />,
      { store },
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
