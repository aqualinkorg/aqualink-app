import { configureStore } from '@reduxjs/toolkit';
import siteServices from 'services/siteServices';
import reducer from '../reducer';
import { sitesRequest, sitesListDateSelector } from './sitesListSlice';

vi.mock('services/siteServices', () => ({
  default: { getSites: vi.fn() },
}));

const getSites = vi.mocked(siteServices.getSites);

const site = (id: number, name: string, temp: number) => ({
  id,
  name,
  collectionData: { satelliteTemperature: temp },
});

type Deferred = { resolve: (value: any) => void };

const deferredResponse = () => {
  const deferred = {} as Deferred;
  const promise = new Promise((resolve) => {
    // eslint-disable-next-line fp/no-mutation
    deferred.resolve = (data) => resolve({ data });
  });
  return { deferred, promise };
};

const createStore = () => configureStore({ reducer });

describe('sitesRequest', () => {
  beforeEach(() => {
    getSites.mockReset();
  });

  it('fetches the latest sites when called without a date', async () => {
    getSites.mockResolvedValue({ data: [site(1, 'A', 20)] } as any);
    const store = createStore();

    await store.dispatch(sitesRequest());

    expect(getSites).toHaveBeenCalledTimes(1);
    expect(getSites).toHaveBeenCalledWith(null);
    expect(store.getState().sitesList.list).toHaveLength(1);
    expect(sitesListDateSelector(store.getState())).toBeNull();
  });

  it('does not refetch nor reset the date on argument-less calls', async () => {
    getSites.mockResolvedValue({ data: [site(1, 'A', 20)] } as any);
    const store = createStore();

    await store.dispatch(sitesRequest({ date: '2024-03-15' }));
    await store.dispatch(sitesRequest());

    expect(getSites).toHaveBeenCalledTimes(1);
    expect(getSites).toHaveBeenCalledWith('2024-03-15');
    expect(sitesListDateSelector(store.getState())).toBe('2024-03-15');
  });

  it('refetches when the date changes and skips identical requests', async () => {
    getSites.mockResolvedValue({ data: [site(1, 'A', 20)] } as any);
    const store = createStore();

    await store.dispatch(sitesRequest({ date: null }));
    await store.dispatch(sitesRequest({ date: null }));
    await store.dispatch(sitesRequest({ date: '2024-03-15' }));
    await store.dispatch(sitesRequest({ date: '2024-03-15' }));
    await store.dispatch(sitesRequest({ date: null }));

    expect(getSites.mock.calls).toEqual([[null], ['2024-03-15'], [null]]);
    expect(sitesListDateSelector(store.getState())).toBeNull();
  });

  it('keeps the latest requested date when responses arrive out of order', async () => {
    const historical = deferredResponse();
    const latest = deferredResponse();
    getSites
      .mockReturnValueOnce(historical.promise as any)
      .mockReturnValueOnce(latest.promise as any);
    const store = createStore();

    const first = store.dispatch(sitesRequest({ date: '2024-03-15' }));
    // User goes back to the latest data before the historical request ends
    const second = store.dispatch(sitesRequest({ date: null }));

    latest.deferred.resolve([site(1, 'A', 30)]);
    await second;
    historical.deferred.resolve([site(1, 'A', 10)]);
    await first;

    const state = store.getState().sitesList;
    expect(state.date).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.list?.[0].collectionData?.satelliteTemperature).toBe(30);
  });
});
