import React from 'react';
import configureStore from 'redux-mock-store';

import { mockSurveyList } from 'mocks/mockSurveyList';
import { renderWithProviders } from 'utils/test-utils';
import Timeline from '.';

const mockStore = configureStore([]);

describe('SiteRoutes Surveys', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      surveyList: {
        list: [mockSurveyList],
        loading: false,
        error: null,
      },
    });

    store.dispatch = rstest.fn();

    element = renderWithProviders(
      <Timeline
        isAdmin={false}
        siteId={0}
        observation="any"
        pointId={0}
        pointName="Test Point"
        addNewButton
      />,
      { store },
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
