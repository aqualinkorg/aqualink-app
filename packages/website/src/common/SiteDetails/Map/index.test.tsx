/* eslint-disable no-underscore-dangle */
import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import { mockUser } from 'mocks/mockUser';
import Map from '.';

rstest.mock('react-leaflet', () => ({
  MapContainer: 'mock-MapContainer',
  TileLayer: 'mock-TileLayer',
  Polygon: 'mock-Polygon',
  Marker: 'mock-Marker',
  Popup: 'mock-Popup',
  useMap: rstest.fn(),
}));

const mockStore = configureStore([]);

describe('Site Map', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
      selectedSite: {
        draft: null,
      },
    });

    store.dispatch = rstest.fn();

    element = render(
      <Provider store={store}>
        <Map
          polygon={{
            type: 'Polygon',
            coordinates: [[[0, 0]]],
          }}
          siteId={1}
          surveyPoints={[]}
        />
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
