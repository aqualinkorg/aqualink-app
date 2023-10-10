/* eslint-disable no-underscore-dangle */
import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import { mockUser } from 'mocks/mockUser';
import Map from '.';

jest.mock('react-leaflet');

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

    store.dispatch = jest.fn();

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
