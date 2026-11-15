import React, { useCallback, useEffect, useMemo } from 'react';
/* eslint-disable import/no-unresolved -- package exports map; node resolver predates exports */
import {
  Layer,
  Marker,
  Source,
  useMap,
  type MapLayerMouseEvent,
} from 'react-map-gl/maplibre';
/* eslint-enable import/no-unresolved */
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import { sitesToDisplayListSelector } from 'store/Sites/sitesListSlice';
import type { Site } from 'store/Sites/types';
import {
  setSearchResult,
  setSiteOnMap,
  siteOnMapSelector,
} from 'store/Homepage/homepageSlice';
import { alertColorFinder } from 'helpers/bleachingAlertIntervals';
import { useMarkerIcon } from 'helpers/map';
import { hasDeployedSpotter } from 'helpers/siteUtils';
import type { CollectionDetails } from 'store/Collection/types';
import GlobePopup from './GlobePopup';

const SITE_CIRCLE_LAYER_ID = 'site-circles';

const hasSensor = (site: Site) => site.hasHobo || hasDeployedSpotter(site);

function CircleInteractions({
  sites,
  onSelect,
}: {
  sites: Site[];
  onSelect: (site: Site) => void;
}) {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map?.getLayer(SITE_CIRCLE_LAYER_ID)) {
      return undefined;
    }

    const handleClick = (event: MapLayerMouseEvent) => {
      const siteId = event.features?.[0]?.properties?.siteId;
      const site = sites.find((item) => String(item.id) === String(siteId));
      if (site) {
        onSelect(site);
      }
    };
    const canvas = map.getCanvas();
    const onEnter = () => {
      // eslint-disable-next-line fp/no-mutation
      canvas.style.cursor = 'pointer';
    };
    const onLeave = () => {
      // eslint-disable-next-line fp/no-mutation
      canvas.style.cursor = '';
    };

    map.on('click', SITE_CIRCLE_LAYER_ID, handleClick);
    map.on('mouseenter', SITE_CIRCLE_LAYER_ID, onEnter);
    map.on('mouseleave', SITE_CIRCLE_LAYER_ID, onLeave);

    return () => {
      map.off('click', SITE_CIRCLE_LAYER_ID, handleClick);
      map.off('mouseenter', SITE_CIRCLE_LAYER_ID, onEnter);
      map.off('mouseleave', SITE_CIRCLE_LAYER_ID, onLeave);
      // eslint-disable-next-line fp/no-mutation
      canvas.style.cursor = '';
    };
  }, [map, onSelect, sites]);

  return null;
}

const isPointSite = (
  site: Site,
): site is Site & {
  polygon: { type: 'Point'; coordinates: [number, number] };
} => site.polygon.type === 'Point';

function SensorMarker({
  site,
  onSelect,
}: {
  site: Site & { polygon: { type: 'Point'; coordinates: [number, number] } };
  onSelect: (site: Site) => void;
}) {
  const isSelected = useSelector(siteOnMapSelector)?.id === site.id;
  const { tempWeeklyAlert } = site.collectionData || {};
  const markerIcon = useMarkerIcon(
    hasDeployedSpotter(site),
    site.hasHobo,
    isSelected,
    alertColorFinder(tempWeeklyAlert),
    '',
  );
  const [lng, lat] = site.polygon.coordinates;
  const { iconSize } = markerIcon.options;
  const width = Array.isArray(iconSize) ? iconSize[0] : iconSize?.x || 20;
  const height = Array.isArray(iconSize) ? iconSize[1] : iconSize?.y || 20;
  const html =
    'html' in markerIcon.options && typeof markerIcon.options.html === 'string'
      ? markerIcon.options.html
      : '';

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="top"
      opacityWhenCovered={0}
      onClick={(event) => {
        event.originalEvent.stopPropagation();
        onSelect(site);
      }}
    >
      <div
        style={{ width, height, cursor: 'pointer' }}
        // Sensor SVGs are generated in-app, same markup Leaflet used.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Marker>
  );
}

export function GlobeSiteMarkers({
  collection,
}: {
  collection?: CollectionDetails;
}) {
  const storedSites = useSelector(sitesToDisplayListSelector);
  const siteOnMap = useSelector(siteOnMapSelector);
  const dispatch = useAppDispatch();
  const sites = useMemo(
    () => collection?.sites || storedSites || [],
    [collection?.sites, storedSites],
  );
  const pointSites = useMemo(() => sites.filter(isPointSite), [sites]);
  const sensorSites = useMemo(() => pointSites.filter(hasSensor), [pointSites]);
  const circleSites = useMemo(
    () => pointSites.filter((site) => !hasSensor(site)),
    [pointSites],
  );

  const circleData = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: circleSites.map((site) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: site.polygon.coordinates,
        },
        properties: {
          siteId: site.id,
          color: alertColorFinder(site.collectionData?.tempWeeklyAlert),
        },
      })),
    }),
    [circleSites],
  );

  const selectSite = useCallback(
    (site: Site) => {
      if (!isPointSite(site)) {
        return;
      }
      const [lng] = site.polygon.coordinates;
      dispatch(setSearchResult());
      dispatch(setSiteOnMap({ ...site, displayLng: lng }));
    },
    [dispatch],
  );

  return (
    <>
      <Source id={SITE_CIRCLE_LAYER_ID} type="geojson" data={circleData}>
        <Layer
          id={SITE_CIRCLE_LAYER_ID}
          type="circle"
          paint={{
            'circle-radius': 5,
            'circle-color': ['get', 'color'],
            'circle-opacity': 1,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#000000',
          }}
        />
        <CircleInteractions sites={sites} onSelect={selectSite} />
      </Source>
      {sensorSites.map((site) => (
        <SensorMarker key={site.id} site={site} onSelect={selectSite} />
      ))}
      {siteOnMap && isPointSite(siteOnMap) && <GlobePopup site={siteOnMap} />}
    </>
  );
}

export default GlobeSiteMarkers;
