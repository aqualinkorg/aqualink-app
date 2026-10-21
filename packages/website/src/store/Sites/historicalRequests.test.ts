import { configureStore } from '@reduxjs/toolkit';
import reducer from 'store/reducer';
import { mockSite } from 'mocks/mockSite';
import siteServices from 'services/siteServices';
import selectedSiteReducer, {
  siteRequest,
  latestDataRequest,
  siteTimeSeriesDataRequest,
} from './selectedSiteSlice';
import { sitesRequest } from './sitesListSlice';
import { Site, SiteResponse } from './types';

vi.mock('services/siteServices', () => ({
  default: {
    getSites: vi.fn(),
    getSite: vi.fn(),
    getSiteDailyData: vi.fn(),
    getSiteSurveyPoints: vi.fn(),
  },
}));
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
afterEach(() => vi.resetAllMocks());

describe('historical requests', () => {
  it('reloads a cached map for another date and ignores a late older response', async () => {
    const store = configureStore({ reducer });
    const old = deferred<{ data: SiteResponse[] }>();
    const current = deferred<{ data: SiteResponse[] }>();
    vi.mocked(siteServices.getSites)
      .mockReturnValueOnce(old.promise as never)
      .mockReturnValueOnce(current.promise as never);
    const first = store.dispatch(sitesRequest('2020-01-01'));
    const second = store.dispatch(sitesRequest('2020-02-01'));
    current.resolve({ data: [{ ...mockSite, name: 'February' }] });
    await second;
    old.resolve({ data: [{ ...mockSite, name: 'January' }] });
    await first;
    expect(store.getState().sitesList.list?.[0].name).toBe('February');
    expect(store.getState().sitesList.asOf).toBe('2020-02-01');
    await store.dispatch(sitesRequest('2020-02-01'));
    expect(siteServices.getSites).toHaveBeenCalledTimes(2);
  });
  it('reloads the same site with a historical daily-data window and ignores older site data', async () => {
    const store = configureStore({ reducer });
    const old = deferred<{ data: Site }>();
    const current = deferred<{ data: Site }>();
    vi.mocked(siteServices.getSite)
      .mockReturnValueOnce(old.promise as never)
      .mockReturnValueOnce(current.promise as never);
    vi.mocked(siteServices.getSiteDailyData).mockResolvedValue({
      data: [],
    } as never);
    vi.mocked(siteServices.getSiteSurveyPoints).mockResolvedValue({
      data: [],
    } as never);
    const first = store.dispatch(siteRequest({ id: '1', asOf: '2020-01-01' }));
    const second = store.dispatch(siteRequest({ id: '1', asOf: '2020-02-01' }));
    current.resolve({ data: { ...mockSite, name: 'February' } });
    await second;
    old.resolve({ data: { ...mockSite, name: 'January' } });
    await first;
    expect(store.getState().selectedSite.details?.name).toBe('February');
    expect(siteServices.getSiteDailyData).toHaveBeenCalledWith(
      '1',
      '2019-11-04T00:00:00.000Z',
      '2020-02-01T23:59:59.999Z',
    );
  });
  it('accepts concurrent metric requests but rejects results from the previous date', () => {
    const args = { siteId: '1' };
    let state = selectedSiteReducer(
      undefined,
      siteRequest.pending('site1', { id: '1', asOf: '2020-01-01' }),
    );
    state = selectedSiteReducer(
      state,
      siteTimeSeriesDataRequest.pending('temperature', args),
    );
    state = selectedSiteReducer(
      state,
      siteTimeSeriesDataRequest.pending('waves', args),
    );
    const result = {
      timeSeriesData: {
        topTemperature: [
          {
            type: 'spotter' as const,
            depth: null,
            data: [{ timestamp: '2020-01-01', value: 20 }],
          },
        ],
      },
      granularDailyData: undefined,
      timeSeriesMinRequestDate: undefined,
      timeSeriesMaxRequestDate: undefined,
    };
    state = selectedSiteReducer(
      state,
      siteTimeSeriesDataRequest.fulfilled(result, 'temperature', args),
    );
    expect(state.timeSeriesData?.topTemperature?.[0].data[0].value).toBe(20);
    state = selectedSiteReducer(
      state,
      latestDataRequest.pending('old-latest', '1'),
    );
    state = selectedSiteReducer(
      state,
      siteRequest.pending('site2', { id: '1', asOf: '2020-02-01' }),
    );
    const before = state;
    state = selectedSiteReducer(
      state,
      siteTimeSeriesDataRequest.fulfilled(result, 'waves', args),
    );
    state = selectedSiteReducer(
      state,
      latestDataRequest.fulfilled([], 'old-latest', '1'),
    );
    expect(state).toBe(before);
  });
});
