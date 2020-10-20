import React, { useRef, useEffect, useCallback } from "react";
import { Map, TileLayer, Polygon, Marker } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import L from "leaflet";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

import { Reef, Position } from "../../../../store/Reefs/types";
import { mapBounds } from "../../../../helpers/mapBounds";

import marker from "../../../../assets/marker.png";
import {
  reefDraftSelector,
  setReefDraft,
} from "../../../../store/Reefs/selectedReefSlice";

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -41],
});

const ReefMap = ({ polygon, classes }: ReefMapProps) => {
  const dispatch = useDispatch();
  const mapRef = useRef<Map>(null);
  const markerRef = useRef<Marker>(null);
  const draftReef = useSelector(reefDraftSelector);

  const reverseCoords = (coordArray: Position[]): [Position[]] => {
    return [coordArray.map((coords) => [coords[1], coords[0]])];
  };

  useEffect(() => {
    const { current } = mapRef;
    if (current && current.leafletElement) {
      const map = current.leafletElement;
      // Initialize map's position to fit the given polygon
      if (polygon.type === "Polygon") {
        map.fitBounds(mapBounds(polygon));
      } else if (draftReef?.coordinates) {
        map.panTo(
          new L.LatLng(
            draftReef.coordinates.latitude,
            draftReef.coordinates.longitude
          )
        );
      } else {
        map.panTo(new L.LatLng(polygon.coordinates[1], polygon.coordinates[0]));
      }
    }
  }, [mapRef, draftReef, polygon]);

  const handleDragChange = useCallback(() => {
    const { current } = markerRef;
    if (current && current.leafletElement) {
      const mapMarker = current.leafletElement;
      const { lat, lng } = mapMarker.getLatLng();
      dispatch(
        setReefDraft({
          coordinates: {
            latitude: lat,
            longitude: lng,
          },
        })
      );
    }
  }, [dispatch]);

  return (
    <Map
      ref={mapRef}
      zoom={12}
      dragging
      scrollWheelZoom={false}
      className={classes.map}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      {polygon.type === "Polygon" ? (
        <Polygon positions={reverseCoords(...polygon.coordinates)} />
      ) : (
        <Marker
          ref={markerRef}
          draggable={Boolean(draftReef)}
          ondragend={handleDragChange}
          icon={pinIcon}
          position={[
            draftReef?.coordinates?.latitude || polygon.coordinates[1],
            draftReef?.coordinates?.longitude || polygon.coordinates[0],
          ]}
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
