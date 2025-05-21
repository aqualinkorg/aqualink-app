import React from 'react';
import configureStore from 'redux-mock-store';

import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
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

store.dispatch = vi.fn();

test('renders as expected', () => {
  process.env.REACT_APP_FEATURED_SITE_ID = '2';

  const { container } = renderWithProviders(<SelectedSiteCard />, { store });
  expect(container).toMatchSnapshot();
});

test('renders loading as expected', () => {
  process.env.REACT_APP_FEATURED_SITE_ID = '4';
  const { container } = renderWithProviders(<SelectedSiteCard />, { store });
  expect(container).toMatchSnapshot();
});
