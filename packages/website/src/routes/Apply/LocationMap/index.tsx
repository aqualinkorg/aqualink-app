import React from "react";
import { Map, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

import marker from "../../../assets/marker.png";

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [20, 30],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const LocationMap = ({
  markerPosition,
  setMarkerPosition,
  classes,
}: LocationMapProps) => {
  function updateLatLng(event: L.LeafletMouseEvent) {
    const { lat, lng } = event.latlng;
    setMarkerPosition([lat, lng]);
  }

  return (
    <Map
      center={markerPosition}
      zoom={5}
      className={classes.map}
      onclick={updateLatLng}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      {markerPosition && <Marker icon={pinIcon} position={markerPosition} />}
    </Map>
  );
};

const styles = () => {
  return createStyles({
    map: {
      height: "100%",
      width: "100%",
      borderRadius: 4,
      cursor: "pointer",
    },
  });
};

export interface LocationMapProps extends WithStyles<typeof styles> {
  markerPosition: L.LatLngTuple;
  setMarkerPosition(tuple: L.LatLngTuple): void;
}

export default withStyles(styles)(LocationMap);
