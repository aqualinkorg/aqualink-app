import React from 'react';
import { Settings } from 'luxon';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import { mockUser } from 'mocks/mockUser';

import { mockSite } from 'mocks/mockSite';
import Homepage from '.';

vi.mock('common/NavBar', () => ({ default: 'Mock-NavBar' }));
vi.mock('./Map', () => ({ default: 'Mock-Map' }));
vi.mock('./SiteTable', () => ({ default: 'Mock-SiteTable' }));

const mockStore = configureStore([]);
describe('Homepage', () => {
  let element: HTMLElement;
  const originalNow = Settings.now;
  beforeEach(() => {
    // eslint-disable-next-line fp/no-mutation
    Settings.now = () => Date.UTC(2026, 0, 15);
    const store = mockStore({
      sitesList: {
        list: [mockSite],
        loading: false,
        error: null,
      },
      selectedSite: {
        details: mockSite,
      },
      homepage: {
        siteOnMap: null,
      },
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
    });

    store.dispatch = vi.fn();

    element = render(
      <Provider store={store}>
        <Router>
          <Homepage />
        </Router>
      </Provider>,
    ).container;
  });

  afterEach(() => {
    // eslint-disable-next-line fp/no-mutation
    Settings.now = originalNow;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
