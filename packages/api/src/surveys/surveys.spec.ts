import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { sortBy } from 'lodash';
import { TestService } from '../../test/test.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { Survey, WeatherConditions } from './surveys.entity';
import { californiaSite, floridaSite } from '../../test/mock/site.mock';
import {
  mockDeleteFile,
  mockDeleteFileFalling,
  mockExtractAndVerifyToken,
} from '../../test/utils';
import {
  adminFirebaseUserMock,
  siteManagerFirebaseUserMock,
} from '../../test/mock/user.mock';
import { CreateSurveyMediaDto } from './dto/create-survey-media.dto';
import { Observations } from './survey-media.entity';
import { floridaSurveyPointOne } from '../../test/mock/survey-point.mock';

const createSurveyDto: CreateSurveyDto = {
  diveDate: new Date(),
  weatherConditions: WeatherConditions.Stormy,
  comments: 'No comments',
};

export const surveyTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;

  let createSurveyFeaturedMediaDto: CreateSurveyMediaDto;
  let createSurveyOverrideMediaDto: CreateSurveyMediaDto;
  let createSurveyHiddenMediaDto: CreateSurveyMediaDto;

  let surveyId: number;
  let overrideMediaId: number;
  let hiddenMediaId: number;

  const createSurveyMediaDto = (featured: boolean, hidden: boolean) => ({
    url: 'https://storage.googleapis.com/storage/reef-image-564894612222.jpg',
    thumbnailUrl:
      'https://storage.googleapis.com/storage/thumbnail-reef-image-564894612222.jpg',
    quality: 1,
    featured,
    hidden,
    metadata: {},
    observations: Observations.Healthy,
    comments: 'No comments',
    surveyPointId: floridaSurveyPointOne.id!,
  });

  beforeAll(async () => {
    app = await testService.getApp();
    createSurveyFeaturedMediaDto = createSurveyMediaDto(false, false);
    createSurveyOverrideMediaDto = createSurveyMediaDto(true, false);
    createSurveyHiddenMediaDto = createSurveyMediaDto(true, true);
  });

  it('POST / create a survey', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .post('/sites/0/surveys/')
      .send(createSurveyDto);

    expect(rsp.status).toBe(404);
  });

  it("GET /:id fetch a non-existing site's survey", async () => {
    const rsp = await request(app.getHttpServer()).get(
      `/sites/${floridaSite.id}/surveys/0`,
    );

    expect(rsp.status).toBe(404);
  });

  it("GET / fetch site's surveys, expect them to have satelliteTemperature", async () => {
    const rsp = await request(app.getHttpServer()).get(
      `/sites/${californiaSite.id}/surveys/`,
    );

    expect(rsp.status).toBe(200);
    expect(rsp.body.length).toBe(2);
    const temperatureArray = rsp.body
      .map((x: Survey) => x.satelliteTemperature)
      .filter((x) => x);
    expect(temperatureArray.length).toBe(2);
  });

  it('PUT /:id update a non-existing survey', async () => {
    mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .put(`/sites/${floridaSite.id}/surveys/0`)
      .send({ comments: 'Does not exist' });

    expect(rsp.status).toBe(404);
  });

  it('PUT /media/:id update a non-existing survey media', async () => {
    mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .put(`/sites/${floridaSite.id}/surveys/media/0`)
      .send({ hidden: false, featured: false });

    expect(rsp.status).toBe(404);
  });

  it('DELETE /media/:id delete a non-existing survey media', async () => {
    mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).delete(
      `/sites/${floridaSite.id}/surveys/media/0`,
    );

    expect(rsp.status).toBe(404);
  });

  it('DELETE /:id delete a non-existing survey', async () => {
    mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).delete(
      `/sites/${floridaSite.id}/surveys/0`,
    );

    expect(rsp.status).toBe(404);
  });

  describe('create a mock survey with media', () => {
    it('POST / create a survey', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post(`/sites/${floridaSite.id}/surveys/`)
        .send(createSurveyDto);

      expect(rsp.status).toBe(201);
      expect(rsp.body).toMatchObject({
        ...createSurveyDto,
        diveDate: createSurveyDto.diveDate.toISOString(),
      });
      expect(rsp.body.site).toBeDefined();
      expect(rsp.body.user).toBeDefined();
      expect(rsp.body.id).toBeDefined();
      surveyId = rsp.body.id;
    });

    it('POST /:id/media create a survey media', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post(`/sites/${floridaSite.id}/surveys/${surveyId}/media`)
        .send(createSurveyFeaturedMediaDto);

      expect(rsp.status).toBe(201);
      expect(rsp.body).toMatchObject({
        ...createSurveyFeaturedMediaDto,
        // Featured flag should change to true
        featured: true,
      });
    });

    it('POST /:id/media create a survey media on a non-existing survey', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post(`/sites/${floridaSite.id}/surveys/0/media`)
        .send(createSurveyFeaturedMediaDto);

      expect(rsp.status).toBe(404);
    });

    it('POST /:id/media override the featured survey media', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post(`/sites/${floridaSite.id}/surveys/${surveyId}/media`)
        .send(createSurveyOverrideMediaDto);

      expect(rsp.status).toBe(201);
      expect(rsp.body).toMatchObject(createSurveyOverrideMediaDto);
      expect(rsp.body.id).toBeDefined();
      overrideMediaId = rsp.body.id;
    });

    it('POST /:id/media create a hidden survey media', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post(`/sites/${floridaSite.id}/surveys/${surveyId}/media`)
        .send(createSurveyHiddenMediaDto);

      expect(rsp.status).toBe(201);
      expect(rsp.body).toMatchObject({
        ...createSurveyHiddenMediaDto,
        // Featured flag should change to false
        featured: false,
      });
      expect(rsp.body.id).toBeDefined();
      hiddenMediaId = rsp.body.id;
    });

    it("GET / fetch all site's surveys", async () => {
      const rsp = await request(app.getHttpServer()).get(
        `/sites/${floridaSite.id}/surveys/`,
      );

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBe(1);
      expect(rsp.body[0]).toMatchObject({
        ...createSurveyDto,
        diveDate: createSurveyDto.diveDate.toISOString(),
      });
    });

    it("GET /:id fetch site's survey", async () => {
      const rsp = await request(app.getHttpServer()).get(
        `/sites/${floridaSite.id}/surveys/${surveyId}`,
      );

      expect(rsp.status).toBe(200);
      expect(rsp.body).toMatchObject({
        ...createSurveyDto,
        diveDate: createSurveyDto.diveDate.toISOString(),
      });
    });

    it("GET /:id/media fetch survey's media", async () => {
      const rsp = await request(app.getHttpServer()).get(
        `/sites/${floridaSite.id}/surveys/${surveyId}/media`,
      );

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBe(3);
      const sortedMedia = sortBy(rsp.body, 'id');
      expect(sortedMedia[0]).toMatchObject(createSurveyFeaturedMediaDto);
      expect(sortedMedia[1]).toMatchObject(createSurveyOverrideMediaDto);
      expect(sortedMedia[2]).toMatchObject({
        ...createSurveyHiddenMediaDto,
        // Featured flag should change to false
        featured: false,
      });
    });

    it('PUT /:id update a survey', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const updatedComments = 'Updated comments';
      const rsp = await request(app.getHttpServer())
        .put(`/sites/${floridaSite.id}/surveys/${surveyId}`)
        .send({ comments: updatedComments });

      expect(rsp.status).toBe(200);
      expect(rsp.body.comments).toBe(updatedComments);
    });

    it('PUT /media/:id update a survey media', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .put(`/sites/${floridaSite.id}/surveys/media/${hiddenMediaId}`)
        .send({ hidden: false, featured: false });

      expect(rsp.status).toBe(200);
      expect(rsp.body.hidden).toBe(false);
      expect(rsp.body.featured).toBe(false);
    });

    it('DELETE /media/:id delete the featured survey media', async () => {
      mockDeleteFile(app);
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).delete(
        `/sites/${floridaSite.id}/surveys/media/${overrideMediaId}`,
      );

      expect(rsp.status).toBe(200);
    });

    it('DELETE /media/:id fail to delete survey media', async () => {
      mockDeleteFileFalling(app);
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).delete(
        `/sites/${floridaSite.id}/surveys/media/${hiddenMediaId}`,
      );

      expect(rsp.status).toBe(500);
    });

    it('GET /:id/media check there is still a featured survey media', async () => {
      const rsp = await request(app.getHttpServer()).get(
        `/sites/${floridaSite.id}/surveys/${surveyId}/media`,
      );

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBe(2);
      const sortedMedia = sortBy(rsp.body, 'id');
      expect(sortedMedia[0].featured).toBe(true);
    });

    it('DELETE /:id delete the survey', async () => {
      mockDeleteFileFalling(app);
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).delete(
        `/sites/${floridaSite.id}/surveys/${surveyId}`,
      );

      expect(rsp.status).toBe(200);
    });
  });

  describe('create a survey for testing some edge cases', () => {
    it('POST / create a survey', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post(`/sites/${floridaSite.id}/surveys/`)
        .send(createSurveyDto);

      expect(rsp.status).toBe(201);
      expect(rsp.body.id).toBeDefined();
      surveyId = rsp.body.id;
    });

    it('POST /:id/media create a survey media', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .post(`/sites/${floridaSite.id}/surveys/${surveyId}/media`)
        .send(createSurveyOverrideMediaDto);

      expect(rsp.status).toBe(201);
      expect(rsp.body.id).toBeDefined();
      overrideMediaId = rsp.body.id;
    });

    it('PUT /media/:id update a survey media without featured and hidden flags', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).put(
        `/sites/${floridaSite.id}/surveys/media/${overrideMediaId}`,
      );

      expect(rsp.status).toBe(400);
    });

    it('PUT /media/:id update a survey media without featured and hidden flags', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .put(`/sites/${floridaSite.id}/surveys/media/${overrideMediaId}`)
        .send({ featured: false, hidden: false });

      expect(rsp.status).toBe(200);
      expect(rsp.body.featured).toBe(false);
    });

    it('PUT /media/:id update a survey media without featured and hidden flags', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .put(`/sites/${floridaSite.id}/surveys/media/${overrideMediaId}`)
        .send({ featured: true, hidden: false });

      expect(rsp.status).toBe(200);
      expect(rsp.body.featured).toBe(true);
    });

    it('DELETE /media/:id delete last survey media', async () => {
      mockDeleteFile(app);
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).delete(
        `/sites/${floridaSite.id}/surveys/media/${overrideMediaId}`,
      );

      expect(rsp.status).toBe(200);
    });

    it('DELETE /:id delete survey', async () => {
      mockDeleteFile(app);
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).delete(
        `/sites/${floridaSite.id}/surveys/${surveyId}`,
      );

      expect(rsp.status).toBe(200);
    });
  });
};
