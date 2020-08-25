import axios from "axios";

const addSurvey = (surveyData: SurveyData, token?: string | null) =>
  axios({
    method: "POST",
    url: `${process.env.REACT_APP_API_BASE_URL}surveys`,
    data: surveyData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export interface SurveyData {
  reef: number;
  diveDate: string;
  weatherConditions: string;
  comments?: string;
}

export default { addSurvey };
