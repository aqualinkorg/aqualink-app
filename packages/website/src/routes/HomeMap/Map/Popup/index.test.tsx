import React from 'react';
import configureStore from 'redux-mock-store';
import { vi } from 'vitest';

import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
import Popup from '.';

const { mockMap, mockPopupInstance } = vi.hoisted(() => {
  const openOn = vi.fn();
  const setLatLng = vi.fn(() => ({ openOn }));
  return {
    mockPopupInstance: { setLatLng, openOn },
    mockMap: {
      on: vi.fn(),
      off: vi.fn(),
      once: vi.fn(),
      setView: vi.fn(),
      getCenter: () => ({ lat: 0, lng: 0 }),
    },
  };
});

vi.mock('react-leaflet', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useMap: () => mockMap,
    Popup: React.forwardRef((props: any, ref) => {
      React.useImperativeHandle(ref, () => mockPopupInstance);
      return React.createElement('mock-LeafletPopup', props);
    }),
  };
});

const mockStore = configureStore([]);
describe('Popup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with given state from Redux store', () => {
    const store = mockStore({
      homepage: {
        siteOnMap: mockSite,
      },
    });
    store.dispatch = vi.fn();

    const { container } = renderWithProviders(<Popup site={mockSite} />, {
      store,
    });
    expect(container).toMatchSnapshot();
  });

  it('opens the popup when the site is selected and reopens it after flyToBounds moveend', () => {
    const store = mockStore({
      homepage: {
        siteOnMap: { ...mockSite, displayLng: 12.5 },
      },
    });
    store.dispatch = vi.fn();

    const { unmount } = renderWithProviders(<Popup site={mockSite} />, {
      store,
    });

    expect(mockPopupInstance.setLatLng).toHaveBeenCalledWith([
      mockSite.polygon.coordinates[1],
      12.5,
    ]);
    expect(mockPopupInstance.openOn).toHaveBeenCalledWith(mockMap);
    expect(mockMap.on).toHaveBeenCalledWith('moveend', expect.any(Function));

    mockPopupInstance.setLatLng.mockClear();
    mockPopupInstance.openOn.mockClear();

    const moveEndHandler = mockMap.on.mock.calls.find(
      ([eventName]) => eventName === 'moveend',
    )?.[1];
    expect(moveEndHandler).toEqual(expect.any(Function));
    moveEndHandler();

    expect(mockPopupInstance.setLatLng).toHaveBeenCalledWith([
      mockSite.polygon.coordinates[1],
      12.5,
    ]);
    expect(mockPopupInstance.openOn).toHaveBeenCalledWith(mockMap);

    unmount();
    expect(mockMap.off).toHaveBeenCalledWith('moveend', moveEndHandler);
  });

  it('does not auto-open when autoOpen is false', () => {
    const store = mockStore({
      homepage: {
        siteOnMap: mockSite,
      },
    });
    store.dispatch = vi.fn();

    renderWithProviders(<Popup site={mockSite} autoOpen={false} />, { store });

    expect(mockPopupInstance.openOn).not.toHaveBeenCalled();
    expect(mockMap.on).not.toHaveBeenCalled();
  });
});
