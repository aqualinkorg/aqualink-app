import React, { useRef, useEffect } from "react";
import { Map, TileLayer, Polygon, Marker } from "react-leaflet";
import L from "leaflet";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

import { Reef } from "../../../../store/Reefs/types";
import { mapBounds } from "../../../../helpers/mapBounds";

const marker = require("../../../../assets/marker.png");

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [20, 30],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const ReefMap = ({ polygon, classes }: ReefMapProps) => {
  const mapRef = useRef<Map>(null);

  useEffect(() => {
    const { current } = mapRef;
    if (current && current.leafletElement) {
      const map = current.leafletElement;
      // Initialize map's position to fit the given polygon
      if (polygon.type === "Polygon") {
        map.fitBounds(mapBounds(polygon), { padding: [150, 150] });
      } else {
        map.panTo(new L.LatLng(polygon.coordinates[1], polygon.coordinates[0]));
      }
      const zoom = map.getZoom();
      if (zoom < Infinity) {
        // User can't zoom out from the initial frame
        map.setMinZoom(zoom);
      } else {
        map.setZoom(8);
        map.setMinZoom(8);
      }
    }
  }, [mapRef, polygon]);

  return (
    <Map ref={mapRef} dragging={false} className={classes.map}>
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      {polygon.type === "Polygon" ? (
        <Polygon positions={polygon.coordinates} />
      ) : (
        <Marker
          icon={pinIcon}
          position={[polygon.coordinates[1], polygon.coordinates[0]]}
        />
      )}
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
