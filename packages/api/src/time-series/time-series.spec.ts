import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { max, min } from 'lodash';
import moment from 'moment';
import { TestService } from '../../test/test.service';
import { athensSite, californiaSite } from '../../test/mock/site.mock';
import { athensSurveyPointPiraeus } from '../../test/mock/survey-point.mock';
import { SourceType } from '../sites/schemas/source-type.enum';
import {
  hoboMetrics,
  NOAAMetrics,
  spotterMetrics,
} from '../../test/mock/time-series.mock';

type StringDateRange = [string, string];

export const timeSeriesTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;
  let surveyPointDataRange: StringDateRange = [
    new Date().toISOString(),
    new Date(0).toISOString(),
  ];
  let siteDataRange: StringDateRange = [
    new Date().toISOString(),
    new Date(0).toISOString(),
  ];

  beforeAll(async () => {
    app = await testService.getApp();
  });

  it('GET /sites/:siteId/site-survey-points/:surveyPointId/range fetch range of poi data', async () => {
    const rsp = await request(app.getHttpServer()).get(
      `/time-series/sites/${athensSite.id}/site-survey-points/${athensSurveyPointPiraeus.id}/range`,
    );

    expect(rsp.status).toBe(200);
    const sources = [SourceType.HOBO, SourceType.NOAA, SourceType.SPOTTER];
    sources.forEach((source) => {
      expect(rsp.body).toHaveProperty(source);
    });
    hoboMetrics.forEach((metric) => {
      expect(rsp.body[SourceType.HOBO]).toHaveProperty(metric);
      expect(rsp.body[SourceType.HOBO][metric].length).toBe(1);
      const { minDate, maxDate } = rsp.body[SourceType.HOBO][metric][0];
      const [startDate, endDate] = surveyPointDataRange;
      surveyPointDataRange = [
        min([minDate, startDate]),
        max([maxDate, endDate]),
      ];
    });
    NOAAMetrics.forEach((metric) => {
      expect(rsp.body[SourceType.NOAA]).toHaveProperty(metric);
      expect(rsp.body[SourceType.NOAA][metric].length).toBe(1);
      const { minDate, maxDate } = rsp.body[SourceType.NOAA][metric][0];
      const [startDate, endDate] = surveyPointDataRange;
      surveyPointDataRange = [
        min([minDate, startDate]),
        max([maxDate, endDate]),
      ];
    });
    spotterMetrics.forEach((metric) => {
      expect(rsp.body[SourceType.SPOTTER]).toHaveProperty(metric);
      expect(rsp.body[SourceType.SPOTTER][metric].length).toBe(0);
    });
  });

  it('GET /sites/:id/range fetch range of site data', async () => {
    const rsp = await request(app.getHttpServer()).get(
      `/time-series/sites/${californiaSite.id}/range`,
    );

    expect(rsp.status).toBe(200);
    const sources = [SourceType.HOBO, SourceType.NOAA, SourceType.SPOTTER];
    sources.forEach((source) => {
      expect(rsp.body).toHaveProperty(source);
    });
    hoboMetrics.forEach((metric) => {
      expect(rsp.body[SourceType.HOBO]).toHaveProperty(metric);
      expect(rsp.body[SourceType.HOBO][metric].length).toBe(0);
    });
    NOAAMetrics.forEach((metric) => {
      expect(rsp.body[SourceType.NOAA]).toHaveProperty(metric);
      expect(rsp.body[SourceType.NOAA][metric].length).toBe(1);
      const { minDate, maxDate } = rsp.body[SourceType.NOAA][metric][0];
      const [startDate, endDate] = siteDataRange;
      siteDataRange = [min([minDate, startDate]), max([maxDate, endDate])];
    });
    spotterMetrics.forEach((metric) => {
      expect(rsp.body[SourceType.SPOTTER]).toHaveProperty(metric);
      expect(rsp.body[SourceType.SPOTTER][metric].length).toBe(1);
      const { minDate, maxDate } = rsp.body[SourceType.SPOTTER][metric][0];
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
        start: moment(startDate).subtract(1, 'minute').toISOString(),
        end: moment(endDate).add(1, 'minute').toISOString(),
        metrics: hoboMetrics.concat(NOAAMetrics),
        hourly: false,
      });

    expect(rsp.status).toBe(200);
    const sources = [SourceType.HOBO, SourceType.NOAA, SourceType.SPOTTER];
    sources.forEach((source) => {
      expect(rsp.body).toHaveProperty(source);
    });
    hoboMetrics.forEach((metric) => {
      expect(rsp.body[SourceType.HOBO]).toHaveProperty(metric);
      expect(rsp.body[SourceType.HOBO][metric].length).toBe(10);
    });
    NOAAMetrics.forEach((metric) => {
      expect(rsp.body[SourceType.NOAA]).toHaveProperty(metric);
      expect(rsp.body[SourceType.NOAA][metric].length).toBe(10);
    });
    spotterMetrics.forEach((metric) => {
      expect(rsp.body[SourceType.SPOTTER]).toHaveProperty(metric);
      expect(rsp.body[SourceType.SPOTTER][metric].length).toBe(0);
    });
  });

  it('GET /sites/:siteId/site-survey-points/:surveyPointId fetch site data', async () => {
    const [startDate, endDate] = siteDataRange;
    const rsp = await request(app.getHttpServer())
      .get(`/time-series/sites/${californiaSite.id}`)
      .query({
        // Increase the search window to combat precision issues with the dates
        start: moment(startDate).subtract(1, 'minute').toISOString(),
        end: moment(endDate).add(1, 'minute').toISOString(),
        metrics: spotterMetrics.concat(NOAAMetrics),
        hourly: false,
      });

    expect(rsp.status).toBe(200);
    const sources = [SourceType.HOBO, SourceType.NOAA, SourceType.SPOTTER];
    sources.forEach((source) => {
      expect(rsp.body).toHaveProperty(source);
    });
    hoboMetrics.forEach((metric) => {
      expect(rsp.body[SourceType.HOBO]).toHaveProperty(metric);
      expect(rsp.body[SourceType.HOBO][metric].length).toBe(0);
    });
    NOAAMetrics.forEach((metric) => {
      expect(rsp.body[SourceType.NOAA]).toHaveProperty(metric);
      expect(rsp.body[SourceType.NOAA][metric].length).toBe(10);
    });
    spotterMetrics.forEach((metric) => {
      expect(rsp.body[SourceType.SPOTTER]).toHaveProperty(metric);
      expect(rsp.body[SourceType.SPOTTER][metric].length).toBe(10);
    });
  });
};
