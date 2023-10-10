import { SurveyListItem } from 'store/Survey/types';

export const mockSurveyList: SurveyListItem = {
  comments: 'No comments',
  diveDate: '2020-09-10T10:27:00.000Z',
  id: 46,
  temperature: undefined,
  satelliteTemperature: 10,
  weatherConditions: 'calm',
  observations: ['anthropogenic'],
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
};
