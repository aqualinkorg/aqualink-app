import { configureStore } from '@reduxjs/toolkit';
import siteServices from 'services/siteServices';
import { mockSite } from 'mocks/mockSite';
import sitesListReducer, { sitesRequest } from './sitesListSlice';

type Resolve = (value: unknown) => void;

const createStore = () =>
  configureStore({ reducer: { sitesList: sitesListReducer } });

const siteWithAlert = (tempWeeklyAlert: number) => ({
  ...mockSite,
  collectionData: { tempWeeklyAlert },
});

/** Mocks getSites with one controllable promise per call. */
const mockGetSites = () => {
  const resolvers: Resolve[] = [];
  const spy = vi.spyOn(siteServices, 'getSites').mockImplementation(
    () =>
      new Promise((resolve) => {
        // eslint-disable-next-line fp/no-mutating-methods
        resolvers.push(resolve as Resolve);
      }) as ReturnType<typeof siteServices.getSites>,
  );
  const respond = (index: number, alert: number) =>
    resolvers[index]({ data: [siteWithAlert(alert)] });
  return { spy, respond };
};

const flush = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe('sitesRequest with a historical date', () => {
  afterEach(() => vi.restoreAllMocks());

  it('requests the sites for the selected date', async () => {
    const { spy, respond } = mockGetSites();
    const store = createStore();

    const request = store.dispatch(sitesRequest({ until: '2024-03-15' }));
    respond(0, 3);
    await request;

    expect(spy).toHaveBeenCalledWith('2024-03-15');
    const state = store.getState().sitesList;
    expect(state.until).toBe('2024-03-15');
    expect(state.list?.[0].collectionData?.tempWeeklyAlert).toBe(3);
  });

  it('does not refetch the same date, but refetches when it changes', async () => {
    const { spy, respond } = mockGetSites();
    const store = createStore();

    const first = store.dispatch(sitesRequest({ until: null }));
    respond(0, 0);
    await first;
    await store.dispatch(sitesRequest({ until: null }));
    // Pages without a date keep whatever list is loaded.
    await store.dispatch(sitesRequest());
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(undefined);

    const second = store.dispatch(sitesRequest({ until: '2024-03-15' }));
    respond(1, 4);
    await second;
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('ignores a slow response for a previously selected date', async () => {
    const { respond } = mockGetSites();
    const store = createStore();

    const april = store.dispatch(sitesRequest({ until: '2024-04-01' }));
    const may = store.dispatch(sitesRequest({ until: '2024-05-01' }));
    respond(1, 2);
    await may;
    respond(0, 4);
    await april;
    await flush();

    const state = store.getState().sitesList;
    expect(state.until).toBe('2024-05-01');
    expect(state.list?.[0].collectionData?.tempWeeklyAlert).toBe(2);
    expect(state.loading).toBe(false);
  });

  it('shows the latest data again when the date is cleared while loading', async () => {
    const { respond } = mockGetSites();
    const store = createStore();

    const april = store.dispatch(sitesRequest({ until: '2024-04-01' }));
    const latest = store.dispatch(sitesRequest({ until: null }));
    respond(1, 1);
    await latest;
    respond(0, 4);
    await april;

    const state = store.getState().sitesList;
    expect(state.until).toBeNull();
    expect(state.list?.[0].collectionData?.tempWeeklyAlert).toBe(1);
  });
});
