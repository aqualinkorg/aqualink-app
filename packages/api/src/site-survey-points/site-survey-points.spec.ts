import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { omit } from 'lodash';
import { TestService } from '../../test/test.service';
import { CreateSiteSurveyPointDto } from './dto/create-survey-point.dto';
import { athensSite } from '../../test/mock/site.mock';
import { createPoint } from '../utils/coordinates';
import { mockExtractAndVerifyToken } from '../../test/utils';
import { adminFirebaseUserMock } from '../../test/mock/user.mock';

export const surveyPointTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;
  let createSurveyPointDto: CreateSiteSurveyPointDto;
  let createSurveyPointWithoutLocationDto: CreateSiteSurveyPointDto;
  let surveyPointId: number;
  let surveyPointWithoutLocationId: number;

  beforeAll(async () => {
    app = await testService.getApp();
    createSurveyPointDto = {
      name: 'Salamina',
      siteId: athensSite.id || 0,
      imageUrl: 'http://some-sample-url.com',
      latitude: 37.95813968719644,
      longitude: 23.478834700473044,
    };

    createSurveyPointWithoutLocationDto = {
      name: 'Atlantis',
      siteId: athensSite.id || 0,
      imageUrl: 'http://some-sample-url.com',
    };
  });

  it('POST / create a survey_point', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .post('/site-survey-points')
      .send(createSurveyPointDto);

    expect(rsp.status).toBe(201);
    expect(rsp.body).toMatchObject({
      ...omit(createSurveyPointDto, 'latitude', 'longitude'),
      polygon: createPoint(
        createSurveyPointDto.longitude!,
        createSurveyPointDto.latitude!,
      ),
    });
    expect(rsp.body.id).toBeDefined();
    surveyPointId = rsp.body.id;
  });

  it('POST / create a survey_point without a location', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .post('/site-survey-points')
      .send(createSurveyPointWithoutLocationDto);

    expect(rsp.status).toBe(201);
    expect(rsp.body).toMatchObject(createSurveyPointWithoutLocationDto);
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
        name: createSurveyPointDto.name,
        siteId: createSurveyPointDto.siteId,
      });

    expect(rsp.status).toBe(200);
    expect(rsp.body.length).toBe(1);
    expect(rsp.body[0]).toMatchObject({
      ...omit(createSurveyPointDto, 'latitude', 'longitude'),
      polygon: createPoint(
        createSurveyPointDto.longitude!,
        createSurveyPointDto.latitude!,
      ),
    });
  });

  it('GET /:id fetch a survey_point', async () => {
    const rsp = await request(app.getHttpServer()).get(
      `/site-survey-points/${surveyPointId}`,
    );

    expect(rsp.status).toBe(200);
    expect(rsp.body).toMatchObject({
      ...omit(createSurveyPointDto, 'latitude', 'longitude'),
      polygon: createPoint(
        createSurveyPointDto.longitude!,
        createSurveyPointDto.latitude!,
      ),
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
