import type {
  SurveyState,
  SurveyData,
  SurveyMediaData,
  SurveyListItem,
  SurveyMediaUpdateRequestData,
  SurveyPointUpdateParams,
  SurveyMedia,
} from 'store/Survey/types';
import { SurveyPoints } from 'store/Sites/types';
import requests from 'helpers/requests';

const getSurvey = (siteId: string, surveyId: string) =>
  requests.send<SurveyState>({
    url: `sites/${siteId}/surveys/${surveyId}`,
    method: 'GET',
  });

const getSurveys = (siteId: string) =>
  requests.send<SurveyListItem[]>({
    url: `sites/${siteId}/surveys`,
    method: 'GET',
  });

const addSurvey = (siteId: string, surveyData: SurveyData) =>
  requests.send<SurveyState>({
    url: `sites/${siteId}/surveys`,
    method: 'POST',
    data: { ...surveyData, token: undefined },
    token: surveyData.token === null ? undefined : surveyData.token,
  });

const deleteSurvey = (siteId: number, surveyId: number, token: string) =>
  requests.send({
    url: `sites/${siteId}/surveys/${surveyId}`,
    method: 'DELETE',
    token,
  });

const addSurveyMedia = (
  siteId: string,
  surveyId: string,
  mediaData: SurveyMediaData,
) =>
  requests.send<[]>({
    url: `sites/${siteId}/surveys/${surveyId}/media`,
    method: 'POST',
    data: { ...mediaData, token: undefined },
    token: mediaData.token === null ? undefined : mediaData.token,
  });

const addNewPoi = (siteId: number, name: string, token?: string | null) =>
  requests.send({
    url: 'site-survey-points',
    method: 'POST',
    data: {
      siteId,
      name,
    },
    token: token === null ? undefined : token,
  });

const updatePoi = (
  surveyPointId: number,
  updateParams: SurveyPointUpdateParams,
  token: string,
) =>
  requests.send<SurveyPoints>({
    url: `site-survey-points/${surveyPointId}`,
    method: 'PUT',
    data: updateParams,
    token,
  });

const editSurveyMedia = (
  siteId: number,
  mediaId: number,
  data: SurveyMediaUpdateRequestData,
  token: string,
) =>
  requests.send<SurveyMedia>({
    url: `sites/${siteId}/surveys/media/${mediaId}`,
    method: 'PUT',
    data,
    token,
  });

export default {
  addSurvey,
  deleteSurvey,
  addSurveyMedia,
  getSurvey,
  getSurveys,
  addNewPoi,
  updatePoi,
  editSurveyMedia,
};
