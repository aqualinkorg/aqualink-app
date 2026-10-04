import { configureStore } from '@reduxjs/toolkit';
import siteServices from 'services/siteServices';
import selectedSite, { siteRequest } from './selectedSiteSlice';
import sitesList, { sitesRequest } from './sitesListSlice';

vi.mock('services/siteServices', () => ({
  default: {
    getSites: vi.fn(),
    getSite: vi.fn(),
    getSiteDailyData: vi.fn().mockResolvedValue({ data: [] }),
    getSiteSurveyPoints: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

const makeSite = (temperature: number) => ({
  id: 1,
  name: 'Test site',
  historicalMonthlyMean: [],
  collectionData: { satelliteTemperature: temperature },
});
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe.each(['map', 'site'] as const)(
  '%s historical request ordering',
  (view) => {
    const service =
      view === 'map' ? siteServices.getSites : siteServices.getSite;
    const response = (temperature: number) => ({
      data: view === 'map' ? [makeSite(temperature)] : makeSite(temperature),
    });
    const request = (date?: string) =>
      view === 'map'
        ? sitesRequest(date ? { date } : undefined)
        : siteRequest({ id: '1', date });
    const getState = (store: ReturnType<typeof makeStore>) =>
      view === 'map'
        ? store.getState().sitesList
        : store.getState().selectedSite;
    const temperature = (store: ReturnType<typeof makeStore>) =>
      view === 'map'
        ? store.getState().sitesList.list?.[0].collectionData
            ?.satelliteTemperature
        : store.getState().selectedSite.details?.collectionData
            ?.satelliteTemperature;
    function makeStore() {
      return configureStore({ reducer: { selectedSite, sitesList } });
    }

    beforeEach(() => vi.mocked(service).mockReset());

    test('late older response cannot replace the latest requested date', async () => {
      const store = makeStore();
      const older = deferred<ReturnType<typeof response>>();
      const newer = deferred<ReturnType<typeof response>>();
      vi.mocked(service)
        .mockReturnValueOnce(older.promise as never)
        .mockReturnValueOnce(newer.promise as never);
      const a = store.dispatch(request('2024-04-15') as never);
      const b = store.dispatch(request('2024-05-15') as never);
      newer.resolve(response(30));
      await b;
      older.resolve(response(20));
      await a;
      expect(getState(store).date).toBe('2024-05-15');
      expect(temperature(store)).toBe(30);
    });

    test('reset to cached Latest invalidates a pending historical request', async () => {
      const store = makeStore();
      vi.mocked(service).mockResolvedValueOnce(response(30) as never);
      await store.dispatch(request() as never);
      const older = deferred<ReturnType<typeof response>>();
      vi.mocked(service)
        .mockReturnValueOnce(older.promise as never)
        .mockResolvedValueOnce(response(31) as never);
      const a = store.dispatch(request('2024-04-15') as never);
      await store.dispatch(request() as never);
      older.resolve(response(20));
      await a;
      expect(service).toHaveBeenCalledTimes(3);
      expect(getState(store).date).toBeUndefined();
      expect(temperature(store)).toBe(31);
    });

    test('stale failure does not clear the newer request loading state', async () => {
      const store = makeStore();
      const older = deferred<ReturnType<typeof response>>();
      const newer = deferred<ReturnType<typeof response>>();
      vi.mocked(service)
        .mockReturnValueOnce(older.promise as never)
        .mockReturnValueOnce(newer.promise as never);
      const a = store.dispatch(request('2024-04-15') as never);
      const b = store.dispatch(request('2024-05-15') as never);
      older.reject(new Error('Old request failed'));
      await a;
      expect(getState(store).loading).toBe(true);
      expect(getState(store).error).toBeNull();
      newer.resolve(response(30));
      await b;
      expect(getState(store).loading).toBe(false);
    });
  },
);
