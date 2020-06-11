import React, { useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Card,
  CardContent,
  Typography,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { Map, TileLayer } from "react-leaflet";
import ReactPlayer from "react-player";

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
              <Typography variant="h5">FEATURE VIDEO</Typography>
              <div className={classes.container}>
                <Card className={classes.card}>
                  <CardContent className={classes.content}>
                    <ReactPlayer
                      height="100%"
                      width="100%"
                      playing
                      muted
                      light
                      url={`${reefDetails.videoStream}`}
                    />
                  </CardContent>
                </Card>
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
    card: {
      height: "100%",
      width: "100%",
      display: "flex",
    },
    content: {
      height: "100%",
      width: "100%",
      padding: "0",
    },
  });

interface MatchProps extends RouteComponentProps<{ id: string }> {}

type ReefProps = WithStyles<typeof styles> & MatchProps;

export default withStyles(styles)(Reef);
