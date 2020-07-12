import React from "react";
import { Map, TileLayer } from "react-leaflet";
import { createStyles, withStyles, WithStyles } from "@material-ui/core";

const HomepageMap = ({ classes }: HomepageMapProps) => {
  return (
    <Map className={classes.map} center={[0, 0]} zoom={2} minZoom={2}>
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
    </Map>
  );
};

const styles = () =>
  createStyles({
    map: {
      height: "100%",
      width: "100%",
    },
  });

interface HomepageMapProps extends WithStyles<typeof styles> {}

export default withStyles(styles)(HomepageMap);
