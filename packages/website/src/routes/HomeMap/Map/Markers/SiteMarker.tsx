import React from 'react';
import { CircleMarker, Marker } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { Site } from 'store/Sites/types';
import {
  isSelectedOnMapSelector,
  setSearchResult,
  setSiteOnMap,
} from 'store/Homepage/homepageSlice';
import {
  alertColorFinder,
  alertIconFinder,
} from 'helpers/bleachingAlertIntervals';
import { useMarkerIcon } from 'helpers/map';
import { hasDeployedSpotter } from 'helpers/siteUtils';
import Popup from '../Popup';

// To make sure we can see all the sites all the time, and especially
// around -180/+180, we create dummy copies of each site.
const LNG_OFFSETS = [-360, 0, 360];

interface SiteMarkerProps {
  site: Site;
}

/**
 * All in one site marker with icon, offset duplicates, and popup built in.
 */
export const CircleSiteMarker = React.memo(({ site }: SiteMarkerProps) => {
  const isSelected = useSelector(isSelectedOnMapSelector(site.id));
  const dispatch = useDispatch();
  const { tempWeeklyAlert } = site.collectionData || {};

  if (site.polygon.type !== 'Point') return null;

  const [lng, lat] = site.polygon.coordinates;

  return (
    <>
      {LNG_OFFSETS.map((offset) => (
        <CircleMarker
          eventHandlers={{
            click: () => {
              dispatch(setSearchResult());
              dispatch(setSiteOnMap(site));
            },
          }}
          key={`${site.id}-${offset}`}
          center={[lat, lng + offset]}
          radius={5}
          fillColor={alertColorFinder(tempWeeklyAlert)}
          fillOpacity={1}
          color="black"
          weight={1}
          data-alert={tempWeeklyAlert}
        >
          {isSelected && <Popup site={site} autoOpen={offset === 0} />}
        </CircleMarker>
      ))}
    </>
  );
});

export const SensorSiteMarker = React.memo(({ site }: SiteMarkerProps) => {
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
    <>
      {LNG_OFFSETS.map((offset) => (
        <Marker
          eventHandlers={{
            click: () => {
              dispatch(setSearchResult());
              dispatch(setSiteOnMap(site));
            },
          }}
          key={`${site.id}-${offset}`}
          icon={markerIcon}
          position={[lat, lng + offset]}
          data-alert={tempWeeklyAlert}
        >
          {isSelected && <Popup site={site} autoOpen={offset === 0} />}
        </Marker>
      ))}
    </>
  );
});
