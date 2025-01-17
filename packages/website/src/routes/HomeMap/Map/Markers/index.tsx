import { useSelector } from 'react-redux';
import { useLeaflet } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import React, { useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import { sitesToDisplayListSelector } from 'store/Sites/sitesListSlice';
import { Site } from 'store/Sites/types';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import { CollectionDetails } from 'store/Collection/types';
import { getColorByLevel } from 'helpers/bleachingAlertIntervals';
import { countBy } from 'lodash';
import { createDonutChart } from 'helpers/map';
import { SiteMarker } from './SiteMarker';

const clusterIcon = (cluster: any) => {
  const alertLevels: number[] = cluster
    .getAllChildMarkers()
    .map((marker: any) => marker?.options?.['data-alert'] ?? 0);
  const alertToCountMap = countBy(alertLevels);
  const counts = Object.values(alertToCountMap);
  const colors = Object.keys(alertToCountMap).map((level) =>
    getColorByLevel(parseInt(level, 10)),
  );
  return L.divIcon({
    html: createDonutChart(counts, colors),
  });
};

export const SiteMarkers = ({ collection }: SiteMarkersProps) => {
  const storedSites = useSelector(sitesToDisplayListSelector);
  const sitesList = useMemo(
    () => collection?.sites || storedSites || [],
    [collection?.sites, storedSites],
  );
  const { map } = useLeaflet();
  const [visibleSitesMap, setVisibleSitesMap] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    // Incrementally mount visible site markers on map
    // Avoid mounting all sites at once, mount only the visible ones and don't umount them

    if (!map) return undefined;
    const mountSitesInViewport = () => {
      if (!map) return;
      const bounds = map.getBounds();
      const filtered: Record<string, boolean> = {};
      sitesList.forEach((site: Site) => {
        if (!site.polygon || site.polygon.type !== 'Point') return;
        const [lng, lat] = site.polygon.coordinates;
        if (bounds.contains([lat, lng])) {
          // eslint-disable-next-line fp/no-mutation
          filtered[site.id] = true;
        }
      });
      // Keep the previous markers and add the new visible sites
      setVisibleSitesMap((prev) => ({ ...prev, ...filtered }));
    };

    mountSitesInViewport();
    map.on('moveend', mountSitesInViewport);

    return () => {
      map.off('moveend', mountSitesInViewport);
      return undefined;
    };
  }, [map, sitesList]);

  return (
    <MarkerClusterGroup iconCreateFunction={clusterIcon}>
      {sitesList.map(
        (site: Site) =>
          visibleSitesMap[site.id] && (
            <SiteMarker key={`${site.id}`} site={site} />
          ),
      )}
    </MarkerClusterGroup>
  );
};

interface SiteMarkersProps {
  collection?: CollectionDetails;
}

export default SiteMarkers;
