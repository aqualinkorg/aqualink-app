import { SurveyListState, Observations } from "../../../../store/Survey/types";

const sortSurveysByDate = (list: SurveyListState["list"]):SurveyListState["list"]  => {
  return Object.values(list).sort((survey1, survey2) => {
    if (survey1.diveDate && survey2.diveDate) {
      const date1 = new Date(survey1.diveDate).getTime();
      const date2 = new Date(survey2.diveDate).getTime();

      return date2 - date1;
    }
    if (!survey1.diveDate) {
      return 1
    }
    return -1;
  });
};

const filterSurveys = (
  list: SurveyListState["list"],
  observation: Observations | "any",
  point: number
): SurveyListState["list"] => {
  const sortedSurveys = sortSurveysByDate(list);

  if (observation === "any" && point === -1) {
    return sortedSurveys;
  }
  if (observation === "any") {
    return sortedSurveys.filter((survey) =>
      survey.surveyPoints?.includes(point)
    );
  }
  if (point === -1) {
    return sortedSurveys.filter((survey) =>
      survey.observations?.includes(observation)
    );
  }
  return sortedSurveys.filter(
    (survey) =>
      survey.observations?.includes(observation) &&
      survey.surveyPoints?.includes(point)
  );
};

export default filterSurveys;
