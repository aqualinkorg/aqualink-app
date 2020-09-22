import React from "react";
import { useSelector } from "react-redux";
import { Map, TileLayer } from "react-leaflet";
import { LatLng } from "leaflet";
import {
  createStyles,
  withStyles,
  WithStyles,
  CircularProgress,
} from "@material-ui/core";

import { reefsListLoadingSelector } from "../../../store/Reefs/reefsListSlice";
import { ReefMarkers } from "./Markers";
import { SofarLayers } from "./sofarLayers";

const INITIAL_CENTER = new LatLng(37.9, -75.3);
const INITIAL_ZOOM = 5;
const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const tileURL = accessToken
  ? `https://api.mapbox.com/styles/v1/eric-ovio/ckesyzu658klw19s6zc0adlgp/tiles/{z}/{x}/{y}@2x?access_token=${accessToken}`
  : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}@2x";

const HomepageMap = ({ classes }: HomepageMapProps) => {
  const loading = useSelector(reefsListLoadingSelector);

  return loading ? (
    <div className={classes.loading}>
      <CircularProgress size="10rem" thickness={1} />
    </div>
  ) : (
    <Map
      preferCanvas
      maxBoundsViscosity={1.0}
      className={classes.map}
      center={INITIAL_CENTER}
      zoom={INITIAL_ZOOM}
      minZoom={2}
      worldCopyJump
    >
      <TileLayer url={tileURL} />
      <SofarLayers />
      <ReefMarkers />
    </Map>
  );
};

const styles = () =>
  createStyles({
    map: {
      flex: 1,
    },
    loading: {
      height: "100%",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  });

type HomepageMapProps = WithStyles<typeof styles>;

export default withStyles(styles)(HomepageMap);
