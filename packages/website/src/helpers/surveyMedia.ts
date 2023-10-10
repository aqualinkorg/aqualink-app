import { groupBy, sortBy } from 'lodash';
import type { SurveyMedia } from 'store/Survey/types';

export const getFeaturedMedia = (surveyMedia: SurveyMedia[]) => {
  const media = surveyMedia.find((mediaItem) => mediaItem.featured);
  return { url: media?.url, thumbnailUrl: media?.thumbnailUrl };
};

export const getNumberOfImages = (surveyMedia: SurveyMedia[]) => {
  return surveyMedia.filter((media) => media.type === 'image').length;
};

export const getNumberOfVideos = (surveyMedia: SurveyMedia[]) => {
  return surveyMedia.filter((media) => media.type === 'video').length;
};

export const getSurveyPointNames = (surveyMedia: SurveyMedia[]) => {
  return [
    ...new Set(surveyMedia.map((media) => media.surveyPoint?.name)),
  ].filter((value) => value);
};

export const getNumberOfSurveyPoints = (surveyMedia: SurveyMedia[]) => {
  return getSurveyPointNames(surveyMedia).length;
};

export const getSurveyPointsByName = (surveyMedia: SurveyMedia[]) => {
  const sortedBySurveyPointName = sortBy(
    surveyMedia,
    (media) => media.surveyPoint?.name,
  );
  const groupedMediaByPointName = groupBy(
    sortedBySurveyPointName.map((media) => ({
      ...media,
      surveyPointName: media.surveyPoint?.name || 'Other',
    })),
    'surveyPointName',
  );
  return Object.entries(groupedMediaByPointName).map(
    ([name, pointSurveyMedia]) => ({
      name,
      pointId: pointSurveyMedia[0].surveyPoint?.id,
      surveyMedia: pointSurveyMedia,
    }),
  );
};
