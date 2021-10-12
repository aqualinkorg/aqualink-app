import Faker from 'faker';
import { define } from 'typeorm-seeding';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';

define(SiteSurveyPoint, (faker: typeof Faker) => {
  const siteSurveyPoint = new SiteSurveyPoint();

  siteSurveyPoint.name = `Mock Site Point Of Interest ${faker.name.lastName()}`;

  return siteSurveyPoint;
});
