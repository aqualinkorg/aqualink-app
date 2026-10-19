import React from 'react';
import configureStore from 'redux-mock-store';
import { screen } from '@testing-library/react';
import { mockSite } from 'mocks/mockSite';
import { mockUser } from 'mocks/mockUser';
import { renderWithProviders } from 'utils/test-utils';
import SiteTable from '.';

vi.mock('./SelectedSiteCard', () => ({ default: 'Mock-SelectedSiteCard' }));

const mockStore = configureStore([]);

describe('SiteTable collection data', () => {
  it.each([false, true])(
    'renders collection rows independently of global map state (loading=%s)',
    (loading) => {
      const store = mockStore({
        user: { userInfo: mockUser },
        sitesList: {
          list: [],
          loading,
          error: null,
          filters: {},
          currentDate: '2024-03-15',
        },
        selectedSite: { loading: false, error: null },
        homepage: { siteOnMap: null },
      });
      store.dispatch = vi.fn();

      const collectionSite = { ...mockSite, id: 99, name: 'Collection Reef' };
      const { container } = renderWithProviders(
        <SiteTable
          showCard={false}
          showSiteFiltersDropdown={false}
          isExtended
          collection={{ name: 'My dashboard', sites: [collectionSite] }}
          scrollTableOnSelection={false}
          scrollPageOnSelection
        />,
        { store },
      );

      expect(screen.getByText('Collection Reef')).toBeInTheDocument();
      expect(screen.queryByText(/Loading map data/)).not.toBeInTheDocument();
      expect(container.querySelector('mock-circularprogress')).toBeNull();
    },
  );
});
