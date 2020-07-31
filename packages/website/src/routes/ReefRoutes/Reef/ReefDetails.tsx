import React from "react";
import {
  createStyles,
  Grid,
  withStyles,
  WithStyles,
  Theme,
  Typography,
} from "@material-ui/core";

import Map from "./Map";
import FeatureVideo from "./FeatureVideo";
import Satellite from "./Satellite";
import Sensor from "./Sensor";
import Charts from "./Charts";
import type { Reef } from "../../../store/Reefs/types";

const ReefDetails = ({ classes, reef }: ReefDetailProps) => {
  // console.log(reef);
  return (
    <Grid container justify="center" className={classes.root}>
      <Grid container justify="space-around" item xs={10} spacing={4}>
        <Grid item xs={11} md={reef.videoStream ? 6 : 9}>
          <div className={classes.container}>
            <Map polygon={reef.polygon} />
          </div>
        </Grid>
        <Grid item xs={11} md={reef.videoStream ? 6 : 3}>
          <div className={classes.container}>
            <FeatureVideo url={reef.videoStream} />
          </div>
        </Grid>
      </Grid>
      <Grid container justify="space-around" item xs={10} spacing={4}>
        <Grid item xs={11} md={3}>
          <Typography className={classes.cardTitles} variant="h6">
            SATELLITE OBSERVATION
          </Typography>
          <div className={classes.smallContainer}>
            <Satellite dailyData={reef.dailyData} />
          </div>
        </Grid>
        <Grid item xs={11} md={3}>
          <Typography className={classes.cardTitles} variant="h6">
            SENSOR OBSERVATION
          </Typography>
          <div className={classes.smallContainer}>
            <Sensor reef={reef} />
          </div>
        </Grid>
        <Grid item xs={11} md={3}>
          <Typography className={classes.cardTitles} variant="h6">
            WIND
          </Typography>
          <div className={classes.smallContainer}>
            <Satellite dailyData={reef.dailyData} />
          </div>
        </Grid>
        <Grid item xs={11} md={3}>
          <Typography className={classes.cardTitles} variant="h6">
            WAVES
          </Typography>
          <div className={classes.smallContainer}>
            <Satellite dailyData={reef.dailyData} />
          </div>
        </Grid>
        {/* <Grid key={4} item xs={11} md={5}>
          <div
            className={`${classes.smallContainer} ${classes.statsContainer}`}
          >
            <Stats dailyData={reef.dailyData} />
          </div>
        </Grid> */}
      </Grid>
      <Grid container justify="center" item xs={12}>
        <Charts
          dailyData={reef.dailyData}
          // TODO - Remove default
          temperatureThreshold={reef.temperatureThreshold || 20}
        />
      </Grid>
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      marginTop: "2rem",
    },
    cardTitles: {
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1.5,
      letterSpacing: "normal",
      color: "#2f2f2f",
      margin: "0 0 0.5rem 1rem",
    },
    container: {
      height: "50vh",
      marginBottom: "3rem",
      [theme.breakpoints.between("md", "lg")]: {
        height: "35vh",
      },
    },
    smallContainer: {
      height: "30vh",
      marginBottom: "5rem",
    },
    statsContainer: {
      [theme.breakpoints.down("sm")]: {
        height: "35vh",
      },
      [theme.breakpoints.down("xs")]: {
        height: "28vh",
      },
    },
  });

type ReefDetailProps = WithStyles<typeof styles> & { reef: Reef };

export default withStyles(styles)(ReefDetails);
