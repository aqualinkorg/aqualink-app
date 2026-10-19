import { useSelector } from 'react-redux';
import React, { useMemo } from 'react';
import {
  sitesListCurrentDateSelector,
  sitesListErrorSelector,
  sitesListLoadingSelector,
  sitesToDisplayListSelector,
} from 'store/Sites/sitesListSlice';
import { Site } from 'store/Sites/types';
import 'leaflet/dist/leaflet.css';
import { CollectionDetails } from 'store/Collection/types';
import { hasDeployedSpotter } from 'helpers/siteUtils';
import { CircleSiteMarker, SensorSiteMarker } from './SiteMarker';

const hasSpotter = (site: Site) => site.hasHobo || hasDeployedSpotter(site);

export function SiteMarkers({ collection, historicalDate }: SiteMarkersProps) {
  const storedSites = useSelector(sitesToDisplayListSelector);
  const currentDate = useSelector(sitesListCurrentDateSelector);
  const loading = useSelector(sitesListLoadingSelector);
  const error = useSelector(sitesListErrorSelector);
  const sitesReady = collection
    ? true
    : !loading && !error && currentDate === historicalDate;
  const sitesList = useMemo(() => {
    if (collection) return collection.sites;
    return sitesReady ? storedSites || [] : [];
  }, [collection, sitesReady, storedSites]);

  return (
    <>
      {sitesList.map((site: Site) =>
        hasSpotter(site) ? (
          <SensorSiteMarker key={`${site.id}`} site={site} />
        ) : (
          <CircleSiteMarker key={`${site.id}`} site={site} />
        ),
      )}
    </>
  );
}

interface SiteMarkersProps {
  collection?: CollectionDetails;
  historicalDate?: string;
}

export default SiteMarkers;
