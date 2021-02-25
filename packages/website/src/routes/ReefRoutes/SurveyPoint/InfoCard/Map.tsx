/* eslint-disable fp/no-mutating-methods */
import React from "react";
import {
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";
import L from "leaflet";
import { Map as LeafletMap, TileLayer, Marker } from "react-leaflet";

import SurveyPointPopup from "../../../../common/SiteDetails/Map/SurveyPointPopup";
import { Reef } from "../../../../store/Reefs/types";
import marker from "../../../../assets/marker.png";

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -41],
});

const numberedIcon = (pointId: number, selected: boolean) =>
  L.divIcon({
    className: `leaflet${selected ? "-selected" : ""}-numbered-marker`,
    iconSize: [36, 40.5],
    iconAnchor: [18, 40.5],
    popupAnchor: [0, -40.5],
    html: `<span class="leaflet-numbered-marker-text">${pointId}</span>`,
  });

const Map = ({ reef, selectedPointId, classes }: MapProps) => {
  const points = reef.surveyPoints;
  const [lng, lat] =
    reef.polygon.type === "Point" ? reef.polygon.coordinates : [0, 0];

  return (
    <Grid className={classes.mapWrapper} item xs={12} md={4}>
      <LeafletMap
        zoomControl={false}
        className={classes.map}
        center={[lat, lng]}
        zoom={13}
      >
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <Marker icon={pinIcon} position={[lat, lng]} />
        {points.map(
          (point) =>
            point.coordinates && (
              <Marker
                key={point.id}
                icon={numberedIcon(point.id, selectedPointId === point.id)}
                position={[point.coordinates[1], point.coordinates[0]]}
              >
                <SurveyPointPopup reefId={reef.id} point={point} />
              </Marker>
            )
        )}
      </LeafletMap>
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    mapWrapper: {
      padding: 16,
    },
    map: {
      borderRadius: 5,
      height: 280,
      width: "100%",
      [theme.breakpoints.down("sm")]: {
        height: 300,
      },
    },
  });

interface MapIncomingProps {
  reef: Reef;
  selectedPointId: number;
}

type MapProps = MapIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Map);
