/* eslint-disable fp/no-mutating-methods */
import React from "react";
import {
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import L from "leaflet";
import { Map as LeafletMap, TileLayer, Marker } from "react-leaflet";
import { Pois, Reef } from "../../../../store/Reefs/types";

import marker from "../../../../assets/marker.png";

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -41],
});

const Map = ({ reef, points, classes }: MapProps) => {
  const history = useHistory();
  const [lng, lat] =
    reef.polygon.type === "Point" ? reef.polygon.coordinates : [0, 0];

  // TODO: Replace these with the actual survey points locations
  const randomPoints = points.map(() => [
    lat + Math.random(),
    lng + Math.random(),
  ]);

  return (
    <Grid item xs={12} md={6}>
      <LeafletMap
        zoomControl={false}
        className={classes.map}
        center={[lat, lng]}
        zoom={8}
      >
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <Marker icon={pinIcon} position={[lat, lng]} />
        {randomPoints.map((point, index) => (
          <Marker
            key={points[index].id}
            onclick={() =>
              history.push(`/reefs/${reef.id}/points/${points[index].id}`)
            }
            icon={pinIcon}
            position={[point[0], point[1]]}
          />
        ))}
      </LeafletMap>
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    map: {
      height: 450,
      width: "100%",
      [theme.breakpoints.down("sm")]: {
        height: 300,
      },
    },
  });

interface MapIncomingProps {
  reef: Reef;
  points: Pois[];
}

type MapProps = MapIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Map);
