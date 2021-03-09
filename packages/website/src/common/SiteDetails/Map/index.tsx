import React, { useRef, useEffect, useCallback, useState } from "react";
import { Map, TileLayer, Polygon, Marker } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import L, { LatLngTuple } from "leaflet";
import "./plugins/leaflet-tilelayer-subpixel-fix";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";
import { some } from "lodash";

import SurveyPointPopup from "./SurveyPointPopup";
import {
  Reef,
  Position,
  SpotterPosition,
  Pois,
  Point,
} from "../../../store/Reefs/types";
import { mapBounds } from "../../../helpers/map";

import marker from "../../../assets/marker.png";
import buoy from "../../../assets/buoy-marker.svg";
import {
  reefDraftSelector,
  setReefDraft,
} from "../../../store/Reefs/selectedReefSlice";
import { userInfoSelector } from "../../../store/User/userSlice";
import { isManager } from "../../../helpers/user";
import pointIcon from "../../../assets/alerts/pin_nostress@2x.png";
import selectedPointIcon from "../../../assets/alerts/pin_warning@2x.png";

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -41],
});

const buoyIcon = L.icon({
  iconUrl: buoy,
  iconSize: [30, 40],
  iconAnchor: [10, 30],
  popupAnchor: [0, -41],
});

const surveyPointIcon = (selected: boolean) =>
  L.icon({
    iconUrl: selected ? selectedPointIcon : pointIcon,
    iconSize: [24, 27],
    iconAnchor: [12, 27],
    popupAnchor: [0, -27],
  });

const ReefMap = ({
  reefId,
  spotterPosition,
  polygon,
  surveyPoints,
  selectedPointId,
  classes,
}: ReefMapProps) => {
  const dispatch = useDispatch();
  const mapRef = useRef<Map>(null);
  const markerRef = useRef<Marker>(null);
  const draftReef = useSelector(reefDraftSelector);
  const user = useSelector(userInfoSelector);
  const [focusedPoint, setFocusedPoint] = useState<Pois>();

  const reverseCoords = (coordArray: Position[]): [Position[]] => {
    return [coordArray.map((coords) => [coords[1], coords[0]])];
  };

  const setCenter = (
    inputMap: L.Map,
    latLng: [number, number],
    zoom: number
  ) => {
    const newZoom = Math.max(inputMap.getZoom() || 15, zoom);
    return inputMap.flyTo(latLng, newZoom);
  };

  // Fit the polygon constructed by the reef's center and its survey points
  const fitSurveyPointsPolygon = useCallback(
    (inputMap: L.Map, reefCenter: Point) => {
      inputMap.fitBounds(
        L.polygon([
          [reefCenter.coordinates[1], reefCenter.coordinates[0]],
          ...surveyPoints
            .filter((item) => item.polygon?.type === "Point")
            .map((item) => {
              const coords = item.polygon?.coordinates as Position;
              return [coords[1], coords[0]] as LatLngTuple;
            }),
        ]).getBounds()
      );
    },
    [surveyPoints]
  );

  useEffect(() => {
    if (
      mapRef?.current?.leafletElement &&
      focusedPoint?.polygon?.type === "Point"
    ) {
      const [lng, lat] = focusedPoint.polygon.coordinates;
      setCenter(mapRef.current.leafletElement, [lat, lng], 15);
    }
  }, [focusedPoint]);

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
            draftReef.coordinates.latitude || polygon.coordinates[1],
            draftReef.coordinates.longitude || polygon.coordinates[0]
          )
        );
      } else if (some(surveyPoints, (item) => item.polygon?.type === "Point")) {
        fitSurveyPointsPolygon(map, polygon);
      } else {
        map.panTo(new L.LatLng(polygon.coordinates[1], polygon.coordinates[0]));
      }
    }
  }, [draftReef, fitSurveyPointsPolygon, polygon, surveyPoints]);

  const handleDragChange = useCallback(() => {
    const { current } = markerRef;
    if (current && current.leafletElement) {
      const mapMarker = current.leafletElement;
      const { lat, lng } = mapMarker.getLatLng().wrap();
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
      maxZoom={17}
      zoom={13}
      dragging
      scrollWheelZoom={false}
      className={classes.map}
      tap={false}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      {polygon.type === "Polygon" ? (
        <Polygon positions={reverseCoords(...polygon.coordinates)} />
      ) : (
        <>
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
          {surveyPoints.map(
            (point) =>
              point?.polygon?.type === "Point" && (
                <Marker
                  key={point.id}
                  icon={surveyPointIcon(point.id === selectedPointId)}
                  position={[
                    point.polygon.coordinates[1],
                    point.polygon.coordinates[0],
                  ]}
                  onclick={() => setFocusedPoint(point)}
                >
                  <SurveyPointPopup
                    reefId={reefId}
                    point={point}
                    selectedPointId={selectedPointId}
                  />
                </Marker>
              )
          )}
        </>
      )}
      {!draftReef && spotterPosition && isManager(user) && (
        <Marker
          icon={buoyIcon}
          position={[
            spotterPosition.latitude.value,
            spotterPosition.longitude.value,
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
  reefId: number;
  polygon: Reef["polygon"];
  spotterPosition?: SpotterPosition | null;
  surveyPoints: Pois[];
  selectedPointId?: number;
}

ReefMap.defaultProps = {
  spotterPosition: null,
  selectedPointId: 0,
};

type ReefMapProps = WithStyles<typeof styles> & ReefMapIncomingProps;

export default withStyles(styles)(ReefMap);
