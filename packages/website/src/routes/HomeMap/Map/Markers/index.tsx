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
import { SiteMarker } from './SiteMarker';

const clusterIcon = (cluster: any) => {
  const alertLevels = cluster
    .getAllChildMarkers()
    .map((marker: any) => marker?.options?.['data-alert'] ?? 0);
  const maxLevel = Math.max(...alertLevels);
  const color = getColorByLevel(maxLevel);
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

SiteMarkers.defaultProps = {
  collection: undefined,
};

export default SiteMarkers;
