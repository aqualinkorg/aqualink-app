import React from 'react';
import configureStore from 'redux-mock-store';
import { screen } from '@testing-library/react';
import { mockSite } from 'mocks/mockSite';
import { mockCollection } from 'mocks/mockCollection';
import { renderWithProviders } from 'utils/test-utils';
import sitesListReducer, { sitesRequest } from 'store/Sites/sitesListSlice';
import type { SitesListState } from 'store/Sites/types';
import { SiteMarkers } from '.';

vi.mock('./SiteMarker', () => ({
  CircleSiteMarker: ({ site }: { site: { name: string } }) => (
    <span data-testid="map-marker">{site.name}</span>
  ),
  SensorSiteMarker: ({ site }: { site: { name: string } }) => (
    <span data-testid="map-marker">{site.name}</span>
  ),
}));

describe('historical map markers', () => {
  const oldDate = '2025-01-01';
  const requestedDate = '2025-02-01';
  const initial: SitesListState = {
    list: [{ ...mockSite, name: 'Old date marker' }],
    filters: {},
    loading: false,
    currentDate: oldDate,
  };
  it('does not render stale markers when a historical date request fails', () => {
    let state = sitesListReducer(
      initial,
      sitesRequest.pending('new-request', requestedDate),
    );
    state = sitesListReducer(
      state,
      sitesRequest.rejected(new Error('offline'), 'new-request', requestedDate),
    );
    expect(state.error).toBe('offline');
    expect(state.loading).toBe(false);
    expect(state.currentDate).toBe(oldDate);

    const store = configureStore([])({ sitesList: state });
    renderWithProviders(<SiteMarkers historicalDate={requestedDate} />, {
      store,
    });
    expect(screen.queryByTestId('map-marker')).not.toBeInTheDocument();
  });

  it('does not render a historical list as latest after a failed request', () => {
    let state = sitesListReducer(
      initial,
      sitesRequest.pending('latest-request', undefined),
    );
    state = sitesListReducer(
      state,
      sitesRequest.rejected(new Error('offline'), 'latest-request', undefined),
    );
    const store = configureStore([])({ sitesList: state });

    renderWithProviders(<SiteMarkers />, { store });
    expect(screen.queryByTestId('map-marker')).not.toBeInTheDocument();
  });

  it('renders markers for the selected historical date when loaded', () => {
    const state = { ...initial, currentDate: requestedDate };
    const store = configureStore([])({ sitesList: state });
    renderWithProviders(<SiteMarkers historicalDate={requestedDate} />, {
      store,
    });
    expect(screen.getByTestId('map-marker')).toHaveTextContent(
      'Old date marker',
    );
  });

  it('continues rendering current markers without a historical date', () => {
    const currentState = { ...initial, currentDate: undefined };
    const store = configureStore([])({ sitesList: currentState });
    renderWithProviders(<SiteMarkers />, { store });
    expect(screen.getByTestId('map-marker')).toHaveTextContent(
      'Old date marker',
    );
  });

  it('renders collection sites independently of the global sites-list date', () => {
    let state = sitesListReducer(
      initial,
      sitesRequest.pending('historical-request', requestedDate),
    );
    state = sitesListReducer(
      state,
      sitesRequest.rejected(
        new Error('offline'),
        'historical-request',
        requestedDate,
      ),
    );
    const store = configureStore([])({ sitesList: state });

    const collection = {
      ...mockCollection,
      sites: [{ ...mockCollection.sites[0], name: 'Collection marker' }],
    };
    renderWithProviders(<SiteMarkers collection={collection} />, { store });

    expect(screen.getByTestId('map-marker')).toHaveTextContent(
      'Collection marker',
    );
  });
});
