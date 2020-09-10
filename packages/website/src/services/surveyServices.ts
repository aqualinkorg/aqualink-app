import type {
  SurveyState,
  SurveyData,
  SurveyMediaData,
} from "../store/Survey/types";
import requests from "../helpers/requests";

const getSurvey = (surveyId: string) =>
  requests.send<SurveyState>({
    url: `surveys/${surveyId}`,
    method: "GET",
  });

const getSurveys = (reefId: string) =>
  requests.send<SurveyState[]>({
    url: `surveys/reefs/${reefId}`,
    method: "GET",
  });

const addSurvey = (surveyData: SurveyData) => {
  return requests.send<SurveyState>({
    url: "surveys",
    method: "POST",
    data: { ...surveyData, token: undefined },
    token: surveyData.token === null ? undefined : surveyData.token,
  });
};

const deleteSurvey = (surveyId: number, token: string) => {
  return requests.send({
    url: `surveys/${surveyId}`,
    method: "DELETE",
    token,
  });
};

const addSurveyMedia = (surveyId: string, mediaData: SurveyMediaData) => {
  return requests.send<[]>({
    url: `surveys/${surveyId}/media`,
    method: "POST",
    data: { ...mediaData, token: undefined },
    token: mediaData.token === null ? undefined : mediaData.token,
  });
};

const addNewPoi = (reefId: number, name: string, token?: string | null) => {
  return requests.send({
    url: "pois",
    method: "POST",
    data: {
      reef: reefId,
      name,
    },
    token: token === null ? undefined : token,
  });
};

export default {
  addSurvey,
  deleteSurvey,
  addSurveyMedia,
  getSurvey,
  getSurveys,
  addNewPoi,
};
