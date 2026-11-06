import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { omit, sortBy } from 'lodash';
import { DataSource, In } from 'typeorm';
import { DateTime } from '../luxon-extensions';
import { TestService } from '../../test/test.service';
import {
  mockBackfillSiteData,
  mockExtractAndVerifyToken,
  mockGetMMM,
  mockGetSpotterData,
} from '../../test/utils';
import {
  adminFirebaseUserMock,
  defaultFirebaseUserMock,
  defaultUserMock,
  siteManagerUserMock,
} from '../../test/mock/user.mock';
import { createPoint } from '../utils/coordinates';
import { AdminLevel } from '../users/users.entity';
import { Site, SiteStatus } from './sites.entity';
import {
  athensSite,
  californiaSite,
  floridaSite,
} from '../../test/mock/site.mock';
import { californiaDailyData } from '../../test/mock/daily-data.mock';
import { Sources } from './sources.entity';
import { SourceType } from './schemas/source-type.enum';
import { TimeSeries } from '../time-series/time-series.entity';
import { Metric } from '../time-series/metrics.enum';

export const siteTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;
  let dataSource: DataSource;
  let siteId: number;
  const firstExclusionPeriod = {
    startDate: null,
    endDate: DateTime.now().minus({ days: 8 }).endOf('day').toISOString(),
  };
  const secondExclusionPeriod = {
    startDate: DateTime.now().minus({ days: 6 }).startOf('day').toISOString(),
    endDate: DateTime.now().minus({ days: 4 }).endOf('day').toISOString(),
  };
  const siteDto = {
    site: {
      name: 'India test site',
      latitude: 14.6048471550538,
      longitude: 80.9669818291332,
      depth: 39,
    },
    siteApplication: {},
  };

  beforeAll(async () => {
    app = await testService.getApp();
    dataSource = await testService.getDataSource();
  });

  it('POST / create a site', async () => {
    mockBackfillSiteData();
    mockExtractAndVerifyToken(defaultFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).post('/sites').send(siteDto);

    expect(rsp.status).toBe(201);
    expect(rsp.body).toMatchObject({
      site: {
        name: siteDto.site.name,
        depth: siteDto.site.depth,
        polygon: createPoint(siteDto.site.longitude, siteDto.site.latitude),
      },
      user: { id: defaultUserMock.id },
    });

    // user should have changed to siteManager
    mockExtractAndVerifyToken(defaultFirebaseUserMock);
    const rsp2 = await request(app.getHttpServer()).get('/users/current');

    expect(rsp2.status).toBe(200);
    expect(rsp2.body.adminLevel).toBe(AdminLevel.SiteManager);

    // Approve new site
    await dataSource
      .getRepository(Site)
      .update({ name: siteDto.site.name }, { display: true });
  });

  it('GET / find all sites', async () => {
    const rsp = await request(app.getHttpServer()).get('/sites');

    expect(rsp.status).toBe(200);
    expect(rsp.body.length).toBe(4);
    const sortedSites = sortBy(rsp.body, 'createdAt');
    const testSite = sortedSites[sortedSites.length - 1];

    expect(testSite).toMatchObject({
      name: siteDto.site.name,
      depth: siteDto.site.depth,
      polygon: createPoint(siteDto.site.longitude, siteDto.site.latitude),
    });
    expect(testSite.id).toBeDefined();
    siteId = sortedSites[sortedSites.length - 1].id;
  });

  it('GET /:id retrieve one site', async () => {
    const rsp = await request(app.getHttpServer()).get(`/sites/${siteId}`);

    expect(rsp.status).toBe(200);
    expect(rsp.body).toMatchObject({
      name: siteDto.site.name,
      depth: siteDto.site.depth,
      polygon: createPoint(siteDto.site.longitude, siteDto.site.latitude),
    });
    expect(rsp.body.historicalMonthlyMean).toBeDefined();
    expect(rsp.body.historicalMonthlyMean.length).toBe(12);
    expect(rsp.body.maskedSpotterApiToken).toBeUndefined();
  });

  it('GET /:id/daily_data', async () => {
    const rsp = await request(app.getHttpServer())
      .get(`/sites/${californiaSite.id}/daily_data`)
      .query({
        start: DateTime.now().minus({ days: 5 }).startOf('day').toISOString(),
        end: DateTime.now().endOf('day').toISOString(),
      });

    expect(rsp.status).toBe(200);
    expect(rsp.body.length).toBe(6);
    const data = californiaDailyData
      .slice(0, 6)
      .map((entry) => omit(entry, 'site', 'updatedAt', 'createdAt'));
    expect(rsp.body).toMatchObject(data);
  });

  it('PUT /:id update a site', async () => {
    const updatedSiteName = 'India site';
    mockExtractAndVerifyToken(defaultFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .put(`/sites/${siteId}`)
      .send({
        name: updatedSiteName,
        spotterApiToken: '123456789',
      });

    expect(rsp.status).toBe(200);
    expect(rsp.body).toMatchObject({ name: updatedSiteName });
  });

  it('GET /:id retrieve masked spotterApiToken', async () => {
    const rsp = await request(app.getHttpServer()).get(`/sites/${siteId}`);

    expect(rsp.status).toBe(200);
    expect(rsp.body.maskedSpotterApiToken).toBe('****6789');
    expect(rsp.body.spotterApiToken).toBeUndefined();
  });

  it.each([
    ['https://aqualink.org', 200],
    ['http:aqualink.org/protocol', 400],
    ['https:aqualink.org:3000/port', 400],
    ['https:domain.com', 400],
  ])(`PUT /:id update a site's iframe`, async (iframe, status) => {
    mockExtractAndVerifyToken(defaultFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .put(`/sites/${siteId}`)
      .send({
        iframe,
      });

    expect(rsp.status).toBe(status);
  });

  it('PUT /:id update the admins of a site', async () => {
    mockExtractAndVerifyToken(defaultFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .put(`/sites/${siteId}`)
      .send({
        adminIds: [defaultUserMock.id, siteManagerUserMock.id],
      });

    expect(rsp.status).toBe(200);
    expect(rsp.body.admins.length).toBe(2);
  });

  it('DELETE /:id delete a site', async () => {
    mockExtractAndVerifyToken(defaultFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).delete(`/sites/${siteId}`);

    expect(rsp.status).toBe(200);
  });

  describe('deploy a spotter', () => {
    it('POST /:id/deploy deploy spotter', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post(`/sites/${athensSite.id}/deploy`)
        .send({ endDate: firstExclusionPeriod.endDate });

      expect(rsp.status).toBe(201);
    });

    it('POST /:id/exclusion_dates add exclusion period', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post(`/sites/${athensSite.id}/exclusion_dates`)
        .send(secondExclusionPeriod);

      expect(rsp.status).toBe(201);
    });

    it('GET /:id/exclusion_dates', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).get(
        `/sites/${athensSite.id}/exclusion_dates`,
      );

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBe(2);

      const sortedExclusionDates = sortBy(rsp.body, 'endDate');
      expect(sortedExclusionDates[0]).toMatchObject(firstExclusionPeriod);
      expect(sortedExclusionDates[1]).toMatchObject(secondExclusionPeriod);
    });

    it('GET /:id/spotter_data', async () => {
      mockGetSpotterData();
      const rsp = await request(app.getHttpServer())
        .get(`/sites/${athensSite.id}/spotter_data`)
        .query({
          startDate: DateTime.now()
            .minus({ days: 9 })
            .startOf('day')
            .toISOString(),
          endDate: DateTime.now().endOf('day').toISOString(),
        });

      expect(rsp.status).toBe(200);
      Object.keys(rsp.body).forEach((metric) => {
        expect(rsp.body[metric].length).toBe(4);
      });
    });
  });

  describe('Find sites with filters', () => {
    it('GET / filter sites by name', async () => {
      const rsp = await request(app.getHttpServer()).get('/sites').query({
        name: floridaSite.name,
      });

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBe(1);

      expect(rsp.body[0]).toMatchObject(
        omit(
          floridaSite,
          'createdAt',
          'updatedAt',
          'spotterApiToken',
          'contactInformation',
        ),
      );
    });

    it('GET / filter sites by status', async () => {
      const rsp = await request(app.getHttpServer()).get('/sites').query({
        status: SiteStatus.Deployed,
      });

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBe(2);

      const sortedSites = sortBy(rsp.body, 'id');
      expect(sortedSites[0]).toMatchObject(
        omit(
          californiaSite,
          'applied',
          'createdAt',
          'updatedAt',
          'spotterApiToken',
          'contactInformation',
        ),
      );
    });

    it('GET / filter sites by regionId', async () => {
      const rsp = await request(app.getHttpServer()).get('/sites').query({
        regionId: 0,
      });

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBe(0);
    });

    it('GET / filter sites by spotter', async () => {
      const rsp = await request(app.getHttpServer()).get('/sites').query({
        hasSpotter: true,
      });

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBe(2);
    });

    it('GET / filter sites by adminId', async () => {
      const rsp = await request(app.getHttpServer()).get('/sites').query({
        adminId: siteManagerUserMock.id,
      });

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBe(2);
    });
  });

  describe('test edge cases', () => {
    it('GET /:id retrieve a non-existing site', async () => {
      const rsp = await request(app.getHttpServer()).get('/sites/0');

      expect(rsp.status).toBe(404);
    });

    it('PUT /:id update a non-existing site', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).put('/sites/0');

      expect(rsp.status).toBe(404);
    });

    it('GET /:id/daily_data retrieve daily data from non-existing site', async () => {
      const rsp = await request(app.getHttpServer())
        .get('/sites/0/daily_data')
        .query({
          start: DateTime.now().minus({ days: 1 }).toISOString(),
          end: DateTime.now().toISOString(),
        });

      expect(rsp.status).toBe(404);
    });

    it('GET /:id/daily_data retrieve daily data with invalid range', async () => {
      const rsp = await request(app.getHttpServer())
        .get(`/sites/${athensSite.id}/daily_data`)
        .query({
          start: 'invalid date',
          end: '2020-10-10TInvalidDate',
        });

      expect(rsp.status).toBe(400);
    });

    it('GET /:id/spotter_data retrieve spotter data from non-existing site', async () => {
      const rsp = await request(app.getHttpServer()).get(
        '/sites/0/spotter_data',
      );

      expect(rsp.status).toBe(404);
    });

    it('GET /:id/spotter_data retrieve live data from a site without a spotter', async () => {
      const rsp = await request(app.getHttpServer()).get(
        `/sites/${floridaSite.id}/spotter_data`,
      );

      expect(rsp.status).toBe(404);
    });

    it('GET /:id/spotter_data retrieve spotter data with invalid date', async () => {
      const rsp = await request(app.getHttpServer())
        .get(`/sites/${athensSite.id}/spotter_data`)
        .query({
          startDate: 'invalid date',
          endDate: '2020-10-10TInvalidDate',
        });

      expect(rsp.status).toBe(400);
    });

    it('POST /:id/deploy deploy the spotter of a non-existing site', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).post('/sites/0/deploy');

      expect(rsp.status).toBe(404);
    });

    it('POST /:id/deploy deploy the spotter of a site without one', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).post(
        `/sites/${floridaSite.id}/deploy`,
      );

      expect(rsp.status).toBe(400);
    });

    it('POST /:id/deploy re-deploy the spotter of a site', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).post(
        `/sites/${californiaSite.id}/deploy`,
      );

      expect(rsp.status).toBe(400);
    });

    it('POST /:id/exclusion_dates add exclusion dates to a non-existing site', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post('/sites/0/exclusion_dates')
        .send({
          startDate: DateTime.now().minus({ days: 1 }).toISOString(),
          endDate: DateTime.now().toISOString(),
        });

      expect(rsp.status).toBe(404);
    });

    it('POST /:id/exclusion_dates add exclusion dates to a site with no spotter', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post(`/sites/${floridaSite.id}/exclusion_dates`)
        .send({
          startDate: DateTime.now().minus({ days: 1 }).toISOString(),
          endDate: DateTime.now().toISOString(),
        });

      expect(rsp.status).toBe(400);
    });

    it('POST /:id/exclusion_dates add invalid exclusion dates to a site', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post(`/sites/${californiaSite.id}/exclusion_dates`)
        .send({
          startDate: 'invalid date',
          endDate: '2020-10-10TInvalidDate',
        });

      expect(rsp.status).toBe(400);
    });

    it('PUT /:id update the admins of a site', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .put(`/sites/0`)
        .send({
          adminIds: [defaultUserMock.id, siteManagerUserMock.id],
        });

      expect(rsp.status).toBe(404);
    });

    it('GET /:id/exclusion_dates retrieve exclusion dates from a non-existing site', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).get(
        '/sites/0/exclusion_dates',
      );

      expect(rsp.status).toBe(404);
    });

    it('GET /:id/exclusion_dates retrieve exclusion dates from a non-existing site', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).get(
        `/sites/${floridaSite.id}/exclusion_dates`,
      );

      expect(rsp.status).toBe(400);
    });

    it('DELETE /:id delete a site', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).delete('/sites/0');

      expect(rsp.status).toBe(404);
    });
  });

  describe('test site with no MMM', () => {
    it('POST / create a site', async () => {
      mockBackfillSiteData();
      mockGetMMM();
      mockExtractAndVerifyToken(defaultFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post('/sites')
        .send(siteDto);

      expect(rsp.status).toBe(201);
      expect(rsp.body).toMatchObject({
        site: {
          name: siteDto.site.name,
          depth: siteDto.site.depth,
          polygon: createPoint(siteDto.site.longitude, siteDto.site.latitude),
        },
        user: { id: defaultUserMock.id },
      });

      siteId = rsp.body.site.id;
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp2 = await request(app.getHttpServer()).delete(
        `/sites/${siteId}`,
      );

      expect(rsp2.status).toBe(200);
    });
  });

  describe('historical collection data (?date=)', () => {
    let californiaId: number;
    let insertedSourceIds: number[] = [];
    let insertedTimeSeriesIds: number[] = [];

    const findCalifornia = (body: any[]) =>
      body.find((site) => site.id === californiaId);

    beforeAll(async () => {
      const california = await dataSource
        .getRepository(Site)
        .findOneByOrFail({ name: californiaSite.name as string });
      californiaId = california.id;

      const sourcesRepository = dataSource.getRepository(Sources);
      const noaaSource = await sourcesRepository.findOneOrFail({
        where: { site: { id: californiaId }, type: SourceType.NOAA },
      });
      const spotterSource = await sourcesRepository.findOneOrFail({
        where: { site: { id: californiaId }, type: SourceType.SPOTTER },
      });
      const sondeSource = await sourcesRepository.save({
        site: { id: californiaId },
        type: SourceType.SONDE,
      });
      insertedSourceIds = [sondeSource.id];

      const saved = await dataSource.getRepository(TimeSeries).save([
        // Older NOAA value, superseded by the 2020-01-15 one
        {
          source: noaaSource,
          metric: Metric.DHW,
          value: 3.1,
          timestamp: new Date('2020-01-13T12:00:00Z'),
        },
        {
          source: noaaSource,
          metric: Metric.DHW,
          value: 4.2,
          timestamp: new Date('2020-01-15T23:30:00Z'),
        },
        {
          source: noaaSource,
          metric: Metric.SATELLITE_TEMPERATURE,
          value: 28.5,
          timestamp: new Date('2020-01-15T12:00:00Z'),
        },
        // Recorded the day after: must never show up for 2020-01-15
        {
          source: noaaSource,
          metric: Metric.SATELLITE_TEMPERATURE,
          value: 99,
          timestamp: new Date('2020-01-16T00:00:00Z'),
        },
        {
          source: spotterSource,
          metric: Metric.TOP_TEMPERATURE,
          value: 26,
          timestamp: new Date('2020-01-10T08:00:00Z'),
        },
        // Sonde data uses the extended (2 years) look-back window
        {
          source: sondeSource,
          metric: Metric.SALINITY,
          value: 35.1,
          timestamp: new Date('2019-06-01T00:00:00Z'),
        },
      ]);
      insertedTimeSeriesIds = saved.map((row) => row.id);
    });

    afterAll(async () => {
      await dataSource
        .getRepository(TimeSeries)
        .delete({ id: In(insertedTimeSeriesIds) });
      await dataSource
        .getRepository(Sources)
        .delete({ id: In(insertedSourceIds) });
    });

    it('GET / returns the latest values available at the end of a past day', async () => {
      const rsp = await request(app.getHttpServer())
        .get('/sites')
        .query({ date: '2020-01-15' });

      expect(rsp.status).toBe(200);
      expect(findCalifornia(rsp.body).collectionData).toStrictEqual({
        dhw: 4.2,
        satelliteTemperature: 28.5,
        topTemperature: 26,
        salinity: 35.1,
      });
    });

    it('GET / ignores values recorded after the requested day', async () => {
      const rsp = await request(app.getHttpServer())
        .get('/sites')
        .query({ date: '2020-01-12' });

      expect(rsp.status).toBe(200);
      expect(findCalifornia(rsp.body).collectionData).toStrictEqual({
        topTemperature: 26,
        salinity: 35.1,
      });
    });

    it('GET / only looks back one week for regular sources', async () => {
      // Window for 2020-01-22 starts on 2020-01-15: the 2020-01-10 spotter
      // value and the 2020-01-13 NOAA value are too old to be shown.
      const rsp = await request(app.getHttpServer())
        .get('/sites')
        .query({ date: '2020-01-22' });

      expect(rsp.status).toBe(200);
      expect(findCalifornia(rsp.body).collectionData).toStrictEqual({
        dhw: 4.2,
        satelliteTemperature: 99,
        salinity: 35.1,
      });

      const rsp2 = await request(app.getHttpServer())
        .get('/sites')
        .query({ date: '2020-01-25' });

      expect(rsp2.status).toBe(200);
      expect(findCalifornia(rsp2.body).collectionData).toStrictEqual({
        salinity: 35.1,
      });
    });

    it('GET / returns no collection data for a site without data at that date', async () => {
      const rsp = await request(app.getHttpServer())
        .get('/sites')
        .query({ date: '2010-01-01' });

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBeGreaterThan(0);
      rsp.body.forEach((site) => expect(site.collectionData).toBeUndefined());
    });

    it("GET / with today's date returns the live data", async () => {
      const live = await request(app.getHttpServer()).get('/sites');
      const today = await request(app.getHttpServer())
        .get('/sites')
        .query({ date: DateTime.now().setZone('utc').toISODate() });

      expect(today.status).toBe(200);
      expect(findCalifornia(today.body).collectionData).toStrictEqual(
        findCalifornia(live.body).collectionData,
      );
    });

    it('GET /:id returns the collection data of a past day', async () => {
      const rsp = await request(app.getHttpServer())
        .get(`/sites/${californiaId}`)
        .query({ date: '2020-01-15' });

      expect(rsp.status).toBe(200);
      expect(rsp.body.collectionData).toStrictEqual({
        dhw: 4.2,
        satelliteTemperature: 28.5,
        topTemperature: 26,
        salinity: 35.1,
      });
    });

    it.each(['2020-13-01', '15-01-2020', '2020-01-15T00:00:00Z', 'yesterday'])(
      'GET / rejects invalid date %s',
      async (date) => {
        const rsp = await request(app.getHttpServer())
          .get('/sites')
          .query({ date });

        expect(rsp.status).toBe(400);
      },
    );

    it('GET /:id rejects an invalid date', async () => {
      const rsp = await request(app.getHttpServer())
        .get(`/sites/${californiaId}`)
        .query({ date: '2020-02-30' });

      expect(rsp.status).toBe(400);
    });
  });
};
