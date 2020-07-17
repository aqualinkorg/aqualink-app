import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Map, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { createStyles, withStyles, WithStyles } from "@material-ui/core";

import { reefsListSelector } from "../../../store/Reefs/reefsListSlice";
import { Reef } from "../../../store/Reefs/types";
import Popup from "./popup";

const marker = require("../../../assets/buoy.png");

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [24, 24],
  iconAnchor: [8, 48],
  popupAnchor: [3, -48],
});

const HomepageMap = ({ classes }: HomepageMapProps) => {
  const mapRef = useRef<Map>(null);
  const reefsList = useSelector(reefsListSelector);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState<number>(2);

  useEffect(() => {
    const { current } = mapRef;
    if (current && current.leafletElement) {
      const map = current.leafletElement;
      map.flyTo(center, zoom, { duration: 1 });
    }
  }, [center, zoom]);

  return (
    <Map
      className={classes.map}
      ref={mapRef}
      center={center}
      zoom={zoom}
      minZoom={2}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      {reefsList.length > 0 &&
        reefsList.map((reef: Reef) => {
          if (reef.polygon.type === "Point") {
            const [lng, lat] = reef.polygon.coordinates;
            return (
              <Marker
                onClick={() => {
                  setZoom(6);
                  setCenter([lat, lng]);
                }}
                key={reef.id}
                icon={pinIcon}
                position={[
                  reef.polygon.coordinates[1],
                  reef.polygon.coordinates[0],
                ]}
              >
                <Popup reef={reef} />
              </Marker>
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
