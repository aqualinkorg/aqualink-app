import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { Site } from 'sites/sites.entity';
import { User } from 'users/users.entity';
import { TestService } from '../../test/test.service';
import { mockExtractAndVerifyToken } from '../../test/utils';
import {
  adminFirebaseUserMock,
  defaultFirebaseUserMock,
  defaultUserMock,
} from '../../test/mock/user.mock';
import { PostMonitoringMetricDto } from './dto/post-monitoring-metric.dto';
import { MonitoringMetric } from './schemas/monitoring-metric.enum';
import { californiaSite } from '../../test/mock/site.mock';

export const monitoringTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;
  let dataSource: DataSource;
  let postMetricDto: PostMonitoringMetricDto;
  let userId: number;

  beforeAll(async () => {
    app = await testService.getApp();
    dataSource = await testService.getDataSource();
    const site = await dataSource
      .getRepository(Site)
      .findOne({ where: { name: californiaSite.name as string } });

    const user = await dataSource
      .getRepository(User)
      .findOne({ where: { email: defaultUserMock.email } });

    userId = user?.id as number;

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
    const rsp = await request(app.getHttpServer()).get('/monitoring').send();

    expect(rsp.status).toBe(403);
  });

  it('GET / get usage stats admin user', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp1 = await request(app.getHttpServer()).get('/monitoring').send();
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp2 = await request(app.getHttpServer())
      .get(`/monitoring?userId=${userId}`)
      .send();

    expect(rsp1.status).toBe(200);
    expect(rsp2.status).toBe(200);

    expect(rsp1.body.length).toBe(3);
    expect(rsp2.body.length).toBe(1);
  });
};
