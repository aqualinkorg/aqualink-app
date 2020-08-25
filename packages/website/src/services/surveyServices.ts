import type { SurveyState, SurveyData } from "../store/Survey/types";
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
    url: `surveys`,
    method: "POST",
    data: { ...surveyData, token: undefined },
    token: surveyData.token === null ? undefined : surveyData.token,
  });
};

export default { addSurvey, getSurvey, getSurveys };
