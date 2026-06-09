import React from 'react';
import { render } from '@testing-library/react';
import { mockReefCheckSurvey } from 'mocks/mockReefCheckSurvey';
import { ReefCheckSurvey } from 'store/ReefCheckSurveys';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import theme from 'layout/App/theme';
import { formatReefCheckSurveyDate } from 'routes/SiteRoutes/ReefCheckSurveys/ReefCheckSurveySummary';
import { ReefCheckSurveyCard } from '.';

describe('ReefCheckSurveyCard', () => {
  function renderReefCheckSurveyCard(overrides: Partial<ReefCheckSurvey> = {}) {
    return render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <ReefCheckSurveyCard
            survey={{ ...mockReefCheckSurvey, ...overrides }}
          />
        </BrowserRouter>
      </ThemeProvider>,
    );
  }

  it('should render correctly', () => {
    const { getByText } = renderReefCheckSurveyCard();

    expect(
      getByText(`Date: ${formatReefCheckSurveyDate(mockReefCheckSurvey.date)}`),
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

    expect(container.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('should show correct counts in headers', () => {
    const { container } = renderReefCheckSurveyCard();
    const headers = [...container.querySelectorAll('thead th').values()].map(
      (el) => el.textContent,
    );
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
      `/reef_check_survey/${mockReefCheckSurvey.id}`,
    );
  });
});
