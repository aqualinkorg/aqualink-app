import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { SurveyMedia } from 'store/Survey/types';
import { getSurveyPointsByName } from 'helpers/surveyMedia';
import { mockUser } from 'mocks/mockUser';
import { mockSurvey } from 'mocks/mockSurvey';
import { mockSite } from 'mocks/mockSite';
import MediaDetails from '.';

const mockStore = configureStore([]);

describe('Terms page', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
      survey: {
        selectedSurvey: {
          details: mockSurvey,
        },
      },
      selectedSite: {
        details: mockSite,
      },
    });

    const points = getSurveyPointsByName(
      mockSurvey.surveyMedia as unknown as SurveyMedia[],
    );

    element = render(
      <Provider store={store}>
        <Router>
          <MediaDetails siteId={mockSite.id} point={points[0]} />
        </Router>
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
