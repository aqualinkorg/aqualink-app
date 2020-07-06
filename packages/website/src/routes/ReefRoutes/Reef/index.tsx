/* eslint-disable no-nested-ternary */
import React, { useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Typography,
  LinearProgress,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router-dom";

import ReefNavBar from "./ReefNavBar";
import Map from "./Map";
import FeatureVideo from "./FeatureVideo";
import Temperature from "./Temperature";
import Stats from "./Stats";
import {
  reefDetailsSelector,
  reefLoadingSelector,
  reefErrorSelector,
  reefRequest,
} from "../../../store/Reefs/slice";

const Reef = ({ match, classes }: ReefProps) => {
  const reefDetails = useSelector(reefDetailsSelector);
  const loading = useSelector(reefLoadingSelector);
  const error = useSelector(reefErrorSelector);
  const renderCondition =
    reefDetails.polygon.coordinates[0].length > 0 &&
    reefDetails.videoStream !== "" &&
    reefDetails.dailyData.length > 0;
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
      {loading ? (
        <LinearProgress />
      ) : !error && renderCondition ? (
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
                  <Temperature dailyData={reefDetails.dailyData} />
                </div>
              </Grid>
              <Grid key={4} item>
                <div className={classes.smallContainer}>
                  <Stats dailyData={reefDetails.dailyData} />
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <div className={classes.noData}>
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="center"
          >
            <Grid item>
              <Typography gutterBottom color="primary" variant="h2">
                No Data Found
              </Typography>
            </Grid>
          </Grid>
        </div>
      )}
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
    noData: {
      display: "flex",
      alignItems: "center",
      height: "100%",
    },
  });

interface MatchProps extends RouteComponentProps<{ id: string }> {}

type ReefProps = WithStyles<typeof styles> & MatchProps;

export default withStyles(styles)(Reef);
