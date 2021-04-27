import { Marker } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { Reef } from "../../../../store/Reefs/types";
import {
  reefOnMapSelector,
  setReefOnMap,
  setSearchResult,
} from "../../../../store/Homepage/homepageSlice";
import { useMarkerIcon } from "../../../../helpers/map";
import { hasDeployedSpotter } from "../../../../helpers/reefUtils";
import {
  alertColorFinder,
  alertIconFinder,
} from "../../../../helpers/bleachingAlertIntervals";
import Popup from "../Popup";

// To make sure we can see all the reefs all the time, and especially
// around -180/+180, we create dummy copies of each reef.
const LNG_OFFSETS = [-360, 0, 360];

/**
 * All in one reef marker with icon, offset duplicates, and popup built in.
 */
export default function ReefMarker({ reef }: { reef: Reef }) {
  const reefOnMap = useSelector(reefOnMapSelector);
  const dispatch = useDispatch();
  const { weeklyAlertLevel } =
    reef.latestDailyData || reef.collectionData || {};
  const markerIcon = useMarkerIcon(
    hasDeployedSpotter(reef),
    reef.hasHobo,
    reefOnMap?.id === reef.id,
    alertColorFinder(weeklyAlertLevel),
    alertIconFinder(weeklyAlertLevel)
  );

  if (reef.polygon.type !== "Point") return null;

  const [lng, lat] = reef.polygon.coordinates;
  return (
    <>
      {LNG_OFFSETS.map((offset) => {
        return (
          <Marker
            onClick={() => {
              dispatch(setSearchResult());
              dispatch(setReefOnMap(reef));
            }}
            key={`${reef.id}-${offset}`}
            icon={markerIcon}
            position={[lat, lng + offset]}
          >
            <Popup reef={reef} autoOpen={offset === 0} />
          </Marker>
        );
      })}
    </>
  );
}
