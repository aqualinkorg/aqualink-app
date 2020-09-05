import { useDispatch, useSelector } from "react-redux";
import { LayerGroup, Marker, useLeaflet } from "react-leaflet";
import React, { useEffect } from "react";
import { reefsListSelector } from "../../../store/Reefs/reefsListSlice";
import { Reef } from "../../../store/Reefs/types";
import {
  reefOnMapSelector,
  unsetReefOnMap,
} from "../../../store/Homepage/homepageSlice";
import { coloredBuoyIcon } from "./utils";
import Popup from "./Popup";

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

export const ReefMarkers = () => {
  const reefsList = useSelector(reefsListSelector);
  const dispatch = useDispatch();
  const { map } = useLeaflet();

  const setCenter = (latLng: [number, number], zoom: number) =>
    map?.flyTo(latLng, zoom, { duration: 1 });

  return (
    <LayerGroup>
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
              icon={coloredBuoyIcon(degreeHeatingDays)}
              position={[lat, lng]}
            >
              <ActiveReefListener reef={reef} />
              <Popup reef={reef} />
            </Marker>
          );
        }
        return null;
      })}
    </LayerGroup>
  );
};

export default ReefMarkers;
