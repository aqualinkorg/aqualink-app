import React from 'react';
import configureStore from 'redux-mock-store';

import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
import Popup from '.';

jest.mock('react-leaflet', () => ({
  __esModule: true,
  useLeaflet: () => {
    return {
      map: jest.requireActual('react').createElement('mock-LeafletPopup', {}),
    };
  },
  Popup: (props: any) =>
    jest.requireActual('react').createElement('mock-LeafletPopup', props),
}));

const mockStore = configureStore([]);
describe('Popup', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      homepage: {
        siteOnMap: mockSite,
      },
    });

    store.dispatch = jest.fn();

    element = renderWithProviders(<Popup site={mockSite} />, {
      store,
    }).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
