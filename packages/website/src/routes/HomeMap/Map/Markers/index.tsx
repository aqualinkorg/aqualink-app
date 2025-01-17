import { useSelector } from 'react-redux';
import React, { useMemo } from 'react';
import { sitesToDisplayListSelector } from 'store/Sites/sitesListSlice';
import { Site } from 'store/Sites/types';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import { CollectionDetails } from 'store/Collection/types';
import { hasDeployedSpotter } from 'helpers/siteUtils';
import { CircleSiteMarker, SensorSiteMarker } from './SiteMarker';
import { CanvasMarkersLayer } from './CanvasMarkersLayer';

const hasSpotter = (site: Site) => site.hasHobo || hasDeployedSpotter(site);

export const SiteMarkers = ({ collection }: SiteMarkersProps) => {
  const storedSites = useSelector(sitesToDisplayListSelector);
  const sitesList = useMemo(
    () => collection?.sites || storedSites || [],
    [collection?.sites, storedSites],
  );

  return (
    <CanvasMarkersLayer>
      {sitesList.map((site: Site) =>
        sitesList[site.id] && hasSpotter(site) ? (
          <SensorSiteMarker key={`${site.id}`} site={site} />
        ) : (
          <CircleSiteMarker key={`${site.id}`} site={site} />
        ),
      )}
    </CanvasMarkersLayer>
  );
};

interface SiteMarkersProps {
  collection?: CollectionDetails;
}

export default SiteMarkers;
