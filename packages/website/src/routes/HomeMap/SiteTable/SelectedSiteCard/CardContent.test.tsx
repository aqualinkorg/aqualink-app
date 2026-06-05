import React from 'react';
import { screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
import SelectedSiteCardContent from './CardContent';

const historicalDate = '2026-05-31T23:59:59.999Z';
const mockStore = configureStore([]);
const store = mockStore({
  survey: {
    selectedSurvey: {
      details: null,
    },
  },
});

store.dispatch = vi.fn();

describe('SelectedSiteCardContent', () => {
  test('preserves the selected historical date in site links', () => {
    renderWithProviders(
      <SelectedSiteCardContent
        site={mockSite}
        loading={false}
        historicalDate={historicalDate}
        imageUrl="https://example.com/site.jpg"
      />,
      { store },
    );

    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toContain(
      `/sites/${mockSite.id}?date=${encodeURIComponent(historicalDate)}`,
    );
  });

  test('shows historical daily metrics when a historical date is selected', () => {
    renderWithProviders(
      <SelectedSiteCardContent
        site={mockSite}
        loading={false}
        historicalDate={historicalDate}
      />,
      { store },
    );

    expect(screen.getByText('As of:')).toBeInTheDocument();
    expect(screen.getByText('23.0')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('38.0')).toBeInTheDocument();
    expect(screen.queryByText('15.9')).not.toBeInTheDocument();
  });
});
