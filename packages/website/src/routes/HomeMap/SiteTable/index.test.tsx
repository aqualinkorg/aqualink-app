import React from 'react';
import configureStore from 'redux-mock-store';

import { mockSite } from 'mocks/mockSite';
import { mockUser } from 'mocks/mockUser';
import { renderWithProviders } from 'utils/test-utils';
import SiteTable from '.';

vi.mock('./SelectedSiteCard', () => ({ default: 'Mock-SelectedSiteCard' }));

const mockStore = configureStore([]);

describe('SiteTable', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
      sitesList: {
        list: [mockSite],
        loading: false,
        error: null,
        filters: {},
      },
      selectedSite: {
        loading: false,
        error: null,
      },
      homepage: {
        siteOnMap: null,
      },
    });

    const openDrawer = false;

    store.dispatch = vi.fn();

    element = renderWithProviders(<SiteTable isDrawerOpen={openDrawer} />, {
      store,
    }).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
