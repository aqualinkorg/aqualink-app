import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { TestService } from '../../test/test.service';
import { mockExtractAndVerifyToken } from '../../test/utils';
import {
  adminFirebaseUserMock,
  defaultFirebaseUserMock,
} from '../../test/mock/user.mock';
import { PostMonitoringMetricDto } from './dto/post-monitoring-metric.dto';
import { MonitoringMetric } from './schemas/monitoring-metric.enum';
import { californiaSite } from '../../test/mock/site.mock';

export const monitoringTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;
  let dataSource: DataSource;
  let postMetricDto: PostMonitoringMetricDto;

  beforeAll(async () => {
    app = await testService.getApp();
    dataSource = await testService.getDataSource();
    const site = await dataSource
      .getRepository(Site)
      .findOne({ where: { name: californiaSite.name as string } });

    postMetricDto = {
      metric: MonitoringMetric.TimeSeriesRequest,
      siteId: site?.id as number,
    };
  });

  it('POST / post a usage metric non auth user', async () => {
    const rsp = await request(app.getHttpServer())
      .post('/monitoring')
      .send(postMetricDto);

    expect(rsp.status).toBe(401);
  });

  it('POST / post a usage metric auth user', async () => {
    mockExtractAndVerifyToken(defaultFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .post('/monitoring')
      .send(postMetricDto);

    expect(rsp.status).toBe(201);
  });

  it('GET / get usage stats non admin user', async () => {
    mockExtractAndVerifyToken(defaultFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .get(
        `/monitoring?${new URLSearchParams({
          spotterId: 'SPOT-0930',
        })}`,
      )
      .send();

    expect(rsp.status).toBe(403);
  });

  it('GET / get usage stats admin user', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .get(
        `/monitoring?${new URLSearchParams({
          spotterId: 'SPOT-0930',
        })}`,
      )
      .send();

    expect(rsp.status).toBe(200);

    expect(rsp.body[0].data[0].totalRequests).toBe(2);
    expect(rsp.body[0].data[0].registeredUserRequests).toBe(1);
  });

  it('GET /surveys-report get surveys report', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .get('/monitoring/surveys-report')
      .send();

    expect(rsp.status).toBe(200);
    // Expect at least the 2 mock surveys, but allow for additional surveys created during testing
    expect(rsp.body.length).toBeGreaterThanOrEqual(2);

    expect(rsp.body[0].siteId).toBeDefined();
    expect(rsp.body[0].surveyId).toBeDefined();
    expect(rsp.body[0].diveDate).toBeDefined();
    expect(rsp.body[0].updatedAt).toBeDefined();
    expect(rsp.body[0].siteName).toBeDefined();
    expect(rsp.body[0].userEmail).toBeDefined();
    expect(rsp.body[0].userFullName).toBeDefined();
    expect(rsp.body[0].surveyMediaCount).toBeDefined();
  });

  it('GET /sites-overview get sites overview', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .get('/monitoring/sites-overview')
      .send();

    expect(rsp.status).toBe(200);
    expect(rsp.body.length).toBe(3);

    expect(rsp.body[0].siteId).toBeDefined();
    expect(rsp.body[0].siteName).toBeDefined();
    expect(rsp.body[0].organizations).toBeDefined();
    expect(rsp.body[0].adminNames).toBeDefined();
    expect(rsp.body[0].adminEmails).toBeDefined();
    expect(rsp.body[0].status).toBeDefined();
    expect(rsp.body[0].depth).toBeDefined();
    expect(rsp.body[0].spotterId).toBeDefined();
    expect(rsp.body[0].videoStream).toBeDefined();
    expect(rsp.body[0].updatedAt).toBeDefined();
    expect(rsp.body[0].lastDataReceived).toBeDefined();
    expect(rsp.body[0].surveysCount).toBeDefined();
    expect(rsp.body[0].contactInformation).toBeDefined();
    expect(rsp.body[0].createdAt).toBeDefined();
  });

  it('GET /sites-status', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .get('/monitoring/sites-status')
      .send();

    expect(rsp.status).toBe(200);

    expect(rsp.body.totalSites).toBeDefined();
    expect(rsp.body.deployed).toBeDefined();
    expect(rsp.body.displayed).toBeDefined();
    expect(rsp.body.maintenance).toBeDefined();
    expect(rsp.body.shipped).toBeDefined();
    expect(rsp.body.endOfLife).toBeDefined();
    expect(rsp.body.lost).toBeDefined();
  });
};
