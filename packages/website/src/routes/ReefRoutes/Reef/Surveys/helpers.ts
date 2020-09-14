import { SurveyState, SurveyMedia } from "../../../../store/Survey/types";

const filterSurveys = (
  list: SurveyState[],
  observation: SurveyMedia["observations"] | "any",
  point: string
): SurveyState[] => {
  if (observation === "any") {
    return list;
  }
  return list.filter(
    (survey) => survey.featuredSurveyMedia?.observations === observation
  );
};

export default filterSurveys;
