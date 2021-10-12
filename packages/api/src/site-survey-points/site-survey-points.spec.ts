import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { omit } from 'lodash';
import { TestService } from '../../test/test.service';
import { CreateSitePoiDto } from './dto/create-survey-point.dto';
import { athensSite } from '../../test/mock/site.mock';
import { createPoint } from '../utils/coordinates';
import { mockExtractAndVerifyToken } from '../../test/utils';
import { adminFirebaseUserMock } from '../../test/mock/user.mock';

export const surveyPointTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;
  let createPoiDto: CreateSitePoiDto;
  let createPoiWithoutLocationDto: CreateSitePoiDto;
  let surveyPointId: number;
  let surveyPointWithoutLocationId: number;

  beforeAll(async () => {
    app = await testService.getApp();
    createPoiDto = {
      name: 'Salamina',
      siteId: athensSite.id || 0,
      imageUrl: 'http://some-sample-url.com',
      latitude: 37.95813968719644,
      longitude: 23.478834700473044,
    };

    createPoiWithoutLocationDto = {
      name: 'Atlantis',
      siteId: athensSite.id || 0,
      imageUrl: 'http://some-sample-url.com',
    };
  });

  it('POST / create a survey_point', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .post('/site-survey-points')
      .send(createPoiDto);

    expect(rsp.status).toBe(201);
    expect(rsp.body).toMatchObject({
      ...omit(createPoiDto, 'latitude', 'longitude'),
      polygon: createPoint(createPoiDto.longitude!, createPoiDto.latitude!),
    });
    expect(rsp.body.id).toBeDefined();
    surveyPointId = rsp.body.id;
  });

  it('POST / create a survey_point without a location', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .post('/site-survey-points')
      .send(createPoiWithoutLocationDto);

    expect(rsp.status).toBe(201);
    expect(rsp.body).toMatchObject(createPoiWithoutLocationDto);
    expect(rsp.body.id).toBeDefined();
    surveyPointWithoutLocationId = rsp.body.id;
  });

  it('GET / fetch surveyPoints', async () => {
    const rsp = await request(app.getHttpServer()).get('/site-survey-points');

    expect(rsp.status).toBe(200);
    expect(rsp.body.length).toBe(6);
  });

  it('GET / fetch surveyPoints with filters', async () => {
    const rsp = await request(app.getHttpServer())
      .get('/site-survey-points')
      .query({
        name: createPoiDto.name,
        siteId: createPoiDto.siteId,
      });

    expect(rsp.status).toBe(200);
    expect(rsp.body.length).toBe(1);
    expect(rsp.body[0]).toMatchObject({
      ...omit(createPoiDto, 'latitude', 'longitude'),
      polygon: createPoint(createPoiDto.longitude!, createPoiDto.latitude!),
    });
  });

  it('GET /:id fetch a survey_point', async () => {
    const rsp = await request(app.getHttpServer()).get(
      `/site-survey-points/${surveyPointId}`,
    );

    expect(rsp.status).toBe(200);
    expect(rsp.body).toMatchObject({
      ...omit(createPoiDto, 'latitude', 'longitude'),
      polygon: createPoint(createPoiDto.longitude!, createPoiDto.latitude!),
    });
  });

  it('PUT /:id update a survey_point', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const updatedName = 'Updated survey_point name';
    const nameRsp = await request(app.getHttpServer())
      .put(`/site-survey-points/${surveyPointId}`)
      .send({
        name: updatedName,
      });

    expect(nameRsp.status).toBe(200);
    expect(nameRsp.body.name).toBe(updatedName);

    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const coordinates = [37.94717566570979, 23.478505804426504];
    const polygonRsp = await request(app.getHttpServer())
      .put(`/site-survey-points/${surveyPointId}`)
      .send({
        latitude: coordinates[0],
        longitude: coordinates[1],
      });

    expect(polygonRsp.status).toBe(200);
    expect(polygonRsp.body.polygon).toStrictEqual(
      createPoint(coordinates[1], coordinates[0]),
    );
  });

  it('DELETE /:id delete a survey_point', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).delete(
      `/site-survey-points/${surveyPointId}`,
    );

    expect(rsp.status).toBe(200);
  });

  it('DELETE /:id delete another survey_point', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).delete(
      `/site-survey-points/${surveyPointWithoutLocationId}`,
    );

    expect(rsp.status).toBe(200);
  });

  it('GET /:id fetch non-existing survey_point', async () => {
    const rsp = await request(app.getHttpServer()).get('/site-survey-points/0');

    expect(rsp.status).toBe(404);
  });

  it('PUT /:id update non-existing survey_point', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const update = 'Updated Poi';
    const rsp = await request(app.getHttpServer())
      .put('/site-survey-points/0')
      .send({
        name: update,
      });

    expect(rsp.status).toBe(404);
  });

  it('DELETE /:id delete non-existing survey_point', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).delete(
      '/site-survey-points/0',
    );

    expect(rsp.status).toBe(404);
  });
};
