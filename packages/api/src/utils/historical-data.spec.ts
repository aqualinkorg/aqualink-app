import { sortBy } from 'lodash';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { TestService } from '../../test/test.service';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { Metric } from '../time-series/metrics.enum';
import { createPoint } from './coordinates';
import { getCollectionData } from './collections.utils';
import { getHistoricalData } from './historical-data';

export const historicalDataTests = () => {
  const testService = TestService.getInstance();
  let dataSource: DataSource;
  let site: Site;
  let emptySite: Site;
  beforeAll(async () => {
    dataSource = await testService.getDataSource();
    const sites = dataSource.getRepository(Site);
    site = await sites.save({
      name: 'Historical fixture',
      polygon: createPoint(0, 0),
      display: true,
    });
    emptySite = await sites.save({
      name: 'No history fixture',
      polygon: createPoint(1, 1),
      display: true,
    });
    const sources = dataSource.getRepository(Sources);
    const noaa = await sources.save({ site, type: SourceType.NOAA });
    const sonde = await sources.save({ site, type: SourceType.SONDE });
    const hobo = await sources.save({ site, type: SourceType.HOBO });
    const other = await sources.save({
      site: emptySite,
      type: SourceType.NOAA,
    });
    const rows: [Sources, Metric, string, number][] = [
      [noaa, Metric.SATELLITE_TEMPERATURE, '2020-02-28T00:00:00Z', 20],
      [noaa, Metric.SATELLITE_TEMPERATURE, '2020-03-01T23:59:59.999Z', 21],
      [noaa, Metric.SATELLITE_TEMPERATURE, '2020-03-02T00:00:00Z', 99],
      [noaa, Metric.DHW, '2020-02-23T00:00:00Z', 2],
      [noaa, Metric.SST_ANOMALY, '2020-02-22T23:59:59.999Z', 10],
      [sonde, Metric.TOP_TEMPERATURE, '2018-03-01T00:00:00Z', 19],
      [sonde, Metric.BOTTOM_TEMPERATURE, '2018-02-28T23:59:59Z', 18],
      [hobo, Metric.BOTTOM_TEMPERATURE, '2020-03-01T00:00:00Z', 17],
      [other, Metric.SATELLITE_TEMPERATURE, '2020-03-02T00:00:00Z', 40],
    ];
    await dataSource.getRepository(TimeSeries).save(
      rows.map(([source, metric, timestamp, value]) => ({
        source,
        metric,
        timestamp: new Date(timestamp),
        value,
      })),
    );
  });
  afterAll(async () => {
    if (dataSource?.isInitialized) {
      if (site) await dataSource.getRepository(Site).delete(site.id);
      if (emptySite) await dataSource.getRepository(Site).delete(emptySite.id);
    }
  });
  it('selects the last observation before next midnight, retaining source freshness windows', async () => {
    const rows = await getHistoricalData(
      [site.id],
      dataSource.getRepository(LatestData),
      '2020-03-01',
    );
    expect(sortBy(rows.map(({ value }) => value))).toEqual([2, 17, 19, 21]);
    expect(rows.every(({ siteId }) => siteId === site.id)).toBe(true);
    expect(
      rows.every(
        ({ timestamp }) => timestamp < new Date('2020-03-02T00:00:00Z'),
      ),
    ).toBe(true);
  });
  it('uses the same cutoff for map summaries and excludes HOBO summary values', async () => {
    const summaries = await getCollectionData(
      [site, emptySite],
      dataSource.getRepository(LatestData),
      '2020-03-01',
    );
    expect(summaries[site.id]).toEqual({
      satelliteTemperature: 21,
      dhw: 2,
      topTemperature: 19,
    });
    expect(summaries[emptySite.id]).toBeUndefined();
  });
  it('returns no data before any observation and for empty site selections', async () => {
    expect(
      await getHistoricalData(
        [site.id],
        dataSource.getRepository(LatestData),
        '2010-01-01',
      ),
    ).toEqual([]);
    expect(
      await getCollectionData(
        [],
        dataSource.getRepository(LatestData),
        '2020-03-01',
      ),
    ).toEqual({});
  });
  it('returns matching historical summaries from map and site HTTP endpoints', async () => {
    const app = await testService.getApp();
    const map = await request(app.getHttpServer())
      .get('/sites?asOf=2020-03-01')
      .expect(200);
    const detail = await request(app.getHttpServer())
      .get(`/sites/${site.id}?asOf=2020-03-01`)
      .expect(200);
    const latest = await request(app.getHttpServer())
      .get(`/sites/${site.id}/latest_data?asOf=2020-03-01`)
      .expect(200);
    expect(
      map.body.find((row: Site) => row.id === site.id).collectionData,
    ).toEqual(detail.body.collectionData);
    expect(detail.body.collectionData.satelliteTemperature).toBe(21);
    expect(
      sortBy(latest.body.latestData.map((row: LatestData) => row.value)),
    ).toEqual([2, 17, 19, 21]);
  });
  it.each(['2020-02-30', '2020-03-01T00:00:00Z', '9999-01-01'])(
    'rejects invalid or future HTTP date %s',
    async (asOf) => {
      const app = await testService.getApp();
      await request(app.getHttpServer()).get(`/sites?asOf=${asOf}`).expect(400);
      await request(app.getHttpServer())
        .get(`/sites/${site.id}?asOf=${asOf}`)
        .expect(400);
      await request(app.getHttpServer())
        .get(`/sites/${site.id}/latest_data?asOf=${asOf}`)
        .expect(400);
    },
  );
};
