import { Marker, useLeaflet } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
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
import L from 'leaflet';
import Popup from '../Popup';
import { useCanvasIconLayer } from './CanvasMarkersLayer';

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
  const dispatch = useDispatch();
  const isSelected = useSelector(isSelectedOnMapSelector(site.id));
  const { map } = useLeaflet();
  const canvasIconLayer = useCanvasIconLayer();
  const { tempWeeklyAlert } = site.collectionData || {};
  const markerIcon = useMarkerIcon(
    hasDeployedSpotter(site),
    site.hasHobo,
    isSelected,
    alertColorFinder(tempWeeklyAlert),
    alertIconFinder(tempWeeklyAlert),
  );

  useEffect(() => {
    if (!map || !canvasIconLayer || site.polygon.type !== 'Point') return;
    const [lng, lat] = site.polygon.coordinates;
    const marker = L.marker([lat, lng], {
      icon: markerIcon,
    }).on('click', () => {
      dispatch(setSearchResult());
      dispatch(setSiteOnMap(site));
    });
    // @ts-ignore
    canvasIconLayer.addMarker(marker);
    // eslint-disable-next-line consistent-return
    return () => {
      // @ts-ignore
      canvasIconLayer.removeMarker(marker);
    };
  }, [
    map,
    canvasIconLayer,
    site.polygon.type,
    site.polygon.coordinates,
    markerIcon,
    site,
    dispatch,
  ]);

  if (site.polygon.type !== 'Point') return null;

  const [lng, lat] = site.polygon.coordinates;

  return isSelected ? (
    <Marker position={[lat, lng]} icon={L.divIcon({ className: 'd-none' })}>
      <Popup site={site} autoOpen classes={{ popup: 'popup-offset' }} />
    </Marker>
  ) : null;
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
          onClick={() => {
            dispatch(setSearchResult());
            dispatch(setSiteOnMap(site));
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
