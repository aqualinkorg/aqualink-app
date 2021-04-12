import { useDispatch, useSelector } from "react-redux";
import { LayerGroup, Marker, useLeaflet } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import React, { useCallback, useEffect } from "react";
import L from "leaflet";
import { reefsToDisplayListSelector } from "../../../../store/Reefs/reefsListSlice";
import { Reef } from "../../../../store/Reefs/types";
import {
  reefOnMapSelector,
  setReefOnMap,
  setSearchResult,
} from "../../../../store/Homepage/homepageSlice";
import Popup from "../Popup";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";
import {
  alertColorFinder,
  alertIconFinder,
  findIntervalByLevel,
  findMaxLevel,
  getColorByLevel,
  Interval,
} from "../../../../helpers/bleachingAlertIntervals";
import { spotter } from "../../../../assets/spotter";
import { spotterSelected } from "../../../../assets/spotterSelected";
import { spotterAnimation } from "../../../../assets/spotterAnimation";
import { hobo } from "../../../../assets/hobo";
import { hoboSelected } from "../../../../assets/hoboSelected";
import { hasDeployedSpotter } from "../../../../helpers/reefUtils";

const buoyIcon = (iconUrl: string) =>
  new L.Icon({
    iconUrl,
    iconSize: [24, 27],
    iconAnchor: [12, 27],
    popupAnchor: [0, -28],
  });

const sensorIcon = (
  sensor: "spotter" | "hobo",
  selected: boolean,
  color: string
) => {
  const iconWidth = sensor === "spotter" ? 20 : 25;
  const iconHeight = sensor === "spotter" ? 20 : 25;
  return L.divIcon({
    iconSize: [iconWidth, iconHeight],
    iconAnchor: [iconWidth / 2, 0],
    html:
      sensor === "spotter"
        ? `
          <div class="homepage-map-spotter-icon-blinking">
            ${spotterAnimation(color)}
          </div>
          <div class="homepage-map-spotter-icon-steady">
            ${selected ? spotterSelected(color) : spotter(color)}
          </div>
        `
        : `
          <div class="homepage-map-hobo-icon">
            ${selected ? hoboSelected(color) : hobo(color)}
          </div>
        `,
    className: "homepage-map-spotter-icon-wrapper",
  });
};

const markerIcon = (
  hasSpotter: boolean,
  hasHobo: boolean,
  selected: boolean,
  color: string,
  iconUrl: string
) => {
  switch (true) {
    case hasSpotter && hasHobo:
      return sensorIcon("spotter", selected, color);
    case hasSpotter && !hasHobo:
      return sensorIcon("spotter", selected, color);
    case !hasSpotter && hasHobo:
      return sensorIcon("hobo", selected, color);
    default:
      return buoyIcon(iconUrl);
  }
};

const clusterIcon = (cluster: any) => {
  const alerts: Interval[] = cluster.getAllChildMarkers().map((marker: any) => {
    const { reef } = marker.options.children[0].props;
    const { weeklyAlertLevel } = reef.latestDailyData;
    return findIntervalByLevel(weeklyAlertLevel);
  });
  const color = getColorByLevel(findMaxLevel(alerts));
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div style="background-color: ${color}"><span>${count}</span></div>`,
    className: `leaflet-marker-icon marker-cluster custom-cluster-icon marker-cluster-small leaflet-zoom-animated leaflet-interactive`,
    iconSize: L.point(40, 40, true),
  });
};

export const ReefMarkers = () => {
  const reefsList = useSelector(reefsToDisplayListSelector) || [];
  const reefOnMap = useSelector(reefOnMapSelector);
  const { map } = useLeaflet();
  const dispatch = useDispatch();

  // To make sure we can see all the reefs all the time, and especially
  // around -180/+180, we create dummy copies of each reef.
  const lngOffsets = [-360, 0, 360];

  const setCenter = useCallback(
    (inputMap: L.Map, latLng: [number, number], zoom: number) => {
      const newZoom = Math.max(inputMap.getZoom() || 6, zoom);
      return inputMap.flyTo(latLng, newZoom, { duration: 2 });
    },
    []
  );

  useEffect(() => {
    if (map && reefOnMap?.polygon.type === "Point") {
      const [lng, lat] = reefOnMap.polygon.coordinates;
      setCenter(map, [lat, lng], 6);
    }
  }, [map, reefOnMap, setCenter]);

  return (
    <LayerGroup>
      <MarkerClusterGroup
        iconCreateFunction={clusterIcon}
        disableClusteringAtZoom={2}
      >
        {reefsList.map((reef: Reef) => {
          if (reef.polygon.type === "Point") {
            const [lng, lat] = reef.polygon.coordinates;
            const { weeklyAlertLevel } = reef.latestDailyData || {};

            return lngOffsets.map((offset) => (
              <Marker
                onClick={() => {
                  dispatch(setSearchResult());
                  dispatch(setReefOnMap(reef));
                }}
                key={`${reef.id}-${offset}`}
                icon={markerIcon(
                  hasDeployedSpotter(reef),
                  reef.hasHobo,
                  reefOnMap?.id === reef.id,
                  alertColorFinder(weeklyAlertLevel),
                  alertIconFinder(weeklyAlertLevel)
                )}
                position={[lat, lng + offset]}
              >
                <Popup reef={reef} autoOpen={offset === 0} />
              </Marker>
            ));
          }
          return null;
        })}
      </MarkerClusterGroup>
    </LayerGroup>
  );
};

export default ReefMarkers;
