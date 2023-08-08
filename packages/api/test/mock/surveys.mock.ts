import { DateTime } from 'luxon';
import { DeepPartial } from 'typeorm';
import { Survey, WeatherConditions } from '../../src/surveys/surveys.entity';
import { californiaSite } from './site.mock';
import { siteManagerUserMock } from './user.mock';

export const californiaSurveyOne: DeepPartial<Survey> = {
  comments: 'California Survey One',
  diveDate: DateTime.now().minus({ days: 6 }).toJSDate().toISOString(),
  temperature: null,
  weatherConditions: WeatherConditions.Calm,
  user: siteManagerUserMock,
  site: californiaSite,
};

export const californiaSurveyTwo: DeepPartial<Survey> = {
  comments: 'California Survey Two',
  diveDate: DateTime.now().minus({ days: 2 }).toJSDate().toISOString(),
  temperature: null,
  weatherConditions: WeatherConditions.Calm,
  user: siteManagerUserMock,
  site: californiaSite,
};

export const surveys = [californiaSurveyOne, californiaSurveyTwo];
