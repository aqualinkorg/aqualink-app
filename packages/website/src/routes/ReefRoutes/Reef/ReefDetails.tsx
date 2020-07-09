import React from "react";
import {
  createStyles,
  Grid,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import Map from "./Map";
import FeatureVideo from "./FeatureVideo";
import Temperature from "./Temperature";
import Stats from "./Stats";
import type { Reef } from "../../../store/Reefs/types";

const ReefDetails = ({ classes, reef }: ReefDetailProps) => (
  <Grid container className={classes.root}>
    <Grid item xs={12}>
      <Grid container justify="center" spacing={10}>
        <Grid key={1} item>
          <Typography variant="h6">LOCATION:</Typography>
          <div className={classes.container}>
            <Map polygon={reef.polygon} />
          </div>
        </Grid>
        <Grid key={2} item>
          <Typography variant="h6">FEATURE VIDEO</Typography>
          <div className={classes.container}>
            <FeatureVideo url={reef.videoStream || ""} />
          </div>
        </Grid>
      </Grid>
    </Grid>
    <Grid item xs={12}>
      <Grid container justify="center" spacing={10}>
        <Grid key={3} item>
          <div className={classes.smallContainer}>
            <Temperature dailyData={reef.dailyData} />
          </div>
        </Grid>
        <Grid key={4} item>
          <div className={classes.smallContainer}>
            <Stats dailyData={reef.dailyData} />
          </div>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);

const styles = () =>
  createStyles({
    root: {
      flexGrow: 1,
      marginTop: "5rem",
    },
    container: {
      height: "20vw",
      width: "35vw",
      marginTop: "1rem",
    },
    smallContainer: {
      height: "15vw",
      width: "35vw",
    },
  });

type ReefDetailProps = WithStyles<typeof styles> & { reef: Reef };

export default withStyles(styles)(ReefDetails);
