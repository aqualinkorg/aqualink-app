import { render } from '@testing-library/react';
import { mockReefCheckSurvey } from 'mocks/mockReefCheckSurvey';
import { ReefCheckSurvey } from 'store/ReefCheckSurveys';
import { ThemeProvider } from '@mui/material';
import theme from 'layout/App/theme';
import { ReefCheckSurveyCard } from '.';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/sites/1'),
}));

describe('ReefCheckSurveyCard', () => {
  function renderReefCheckSurveyCard(overrides: Partial<ReefCheckSurvey> = {}) {
    return render(
      <ThemeProvider theme={theme}>
        <ReefCheckSurveyCard
          survey={{ ...mockReefCheckSurvey, ...overrides }}
        />
      </ThemeProvider>,
    );
  }

  it('should render correctly', () => {
    const { getByText } = renderReefCheckSurveyCard();

    expect(
      getByText(`Date: ${new Date(mockReefCheckSurvey.date).toLocaleString()}`),
    ).toBeInTheDocument();
    expect(
      getByText(`Depth: ${mockReefCheckSurvey.depth}m`),
    ).toBeInTheDocument();
    expect(getByText('Reef Check')).toBeInTheDocument();
  });

  it('should render team leader if present', () => {
    const { getByText } = renderReefCheckSurveyCard({
      teamLeader: 'Test User',
    });
    expect(getByText('Test User, Reef Check')).toBeInTheDocument();
  });

  it('should render table with correct number of rows', () => {
    const { container } = renderReefCheckSurveyCard();

    expect(container.querySelectorAll('mock-tablerow').length).toBe(3);
  });

  it('should show correct counts in headers', () => {
    const { container } = renderReefCheckSurveyCard();
    const headers = [
      ...container.querySelectorAll('mock-tablehead mock-tablecell').values(),
    ].map((el) => el.textContent);
    expect(headers).toEqual(
      expect.arrayContaining([
        'FISH (2)',
        'Count',
        'INVERTEBRATES (2)',
        'Count',
        'BLEACHING AND CORAL DISEASES',
        'YES/NO',
        'IMPACT',
        'YES/NO',
      ]),
    );
  });

  it('should display link to survey details', () => {
    const { getByRole } = renderReefCheckSurveyCard();

    expect(getByRole('link', { name: 'VIEW DETAILS' })).toHaveAttribute(
      'href',
      `/sites/1/reef_check_survey/${mockReefCheckSurvey.id}`,
    );
  });
});
