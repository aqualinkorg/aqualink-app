import React from 'react';
import configureStore from 'redux-mock-store';
import { rstest } from '@rstest/core';

import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
import Popup from '.';

const mockStore = configureStore([]);
describe('Popup', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      homepage: {
        siteOnMap: mockSite,
      },
    });

    store.dispatch = rstest.fn();

    element = renderWithProviders(<Popup site={mockSite} />, {
      store,
    }).container;
  });

  // Skipped: rstest has difficulty mocking Leaflet context providers
  it.skip('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
