/* eslint-disable dot-notation */
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { max, min, union } from 'lodash';
import { join } from 'path';
import { readFileSync } from 'fs';
import * as structuredClone from '@ungap/structured-clone';
import { DateTime } from 'luxon';
import { DataSource } from 'typeorm';
// eslint-disable-next-line import/no-unresolved
import { stringify } from 'csv-stringify/sync';
import { TestService } from '../../test/test.service';
import { athensSite, californiaSite } from '../../test/mock/site.mock';
import { athensSurveyPointPiraeus } from '../../test/mock/survey-point.mock';
import { SourceType } from '../sites/schemas/source-type.enum';
import {
  hoboMetrics,
  NOAAMetrics,
  spotterMetrics,
} from '../../test/mock/time-series.mock';
import { csvDataMock } from '../../test/mock/data-uploads-csv-data.mock';
import { mockExtractAndVerifyToken } from '../../test/utils';
import {
  siteManager2FirebaseUserMock,
  siteManagerUserMock,
} from '../../test/mock/user.mock';
import { User } from '../users/users.entity';
import { Site } from '../sites/sites.entity';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';

// https://github.com/jsdom/jsdom/issues/3363
global.structuredClone = structuredClone.default as any;

type StringDateRange = [string, string];

export const timeSeriesTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;
  let dataSource: DataSource;
  let surveyPointDataRange: StringDateRange = [
    new Date(0).toISOString(),
    new Date().toISOString(),
  ];
  let siteDataRange: StringDateRange = [
    new Date(0).toISOString(),
    new Date().toISOString(),
  ];

  beforeAll(async () => {
    app = await testService.getApp();
    dataSource = await testService.getDataSource();
  });

  it('GET /sites/:siteId/site-survey-points/:surveyPointId/range fetch range of poi data', async () => {
    const rsp = await request(app.getHttpServer()).get(
      `/time-series/sites/${athensSite.id}/site-survey-points/${athensSurveyPointPiraeus.id}/range`,
    );

    expect(rsp.status).toBe(200);
    const metrics = union(hoboMetrics, NOAAMetrics);
    metrics.forEach((metric) => {
      expect(rsp.body).toHaveProperty(metric);
    });
    hoboMetrics.forEach((metric) => {
      expect(rsp.body[metric]).toHaveProperty(SourceType.HOBO);
      expect(rsp.body[metric][SourceType.HOBO].data.length).toBe(1);
      const { minDate, maxDate } = rsp.body[metric][SourceType.HOBO].data[0];
      const [startDate, endDate] = surveyPointDataRange;
      surveyPointDataRange = [
        min([minDate, startDate]),
        max([maxDate, endDate]),
      ];
    });
    NOAAMetrics.forEach((metric) => {
      expect(rsp.body[metric]).toHaveProperty(SourceType.NOAA);
      expect(rsp.body[metric][SourceType.NOAA].data.length).toBe(1);
      const { minDate, maxDate } = rsp.body[metric][SourceType.NOAA].data[0];
      const [startDate, endDate] = surveyPointDataRange;
      surveyPointDataRange = [
        min([minDate, startDate]),
        max([maxDate, endDate]),
      ];
    });
  });

  it('GET /sites/:id/range fetch range of site data', async () => {
    const rsp = await request(app.getHttpServer()).get(
      `/time-series/sites/${californiaSite.id}/range`,
    );

    expect(rsp.status).toBe(200);
    const metrics = union(NOAAMetrics, spotterMetrics);
    metrics.forEach((metric) => {
      expect(rsp.body).toHaveProperty(metric);
    });
    NOAAMetrics.forEach((metric) => {
      expect(rsp.body[metric]).toHaveProperty(SourceType.NOAA);
      expect(rsp.body[metric][SourceType.NOAA].data.length).toBe(1);
      const { minDate, maxDate } = rsp.body[metric][SourceType.NOAA].data[0];
      const [startDate, endDate] = siteDataRange;
      siteDataRange = [min([minDate, startDate]), max([maxDate, endDate])];
    });
    spotterMetrics.forEach((metric) => {
      expect(rsp.body[metric]).toHaveProperty(SourceType.SPOTTER);
      expect(rsp.body[metric][SourceType.SPOTTER].data.length).toBe(1);
      const { minDate, maxDate } = rsp.body[metric][SourceType.SPOTTER].data[0];
      const [startDate, endDate] = siteDataRange;
      siteDataRange = [min([minDate, startDate]), max([maxDate, endDate])];
    });
  });

  it('GET /sites/:siteId/site-survey-points/:surveyPointId fetch poi data', async () => {
    const [startDate, endDate] = surveyPointDataRange;
    const rsp = await request(app.getHttpServer())
      .get(
        `/time-series/sites/${athensSite.id}/site-survey-points/${athensSurveyPointPiraeus.id}`,
      )
      .query({
        // Increase the search window to combat precision issues with the dates
        start: DateTime.fromISO(startDate).minus({ minutes: 1 }).toISOString(),
        end: DateTime.fromISO(endDate).plus({ days: 1 }).toISOString(),
        metrics: hoboMetrics.concat(NOAAMetrics),
        hourly: false,
      });

    expect(rsp.status).toBe(200);
    const metrics = union(hoboMetrics, NOAAMetrics);
    metrics.forEach((metric) => {
      expect(rsp.body).toHaveProperty(metric);
    });
    hoboMetrics.forEach((metric) => {
      expect(rsp.body[metric]).toHaveProperty(SourceType.HOBO);
      expect(rsp.body[metric][SourceType.HOBO].data.length).toBe(10);
    });
    NOAAMetrics.forEach((metric) => {
      expect(rsp.body[metric]).toHaveProperty(SourceType.NOAA);
      expect(rsp.body[metric][SourceType.NOAA].data.length).toBe(10);
    });
  });

  it('GET /sites/:siteId fetch site data', async () => {
    const [startDate, endDate] = siteDataRange;
    const rsp = await request(app.getHttpServer())
      .get(`/time-series/sites/${californiaSite.id}`)
      .query({
        // Increase the search window to combat precision issues with the dates
        start: DateTime.fromISO(startDate).minus({ minutes: 1 }).toISOString(),
        end: DateTime.fromISO(endDate).plus({ days: 1 }).toISOString(),
        metrics: spotterMetrics.concat(NOAAMetrics),
        hourly: false,
      });

    expect(rsp.status).toBe(200);
    const metrics = union(NOAAMetrics, spotterMetrics);
    metrics.forEach((metric) => {
      expect(rsp.body).toHaveProperty(metric);
    });
    NOAAMetrics.forEach((metric) => {
      expect(rsp.body[metric]).toHaveProperty(SourceType.NOAA);
      expect(rsp.body[metric][SourceType.NOAA].data.length).toBe(10);
    });
    spotterMetrics.forEach((metric) => {
      expect(rsp.body[metric]).toHaveProperty(SourceType.SPOTTER);
      expect(rsp.body[metric][SourceType.SPOTTER].data.length).toBe(10);
    });
  });

  it('GET sample-upload-files/:source fetch sample data', async () => {
    const expectedData = readFileSync(
      join(process.cwd(), 'src/utils/uploads/hobo_data.csv'),
      'utf-8',
    );
    const rsp = await request(app.getHttpServer())
      .get('/time-series/sample-upload-files/hobo')
      .set('Accept', 'text/csv');

    expect(rsp.status).toBe(200);
    expect(rsp.headers['content-type']).toMatch(/^text\/csv/);
    expect(rsp.text).toMatch(expectedData);
  });

  // TODO: find out why this test fails on github ci
  describe.skip('POST /upload uploads data', () => {
    let firstSiteRows: number;
    let user: User | null;
    let sites: Site[];
    let surveyPoints: SiteSurveyPoint[];
    let fistSitePointId: number;

    it('setups the user relations', async () => {
      user = await dataSource.getRepository(User).findOne({
        where: { firebaseUid: siteManagerUserMock.firebaseUid as string },
        select: ['id'],
      });

      sites = await dataSource.getRepository(Site).find();
      expect(sites.length).toBe(3);

      surveyPoints = await dataSource.getRepository(SiteSurveyPoint).find();
      fistSitePointId = surveyPoints.find((x) => x.siteId === sites[0].id)
        ?.id as number;

      expect(fistSitePointId).toBeDefined();
      expect(csvDataMock.length).toBe(30);

      await dataSource
        .getRepository(User)
        .createQueryBuilder('user')
        .relation('administeredSites')
        .of(user)
        .add(sites.slice(0, 2));

      firstSiteRows = 20;
    });

    it('completes the request with correct data', async () => {
      const editedData = csvDataMock.map((row, i) => {
        const result = row;

        if (i < firstSiteRows) result['aqualink_site_id'] = sites[0].id;
        else result['aqualink_site_id'] = sites[1].id;

        if (i < firstSiteRows)
          result['aqualink_survey_point_id'] = fistSitePointId;
        else result['aqualink_survey_point_id'] = '';

        if (i < firstSiteRows - 10)
          result['aqualink_sensor_type'] = SourceType.HUI;
        else result['aqualink_sensor_type'] = SourceType.SONDE;

        return result;
      });

      const csvString = stringify(editedData, { header: true });

      mockExtractAndVerifyToken(siteManager2FirebaseUserMock);
      const resp = await request(app.getHttpServer())
        .post('/time-series/upload?failOnWarning=false')
        .attach('files', Buffer.from(csvString), 'data.csv')
        .set('Content-Type', 'text/csv');

      expect(resp.status).toBe(201);

      expect(
        resp.body.find((x) => x.error !== undefined && x.error !== null),
      ).toBeUndefined();
    });

    it('upload fails for wrong site id', async () => {
      const editedData = csvDataMock.map((row, i) => {
        const result = row;

        // 2 is the invalid site ID here, since the user is admin only to sites 0 and 1
        if (i < firstSiteRows) result['aqualink_site_id'] = sites[0].id;
        else result['aqualink_site_id'] = sites[2].id;

        return result;
      });

      const csvString = stringify(editedData, { header: true });

      mockExtractAndVerifyToken(siteManager2FirebaseUserMock);
      const response = await request(app.getHttpServer())
        .post('/time-series/upload?failOnWarning=false')
        .attach('files', Buffer.from(csvString), 'data2.csv')
        .set('Content-Type', 'text/csv');

      expect(
        response.body.find(
          (x) => x.error === `Invalid values for 'aqualink_site_id'`,
        ),
      ).toBeDefined();
    });

    it('upload fails for wrong survey point id', async () => {
      const wrongPointId = surveyPoints.find((x) => x.id !== fistSitePointId)
        ?.id as number;

      const editedData = csvDataMock.map((row, i) => {
        const result = row;

        if (i < firstSiteRows) result['aqualink_site_id'] = sites[0].id;
        else result['aqualink_site_id'] = sites[1].id;

        if (i < firstSiteRows)
          result['aqualink_survey_point_id'] = wrongPointId;
        else result['aqualink_survey_point_id'] = '';

        return result;
      });

      const csvString = stringify(editedData, { header: true });

      mockExtractAndVerifyToken(siteManager2FirebaseUserMock);
      const response = await request(app.getHttpServer())
        .post('/time-series/upload?failOnWarning=false')
        .attach('files', Buffer.from(csvString), 'data2.csv')
        .set('Content-Type', 'text/csv');

      expect(
        response.body.find((x) =>
          (x.error as string).startsWith('Survey point with id'),
        ),
      ).toBeDefined();
    });
  });

  it('GET sites/:siteId/csv fetch data as csv', async () => {
    const rsp = await request(app.getHttpServer())
      .get(`/time-series/sites/${californiaSite.id}/csv`)
      .query({ hourly: true })
      .set('Accept', 'text/csv');

    expect(rsp.status).toBe(200);
    expect(rsp.headers['content-type']).toMatch(/^text\/csv/);
  });
};
