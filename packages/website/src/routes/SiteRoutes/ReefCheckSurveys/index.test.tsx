import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { RootState } from 'store/configure';
import { mockSite } from 'mocks/mockSite';
import { mockReefCheckSurvey } from 'mocks/mockReefCheckSurvey';
import { SelectedSiteState } from 'store/Sites/types';
import theme from 'layout/App/theme';
import * as navigation from 'next/navigation';
import { formatDate } from './ReefCheckSurveySummary';
import { ReefCheckSurveyViewPage } from '.';
import * as organismsTableModule from './ReefCheckSurveyOrganismsTable';
import * as substratesModule from './ReefCheckSurveySubstratesTable';

jest.mock('common/NavBar', () => 'Mock-NavBar');
jest.mock('./ReefCheckSurveyOrganismsTable');
jest.mock('./ReefCheckSurveySubstratesTable');

describe('ReefCheckSurveyViewPage', () => {
  const mockStore = configureStore([]);
  const scrollToSpy = jest
    .spyOn(window, 'scrollTo')
    .mockImplementation(() => null);
  const reefCheckSurveyOrganismsTableSpy = jest.spyOn(
    organismsTableModule,
    'ReefCheckSurveyOrganismsTable',
  );
  const useParamsSpy = jest
    .spyOn(navigation, 'useParams')
    .mockReturnValue({ id: '1', sid: '1' });

  const reefCheckSurveySubstratesTableSpy = jest.spyOn(
    substratesModule,
    'ReefCheckSurveySubstrates',
  );

  function renderReefCheckSurveyViewPage(error?: string) {
    const store = mockStore({
      selectedSite: { details: mockSite, error } as SelectedSiteState,
      reefCheckSurvey: {
        loading: false,
        survey: mockReefCheckSurvey,
      },
    } as Partial<RootState>);

    store.dispatch = jest.fn();
    const renderResult = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ReefCheckSurveyViewPage siteId="1" surveyId="1" />
        </ThemeProvider>
      </Provider>,
    );
    return { ...renderResult, store };
  }

  afterAll(() => {
    reefCheckSurveyOrganismsTableSpy.mockRestore();
    reefCheckSurveySubstratesTableSpy.mockRestore();
    useParamsSpy.mockRestore();
    scrollToSpy.mockRestore();
  });

  it('should dispatch reefCheckSurveyGetRequest and siteRequest on mount', () => {
    const { store } = renderReefCheckSurveyViewPage();

    expect(store.dispatch).toHaveBeenCalledTimes(2);
  });

  it('should render Not found if error is present in the store', () => {
    const { getByAltText } = renderReefCheckSurveyViewPage('error');

    expect(getByAltText('404 Not Found')).toBeInTheDocument();
  });

  it('should render the NavBar component', () => {
    const { container } = renderReefCheckSurveyViewPage();

    expect(container.querySelector('mock-navbar')).toBeInTheDocument();
  });

  it('should render a Button component with a link to the site page', () => {
    const { getByRole } = renderReefCheckSurveyViewPage();

    expect(getByRole('link', { name: 'Back to site' })).toHaveAttribute(
      'href',
      `/sites/${mockSite.id}`,
    );
  });

  describe('ReefCheckSurveySummary', () => {
    it('should render summary', () => {
      const { getByText, getByAltText } = renderReefCheckSurveyViewPage();
      const { reefName, region } = mockReefCheckSurvey.reefCheckSite ?? {};

      expect(
        getByText(formatDate(mockReefCheckSurvey.date)),
      ).toBeInTheDocument();
      expect(getByAltText('Reef Check Logo')).toBeInTheDocument();
      expect(getByText(reefName ?? '')).toBeInTheDocument();
      expect(getByText(region ?? '')).toBeInTheDocument();
      expect(
        getByText('Learn more about the data and how it’s collected'),
      ).toHaveAttribute(
        'href',
        'https://www.reefcheck.org/tropical-program/tropical-monitoring-instruction/',
      );
      expect(getByText('SATELLITE OBSERVATION')).toBeInTheDocument();
      expect(
        getByText(`${mockReefCheckSurvey.satelliteTemperature} °C`),
      ).toBeInTheDocument();
    });

    it.todo('should request to download data when button is clicked');
  });

  describe('ReefCheckSurveyDetails', () => {
    it('should render survey details', () => {
      const { getByText } = renderReefCheckSurveyViewPage();
      const { date } = mockReefCheckSurvey;
      const displayDate = new Date(date).toLocaleDateString();

      expect(
        getByText(`${displayDate} REEF CHECK SURVEY DATA`),
      ).toBeInTheDocument();
    });
  });

  describe('ReefCheckSurveyOrganismsTable', () => {
    beforeAll(() => renderReefCheckSurveyViewPage());

    it('should render fish table', () => {
      expect(reefCheckSurveyOrganismsTableSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Fish' }),
        expect.anything(),
      );
    });

    it('should render invertebrate table', () => {
      expect(reefCheckSurveyOrganismsTableSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Invertebrate' }),
        expect.anything(),
      );
    });

    it('should render impact table', () => {
      expect(reefCheckSurveyOrganismsTableSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Impact' }),
        expect.anything(),
      );
    });

    it('should render bleaching and coral diseases table', () => {
      expect(reefCheckSurveyOrganismsTableSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Bleaching and Coral Diseases' }),
        expect.anything(),
      );
    });

    it('should render rare animal table', () => {
      expect(reefCheckSurveyOrganismsTableSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Rare Animal' }),
        expect.anything(),
      );
    });

    it('should render reef structure and composition table', () => {
      expect(reefCheckSurveySubstratesTableSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Reef Structure and Composition' }),
        expect.anything(),
      );
    });
  });
});
