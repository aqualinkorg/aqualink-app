import { Marker } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { Site } from 'store/Sites/types';
import {
  setSiteOnMap,
  setSearchResult,
  isSelectedOnMapSelector,
} from 'store/Homepage/homepageSlice';
import { useMarkerIcon } from 'helpers/map';
import { hasDeployedSpotter } from 'helpers/siteUtils';
import {
  alertColorFinder,
  alertIconFinder,
} from 'helpers/bleachingAlertIntervals';
import Popup from '../Popup';

// To make sure we can see all the sites all the time, and especially
// around -180/+180, we create dummy copies of each site.
// TODO: Add back the functionality
// const LNG_OFFSETS = [-360, 0, 360];

interface SiteMarkerProps {
  site: Site;
}

/**
 * All in one site marker with icon, offset duplicates, and popup built in.
 */
export const SiteMarker = React.memo(({ site }: SiteMarkerProps) => {
  const isSelected = useSelector(isSelectedOnMapSelector(site.id));
  const dispatch = useDispatch();
  const { tempWeeklyAlert } = site.collectionData || {};
  const markerIcon = useMarkerIcon(
    hasDeployedSpotter(site),
    site.hasHobo,
    isSelected,
    alertColorFinder(tempWeeklyAlert),
    alertIconFinder(tempWeeklyAlert),
  );

  if (site.polygon.type !== 'Point') return null;

  const [lng, lat] = site.polygon.coordinates;

  return (
    <Marker
      onClick={() => {
        dispatch(setSearchResult());
        dispatch(setSiteOnMap(site));
      }}
      key={`${site.id}`}
      icon={markerIcon}
      position={[lat, lng]}
    >
      {isSelected && <Popup site={site} />}
    </Marker>
  );
});
