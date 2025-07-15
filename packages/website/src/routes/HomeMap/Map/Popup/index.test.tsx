import React from 'react';
import configureStore from 'redux-mock-store';

import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
import Popup from '.';
import { vi } from 'vitest';

vi.mock('react-leaflet', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useMap: () => ({
      setView: vi.fn(),
      getCenter: () => ({ lat: 0, lng: 0 }),
      // add more mock methods if needed
    }),
    Popup: (props: any) => React.createElement('mock-LeafletPopup', props),
  };
});

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
