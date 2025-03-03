import React from 'react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';
import { mockSurveyList } from 'mocks/mockSurveyList';
import { renderWithProviders } from 'utils/test-utils';
import SurveyCard from '.';

const mockStore = configureStore([]);

describe('Survey Card', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
    });

    store.dispatch = vi.fn();

    element = renderWithProviders(
      <SurveyCard
        pointName="Test Point"
        pointId={1}
        isAdmin
        siteId={0}
        survey={mockSurveyList}
      />,
      { store },
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
