import React from 'react';
import configureStore from 'redux-mock-store';

import { mockUser } from 'mocks/mockUser';
import { renderWithProviders } from 'utils/test-utils';
import FeaturedMedia from '.';

const mockStore = configureStore([]);

describe('Featured Media Card', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      reefCheckSurveyList: {
        list: [],
      },
      user: {
        userInfo: mockUser,
      },
    });

    store.dispatch = vi.fn();

    element = renderWithProviders(<FeaturedMedia siteId={1} url={null} />, {
      store,
    }).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
