import { SurveyListState, Observations } from "../../../../store/Survey/types";

const filterSurveys = (
  list: SurveyListState["list"],
  observation: Observations | "any",
  point: number
): SurveyListState["list"] => {
  if (observation === "any" && point === -1) {
    return list;
  }
  if (observation === "any") {
    return list.filter((survey) => survey.surveyPoints?.includes(point));
  }
  if (point === -1) {
    return list.filter((survey) => survey.observations?.includes(observation));
  }
  return list.filter(
    (survey) =>
      survey.observations?.includes(observation) &&
      survey.surveyPoints?.includes(point)
  );
};

export default filterSurveys;
