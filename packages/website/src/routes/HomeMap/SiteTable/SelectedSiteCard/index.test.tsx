import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';

import { mockSite } from 'mocks/mockSite';
import SelectedSiteCard from '.';

const site = {
  details: mockSite,
};

const mockStore = configureStore([]);

const store = mockStore({
  selectedSite: site,
  homepage: {
    siteOnMap: site,
  },
  surveyList: {
    list: [],
  },
  survey: {
    selectedSurvey: {
      details: null,
    },
  },
});

store.dispatch = jest.fn();

test('renders as expected', () => {
  process.env.REACT_APP_FEATURED_SITE_ID = '2';

  const { container } = render(
    <Provider store={store}>
      <Router>
        <SelectedSiteCard />
      </Router>
    </Provider>,
  );
  expect(container).toMatchSnapshot();
});

test('renders loading as expected', () => {
  process.env.REACT_APP_FEATURED_SITE_ID = '4';
  const { container } = render(
    <Provider store={store}>
      <Router>
        <SelectedSiteCard />
      </Router>
    </Provider>,
  );
  expect(container).toMatchSnapshot();
});
