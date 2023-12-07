import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DateTime } from '../luxon-extensions';
import { californiaSite } from '../../test/mock/site.mock';
import { TestService } from '../../test/test.service';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Metric } from '../time-series/metrics.enum';

export const sensorTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;

  beforeAll(async () => {
    app = await testService.getApp();
  });

  it('GET / retrieve sites with sensors', async () => {
    const rsp = await request(app.getHttpServer()).get('/sensors');

    expect(rsp.status).toBe(200);
    expect(rsp.body.length).toBe(2);
  });

  it('GET /:id/data fetch sensor data', async () => {
    const rsp = await request(app.getHttpServer())
      .get(`/sensors/${californiaSite.sensorId}/data`)
      .query({
        startDate: DateTime.now()
          .minus({ days: 5 })
          .startOf('day')
          .toISOString(),
        endDate: DateTime.now().endOf('day').toISOString(),
        metrics: Metric.TOP_TEMPERATURE,
      });

    expect(rsp.status).toBe(200);
    const metrics = [Metric.TOP_TEMPERATURE];
    metrics.forEach((metric) => {
      expect(rsp.body).toHaveProperty(metric);
    });

    const spotterRsp = rsp.body[Metric.TOP_TEMPERATURE].find(
      (x) => x.type === SourceType.SPOTTER,
    );
    expect(spotterRsp.data.length).toBe(6);
  });

  it('GET /:id/surveys fetch sensor surveys', async () => {
    const rsp = await request(app.getHttpServer()).get(
      `/sensors/${californiaSite.sensorId}/surveys`,
    );

    expect(rsp.status).toBe(200);
    expect(rsp.body.length).toBe(2);
  });

  it('GET /:id/data fetch sensor data with invalid metric', async () => {
    const rsp = await request(app.getHttpServer())
      .get(`/sensors/${californiaSite.sensorId}/data`)
      .query({
        startDate: DateTime.now()
          .minus({ days: 5 })
          .startOf('day')
          .toISOString(),
        endDate: DateTime.now().endOf('day').toISOString(),
        metrics: 'invalidMetric',
      });

    expect(rsp.status).toBe(400);
  });
};
