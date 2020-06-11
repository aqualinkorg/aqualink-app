import React, { useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Typography,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router-dom";

import ReefNavBar from "./ReefNavBar";
import Map from "./Map";
import FeatureVideo from "./FeatureVideo";
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
              <Typography variant="h5">LOCATION:</Typography>
              <div className={classes.container}>
                <Map />
              </div>
            </Grid>
            <Grid key={2} item>
              <Typography variant="h5">FEATURE VIDEO</Typography>
              <div className={classes.container}>
                <FeatureVideo url={reefDetails.videoStream} />
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
  });

interface MatchProps extends RouteComponentProps<{ id: string }> {}

type ReefProps = WithStyles<typeof styles> & MatchProps;

export default withStyles(styles)(Reef);
