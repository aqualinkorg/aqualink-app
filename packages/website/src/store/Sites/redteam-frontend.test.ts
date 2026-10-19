import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import requests from 'helpers/requests';
import { mockSite } from 'mocks/mockSite';
import { generateMetricDataset } from 'common/Chart/MultipleSensorsCharts/helpers';
import sitesList, { sitesRequest } from './sitesListSlice';
import selectedSite, {
  siteRequest,
  siteTimeSeriesDataRequest,
  siteTimeSeriesDataRangeRequest,
  clearTimeSeriesDataRange,
  clearTimeSeriesData,
  clearGranularDailyData,
} from './selectedSiteSlice';

const deferred = () => {
  let resolve!: (value: any) => void;
  let reject!: (error: any) => void;
  const promise = new Promise<any>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const makeStore = () =>
  configureStore({ reducer: { sitesList, selectedSite } });
const calls: {
  url: string;
  resolve: (data: any) => void;
  reject: (error: any) => void;
}[] = [];
const intercept = () => {
  calls.length = 0;
  vi.spyOn(requests, 'send').mockImplementation((config: any) => {
    const pending = deferred();
    // eslint-disable-next-line fp/no-mutating-methods
    calls.push({
      url: config.url,
      resolve: (data) => pending.resolve({ data }),
      reject: pending.reject,
    });
    return pending.promise;
  });
};
const flush = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
afterEach(() => vi.restoreAllMocks());

describe('independent HTTP-boundary red-team', () => {
  it('control: executes real site service, normalizes null snapshot and caps daily data', async () => {
    intercept();
    const store = makeStore();
    const task = store.dispatch(
      siteRequest({ id: '1', date: '2025-01-01' }) as any,
    );
    expect(calls[0].url).toBe('sites/1?date=2025-01-01');
    calls[0].resolve({ ...mockSite, collectionData: null });
    await flush();
    expect(
      new URL(calls[1].url, 'http://localhost').searchParams.get('end'),
    ).toBe('2025-01-01T23:59:59.999Z');
    calls[1].resolve([]);
    await flush();
    calls[2].resolve([]);
    await task;
    expect(store.getState().selectedSite.details?.collectionData).toEqual({});
    expect(store.getState().selectedSite.currentDate).toBe('2025-01-01');
  });

  it.each(['fulfill', 'reject'])(
    'map: Latest wins against late historical %s',
    async (outcome) => {
      intercept();
      const store = makeStore();
      const old = store.dispatch(sitesRequest('2025-01-01') as any);
      const latest = store.dispatch(sitesRequest(undefined) as any);
      expect(calls.map((x) => x.url)).toEqual([
        'sites?date=2025-01-01',
        'sites',
      ]);
      calls[1].resolve([{ id: 2, name: 'Latest' }]);
      await latest;
      if (outcome === 'fulfill') calls[0].resolve([{ id: 1, name: 'Old' }]);
      else calls[0].reject(new Error('offline'));
      await old;
      expect(store.getState().sitesList.list?.[0].id).toBe(2);
      expect(store.getState().sitesList.currentDate).toBeUndefined();
      expect(store.getState().sitesList.error).toBeNull();
    },
  );

  it('map: Latest recovers after historical request fails', async () => {
    intercept();
    const store = makeStore();
    const old = store.dispatch(sitesRequest('2025-01-01') as any);
    calls[0].reject(new Error('offline'));
    await old;
    const latest = store.dispatch(sitesRequest(undefined) as any);
    expect(calls[1].url).toBe('sites');
    calls[1].resolve([]);
    await latest;
    expect(store.getState().sitesList.error).toBeNull();
    expect(store.getState().sitesList.loading).toBe(false);
  });

  it.each(['2025-02-30', 'not-a-date', '2025-01-01&injected=true'])(
    'rejects malformed user URL date safely: %s',
    async (date) => {
      intercept();
      const store = makeStore();
      const task = store.dispatch(sitesRequest(date) as any);
      const query = new URL(calls[0].url, 'http://localhost').searchParams;
      expect(query.get('date')).toBe(date);
      expect(query.get('injected')).toBeNull();
      calls[0].reject(new Error('HTTP 400 invalid date'));
      await task;
      expect(store.getState().sitesList.loading).toBe(false);
      expect(store.getState().sitesList.error).toBeTruthy();
      expect(store.getState().sitesList.list).toBeUndefined();
    },
  );

  it('site: later site/date wins after older detail pipeline finishes', async () => {
    intercept();
    const store = makeStore();
    const old = store.dispatch(
      siteRequest({ id: '1', date: '2025-01-01' }) as any,
    );
    const current = store.dispatch(
      siteRequest({ id: '2', date: '2025-02-01' }) as any,
    );
    calls[1].resolve({ ...mockSite, id: 2 });
    await flush();
    calls[2].resolve([]);
    await flush();
    calls[3].resolve([]);
    await current;
    calls[0].resolve({ ...mockSite, id: 1 });
    await flush();
    calls[4].resolve([]);
    await flush();
    calls[5].resolve([]);
    await old;
    expect(store.getState().selectedSite.details?.id).toBe(2);
    expect(store.getState().selectedSite.currentDate).toBe('2025-02-01');
  });

  it('preserves concurrent metric requests in the same chart context', async () => {
    intercept();
    const store = makeStore();
    const params = {
      siteId: '1',
      start: '2025-01-01',
      end: '2025-02-01',
      metrics: ['bottom_temperature'],
    };
    const temperature = store.dispatch(
      siteTimeSeriesDataRequest({ ...params, hourly: true } as any) as any,
    );
    const salinity = store.dispatch(
      siteTimeSeriesDataRequest({
        ...params,
        metrics: ['salinity'],
        hourly: false,
      } as any) as any,
    );
    calls[1].resolve({
      salinity: [
        { type: 'sonde', data: [{ timestamp: '2025-01-15', value: 35 }] },
      ],
    });
    await flush();
    calls[2].resolve([]);
    await salinity;
    expect(store.getState().selectedSite.timeSeriesDataLoading).toBe(true);
    calls[0].resolve({
      bottom_temperature: [
        { type: 'sonde', data: [{ timestamp: '2025-01-15', value: 21 }] },
      ],
    });
    await flush();
    calls[3].resolve([]);
    await temperature;
    expect(
      store.getState().selectedSite.timeSeriesData?.salinity?.[0].data[0].value,
    ).toBe(35);
    expect(
      store.getState().selectedSite.timeSeriesData?.bottomTemperature?.[0]
        .data[0].value,
    ).toBe(21);
    expect(store.getState().selectedSite.timeSeriesDataLoading).toBe(false);
  });

  it.each(['fulfill', 'reject'])(
    'ignores old range %s after context cleanup',
    async (outcome) => {
      intercept();
      const store = makeStore();
      const old = store.dispatch(
        siteTimeSeriesDataRangeRequest({ siteId: '1' }) as any,
      );
      store.dispatch(clearTimeSeriesDataRange());
      const current = store.dispatch(
        siteTimeSeriesDataRangeRequest({ siteId: '2' }) as any,
      );
      calls[1].resolve({});
      await current;
      if (outcome === 'fulfill')
        calls[0].resolve({
          bottom_temperature: [
            {
              type: 'sonde',
              data: [{ minDate: '2020-01-01', maxDate: '2026-01-01' }],
            },
          ],
        });
      else calls[0].reject(new Error('offline'));
      await old;
      expect(store.getState().selectedSite.timeSeriesDataRange).toEqual({});
      expect(store.getState().selectedSite.error).toBeNull();
    },
  );

  it('ignores an old series error while a new context remains loading', async () => {
    intercept();
    const store = makeStore();
    const params = {
      siteId: '1',
      start: '2025-01-01',
      end: '2025-02-01',
      metrics: ['bottom_temperature'],
    };
    const old = store.dispatch(siteTimeSeriesDataRequest(params as any) as any);
    store.dispatch(clearTimeSeriesData());
    const current = store.dispatch(
      siteTimeSeriesDataRequest({ ...params, siteId: '2' } as any) as any,
    );
    calls[0].reject(new Error('offline'));
    await old;
    expect(store.getState().selectedSite.timeSeriesDataLoading).toBe(true);
    expect(store.getState().selectedSite.error).toBeNull();
    calls[1].resolve({});
    await flush();
    calls[2].resolve([]);
    await current;
  });

  it.each(['fulfill', 'reject'])(
    'ignores old range-selection %s without route cleanup',
    async (outcome) => {
      intercept();
      const store = makeStore();
      const params = {
        siteId: '1',
        pointId: '1',
        start: '2025-01-01',
        end: '2025-02-01',
        metrics: ['bottom_temperature'],
      };
      const old = store.dispatch(
        siteTimeSeriesDataRequest(params as any) as any,
      );
      const current = store.dispatch(
        siteTimeSeriesDataRequest({
          ...params,
          start: '2024-12-01',
        } as any) as any,
      );
      calls[1].resolve({
        bottom_temperature: [
          { type: 'sonde', data: [{ timestamp: '2025-01-15', value: 21 }] },
        ],
      });
      await flush();
      calls[2].resolve([]);
      await current;
      if (outcome === 'fulfill') {
        calls[0].resolve({
          bottom_temperature: [
            { type: 'sonde', data: [{ timestamp: '2025-01-15', value: 99 }] },
          ],
        });
        await flush();
        calls[3].resolve([]);
      } else calls[0].reject(new Error('offline'));
      await old;
      expect(
        store.getState().selectedSite.timeSeriesData?.bottomTemperature?.[0]
          .data[0].value,
      ).toBe(21);
      expect(store.getState().selectedSite.timeSeriesMinRequestDate).toBe(
        '2024-12-01',
      );
      expect(store.getState().selectedSite.error).toBeNull();
    },
  );

  it('refetches when switching survey point inside a cached date interval', async () => {
    intercept();
    const store = makeStore();
    const params = {
      siteId: '1',
      pointId: '1',
      start: '2025-01-01',
      end: '2025-03-01',
      metrics: ['bottom_temperature'],
    };
    const first = store.dispatch(
      siteTimeSeriesDataRequest(params as any) as any,
    );
    calls[0].resolve({
      bottom_temperature: [
        {
          type: 'sonde',
          surveyPoint: { id: 1, name: 'Old point' },
          data: [{ timestamp: '2025-01-15', value: 99 }],
        },
      ],
    });
    await flush();
    calls[1].resolve([]);
    await first;
    const current = store.dispatch(
      siteTimeSeriesDataRequest({
        ...params,
        pointId: '2',
        start: '2025-01-10',
        end: '2025-02-01',
      } as any) as any,
    );
    await flush();
    expect(calls).toHaveLength(3);
    expect(calls[2].url).toContain('/site-survey-points/2');
    calls[2].resolve({
      bottom_temperature: [
        {
          type: 'sonde',
          surveyPoint: { id: 2, name: 'New point' },
          data: [{ timestamp: '2025-01-15', value: 21 }],
        },
      ],
    });
    await flush();
    calls[3].resolve([]);
    await current;
    expect(
      store.getState().selectedSite.timeSeriesData?.bottomTemperature?.[0]
        .surveyPoint?.id,
    ).toBe(2);
    expect(
      store.getState().selectedSite.timeSeriesData?.bottomTemperature?.[0]
        .data[0].value,
    ).toBe(21);
  });

  it('ignores a prior survey-point range response without route cleanup', async () => {
    intercept();
    const store = makeStore();
    const old = store.dispatch(
      siteTimeSeriesDataRangeRequest({ siteId: '1', pointId: '1' }) as any,
    );
    const current = store.dispatch(
      siteTimeSeriesDataRangeRequest({ siteId: '1', pointId: '2' }) as any,
    );
    calls[1].resolve({});
    await current;
    calls[0].resolve({
      bottom_temperature: [
        {
          type: 'sonde',
          data: [{ minDate: '2020-01-01', maxDate: '2026-01-01' }],
        },
      ],
    });
    await old;
    expect(store.getState().selectedSite.timeSeriesDataRange).toEqual({});
  });

  it('chart: old live response must not overwrite a new historical selection', async () => {
    intercept();
    const store = makeStore();
    const liveParams = {
      siteId: '1',
      start: '2026-09-01T00:00:00Z',
      end: '2026-10-01T23:59:59Z',
      metrics: ['bottom_temperature'],
    };
    const historicalParams = {
      ...liveParams,
      siteId: '2',
      start: '2026-09-01T00:00:00Z',
      end: '2026-09-20T23:59:59Z',
    };
    const old = store.dispatch(
      siteTimeSeriesDataRequest(liveParams as any) as any,
    );
    expect(calls[0].url).toContain('/1');
    store.dispatch(clearTimeSeriesData());
    store.dispatch(clearGranularDailyData());
    const current = store.dispatch(
      siteTimeSeriesDataRequest(historicalParams as any) as any,
    );
    const readings = (value: number) =>
      Array.from({ length: 12 }, (_, hour) => ({
        timestamp: `2026-09-15T${String(hour).padStart(2, '0')}:00:00Z`,
        value,
      }));
    calls[1].resolve({
      bottom_temperature: [{ type: 'sonde', data: readings(21) }],
    });
    await flush();
    calls[2].resolve([]);
    await current;
    expect(
      store.getState().selectedSite.timeSeriesData?.bottomTemperature?.[0]
        .data[0].value,
    ).toBe(21);
    calls[0].resolve({
      bottom_temperature: [{ type: 'sonde', data: readings(99) }],
    });
    await flush();
    calls[3].resolve([]);
    await old;
    const corruptedSeries =
      store.getState().selectedSite.timeSeriesData?.bottomTemperature?.[0].data;
    const chartDataset = generateMetricDataset(
      'SONDE',
      corruptedSeries || [],
      '°C',
      '#f00',
      historicalParams.start,
      historicalParams.end,
      'UTC',
    );
    expect(chartDataset.displayData).toBe(true);
    expect(chartDataset.data[0].value).toBe(21);
    expect(
      store.getState().selectedSite.timeSeriesData?.bottomTemperature?.[0]
        .data[0].value,
    ).toBe(21);
    expect(store.getState().selectedSite.timeSeriesMaxRequestDate).toBe(
      historicalParams.end,
    );
  });
});
