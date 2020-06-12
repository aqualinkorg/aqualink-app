import React, { useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { Map, TileLayer } from "react-leaflet";

import ReefNavBar from "./ReefNavBar";
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
        reefName={reefDetails.region_name}
        lastSurvey="May 10, 2020"
        managerName={reefDetails.manager_name}
      />
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={10}>
            <Grid key={1} item>
              <Typography variant="h5">LOCATION:</Typography>
              <div className={classes.container}>
                <Map
                  dragging={false}
                  minZoom={6}
                  className={classes.map}
                  center={[37.773, -122.43]}
                  zoom={6}
                >
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                </Map>
              </div>
            </Grid>
            <Grid key={2} item>
              <Typography variant="h5">FEATURE VIDEO:</Typography>
              <div className={classes.container}>
                <Paper className={classes.paper} />
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
    map: {
      height: "100%",
      width: "100%",
      borderRadius: 4,
    },
    paper: {
      height: "100%",
      width: "100%",
      backgroundColor: "blue",
    },
  });

interface MatchParams {
  id: string;
}

interface MatchProps extends RouteComponentProps<MatchParams> {}

type ReefProps = WithStyles<typeof styles> & MatchProps;

export default withStyles(styles)(Reef);
