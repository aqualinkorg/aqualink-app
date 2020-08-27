import React from "react";
import { useHistory } from "react-router-dom";
import ArrowBack from "@material-ui/icons/ArrowBack";

import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Typography,
  IconButton,
  Box,
} from "@material-ui/core";

import type { Reef } from "../../../store/Reefs/types";
import ObservationBox from "./observationBox";

const SurveyDetails = ({ reef, surveyId, classes }: ViewSurveyProps) => {
  const history = useHistory();

  return (
    <>
      <div className={classes.outerDiv}>
        <Grid alignItems="flex-start" container direction="column" spacing={1}>
          <Grid alignItems="center" container direction="row">
            <IconButton
              edge="start"
              onClick={history.goBack}
              color="primary"
              aria-label="menu"
            >
              <ArrowBack />
            </IconButton>
            <Typography color="primary" variant="h5">
              All Surveys
            </Typography>
          </Grid>
          <Box boxShadow={3} className={classes.surveyDetailsDiv}>
            <Grid container direction="column">
              <Grid container item direction="row" spacing={2}>
                <Grid
                  container
                  item
                  direction="column"
                  spacing={3}
                  xs={12}
                  lg={8}
                >
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
                      Tempor incididunt ut labore et dolore magna aliqua. Ut
                      enim ad minim veniam, quis nostrud exercitation ullamco
                      laboris nisi ut aliquip ex ea commodo consequat. Lorem
                      ipsum dolor sit amet, consectetur adipisicing elit, sed do
                      eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={6} sm={4} md={2} lg={2}>
                  <ObservationBox
                    depth={reef.depth}
                    dailyData={reef.dailyData}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </div>
    </>
  );
};

const styles = () =>
  createStyles({
    outerDiv: {
      backgroundColor: "#f5f6f6",
      height: "45%",
      padding: "3rem 3.2rem 2rem 1rem",
    },
    surveyDetailsDiv: {
      backgroundColor: "white",
      width: "100%",
      padding: "2rem 0.5rem 0.5rem 2rem",
      flexGrow: 1,
    },
    inlineText: {
      display: "inline",
      marginLeft: "0.5rem",
    },
  });

interface ViewSurveyIncomingProps {
  reef: Reef;
  surveyId?: string;
}

type ViewSurveyProps = ViewSurveyIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SurveyDetails);
