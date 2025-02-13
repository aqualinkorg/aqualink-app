import configureStore from 'redux-mock-store';
import { SurveyMedia } from 'store/Survey/types';
import { getSurveyPointsByName } from 'helpers/surveyMedia';
import { mockUser } from 'mocks/mockUser';
import { mockSurvey } from 'mocks/mockSurvey';
import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
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

    element = renderWithProviders(
      <MediaDetails siteId={mockSite.id} point={points[0]} />,
      { store },
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
