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
  // getNumberOfVideos,
} from "../../../helpers/surveyMedia";

import type { Reef } from "../../../store/Reefs/types";
import type { SurveyState } from "../../../store/Survey/types";
import ObservationBox from "./observationBox";

const SurveyDetails = ({ reef, survey, classes }: SurveyDetailsProps) => {
  return (
    <Grid style={{ marginTop: "1rem" }} container item xs={12} direction="row">
      {survey && (
        <Grid container item direction="column" spacing={3} xs={12} lg={9}>
          <Grid item>
            <Typography variant="subtitle1">
              {moment(survey.diveDate).format("MM/DD/YYYY [at] h:mm A")}
            </Typography>
          </Grid>
          <Grid container item direction="row">
            <Grid container item direction="column" xs={12} md={3}>
              <Typography style={{ fontSize: 18 }}>
                {reef.region?.name}
              </Typography>
              <Typography variant="subtitle1">{reef.name}</Typography>
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
                variant="h6"
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
                variant="h6"
                className={classes.inlineText}
              >
                IMAGES
              </Typography>
            </Grid>
            {/* <Grid item xs={12} md={3}>
              <Typography
                color="primary"
                variant="h4"
                className={classes.inlineText}
              >
                {survey.surveyPoints && getNumberOfVideos(survey.surveyPoints)}
              </Typography>
              <Typography
                color="initial"
                variant="h6"
                className={classes.inlineText}
              >
                VIDEOS
              </Typography>
            </Grid> */}
          </Grid>
          <Grid container item direction="column">
            <Typography variant="h6">Comments</Typography>
            <Typography variant="subtitle1">{survey.comments}</Typography>
          </Grid>
        </Grid>
      )}

      <Grid item xs={12} md={6} lg={3}>
        <ObservationBox depth={reef.depth} dailyData={reef.dailyData} />
      </Grid>
    </Grid>
  );
};

const styles = () =>
  createStyles({
    inlineText: {
      display: "inline",
      fontWeight: "normal",
      marginLeft: "0.5rem",
    },
  });

interface SurveyDetailsIncomingProps {
  reef: Reef;
  survey?: SurveyState | null;
}

SurveyDetails.defaultProps = {
  survey: null,
};

type SurveyDetailsProps = SurveyDetailsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyDetails);
