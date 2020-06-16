import React, { useRef, useEffect } from "react";
import { Map, TileLayer, Polygon } from "react-leaflet";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

import { Reef } from "../../../../store/Reefs/types";
import { mapBounds } from "../../../../helpers/mapBounds";

const ReefMap = ({ polygon, classes }: ReefMapProps) => {
  const mapRef = useRef<Map>(null);

  useEffect(() => {
    const { current } = mapRef;
    if (current && current.leafletElement) {
      const map = current.leafletElement;
      map.fitBounds(mapBounds(polygon.coordinates), { padding: [150, 150] });
      const zoom = map.getZoom();
      if (zoom < Infinity) {
        map.setMinZoom(zoom);
      }
    }
  }, [mapRef, polygon]);

  return (
    <Map ref={mapRef} dragging={false} className={classes.map}>
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
