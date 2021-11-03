import { DeepPartial } from 'typeorm';
import { SourceType } from '../../src/sites/schemas/source-type.enum';
import { Sources } from '../../src/sites/sources.entity';
import { athensSite, californiaSite, floridaSite } from './site.mock';
import { athensSurveyPointPiraeus } from './survey-point.mock';

export const californiaSpotterSource: DeepPartial<Sources> = {
  site: californiaSite,
  type: SourceType.SPOTTER,
  sensorId: californiaSite.sensorId,
};

export const californiaNOAASource: DeepPartial<Sources> = {
  site: californiaSite,
  type: SourceType.NOAA,
};

export const floridaNOAASource: DeepPartial<Sources> = {
  site: floridaSite,
  type: SourceType.NOAA,
};

export const athensNOAASource: DeepPartial<Sources> = {
  site: athensSite,
  type: SourceType.NOAA,
};

export const athensPiraeusHoboSource: DeepPartial<Sources> = {
  site: athensSite,
  surveyPoint: athensSurveyPointPiraeus,
  type: SourceType.HOBO,
};

export const sources = [
  californiaSpotterSource,
  californiaNOAASource,
  floridaNOAASource,
  athensNOAASource,
  athensPiraeusHoboSource,
];
