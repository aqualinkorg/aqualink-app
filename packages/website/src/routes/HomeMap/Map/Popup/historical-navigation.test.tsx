import React from 'react';
import { screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
import Popup from '.';
import SelectedSiteCardContent from '../../SiteTable/SelectedSiteCard/CardContent';

vi.mock('common/Chart', () => ({ default: () => <div>Historical chart</div> }));

vi.mock('react-leaflet', () => ({
  useMap: () => ({}),
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

it('keeps the historical date on the popup Explore link and identifies empty data', () => {
  const store = configureStore([])({ homepage: { siteOnMap: null } });
  renderWithProviders(
    <Popup
      autoOpen={false}
      site={{
        ...mockSite,
        historicalDate: '2024-01-02',
        historicalObservedAt: null,
        collectionData: {},
      }}
    />,
    { store },
  );
  expect(screen.getByRole('link', { name: /explore/i })).toHaveAttribute(
    'href',
    '/sites/1?date=2024-01-02',
  );
  expect(screen.getByText(/2024-01-02.*No daily data/)).toBeInTheDocument();
});

it('keeps the historical date on the selected card Explore link', () => {
  renderWithProviders(
    <SelectedSiteCardContent
      site={{
        ...mockSite,
        historicalDate: '2024-01-02',
        historicalObservedAt: '2024-01-02T23:59:59.999Z',
      }}
      imageUrl="https://example.test/survey.jpg"
      loading={false}
      error={null}
    />,
  );
  expect(screen.getByRole('link', { name: /explore/i })).toHaveAttribute(
    'href',
    '/sites/1?date=2024-01-02',
  );
  expect(screen.queryByText('LIVE VIDEO')).not.toBeInTheDocument();
});
