import React from "react";
import { Map, TileLayer, Polygon } from "react-leaflet";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

import { Reef } from "../../../../store/Reefs/types";
import { mapBounds } from "../../../../helpers/mapBounds";

const ReefMap = ({ polygon, classes }: ReefMapProps) => {
  return (
    <Map
      dragging={false}
      className={classes.map}
      bounds={mapBounds(polygon.coordinates)}
      boundsOptions={{ padding: [150, 150] }}
      zoomControl={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      <Polygon positions={polygon.coordinates} />
    </Map>
  );
};

const styles = () => {
  return createStyles({
    map: {
      height: "100%",
      width: "100%",
      borderRadius: 4,
    },
  });
};

interface ReefMapIncomingProps {
  polygon: Reef["polygon"];
}

type ReefMapProps = WithStyles<typeof styles> & ReefMapIncomingProps;

export default withStyles(styles)(ReefMap);
