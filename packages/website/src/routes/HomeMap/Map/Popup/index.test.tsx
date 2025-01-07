import configureStore from 'redux-mock-store';

import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
import Popup from '.';

describe('Popup', () => {
  const mockStore = configureStore([]);
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
