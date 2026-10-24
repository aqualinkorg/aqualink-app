import { describe, expect, it } from 'vitest';
import type { SitesListState } from './types';
import sitesListReducer, {
  shouldFetchSitesRequest,
  sitesRequest,
} from './sitesListSlice';

const siteWithId = (id: number) =>
  ({ id }) as NonNullable<SitesListState['list']>[number];

describe('historical sites requests', () => {
  it('refetches the current date when a different date is in flight', () => {
    const dateA = '2025-01-01';
    const dateB = '2025-02-01';
    const initialState: SitesListState = {
      list: [],
      filters: {},
      loading: false,
      currentDate: dateA,
    };

    expect(shouldFetchSitesRequest(dateA, initialState)).toBe(false);

    let state = sitesListReducer(
      initialState,
      sitesRequest.pending('request-b', dateB),
    );
    expect(shouldFetchSitesRequest(dateA, state)).toBe(true);
    expect(shouldFetchSitesRequest(undefined, state)).toBe(true);

    state = sitesListReducer(state, sitesRequest.pending('request-a', dateA));
    state = sitesListReducer(
      state,
      sitesRequest.fulfilled({ list: [] }, 'request-b', dateB),
    );

    expect(state.requestId).toBe('request-a');
    expect(state.requestDate).toBe(dateA);
    expect(state.loading).toBe(true);

    state = sitesListReducer(
      state,
      sitesRequest.fulfilled({ list: [] }, 'request-a', dateA),
    );
    expect(state.currentDate).toBe(dateA);
    expect(state.requestDate).toBeUndefined();
  });

  it('clears request state and reports errors for the active request', () => {
    const date = '2025-03-01';
    const priorDate = '2025-02-01';
    const initialState: SitesListState = {
      list: [siteWithId(1)],
      filters: {},
      loading: false,
      currentDate: priorDate,
    };
    let state = sitesListReducer(
      initialState,
      sitesRequest.pending('failed-request', date),
    );
    state = sitesListReducer(
      state,
      sitesRequest.rejected(new Error('offline'), 'failed-request', date),
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe('offline');
    expect(state.requestId).toBeUndefined();
    expect(state.requestDate).toBeUndefined();
    expect(state.currentDate).toBe(priorDate);
    expect(state.list).toEqual(initialState.list);
    expect(shouldFetchSitesRequest(date, state)).toBe(true);
    expect(shouldFetchSitesRequest(undefined, state)).toBe(true);
  });

  it('refetches a cached date after another date fails', () => {
    const dateA = '2025-01-01';
    const dateB = '2025-02-01';
    const initialState: SitesListState = {
      list: [siteWithId(1)],
      filters: {},
      loading: false,
      currentDate: dateA,
    };
    let state = sitesListReducer(
      initialState,
      sitesRequest.pending('request-b', dateB),
    );
    state = sitesListReducer(
      state,
      sitesRequest.rejected(new Error('offline'), 'request-b', dateB),
    );

    expect(state.error).toBe('offline');
    expect(shouldFetchSitesRequest(dateA, state)).toBe(true);

    state = sitesListReducer(state, sitesRequest.pending('request-a', dateA));
    state = sitesListReducer(
      state,
      sitesRequest.fulfilled({ list: [siteWithId(2)] }, 'request-b', dateB),
    );
    expect(state.requestId).toBe('request-a');
    expect(state.error).toBeNull();

    state = sitesListReducer(
      state,
      sitesRequest.fulfilled({ list: [siteWithId(1)] }, 'request-a', dateA),
    );
    expect(state.currentDate).toBe(dateA);
    expect(state.list?.map((site) => site.id)).toEqual([1]);
    expect(state.error).toBeNull();
  });

  it('allows a cached historical date to supersede a latest request', () => {
    const dateA = '2025-01-01';
    const initialState: SitesListState = {
      list: [siteWithId(1)],
      filters: {},
      loading: false,
      currentDate: dateA,
    };
    let state = sitesListReducer(
      initialState,
      sitesRequest.pending('latest-request', undefined),
    );

    expect(shouldFetchSitesRequest(dateA, state)).toBe(true);
    state = sitesListReducer(
      state,
      sitesRequest.pending('historical-request', dateA),
    );
    state = sitesListReducer(
      state,
      sitesRequest.fulfilled(
        { list: [siteWithId(2)] },
        'latest-request',
        undefined,
      ),
    );
    expect(state.requestId).toBe('historical-request');
    expect(state.currentDate).toBe(dateA);
    expect(state.loading).toBe(true);

    state = sitesListReducer(
      state,
      sitesRequest.fulfilled(
        { list: [siteWithId(1)] },
        'historical-request',
        dateA,
      ),
    );
    expect(state.currentDate).toBe(dateA);
    expect(state.list?.map((site) => site.id)).toEqual([1]);
    expect(state.loading).toBe(false);
  });

  it('does not let an earlier historical response replace the latest selection', () => {
    const dateA = '2025-01-01';
    const dateB = '2025-02-01';
    const dateC = '2025-03-01';
    const initialState: SitesListState = {
      list: [],
      filters: {},
      loading: false,
      currentDate: dateA,
    };

    let state = sitesListReducer(
      initialState,
      sitesRequest.pending('request-b', dateB),
    );
    state = sitesListReducer(state, sitesRequest.pending('request-c', dateC));
    state = sitesListReducer(
      state,
      sitesRequest.fulfilled({ list: [siteWithId(2)] }, 'request-b', dateB),
    );

    expect(state.requestId).toBe('request-c');
    expect(state.currentDate).toBe(dateA);
    expect(state.loading).toBe(true);

    state = sitesListReducer(
      state,
      sitesRequest.fulfilled({ list: [siteWithId(3)] }, 'request-c', dateC),
    );

    expect(state.currentDate).toBe(dateC);
    expect(state.list?.map((site) => site.id)).toEqual([3]);
    expect(state.loading).toBe(false);
  });
});
