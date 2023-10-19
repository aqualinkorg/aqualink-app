import { SurveyState } from 'store/Survey/types';

export const mockSurvey: SurveyState = {
  comments: 'No comments',
  diveDate: '2020-09-10T10:27:00.000Z',
  id: 46,
  temperature: undefined,
  satelliteTemperature: 10,
  weatherConditions: 'calm',
  user: {
    id: 0,
    fullName: 'Joe Doe',
  },
  featuredSurveyMedia: {
    comments: null,
    featured: true,
    id: 66,
    observations: 'possible-disease',
    type: 'image',
    url: '',
  },
  surveyMedia: [
    {
      url: 'image-url',
      comments: 'comment 2222',
      featured: false,
      id: 18,
      observations: 'healthy',
      surveyPoint: { id: 1, name: 'Point 1' },
      type: 'image',
    },
  ],
};
