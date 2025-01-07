import { useSelector } from 'react-redux';
import { LayerGroup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useCallback, useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import { sitesToDisplayListSelector } from 'store/Sites/sitesListSlice';
import { Site } from 'store/Sites/types';
import { siteOnMapSelector } from 'store/Homepage/homepageSlice';
import 'leaflet/dist/leaflet.css';
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
  const sitesList = useMemo(
    () => collection?.sites || storedSites || [],
    [collection?.sites, storedSites],
  );
  const siteOnMap = useSelector(siteOnMapSelector);
  const map = useMap();
  const [visibleSites, setVisibleSites] = useState(sitesList);

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

  const filterSitesByViewport = useCallback(() => {
    if (!map) return;

    const bounds = map.getBounds();
    const filtered = sitesList.filter((site: Site) => {
      if (!site.polygon || site.polygon.type !== 'Point') return false;
      const [lng, lat] = site.polygon.coordinates;
      return bounds.contains([lat, lng]);
    });
    setVisibleSites(filtered);
  }, [map, sitesList]);

  useEffect(() => {
    if (!map) return undefined;

    filterSitesByViewport();
    map.on('moveend', filterSitesByViewport);

    return () => {
      map.off('moveend', filterSitesByViewport);
      return undefined;
    };
  }, [map, filterSitesByViewport]);

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
        {visibleSites.map((site: Site) => (
          <SiteMarker key={site.id} site={site} setCenter={setCenter} />
        ))}
      </MarkerClusterGroup>
    </LayerGroup>
  );
};

interface SiteMarkersProps {
  collection?: CollectionDetails;
}

export default SiteMarkers;
