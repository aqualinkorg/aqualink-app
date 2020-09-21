import { useDispatch, useSelector } from "react-redux";
import { LayerGroup, Marker, useLeaflet } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import React, { useEffect } from "react";
import L from "leaflet";
import { reefsListSelector } from "../../../../store/Reefs/reefsListSlice";
import { Reef } from "../../../../store/Reefs/types";
import {
  reefOnMapSelector,
  unsetReefOnMap,
} from "../../../../store/Homepage/homepageSlice";
import Popup from "../Popup";
import { degreeHeatingWeeksCalculator } from "../../../../helpers/degreeHeatingWeeks";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";
import { alertIconFinder } from "../../../../helpers/bleachingAlertIntervals";

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
      const openPopup = () => {
        popupContainer.openPopup();
        map.off("moveend", openPopup);
      };
      map.on("moveend", openPopup);
    }
  }, [reefOnMap, reef.id, map, popupContainer]);
  return null;
};

const buoyIcon = (iconUrl: string) =>
  new L.Icon({
    iconUrl,
    iconSize: [28, 30],
    iconAnchor: [14, 26],
    popupAnchor: [3, -24],
  });

export const ReefMarkers = () => {
  const reefsList = useSelector(reefsListSelector);
  const dispatch = useDispatch();
  const { map } = useLeaflet();

  const setCenter = (latLng: [number, number], zoom: number) => {
    const newZoom = Math.max(map?.getZoom() || 5, zoom);
    return map?.flyTo(latLng, newZoom, { duration: 1 });
  };

  return (
    <LayerGroup>
      <MarkerClusterGroup disableClusteringAtZoom={4}>
        {reefsList.map((reef: Reef) => {
          if (reef.polygon.type === "Point") {
            const [lng, lat] = reef.polygon.coordinates;
            const { maxMonthlyMean } = reef;
            const { degreeHeatingDays, satelliteTemperature } =
              reef.latestDailyData || {};
            return (
              <Marker
                onClick={() => {
                  setCenter([lat, lng], 6);
                  dispatch(unsetReefOnMap());
                }}
                key={reef.id}
                icon={buoyIcon(
                  alertIconFinder(
                    maxMonthlyMean,
                    satelliteTemperature,
                    degreeHeatingWeeksCalculator(degreeHeatingDays)
                  )
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
