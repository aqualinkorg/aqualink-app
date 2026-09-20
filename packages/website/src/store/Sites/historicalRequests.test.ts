import sitesListReducer, { sitesRequest } from './sitesListSlice';
import selectedSiteReducer, { siteRequest } from './selectedSiteSlice';
import type { SitesListState, SelectedSiteState } from './types';
import { mockSite } from '../../mocks/mockSite';

describe('sitesList request race guards', () => {
  const initialState: SitesListState = {
    loading: false,
    error: null,
    filters: {},
  };

  it('discards a response that is superseded by a newer request', () => {
    let state = sitesListReducer(
      initialState,
      sitesRequest.pending('req-1', { date: '2024-04-15' }),
    );
    state = sitesListReducer(
      state,
      sitesRequest.pending('req-2', { date: '2024-04-16' }),
    );
    expect(state.currentRequestId).toBe('req-2');

    // A late response from the older request must not overwrite the list
    state = sitesListReducer(
      state,
      sitesRequest.fulfilled(
        { list: [mockSite], date: '2024-04-15' },
        'req-1',
        { date: '2024-04-15' },
      ),
    );
    expect(state.list).toBeUndefined();
    expect(state.loading).toBe(true);

    state = sitesListReducer(
      state,
      sitesRequest.fulfilled(
        { list: [mockSite], date: '2024-04-16' },
        'req-2',
        { date: '2024-04-16' },
      ),
    );
    expect(state.list).toEqual([mockSite]);
    expect(state.date).toBe('2024-04-16');
    expect(state.loading).toBe(false);
    expect(state.currentRequestId).toBeUndefined();
  });

  it('stores the requested date on fulfill', () => {
    const state = sitesListReducer(
      sitesListReducer(initialState, sitesRequest.pending('req-1', undefined)),
      sitesRequest.fulfilled({ list: [], date: undefined }, 'req-1', undefined),
    );
    expect(state.date).toBeUndefined();
    expect(state.list).toEqual([]);
  });
});

describe('selectedSite request race guards', () => {
  const initialState: SelectedSiteState = {
    draft: null,
    loading: false,
    loadingSpotterPosition: 0,
    timeSeriesDataLoading: false,
    timeSeriesDataRangeLoading: false,
    latestOceanSenseDataLoading: false,
    contactInfoLoading: false,
    latestOceanSenseDataError: null,
    oceanSenseDataLoading: false,
    oceanSenseDataError: null,
    error: null,
  };

  it('discards a stale site response after a newer request started', () => {
    const arg1 = { id: '1', date: '2024-04-15' };
    const arg2 = { id: '1', date: '2024-04-16' };

    let state = selectedSiteReducer(
      initialState,
      siteRequest.pending('req-1', arg1),
    );
    state = selectedSiteReducer(state, siteRequest.pending('req-2', arg2));

    state = selectedSiteReducer(
      state,
      siteRequest.fulfilled(mockSite, 'req-1', arg1),
    );
    expect(state.details).toBeUndefined();

    state = selectedSiteReducer(
      state,
      siteRequest.fulfilled(mockSite, 'req-2', arg2),
    );
    expect(state.details).toEqual(mockSite);
    expect(state.date).toBe('2024-04-16');
  });
});
