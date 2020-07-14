import React from "react";
import { useSelector } from "react-redux";
import { Map, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { createStyles, withStyles, WithStyles } from "@material-ui/core";

import { reefsListSelector } from "../../../store/Reefs/reefsListSlice";

const marker = require("../../../assets/buoy.png");

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [15, 22.5],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const HomepageMap = ({ classes }: HomepageMapProps) => {
  const reefsList = useSelector(reefsListSelector);
  return (
    <Map className={classes.map} center={[0, 0]} zoom={2} minZoom={2}>
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      {reefsList.length > 0 &&
        reefsList.map((reef) => {
          if (reef.polygon.type === "Point") {
            return (
              <Marker
                key={reef.id}
                icon={pinIcon}
                position={[
                  reef.polygon.coordinates[1],
                  reef.polygon.coordinates[0],
                ]}
              />
            );
          }
          return null;
        })}
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
