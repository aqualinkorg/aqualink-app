import React from "react";
import moment from "moment";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Typography,
} from "@material-ui/core";
import {
  getNumberOfImages,
  getNumberOfVideos,
} from "../../../helpers/surveyMedia";

import type { Reef } from "../../../store/Reefs/types";
import type { SurveyState } from "../../../store/Survey/types";
import ObservationBox from "./observationBox";

const SurveyDetails = ({ reef, survey, classes }: SurveyDetailsProps) => {
  return (
    <Grid container item direction="row" spacing={2}>
      {survey && (
        <Grid container item direction="column" spacing={3} xs={12} lg={9}>
          <Grid item>
            <Typography color="initial" variant="h6">
              {moment
                .parseZone(survey.diveDate)
                .format("MM/DD/YYYY [at] h:mm A")}
            </Typography>
          </Grid>
          <Grid container item direction="row">
            <Grid container item direction="column" xs={12} md={3}>
              <Typography color="initial" variant="h5">
                Reef Zone 18B
              </Typography>
              <Typography color="initial" variant="body1">
                Palancar Reef, Conzumel, Mexico
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography
                color="primary"
                variant="h4"
                className={classes.inlineText}
              >
                {survey.surveyPoints?.length}
              </Typography>
              <Typography
                color="initial"
                variant="body1"
                className={classes.inlineText}
              >
                SURVEY POINTS
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography
                color="primary"
                variant="h4"
                className={classes.inlineText}
              >
                {survey.surveyPoints && getNumberOfImages(survey.surveyPoints)}
              </Typography>
              <Typography
                color="initial"
                variant="body1"
                className={classes.inlineText}
              >
                IMAGES
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography
                color="primary"
                variant="h4"
                className={classes.inlineText}
              >
                {survey.surveyPoints && getNumberOfVideos(survey.surveyPoints)}
              </Typography>
              <Typography
                color="initial"
                variant="body1"
                className={classes.inlineText}
              >
                VIDEOS
              </Typography>
            </Grid>
          </Grid>
          <Grid container item direction="column">
            <Typography color="initial" variant="h6">
              Comments
            </Typography>
            <Typography color="initial" variant="body2">
              {survey.comments}
            </Typography>
          </Grid>
        </Grid>
      )}

      <Grid item xs={12} md={6} lg={2}>
        <ObservationBox depth={reef.depth} dailyData={reef.dailyData} />
      </Grid>
    </Grid>
  );
};

const styles = () =>
  createStyles({
    inlineText: {
      display: "inline",
      marginLeft: "0.5rem",
    },
  });

interface SurveyDetailsIncomingProps {
  reef: Reef;
  survey?: SurveyState;
}

type SurveyDetailsProps = SurveyDetailsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyDetails);
