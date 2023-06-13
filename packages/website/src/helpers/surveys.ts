import { sumBy } from 'lodash';

import {
  SurveyListState,
  Observations,
  SurveyListItem,
} from 'store/Survey/types';
import { sortByDate } from './dates';

export const filterSurveys = (
  list: SurveyListState['list'],
  observation: Observations | 'any',
  point: number,
): SurveyListState['list'] => {
  const sortedSurveys = sortByDate(list, 'diveDate', 'desc');

  if (observation === 'any' && point === -1) {
    return sortedSurveys;
  }
  if (observation === 'any') {
    return sortedSurveys.filter((survey) =>
      survey.surveyPoints?.includes(point),
    );
  }
  if (point === -1) {
    return sortedSurveys.filter((survey) =>
      survey.observations?.includes(observation),
    );
  }
  return sortedSurveys.filter(
    (survey) =>
      survey.observations?.includes(observation) &&
      survey.surveyPoints?.includes(point),
  );
};

export const findImagesAtSurveyPoint = (
  surveyList: SurveyListItem[],
  point: number,
) => {
  const imagesAtPoint = surveyList.map(
    (survey) => survey.surveyPointImage?.[point],
  );
  if (imagesAtPoint.length > 0) {
    return sumBy(imagesAtPoint, 'length');
  }
  return 0;
};
