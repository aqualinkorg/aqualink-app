import { Marker, useLeaflet } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { Site } from 'store/Sites/types';
import {
  siteOnMapSelector,
  setSiteOnMap,
  setSearchResult,
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
const LNG_OFFSETS = [-360, 0, 360];

interface SiteMarkerProps {
  site: Site;
  setCenter: (inputMap: L.Map, latLng: [number, number], zoom: number) => void;
}

/**
 * All in one site marker with icon, offset duplicates, and popup built in.
 */
export default function SiteMarker({ site, setCenter }: SiteMarkerProps) {
  const isSelected = useSelector(isSelectedOnMapSelector(site.id));
  const { map } = useLeaflet();
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
      {LNG_OFFSETS.map((offset) => {
        return (
          <Marker
            onClick={() => {
              if (map) setCenter(map, [lat, lng], 6);
              dispatch(setSearchResult());
              dispatch(setSiteOnMap(site));
            }}
            key={`${site.id}-${offset}`}
            icon={markerIcon}
            position={[lat, lng + offset]}
          >
            {isSelected && <Popup site={site} autoOpen={offset === 0} />}
          </Marker>
        );
      })}
    </>
  );
}
