import React from 'react';
import configureStore from 'redux-mock-store';

import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
import Popup from '.';

vi.mock('react-leaflet', () => ({
  useLeaflet: () => {
    return {
      map: React.createElement('mock-LeafletPopup', {}),
    };
  },
  Popup: (props: any) => React.createElement('mock-LeafletPopup', props),
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

    store.dispatch = vi.fn();

    element = renderWithProviders(<Popup site={mockSite} />, {
      store,
    }).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
