import React from 'react';
import configureStore from 'redux-mock-store';

import { mockSite } from 'mocks/mockSite';
import { mockUser } from 'mocks/mockUser';
import { renderWithProviders } from 'utils/test-utils';
import SiteInfo from '.';

const mockStore = configureStore([]);

describe('SiteInfo', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
      sitesList: {
        list: [mockSite],
      },
      selectedSite: {
        contactInfoLoading: false,
        loading: false,
        error: null,
      },
    });
    store.dispatch = vi.fn();

    element = renderWithProviders(
      <SiteInfo
        site={mockSite}
        isAdmin
        lastSurvey="2020-09-10T10:27:00.000Z"
      />,
      { store },
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
