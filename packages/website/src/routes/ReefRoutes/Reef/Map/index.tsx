import React from "react";
import { Map, TileLayer, Polygon } from "react-leaflet";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

const ReefMap = ({ classes }: ReefMapProps) => {
  return (
    <Map
      dragging={false}
      minZoom={7}
      className={classes.map}
      center={[37.848344, -123.612622]}
      zoom={7}
    >
      <TileLayer
        // attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      <Polygon
        positions={[
          [37.969305, -124.277304],
          [37.848344, -123.612622],
          [36.930852, -123.326233],
          [36.731202, -125.164667],
        ]}
      />
    </Map>
  );
};

const styles = () => {
  return createStyles({
    map: {
      height: "100%",
      width: "100%",
    },
  });
};

interface ReefMapProps extends WithStyles<typeof styles> {}

export default withStyles(styles)(ReefMap);
