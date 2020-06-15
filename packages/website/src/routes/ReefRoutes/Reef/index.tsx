import React, { useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Typography,
  Paper,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router-dom";

import ReefNavBar from "./ReefNavBar";
import Map from "./Map";
import FeatureVideo from "./FeatureVideo";
import Temperature from "./Temperature";
import { reefDetailsSelector, reefRequest } from "../../../store/Reefs/slice";

const Reef = ({ match, classes }: ReefProps) => {
  const reefDetails = useSelector(reefDetailsSelector);
  const reefId = match.params.id;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(reefRequest(reefId));
  }, [dispatch, reefId]);

  return (
    <>
      <ReefNavBar
        reefName={reefDetails.regionName}
        lastSurvey="May 10, 2020"
        managerName={reefDetails.managerName}
      />
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={10}>
            <Grid key={1} item>
              <Typography variant="h6">LOCATION:</Typography>
              <div className={classes.container}>
                <Map polygon={reefDetails.polygon} />
              </div>
            </Grid>
            <Grid key={2} item>
              <Typography variant="h6">FEATURE VIDEO</Typography>
              <div className={classes.container}>
                <FeatureVideo url={reefDetails.videoStream} />
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={10}>
            <Grid key={3} item>
              <div className={classes.smallContainer}>
                <Temperature />
              </div>
            </Grid>
            <Grid key={4} item>
              <div className={classes.smallContainer}>
                <Paper />
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

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

interface MatchProps extends RouteComponentProps<{ id: string }> {}

type ReefProps = WithStyles<typeof styles> & MatchProps;

export default withStyles(styles)(Reef);
