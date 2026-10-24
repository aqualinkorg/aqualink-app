import { configureStore } from '@reduxjs/toolkit';
import siteServices from 'services/siteServices';
import reducer from '../reducer';
import {
  latestDataRequest,
  siteDetailsDateSelector,
  siteRequest,
} from './selectedSiteSlice';

vi.mock('services/siteServices', () => ({
  default: {
    getSite: vi.fn(),
    getSiteDailyData: vi.fn(),
    getSiteSurveyPoints: vi.fn(),
    getSiteLatestData: vi.fn(),
  },
}));

const services = vi.mocked(siteServices);

const createStore = () => configureStore({ reducer });

describe('selectedSite historical date', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    services.getSiteDailyData.mockResolvedValue({ data: [] } as any);
    services.getSiteSurveyPoints.mockResolvedValue({ data: [] } as any);
  });

  it('fetches the site and its daily data as of the given date', async () => {
    services.getSite.mockResolvedValue({ data: { id: 1 } } as any);
    const store = createStore();

    await store.dispatch(siteRequest({ id: '1', date: '2024-03-15' }));

    expect(services.getSite).toHaveBeenCalledWith('1', '2024-03-15');
    expect(services.getSiteDailyData).toHaveBeenCalledWith(
      '1',
      '2023-12-16T00:00:00.000Z',
      '2024-03-15T23:59:59.999Z',
    );
    expect(siteDetailsDateSelector(store.getState())).toBe('2024-03-15');
  });

  it('refetches the same site when the date changes only', async () => {
    services.getSite.mockResolvedValue({ data: { id: 1 } } as any);
    const store = createStore();

    await store.dispatch(siteRequest('1'));
    await store.dispatch(siteRequest({ id: '1', date: null }));
    await store.dispatch(siteRequest({ id: '1', date: '2024-03-15' }));

    expect(services.getSite.mock.calls).toEqual([
      ['1', null],
      ['1', '2024-03-15'],
    ]);
  });

  it('ignores outdated responses', async () => {
    let resolveFirst: (value: any) => void = () => {};
    services.getSite
      .mockReturnValueOnce(
        new Promise((resolve) => {
          // eslint-disable-next-line fp/no-mutation
          resolveFirst = resolve;
        }) as any,
      )
      .mockResolvedValueOnce({ data: { id: 2 } } as any);
    const store = createStore();

    const first = store.dispatch(siteRequest({ id: '1', date: '2024-03-15' }));
    await store.dispatch(siteRequest('2'));
    resolveFirst({ data: { id: 1 } });
    await first;

    const { details, detailsDate, loading } = store.getState().selectedSite;
    expect(details?.id).toBe(2);
    expect(detailsDate).toBeNull();
    expect(loading).toBe(false);
  });

  it('requests historical latest data', async () => {
    services.getSiteLatestData.mockResolvedValue({
      data: { latestData: [] },
    } as any);
    const store = createStore();

    await store.dispatch(latestDataRequest({ id: '1', date: '2024-03-15' }));
    await store.dispatch(latestDataRequest('1'));

    expect(services.getSiteLatestData.mock.calls).toEqual([
      ['1', '2024-03-15'],
      ['1', null],
    ]);
  });
});
