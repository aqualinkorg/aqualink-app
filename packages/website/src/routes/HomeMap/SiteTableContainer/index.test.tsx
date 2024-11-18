import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { mockSite } from 'mocks/mockSite';
import { mockUser } from 'mocks/mockUser';
import SiteTableContainer from '.';

jest.mock('./SelectedSiteCard', () => 'Mock-SelectedSiteCard');

const mockStore = configureStore([]);

describe('SiteTableContainer', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
      sitesList: {
        list: [mockSite],
        sitesToDisplay: [mockSite],
        loading: false,
        error: null,
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

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <SiteTableContainer isDrawerOpen={openDrawer} />
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
