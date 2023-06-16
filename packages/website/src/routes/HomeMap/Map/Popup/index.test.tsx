import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import { BrowserRouter as Router } from 'react-router-dom';
import { mockSite } from 'mocks/mockSite';
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

    element = render(
      <Provider store={store}>
        <Router>
          <Popup site={mockSite} />
        </Router>
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
