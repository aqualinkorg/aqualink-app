import { useDispatch, useSelector } from "react-redux";
import { renderToString } from "react-dom/server";
import { LayerGroup, Marker, useLeaflet } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import React, { useEffect } from "react";
import L from "leaflet";
import { makeStyles } from "@material-ui/core/styles";
import { reefsListSelector } from "../../../../store/Reefs/reefsListSlice";
import { Reef } from "../../../../store/Reefs/types";
import {
  reefOnMapSelector,
  unsetReefOnMap,
} from "../../../../store/Homepage/homepageSlice";
import Popup from "../Popup";
import { colorFinder } from "../../../../helpers/degreeHeatingWeeks";
import { ReactComponent as BuoySvg } from "./buoy.svg";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";
import { colorCode } from "../../../../assets/colorCode";

/**
 * Dummy component to listen for changes in the active reef/reefOnMap state and initiate the popup/fly-to. This is a
 * separate component to prevent trigger any leaflet element re-rendering.
 */
const ActiveReefListener = ({ reef }: { reef: Reef }) => {
  const { map, popupContainer } = useLeaflet();
  const reefOnMap = useSelector(reefOnMapSelector);

  useEffect(() => {
    if (
      map &&
      popupContainer &&
      reefOnMap?.polygon.type === "Point" &&
      reefOnMap.id === reef.id
    ) {
      map.flyTo(
        [reefOnMap.polygon.coordinates[1], reefOnMap.polygon.coordinates[0]],
        6
      );
      popupContainer.openPopup();
    }
  }, [reefOnMap, reef.id, map, popupContainer]);
  return null;
};

const colorClassName = (color: string) => `icon-${color}`;
const useStyles = makeStyles(() =>
  colorCode.reduce(
    (acc, { color }) => ({
      ...acc,
      [colorClassName(color)]: {
        "& g#c": {
          fill: color,
        },
      },
    }),
    {}
  )
);

const buoyIcon = (colorClass: string) =>
  L.divIcon({
    iconSize: [28, 28],
    iconAnchor: [12, 28],
    popupAnchor: [3, -24],
    html: renderToString(<BuoySvg />),
    className: `marker-icon ${colorClass}`,
  });

export const ReefMarkers = () => {
  const reefsList = useSelector(reefsListSelector);
  const dispatch = useDispatch();
  const { map } = useLeaflet();
  const iconColors: Record<string, string> = useStyles();

  const setCenter = (latLng: [number, number], zoom: number) =>
    map?.flyTo(latLng, zoom, { duration: 1 });

  return (
    <LayerGroup>
      <MarkerClusterGroup>
        {reefsList.map((reef: Reef) => {
          if (reef.polygon.type === "Point") {
            const [lng, lat] = reef.polygon.coordinates;
            const { degreeHeatingDays } = reef.latestDailyData || {};
            return (
              <Marker
                onClick={() => {
                  setCenter([lat, lng], 6);
                  dispatch(unsetReefOnMap());
                }}
                key={reef.id}
                icon={buoyIcon(
                  iconColors[colorClassName(colorFinder(degreeHeatingDays))]
                )}
                position={[lat, lng]}
              >
                <ActiveReefListener reef={reef} />
                <Popup reef={reef} />
              </Marker>
            );
          }
          return null;
        })}
      </MarkerClusterGroup>
    </LayerGroup>
  );
};

export default ReefMarkers;
