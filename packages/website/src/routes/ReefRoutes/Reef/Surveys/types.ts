import { SurveyMedia } from "../../../../store/Survey/types";

export interface TimelineProps {
  reefId: number;
  isAdmin: boolean;
  observation: SurveyMedia["observations"] | "any";
  point: number;
}
