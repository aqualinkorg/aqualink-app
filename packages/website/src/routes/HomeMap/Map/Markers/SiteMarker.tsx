import { Marker } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { Site } from "../../../../store/Sites/types";
import {
  siteOnMapSelector,
  setSiteOnMap,
  setSearchResult,
} from "../../../../store/Homepage/homepageSlice";
import { useMarkerIcon } from "../../../../helpers/map";
import { hasDeployedSpotter } from "../../../../helpers/siteUtils";
import {
  alertColorFinder,
  alertIconFinder,
} from "../../../../helpers/bleachingAlertIntervals";
import Popup from "../Popup";

// To make sure we can see all the sites all the time, and especially
// around -180/+180, we create dummy copies of each site.
const LNG_OFFSETS = [-360, 0, 360];

/**
 * All in one site marker with icon, offset duplicates, and popup built in.
 */
export default function SiteMarker({ site }: { site: Site }) {
  const siteOnMap = useSelector(siteOnMapSelector);
  const dispatch = useDispatch();
  const { tempWeeklyAlert } = site.collectionData || {};
  const markerIcon = useMarkerIcon(
    hasDeployedSpotter(site),
    site.hasHobo,
    siteOnMap?.id === site.id,
    alertColorFinder(tempWeeklyAlert),
    alertIconFinder(tempWeeklyAlert)
  );

  if (site.polygon.type !== "Point") return null;

  const [lng, lat] = site.polygon.coordinates;
  return (
    <>
      {LNG_OFFSETS.map((offset) => {
        return (
          <Marker
            onClick={() => {
              dispatch(setSearchResult());
              dispatch(setSiteOnMap(site));
            }}
            key={`${site.id}-${offset}`}
            icon={markerIcon}
            position={[lat, lng + offset]}
          >
            <Popup site={site} autoOpen={offset === 0} />
          </Marker>
        );
      })}
    </>
  );
}
