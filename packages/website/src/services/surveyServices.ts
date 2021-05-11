import type {
  SurveyState,
  SurveyData,
  SurveyMediaData,
  SurveyListItem,
  SurveyMediaUpdateRequestData,
  SurveyPointUpdateParams,
} from "../store/Survey/types";
import requests from "../helpers/requests";
import { Pois } from "../store/Reefs/types";

const getSurvey = (reefId: string, surveyId: string) =>
  requests.send<SurveyState>({
    url: `reefs/${reefId}/surveys/${surveyId}`,
    method: "GET",
  });

const getSurveys = (reefId: string) =>
  requests.send<SurveyListItem[]>({
    url: `reefs/${reefId}/surveys`,
    method: "GET",
  });

const addSurvey = (reefId: string, surveyData: SurveyData) => {
  return requests.send<SurveyState>({
    url: `reefs/${reefId}/surveys`,
    method: "POST",
    data: { ...surveyData, token: undefined },
    token: surveyData.token === null ? undefined : surveyData.token,
  });
};

const deleteSurvey = (reefId: number, surveyId: number, token: string) => {
  return requests.send({
    url: `reefs/${reefId}/surveys/${surveyId}`,
    method: "DELETE",
    token,
  });
};

const addSurveyMedia = (
  reefId: string,
  surveyId: string,
  mediaData: SurveyMediaData
) => {
  return requests.send<[]>({
    url: `reefs/${reefId}/surveys/${surveyId}/media`,
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
      reefId,
      name,
    },
    token: token === null ? undefined : token,
  });
};

const updatePoi = (
  poiId: number,
  updateParams: SurveyPointUpdateParams,
  token: string
) =>
  requests.send<Pois>({
    url: `pois/${poiId}`,
    method: "PUT",
    data: updateParams,
    token,
  });

const editSurveyMedia = (
  reefId: number,
  mediaId: number,
  data: SurveyMediaUpdateRequestData,
  token: string
) => {
  return requests.send({
    url: `reefs/${reefId}/surveys/media/${mediaId}`,
    method: "PUT",
    data,
    token,
  });
};

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
