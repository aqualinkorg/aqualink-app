import { DeepPartial } from 'typeorm';
import {
  MediaType,
  Observations,
  SurveyMedia,
} from '../../src/surveys/survey-media.entity';
import { californiaSurveyPoint } from './survey-point.mock';
import { californiaSurveyOne, californiaSurveyTwo } from './surveys.mock';

export const californiaSurveyOneMedia: DeepPartial<SurveyMedia> = {
  url: 'https://storage.googleapis.com/storage/reef-image-564894612112.jpg',
  thumbnailUrl:
    'https://storage.googleapis.com/storage/thumbnail-reef-image-564894612112.jpg',
  quality: 1,
  featured: true,
  hidden: false,
  metadata: '{}',
  observations: Observations.Healthy,
  comments: 'No comments',
  surveyPoint: californiaSurveyPoint,
  surveyId: californiaSurveyOne,
  type: MediaType.Image,
};

export const californiaSurveyTwoMedia: DeepPartial<SurveyMedia> = {
  url: 'https://storage.googleapis.com/storage/reef-image-564894612112.jpg',
  thumbnailUrl:
    'https://storage.googleapis.com/storage/thumbnail-reef-image-564894612112.jpg',
  quality: 1,
  featured: true,
  hidden: false,
  metadata: '{}',
  observations: Observations.Healthy,
  comments: 'No comments',
  surveyPoint: californiaSurveyPoint,
  surveyId: californiaSurveyTwo,
  type: MediaType.Image,
};

export const surveyMedia = [californiaSurveyOneMedia, californiaSurveyTwoMedia];
