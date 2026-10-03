import { configureStore } from '@reduxjs/toolkit';
import { mockSite } from 'mocks/mockSite';
import siteServices from 'services/siteServices';
import reducer from '../reducer';
import { appMiddlewares } from '../middleware';
import type { AppDispatch } from '../configure';
import {
  setSitesListDate,
  sitesListDateSelector,
  sitesListRefreshingSelector,
  sitesRequest,
} from './sitesListSlice';
import {
  isValidHistoricalDate,
  readHistoricalDateFromUrl,
  writeFiltersToUrl,
  writeHistoricalDateToUrl,
} from './helpers';

vi.mock('services/siteServices', () => ({
  default: { getSites: vi.fn() },
}));

const getSites = vi.mocked(siteServices.getSites);

const liveSite = { ...mockSite, collectionData: { dhw: 1 } };
const pastSite = { ...mockSite, collectionData: { dhw: 8 } };

const createStore = () => {
  const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(appMiddlewares),
  });
  return { ...store, dispatch: store.dispatch as AppDispatch };
};

const response = (data: any) => ({ data }) as any;

describe('historical date helpers', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/map');
  });

  it('accepts only valid past days', () => {
    expect(isValidHistoricalDate('2020-01-15')).toBe(true);
    expect(isValidHistoricalDate('2020-02-30')).toBe(false);
    expect(isValidHistoricalDate('15-01-2020')).toBe(false);
    expect(isValidHistoricalDate('2020-01-15T00:00:00Z')).toBe(false);
    expect(isValidHistoricalDate('2999-01-01')).toBe(false);
    expect(isValidHistoricalDate(null)).toBe(false);
  });

  it('reads a valid date from the URL and ignores invalid ones', () => {
    window.history.replaceState(null, '', '/map?date=2020-01-15');
    expect(readHistoricalDateFromUrl()).toBe('2020-01-15');

    window.history.replaceState(null, '', '/map?date=not-a-date');
    expect(readHistoricalDateFromUrl()).toBeNull();
  });

  it('writes the date to the URL without dropping other parameters', () => {
    window.history.replaceState(null, '', '/map?zoom=5');

    writeHistoricalDateToUrl('2020-01-15');
    expect(window.location.search).toBe('?zoom=5&date=2020-01-15');

    writeHistoricalDateToUrl(null);
    expect(window.location.search).toBe('?zoom=5');
  });

  it('keeps the date in the URL when filters change', () => {
    window.history.replaceState(null, '', '/map?date=2020-01-15');

    writeFiltersToUrl({ heatStress: { 1: true } });

    const params = new URLSearchParams(window.location.search);
    expect(params.get('date')).toBe('2020-01-15');
    expect(params.get('heatStress')).toBe('1');
  });
});

describe('sitesList historical date', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/map');
    getSites.mockReset();
  });

  it('fetches live data, then the data of the selected date', async () => {
    getSites.mockImplementation((date) =>
      Promise.resolve(response(date ? [pastSite] : [liveSite])),
    );
    const store = createStore();

    await store.dispatch(sitesRequest());
    expect(getSites).toHaveBeenLastCalledWith(null);
    expect(store.getState().sitesList.list?.[0].collectionData).toEqual({
      dhw: 1,
    });

    store.dispatch(setSitesListDate('2020-01-15'));
    expect(sitesListDateSelector(store.getState())).toBe('2020-01-15');
    expect(window.location.search).toBe('?date=2020-01-15');

    await store.dispatch(sitesRequest());
    expect(getSites).toHaveBeenLastCalledWith('2020-01-15');
    expect(store.getState().sitesList.list?.[0].collectionData).toEqual({
      dhw: 8,
    });
    expect(store.getState().sitesList.listDate).toBe('2020-01-15');

    // Same date: no new request
    await store.dispatch(sitesRequest());
    expect(getSites).toHaveBeenCalledTimes(2);

    // Back to live data
    store.dispatch(setSitesListDate(null));
    expect(window.location.search).toBe('');
    await store.dispatch(sitesRequest());
    expect(getSites).toHaveBeenLastCalledWith(null);
    expect(store.getState().sitesList.list?.[0].collectionData).toEqual({
      dhw: 1,
    });
  });

  it('keeps the current list displayed while another date loads', async () => {
    let resolvePast: (value: any) => void = () => {};
    getSites.mockResolvedValueOnce(response([liveSite])).mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePast = resolve;
      }),
    );
    const store = createStore();
    await store.dispatch(sitesRequest());

    store.dispatch(setSitesListDate('2020-01-15'));
    const request = store.dispatch(sitesRequest());

    expect(store.getState().sitesList.loading).toBe(false);
    expect(sitesListRefreshingSelector(store.getState())).toBe(true);
    expect(store.getState().sitesList.list?.[0].collectionData).toEqual({
      dhw: 1,
    });

    resolvePast(response([pastSite]));
    await request;

    expect(sitesListRefreshingSelector(store.getState())).toBe(false);
    expect(store.getState().sitesList.list?.[0].collectionData).toEqual({
      dhw: 8,
    });
  });

  it('ignores a response for a date that is no longer selected', async () => {
    let resolveFirst: (value: any) => void = () => {};
    getSites
      .mockResolvedValueOnce(response([liveSite]))
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
      )
      .mockResolvedValueOnce(response([pastSite]));
    const store = createStore();
    await store.dispatch(sitesRequest());

    store.dispatch(setSitesListDate('2020-01-01'));
    const staleRequest = store.dispatch(sitesRequest());
    store.dispatch(setSitesListDate('2020-01-15'));
    await store.dispatch(sitesRequest());

    resolveFirst(response([{ ...mockSite, collectionData: { dhw: 3 } }]));
    await staleRequest;

    expect(store.getState().sitesList.listDate).toBe('2020-01-15');
    expect(store.getState().sitesList.list?.[0].collectionData).toEqual({
      dhw: 8,
    });
  });
});
