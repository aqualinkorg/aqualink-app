import React from "react";
import {
  createStyles,
  withStyles,
  WithStyles
} from "@material-ui/core";

import type { Reef } from "../../../store/Reefs/types";
const SurveyDetails = ({reef, surveyId, classes}: ViewSurveyProps) => {
  return (
    <>
    </>);
}

const styles = () =>
  createStyles({
});

interface ViewSurveyIncomingProps {
  reef: Reef,
  surveyId?: string;
}


type ViewSurveyProps = ViewSurveyIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SurveyDetails);
