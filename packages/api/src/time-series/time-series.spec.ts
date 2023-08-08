import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { max, min, union } from 'lodash';
import { join } from 'path';
import { readFileSync } from 'fs';
import * as structuredClone from '@ungap/structured-clone';
import { DateTime } from 'luxon';
import { TestService } from '../../test/test.service';
import { athensSite, californiaSite } from '../../test/mock/site.mock';
import { athensSurveyPointPiraeus } from '../../test/mock/survey-point.mock';
import { SourceType } from '../sites/schemas/source-type.enum';
import {
  hoboMetrics,
  NOAAMetrics,
  spotterMetrics,
} from '../../test/mock/time-series.mock';

// https://github.com/jsdom/jsdom/issues/3363
global.structuredClone = structuredClone.default as any;

type StringDateRange = [string, string];

export const timeSeriesTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;
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
        start: DateTime.fromISO(startDate)
          .minus({ minutes: 1 })
          .toJSDate()
          .toISOString(),
        end: DateTime.fromISO(endDate)
          .plus({ days: 1 })
          .toJSDate()
          .toISOString(),
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
        start: DateTime.fromISO(startDate)
          .minus({ minutes: 1 })
          .toJSDate()
          .toISOString(),
        end: DateTime.fromISO(endDate)
          .plus({ days: 1 })
          .toJSDate()
          .toISOString(),
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

  it('GET sites/:siteId/csv fetch data as csv', async () => {
    const rsp = await request(app.getHttpServer())
      .get(`/time-series/sites/${californiaSite.id}/csv`)
      .query({ hourly: true })
      .set('Accept', 'text/csv');

    expect(rsp.status).toBe(200);
    expect(rsp.headers['content-type']).toMatch(/^text\/csv/);
  });
};
