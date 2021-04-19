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
import { markerIcon } from "../../../../helpers/map";
import { hasDeployedSpotter } from "../../../../helpers/reefUtils";
import { Collection } from "../../../Dashboard/collection";

const clusterIcon = (cluster: any) => {
  const alerts: Interval[] = cluster.getAllChildMarkers().map((marker: any) => {
    const { reef } = marker?.options?.children?.[0]?.props || {};
    const { weeklyAlertLevel } = reef?.latestDailyData || {};
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

export const ReefMarkers = ({ collection }: ReefMarkersProps) => {
  const storedReefs = useSelector(reefsToDisplayListSelector);
  const reefsList = collection?.reefs || storedReefs || [];
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
        disableClusteringAtZoom={collection ? 1 : 2}
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

interface ReefMarkersProps {
  collection?: Collection;
}

ReefMarkers.defaultProps = {
  collection: undefined,
};

export default ReefMarkers;
