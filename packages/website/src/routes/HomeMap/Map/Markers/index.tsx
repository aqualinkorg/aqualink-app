import { useSelector } from 'react-redux';
import { LayerGroup, useLeaflet } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import React, { useCallback, useEffect } from 'react';
import L from 'leaflet';
import { sitesToDisplayListSelector } from 'store/Sites/sitesListSlice';
import { Site } from 'store/Sites/types';
import { siteOnMapSelector } from 'store/Homepage/homepageSlice';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import { CollectionDetails } from 'store/Collection/types';
import {
  findIntervalByLevel,
  findMaxLevel,
  getColorByLevel,
  Interval,
} from 'helpers/bleachingAlertIntervals';
import SiteMarker from './SiteMarker';

const clusterIcon = (cluster: any) => {
  const alerts: Interval[] = cluster.getAllChildMarkers().map((marker: any) => {
    const { site } = marker?.options?.children?.[0]?.props || {};
    const { tempWeeklyAlert } = site?.collectionData || {};
    return findIntervalByLevel(tempWeeklyAlert);
  });
  const color = getColorByLevel(findMaxLevel(alerts));
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div style="background-color: ${color}"><span>${count}</span></div>`,
    className: `leaflet-marker-icon marker-cluster custom-cluster-icon marker-cluster-small leaflet-zoom-animated leaflet-interactive`,
    iconSize: L.point(40, 40, true),
  });
};

export const SiteMarkers = ({ collection }: SiteMarkersProps) => {
  const storedSites = useSelector(sitesToDisplayListSelector);
  const sitesList = collection?.sites || storedSites || [];
  const siteOnMap = useSelector(siteOnMapSelector);
  const { map } = useLeaflet();

  const setCenter = useCallback(
    (inputMap: L.Map, latLng: [number, number], zoom: number) => {
      const maxZoom = Math.max(inputMap.getZoom() || 6, zoom);
      const pointBounds = L.latLngBounds(latLng, latLng);
      inputMap.flyToBounds(pointBounds, {
        duration: 2,
        maxZoom,
        paddingTopLeft: L.point(0, 200),
      });
    },
    [],
  );
  // zoom in and center on site marker when it's clicked
  useEffect(() => {
    if (map && siteOnMap?.polygon.type === 'Point') {
      const [lng, lat] = siteOnMap.polygon.coordinates;
      setCenter(map, [lat, lng], 6);
    }
  }, [map, siteOnMap, setCenter]);

  return (
    <LayerGroup>
      <MarkerClusterGroup
        iconCreateFunction={clusterIcon}
        disableClusteringAtZoom={1}
      >
        {sitesList.map((site: Site) => (
          <SiteMarker key={site.id} site={site} setCenter={setCenter} />
        ))}
      </MarkerClusterGroup>
    </LayerGroup>
  );
};

interface SiteMarkersProps {
  collection?: CollectionDetails;
}

SiteMarkers.defaultProps = {
  collection: undefined,
};

export default SiteMarkers;
