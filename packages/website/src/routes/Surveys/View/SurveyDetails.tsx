import React from "react";

import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Typography,
} from "@material-ui/core";

import type { Reef } from "../../../store/Reefs/types";
import ObservationBox from "./observationBox";

const SurveyDetails = ({ reef, surveyId, classes }: SurveyDetailsProps) => {
  return (
    <Grid container item direction="row" spacing={2}>
      <Grid container item direction="column" spacing={3} xs={12} lg={9}>
        <Grid item>
          <Typography color="initial" variant="h6">
            06/10/2020 at 8:47AM
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
              5
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
              21
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
              4
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
            Tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Lorem ipsum dolor sit amet, consectetur
            adipisicing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat.
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs={6} sm={4} md={3} lg={3}>
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
  surveyId?: string;
}

type SurveyDetailsProps = SurveyDetailsIncomingProps &
  WithStyles<typeof styles>;

export default withStyles(styles)(SurveyDetails);
