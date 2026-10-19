import { describe, expect, it } from 'vitest';
import type { SelectedSiteState, Site } from './types';
import selectedSiteReducer, {
  shouldFetchSiteRequest,
  siteRequest,
} from './selectedSiteSlice';

const detailsFor = (id: number) => ({ id }) as Site;

describe('historical site detail requests', () => {
  it('allows retry after a failed date request', () => {
    const requestedDate = '2025-02-01';
    let state = selectedSiteReducer(
      undefined,
      siteRequest.pending('failed-request', {
        id: '1',
        date: requestedDate,
      }),
    );
    state = selectedSiteReducer(
      state,
      siteRequest.rejected(new Error('offline'), 'failed-request', {
        id: '1',
        date: requestedDate,
      }),
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe('offline');
    expect(shouldFetchSiteRequest('1', requestedDate, state)).toBe(true);
  });

  it('ignores an older date response after a faster date switch', () => {
    const dateA = '2025-01-01';
    const dateB = '2025-02-01';
    const dateC = '2025-03-01';
    const initialState: SelectedSiteState = {
      details: detailsFor(1),
      currentDate: dateA,
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
    let state = selectedSiteReducer(
      initialState,
      siteRequest.pending('request-b', { id: '1', date: dateB }),
    );
    state = selectedSiteReducer(
      state,
      siteRequest.pending('request-c', { id: '1', date: dateC }),
    );
    state = selectedSiteReducer(
      state,
      siteRequest.fulfilled(detailsFor(1), 'request-b', {
        id: '1',
        date: dateB,
      }),
    );

    expect(state.currentDate).toBe(dateA);
    expect(state.details).toEqual(detailsFor(1));
    expect(state.loading).toBe(true);

    state = selectedSiteReducer(
      state,
      siteRequest.fulfilled(detailsFor(1), 'request-c', {
        id: '1',
        date: dateC,
      }),
    );

    expect(state.currentDate).toBe(dateC);
    expect(state.loading).toBe(false);
    expect(shouldFetchSiteRequest('1', undefined, state)).toBe(true);
    expect(shouldFetchSiteRequest('1', dateC, state)).toBe(false);
  });

  it('replaces an in-flight date request when switching back to cached date', () => {
    const cachedDate = '2025-01-01';
    const requestedDate = '2025-02-01';
    const initialState: SelectedSiteState = {
      details: detailsFor(1),
      currentDate: cachedDate,
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
    const pending = selectedSiteReducer(
      initialState,
      siteRequest.pending('request-b', { id: '1', date: requestedDate }),
    );

    expect(shouldFetchSiteRequest('1', cachedDate, pending)).toBe(true);

    let state = selectedSiteReducer(
      pending,
      siteRequest.pending('request-a', { id: '1', date: cachedDate }),
    );
    state = selectedSiteReducer(
      state,
      siteRequest.fulfilled(detailsFor(1), 'request-b', {
        id: '1',
        date: requestedDate,
      }),
    );
    expect(state.loading).toBe(true);
    expect(state.currentDate).toBe(cachedDate);

    state = selectedSiteReducer(
      state,
      siteRequest.fulfilled(detailsFor(1), 'request-a', {
        id: '1',
        date: cachedDate,
      }),
    );
    expect(state.loading).toBe(false);
    expect(state.currentDate).toBe(cachedDate);
  });
});
