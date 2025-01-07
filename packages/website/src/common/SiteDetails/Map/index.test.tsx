import configureStore from 'redux-mock-store';

import { mockUser } from 'mocks/mockUser';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import Map from '.';

const mockStore = configureStore([]);

describe('Site Map', () => {
  const store = mockStore({
    user: {
      userInfo: mockUser,
    },
    selectedSite: {
      draft: null,
    },
  });

  it('should render with given state from Redux store', () => {
    const { container } = render(
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
    );
    expect(container).toMatchSnapshot();
  });
});
