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
import {
  findInterval,
  alertIconFinder,
  Interval,
} from "../../../../helpers/bleachingAlertIntervals";

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
    iconSize: [24, 27],
    iconAnchor: [12, 27],
    popupAnchor: [0, -30],
  });

const clusterIcon = (cluster: any) => {
  const alerts: Interval[] = cluster.getAllChildMarkers().map((marker: any) => {
    const { reef } = marker.options.children[0].props;
    const { maxMonthlyMean } = reef;
    const { satelliteTemperature, degreeHeatingDays } = reef.latestDailyData;
    const degreeHeatingWeeks = degreeHeatingWeeksCalculator(degreeHeatingDays);
    return findInterval(
      maxMonthlyMean,
      satelliteTemperature,
      degreeHeatingWeeks
    );
  });
  const { color } = alerts.reduce(
    (prev, current) => (prev.level > current.level ? prev : current),
    {
      image: "",
      color: "#C6E5FA",
      level: 1,
    }
  );
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div style="background-color: ${color}"><span>${count}</span></div>`,
    className: `leaflet-marker-icon marker-cluster custom-cluster-icon marker-cluster-small leaflet-zoom-animated leaflet-interactive`,
    iconSize: L.point(40, 40, true),
  });
};

export const ReefMarkers = () => {
  const reefsList = useSelector(reefsListSelector);
  const dispatch = useDispatch();
  const { map } = useLeaflet();

  const setCenter = (latLng: [number, number], zoom: number) => {
    const newZoom = Math.max(map?.getZoom() || 5, zoom);
    return map?.flyTo(latLng, newZoom, { duration: 1 });
  };

  // To make sure we can see all the reefs all the time, and especially
  // around -180/+180, we create dummy copies of each reef.
  const lngOffsets = [-360, 0, 360];

  return (
    <LayerGroup>
      <MarkerClusterGroup
        iconCreateFunction={clusterIcon}
        disableClusteringAtZoom={2}
      >
        {reefsList.map((reef: Reef) => {
          if (reef.polygon.type === "Point") {
            const [lng, lat] = reef.polygon.coordinates;
            const { maxMonthlyMean } = reef;
            const { degreeHeatingDays, satelliteTemperature } =
              reef.latestDailyData || {};

            return lngOffsets.map((offset) => (
              <Marker
                onClick={() => {
                  setCenter([lat, lng + offset], 6);
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
                position={[lat, lng + offset]}
              >
                <ActiveReefListener reef={reef} />
                <Popup reef={reef} />
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
